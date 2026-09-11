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
    .replace(/&#176;/g, "")
    .replace(/°/g, "")
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
    .replace(/&#176;/g, "")
    .replace(/°/g, "")
    .replace(/deg/gi, "")
    .trim();
  const num = parseFloat(cleaned);
  return isNaN(num) || num <= 0 || num > 90 ? undefined : Number(num.toFixed(1));
}

export async function parseGiantLivHtml(
  html: string,
  originalUrl: string,
  sectionDiscipline: "carretera" | "gravel" | "montana"
): Promise<BikeProduct | null> {
  const isLiv = originalUrl.toLowerCase().includes("liv-cycling.com");
  const brand = isLiv ? "Liv" : "Giant";

  // 1. Extraer nombre del modelo
  let rawTitle = "";
  const ogTitleMatch = html.match(/<meta\s+property=["']?og:title["']?\s+content=["']?([^"'>]+)/i);
  if (ogTitleMatch) {
    rawTitle = ogTitleMatch[1];
  } else {
    const h1Match = html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i);
    if (h1Match) rawTitle = h1Match[1].replace(/<[^>]+>/g, "").trim();
  }

  if (!rawTitle) {
    console.warn("  ⚠️ No se pudo extraer título para:", originalUrl);
    return null;
  }

  // Extraer año si está en el título (ej. "Defy Advanced 2 (2026)") o en la URL (ej. "propel-advanced-1-2027")
  let year = 2025;
  const yearInTitle = rawTitle.match(/\((202[3-9])\)/);
  const yearInUrl = originalUrl.match(/(202[3-9])/);
  if (yearInTitle) {
    year = parseInt(yearInTitle[1], 10);
  } else if (yearInUrl) {
    year = parseInt(yearInUrl[1], 10);
  }

  // Nombre limpio del modelo
  let cleanModelName = rawTitle
    .replace(/\s*\|\s*.*$/i, "") // quitar "| Endurance Bici | Giant Bicycles..."
    .replace(/\(202[3-9]\)/g, "")
    .replace(/^Bicicleta\s+/i, "")
    .replace(/^Giant\s+/i, "")
    .replace(/^Liv\s+/i, "")
    .replace(/&#241;/g, "ñ")
    .trim();

  // Si cleanModelName quedó vacío, extraer del slug de la URL
  if (!cleanModelName || cleanModelName.length < 2) {
    const urlParts = originalUrl.split("/").filter(Boolean);
    cleanModelName = urlParts[urlParts.length - 1]
      .replace(/-202[3-9]/, "")
      .replace(/-/g, " ")
      .split(" ")
      .map((w) => w.charAt(0).toUpperCase() + w.slice(1))
      .join(" ");
  }

  // 2. Extraer imagen principal
  let mainImage = "";
  const ogImgMatch = html.match(/property=["']?og:image["']?\s+content=["']?([^"'\s>]+)/i) ||
                     html.match(/content=["']?([^"'\s>]+)["']?\s+property=["']?og:image/i);
  if (ogImgMatch) {
    mainImage = ogImgMatch[1].trim();
  }
  if (mainImage.startsWith("//")) mainImage = "https:" + mainImage;
  if (!mainImage || !mainImage.startsWith("http")) {
    mainImage = isLiv
      ? "https://images2.giant-bicycles.com/default-liv.jpg"
      : "https://images2.giant-bicycles.com/default-giant.jpg";
  }

  // 3. Extraer precios
  let currentPrice = 0;
  let msrp = 0;

  // product:price:amount
  const priceMetaMatch = html.match(/property=["']?product:price:amount["']?\s+content=["']?\s*([0-9\.]+)/i);
  if (priceMetaMatch) {
    currentPrice = Math.round(parseFloat(priceMetaMatch[1]));
  }

  // Si no está en meta, buscar en span class=currentprice
  if (!currentPrice || isNaN(currentPrice)) {
    const spanPrice = html.match(/class=["']?currentprice["']?>\s*([0-9\.\,]+)/i);
    if (spanPrice) {
      currentPrice = Math.round(parseFloat(spanPrice[1].replace(/\./g, "").replace(",", ".")));
    }
  }

  // Buscar MSRP / PVP original si hay descuento
  const msrpMatch = html.match(/(?:PVP|Precio recomendado|originalprice)[^0-9]*([0-9\.\,]+)\s*€/i) ||
                    html.match(/<span\s+class=["']?omnibus-mode["']?>\s*PVP\s*([0-9\.\,]+)/i);
  if (msrpMatch) {
    const parsedMsrp = Math.round(parseFloat(msrpMatch[1].replace(/\./g, "").replace(",", ".")));
    if (parsedMsrp >= currentPrice) {
      msrp = parsedMsrp;
    }
  }

  if (!msrp || msrp < currentPrice) {
    msrp = currentPrice > 0 ? currentPrice : 2999;
  }
  if (!currentPrice || currentPrice <= 0) {
    currentPrice = msrp;
  }

  const discountPercentage = msrp > currentPrice ? Math.round(((msrp - currentPrice) / msrp) * 100) : 0;
  const isOutlet = discountPercentage > 0;

  // 4. Determinar disciplina
  let discipline: Discipline = "road_race";
  const lowerUrl = originalUrl.toLowerCase();
  const lowerModel = cleanModelName.toLowerCase();

  if (sectionDiscipline === "carretera") {
    if (
      lowerModel.includes("propel") ||
      lowerModel.includes("enviliv") ||
      lowerModel.includes("trinity") ||
      lowerModel.includes("avow") ||
      lowerModel.includes("tcr") ||
      lowerModel.includes("langma")
    ) {
      discipline = "road_race";
    } else {
      discipline = "road_endurance";
    }
  } else if (sectionDiscipline === "gravel") {
    if (lowerModel.includes("roam") || lowerModel.includes("rove")) {
      discipline = "all_road";
    } else {
      discipline = "gravel";
    }
  } else if (sectionDiscipline === "montana") {
    discipline = "mtb";
  }

  // 5. Extraer especificaciones técnicas (DataRows)
  const specsMap = new Map<string, string>();
  const datarows = [...html.matchAll(/<li\s+class=["']?datarow["']?>[\s\S]*?<div\s+class=["']?label["']?>([\s\S]*?)<\/div>[\s\S]*?<div\s+class=["']?value["']?>([\s\S]*?)<\/div>[\s\S]*?<\/li>/gi)];
  for (const row of datarows) {
    const label = row[1].replace(/<[^>]+>/g, "").replace(/\s+/g, " ").trim().toLowerCase();
    const value = row[2]
      .replace(/<[^>]+>/g, "")
      .replace(/&#241;/g, "ñ")
      .replace(/&#237;/g, "í")
      .replace(/&#243;/g, "ó")
      .replace(/&#225;/g, "á")
      .replace(/&#233;/g, "é")
      .replace(/&amp;/g, "&")
      .replace(/\s+/g, " ")
      .trim();
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
  const amortiguadorStr = getSpec("amortiguador");
  const manillarStr = getSpec("manillar");
  const potenciaStr = getSpec("potencia");
  const tijaStr = getSpec("tija de sillín", "tija");
  const sillinStr = getSpec("sillín");
  const manetasStr = getSpec("manetas de cambio", "manetas");
  const desviadorDel = getSpec("desviador");
  const cambioTras = getSpec("cambio trasero", "cambio");
  const frenosStr = getSpec("frenos");
  const palancasFrenoStr = getSpec("palancas de frenos");
  const cassetteStr = getSpec("casette", "cassette");
  const cadenaStr = getSpec("cadena");
  const bielasStr = getSpec("jgo. platos y bielas", "bielas", "platos");
  const pedalierStr = getSpec("caja de pedalier", "pedalier");
  const ruedasStr = getSpec("llantas", "ruedas");
  const bujesStr = getSpec("bujes");
  const radiosStr = getSpec("radios");
  const cubiertasStr = getSpec("cubiertas", "neumáticos");
  const extrasStr = getSpec("extras");
  const pesoStr = getSpec("peso");
  const coloresStr = getSpec("colores");

  // Material de cuadro
  const lowerCuadro = (cuadroStr + " " + cleanModelName).toLowerCase();
  let frameMaterial: FrameMaterial = "carbon";
  if (
    lowerCuadro.includes("aluxx") ||
    lowerCuadro.includes("aluminum") ||
    lowerCuadro.includes("aluminio") ||
    lowerCuadro.includes("alloy")
  ) {
    frameMaterial = "aluminum";
  } else if (lowerCuadro.includes("titanium") || lowerCuadro.includes("titanio")) {
    frameMaterial = "titanium";
  } else if (lowerCuadro.includes("steel") || lowerCuadro.includes("acero") || lowerCuadro.includes("cro-mo")) {
    frameMaterial = "steel";
  }

  // Material de horquilla
  let forkMaterial: ForkMaterial = "carbon";
  if (sectionDiscipline === "montana") {
    forkMaterial = "suspension";
  } else if (
    horquillaStr.toLowerCase().includes("aluxx") ||
    horquillaStr.toLowerCase().includes("aluminio") ||
    horquillaStr.toLowerCase().includes("alloy")
  ) {
    forkMaterial = "aluminum";
  }

  // Transmisión y Grupo
  const allGroupsetText = `${cleanModelName} ${manetasStr} ${cambioTras} ${desviadorDel} ${bielasStr}`.toLowerCase();
  let groupsetBrand: GroupsetBrand = "shimano";
  if (allGroupsetText.includes("sram") || allGroupsetText.includes("axs") || allGroupsetText.includes("red") || allGroupsetText.includes("force") || allGroupsetText.includes("rival") || allGroupsetText.includes("apex") || allGroupsetText.includes("xx1") || allGroupsetText.includes("x01") || allGroupsetText.includes("gx") || allGroupsetText.includes("transmission")) {
    groupsetBrand = "sram";
  } else if (allGroupsetText.includes("campagnolo") || allGroupsetText.includes("ekar") || allGroupsetText.includes("super record")) {
    groupsetBrand = "campagnolo";
  } else if (allGroupsetText.includes("microshift") || allGroupsetText.includes("sword") || allGroupsetText.includes("advent")) {
    groupsetBrand = "microshift";
  }

  const isElectronic =
    allGroupsetText.includes("di2") ||
    allGroupsetText.includes("axs") ||
    allGroupsetText.includes("wireless") ||
    allGroupsetText.includes("transmission") ||
    allGroupsetText.includes("etap");

  // Determinar nombre comercial del grupo
  let groupsetName = "";
  if (cambioTras) {
    groupsetName = cambioTras.replace(/,.*$/, "").trim();
  } else if (manetasStr) {
    groupsetName = manetasStr.replace(/,.*$/, "").trim();
  } else {
    groupsetName = isLiv ? "Shimano 105" : "Shimano GRX";
  }
  if (groupsetName.length > 50) groupsetName = groupsetName.slice(0, 50);

  // Desarrollos de platos
  let chainrings = "50/34T";
  const ringsMatch = bielasStr.match(/(\d\d\/\d\d)/) || bielasStr.match(/(\d\d)t?\b/i) || allGroupsetText.match(/(\d\d\/\d\d)/);
  if (ringsMatch) {
    chainrings = ringsMatch[1].endsWith("T") ? ringsMatch[1] : `${ringsMatch[1]}T`;
  } else if (discipline === "gravel") {
    chainrings = "40T";
  } else if (discipline === "mtb") {
    chainrings = "32T";
  }

  // Cassette
  let cassette = "11-34T";
  const cogsMatch = cassetteStr.match(/(\d\d[\-xX]\d\d)/i) || cassetteStr.match(/(\d\d\-\d\d)t?/i);
  if (cogsMatch) {
    cassette = cogsMatch[1].replace(/[xX]/g, "-") + "T";
  } else if (discipline === "gravel") {
    cassette = "10-44T";
  } else if (discipline === "mtb") {
    cassette = "10-52T";
  }

  const speedCount =
    cassetteStr.includes("12") || allGroupsetText.includes("12-speed") || allGroupsetText.includes("12s")
      ? 12
      : cassetteStr.includes("11") || allGroupsetText.includes("11-speed") || allGroupsetText.includes("11s")
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

  // Paso de rueda (maxTireClearanceMm)
  let maxClearance = discipline === "gravel" ? 45 : discipline === "mtb" ? 62 : 38;
  const clearanceMatch = (extrasStr + " " + cubiertasStr + " " + cuadroStr).match(/(\d\d)\s*mm\s*max/i) ||
                         (extrasStr + " " + cubiertasStr).match(/paso de rueda(?: de)? hasta (\d\d)/i) ||
                         (extrasStr + " " + cubiertasStr).match(/(\d\d)mm/i);
  if (clearanceMatch) {
    const clNum = parseInt(clearanceMatch[1], 10);
    if (clNum >= 25 && clNum <= 80) {
      maxClearance = clNum;
    }
  } else {
    if (lowerModel.includes("revolt") || lowerModel.includes("devote")) maxClearance = 53;
    else if (lowerModel.includes("defy") || lowerModel.includes("avail")) maxClearance = 38;
    else if (lowerModel.includes("tcr") || lowerModel.includes("langma")) maxClearance = 33;
    else if (lowerModel.includes("propel") || lowerModel.includes("enviliv")) maxClearance = 30;
    else if (lowerModel.includes("contend")) maxClearance = 38;
    else if (discipline === "mtb") maxClearance = 62;
  }

  // Cockpit integrado
  const integratedCockpit =
    manillarStr.toLowerCase().includes("aerolight") ||
    manillarStr.toLowerCase().includes("contact slr") ||
    potenciaStr.toLowerCase().includes("aerolight") ||
    lowerModel.includes("propel") ||
    lowerModel.includes("enviliv");

  // Roscas bikepacking
  const bikepackingMounts =
    discipline === "gravel" ||
    discipline === "all_road" ||
    extrasStr.toLowerCase().includes("fender") ||
    extrasStr.toLowerCase().includes("guardabarros") ||
    extrasStr.toLowerCase().includes("rack");

  // Peso
  let weightKg: number | undefined = undefined;
  const weightMatch = pesoStr.match(/(\d+[\.\,]\d+)\s*kg/i) || pesoStr.match(/(\d+[\.\,]\d+)/);
  if (weightMatch) {
    const parsedW = parseFloat(weightMatch[1].replace(",", "."));
    if (parsedW > 5 && parsedW < 30) weightKg = Number(parsedW.toFixed(2));
  }

  // 6. Geometría
  let geometrySpec: GeometrySpec = {
    stackMm: discipline === "gravel" ? 585 : discipline === "mtb" ? 625 : 558,
    reachMm: discipline === "gravel" ? 385 : discipline === "mtb" ? 445 : 380,
    stackReachRatio: discipline === "gravel" ? 1.52 : discipline === "mtb" ? 1.40 : 1.47,
    headTubeAngleDeg: discipline === "gravel" ? 71.5 : discipline === "mtb" ? 67.5 : 72.5,
    chainstayLengthMm: discipline === "gravel" ? 425 : discipline === "mtb" ? 435 : 420,
  };

  const tableMatch = html.match(/<table[^>]*class=["'][^"']*geometry[^"']*["'][\s\S]*?<\/table>/i);
  if (tableMatch) {
    const tableHtml = tableMatch[0];
    const sizes = [...tableHtml.matchAll(/<th[^>]*name=["']?framesize["']?[^>]*>([\s\S]*?)<\/th>/gi)].map((m) =>
      m[1].replace(/<[^>]+>/g, "").trim()
    );

    // Identificar columna para talla de referencia ("M", o "S" si no hay M, o tamaño medio)
    let refColIdx = sizes.findIndex((s) => s.toUpperCase() === "M");
    if (refColIdx === -1) refColIdx = sizes.findIndex((s) => s.toUpperCase() === "S");
    if (refColIdx === -1 && sizes.length > 0) refColIdx = Math.floor(sizes.length / 2);

    if (refColIdx >= 0) {
      const geomRows = [...tableHtml.matchAll(/<tr class=["']?property["']?>([\s\S]*?)<\/tr>/gi)];
      const geomVals: Record<string, string> = {};

      for (const row of geomRows) {
        const nameM = row[1].match(/<td class=["']?name["']?>([\s\S]*?)<\/td>/i);
        if (!nameM) continue;
        const rowName = nameM[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().toLowerCase();

        const values = [...row[1].matchAll(/<td class=["']?value["']?>([\s\S]*?)<\/td>/gi)].map((m) => {
          const mmM = m[1].match(/class=["'][^"']*value-mm[^"']*["']>([^<]+)</i);
          if (mmM) return mmM[1].trim();
          return m[1].replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
        });

        if (values[refColIdx] !== undefined) {
          geomVals[rowName] = values[refColIdx];
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

      const parsedStack = parseMeasurementMm(getGeomVal("k stack", "stack"));
      const parsedReach = parseMeasurementMm(getGeomVal("l reach", "reach"));
      const parsedHta = parseAngleDeg(getGeomVal("e ángulo del tubo de dirección", "ángulo del tubo de dirección", "head tube angle"));
      const parsedSta = parseAngleDeg(getGeomVal("b ángulo del tubo del sillín", "ángulo del tubo del sillín", "seat tube angle"));
      const parsedChainstay = parseMeasurementMm(getGeomVal("i longitud de la vaina", "longitud de la vaina", "chainstay"));
      const parsedTopTube = parseMeasurementMm(getGeomVal("c longitud del tubo superior", "tubo superior", "top tube"));
      const parsedSeatTube = parseMeasurementMm(getGeomVal("a longitud del tubo del sillín", "tubo del sillín", "seat tube"));
      const parsedHeadTube = parseMeasurementMm(getGeomVal("d longitud del tubo de dirección", "tubo de dirección", "head tube length"));
      const parsedWheelbase = parseMeasurementMm(getGeomVal("h distancia entre ejes", "distancia entre ejes", "wheelbase"));
      const parsedBbDrop = parseMeasurementMm(getGeomVal("j caída del eje de pedalier", "caída del eje de pedalier", "bb drop"));
      const parsedStandover = parseMeasurementMm(getGeomVal("m altura del suelo al tubo", "altura del suelo al tubo", "standover"));

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
          standoverHeightMm: parsedStandover,
        };
      }
    }
  }

  // 7. Ficha técnica detallada (detailedSpecs)
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
    { label: "Amortiguador", value: amortiguadorStr },
    { label: "Colores", value: coloresStr },
  ]);

  addCategory("Transmisión", [
    { label: "Cambio Trasero", value: cambioTras },
    { label: "Desviador Delantero", value: desviadorDel },
    { label: "Manetas de Cambio", value: manetasStr },
    { label: "Platos y Bielas", value: bielasStr },
    { label: "Casette", value: cassetteStr },
    { label: "Cadena", value: cadenaStr },
    { label: "Caja de Pedalier", value: pedalierStr },
  ]);

  addCategory("Frenos", [
    { label: "Frenos", value: frenosStr },
    { label: "Palancas de Freno", value: palancasFrenoStr },
  ]);

  addCategory("Ruedas y Neumáticos", [
    { label: "Llantas / Ruedas", value: ruedasStr },
    { label: "Bujes", value: bujesStr },
    { label: "Radios", value: radiosStr },
    { label: "Cubiertas", value: cubiertasStr },
  ]);

  addCategory("Componentes", [
    { label: "Manillar", value: manillarStr },
    { label: "Potencia", value: potenciaStr },
    { label: "Tija de Sillín", value: tijaStr },
    { label: "Sillín", value: sillinStr },
    { label: "Extras", value: extrasStr },
  ]);

  // Highlights
  const highlights: string[] = [];
  if (frameMaterial === "carbon") highlights.push(`Cuadro ${brand} Composite Carbon`);
  highlights.push(`Grupo ${groupsetName}`);
  highlights.push(`Paso de rueda hasta ${maxClearance} mm`);
  if (isElectronic) highlights.push("Cambio electrónico");
  if (integratedCockpit) highlights.push("Cockpit aerodinámico integrado");

  // Colors list
  const colorsList: string[] = [];
  if (coloresStr) {
    coloresStr.split(/[\/,]/).forEach((c) => {
      const cleanC = c.trim();
      if (cleanC.length > 0 && !colorsList.includes(cleanC)) colorsList.push(cleanC.slice(0, 50));
    });
  }

  // ID seguro
  const idSlug = slugify(`${brand}-${cleanModelName}-${year}`);

  const bikeProduct: BikeProduct = {
    id: idSlug,
    brand,
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
    weightKg,
    weightSizeReference: weightKg ? "M" : undefined,
    maxTireClearanceMm: maxClearance,
    integratedCockpit,
    bikepackingMounts,
    groupset: groupsetSpec,
    geometry: geometrySpec,
    description: `Bicicleta oficial ${brand} ${cleanModelName} (${year}) de categoría ${discipline}. Diseñada por Giant Group con cuadro ${frameMaterial} y componentes ${groupsetName}.`.slice(
      0,
      1000
    ),
    highlights: highlights.slice(0, 10),
    brakes: (frenosStr || "Frenos de disco hidráulicos").slice(0, 100),
    wheels: (ruedasStr || "Ruedas Giant Tubeless Ready").slice(0, 100),
    tires: (cubiertasStr || "Cubiertas Tubeless").slice(0, 100),
    colors: colorsList.length > 0 ? colorsList.slice(0, 10) : undefined,
    detailedSpecs: detailedSpecs.length > 0 ? detailedSpecs : undefined,
  };

  return bikeProduct;
}
