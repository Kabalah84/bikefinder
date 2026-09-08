import {
  BikeProduct,
  DetailedSpecCategory,
  Discipline,
  GeometrySpec,
  GroupsetSpec,
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
    .split("/")
    .map((r) => parseFloat(r.trim()))
    .filter((n) => !isNaN(n) && n < 70);

  const cogs = cassette
    .replace(/T/gi, "")
    .split("-")
    .map((c) => parseFloat(c.trim()))
    .filter((n) => !isNaN(n) && n < 70);

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

function cleanHtmlEntities(text: string): string {
  return text
    .replace(/&deg;/g, "°")
    .replace(/&deg/g, "°")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">");
}

function parseMeasurementMm(valStr: string): number | undefined {
  if (!valStr) return undefined;
  const cleaned = cleanHtmlEntities(valStr).replace(/mm/gi, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : Math.round(num);
}

function parseAngleDeg(valStr: string): number | undefined {
  if (!valStr) return undefined;
  const cleaned = cleanHtmlEntities(valStr).replace(/°/g, "").replace(/deg/gi, "").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) ? undefined : Number(num.toFixed(1));
}

function extractJsonObject(text: string, startKey: string): any | null {
  const idx = text.indexOf(startKey);
  if (idx === -1) return null;
  const chunk = text.substring(idx + startKey.length);
  let depth = 0;
  let endIdx = 0;
  let started = false;
  for (let i = 0; i < chunk.length; i++) {
    if (chunk[i] === "{" || chunk[i] === "[") {
      depth++;
      started = true;
    } else if (chunk[i] === "}" || chunk[i] === "]") {
      depth--;
      if (started && depth === 0) {
        endIdx = i;
        break;
      }
    }
  }
  if (!started || endIdx === 0) return null;
  const jsonStr = chunk.substring(0, endIdx + 1);
  try {
    return JSON.parse(jsonStr);
  } catch {
    return null;
  }
}

export function parseSpecializedHtml(
  html: string,
  originalUrl: string,
  sectionDiscipline: Discipline
): BikeProduct | null {
  // 1. Desempaquetar el payload RSC de Next.js
  const pushRegex = /self\.__next_f\.push\(\[1,"([\s\S]*?)"\]\)/g;
  let match;
  let rscPayload = "";
  while ((match = pushRegex.exec(html)) !== null) {
    try {
      rscPayload += JSON.parse(`"${match[1]}"`);
    } catch {
      rscPayload += match[1];
    }
  }

  if (!rscPayload && !html.includes("productSpecs")) {
    console.warn("  ⚠️ No se encontró payload RSC de Specialized");
    return null;
  }

  const searchableText = rscPayload || html;

  // 2. Extraer Título y Modelo
  let pageTitle = "";
  const titleMatch = html.match(/<meta\s+property="og:title"\s+content="([^"]+)"/i) ||
    html.match(/<title>([^<]*)<\/title>/i);
  if (titleMatch) {
    pageTitle = cleanHtmlEntities(titleMatch[1]).split("|")[0].trim();
  }

  const modelName = pageTitle.replace(/^Specialized\s+/i, "").trim() || "Specialized";

  // Determinar disciplina fina
  let discipline: Discipline = sectionDiscipline;
  const lowerTitle = pageTitle.toLowerCase();
  const lowerUrl = originalUrl.toLowerCase();
  if (lowerTitle.includes("roubaix") || lowerUrl.includes("roubaix")) {
    discipline = "road_endurance";
  } else if (
    lowerTitle.includes("crux") ||
    lowerTitle.includes("diverge") ||
    lowerUrl.includes("crux") ||
    lowerUrl.includes("diverge")
  ) {
    discipline = "gravel";
  } else if (
    lowerTitle.includes("epic") ||
    lowerTitle.includes("stumpjumper") ||
    lowerTitle.includes("chisel") ||
    lowerTitle.includes("rockhopper") ||
    lowerTitle.includes("enduro") ||
    lowerTitle.includes("demo") ||
    lowerTitle.includes("status") ||
    lowerUrl.includes("montana") ||
    lowerUrl.includes("mountain")
  ) {
    discipline = "mtb";
  } else if (
    lowerTitle.includes("tarmac") ||
    lowerTitle.includes("allez") ||
    lowerTitle.includes("aethos")
  ) {
    discipline = "road_race";
  }

  // 3. Extraer productSpecs (Especificaciones Técnicas)
  const productSpecsObj = extractJsonObject(searchableText, '"productSpecs":');
  const rawSpecsCategories: any[] = productSpecsObj?.specs || [];

  // Mapa de especificaciones para fácil acceso
  const specMap = new Map<string, string>();
  for (const cat of rawSpecsCategories) {
    if (cat.specs && Array.isArray(cat.specs)) {
      for (const s of cat.specs) {
        const key = (s.code || s.name || "").toLowerCase();
        specMap.set(key, s.description || "");
      }
    }
  }

  // Cuadro y Horquilla
  const frameDesc = specMap.get("frame") || specMap.get("cuadro") || "";
  const forkDesc = specMap.get("fork") || specMap.get("horquilla") || "";

  let frameMaterial: "carbon" | "aluminum" | "steel" | "titanium" = "carbon";
  if (
    frameDesc.toLowerCase().includes("alloy") ||
    frameDesc.toLowerCase().includes("aluminum") ||
    frameDesc.toLowerCase().includes("aluminio") ||
    frameDesc.toLowerCase().includes("dsw") ||
    frameDesc.toLowerCase().includes("e5") ||
    frameDesc.toLowerCase().includes("a1") ||
    lowerTitle.includes("alloy") ||
    lowerTitle.includes("comp alloy")
  ) {
    frameMaterial = "aluminum";
  }

  let forkMaterial: "carbon" | "aluminum" | "steel" | "titanium" | "suspension" = "carbon";
  if (discipline === "mtb") {
    forkMaterial = "suspension";
  } else if (
    forkDesc.toLowerCase().includes("alloy") ||
    forkDesc.toLowerCase().includes("aluminum") ||
    forkDesc.toLowerCase().includes("aluminio")
  ) {
    forkMaterial = "aluminum";
  }

  // Transmisión
  const rearDerailleur = specMap.get("rear derailleur") || specMap.get("desviador trasero") || "";
  const frontDerailleur = specMap.get("front derailleur") || specMap.get("desviador delantero") || "";
  const shiftLevers = specMap.get("shift levers") || specMap.get("manetas de cambio") || "";
  const crankset = specMap.get("crankset") || specMap.get("platos y bielas") || "";
  const chainringsSpec = specMap.get("chainrings") || specMap.get("platos") || "";
  const cassette = specMap.get("cassette") || "";
  const chain = specMap.get("chain") || specMap.get("cadena") || "";

  // Nombre representativo del grupo
  let groupsetName = "Shimano / SRAM";
  if (rearDerailleur) {
    groupsetName = rearDerailleur.replace(/,.*$/, "").trim();
  } else if (crankset) {
    groupsetName = crankset.replace(/,.*$/, "").trim();
  } else {
    const titleParts = pageTitle.split(":");
    if (titleParts.length > 1) {
      groupsetName = titleParts[1].trim();
    }
  }

  const allDrivetrainText = `${groupsetName} ${rearDerailleur} ${frontDerailleur} ${shiftLevers} ${crankset} ${pageTitle}`.toLowerCase();

  let groupsetBrand: "shimano" | "sram" | "campagnolo" | "microshift" = "shimano";
  if (allDrivetrainText.includes("shimano")) {
    groupsetBrand = "shimano";
  } else if (allDrivetrainText.includes("sram") || allDrivetrainText.includes("eagle") || allDrivetrainText.includes("axs")) {
    groupsetBrand = "sram";
  } else if (allDrivetrainText.includes("campagnolo")) {
    groupsetBrand = "campagnolo";
  } else if (allDrivetrainText.includes("microshift")) {
    groupsetBrand = "microshift";
  } else {
    groupsetBrand = "shimano";
  }

  const isElectronic =
    allDrivetrainText.includes("di2") ||
    allDrivetrainText.includes("axs") ||
    allDrivetrainText.includes("transmission") ||
    allDrivetrainText.includes("t-type") ||
    allDrivetrainText.includes("wireless");

  let speedCount = 12;
  const speedMatch = (rearDerailleur + " " + cassette + " " + shiftLevers).match(/(\d+)[ -]speed/i);
  if (speedMatch) {
    speedCount = parseInt(speedMatch[1], 10);
  } else if (allDrivetrainText.includes("tiagra")) {
    speedCount = 10;
  } else if (allDrivetrainText.includes("105") && !isElectronic) {
    speedCount = 11;
  } else if (allDrivetrainText.includes("cues")) {
    speedCount = 9;
  }

  // Desarrollos de platos y cassette
  let chainrings = discipline === "mtb" ? "32" : discipline === "gravel" ? "40" : "50/34";
  
  // 1. Buscar en chainringsSpec (ej. "34T")
  const directRingMatch = chainringsSpec.match(/(\d{2}\/\d{2}|\d{2})\s*t?/i);
  if (directRingMatch) {
    chainrings = directRingMatch[1];
  } else {
    // 2. Buscar en crankset (ej. "Shimano Ultegra R8100, 52/36t")
    const doubleRingMatch = crankset.match(/(\d{2}\/\d{2})\s*t?/i);
    const singleRingMatch = crankset.match(/\b(\d{2})\s*t\b/i);
    if (doubleRingMatch) {
      chainrings = doubleRingMatch[1];
    } else if (singleRingMatch) {
      chainrings = singleRingMatch[1];
    }
  }

  let cassetteRange = discipline === "mtb" ? "10-52" : discipline === "gravel" ? "10-44" : "11-34";
  const cassMatch = cassette.match(/(\d{1,2}-\d{2})\s*t?/i);
  if (cassMatch) {
    cassetteRange = cassMatch[1];
  }

  const { minRatio, maxRatio } = calculateRatios(chainrings, cassetteRange);

  const groupsetSpec: GroupsetSpec = {
    brand: groupsetBrand,
    name: groupsetName.slice(0, 60),
    speedCount,
    isElectronic,
    chainrings,
    cassette: cassetteRange,
    minGearRatio: minRatio,
    maxGearRatio: maxRatio,
  };

  // Frenos, Ruedas, Neumáticos
  const frontBrake = specMap.get("front brake") || specMap.get("freno delantero") || "";
  const rearBrake = specMap.get("rear brake") || specMap.get("freno trasero") || "";
  const brakes = (frontBrake || rearBrake || "Frenos de disco hidráulicos").slice(0, 95);

  const frontWheel = specMap.get("front wheel") || specMap.get("rueda delantera") || "";
  const rearWheel = specMap.get("rear wheel") || specMap.get("rueda trasera") || "";
  const wheels = (frontWheel || rearWheel || "Roval Tubeless Ready").slice(0, 95);

  const frontTire = specMap.get("front tire") || specMap.get("neumático delantero") || "";
  const rearTire = specMap.get("rear tire") || specMap.get("neumático trasero") || "";
  const tires = (frontTire || rearTire || "Specialized Turbo / Pathfinder").slice(0, 95);

  // Paso de Rueda Máximo (Clearance)
  let maxTireClearanceMm = 32;
  if (discipline === "road_race") {
    maxTireClearanceMm = 32;
  } else if (discipline === "road_endurance") {
    maxTireClearanceMm = 38;
  } else if (discipline === "gravel") {
    maxTireClearanceMm = 47;
  } else if (discipline === "mtb") {
    maxTireClearanceMm = 62;
  }

  // Cockpit y Periféricos
  const handlebars = specMap.get("handlebars") || specMap.get("manillar") || "";
  const stem = specMap.get("stem") || specMap.get("potencia") || "";
  const integratedCockpit =
    handlebars.toLowerCase().includes("integrated") ||
    handlebars.toLowerCase().includes("roval rapide") ||
    handlebars.toLowerCase().includes("cockpit") ||
    lowerTitle.includes("s-works");

  const bikepackingMounts =
    discipline === "gravel" ||
    lowerTitle.includes("diverge") ||
    lowerTitle.includes("roubaix");

  // Peso oficial si está disponible
  let weightKg: number | null = null;
  let weightSizeReference: string | null = null;
  const weightRaw = specMap.get("weight") || specMap.get("peso") || "";
  const weightMatch = weightRaw.match(/(\d+\.?\d*)\s*kg/i);
  if (weightMatch) {
    weightKg = parseFloat(weightMatch[1]);
  }
  const weightSizeRaw = specMap.get("weight size") || specMap.get("talla") || "";
  if (weightSizeRaw) {
    weightSizeReference = weightSizeRaw.trim();
  }

  // 4. Precios (Regular / Sale / Special)
  let currentPriceEur = 0;
  let msrpEur = 0;

  // Prioridad 1: Buscar precios en SKUs con isBike: true
  const bikeSkuRegex = /"isBike":\s*true[\s\S]*?"prices":\s*\{([\s\S]*?)\}(?:,\s*"size")/g;
  let bSkuMatch;
  while ((bSkuMatch = bikeSkuRegex.exec(searchableText)) !== null) {
    const pChunk = bSkuMatch[1];
    const regMatch = pChunk.match(/"regular":\s*\{\s*"raw":\s*(\d+)/);
    const specMatch = pChunk.match(/"(?:special|sale)":\s*\{\s*"raw":\s*(\d+)/);
    if (regMatch) {
      const rVal = parseInt(regMatch[1], 10);
      if (rVal >= 500) {
        msrpEur = rVal;
        currentPriceEur = rVal;
        if (specMatch) {
          const sVal = parseInt(specMatch[1], 10);
          if (sVal > 0 && sVal < rVal) {
            currentPriceEur = sVal;
          }
        }
        break;
      }
    }
  }

  // Prioridad 2: Buscar cualquier "regular" con valor >= 500
  if (msrpEur === 0) {
    const allRegularMatches = [...searchableText.matchAll(/"regular":\s*\{\s*"raw":\s*(\d+)/g)];
    for (const rm of allRegularMatches) {
      const val = parseInt(rm[1], 10);
      if (val >= 500) {
        msrpEur = val;
        currentPriceEur = val;
        break;
      }
    }
  }

  // Prioridad 3: Ofertas o rebajas
  const saleMatch = searchableText.match(/"(?:special|sale)":\s*\{\s*"raw":\s*(\d+)/);
  if (saleMatch && msrpEur > 0) {
    const saleVal = parseInt(saleMatch[1], 10);
    if (saleVal >= 500 && saleVal < msrpEur) {
      currentPriceEur = saleVal;
    }
  }

  // 5. Geometría Oficial (Talla M de Referencia)
  const productGeosObj = extractJsonObject(searchableText, '"productGeos":');
  const sizeHeaders: string[] = productGeosObj?.geos?.sizeHeaders || [];
  const geoRows: any[] = productGeosObj?.geos?.rows || [];

  let targetSizeIndex = -1;
  let chosenSizeName = "M";

  if (sizeHeaders.length > 0) {
    const s54 = sizeHeaders.indexOf("54");
    const sM = sizeHeaders.indexOf("M");
    const sS3 = sizeHeaders.indexOf("S3");

    if (discipline === "mtb") {
      if (sM !== -1) {
        targetSizeIndex = sM;
        chosenSizeName = "M";
      } else if (sS3 !== -1) {
        targetSizeIndex = sS3;
        chosenSizeName = "S3";
      } else {
        targetSizeIndex = Math.floor(sizeHeaders.length / 2);
        chosenSizeName = sizeHeaders[targetSizeIndex];
      }
    } else {
      if (s54 !== -1) {
        targetSizeIndex = s54;
        chosenSizeName = "54";
      } else if (sM !== -1) {
        targetSizeIndex = sM;
        chosenSizeName = "M";
      } else {
        targetSizeIndex = Math.floor(sizeHeaders.length / 2);
        chosenSizeName = sizeHeaders[targetSizeIndex];
      }
    }
  }

  const geoValuesByName = new Map<string, string>();
  for (const r of geoRows) {
    if (r.name && Array.isArray(r.value) && targetSizeIndex >= 0 && targetSizeIndex < r.value.length) {
      geoValuesByName.set(r.name.toLowerCase(), r.value[targetSizeIndex]);
    }
  }

  const getGeoValue = (keywords: string[]): string => {
    for (const kw of keywords) {
      for (const [name, val] of geoValuesByName.entries()) {
        if (name.includes(kw)) {
          return val;
        }
      }
    }
    return "";
  };

  const stackMm =
    parseMeasurementMm(getGeoValue(["stack de cuadro", "stack"])) || (discipline === "mtb" ? 610 : 545);
  const reachMm =
    parseMeasurementMm(getGeoValue(["reach de cuadro", "reach", "reach (low)"])) || (discipline === "mtb" ? 455 : 385);
  const topTubeLengthMm = parseMeasurementMm(getGeoValue(["longitud tubo superior", "tubo superior, hrz", "tubo superior"]));
  const seatTubeLengthMm = parseMeasurementMm(getGeoValue(["long. tubo de sillín", "longitud tubo de sillín", "longitud tubo sillín"]));
  const headTubeLengthMm = parseMeasurementMm(getGeoValue(["longitud de pipa", "longitud pipa"]));
  
  let headTubeAngleDeg = parseAngleDeg(getGeoValue(["ángulo de pipa", "head tube angle", "head-tube angle"])) || (discipline === "mtb" ? 66.5 : 72.5);
  if (headTubeAngleDeg > 90 || headTubeAngleDeg < 55) headTubeAngleDeg = discipline === "mtb" ? 66.5 : 72.5;

  let seatTubeAngleDeg = parseAngleDeg(getGeoValue(["ángulo de tubo de sillín", "ángulo tubo sillín", "seat tube angle", "seat-tube angle"]));
  if (seatTubeAngleDeg && (seatTubeAngleDeg > 90 || seatTubeAngleDeg < 60)) {
    seatTubeAngleDeg = undefined;
  }

  const chainstayLengthMm =
    parseMeasurementMm(getGeoValue(["longitud de vaina", "longitud vaina", "chain-stay", "chainstay", "vaina"])) ||
    (discipline === "mtb" ? 435 : discipline === "gravel" ? 425 : 410);
  const wheelbaseMm = parseMeasurementMm(getGeoValue(["distancia entre ejes", "wheelbase"]));
  const bbDropMm = parseMeasurementMm(getGeoValue(["caída pedalier", "caida pedalier", "b-b drop", "bb drop"]));
  const standoverHeightMm = parseMeasurementMm(getGeoValue(["stand-over", "standover"]));

  const geometry: GeometrySpec = {
    stackMm,
    reachMm,
    stackReachRatio: Number((stackMm / reachMm).toFixed(2)),
    headTubeAngleDeg,
    seatTubeAngleDeg,
    topTubeLengthMm,
    seatTubeLengthMm,
    headTubeLengthMm,
    chainstayLengthMm,
    wheelbaseMm,
    bbDropMm,
    standoverHeightMm,
  };

  // 6. Imagen Oficial en Alta Resolución
  let imageUrl = "";
  const ogImgMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  if (ogImgMatch && ogImgMatch[1].startsWith("http")) {
    imageUrl = ogImgMatch[1];
  } else {
    const heroCodeMatch = searchableText.match(/"code":"([^"]+HERO[^"]*)"/);
    if (heroCodeMatch) {
      imageUrl = `https://assets.specialized.com/i/specialized/${heroCodeMatch[1]}?$scom-pdp-gallery-image$&fmt=webp`;
    }
  }

  // 7. Despiece Técnico Completo (DetailedSpecCategory[])
  const detailedSpecs: DetailedSpecCategory[] = [];
  for (const cat of rawSpecsCategories) {
    if (
      cat.name &&
      cat.specs &&
      cat.specs.length > 0 &&
      cat.name !== "Detalles del producto" &&
      cat.name !== "Product Details" &&
      cat.name !== "Peso" &&
      cat.name !== "Weight"
    ) {
      detailedSpecs.push({
        category: cleanHtmlEntities(cat.name).slice(0, 40),
        items: cat.specs.map((s: any) => ({
          label: cleanHtmlEntities(s.name || s.code || "Componente").slice(0, 50),
          value: cleanHtmlEntities(s.description || "").slice(0, 150),
        })),
      });
    }
  }

  // 8. Highlights
  const highlights: string[] = [];
  if (isElectronic) {
    highlights.push(`Transmisión electrónica inalámbrica de precisión (${groupsetName})`);
  }
  if (frameMaterial === "carbon") {
    highlights.push(`Cuadro de carbono de alto rendimiento (${frameDesc.split(",")[0] || "FACT Carbon"})`);
  }
  if (discipline === "gravel") {
    highlights.push(`Gran polivalencia gravel con paso de rueda de hasta ${maxTireClearanceMm} mm`);
  } else if (discipline === "road_race") {
    highlights.push(`Geometría pura de competición aero con relación peso/rigidez optimizada`);
  } else if (discipline === "road_endurance") {
    highlights.push(`Confort de larga distancia con absorción de irregularidades`);
  } else if (discipline === "mtb") {
    highlights.push(`Chasis MTB de máximo control y geometría progresiva`);
  }
  if (wheels) {
    highlights.push(`Ruedas ${wheels.split(",")[0]}`);
  }

  // ID / Slug único
  const slug = `specialized-${slugify(modelName)}-2026`;

  const bikeProduct: BikeProduct = {
    id: slug,
    brand: "Specialized",
    model: modelName.slice(0, 80),
    year: 2026,
    discipline,
    frameMaterial,
    forkMaterial,
    weightKg: weightKg || undefined,
    weightSizeReference: weightKg ? (weightSizeReference || chosenSizeName) : undefined,
    maxTireClearanceMm,
    groupset: groupsetSpec,
    brakes,
    wheels,
    tires,
    integratedCockpit,
    bikepackingMounts,
    currentPriceEur: currentPriceEur || 4999,
    msrpEur: msrpEur || currentPriceEur || 4999,
    geometry,
    imageUrl: imageUrl || "/images/placeholder-bike.jpg",
    officialImageUrl: imageUrl || "/images/placeholder-bike.jpg",
    officialUrl: originalUrl,
    highlights,
    detailedSpecs: detailedSpecs.length > 0 ? detailedSpecs : undefined,
  };

  return bikeProduct;
}
