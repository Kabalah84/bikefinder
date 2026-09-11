import {
  BikeProduct,
  BikeProductSchema,
  DetailedSpecCategory,
  Discipline,
  ForkMaterial,
  FrameMaterial,
  GeometrySpec,
  GroupsetBrand,
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

function parseMeasurementMm(valStr?: string): number | undefined {
  if (!valStr) return undefined;
  const cleaned = valStr
    .replace(/,/g, ".")
    .replace(/mm/gi, "")
    .replace(/"/g, "")
    .replace(/in/gi, "")
    .trim();
  const num = parseFloat(cleaned);
  return isNaN(num) || num <= 0 ? undefined : Math.round(num);
}

function parseAngleDeg(valStr?: string): number | undefined {
  if (!valStr) return undefined;
  const cleaned = valStr
    .replace(/,/g, ".")
    .replace(/°/g, "")
    .replace(/deg/gi, "")
    .trim();
  const num = parseFloat(cleaned);
  return isNaN(num) || num <= 0 || num > 90 ? undefined : Number(num.toFixed(1));
}

export async function parseBhHtml(
  html: string,
  originalUrl: string,
  sectionDiscipline: "carretera" | "gravel" | "montana"
): Promise<BikeProduct | null> {
  const brand = "BH";

  // 1. Extraer nombre del modelo
  let rawTitle = "";
  const ogTitleMatch = html.match(/<meta\s+(?:property|name)=["']?og:title["']?\s+content=["']?([^"'>]+)/i);
  if (ogTitleMatch) {
    rawTitle = ogTitleMatch[1];
  } else {
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) rawTitle = h1Match[1].replace(/<[^>]+>/g, "").trim();
  }

  if (!rawTitle) {
    // Extraer de la URL
    const slug = originalUrl.split("/").filter(Boolean).pop()?.split("?")[0] || "";
    rawTitle = slug.replace(/-[a-z0-9]+$/, "").replace(/-/g, " ").toUpperCase();
  }

  let cleanModelName = rawTitle
    .replace(/\s*BH\s*Bikes.*$/i, "")
    .replace(/^Bicicleta\s+BH\s+/i, "")
    .replace(/^BH\s+/i, "")
    .trim();

  if (!cleanModelName || cleanModelName.length < 2) {
    const slug = originalUrl.split("/").filter(Boolean).pop()?.split("?")[0] || "";
    cleanModelName = slug.replace(/-[a-z0-9]+$/, "").replace(/-/g, " ");
  }

  // 2. Extraer año
  let year = 2026;
  const yearMatch = originalUrl.match(/(202[3-7])/);
  if (yearMatch) year = parseInt(yearMatch[1], 10);

  // 3. Extraer imagen principal
  let mainImage = "";
  const ogImgMatch = html.match(/<meta\s+(?:property|name)=["']?og:image["']?\s+content=["']?([^"'>\s]+)/i) ||
                     html.match(/<meta\s+(?:property|name)=["']?image["']?\s+content=["']?([^"'>\s]+)/i);
  if (ogImgMatch) mainImage = ogImgMatch[1].trim();
  if (mainImage.startsWith("//")) mainImage = "https:" + mainImage;
  if (!mainImage || !mainImage.startsWith("http")) {
    mainImage = "https://bhbikes.b-cdn.net/default-bh.jpg";
  }

  // 4. Extraer precios
  let currentPrice = 0;
  let msrp = 0;

  // new_price / old_price
  const newPriceMatch = html.match(/class=["']?new_price["']?>\s*([0-9\.\,]+)/i);
  const oldPriceMatch = html.match(/class=["']?old_price["']?>[\s\S]*?([0-9\.\,]+)\s*€/i);

  if (oldPriceMatch) {
    msrp = Math.round(parseFloat(oldPriceMatch[1].replace(/\./g, "").replace(",", ".")));
  }
  if (newPriceMatch) {
    currentPrice = Math.round(parseFloat(newPriceMatch[1].replace(/\./g, "").replace(",", ".")));
  }

  if (currentPrice > 0 && (!msrp || msrp < currentPrice)) {
    msrp = currentPrice;
  }
  if (!currentPrice || currentPrice <= 0) {
    currentPrice = msrp > 0 ? msrp : 2999;
  }
  if (!msrp || msrp <= 0) {
    msrp = currentPrice;
  }

  const discountPercentage = msrp > currentPrice ? Math.round(((msrp - currentPrice) / msrp) * 100) : 0;
  const isOutlet = discountPercentage > 0;

  // 5. Determinar disciplina
  let discipline: Discipline = "road_race";
  const lowerUrl = originalUrl.toLowerCase();
  const lowerModel = cleanModelName.toLowerCase();

  if (sectionDiscipline === "carretera") {
    if (lowerModel.includes("aerolight") || lowerModel.includes("aero-tt") || lowerModel.includes("ultralight")) {
      discipline = "road_race";
    } else if (lowerModel.includes("rs1") || lowerModel.includes("sl1")) {
      discipline = "road_endurance";
    } else {
      discipline = "road_race";
    }
  } else if (sectionDiscipline === "gravel") {
    discipline = "gravel";
  } else if (sectionDiscipline === "montana") {
    discipline = "mtb";
  }

  // 6. Extraer especificaciones del DOM
  const specsMap = new Map<string, string>();
  const specItems = [...html.matchAll(/<p\s+class=["']name["']>([\s\S]*?)<\/p>\s*<div[^>]*>([\s\S]*?)<\/div>/gi)];
  for (const item of specItems) {
    const label = item[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().toLowerCase();
    const value = item[2].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
    if (label && value) {
      specsMap.set(label, value);
    }
  }

  const getSpec = (...keys: string[]): string => {
    for (const k of keys) {
      const direct = specsMap.get(k.toLowerCase());
      if (direct) return direct;
      for (const [mapKey, mapVal] of specsMap.entries()) {
        if (mapKey.includes(k.toLowerCase())) return mapVal;
      }
    }
    return "";
  };

  const cuadroStr = getSpec("cuadro");
  const horquillaStr = getSpec("horquilla");
  const manetasStr = getSpec("manetas cambio", "manetas");
  const cambioTras = getSpec("cambio trasero", "cambio");
  const desviadorDel = getSpec("desviador");
  const bielasStr = getSpec("plato biela", "pedalier", "bielas");
  const pedalierStr = getSpec("pedalier");
  const cassetteStr = getSpec("cassette", "piñón");
  const cadenaStr = getSpec("cadena");
  const frenoDelStr = getSpec("freno delantero", "frenos");
  const frenoTrasStr = getSpec("freno trasero");
  const ruedasStr = getSpec("set ruedas", "ruedas", "llantas");
  const cubiertasStr = getSpec("cubiertas", "neumáticos");
  const sillinStr = getSpec("sillin", "sillín");
  const tijaStr = getSpec("tija");
  const manillarStr = getSpec("manillar");
  const potenciaStr = getSpec("potencia");

  // Material de cuadro
  const lowerCuadro = (cuadroStr + " " + cleanModelName).toLowerCase();
  let frameMaterial: FrameMaterial = "carbon";
  if (lowerCuadro.includes("alloy") || lowerCuadro.includes("aluminio") || lowerCuadro.includes("hydro")) {
    frameMaterial = "aluminum";
  } else if (lowerCuadro.includes("titanium")) {
    frameMaterial = "titanium";
  } else if (lowerCuadro.includes("steel") || lowerCuadro.includes("acero")) {
    frameMaterial = "steel";
  }

  // Material de horquilla
  let forkMaterial: ForkMaterial = "carbon";
  if (sectionDiscipline === "montana") {
    forkMaterial = "suspension";
  } else if (horquillaStr.toLowerCase().includes("alloy") || horquillaStr.toLowerCase().includes("aluminio")) {
    forkMaterial = "aluminum";
  }

  // Transmisión y Grupo
  const allGroupsetText = `${cleanModelName} ${manetasStr} ${cambioTras} ${desviadorDel} ${bielasStr}`.toLowerCase();
  let groupsetBrand: GroupsetBrand = "shimano";
  if (allGroupsetText.includes("sram") || allGroupsetText.includes("axs") || allGroupsetText.includes("eagle") || allGroupsetText.includes("force") || allGroupsetText.includes("rival") || allGroupsetText.includes("apex")) {
    groupsetBrand = "sram";
  } else if (allGroupsetText.includes("campagnolo") || allGroupsetText.includes("ekar")) {
    groupsetBrand = "campagnolo";
  } else if (allGroupsetText.includes("microshift")) {
    groupsetBrand = "microshift";
  }

  const isElectronic =
    allGroupsetText.includes("di2") ||
    allGroupsetText.includes("axs") ||
    allGroupsetText.includes("transmission") ||
    allGroupsetText.includes("wireless");

  let groupsetName = "";
  if (cambioTras) {
    groupsetName = cambioTras.replace(/,.*$/, "").trim();
  } else if (manetasStr) {
    groupsetName = manetasStr.replace(/,.*$/, "").trim();
  } else {
    groupsetName = "Shimano 105";
  }
  if (groupsetName.length > 50) groupsetName = groupsetName.slice(0, 50);

  // Desarrollos
  let chainrings = discipline === "mtb" ? "34T" : discipline === "gravel" ? "40T" : "50/34T";
  const ringsMatch = bielasStr.match(/(\d\d\/\d\d)/) || bielasStr.match(/(\d\d)t?\b/i);
  if (ringsMatch) {
    chainrings = ringsMatch[1].endsWith("T") ? ringsMatch[1] : `${ringsMatch[1]}T`;
  }

  let cassette = discipline === "mtb" ? "10-51T" : discipline === "gravel" ? "10-44T" : "11-34T";
  const cogsMatch = cassetteStr.match(/(\d\d[\/\-xX]\d\d)/i) || cassetteStr.match(/(\d\d\-\d\d)t?/i);
  if (cogsMatch) {
    cassette = cogsMatch[1].replace(/[\/xX]/g, "-") + "T";
  }

  const speedCount =
    cassetteStr.includes("12") || allGroupsetText.includes("12s") || allGroupsetText.includes("12sp")
      ? 12
      : cassetteStr.includes("11") || allGroupsetText.includes("11s") || allGroupsetText.includes("11sp")
      ? 11
      : cassetteStr.includes("10")
      ? 10
      : 12;

  const { minRatio, maxRatio } = calculateRatios(chainrings, cassette);

  const groupsetSpec: GroupsetSpec = {
    brand: groupsetBrand,
    name: groupsetName.slice(0, 100),
    isElectronic,
    speedCount,
    chainrings: chainrings.slice(0, 20),
    cassette: cassette.slice(0, 20),
    minGearRatio: minRatio,
    maxGearRatio: maxRatio,
  };

  // Paso de rueda
  let maxClearance = discipline === "gravel" ? 45 : discipline === "mtb" ? 62 : 32;
  const clearanceMatch = (cuadroStr + " " + cubiertasStr).match(/(\d\d)\s*mm/i);
  if (clearanceMatch) {
    const cl = parseInt(clearanceMatch[1], 10);
    if (cl >= 25 && cl <= 70) maxClearance = cl;
  }

  // Cockpit integrado
  const integratedCockpit =
    manillarStr.toLowerCase().includes("acr") ||
    manillarStr.toLowerCase().includes("metron") ||
    lowerModel.includes("aerolight") ||
    lowerModel.includes("ultralight");

  // Roscas bikepacking
  const bikepackingMounts = discipline === "gravel";

  // 7. Geometría
  let geometrySpec: GeometrySpec = {
    stackMm: discipline === "gravel" ? 580 : discipline === "mtb" ? 610 : 542,
    reachMm: discipline === "gravel" ? 385 : discipline === "mtb" ? 440 : 381,
    stackReachRatio: discipline === "gravel" ? 1.51 : discipline === "mtb" ? 1.39 : 1.42,
    headTubeAngleDeg: discipline === "gravel" ? 71.0 : discipline === "mtb" ? 68.0 : 72.8,
    chainstayLengthMm: discipline === "gravel" ? 425 : discipline === "mtb" ? 430 : 410,
  };

  const geomTableMatch = html.match(/<table[^>]*class=["'][^"']*c-geometry-info[^"']*["'][\s\S]*?<\/table>/i);
  if (geomTableMatch) {
    const t = geomTableMatch[0];
    const sizes = [...t.matchAll(/<th[^>]*class=["'][^"']*o-ficha-block-text[^"']*["'][^>]*>([\s\S]*?)<\/th>/gi)].map((m) =>
      m[1].trim().toUpperCase()
    );

    let refColIdx = sizes.findIndex((s) => s === "MD" || s === "M");
    if (refColIdx === -1) refColIdx = sizes.findIndex((s) => s === "SM" || s === "S");
    if (refColIdx === -1 && sizes.length > 0) refColIdx = Math.floor(sizes.length / 2);

    if (refColIdx >= 0) {
      const rows = [...t.matchAll(/<tr[^>]*>([\s\S]*?)<\/tr>/gi)];
      const geomVals: Record<string, string> = {};

      for (const row of rows) {
        const rowText = row[1];
        const tds = [...rowText.matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) =>
          m[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim()
        );
        if (tds.length >= 2) {
          const rowName = tds[0].toLowerCase();
          // El valor en refColIdx está en tds[refColIdx + 1] o similar
          const colValue = tds[refColIdx + 1] || tds[refColIdx];
          if (colValue) geomVals[rowName] = colValue;
        }
      }

      const getGeomVal = (...queries: string[]): string | undefined => {
        for (const q of queries) {
          for (const [k, v] of Object.entries(geomVals)) {
            if (k.includes(q.toLowerCase())) return v;
          }
        }
        return undefined;
      };

      const parsedStack = parseMeasurementMm(getGeomVal("stack"));
      const parsedReach = parseMeasurementMm(getGeomVal("reach"));
      const parsedHta = parseAngleDeg(getGeomVal("a2 - ht angle", "ht angle", "head tube angle"));
      const parsedSta = parseAngleDeg(getGeomVal("a1 - st angle", "st angle", "seat tube angle"));
      const parsedChainstay = parseMeasurementMm(getGeomVal("h6 - chainstay", "chainstay"));
      const parsedTopTube = parseMeasurementMm(getGeomVal("h4 - tt length", "tt length", "top tube"));
      const parsedSeatTube = parseMeasurementMm(getGeomVal("h1 - st length", "st length", "seat tube"));
      const parsedHeadTube = parseMeasurementMm(getGeomVal("h2 - ht length", "ht length"));
      const parsedWheelbase = parseMeasurementMm(getGeomVal("h7 - wheel base", "wheel base"));
      const parsedBbDrop = parseMeasurementMm(getGeomVal("h8 - bb drop", "bb drop"));

      if (parsedStack && parsedReach) {
        geometrySpec = {
          stackMm: parsedStack,
          reachMm: parsedReach,
          stackReachRatio: Number((parsedStack / parsedReach).toFixed(2)),
          headTubeAngleDeg: parsedHta || geometrySpec.headTubeAngleDeg,
          chainstayLengthMm: parsedChainstay || geometrySpec.chainstayLengthMm,
          topTubeLengthMm: parsedTopTube,
          seatTubeLengthMm: parsedSeatTube,
          headTubeLengthMm: parsedHeadTube,
          seatTubeAngleDeg: parsedSta,
          wheelbaseMm: parsedWheelbase,
          bbDropMm: parsedBbDrop,
        };
      }
    }
  }

  // 8. DetailedSpecs
  const detailedSpecs: DetailedSpecCategory[] = [];
  const addCategory = (categoryName: string, items: { label: string; value: string }[]) => {
    const validItems = items.filter((it) => it.value && it.value.trim().length > 0 && it.value !== "N/A");
    if (validItems.length > 0) {
      detailedSpecs.push({
        category: categoryName.slice(0, 100),
        items: validItems.map((it) => ({
          label: it.label.slice(0, 100),
          value: it.value.slice(0, 300),
        })),
      });
    }
  };

  addCategory("Cuadro y Horquilla", [
    { label: "Cuadro", value: cuadroStr },
    { label: "Horquilla", value: horquillaStr },
  ]);

  addCategory("Transmisión", [
    { label: "Cambio Trasero", value: cambioTras },
    { label: "Desviador Delantero", value: desviadorDel },
    { label: "Manetas de Cambio", value: manetasStr },
    { label: "Platos y Bielas", value: bielasStr },
    { label: "Cassette", value: cassetteStr },
    { label: "Cadena", value: cadenaStr },
    { label: "Pedalier", value: pedalierStr },
  ]);

  addCategory("Frenos", [
    { label: "Freno Delantero", value: frenoDelStr },
    { label: "Freno Trasero", value: frenoTrasStr },
  ]);

  addCategory("Ruedas y Neumáticos", [
    { label: "Ruedas", value: ruedasStr },
    { label: "Cubiertas", value: cubiertasStr },
  ]);

  addCategory("Componentes", [
    { label: "Manillar", value: manillarStr },
    { label: "Potencia", value: potenciaStr },
    { label: "Tija", value: tijaStr },
    { label: "Sillín", value: sillinStr },
  ]);

  const highlights = [
    `Cuadro oficial BH ${frameMaterial.toUpperCase()}`,
    `Grupo ${groupsetName} (${speedCount}v)`,
    `Paso de rueda hasta ${maxClearance} mm`,
  ];
  if (isElectronic) highlights.push("Cambio electrónico Di2 / AXS");
  if (integratedCockpit) highlights.push("Cockpit aerodinámico integrado ACR");

  const idSlug = slugify(`bh-${cleanModelName}-${year}`);

  return {
    id: idSlug,
    brand: "BH",
    model: cleanModelName.slice(0, 100),
    year,
    discipline,
    officialUrl: originalUrl,
    officialImageUrl: mainImage,
    msrpEur: msrp,
    currentPriceEur: currentPrice,
    discountPercentage,
    isOutlet,
    frameMaterial,
    forkMaterial,
    maxTireClearanceMm: maxClearance,
    integratedCockpit,
    bikepackingMounts,
    groupset: groupsetSpec,
    geometry: geometrySpec,
    description: `Bicicleta oficial BH ${cleanModelName} (${year}) de categoría ${discipline}. Diseñada por BH Bikes con cuadro ${frameMaterial} y montaje oficial ${groupsetName}.`.slice(
      0,
      1000
    ),
    highlights,
    brakes: (frenoDelStr || "Frenos de disco hidráulicos").slice(0, 100),
    wheels: (ruedasStr || "Ruedas Tubeless").slice(0, 100),
    tires: (cubiertasStr || "Cubiertas Tubeless").slice(0, 100),
    detailedSpecs: detailedSpecs.length > 0 ? detailedSpecs : undefined,
  };
}
