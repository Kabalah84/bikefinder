import fs from "fs";
import path from "path";
import crypto from "crypto";
import { BikeProduct, BikeProductSchema } from "../src/lib/schema/bike";
import { parseBianchiHtml } from "./parse-bianchi";

const CARRETERA_FILE = path.join(process.cwd(), "data", "bikes", "carretera.json");
const GRAVEL_FILE = path.join(process.cwd(), "data", "bikes", "gravel.json");
const MONTANA_FILE = path.join(process.cwd(), "data", "bikes", "montana.json");
const BIANCHI_LINKS_FILE = path.join(process.cwd(), "links", "bianchi.txt");
const CACHE_DIR = path.join(process.cwd(), "scratch", "bianchi_cache");

interface BianchiItem {
  url: string;
  section: "carretera" | "gravel" | "montana";
}

function getCacheFilename(url: string): string {
  const hash = crypto.createHash("md5").update(url).digest("hex");
  const slug = url.split("/").filter(Boolean).pop()?.split("?")[0].replace(/[^a-zA-Z0-9_-]/g, "_") || "bike";
  return path.join(CACHE_DIR, `${slug}_${hash.slice(0, 8)}.html`);
}

async function fetchWithRetry(url: string, retries = 3, delayMs = 600): Promise<string | null> {
  const cacheFile = getCacheFilename(url);
  if (fs.existsSync(cacheFile)) {
    return fs.readFileSync(cacheFile, "utf-8");
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8",
          "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
        },
      });

      if (res.ok) {
        const html = await res.text();
        if (html.length > 3000) {
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

function loadExistingBikes(filePath: string): BikeProduct[] {
  if (!fs.existsSync(filePath)) return [];
  const raw = fs.readFileSync(filePath, "utf-8");
  return JSON.parse(raw);
}

function saveBikes(filePath: string, bikes: BikeProduct[]) {
  bikes.sort((a, b) => a.brand.localeCompare(b.brand) || a.model.localeCompare(b.model));
  fs.writeFileSync(filePath, JSON.stringify(bikes, null, 2), "utf-8");
}

function readBianchiLinks(): BianchiItem[] {
  const content = fs.readFileSync(BIANCHI_LINKS_FILE, "utf-8");
  const lines = content.split("\n");

  let currentSection: "carretera" | "gravel" | "montana" = "carretera";
  const items: BianchiItem[] = [];
  const seenUrls = new Set<string>();

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("#")) {
      const lower = trimmed.toLowerCase();
      if (lower.includes("carretera")) {
        currentSection = "carretera";
      } else if (lower.includes("gravel") || lower.includes("all-road")) {
        currentSection = "gravel";
      } else if (lower.includes("montaña") || lower.includes("mtb")) {
        currentSection = "montana";
      }
      continue;
    }

    if (trimmed.startsWith("http")) {
      if (!seenUrls.has(trimmed)) {
        seenUrls.add(trimmed);
        items.push({ url: trimmed, section: currentSection });
      }
    }
  }

  return items;
}

async function run() {
  console.log("🚲 ========================================================");
  console.log("   IMPORTADOR POR LOTES: BIANCHI OFICIAL");
  console.log("========================================================\n");

  const items = readBianchiLinks();
  console.log(`📋 Total de enlaces Bianchi únicos detectados: ${items.length}`);

  const carreteraBikes = loadExistingBikes(CARRETERA_FILE);
  const gravelBikes = loadExistingBikes(GRAVEL_FILE);
  const montanaBikes = loadExistingBikes(MONTANA_FILE);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < items.length; i++) {
    const { url, section } = items[i];
    console.log(`[${i + 1}/${items.length}] Procesando: ${url.slice(0, 70)}...`);

    const html = await fetchWithRetry(url, 3, 300);
    if (!html) {
      console.warn(`  ⚠️ No se pudo descargar HTML para: ${url}`);
      failCount++;
      continue;
    }

    try {
      const bike = await parseBianchiHtml(html, url, section);
      if (!bike) {
        console.warn(`  ⚠️ Parser devolvió null para: ${url}`);
        failCount++;
        continue;
      }

      BikeProductSchema.parse(bike);

      // Guardar en el archivo correspondiente
      let targetList: BikeProduct[];
      if (bike.discipline === "mtb") {
        targetList = montanaBikes;
      } else if (bike.discipline === "gravel") {
        targetList = gravelBikes;
      } else {
        targetList = carreteraBikes;
      }

      const existingIndex = targetList.findIndex((b) => b.id === bike.id || b.officialUrl === bike.officialUrl);
      if (existingIndex >= 0) {
        targetList[existingIndex] = bike;
      } else {
        targetList.push(bike);
      }

      console.log(`  ✅ [${bike.discipline.toUpperCase()}] ${bike.brand} ${bike.model} | ${bike.currentPriceEur} € | ${bike.suspensionType} | ${bike.isElectric ? '⚡ E-Bike' : 'Conv.'}`);
      successCount++;
    } catch (err: any) {
      console.error(`  ❌ Error procesando ${url}:`, err.message);
      failCount++;
    }
  }

  saveBikes(CARRETERA_FILE, carreteraBikes);
  saveBikes(GRAVEL_FILE, gravelBikes);
  saveBikes(MONTANA_FILE, montanaBikes);

  console.log("\n========================================================");
  console.log(`🏁 FIN DEL PROCESAMIENTO BIANCHI`);
  console.log(`   Exitosos: ${successCount}`);
  console.log(`   Fallidos: ${failCount}`);
  console.log(`   Carretera total: ${carreteraBikes.length}`);
  console.log(`   Gravel total:    ${gravelBikes.length}`);
  console.log(`   Montaña total:   ${montanaBikes.length}`);
  console.log("========================================================\n");
}

run().catch((e) => console.error("Error fatal:", e));
