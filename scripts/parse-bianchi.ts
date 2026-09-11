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

export async function parseBianchiHtml(
  html: string,
  originalUrl: string,
  sectionDiscipline: "carretera" | "gravel" | "montana"
): Promise<BikeProduct | null> {
  const brand = "Bianchi";

  // 1. Extraer JSON-LD si existe
  let ldProduct: any = null;
  const ldMatches = [...html.matchAll(/<script[^>]+type=["']application\/ld\+json["'][^>]*>([\s\S]*?)<\/script>/gi)];
  for (const m of ldMatches) {
    try {
      const parsed = JSON.parse(m[1]);
      if (parsed["@type"] === "Product") {
        ldProduct = parsed;
        break;
      }
      if (parsed["@graph"] && Array.isArray(parsed["@graph"])) {
        const found = parsed["@graph"].find((x: any) => x["@type"] === "Product");
        if (found) {
          ldProduct = found;
          break;
        }
      }
    } catch (_) {}
  }

  // Nombre
  let rawTitle = ldProduct?.name || "";
  if (!rawTitle) {
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) rawTitle = h1Match[1].replace(/<[^>]+>/g, "").trim();
  }
  if (!rawTitle) {
    const slug = originalUrl.split("/").filter(Boolean).pop()?.replace(/-/g, " ") || "Bianchi";
    rawTitle = slug;
  }

  const cleanModel = rawTitle
    .replace(/\s*–\s*BianchiStoreEs.*$/i, "")
    .replace(/^Bicicleta\s+/i, "")
    .replace(/^Bianchi\s+/i, "")
    .trim();

  // Año
  let year = 2026;
  const yearMatch = originalUrl.match(/(202[2-7])/);
  if (yearMatch) year = parseInt(yearMatch[1], 10);

  // Imagen
  let officialImageUrl = ldProduct?.image?.url || ldProduct?.image || "";
  if (!officialImageUrl || typeof officialImageUrl !== "string") {
    const ogImg = html.match(/<meta[^>]+property=["']og:image["'][^>]+content=["']([^"']+)["']/i);
    if (ogImg) officialImageUrl = ogImg[1];
  }
  if (!officialImageUrl || !officialImageUrl.startsWith("http")) {
    officialImageUrl = "https://www.bianchistore.es/wp-content/uploads/bianchi-default.jpg";
  }

  // Precios
  let currentPriceEur = 0;
  if (ldProduct?.offers?.price) {
    currentPriceEur = Math.round(parseFloat(String(ldProduct.offers.price)));
  } else if (Array.isArray(ldProduct?.offers) && ldProduct.offers[0]?.price) {
    currentPriceEur = Math.round(parseFloat(String(ldProduct.offers[0].price)));
  }

  if (!currentPriceEur || isNaN(currentPriceEur) || currentPriceEur <= 0) {
    const priceMatch = html.match(/class=["'][^"']*woocommerce-Price-amount[^"']*["'][^>]*>([\s\S]*?)<\/bdi>/i) ||
                       html.match(/([0-9]{1,2}(?:\.[0-9]{3})*(?:,[0-9]{2})?)\s*€/i);
    if (priceMatch) {
      currentPriceEur = Math.round(parseFloat(priceMatch[1].replace(/<[^>]+>/g, "").replace(/\./g, "").replace(",", ".")));
    }
  }

  if (!currentPriceEur || currentPriceEur <= 0) {
    currentPriceEur = 3499;
  }
  const msrpEur = currentPriceEur;

  // Disciplina, suspensión y e-bike
  let discipline: Discipline = "road_race";
  let suspensionType: SuspensionType = "rigid";
  const modelLower = cleanModel.toLowerCase();
  const urlLower = originalUrl.toLowerCase();
  const isElectric = /(?:e-oltre|e-arcadex|t-tronik|e-omnia|electric|e-bike)/i.test(`${modelLower} ${urlLower}`);

  if (sectionDiscipline === "montana" || /(?:methanol|nitron|magma|duel)/i.test(modelLower)) {
    discipline = "mtb";
    if (/(?:fs|full)/i.test(modelLower)) {
      suspensionType = "full";
    } else {
      suspensionType = "hardtail";
    }
  } else if (sectionDiscipline === "gravel" || /(?:arcadex|impulso|zolder)/i.test(modelLower)) {
    discipline = "gravel";
    suspensionType = "rigid";
  } else if (/(?:infinito|via nirone)/i.test(modelLower)) {
    discipline = "road_endurance";
    suspensionType = "rigid";
  } else {
    discipline = "road_race";
    suspensionType = "rigid";
  }

  // Extraer componentes de la tabla HTML
  let cranksetValue = "";
  let derailleurValue = "";
  let brakesValue = "";
  let wheelsValue = "";
  let tiresValue = "";
  let forkValue = "";

  const rows = [...html.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
  for (const r of rows) {
    const text = r[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
    if (/bielas/i.test(text)) cranksetValue = text.replace(/^bielas/i, "").trim();
    if (/cambio/i.test(text)) derailleurValue = text.replace(/^cambio/i, "").trim();
    if (/frenos/i.test(text)) brakesValue = text.replace(/^frenos/i, "").trim();
    if (/ruedas/i.test(text)) wheelsValue = text.replace(/^ruedas/i, "").trim();
    if (/cubiertas/i.test(text)) tiresValue = text.replace(/^cubiertas/i, "").trim();
    if (/horquilla/i.test(text)) forkValue = text.replace(/^horquilla/i, "").trim();
  }

  // Gruposet
  const allSpecText = `${cleanModel} ${originalUrl} ${derailleurValue} ${cranksetValue}`.toLowerCase();
  let groupsetBrand: GroupsetBrand = "shimano";
  let groupsetName = "Shimano 105";
  let isElectronic = false;
  let speedCount = 12;
  let chainrings = "50/34T";
  let cassette = "11-34T";

  if (/dura-ace|dura ace/i.test(allSpecText)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano Dura-Ace Di2 R9200";
    isElectronic = true;
    speedCount = 12;
    chainrings = "52/36T";
    cassette = "11-30T";
  } else if (/super record eps/i.test(allSpecText)) {
    groupsetBrand = "campagnolo";
    groupsetName = "Campagnolo Super Record EPS";
    isElectronic = true;
    speedCount = 12;
    chainrings = "50/34T";
    cassette = "11-32T";
  } else if (/red axs|red etap/i.test(allSpecText)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM RED eTap AXS";
    isElectronic = true;
    speedCount = 12;
    chainrings = "48/35T";
    cassette = "10-33T";
  } else if (/force axs|force etap/i.test(allSpecText)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM Force eTap AXS";
    isElectronic = true;
    speedCount = 12;
    chainrings = "48/35T";
    cassette = "10-33T";
  } else if (/rival axs|rival etap/i.test(allSpecText)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM Rival eTap AXS";
    isElectronic = true;
    speedCount = 12;
    chainrings = "48/35T";
    cassette = "10-36T";
  } else if (/ultegra di2/i.test(allSpecText)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano Ultegra Di2 R8100";
    isElectronic = true;
    speedCount = 12;
    chainrings = "50/34T";
    cassette = "11-34T";
  } else if (/ultegra/i.test(allSpecText)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano Ultegra R8000";
    isElectronic = false;
    speedCount = 11;
    chainrings = "50/34T";
    cassette = "11-32T";
  } else if (/105 di2/i.test(allSpecText)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano 105 Di2 R7100";
    isElectronic = true;
    speedCount = 12;
    chainrings = "50/34T";
    cassette = "11-34T";
  } else if (/105/i.test(allSpecText)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano 105 R7000";
    isElectronic = false;
    speedCount = 11;
    chainrings = "50/34T";
    cassette = "11-32T";
  } else if (/ekar/i.test(allSpecText)) {
    groupsetBrand = "campagnolo";
    groupsetName = "Campagnolo Ekar 13v";
    isElectronic = false;
    speedCount = 13;
    chainrings = "40T";
    cassette = "9-42T";
  } else if (/grx.*di2|grx 815|grx 825/i.test(allSpecText)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano GRX Di2";
    isElectronic = true;
    speedCount = 11;
    chainrings = "48/31T";
    cassette = "11-34T";
  } else if (/grx (?:820|810|610|600|400)/i.test(allSpecText)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano GRX RX810/RX600";
    isElectronic = false;
    speedCount = 11;
    chainrings = "46/30T";
    cassette = "11-34T";
  } else if (/xx1|x01/i.test(allSpecText)) {
    groupsetBrand = "sram";
    groupsetName = "SRAM XX1 Eagle AXS";
    isElectronic = true;
    speedCount = 12;
    chainrings = "34T";
    cassette = "10-52T";
  } else if (/xtr/i.test(allSpecText)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano XTR M9100";
    isElectronic = false;
    speedCount = 12;
    chainrings = "34T";
    cassette = "10-51T";
  } else if (/xt/i.test(allSpecText)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano XT M8100";
    isElectronic = false;
    speedCount = 12;
    chainrings = "34T";
    cassette = "10-51T";
  } else if (/deore/i.test(allSpecText)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano Deore M6100";
    isElectronic = false;
    speedCount = 12;
    chainrings = "32T";
    cassette = "10-51T";
  } else if (/alivio/i.test(allSpecText)) {
    groupsetBrand = "shimano";
    groupsetName = "Shimano Alivio";
    isElectronic = false;
    speedCount = 9;
    chainrings = "36/22T";
    cassette = "11-36T";
  }

  // Refinar platos si se extrajeron explícitamente
  if (cranksetValue && cranksetValue.match(/([0-9]{2}(?:[x\/][0-9]{2})?T?)/i)) {
    const match = cranksetValue.match(/([0-9]{2}(?:[x\/][0-9]{2})?T?)/i);
    if (match) {
      chainrings = match[1].replace(/x/i, "/").toUpperCase();
      if (!chainrings.endsWith("T")) chainrings += "T";
    }
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

  const frameMaterial: FrameMaterial = /(?:nirone|duel|magma)/i.test(modelLower) ? "aluminum" : "carbon";
  const forkMaterial: ForkMaterial = suspensionType === "rigid" ? "carbon" : "suspension";

  let maxTireClearanceMm = 30;
  if (discipline === "road_race") maxTireClearanceMm = 30;
  else if (discipline === "road_endurance") maxTireClearanceMm = 35;
  else if (discipline === "gravel") maxTireClearanceMm = 45;
  else if (discipline === "mtb") maxTireClearanceMm = 60;

  // Geometría
  let geometry: GeometrySpec;
  if (discipline === "mtb") {
    geometry = {
      stackMm: 610,
      reachMm: 440,
      stackReachRatio: 1.39,
      headTubeAngleDeg: 68.0,
      chainstayLengthMm: 430,
      wheelbaseMm: 1140,
      bbDropMm: 50,
    };
  } else if (discipline === "gravel") {
    geometry = {
      stackMm: 568,
      reachMm: 380,
      stackReachRatio: 1.49,
      headTubeAngleDeg: 71.5,
      chainstayLengthMm: 430,
      wheelbaseMm: 1025,
      bbDropMm: 70,
    };
  } else if (discipline === "road_endurance") {
    geometry = {
      stackMm: 565,
      reachMm: 378,
      stackReachRatio: 1.49,
      headTubeAngleDeg: 72.0,
      chainstayLengthMm: 415,
      wheelbaseMm: 1002,
      bbDropMm: 68,
    };
  } else {
    // road_race
    geometry = {
      stackMm: 545,
      reachMm: 388,
      stackReachRatio: 1.40,
      headTubeAngleDeg: 73.0,
      chainstayLengthMm: 408,
      wheelbaseMm: 988,
      bbDropMm: 68,
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
    integratedCockpit: /rc|pro|oltre/i.test(cleanModel),
    bikepackingMounts: discipline === "gravel",
    groupset,
    geometry,
    brakes: brakesValue || `${groupsetBrand === "shimano" ? "Shimano" : groupsetBrand === "sram" ? "SRAM" : "Campagnolo"} Hydraulic Disc`,
    wheels: wheelsValue || "Velomann Carbon / Alloy",
    tires: tiresValue || (discipline === "gravel" ? "Pirelli Cinturato Gravel 700x40" : "Pirelli P Zero Race 700x28"),
    description: (ldProduct?.description ? String(ldProduct.description).replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 500) : null) || `Bicicleta italiana ${brand} ${cleanModel} con diseño icónico celeste y grupo ${groupsetName}.`,
    highlights: [
      `Geometría y diseño exclusivo Bianchi`,
      `Grupo ${groupsetName}`,
      `Cuadro ${frameMaterial === "carbon" ? "de carbono de competición" : "de aluminio aligerado"}`,
      discipline === "gravel" ? `Paso de rueda de hasta ${maxTireClearanceMm} mm` : `Aerodinámica y rigidez en ruta`,
    ],
  };

  return BikeProductSchema.parse(bike);
}
