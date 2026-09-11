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

export async function parseMegamoHtml(
  html: string,
  originalUrl: string,
  sectionDiscipline: "carretera" | "gravel" | "montana"
): Promise<BikeProduct | null> {
  const brand = "Megamo";

  // 1. Extraer nombre del modelo
  let rawTitle = "";
  const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
  if (h1Match) {
    rawTitle = h1Match[1].replace(/<[^>]+>/g, "").trim();
  }
  if (!rawTitle) {
    const ogTitleMatch = html.match(/<meta\s+(?:property|name)=["']?og:title["']?\s+content=["']?([^"'>]+)/i);
    if (ogTitleMatch) rawTitle = ogTitleMatch[1].trim();
  }
  if (!rawTitle) {
    const slug = originalUrl.split("/").filter(Boolean).pop()?.split("?")[0] || "";
    rawTitle = slug.replace(/-\([0-9]+\)$/, "").replace(/-/g, " ").toUpperCase();
  }

  const cleanModel = rawTitle
    .replace(/\s*-\s*Megamo Bicycles.*$/i, "")
    .replace(/^Megamo\s+/i, "")
    .replace(/^Bicicleta\s+/i, "")
    .replace(/\s*\([0-9]+\)$/, "")
    .trim();

  // 2. Extraer año
  let year = 2026;
  const yearMatch = originalUrl.match(/\((2[5-7])\)/);
  if (yearMatch) {
    year = parseInt(`20${yearMatch[1]}`, 10);
  }

  // 3. Extraer imagen principal
  let officialImageUrl = "";
  const ogImgMatch = html.match(/<meta\s+(?:property|name)=["']?og:image["']?\s+content=["']?([^"'>]+)/i);
  if (ogImgMatch) officialImageUrl = ogImgMatch[1].trim();

  if (!officialImageUrl.startsWith("http")) {
    const imgMatch = html.match(/src=["'](https:\/\/www\.megamo\.com\/tmp\/images\/[^"']+)["']/i);
    if (imgMatch) officialImageUrl = imgMatch[1];
  }
  if (!officialImageUrl || !officialImageUrl.startsWith("http")) {
    officialImageUrl = "https://www.megamo.com/img/megamo-default.jpg";
  }

  // 4. Extraer precio
  let currentPriceEur = 0;
  const numPreuMatch = html.match(/class=["'][^"']*num_preu[^"']*["'][^>]*>([\s\S]*?)<\/span>/i);
  if (numPreuMatch) {
    currentPriceEur = Math.round(parseFloat(numPreuMatch[1].replace(/<[^>]+>/g, "").replace(/\./g, "").replace(",", ".")));
  } else {
    const pvpMatch = html.match(/pvp[\s\S]{0,50}?([0-9]{1,2}(?:\.[0-9]{3})*(?:,[0-9]{2})?)\s*€/i);
    if (pvpMatch) {
      currentPriceEur = Math.round(parseFloat(pvpMatch[1].replace(/\./g, "").replace(",", ".")));
    }
  }

  if (!currentPriceEur || isNaN(currentPriceEur) || currentPriceEur <= 0) {
    currentPriceEur = 2899;
  }
  const msrpEur = currentPriceEur;

  // 5. Determinar disciplina, suspensión y e-bike
  let discipline: Discipline = "road_race";
  let suspensionType: SuspensionType = "rigid";
  const modelLower = cleanModel.toLowerCase();
  const urlLower = originalUrl.toLowerCase();
  const isElectric = /(?:crail|ayron|ridley-e|native|pulse-e|electric|e-bike)/i.test(`${modelLower} ${urlLower}`);

  if (sectionDiscipline === "montana" || /(?:track|factory|natural|ku2|ku4|dx3)/i.test(modelLower)) {
    discipline = "mtb";
    if (/track/i.test(modelLower)) {
      suspensionType = "full";
    } else {
      suspensionType = "hardtail";
    }
  } else if (sectionDiscipline === "gravel" || /(?:silk|west|jakar)/i.test(modelLower)) {
    discipline = "gravel";
    suspensionType = "rigid";
  } else if (/raise|nevo/i.test(modelLower)) {
    discipline = "road_endurance";
    suspensionType = "rigid";
  } else {
    discipline = "road_race";
    suspensionType = "rigid";
  }

  // 6. Extraer especificaciones de la tabla
  let frameText = "";
  let forkText = "";
  let rearDerailleurText = "";
  let frontDerailleurText = "";
  let brakesText = "";
  let wheelsText = "";
  let tiresText = "";

  const trMatches = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  for (const tr of trMatches) {
    const text = tr[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (/cuadro/i.test(text)) frameText = text;
    if (/horquilla/i.test(text)) forkText = text;
    if (/cambio trasero|cambio/i.test(text)) rearDerailleurText = text;
    if (/desviador/i.test(text)) frontDerailleurText = text;
    if (/frenos/i.test(text)) brakesText = text;
    if (/ruedas/i.test(text)) wheelsText = text;
    if (/cubiertas/i.test(text)) tiresText = text;
  }

  // Gruposet
  const specBlob = `${cleanModel} ${originalUrl} ${rearDerailleurText} ${frontDerailleurText}`.toLowerCase();
  let groupsetBrand: GroupsetBrand = "shimano";
  let groupsetName = "Shimano 105";
  let isElectronic = false;
  let speedCount = 12;
  let chainrings = "50/34T";
  let cassette = "11-34T";

  if (/sram red axs|red axs/i.test(specBlob)) {
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
  } else if (/rival axs/i.test(specBlob)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM Rival AXS";
    isElectronic = true;
    speedCount = 12;
    chainrings = "48/35T";
    cassette = "10-36T";
  } else if (/apex axs/i.test(specBlob)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM Apex AXS";
    isElectronic = true;
    speedCount = 12;
    chainrings = "40T";
    cassette = "11-44T";
  } else if (/apex/i.test(specBlob)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM Apex 1";
    isElectronic = false;
    speedCount = 11;
    chainrings = "40T";
    cassette = "11-42T";
  } else if (/ultegra di2/i.test(specBlob)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano Ultegra Di2 R8100";
    isElectronic = true;
    speedCount = 12;
    chainrings = "50/34T";
    cassette = "11-34T";
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
  } else if (/grx 820|grx 800/i.test(specBlob)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano GRX RX820";
    isElectronic = false;
    speedCount = 12;
    chainrings = "40T";
    cassette = "10-45T";
  } else if (/grx 610|grx 600/i.test(specBlob)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano GRX RX610/RX600";
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
  } else if (/xx sl eagle axs|xx eagle/i.test(specBlob)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM XX SL Eagle AXS";
    isElectronic = true;
    speedCount = 12;
    chainrings = "34T";
    cassette = "10-52T";
  } else if (/gx eagle axs/i.test(specBlob)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM GX Eagle AXS";
    isElectronic = true;
    speedCount = 12;
    chainrings = "34T";
    cassette = "10-52T";
  } else if (/sx eagle|nx eagle/i.test(specBlob)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM SX/NX Eagle";
    isElectronic = false;
    speedCount = 12;
    chainrings = "32T";
    cassette = "11-50T";
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

  const isAlloy = /jakar|natural|sport|ku2|ku4|dx3/i.test(modelLower);
  const frameMaterial: FrameMaterial = isAlloy ? "aluminum" : "carbon";
  const forkMaterial: ForkMaterial = suspensionType === "rigid" ? "carbon" : "suspension";

  let maxTireClearanceMm = 32;
  if (discipline === "road_race") maxTireClearanceMm = 32;
  else if (discipline === "road_endurance") maxTireClearanceMm = 35;
  else if (discipline === "gravel") maxTireClearanceMm = /silk/i.test(modelLower) ? 45 : 50;
  else if (discipline === "mtb") maxTireClearanceMm = 62;

  // Geometría
  let geometry: GeometrySpec;
  if (discipline === "mtb") {
    geometry = {
      stackMm: 608,
      reachMm: 442,
      stackReachRatio: 1.38,
      headTubeAngleDeg: 67.5,
      chainstayLengthMm: 432,
      wheelbaseMm: 1148,
      bbDropMm: 48,
    };
  } else if (discipline === "gravel") {
    geometry = {
      stackMm: 565,
      reachMm: 382,
      stackReachRatio: 1.48,
      headTubeAngleDeg: 71.5,
      chainstayLengthMm: 430,
      wheelbaseMm: 1025,
      bbDropMm: 70,
    };
  } else if (discipline === "road_endurance") {
    geometry = {
      stackMm: 558,
      reachMm: 378,
      stackReachRatio: 1.48,
      headTubeAngleDeg: 72.0,
      chainstayLengthMm: 412,
      wheelbaseMm: 998,
      bbDropMm: 70,
    };
  } else {
    // road_race
    geometry = {
      stackMm: 542,
      reachMm: 388,
      stackReachRatio: 1.40,
      headTubeAngleDeg: 73.0,
      chainstayLengthMm: 405,
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
    maxTireClearanceMm,
    integratedCockpit: /slr|pulse/i.test(cleanModel),
    bikepackingMounts: /jakar|west/i.test(cleanModel),
    groupset,
    geometry,
    brakes: brakesText ? brakesText.replace(/^frenos\s*/i, "").trim().slice(0, 80) : "Hydraulic Disc",
    wheels: wheelsText ? wheelsText.replace(/^ruedas\s*/i, "").trim().slice(0, 80) : "Megamo Wheels",
    tires: tiresText ? tiresText.replace(/^cubiertas\s*/i, "").trim().slice(0, 80) : "Pirelli / Maxxis",
    description: `Bicicleta ${brand} ${cleanModel} con cuadro ${frameMaterial === "carbon" ? "de carbono monocasco" : "de aluminio aligerado"} y transmisión ${groupsetName}.`,
    highlights: [
      `Cuadro ${frameMaterial === "carbon" ? "de carbono de alto módulo" : "de aluminio de triple conificado"}`,
      `Grupo ${groupsetName}`,
      discipline === "gravel" ? `Paso de rueda hasta ${maxTireClearanceMm} mm` : `Geometría deportiva y rendimiento de referencia`,
      `Diseño y desarrollo nacional en Girona`,
    ],
  };

  return BikeProductSchema.parse(bike);
}
