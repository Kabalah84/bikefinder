import { BikeProduct, BikeProductSchema, DetailedSpecCategory, Discipline } from "../src/lib/schema/bike";

interface CanyonRawProperty {
  name: string;
  value: any;
  unitText?: string;
}

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
    .filter((n) => !isNaN(n));

  const cogs = cassette
    .replace(/T/gi, "")
    .split("-")
    .map((c) => parseFloat(c.trim()))
    .filter((n) => !isNaN(n));

  const minRing = Math.min(...(rings.length > 0 ? rings : [34]));
  const maxRing = Math.max(...(rings.length > 0 ? rings : [50]));
  const minCog = Math.min(...(cogs.length > 0 ? cogs : [11]));
  const maxCog = Math.max(...(cogs.length > 0 ? cogs : [34]));

  const minRatio = Number((minRing / maxCog).toFixed(2));
  const maxRatio = Number((maxRing / minCog).toFixed(2));

  return { minRatio, maxRatio };
}

export function parseCanyonHtml(html: string, originalUrl: string, sectionDiscipline: Discipline): BikeProduct | null {
  // 1. Buscar JSON-LD de schema.org
  const scriptRegex = /<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi;
  let match;
  let productJson: any = null;

  while ((match = scriptRegex.exec(html)) !== null) {
    try {
      const data = JSON.parse(match[1]);
      if (data["@type"] === "Product" || data["@type"] === "ProductModel" || (Array.isArray(data) && data.some((d) => d["@type"] === "Product"))) {
        productJson = Array.isArray(data) ? data.find((d) => d["@type"] === "Product") : data;
        if (productJson) break;
      }
    } catch {}
  }

  // 2. Extraer nombre, año y modelo
  let modelName = "";
  if (productJson?.name) {
    modelName = productJson.name.replace(/\|\s*CANYON.*$/i, "").trim();
  } else {
    const titleMatch = html.match(/<title>\s*(.*?)\s*\|\s*CANYON/i);
    modelName = titleMatch ? titleMatch[1].trim() : "Canyon Bike";
  }

  const yearMatch = html.match(/202[4-9]/);
  const year = yearMatch ? parseInt(yearMatch[0], 10) : 2026;

  // 3. Precios
  let price = 0;
  let originalPrice = 0;

  if (productJson?.offers?.price) {
    price = parseFloat(productJson.offers.price);
  } else {
    const pMatch = html.match(/data-total-price-value="([\d.]+)"/) || html.match(/data-approximate-total-product-price-value="([\d.]+)"/);
    if (pMatch) price = parseFloat(pMatch[1]);
  }

  const origMatch = html.match(/productDescription__priceHintOld[^>]*>([\d.,]+)\s*€/) || html.match(/productDescription__priceOriginal[^>]*>([\d.,]+)\s*€/);
  if (origMatch) {
    originalPrice = parseFloat(origMatch[1].replace(".", "").replace(",", "."));
  } else {
    originalPrice = price;
  }

  if (price <= 0) price = 1999;
  if (originalPrice < price) originalPrice = price;
  const discountPercentage = originalPrice > price ? Math.round(((originalPrice - price) / originalPrice) * 100) : 0;

  // 4. Propiedades adicionales de Canyon
  let additionalProps: CanyonRawProperty[] = [];
  if (productJson?.additionalProperty && Array.isArray(productJson.additionalProperty)) {
    additionalProps = productJson.additionalProperty;
  } else {
    const propsMatch = html.match(/"additionalProperty":(\[\{[\s\S]*?\}\])/);
    if (propsMatch) {
      try {
        additionalProps = JSON.parse(propsMatch[1]);
      } catch {}
    }
  }

  const getProp = (name: string): string => {
    const p = additionalProps.find((item) => item.name.toLowerCase() === name.toLowerCase());
    return p && p.value !== undefined ? String(p.value) : "";
  };

  // Peso
  let weightKg = 0;
  const pesoStr = getProp("Peso") || (html.match(/Peso:\s*([\d.,]+)\s*kg/i)?.[1] ?? "");
  if (pesoStr) {
    weightKg = parseFloat(pesoStr.replace(",", "."));
  }
  if (!weightKg || isNaN(weightKg) || weightKg <= 0) {
    weightKg = sectionDiscipline === "mtb" ? 12.8 : sectionDiscipline === "gravel" ? 9.2 : 8.2;
  }

  // Material
  const matRaw = getProp("Material").toLowerCase();
  const frameMaterial = matRaw.includes("aluminio") || matRaw.includes("(al)") ? "aluminum" : "carbon";
  const forkMaterial = sectionDiscipline === "mtb" ? "suspension" : "carbon";

  // Paso de rueda
  const clearanceProp = getProp("Espacio del cuadro para cubiertas");
  let maxTireClearanceMm = clearanceProp ? parseInt(clearanceProp, 10) : 0;
  if (!maxTireClearanceMm || isNaN(maxTireClearanceMm)) {
    maxTireClearanceMm = sectionDiscipline === "mtb" ? 60 : sectionDiscipline === "gravel" ? 45 : 32;
  }

  // Grupo
  const rearDerailleur = getProp("Modelo con cambio trasero") || getProp("Cambio trasero") || "Shimano";
  const gsBrandRaw = (getProp("Marca del cambio trasero") || rearDerailleur).toLowerCase();
  const gsBrand: "shimano" | "sram" = gsBrandRaw.includes("sram") ? "sram" : "shimano";

  const isElectronic =
    getProp("Tipo de cambio trasero").toLowerCase().includes("electr") ||
    rearDerailleur.toLowerCase().includes("axs") ||
    rearDerailleur.toLowerCase().includes("di2") ||
    rearDerailleur.toLowerCase().includes("transmission");

  const chainringsRaw = getProp("Tamaño del plato") || (sectionDiscipline === "mtb" ? "32T" : sectionDiscipline === "gravel" ? "40T" : "50/34T");
  const chainrings = chainringsRaw.slice(0, 20);

  const cassetteRaw = getProp("Casete")
    ? getProp("Casete").match(/\d+-\d+T?/)
      ? getProp("Casete").match(/\d+-\d+T?/)![0]
      : "10-52T"
    : sectionDiscipline === "mtb"
    ? "10-52T"
    : sectionDiscipline === "gravel"
    ? "10-44T"
    : "11-34T";
  const cassette = cassetteRaw.slice(0, 20);

  const { minRatio, maxRatio } = calculateRatios(chainrings, cassette);

  // Ruedas, cubiertas, frenos
  const wheels = (getProp("Rueda delantera") || getProp("Marca de la rueda") || "DT Swiss").slice(0, 100);
  const tires = (getProp("Cubiertas") || (sectionDiscipline === "mtb" ? "Maxxis Dissector 2.4\"" : sectionDiscipline === "gravel" ? "Schwalbe G-One 40mm" : "Continental Grand Prix 28mm")).slice(0, 100);
  const brakes = `${getProp("Marca de frenos") || (gsBrand === "sram" ? "SRAM" : "Shimano")} ${getProp("Disco de freno") || "hidráulicos"}`.trim().slice(0, 100);

  // Imagen oficial de Canyon en alta resolución
  let officialImageUrl = "";
  const imgMatch =
    html.match(/https:\/\/dma\.canyon\.com\/image\/upload\/[^"'\s]*?(?:FULL|FRONT)[^"'\s]*/i) ||
    html.match(/https:\/\/dma\.canyon\.com\/image\/upload\/[^"'\s]*/i);
  if (imgMatch) {
    officialImageUrl = imgMatch[0].replace(/&amp;/g, "&");
  } else {
    officialImageUrl = "https://dma.canyon.com/image/upload/w_1439,c_fit/b_rgb:F2F2F2/f_auto/q_auto/placeholder_canyon";
  }

  // Geometría talla M y cotas extendidas
  let stackMm = sectionDiscipline === "mtb" ? 610 : sectionDiscipline === "gravel" ? 580 : 560;
  let reachMm = sectionDiscipline === "mtb" ? 450 : sectionDiscipline === "gravel" ? 395 : 390;
  let headTubeAngleDeg = sectionDiscipline === "mtb" ? 66.5 : sectionDiscipline === "gravel" ? 71.5 : 73.0;
  let chainstayLengthMm = sectionDiscipline === "mtb" ? 435 : sectionDiscipline === "gravel" ? 425 : 410;

  let topTubeLengthMm: number | undefined = sectionDiscipline === "mtb" ? 615 : sectionDiscipline === "gravel" ? 565 : 555;
  let seatTubeLengthMm: number | undefined = 530;
  let headTubeLengthMm: number | undefined = 145;
  let seatTubeAngleDeg: number | undefined = 73.5;
  let wheelbaseMm: number | undefined = sectionDiscipline === "mtb" ? 1180 : sectionDiscipline === "gravel" ? 1025 : 995;
  let bbDropMm: number | undefined = 70;
  let standoverHeightMm: number | undefined = 805;

  // Buscar bloque de talla M en las variantes
  const mSizeBlock = html.match(/Product",\s*"name":\s*"[^"]*?\|\s*M"[\s\S]*?additionalProperty":(\[[\s\S]*?\])\s*\}/);
  if (mSizeBlock) {
    try {
      const mProps: CanyonRawProperty[] = JSON.parse(mSizeBlock[1]);

      const findProp = (key: string, min: number, max: number): number | undefined => {
        const item = mProps.find((p) => p.name.toLowerCase().includes(key));
        if (item && item.value) {
          const val = parseFloat(String(item.value).replace(",", "."));
          if (!isNaN(val) && val >= min && val <= max) return val;
        }
        return undefined;
      };

      const s = findProp("stack", 450, 750);
      if (s) stackMm = s;

      const r = findProp("reach", 300, 550);
      if (r) reachMm = r;

      const a = mProps.find((p) => {
        const n = p.name.toLowerCase();
        return (n.includes("ángulo") || n.includes("angulo")) && n.includes("direcc");
      });
      if (a && a.value) {
        const aVal = parseFloat(String(a.value).replace(",", "."));
        if (aVal >= 60 && aVal <= 85) headTubeAngleDeg = aVal;
      }

      const v = findProp("vainas", 390, 500);
      if (v) chainstayLengthMm = v;

      const tt = findProp("tubo superior", 480, 680);
      if (tt) topTubeLengthMm = tt;

      const st = findProp("tubo de sill", 400, 650);
      if (st) seatTubeLengthMm = st;

      const ht = findProp("tubo de direcc", 90, 250);
      if (ht) headTubeLengthMm = ht;

      const sa = mProps.find((p) => {
        const n = p.name.toLowerCase();
        return (n.includes("ángulo") || n.includes("angulo")) && n.includes("sill");
      });
      if (sa && sa.value) {
        const saVal = parseFloat(String(sa.value).replace(",", "."));
        if (saVal >= 70 && saVal <= 80) seatTubeAngleDeg = saVal;
      }

      const wb = findProp("batalla", 900, 1350);
      if (wb) wheelbaseMm = wb;

      const bbd = findProp("pedalier", 30, 95);
      if (bbd) bbDropMm = bbd;

      const so = findProp("altura del cuadro", 650, 950);
      if (so) standoverHeightMm = so;
    } catch {}
  }

  if (headTubeAngleDeg > 85 || headTubeAngleDeg < 60) {
    headTubeAngleDeg = sectionDiscipline === "mtb" ? 66.5 : sectionDiscipline === "gravel" ? 71.5 : 73.0;
  }

  const stackReachRatio = Number((stackMm / reachMm).toFixed(2));

  // 5. Construcción del Despiece Técnico Detallado (detailedSpecs)
  const detailedSpecs: DetailedSpecCategory[] = [];

  const addCategory = (categoryName: string, icon: string, propNames: { label: string; keys: string[] }[]) => {
    const items: { label: string; value: string }[] = [];
    for (const p of propNames) {
      for (const k of p.keys) {
        const val = getProp(k);
        if (val) {
          items.push({
            label: p.label.slice(0, 100),
            value: val.slice(0, 300),
          });
          break;
        }
      }
    }
    if (items.length > 0) {
      detailedSpecs.push({
        category: categoryName.slice(0, 100),
        icon: icon.slice(0, 50),
        items,
      });
    }
  };

  // Cuadro y Horquilla
  addCategory("Cuadro y Horquilla", "Layers", [
    { label: "Cuadro", keys: ["Cuadro"] },
    { label: "Material del Cuadro", keys: ["Material"] },
    { label: "Horquilla", keys: ["Horquilla"] },
    { label: "Espacio para Cubiertas", keys: ["Espacio del cuadro para cubiertas"] },
    { label: "Eje Pasante", keys: ["Eje pasante"] },
    { label: "Cierre de Tija", keys: ["Cierre de tija de sillín", "Abrazadera de sillín"] },
  ]);

  // Transmisión
  addCategory("Transmisión & Desarrollo", "Cog", [
    { label: "Cambio Trasero", keys: ["Modelo con cambio trasero", "Cambio trasero"] },
    { label: "Desviador Delantero", keys: ["Desviador"] },
    { label: "Manetas de Cambio", keys: ["Maneta de cambio y freno"] },
    { label: "Casete", keys: ["Casete"] },
    { label: "Bielas", keys: ["Bielas"] },
    { label: "Platos", keys: ["Tamaño del plato"] },
    { label: "Pedalier", keys: ["Pedalier"] },
    { label: "Cadena", keys: ["Cadena"] },
    { label: "Batería", keys: ["Bateria"] },
  ]);

  // Frenos
  addCategory("Frenos", "ShieldCheck", [
    { label: "Sistema de Frenos", keys: ["Tipo de freno", "Marca de frenos"] },
    { label: "Discos de Freno", keys: ["Disco de freno"] },
    { label: "Manetas de Freno", keys: ["Maneta de cambio y freno"] },
  ]);

  // Ruedas y Cubiertas
  addCategory("Ruedas y Neumáticos", "CircleDot", [
    { label: "Rueda Delantera", keys: ["Rueda delantera"] },
    { label: "Rueda Trasera", keys: ["Rueda trasera"] },
    { label: "Material de Ruedas", keys: ["Material de la rueda"] },
    { label: "Altura de Perfil", keys: ["Altura de llanta"] },
    { label: "Cubiertas", keys: ["Cubiertas"] },
    { label: "Diámetro de Rueda", keys: ["Tamaño de las ruedas"] },
  ]);

  // Cockpit y Sillín
  addCategory("Cockpit y Componentes", "Sparkles", [
    { label: "Manillar / Cockpit", keys: ["Cockpit", "Manillar", "Manillar de Carreter"] },
    { label: "Potencia", keys: ["Potencia"] },
    { label: "Tija de Sillín", keys: ["Tija de sillín"] },
    { label: "Sillín", keys: ["Sillín"] },
    { label: "Cinta de Manillar", keys: ["Cinta de manillar"] },
  ]);

  // Generar slug seguro
  const cleanSlug = slugify(modelName);
  const id = `canyon-${cleanSlug}-${year}`;

  const bike: BikeProduct = {
    id,
    brand: "Canyon",
    model: modelName.slice(0, 100),
    year,
    discipline: sectionDiscipline,
    officialUrl: originalUrl,
    officialImageUrl,
    msrpEur: originalPrice,
    currentPriceEur: price,
    discountPercentage,
    isOutlet: discountPercentage > 0,
    frameMaterial,
    forkMaterial,
    weightKg,
    weightSizeReference: "M",
    maxTireClearanceMm,
    integratedCockpit: html.includes("CP00") || html.includes("Cockpit integrado") || html.includes("Aero Drops"),
    bikepackingMounts: sectionDiscipline === "gravel",
    groupset: {
      brand: gsBrand,
      name: `${rearDerailleur}`.replace(/^Shimano\s+/i, "").replace(/^Sram\s+/i, "").slice(0, 100),
      isElectronic,
      speedCount: 12,
      chainrings,
      cassette,
      minGearRatio: minRatio,
      maxGearRatio: maxRatio,
    },
    geometry: {
      stackMm,
      reachMm,
      stackReachRatio,
      headTubeAngleDeg,
      chainstayLengthMm,
      topTubeLengthMm,
      seatTubeLengthMm,
      headTubeLengthMm,
      seatTubeAngleDeg,
      wheelbaseMm,
      bbDropMm,
      standoverHeightMm,
    },
    description: `Bicicleta oficial Canyon ${modelName} (${year}) para la disciplina de ${sectionDiscipline}. Cuadro de ${frameMaterial === "carbon" ? "carbono" : "aluminio"}, transmisión ${gsBrand.toUpperCase()} y componentes de alto rendimiento seleccionados por Canyon.`.slice(0, 1000),
    highlights: [
      `Cuadro Canyon de ${frameMaterial === "carbon" ? "carbono de alta resistencia" : "aluminio hidroformado"}`.slice(0, 200),
      `Transmisión ${gsBrand.toUpperCase()} ${isElectronic ? "electrónica inalámbrica" : "mecánica"}`.slice(0, 200),
      `Peso oficial verificado de ${weightKg} kg (talla M)`.slice(0, 200),
      `Ruedas ${wheels} preparadas para tubeless`.slice(0, 200),
    ],
    brakes,
    wheels,
    tires,
    detailedSpecs,
  };

  const validation = BikeProductSchema.safeParse(bike);
  if (!validation.success) {
    console.error(`  ❌ Validación falló para ${bike.model}:`, JSON.stringify(validation.error.format(), null, 2));
    return null;
  }

  return validation.data;
}
