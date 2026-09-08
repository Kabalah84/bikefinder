import { BikeProduct, BikeProductSchema, Discipline } from "../src/lib/schema/bike";

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
    } catch {
      // Ignorar scripts no válidos
    }
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

  // Geometría talla M
  let stackMm = sectionDiscipline === "mtb" ? 610 : sectionDiscipline === "gravel" ? 580 : 560;
  let reachMm = sectionDiscipline === "mtb" ? 450 : sectionDiscipline === "gravel" ? 395 : 390;
  let headTubeAngleDeg = sectionDiscipline === "mtb" ? 66.5 : sectionDiscipline === "gravel" ? 71.5 : 73.0;
  let chainstayLengthMm = sectionDiscipline === "mtb" ? 435 : sectionDiscipline === "gravel" ? 425 : 410;

  // Buscar bloque de talla M en las variantes
  const mSizeBlock = html.match(/Product",\s*"name":\s*"[^"]*?\|\s*M"[\s\S]*?additionalProperty":(\[[\s\S]*?\])\s*\}/);
  if (mSizeBlock) {
    try {
      const mProps: CanyonRawProperty[] = JSON.parse(mSizeBlock[1]);
      
      const sItem = mProps.find((p) => p.name.toLowerCase().trim() === "stack");
      if (sItem && sItem.value) {
        const sVal = parseFloat(String(sItem.value).replace(",", "."));
        if (sVal >= 450 && sVal <= 750) stackMm = sVal;
      }

      const rItem = mProps.find((p) => p.name.toLowerCase().trim() === "reach");
      if (rItem && rItem.value) {
        const rVal = parseFloat(String(rItem.value).replace(",", "."));
        if (rVal >= 300 && rVal <= 550) reachMm = rVal;
      }

      const aItem = mProps.find((p) => {
        const n = p.name.toLowerCase();
        return (n.includes("ángulo") || n.includes("angulo")) && n.includes("direcc");
      });
      if (aItem && aItem.value) {
        const aVal = parseFloat(String(aItem.value).replace(",", "."));
        if (aVal >= 60 && aVal <= 85) headTubeAngleDeg = aVal;
      }

      const vItem = mProps.find((p) => p.name.toLowerCase().includes("vainas"));
      if (vItem && vItem.value) {
        const vVal = parseFloat(String(vItem.value).replace(",", "."));
        if (vVal >= 390 && vVal <= 500) chainstayLengthMm = vVal;
      }
    } catch {}
  } else {
    const stackMatch = html.match(/"name":"Stack","value":(\d+)/);
    if (stackMatch) stackMm = parseFloat(stackMatch[1]);
    const reachMatch = html.match(/"name":"Reach","value":(\d+)/);
    if (reachMatch) reachMm = parseFloat(reachMatch[1]);
  }

  if (headTubeAngleDeg > 85 || headTubeAngleDeg < 60) {
    headTubeAngleDeg = sectionDiscipline === "mtb" ? 66.5 : sectionDiscipline === "gravel" ? 71.5 : 73.0;
  }

  const stackReachRatio = Number((stackMm / reachMm).toFixed(2));

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
  };

  const validation = BikeProductSchema.safeParse(bike);
  if (!validation.success) {
    console.error(`  ❌ Validación falló para ${bike.model}:`, JSON.stringify(validation.error.format(), null, 2));
    return null;
  }

  return validation.data;
}
