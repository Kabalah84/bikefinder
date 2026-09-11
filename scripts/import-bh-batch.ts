import fs from "fs";
import path from "path";
import crypto from "crypto";
import { BikeProduct, BikeProductSchema } from "../src/lib/schema/bike";
import { parseBhHtml } from "./parse-bh";

const CARRETERA_FILE = path.join(process.cwd(), "data", "bikes", "carretera.json");
const GRAVEL_FILE = path.join(process.cwd(), "data", "bikes", "gravel.json");
const MONTANA_FILE = path.join(process.cwd(), "data", "bikes", "montana.json");
const BH_LINKS_FILE = path.join(process.cwd(), "links", "bh.txt");
const CACHE_DIR = path.join(process.cwd(), "scratch", "bh_cache");

interface BhItem {
  url: string;
  section: "carretera" | "gravel" | "montana";
}

function getCacheFilename(url: string): string {
  const hash = crypto.createHash("md5").update(url).digest("hex");
  const slug = url.split("/").filter(Boolean).pop()?.split("?")[0].replace(/[^a-zA-Z0-9_-]/g, "_") || "bike";
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

export async function importBhBatch() {
  console.log("🚲 [BikeFinder] Iniciando importación oficial de BH Bikes desde links/bh.txt...\n");

  if (!fs.existsSync(BH_LINKS_FILE)) {
    console.error(`❌ No se encontró links/bh.txt`);
    return;
  }

  const lines = fs.readFileSync(BH_LINKS_FILE, "utf-8").split("\n");
  let currentCategory: "carretera" | "gravel" | "montana" = "carretera";
  const items: BhItem[] = [];

  lines.forEach((line) => {
    const trimmed = line.trim();
    if (trimmed.startsWith("#") && trimmed.includes("CARRETERA")) {
      currentCategory = "carretera";
    } else if (trimmed.startsWith("#") && trimmed.includes("GRAVEL")) {
      currentCategory = "gravel";
    } else if (trimmed.startsWith("#") && trimmed.includes("MONTAÑA")) {
      currentCategory = "montana";
    } else if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      items.push({
        url: trimmed,
        section: currentCategory,
      });
    }
  });

  console.log(`📋 Se encontraron ${items.length} modelos de BH para procesar.\n`);

  const catalogs: Record<string, BikeProduct[]> = {
    carretera: fs.existsSync(CARRETERA_FILE) ? JSON.parse(fs.readFileSync(CARRETERA_FILE, "utf-8")) : [],
    gravel: fs.existsSync(GRAVEL_FILE) ? JSON.parse(fs.readFileSync(GRAVEL_FILE, "utf-8")) : [],
    montana: fs.existsSync(MONTANA_FILE) ? JSON.parse(fs.readFileSync(MONTANA_FILE, "utf-8")) : [],
  };

  let successCount = 0;
  let failCount = 0;
  const failedUrls: string[] = [];

  await asyncPool(4, items, async (item, index) => {
    const prefix = `[${index + 1}/${items.length}]`;
    const html = await fetchWithRetry(item.url);
    if (!html) {
      console.error(`${prefix} ❌ No se pudo descargar HTML: ${item.url}`);
      failCount++;
      failedUrls.push(item.url);
      return;
    }

    try {
      const bike = await parseBhHtml(html, item.url, item.section);
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
        console.log(`${prefix} 🔄 [Actualizado] BH ${bike.model} (${bike.id}) en ${targetCategory}.json`);
      } else {
        catalogList.push(validation.data);
        console.log(`${prefix} ✅ [Añadido] BH ${bike.model} (${bike.id}) en ${targetCategory}.json`);
      }

      successCount++;
    } catch (err: any) {
      console.error(`${prefix} ❌ Excepción al procesar ${item.url}:`, err.message);
      failCount++;
      failedUrls.push(item.url);
    }
  });

  fs.writeFileSync(CARRETERA_FILE, JSON.stringify(catalogs.carretera, null, 2), "utf-8");
  fs.writeFileSync(GRAVEL_FILE, JSON.stringify(catalogs.gravel, null, 2), "utf-8");
  fs.writeFileSync(MONTANA_FILE, JSON.stringify(catalogs.montana, null, 2), "utf-8");

  console.log("\n==========================================");
  console.log("🏁 IMPORTACIÓN BH COMPLETADA");
  console.log("==========================================");
  console.log(`Total enlaces:        ${items.length}`);
  console.log(`Procesados con éxito: ${successCount}`);
  console.log(`Fallidos:             ${failCount}`);
  console.log(`Carretera total:      ${catalogs.carretera.length} bicis`);
  console.log(`Gravel total:         ${catalogs.gravel.length} bicis`);
  console.log(`Montaña total:        ${catalogs.montana.length} bicis`);
  console.log(`TOTAL CATÁLOGO:       ${catalogs.carretera.length + catalogs.gravel.length + catalogs.montana.length} bicis`);
}

if (require.main === module) {
  importBhBatch().catch(console.error);
}
