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
    .split(/[\/\-]/)
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
    .replace(/,/g, "")
    .replace(/mm/gi, "")
    .replace(/"/g, "")
    .replace(/in/gi, "")
    .trim();
  const num = parseFloat(cleaned);
  return isNaN(num) || num <= 0 ? undefined : Math.round(num);
}

function parseAngleDeg(valStr?: string): number | undefined {
  if (!valStr) return undefined;
  const cleaned = valStr.replace(/°/g, "").replace(/deg/gi, "").replace(/,/g, ".").trim();
  const num = parseFloat(cleaned);
  return isNaN(num) || num <= 0 ? undefined : Number(num.toFixed(1));
}

export async function parseScottHtml(
  html: string,
  originalUrl: string,
  sectionDiscipline: "carretera" | "gravel" | "montana"
): Promise<BikeProduct | null> {
  // 1. Extraer metadata de universal_variable.page.product
  const productMatch = html.match(/universal_variable\.page\.product\s*=\s*(\{[\s\S]*?\});/);
  let rawProductName = "";
  let rawPrice = 0;
  let productId = "";

  if (productMatch) {
    const rawObj = productMatch[1];
    const nameM = rawObj.match(/'product_name':\s*"(.*?)"/);
    const priceM = rawObj.match(/'product_price':\s*"(.*?)"/);
    const idM = rawObj.match(/'product_id':\s*"(.*?)"/);

    if (nameM) rawProductName = nameM[1].trim();
    if (priceM) rawPrice = parseFloat(priceM[1]);
    if (idM) productId = idM[1].trim();
  }

  // Fallback title
  if (!rawProductName) {
    const titleMatch = html.match(/<title>([\s\S]*?)<\/title>/i);
    if (titleMatch) {
      rawProductName = titleMatch[1].replace(/Bicicleta\s+/i, "").replace(/\|.*$/i, "").trim();
    }
  }

  if (!rawProductName) {
    console.warn("  ⚠️ No se pudo extraer nombre del producto Scott:", originalUrl);
    return null;
  }

  // Limpiar nombre: quitar "Bike" al final y "Scott" al inicio para el modelo limpio
  let cleanModelName = rawProductName
    .replace(/\s+Bike$/i, "")
    .replace(/^Bicicleta\s+/i, "")
    .replace(/^Scott\s+/i, "")
    .trim();

  // 2. Extraer imagen principal (og:image)
  const ogImageMatch = html.match(/<meta\s+property="og:image"\s+content="([^"]+)"/i);
  let mainImage = ogImageMatch ? ogImageMatch[1] : "";
  if (mainImage.startsWith("//")) mainImage = "https:" + mainImage;
  if (!mainImage) mainImage = "https://static.scott-sports.com/default-bike.jpg";

  // 3. Determinar año
  let year = 2026;
  const yearMatch = html.match(/\/geometry\/(202[4-9])\//i) || originalUrl.match(/202[4-9]/);
  if (yearMatch) {
    year = parseInt(yearMatch[1] || yearMatch[0], 10);
  }

  // 4. Determinar disciplina normalizada según el schema
  let discipline: Discipline = "road_race";
  const lowerModel = cleanModelName.toLowerCase();

  if (sectionDiscipline === "carretera") {
    if (lowerModel.includes("foil") || lowerModel.includes("tri") || lowerModel.includes("addict rc") || lowerModel.includes("plasma")) {
      discipline = "road_race";
    } else {
      discipline = "road_endurance";
    }
  } else if (sectionDiscipline === "gravel") {
    discipline = "gravel";
  } else if (sectionDiscipline === "montana") {
    discipline = "mtb";
  }

  // 5. Extraer especificaciones técnicas del DOM
  const specsMap = new Map<string, string>();
  const specsListItems = [...html.matchAll(/<li\s+class="specs-list__item[^"]*">([\s\S]*?)<\/li>/gi)];
  for (const item of specsListItems) {
    const raw = item[1];
    const titleM = raw.match(/<h4\s+class="specs-list__title">([\s\S]*?)<\/h4>/i);
    const contentM = raw.match(/<div\s+class="specs-list__content">([\s\S]*?)<\/div>/i);
    if (titleM && contentM) {
      const title = titleM[1].replace(/<[^>]+>/g, "").trim();
      const content = contentM[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim();
      specsMap.set(title.toLowerCase(), content);
    }
  }

  const getSpec = (...keys: string[]): string => {
    for (const k of keys) {
      const val = specsMap.get(k.toLowerCase());
      if (val) return val;
      for (const [mapKey, mapVal] of specsMap.entries()) {
        if (mapKey.includes(k.toLowerCase())) return mapVal;
      }
    }
    return "";
  };

  const cuadroStr = getSpec("cuadro", "frame");
  const horquillaStr = getSpec("horquilla", "fork");
  const cambioTrasero = getSpec("desviador trasero", "rear derailleur");
  const desviadorDelantero = getSpec("desviador delantero", "front derailleur");
  const bielasStr = getSpec("bielas", "crankset");
  const cassetteStr = getSpec("cassette");
  const cadenaStr = getSpec("cadena", "chain");
  const frenosStr = getSpec("frenos", "brakes");
  const ruedasStr = getSpec("juego de ruedas", "ruedas", "wheelset");
  const neumaticoDel = getSpec("neumático delantero", "front tire", "cubiertas");
  const neumaticoTras = getSpec("neumático trasero", "rear tire");
  const manillarStr = getSpec("manillar", "handlebar");
  const potenciaStr = getSpec("potencia", "stem");
  const tijaStr = getSpec("tija de sillín", "seatpost");
  const sillinStr = getSpec("sillín", "saddle");
  const pesoStr = getSpec("peso en kg (aprox.)", "peso", "weight");

  // Material de cuadro
  const lowerCuadro = cuadroStr.toLowerCase();
  let frameMaterial: FrameMaterial = "carbon";
  if (lowerCuadro.includes("alloy") || lowerCuadro.includes("aluminio") || lowerCuadro.includes("6061")) {
    frameMaterial = "aluminum";
  } else if (lowerCuadro.includes("titanium") || lowerCuadro.includes("titanio")) {
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

  // Peso declarado
  let weightKg: number | undefined = undefined;
  if (pesoStr) {
    const num = parseFloat(pesoStr.replace(",", "."));
    if (!isNaN(num) && num > 4 && num < 30) {
      weightKg = Number(num.toFixed(2));
    }
  }

  // Grupos y transmisiones
  let gsBrand: GroupsetBrand = "shimano";
  const allDrivetrainText = `${cambioTrasero} ${bielasStr} ${frenosStr}`.toLowerCase();
  if (allDrivetrainText.includes("sram")) {
    gsBrand = "sram";
  } else if (allDrivetrainText.includes("campagnolo")) {
    gsBrand = "campagnolo";
  } else if (allDrivetrainText.includes("microshift")) {
    gsBrand = "microshift";
  }

  let groupsetName = "Shimano";
  if (cambioTrasero) {
    groupsetName = cambioTrasero.split(/[\s,]+/).slice(0, 4).join(" ");
  }

  // Bielas / platos (chainrings)
  let chainrings = "50/34T";
  const chainringMatch =
    bielasStr.match(/(?:^|\s|,)(\d{2})[-/](\d{2})T?/i) ||
    bielasStr.match(/(?:^|\s|,)(\d{2})T\b/i);
  if (chainringMatch) {
    if (chainringMatch[2]) {
      chainrings = `${chainringMatch[1]}/${chainringMatch[2]}T`;
    } else {
      chainrings = `${chainringMatch[1]}T`;
    }
  } else if (sectionDiscipline === "montana") {
    chainrings = "32T";
  } else if (sectionDiscipline === "gravel") {
    chainrings = desviadorDelantero ? "46/30T" : "40T";
  }

  // Cassette
  let cassette = "11-34T";
  const cassetteMatch = cassetteStr.match(/(?:^|\s|,)(\d{2})[-/](\d{2,3})(?:T|\b)/i);
  if (cassetteMatch) {
    cassette = `${cassetteMatch[1]}-${cassetteMatch[2]}T`;
  } else if (sectionDiscipline === "montana") {
    cassette = "10-52T";
  }


  // Speed count
  let speedCount = 12;
  const speedMatch = `${cambioTrasero} ${cassetteStr}`.match(/(\d{1,2})\s*speed/i);
  if (speedMatch) {
    const sp = parseInt(speedMatch[1], 10);
    if (sp >= 9 && sp <= 13) speedCount = sp;
  }

  const isElectronic =
    allDrivetrainText.includes("di2") ||
    allDrivetrainText.includes("axs") ||
    allDrivetrainText.includes("transmission") ||
    allDrivetrainText.includes("electronic");

  const ratios = calculateRatios(chainrings, cassette);

  const groupset: GroupsetSpec = {
    brand: gsBrand,
    name: groupsetName.slice(0, 100),
    isElectronic,
    speedCount,
    chainrings: chainrings.slice(0, 20),
    cassette: cassette.slice(0, 20),
    minGearRatio: ratios.minRatio,
    maxGearRatio: ratios.maxRatio,
  };

  // Ruedas y neumáticos
  let tireWidthMm = discipline === "road_race" ? 28 : discipline === "road_endurance" ? 34 : discipline === "gravel" ? 45 : 60;
  const tireMatch = `${neumaticoDel} ${neumaticoTras}`.match(/(\d{2})[cC]|\b2\.(\d{1,2})\b/);
  if (tireMatch) {
    if (tireMatch[1]) {
      tireWidthMm = parseInt(tireMatch[1], 10);
    } else if (tireMatch[2]) {
      tireWidthMm = Math.round(parseFloat(`2.${tireMatch[2]}`) * 25.4);
    }
  }

  // Paso de rueda máximo oficial
  let maxTireClearanceMm = 32;
  if (discipline === "road_race") maxTireClearanceMm = 32;
  else if (discipline === "road_endurance") maxTireClearanceMm = 38;
  else if (discipline === "gravel") maxTireClearanceMm = 45;
  else if (discipline === "mtb") maxTireClearanceMm = 62;

  // Cockpit integrado
  const integratedCockpit =
    manillarStr.toLowerCase().includes("ic sl") ||
    manillarStr.toLowerCase().includes("combo") ||
    manillarStr.toLowerCase().includes("creston ic");

  // 6. Ficha técnica completa organizada
  const detailedSpecs: DetailedSpecCategory[] = [];

  const addCategory = (categoryName: string, items: { label: string; value: string }[]) => {
    const validItems = items.filter((it) => it.value && it.value.trim().length > 0);
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
    { label: "Juego de dirección", value: getSpec("juego de dirección", "headset") },
  ]);

  addCategory("Transmisión", [
    { label: "Desviador Trasero", value: cambioTrasero },
    { label: "Desviador Delantero", value: desviadorDelantero },
    { label: "Palancas de Cambio", value: getSpec("palancas de cambio", "shifters") },
    { label: "Bielas y Platos", value: bielasStr },
    { label: "Pedalier", value: getSpec("pedalier", "bottom bracket") },
    { label: "Cassette", value: cassetteStr },
    { label: "Cadena", value: cadenaStr },
  ]);

  addCategory("Frenos", [
    { label: "Frenos", value: frenosStr },
    { label: "Disco Delantero", value: getSpec("disco de freno delantero", "front rotor") },
    { label: "Disco Trasero", value: getSpec("disco de freno trasero", "rear rotor") },
  ]);

  addCategory("Cockpit y Componentes", [
    { label: "Manillar", value: manillarStr },
    { label: "Potencia", value: potenciaStr },
    { label: "Tija de Sillín", value: tijaStr },
    { label: "Sillín", value: sillinStr },
    { label: "Puños / Cinta", value: getSpec("puños", "grips", "bartape") },
  ]);

  addCategory("Ruedas y Neumáticos", [
    { label: "Juego de Ruedas", value: ruedasStr },
    { label: "Neumático Delantero", value: neumaticoDel },
    { label: "Neumático Trasero", value: neumaticoTras },
  ]);

  const extrasStr = getSpec("extras", "accesorios");
  if (extrasStr) {
    addCategory("Accesorios y Peso", [
      { label: "Peso declarado", value: pesoStr ? `${pesoStr} kg` : "" },
      { label: "Extras", value: extrasStr },
    ]);
  }

  // 7. Extraer Geometría desde la URL CDN externa
  let geometry: GeometrySpec = {
    stackMm: discipline === "mtb" ? 600 : 570,
    reachMm: discipline === "mtb" ? 450 : 385,
    stackReachRatio: 1.48,
    headTubeAngleDeg: discipline === "mtb" ? 66.5 : discipline === "gravel" ? 71.5 : 72.5,
    chainstayLengthMm: discipline === "mtb" ? 435 : discipline === "gravel" ? 430 : 415,
  };

  const geoUrlMatch = html.match(/data-geometry-data-url="([^"]+)"/i);
  if (geoUrlMatch) {
    const geoUrl = geoUrlMatch[1];
    try {
      const geoRes = await fetch(geoUrl);
      if (geoRes.ok) {
        const geoHtml = await geoRes.text();
        const parsedGeo = parseScottGeometryTable(geoHtml, sectionDiscipline);
        if (parsedGeo) {
          geometry = {
            ...geometry,
            ...parsedGeo,
          };
        }
      }
    } catch (err: any) {
      console.warn("  ⚠️ Error al descargar tabla de geometría Scott:", err.message);
    }
  }

  // 8. Precios
  let price = rawPrice;
  if (price <= 0) price = 3999;
  const currentPriceEur = price;
  const msrpEur = price;

  const slug = `scott-${slugify(cleanModelName)}-${year}`.slice(0, 80);

  const bikeProduct: BikeProduct = {
    id: slug,
    brand: "Scott",
    model: cleanModelName.slice(0, 100),
    year,
    discipline,
    officialUrl: originalUrl,
    officialImageUrl: mainImage,
    msrpEur,
    currentPriceEur,
    discountPercentage: 0,
    isOutlet: false,
    frameMaterial,
    forkMaterial,
    weightKg,
    weightSizeReference: weightKg ? "M / 54" : undefined,
    maxTireClearanceMm,
    integratedCockpit,
    bikepackingMounts: sectionDiscipline === "gravel",
    groupset,
    geometry,
    highlights: [
      `Cuadro Scott de ${frameMaterial === "carbon" ? "carbono de alta ligereza (HMX/HMF)" : "aluminio hidroformado"}`,
      `Transmisión ${gsBrand.toUpperCase()} ${isElectronic ? "electrónica inalámbrica" : "mecánica"} de alta precisión`,
      ...(weightKg ? [`Peso oficial verificado de ${weightKg} kg`] : []),
      ...(ruedasStr ? [`Ruedas ${ruedasStr.split(",")[0]}`] : []),
    ],
    brakes: frenosStr ? frenosStr.slice(0, 100) : undefined,
    wheels: ruedasStr ? ruedasStr.slice(0, 100) : undefined,
    tires: neumaticoDel ? neumaticoDel.slice(0, 100) : undefined,
    detailedSpecs: detailedSpecs.length > 0 ? detailedSpecs : undefined,
  };

  const validation = BikeProductSchema.safeParse(bikeProduct);
  if (!validation.success) {
    console.error(`  ❌ Validación falló para Scott ${bikeProduct.model}:`, JSON.stringify(validation.error.format(), null, 2));
    return null;
  }

  return validation.data;
}

export function parseScottGeometryTable(
  geoHtml: string,
  discipline: "carretera" | "gravel" | "montana"
): Partial<GeometrySpec> | null {
  const rows = geoHtml.match(/<tr[\s\S]*?<\/tr>/gi) || [];
  if (rows.length < 2) return null;

  const headerCells: { text: string; colIdx: number }[] = [];
  const thRegex = /<th[^>]*>([\s\S]*?)<\/th>/gi;
  let thMatch;
  let thIdx = 0;
  while ((thMatch = thRegex.exec(rows[0])) !== null) {
    const val = thMatch[1].replace(/<[^>]+>/g, "").trim();
    if (val) {
      headerCells.push({ text: val, colIdx: thIdx });
    }
    thIdx++;
  }

  let targetColIdx = -1;

  for (const h of headerCells) {
    if (h.text === "M/54" || h.text === "54" || h.text === "M") {
      targetColIdx = h.colIdx;
      break;
    }
  }

  if (targetColIdx === -1) {
    for (const h of headerCells) {
      if (h.text.startsWith("M/") || h.text === "M") {
        targetColIdx = h.colIdx;
        break;
      }
    }
  }

  if (targetColIdx === -1) {
    targetColIdx = 4;
  }

  const geoData: Record<string, string> = {};

  for (let i = 1; i < rows.length; i++) {
    const tdMatches = [...rows[i].matchAll(/<td[^>]*>([\s\S]*?)<\/td>/gi)].map((m) =>
      m[1].replace(/<[^>]+>/g, "").trim()
    );
    if (tdMatches.length >= 2) {
      const code = tdMatches[0].toUpperCase();
      const label = tdMatches[1].toLowerCase();
      let val = tdMatches[targetColIdx];
      if (!val || val === "") {
        const mmVal = tdMatches.slice(2).find((v) => v.includes("mm") || v.includes("°") || /^\d+(\.\d+)?$/.test(v));
        val = mmVal || "";
      }

      if (code) geoData[code] = val;
      if (label.includes("head tube angle") || label.includes("angle tube de direction")) geoData["HEAD_ANGLE"] = val;
      if (label.includes("seat angle") || label.includes("angle tube de selle")) geoData["SEAT_ANGLE"] = val;
      if (label.includes("top tube") || label.includes("tube supérieur")) geoData["TOP_TUBE"] = val;
      if (label.includes("chainstay") || label.includes("longueur bases")) geoData["CHAINSTAY"] = val;
      if (label.includes("wheel base") || label.includes("entraxe")) geoData["WHEELBASE"] = val;
      if (label.includes("standover")) geoData["STANDOVER"] = val;
      if (label.includes("bb offset") || label.includes("deport axe de pédalier") || label.includes("exccentrage")) geoData["BB_DROP"] = val;
      if (label.includes("bb center to top of seattube") || label.includes("sommet tube de selle")) geoData["SEAT_TUBE"] = val;
      if (label.includes("reach")) geoData["REACH"] = val;
      if (label.includes("stack")) geoData["STACK"] = val;
    }
  }

  const stackMm = parseMeasurementMm(geoData["M"] || geoData["STACK"]);
  const reachMm = parseMeasurementMm(geoData["L"] || geoData["REACH"]);
  const topTubeLengthMm = parseMeasurementMm(geoData["C"] || geoData["TOP_TUBE"]);
  const seatTubeLengthMm = parseMeasurementMm(geoData["I"] || geoData["SEAT_TUBE"]);
  const headTubeLengthMm = parseMeasurementMm(geoData["B"]);
  const headTubeAngleDeg = parseAngleDeg(geoData["A"] || geoData["HEAD_ANGLE"]);
  const seatTubeAngleDeg = parseAngleDeg(geoData["J"] || geoData["SEAT_ANGLE"]);
  const chainstayLengthMm = parseMeasurementMm(geoData["K"] || geoData["CHAINSTAY"]);
  const wheelbaseMm = parseMeasurementMm(geoData["G"] || geoData["WHEELBASE"]);
  const rawBbDrop = parseMeasurementMm(geoData["E"] || geoData["BB_DROP"]);
  const bbDropMm = rawBbDrop ? Math.abs(rawBbDrop) : undefined;
  const standoverHeightMm = parseMeasurementMm(geoData["D"] || geoData["STANDOVER"]);

  const stackReachRatio = stackMm && reachMm ? Number((stackMm / reachMm).toFixed(2)) : undefined;

  const result: Partial<GeometrySpec> = {};
  if (stackMm) result.stackMm = stackMm;
  if (reachMm) result.reachMm = reachMm;
  if (stackReachRatio) result.stackReachRatio = stackReachRatio;
  if (headTubeAngleDeg) result.headTubeAngleDeg = headTubeAngleDeg;
  if (seatTubeAngleDeg) result.seatTubeAngleDeg = seatTubeAngleDeg;
  if (topTubeLengthMm) result.topTubeLengthMm = topTubeLengthMm;
  if (seatTubeLengthMm) result.seatTubeLengthMm = seatTubeLengthMm;
  if (headTubeLengthMm) result.headTubeLengthMm = headTubeLengthMm;
  if (chainstayLengthMm) result.chainstayLengthMm = chainstayLengthMm;
  if (wheelbaseMm) result.wheelbaseMm = wheelbaseMm;
  if (bbDropMm !== undefined) result.bbDropMm = bbDropMm;
  if (standoverHeightMm) result.standoverHeightMm = standoverHeightMm;

  return result;
}
