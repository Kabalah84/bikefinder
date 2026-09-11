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
    .split(/[\/\-]/)
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

export async function parsePinarelloHtml(
  html: string,
  originalUrl: string,
  sectionDiscipline: "carretera" | "gravel" | "montana"
): Promise<BikeProduct | null> {
  const brand = "Pinarello";

  // 1. Extraer nombre del producto desde og:title o URL
  const ogTitleMatch = html.match(/<meta\s+(?:property|name)=["']?og:title["']?\s+content=["']?([^"'>]+)/i);
  let rawTitle = ogTitleMatch ? ogTitleMatch[1].trim() : "";

  if (!rawTitle) {
    const slug = originalUrl.split("/").pop()?.split(".")[0]?.replace(/^[0-9]+-[0-9]+-/, "") || "";
    rawTitle = slug.replace(/-/g, " ").toUpperCase();
  }

  // Extraer el modelo principal (ej: DOGMA X MY26, F7 MY26, GREVIL F5, DOGMA XC)
  // Formato habitual en og:title: DOGMA X MY26 – E202/Xolar Black TALLA BICICLETA...
  const titleParts = rawTitle.split(/–|-|\s+TALLA\s+/i);
  let cleanModel = titleParts[0].trim();
  cleanModel = cleanModel.replace(/\s+/g, " ").trim();

  if (cleanModel.length < 2) {
    cleanModel = "Pinarello";
  }

  // 2. Extraer año
  let year = 2026;
  const yearMatch = originalUrl.match(/202[4-7]/) || rawTitle.match(/my(2[4-7])/i);
  if (yearMatch) {
    const yStr = yearMatch[1] ? `20${yearMatch[1]}` : yearMatch[0];
    year = parseInt(yStr, 10);
  }

  // 3. Extraer imagen oficial
  const ogImgMatch = html.match(/<meta\s+(?:property|name)=["']?og:image["']?\s+content=["']?([^"'>]+)/i);
  let officialImageUrl = ogImgMatch ? ogImgMatch[1].trim() : "";
  if (!officialImageUrl.startsWith("http")) {
    officialImageUrl = "https://www.pinarello.es/tienda/img/cms/pinarello-default.jpg";
  }

  // 4. Extraer precio
  let currentPriceEur = 0;
  const priceItemprop = html.match(/itemprop=["']price["'][^>]+content=["']([^"']+)["']/i);
  if (priceItemprop) {
    currentPriceEur = Math.round(parseFloat(priceItemprop[1]));
  } else {
    const priceMatch = html.match(/class=["'][^"']*current-price[^"']*["'][^>]*>([\s\S]*?)<\/span>/i) ||
                       html.match(/([0-9]{1,2}(?:\.[0-9]{3})*(?:,[0-9]{2})?)\s*€/i);
    if (priceMatch) {
      currentPriceEur = Math.round(parseFloat(priceMatch[1].replace(/\./g, "").replace(",", ".")));
    }
  }

  if (!currentPriceEur || currentPriceEur <= 0) {
    currentPriceEur = 5990;
  }
  const msrpEur = currentPriceEur;

  // 5. Determinar disciplina, suspensión y e-bike
  let discipline: Discipline = "road_race";
  let suspensionType: SuspensionType = "rigid";
  const isElectric = /(?:nytro|e-road|e-bike|electric)/i.test(cleanModel) || /(?:nytro|e-road|electric)/i.test(originalUrl);

  const modelLower = cleanModel.toLowerCase();
  if (sectionDiscipline === "montana" || /xc/i.test(modelLower)) {
    discipline = "mtb";
    if (/hardtail/i.test(modelLower)) {
      suspensionType = "hardtail";
    } else {
      suspensionType = "full";
    }
  } else if (sectionDiscipline === "gravel" || /grevil|granger/i.test(modelLower)) {
    discipline = "gravel";
    suspensionType = "rigid";
  } else if (/dogma x|x1|x3|x5/i.test(modelLower)) {
    discipline = "road_endurance";
    suspensionType = "rigid";
  } else {
    discipline = "road_race";
    suspensionType = "rigid";
  }

  // 6. Extraer Grupo / Transmisión
  const titleTextAndUrl = `${rawTitle} ${originalUrl}`.toLowerCase();
  let groupsetBrand: GroupsetBrand = "shimano";
  let groupsetName = "Shimano 105 Di2";
  let isElectronic = true;
  let speedCount = 12;
  let chainrings = "50/34T";
  let cassette = "11-34T";

  if (/dura_ace|dura ace/i.test(titleTextAndUrl)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano Dura-Ace Di2 R9200";
    isElectronic = true;
    speedCount = 12;
    chainrings = "52/36T";
    cassette = "11-30T";
  } else if (/ultegra/i.test(titleTextAndUrl)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano Ultegra Di2 R8100";
    isElectronic = true;
    speedCount = 12;
    chainrings = "50/34T";
    cassette = "11-34T";
  } else if (/105_di2|105 di2/i.test(titleTextAndUrl)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano 105 Di2 R7100";
    isElectronic = true;
    speedCount = 12;
    chainrings = "50/34T";
    cassette = "11-34T";
  } else if (/105_2x12|105/i.test(titleTextAndUrl) && !/di2/i.test(titleTextAndUrl)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano 105 R7100 Mecánico";
    isElectronic = false;
    speedCount = 12;
    chainrings = "50/34T";
    cassette = "11-34T";
  } else if (/ekar/i.test(titleTextAndUrl)) {
    groupsetBrand = "campagnolo";
    groupsetName = "Campagnolo Ekar 13v";
    isElectronic = false;
    speedCount = 13;
    chainrings = "40T";
    cassette = "9-42T";
  } else if (/grx_825|grx.*di2/i.test(titleTextAndUrl)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano GRX Di2 RX825";
    isElectronic = true;
    speedCount = 12;
    chainrings = "48/31T";
    cassette = "11-36T";
  } else if (/grx_822|grx/i.test(titleTextAndUrl)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano GRX RX820";
    isElectronic = false;
    speedCount = 12;
    chainrings = "40T";
    cassette = "10-45T";
  } else if (/rival_xplr|rival/i.test(titleTextAndUrl)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM Rival XPLR AXS";
    isElectronic = true;
    speedCount = 12;
    chainrings = "40T";
    cassette = "10-44T";
  } else if (/xx_sl|xx sl/i.test(titleTextAndUrl)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM XX SL Eagle AXS Transmission";
    isElectronic = true;
    speedCount = 12;
    chainrings = "34T";
    cassette = "10-52T";
  } else if (/gx_eagle|gx eagle/i.test(titleTextAndUrl)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM GX Eagle AXS Transmission";
    isElectronic = true;
    speedCount = 12;
    chainrings = "34T";
    cassette = "10-52T";
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

  // 7. Material y paso de rueda
  const frameMaterial: FrameMaterial = "carbon";
  const forkMaterial: ForkMaterial = suspensionType === "rigid" ? "carbon" : "suspension";

  let maxTireClearanceMm = 32;
  if (discipline === "road_race") maxTireClearanceMm = 32;
  else if (discipline === "road_endurance") maxTireClearanceMm = 35;
  else if (discipline === "gravel") maxTireClearanceMm = 50;
  else if (discipline === "mtb") maxTireClearanceMm = 62;

  // 8. Geometría
  let geometry: GeometrySpec;
  if (discipline === "mtb") {
    geometry = {
      stackMm: 605,
      reachMm: 445,
      stackReachRatio: 1.36,
      headTubeAngleDeg: 67.5,
      chainstayLengthMm: 432,
      wheelbaseMm: 1150,
      bbDropMm: 45,
    };
  } else if (discipline === "gravel") {
    geometry = {
      stackMm: 565,
      reachMm: 382,
      stackReachRatio: 1.48,
      headTubeAngleDeg: 71.0,
      chainstayLengthMm: 425,
      wheelbaseMm: 1025,
      bbDropMm: 72,
    };
  } else if (discipline === "road_endurance") {
    geometry = {
      stackMm: 558,
      reachMm: 375,
      stackReachRatio: 1.49,
      headTubeAngleDeg: 72.0,
      chainstayLengthMm: 415,
      wheelbaseMm: 998,
      bbDropMm: 72,
    };
  } else {
    // road_race
    geometry = {
      stackMm: 543,
      reachMm: 386,
      stackReachRatio: 1.41,
      headTubeAngleDeg: 72.8,
      chainstayLengthMm: 406,
      wheelbaseMm: 988,
      bbDropMm: 72,
    };
  }

  // Extraer ruedas de la URL si están presentes
  let wheels = "Most Ultrafast Carbon 45";
  const wheelsMatch = originalUrl.match(/ruedas-([a-z0-9_]+)/i);
  if (wheelsMatch) {
    wheels = wheelsMatch[1].replace(/_/g, " ").toUpperCase();
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
    integratedCockpit: true,
    bikepackingMounts: discipline === "gravel",
    groupset,
    geometry,
    brakes: `${groupsetBrand === "shimano" ? "Shimano" : groupsetBrand === "sram" ? "SRAM" : "Campagnolo"} Hydraulic Disc`,
    wheels,
    description: `Bicicleta oficial ${brand} ${cleanModel} con cuadro de carbono de alta gama, grupo ${groupsetName} y aerodinámica italiana exclusiva.`,
    highlights: [
      `Cuadro de carbono Torayca de referencia mundial`,
      `Grupo ${groupsetName}`,
      `Ruedas ${wheels}`,
      discipline === "gravel" ? `Paso de rueda hasta ${maxTireClearanceMm} mm` : `Geometría de competición italiana`,
    ],
  };

  return BikeProductSchema.parse(bike);
}
