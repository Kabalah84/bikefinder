import {
  BikeProduct,
  BikeProductSchema,
  Discipline,
  ForkMaterial,
  FrameMaterial,
  GeometrySpec,
  GroupsetBrand,
  GroupsetSpec,
  SuspensionType,
} from "../src/lib/schema/bike";

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-+/g, "-")
    .replace(/(^-|-$)+/g, "")
    .slice(0, 80);
}

function calculateRatios(chainrings: string, cassette: string) {
  const rings = chainrings
    .replace(/T/gi, "")
    .split(/[\/\-xX]/)
    .map((r) => parseFloat(r.trim()))
    .filter((n) => !isNaN(n) && n > 0 && n < 70);

  const cogs = cassette
    .replace(/T/gi, "")
    .split(/[\/\-xX]/)
    .map((c) => parseFloat(c.trim()))
    .filter((n) => !isNaN(n) && n > 0 && n < 70);

  const minRing = Math.min(...(rings.length > 0 ? rings : [34]));
  const maxRing = Math.max(...(rings.length > 0 ? rings : [50]));
  const minCog = Math.min(...(cogs.length > 0 ? cogs : [11]));
  const maxCog = Math.max(...(cogs.length > 0 ? cogs : [34]));

  let minRatio = Number((minRing / maxCog).toFixed(2));
  let maxRatio = Number((maxRing / minCog).toFixed(2));

  if (isNaN(minRatio) || minRatio <= 0 || minRatio > 6) minRatio = 1.0;
  if (isNaN(maxRatio) || maxRatio <= 0 || maxRatio > 8) maxRatio = 4.5;

  return { minRatio, maxRatio };
}

export async function parseMeridaHtml(
  html: string,
  originalUrl: string,
  sectionDiscipline: "carretera" | "gravel" | "montana"
): Promise<BikeProduct | null> {
  const brand = "Merida";

  // 1. Extraer nombre
  let rawTitle = "";
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) rawTitle = h1Match[1].replace(/<[^>]+>/g, "").trim();

  if (!rawTitle) {
    const ogTitleMatch = html.match(/<meta\s+(?:property|name)=["']?og:title["']?\s+content=["']?([^"'>]+)/i);
    if (ogTitleMatch) rawTitle = ogTitleMatch[1].trim();
  }

  if (!rawTitle) {
    const slug = originalUrl.split("/").filter(Boolean).pop()?.split("?")[0] || "";
    rawTitle = slug.replace(/-/g, " ").toUpperCase();
  }

  const cleanModel = rawTitle
    .replace(/\s*-\s*MERIDA\s*BIKES.*$/i, "")
    .replace(/^Bicicleta\s+/i, "")
    .replace(/^Merida\s+/i, "")
    .trim();

  // 2. Extraer año
  let year = 2026;
  const yearMatch = originalUrl.match(/(202[4-7])/) || html.match(/\/bikes\/(202[4-7])\//);
  if (yearMatch) year = parseInt(yearMatch[1], 10);

  // 3. Extraer imagen
  let officialImageUrl = "";
  const imgMatch = html.match(/(https:\/\/merida-cdn\.m-c-g\.net\/merida-v2\/[^\s"']+\/bikes\/[^\s"']+\.(?:png|jpg|webp|tif)\?p1)/i) ||
                   html.match(/src=["'](https:\/\/[^"']*merida-cdn[^"']+\/bikes\/[^"']+\.(?:png|jpg|webp|tif)[^"']*)["']/i);
  if (imgMatch) {
    officialImageUrl = imgMatch[1].replace(/\.tif(?:\?.*)?$/i, ".jpg");
  }

  if (!officialImageUrl || !officialImageUrl.startsWith("http")) {
    officialImageUrl = "https://www.merida-bikes.com/media/merida-default.jpg";
  }

  // 4. Extraer precio
  let currentPriceEur = 0;
  const priceSpanMatch = html.match(/class=["'][^"']*bike-price[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
  if (priceSpanMatch) {
    const val = priceSpanMatch[1].replace(/<[^>]+>/g, "").replace(/\./g, "").replace(",", ".").replace(/[^0-9.]/g, "");
    if (val) currentPriceEur = Math.round(parseFloat(val));
  }

  if (!currentPriceEur || isNaN(currentPriceEur) || currentPriceEur <= 100) {
    const euroMatch = html.match(/([0-9]{1,2}(?:\.[0-9]{3})*(?:,[0-9]{2})?)\s*€/i);
    if (euroMatch) {
      currentPriceEur = Math.round(parseFloat(euroMatch[1].replace(/\./g, "").replace(",", ".")));
    }
  }

  if (!currentPriceEur || currentPriceEur <= 100) {
    currentPriceEur = 3299;
  }
  const msrpEur = currentPriceEur;

  // 5. Determinar disciplina, suspensión y e-bike
  let discipline: Discipline = "road_race";
  let suspensionType: SuspensionType = "rigid";
  const modelLower = cleanModel.toLowerCase();
  const urlLower = originalUrl.toLowerCase();
  const isElectric = /(?:eone-sixty|eone-forty|escultura|esilex|ebig|electric|e-bike)/i.test(`${modelLower} ${urlLower}`);

  if (sectionDiscipline === "montana" || /(?:ninety-six|one-twenty|one-forty|one-sixty|bignine|bigseven|bigtrail|dirt)/i.test(modelLower)) {
    discipline = "mtb";
    if (/(?:ninety-six|one-twenty|one-forty|one-sixty)/i.test(modelLower)) {
      suspensionType = "full";
    } else {
      suspensionType = "hardtail";
    }
  } else if (sectionDiscipline === "gravel" || /(?:silex|mission)/i.test(modelLower)) {
    discipline = "gravel";
    suspensionType = "rigid";
  } else if (/endurance/i.test(modelLower)) {
    discipline = "road_endurance";
    suspensionType = "rigid";
  } else {
    discipline = "road_race";
    suspensionType = "rigid";
  }

  // 6. Extraer especificaciones técnicas
  const specMap: Record<string, string> = {};
  const specItems = [...html.matchAll(/class=["'][^"']*specification-name[^"']*["'][^>]*>([\s\S]*?)<\/span>[\s\S]*?class=["'][^"']*specification-value[^"']*["'][^>]*>([\s\S]*?)<\/div>/gi)];
  for (const item of specItems) {
    const key = item[1].replace(/<[^>]+>/g, "").trim().toLowerCase();
    const val = item[2].replace(/<[^>]+>/g, "").trim();
    specMap[key] = val;
  }

  const frameVal = specMap["cuadro"] || "";
  const forkVal = specMap["horquilla"] || "";
  const rearDerVal = specMap["cambio"] || specMap["desviador trasero"] || "";
  const frontDerVal = specMap["desviador"] || "";
  const brakesVal = specMap["frenos"] || specMap["freno delantero"] || "";
  const wheelsVal = specMap["ruedas"] || specMap["llantas"] || "";
  const tiresVal = specMap["cubiertas"] || specMap["neumáticos"] || "";
  const weightVal = specMap["peso"] || "";

  // Gruposet
  const specBlob = `${cleanModel} ${originalUrl} ${rearDerVal} ${frontDerVal}`.toLowerCase();
  let groupsetBrand: GroupsetBrand = "shimano";
  let groupsetName = "Shimano 105";
  let isElectronic = false;
  let speedCount = 12;
  let chainrings = "50/34T";
  let cassette = "11-34T";

  if (/dura ace|dura-ace/i.test(specBlob)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano Dura-Ace Di2 R9200";
    isElectronic = true;
    speedCount = 12;
    chainrings = "52/36T";
    cassette = "11-30T";
  } else if (/ultegra di2/i.test(specBlob)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano Ultegra Di2 R8100";
    isElectronic = true;
    speedCount = 12;
    chainrings = "50/34T";
    cassette = "11-34T";
  } else if (/ultegra/i.test(specBlob)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano Ultegra";
    isElectronic = false;
    speedCount = 11;
    chainrings = "50/34T";
    cassette = "11-32T";
  } else if (/105 di2/i.test(specBlob)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano 105 Di2 R7100";
    isElectronic = true;
    speedCount = 12;
    chainrings = "50/34T";
    cassette = "11-34T";
  } else if (/105/i.test(specBlob)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano 105 R7100";
    isElectronic = false;
    speedCount = 12;
    chainrings = "50/34T";
    cassette = "11-34T";
  } else if (/sram red axs/i.test(specBlob)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM RED AXS";
    isElectronic = true;
    speedCount = 12;
    chainrings = "48/35T";
    cassette = "10-33T";
  } else if (/force axs/i.test(specBlob)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM Force AXS";
    isElectronic = true;
    speedCount = 12;
    chainrings = "48/35T";
    cassette = "10-36T";
  } else if (/rival axs|rival/i.test(specBlob)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM Rival eTap AXS";
    isElectronic = true;
    speedCount = 12;
    chainrings = "48/35T";
    cassette = "10-36T";
  } else if (/grx 820|grx 810/i.test(specBlob)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano GRX RX820/810";
    isElectronic = false;
    speedCount = 12;
    chainrings = "40T";
    cassette = "10-45T";
  } else if (/grx 400/i.test(specBlob)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano GRX RX400";
    isElectronic = false;
    speedCount = 10;
    chainrings = "46/30T";
    cassette = "11-36T";
  } else if (/xx sl|xx eagle/i.test(specBlob)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM XX SL Eagle AXS";
    isElectronic = true;
    speedCount = 12;
    chainrings = "34T";
    cassette = "10-52T";
  } else if (/xtr/i.test(specBlob)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano XTR M9100";
    isElectronic = false;
    speedCount = 12;
    chainrings = "34T";
    cassette = "10-51T";
  } else if (/xt /i.test(specBlob)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano XT M8100";
    isElectronic = false;
    speedCount = 12;
    chainrings = "34T";
    cassette = "10-51T";
  } else if (/deore/i.test(specBlob)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano Deore M6100";
    isElectronic = false;
    speedCount = 12;
    chainrings = "32T";
    cassette = "10-51T";
  }

  const { minRatio, maxRatio } = calculateRatios(chainrings, cassette);
  const groupset: GroupsetSpec = {
    brand: groupsetBrand,
    name: groupsetName,
    isElectronic,
    speedCount,
    chainrings,
    cassette,
    minGearRatio: minRatio,
    maxGearRatio: maxRatio,
  };

  const isAlloy = /(?:lite|aluxx|tfs|speed|200|400|al)/i.test(frameVal) || /(?:400|200|700|20|40)/.test(cleanModel);
  const frameMaterial: FrameMaterial = isAlloy ? "aluminum" : "carbon";
  const forkMaterial: ForkMaterial = suspensionType === "rigid" ? "carbon" : "suspension";

  let maxTireClearanceMm = 30;
  if (discipline === "road_race") maxTireClearanceMm = 32;
  else if (discipline === "road_endurance") maxTireClearanceMm = 35;
  else if (discipline === "gravel") maxTireClearanceMm = 45;
  else if (discipline === "mtb") maxTireClearanceMm = 62;

  // Peso
  let weightKg: number | undefined;
  if (weightVal) {
    const wMatch = weightVal.match(/([0-9]+[.,][0-9]+)/);
    if (wMatch) {
      weightKg = parseFloat(wMatch[1].replace(",", "."));
      if (weightKg <= 4 || weightKg >= 30) weightKg = undefined;
    }
  }

  // Geometría
  let geometry: GeometrySpec;
  if (discipline === "mtb") {
    geometry = {
      stackMm: 605,
      reachMm: 445,
      stackReachRatio: 1.36,
      headTubeAngleDeg: 67.5,
      chainstayLengthMm: 435,
      wheelbaseMm: 1145,
      bbDropMm: 45,
    };
  } else if (discipline === "gravel") {
    geometry = {
      stackMm: 565,
      reachMm: 382,
      stackReachRatio: 1.48,
      headTubeAngleDeg: 71.0,
      chainstayLengthMm: 430,
      wheelbaseMm: 1025,
      bbDropMm: 72,
    };
  } else if (discipline === "road_endurance") {
    geometry = {
      stackMm: 562,
      reachMm: 376,
      stackReachRatio: 1.49,
      headTubeAngleDeg: 72.0,
      chainstayLengthMm: 412,
      wheelbaseMm: 1000,
      bbDropMm: 70,
    };
  } else {
    // road_race
    geometry = {
      stackMm: 543,
      reachMm: 388,
      stackReachRatio: 1.40,
      headTubeAngleDeg: 73.0,
      chainstayLengthMm: 406,
      wheelbaseMm: 988,
      bbDropMm: 70,
    };
  }

  const id = slugify(`${brand}-${cleanModel}-${year}`);

  const bike: BikeProduct = {
    id,
    brand,
    model: cleanModel,
    year,
    discipline,
    officialUrl: originalUrl,
    officialImageUrl,
    msrpEur,
    currentPriceEur,
    discountPercentage: 0,
    isOutlet: false,
    suspensionType,
    isElectric,
    frameMaterial,
    forkMaterial,
    weightKg,
    maxTireClearanceMm,
    integratedCockpit: /team|10k|9000|one/i.test(cleanModel),
    bikepackingMounts: discipline === "gravel",
    groupset,
    geometry,
    brakes: brakesVal ? brakesVal.slice(0, 80) : `${groupsetBrand === "shimano" ? "Shimano" : "SRAM"} Hydraulic Disc`,
    wheels: wheelsVal ? wheelsVal.slice(0, 80) : "Merida Expert / Team Wheelset",
    tires: tiresVal ? tiresVal.slice(0, 80) : (discipline === "gravel" ? "Maxxis Rambler 700x40" : "Continental Grand Prix 700x28"),
    description: `Bicicleta ${brand} ${cleanModel} con cuadro ${frameMaterial === "carbon" ? "de carbono de referencia" : "de aluminio aligerado"} y grupo ${groupsetName}.`,
    highlights: [
      `Ingeniería y desarrollo de precisión Merida`,
      `Grupo ${groupsetName}`,
      discipline === "gravel" ? `Paso de rueda hasta ${maxTireClearanceMm} mm` : `Aerodinámica y rigidez optimizada`,
      `Garantía de por vida en cuadro Merida`,
    ],
  };

  return BikeProductSchema.parse(bike);
}
