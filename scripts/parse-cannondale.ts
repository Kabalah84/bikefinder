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

export async function parseCannondaleHtml(
  html: string,
  originalUrl: string,
  sectionDiscipline: "carretera" | "gravel" | "montana"
): Promise<BikeProduct | null> {
  const brand = "Cannondale";

  // 1. Extraer nombre del modelo
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
    .replace(/\s*-\s*Cannondale.*$/i, "")
    .replace(/^Cannondale\s+/i, "")
    .replace(/^Bicicleta\s+/i, "")
    .trim();

  // 2. Extraer año
  let year = 2026;
  const yearMatch = originalUrl.match(/(202[2-7])/) || html.match(/(?:MY|model year|año)\s*(202[2-7])/i);
  if (yearMatch) year = parseInt(yearMatch[1], 10);

  // 3. Extraer imagen oficial
  let officialImageUrl = "";
  const ogImgMatch = html.match(/<meta\s+(?:property|name)=["']?og:image["']?\s+content=["']?([^"'>]+)/i);
  if (ogImgMatch) officialImageUrl = ogImgMatch[1].trim();

  if (!officialImageUrl.startsWith("http")) {
    const widencdnMatch = html.match(/(https:\/\/embed\.widencdn\.net\/img\/[^"'\s]+)/i);
    if (widencdnMatch) officialImageUrl = widencdnMatch[1];
  }
  if (!officialImageUrl || !officialImageUrl.startsWith("http")) {
    officialImageUrl = "https://www.cannondale.com/assets/images/cannondale-default.jpg";
  }

  // 4. Extraer precio
  let currentPriceEur = 0;
  const priceScriptMatch = html.match(/["']price["']\s*:\s*["']?([0-9.,]+)["']?/i) ||
                          html.match(/["']unit_price["']\s*:\s*["']?([0-9.,]+)["']?/i);
  if (priceScriptMatch) {
    const pVal = parseFloat(priceScriptMatch[1].replace(/,/g, ""));
    if (pVal > 100) currentPriceEur = Math.round(pVal);
  }

  if (!currentPriceEur || isNaN(currentPriceEur) || currentPriceEur <= 100) {
    const priceDivMatch = html.match(/class=["'][^"']*price[^"']*["'][^>]*>([\s\S]*?)<\/div>/i) ||
                          html.match(/([0-9]{1,2}(?:\.[0-9]{3})*(?:,[0-9]{2})?)\s*€/i);
    if (priceDivMatch) {
      const pParsed = parseFloat(priceDivMatch[1].replace(/<[^>]+>/g, "").replace(/\./g, "").replace(",", ".").replace(/[^0-9.]/g, ""));
      if (pParsed > 100) currentPriceEur = Math.round(pParsed);
    }
  }

  if (!currentPriceEur || currentPriceEur <= 100) {
    currentPriceEur = 3999;
  }
  const msrpEur = currentPriceEur;

  // 5. Determinar disciplina, suspensión y e-bike
  let discipline: Discipline = "road_race";
  let suspensionType: SuspensionType = "rigid";
  const modelLower = cleanModel.toLowerCase();
  const urlLower = originalUrl.toLowerCase();

  const isElectric = /(?:neo|moterra|\/electric\/|e-mountain|e-road|electric)/i.test(`${modelLower} ${urlLower}`);

  if (sectionDiscipline === "montana" || /(?:moterra|scalpel|habit|trail)/i.test(modelLower)) {
    discipline = "mtb";
    if (/(?:scalpel-ht|scalpel ht|habit-ht|habit ht|trail|trail-neo|trail neo)/i.test(`${modelLower} ${urlLower}`)) {
      suspensionType = "hardtail";
    } else {
      suspensionType = "full";
    }
  } else if (sectionDiscipline === "gravel" || /(?:topstone|superx)/i.test(modelLower)) {
    discipline = "gravel";
    if (/lefty/i.test(modelLower)) {
      suspensionType = "hardtail";
    } else {
      suspensionType = "rigid";
    }
  } else if (/synapse/i.test(modelLower)) {
    discipline = "road_endurance";
    suspensionType = "rigid";
  } else {
    discipline = "road_race";
    suspensionType = "rigid";
  }

  // 6. Extraer componentes del HTML
  const specBlob = `${cleanModel} ${originalUrl} ${html.slice(0, 50000)}`.toLowerCase();
  let groupsetBrand: GroupsetBrand = "shimano";
  let groupsetName = "Shimano 105";
  let isElectronic = false;
  let speedCount = 12;
  let chainrings = "50/34T";
  let cassette = "11-34T";

  if (/dura-ace|dura ace/i.test(specBlob)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano Dura-Ace Di2 R9200";
    isElectronic = true;
    speedCount = 12;
    chainrings = "52/36T";
    cassette = "11-30T";
  } else if (/sram red axs|red axs/i.test(specBlob)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM RED AXS";
    isElectronic = true;
    speedCount = 12;
    chainrings = "48/35T";
    cassette = "10-33T";
  } else if (/sram force axs|force axs/i.test(specBlob)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM Force AXS";
    isElectronic = true;
    speedCount = 12;
    chainrings = "48/35T";
    cassette = "10-36T";
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
  } else if (/sram rival axs|rival axs/i.test(specBlob)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM Rival AXS";
    isElectronic = true;
    speedCount = 12;
    chainrings = "48/35T";
    cassette = "10-36T";
  } else if (/sram apex axs|apex axs/i.test(specBlob)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM Apex AXS";
    isElectronic = true;
    speedCount = 12;
    chainrings = "40T";
    cassette = "11-44T";
  } else if (/grx 820|grx 800/i.test(specBlob)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano GRX RX820";
    isElectronic = false;
    speedCount = 12;
    chainrings = "40T";
    cassette = "10-45T";
  } else if (/grx 610|grx 600/i.test(specBlob)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano GRX RX600";
    isElectronic = false;
    speedCount = 11;
    chainrings = "46/30T";
    cassette = "11-34T";
  } else if (/sram xx sl eagle|xx sl/i.test(specBlob)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM XX SL Eagle AXS Transmission";
    isElectronic = true;
    speedCount = 12;
    chainrings = "34T";
    cassette = "10-52T";
  } else if (/sram gx eagle axs|gx eagle/i.test(specBlob)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM GX Eagle AXS";
    isElectronic = true;
    speedCount = 12;
    chainrings = "34T";
    cassette = "10-52T";
  } else if (/cues/i.test(specBlob)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano CUES 1x";
    isElectronic = false;
    speedCount = 10;
    chainrings = "40T";
    cassette = "11-48T";
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

  const isAlloy = /alloy|caad|topstone-alloy|trail/i.test(`${modelLower} ${urlLower}`);
  const frameMaterial: FrameMaterial = isAlloy ? "aluminum" : "carbon";
  const forkMaterial: ForkMaterial = suspensionType === "rigid" ? "carbon" : "suspension";

  let maxTireClearanceMm = 32;
  if (discipline === "road_race") maxTireClearanceMm = 34;
  else if (discipline === "road_endurance") maxTireClearanceMm = 38;
  else if (discipline === "gravel") maxTireClearanceMm = 45;
  else if (discipline === "mtb") maxTireClearanceMm = 62;

  // Geometría
  let geometry: GeometrySpec;
  if (discipline === "mtb") {
    geometry = {
      stackMm: 612,
      reachMm: 450,
      stackReachRatio: 1.36,
      headTubeAngleDeg: 66.5,
      chainstayLengthMm: 438,
      wheelbaseMm: 1160,
      bbDropMm: 42,
    };
  } else if (discipline === "gravel") {
    geometry = {
      stackMm: 570,
      reachMm: 385,
      stackReachRatio: 1.48,
      headTubeAngleDeg: 71.2,
      chainstayLengthMm: 420,
      wheelbaseMm: 1030,
      bbDropMm: 70,
    };
  } else if (discipline === "road_endurance") {
    geometry = {
      stackMm: 567,
      reachMm: 377,
      stackReachRatio: 1.50,
      headTubeAngleDeg: 72.5,
      chainstayLengthMm: 415,
      wheelbaseMm: 1005,
      bbDropMm: 72,
    };
  } else {
    // road_race
    geometry = {
      stackMm: 542,
      reachMm: 389,
      stackReachRatio: 1.39,
      headTubeAngleDeg: 73.0,
      chainstayLengthMm: 410,
      wheelbaseMm: 992,
      bbDropMm: 72,
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
    integratedCockpit: /lab71|supersix evo 1|supersix evo 2/i.test(cleanModel),
    bikepackingMounts: discipline === "gravel" || /allroad/i.test(cleanModel),
    groupset,
    geometry,
    brakes: `${groupsetBrand === "shimano" ? "Shimano" : "SRAM"} Hydraulic Disc`,
    wheels: /carbon/i.test(modelLower) ? "HollowGram Carbon Wheelset" : "Cannondale / DT Swiss Alloy",
    tires: discipline === "gravel" ? "Vittoria Terreno Dry 700x38c" : "Vittoria Rubino Pro 700x28c",
    description: `Bicicleta ${brand} ${cleanModel} con cuadro ${frameMaterial === "carbon" ? "de carbono Hi-MOD / BallisTec" : "SmartForm C1 Premium Alloy"} y transmisión ${groupsetName}.`,
    highlights: [
      `Ingeniería e innovación exclusiva Cannondale`,
      `Grupo ${groupsetName}`,
      discipline === "gravel" ? `Paso de rueda hasta ${maxTireClearanceMm} mm` : `Aerodinámica y eficiencia en transmisión`,
      `Garantía oficial Cannondale`,
    ],
  };

  return BikeProductSchema.parse(bike);
}
