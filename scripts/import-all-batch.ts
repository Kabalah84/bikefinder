import fs from "fs";
import path from "path";
import { BikeProduct, BikeProductSchema, Discipline } from "../src/lib/schema/bike";
import { parseCanyonHtml } from "./parse-canyon";
import { parseSpecializedHtml } from "./parse-specialized";

const CARRETERA_FILE = path.join(process.cwd(), "data", "bikes", "carretera.json");
const GRAVEL_FILE = path.join(process.cwd(), "data", "bikes", "gravel.json");
const MONTANA_FILE = path.join(process.cwd(), "data", "bikes", "montana.json");

interface LinkItem {
  url: string;
  discipline: Discipline;
}

function parseLinksFile(): LinkItem[] {
  const linksPath = path.join(process.cwd(), "links.txt");
  if (!fs.existsSync(linksPath)) {
    console.error(`❌ No existe ${linksPath}`);
    return [];
  }

  const lines = fs.readFileSync(linksPath, "utf-8").split("\n");
  let currentDiscipline: Discipline = "road_race";
  const items: LinkItem[] = [];

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed) continue;

    if (trimmed.startsWith("#")) {
      const upper = trimmed.toUpperCase();
      if (upper.includes("GRAVEL")) {
        currentDiscipline = "gravel";
      } else if (upper.includes("CARRETERA")) {
        currentDiscipline = "road_race";
      } else if (upper.includes("MONTAÑA") || upper.includes("MONTANA") || upper.includes("MTB")) {
        currentDiscipline = "mtb";
      }
      continue;
    }

    if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
      let disc: Discipline = currentDiscipline;
      const lowerUrl = trimmed.toLowerCase();
      if (lowerUrl.includes("endurace") || lowerUrl.includes("roubaix")) {
        disc = "road_endurance";
      } else if (
        lowerUrl.includes("grail") ||
        lowerUrl.includes("grizl") ||
        lowerUrl.includes("crux") ||
        lowerUrl.includes("diverge")
      ) {
        disc = "gravel";
      } else if (
        lowerUrl.includes("montana") ||
        lowerUrl.includes("mountain") ||
        lowerUrl.includes("spectral") ||
        lowerUrl.includes("lux") ||
        lowerUrl.includes("exceed") ||
        lowerUrl.includes("sender") ||
        lowerUrl.includes("torque") ||
        lowerUrl.includes("strive") ||
        lowerUrl.includes("neuron") ||
        lowerUrl.includes("grand-canyon") ||
        lowerUrl.includes("epic") ||
        lowerUrl.includes("stumpjumper") ||
        lowerUrl.includes("chisel") ||
        lowerUrl.includes("rockhopper") ||
        lowerUrl.includes("enduro") ||
        lowerUrl.includes("demo") ||
        lowerUrl.includes("status")
      ) {
        disc = "mtb";
      }

      items.push({ url: trimmed, discipline: disc });
    }
  }

  return items;
}

async function fetchWithRetry(url: string, retries = 2): Promise<string> {
  for (let attempt = 0; attempt <= retries; attempt++) {
    try {
      const res = await fetch(url, {
        headers: {
          "User-Agent":
            "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36",
          "Accept-Language": "es-ES,es;q=0.9,en;q=0.8",
          Accept: "text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8",
        },
      });
      if (res.ok) {
        return await res.text();
      }
      console.warn(`  ⚠️ HTTP ${res.status} en ${url}`);
    } catch (err: any) {
      if (attempt === retries) throw err;
      await new Promise((r) => setTimeout(r, 1000));
    }
  }
  return "";
}

async function main() {
  const items = parseLinksFile();
  console.log(`\n📦 Se detectaron ${items.length} enlaces oficiales en links.txt.\n`);

  const carreteraMap = new Map<string, BikeProduct>();
  const gravelMap = new Map<string, BikeProduct>();
  const montanaMap = new Map<string, BikeProduct>();

  if (fs.existsSync(CARRETERA_FILE)) {
    const data: BikeProduct[] = JSON.parse(fs.readFileSync(CARRETERA_FILE, "utf-8"));
    data.forEach((b) => carreteraMap.set(b.officialUrl, b));
  }
  if (fs.existsSync(GRAVEL_FILE)) {
    const data: BikeProduct[] = JSON.parse(fs.readFileSync(GRAVEL_FILE, "utf-8"));
    data.forEach((b) => gravelMap.set(b.officialUrl, b));
  }
  if (fs.existsSync(MONTANA_FILE)) {
    const data: BikeProduct[] = JSON.parse(fs.readFileSync(MONTANA_FILE, "utf-8"));
    data.forEach((b) => montanaMap.set(b.officialUrl, b));
  }

  let successCount = 0;
  let failCount = 0;

  // Lotes de 4 solicitudes simultáneas para respetar rate limits de los fabricantes
  const BATCH_SIZE = 4;
  for (let i = 0; i < items.length; i += BATCH_SIZE) {
    const batch = items.slice(i, i + BATCH_SIZE);
    await Promise.all(
      batch.map(async ({ url, discipline }, idx) => {
        const globalIdx = i + idx + 1;
        const brand = url.includes("specialized.com") ? "Specialized" : "Canyon";

        const alreadyExists =
          carreteraMap.has(url) || gravelMap.has(url) || montanaMap.has(url);
        if (alreadyExists) {
          console.log(`[${globalIdx}/${items.length}] ⏭️ (${brand}) Ya en catálogo: ${url.split("?")[0]}`);
          successCount++;
          return;
        }

        console.log(`[${globalIdx}/${items.length}] 📥 (${brand}) Descargando: ${url.split("?")[0]}`);

        try {
          const html = await fetchWithRetry(url);
          if (!html) {
            failCount++;
            return;
          }

          let bike: BikeProduct | null = null;
          if (brand === "Specialized") {
            bike = parseSpecializedHtml(html, url, discipline);
          } else {
            bike = parseCanyonHtml(html, url, discipline);
          }

          if (!bike) {
            console.error(`  ❌ No se pudo parsear: ${url}`);
            failCount++;
            return;
          }

          // Validación con schema Zod
          const val = BikeProductSchema.safeParse(bike);
          if (!val.success) {
            console.error(`  ❌ Error de validación en ${bike.model}:`, JSON.stringify(val.error.format(), null, 2));
            failCount++;
            return;
          }

          if (bike.discipline === "gravel") {
            gravelMap.set(bike.officialUrl, bike);
          } else if (bike.discipline === "mtb") {
            montanaMap.set(bike.officialUrl, bike);
          } else {
            carreteraMap.set(bike.officialUrl, bike);
          }

          successCount++;
          console.log(`  ✅ [${bike.discipline.toUpperCase()}] ${bike.brand} ${bike.model} (${bike.currentPriceEur} € | ${bike.weightKg ? bike.weightKg + " kg" : "N/D"})`);
        } catch (err: any) {
          failCount++;
          console.error(`  ❌ Error en ${url}:`, err.message);
        }
      })
    );
  }

  // Comprobar y asegurar IDs únicos
  const allBikes = [
    ...Array.from(carreteraMap.values()),
    ...Array.from(gravelMap.values()),
    ...Array.from(montanaMap.values()),
  ];

  const seenIds = new Set<string>();
  for (const b of allBikes) {
    if (seenIds.has(b.id)) {
      // Diferenciar agregando código o parte de la URL
      const codeMatch = b.officialUrl.match(/[\/p\/|\/](\d+)/);
      const suffix = codeMatch ? codeMatch[1] : Math.random().toString(36).substring(2, 6);
      b.id = `${b.id}-${suffix}`;
    }
    seenIds.add(b.id);
  }

  const carreteraList = Array.from(carreteraMap.values());
  const gravelList = Array.from(gravelMap.values());
  const montanaList = Array.from(montanaMap.values());

  fs.writeFileSync(CARRETERA_FILE, JSON.stringify(carreteraList, null, 2), "utf-8");
  fs.writeFileSync(GRAVEL_FILE, JSON.stringify(gravelList, null, 2), "utf-8");
  fs.writeFileSync(MONTANA_FILE, JSON.stringify(montanaList, null, 2), "utf-8");

  console.log("\n=======================================================");
  console.log(`🎉 Importación por lotes finalizada:`);
  console.log(`   - Éxitos procesados: ${successCount}`);
  console.log(`   - Fallos: ${failCount}`);
  console.log(`   - Total Carretera en catálogo: ${carreteraList.length}`);
  console.log(`   - Total Gravel en catálogo: ${gravelList.length}`);
  console.log(`   - Total Montaña en catálogo: ${montanaList.length}`);
  console.log(`   - TOTAL BICICLETAS EN CATÁLOGO: ${allBikes.length}`);
  console.log("=======================================================\n");
}

main().catch(console.error);
