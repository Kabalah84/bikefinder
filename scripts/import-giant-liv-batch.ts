import fs from "fs";
import path from "path";
import crypto from "crypto";
import { BikeProduct, BikeProductSchema } from "../src/lib/schema/bike";
import { parseGiantLivHtml } from "./parse-giant-liv";

const CARRETERA_FILE = path.join(process.cwd(), "data", "bikes", "carretera.json");
const GRAVEL_FILE = path.join(process.cwd(), "data", "bikes", "gravel.json");
const MONTANA_FILE = path.join(process.cwd(), "data", "bikes", "montana.json");
const CACHE_DIR = path.join(process.cwd(), "scratch", "giant_liv_cache");

interface GiantLivItem {
  url: string;
  brand: "Giant" | "Liv";
  section: "carretera" | "gravel" | "montana";
  lineNum: number;
}

function getCacheFilename(url: string): string {
  const hash = crypto.createHash("md5").update(url).digest("hex");
  const slug = url.split("/").filter(Boolean).pop()?.replace(/[^a-zA-Z0-9_-]/g, "_") || "bike";
  return path.join(CACHE_DIR, `${slug}_${hash.slice(0, 8)}.html`);
}

async function fetchWithRetry(url: string, retries = 3, delayMs = 1000): Promise<string | null> {
  const cacheFile = getCacheFilename(url);
  if (fs.existsSync(cacheFile)) {
    return fs.readFileSync(cacheFile, "utf-8");
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        },
      });

      if (res.ok) {
        const html = await res.text();
        if (html.length > 5000) {
          if (!fs.existsSync(CACHE_DIR)) {
            fs.mkdirSync(CACHE_DIR, { recursive: true });
          }
          fs.writeFileSync(cacheFile, html, "utf-8");
          return html;
        }
      } else {
        console.warn(`    ⚠️ HTTP ${res.status} al solicitar ${url}`);
      }
    } catch (err: any) {
      if (attempt === retries) {
        console.error(`    ❌ Error de red tras ${retries} intentos en ${url}:`, err.message);
      }
    }
    await new Promise((resolve) => setTimeout(resolve, delayMs));
  }
  return null;
}

// Pool de concurrencia ligera
async function asyncPool<T, R>(poolLimit: number, array: T[], iteratorFn: (item: T, index: number) => Promise<R>): Promise<R[]> {
  const ret: Promise<R>[] = [];
  const executing: Promise<any>[] = [];
  for (let i = 0; i < array.length; i++) {
    const item = array[i];
    const p = Promise.resolve().then(() => iteratorFn(item, i));
    ret.push(p);

    if (poolLimit <= array.length) {
      const e: Promise<any> = p.then(() => executing.splice(executing.indexOf(e), 1));
      executing.push(e);
      if (executing.length >= poolLimit) {
        await Promise.race(executing);
      }
    }
  }
  return Promise.all(ret);
}

export async function importGiantLivBatch() {
  console.log("🚲 [BikeFinder] Iniciando importación oficial de Giant & Liv desde links.txt...\n");

  const linksPath = path.join(process.cwd(), "links.txt");
  if (!fs.existsSync(linksPath)) {
    console.error(`❌ No se encontró links.txt en ${linksPath}`);
    return;
  }

  const lines = fs.readFileSync(linksPath, "utf-8").split("\n");
  let currentCategory: "carretera" | "gravel" | "montana" = "carretera";
  const items: GiantLivItem[] = [];

  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("#") && trimmed.includes("CARRETERA")) {
      currentCategory = "carretera";
    } else if (trimmed.startsWith("#") && trimmed.includes("GRAVEL")) {
      currentCategory = "gravel";
    } else if (trimmed.startsWith("#") && trimmed.includes("MONTAÑA")) {
      currentCategory = "montana";
    } else if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      const isGiant = trimmed.includes("giant-bicycles.com") || trimmed.includes("giant.com");
      const isLiv = trimmed.includes("liv-cycling.com");
      if (isGiant || isLiv) {
        items.push({
          url: trimmed,
          brand: isLiv ? "Liv" : "Giant",
          section: currentCategory,
          lineNum: idx + 1,
        });
      }
    }
  });

  console.log(`📋 Se encontraron ${items.length} modelos de Giant y Liv para procesar.\n`);

  // Cargar catálogos existentes
  const catalogs: Record<string, BikeProduct[]> = {
    carretera: fs.existsSync(CARRETERA_FILE) ? JSON.parse(fs.readFileSync(CARRETERA_FILE, "utf-8")) : [],
    gravel: fs.existsSync(GRAVEL_FILE) ? JSON.parse(fs.readFileSync(GRAVEL_FILE, "utf-8")) : [],
    montana: fs.existsSync(MONTANA_FILE) ? JSON.parse(fs.readFileSync(MONTANA_FILE, "utf-8")) : [],
  };

  let processedCount = 0;
  let successCount = 0;
  let failCount = 0;
  const failedUrls: string[] = [];

  await asyncPool(5, items, async (item, index) => {
    const prefix = `[${index + 1}/${items.length}]`;
    const html = await fetchWithRetry(item.url);
    if (!html) {
      console.error(`${prefix} ❌ No se pudo descargar HTML: ${item.url}`);
      failCount++;
      failedUrls.push(item.url);
      return;
    }

    try {
      const bike = await parseGiantLivHtml(html, item.url, item.section);
      if (!bike) {
        console.error(`${prefix} ❌ Parser devolvió null: ${item.url}`);
        failCount++;
        failedUrls.push(item.url);
        return;
      }

      const validation = BikeProductSchema.safeParse(bike);
      if (!validation.success) {
        console.error(`${prefix} ❌ Error Zod en ${bike.model}:`, JSON.stringify(validation.error.format(), null, 2));
        failCount++;
        failedUrls.push(item.url);
        return;
      }

      // Determinar archivo destino
      let targetCategory: "carretera" | "gravel" | "montana" = item.section;
      if (bike.discipline === "gravel" || bike.discipline === "all_road") {
        targetCategory = "gravel";
      } else if (bike.discipline === "mtb") {
        targetCategory = "montana";
      } else {
        targetCategory = "carretera";
      }

      const catalogList = catalogs[targetCategory];
      const existingIdx = catalogList.findIndex(
        (b) => b.id === bike.id || b.officialUrl.toLowerCase() === bike.officialUrl.toLowerCase()
      );

      if (existingIdx >= 0) {
        catalogList[existingIdx] = validation.data;
        console.log(`${prefix} 🔄 [Actualizado] ${bike.brand} ${bike.model} (${bike.id}) en ${targetCategory}.json`);
      } else {
        catalogList.push(validation.data);
        console.log(`${prefix} ✅ [Añadido] ${bike.brand} ${bike.model} (${bike.id}) en ${targetCategory}.json`);
      }

      successCount++;
    } catch (err: any) {
      console.error(`${prefix} ❌ Excepción al procesar ${item.url}:`, err.message);
      failCount++;
      failedUrls.push(item.url);
    }
  });

  // Guardar catálogos actualizados
  fs.writeFileSync(CARRETERA_FILE, JSON.stringify(catalogs.carretera, null, 2), "utf-8");
  fs.writeFileSync(GRAVEL_FILE, JSON.stringify(catalogs.gravel, null, 2), "utf-8");
  fs.writeFileSync(MONTANA_FILE, JSON.stringify(catalogs.montana, null, 2), "utf-8");

  console.log("\n==========================================");
  console.log("🏁 IMPORTACIÓN GIANT & LIV COMPLETADA");
  console.log("==========================================");
  console.log(`Total enlaces:      ${items.length}`);
  console.log(`Procesados con éxito: ${successCount}`);
  console.log(`Fallidos:           ${failCount}`);
  console.log(`Carretera total:    ${catalogs.carretera.length} bicis`);
  console.log(`Gravel total:       ${catalogs.gravel.length} bicis`);
  console.log(`Montaña total:      ${catalogs.montana.length} bicis`);
  console.log(`TOTAL CATÁLOGO:     ${catalogs.carretera.length + catalogs.gravel.length + catalogs.montana.length} bicis`);

  if (failedUrls.length > 0) {
    console.log("\n⚠️ Enlaces que fallaron:");
    failedUrls.forEach((u) => console.log(" - " + u));
  }
}

if (require.main === module) {
  importGiantLivBatch().catch(console.error);
}
