import fs from "fs";
import path from "path";
import { BikeProduct, BikeProductSchema } from "../src/lib/schema/bike";
import { parseScottHtml } from "./parse-scott";

const CARRETERA_FILE = path.join(process.cwd(), "data", "bikes", "carretera.json");
const GRAVEL_FILE = path.join(process.cwd(), "data", "bikes", "gravel.json");
const MONTANA_FILE = path.join(process.cwd(), "data", "bikes", "montana.json");

export interface ScottTaskItem {
  url: string;
  htmlPath: string;
  discipline: "carretera" | "gravel" | "montana";
}

export async function importScottItem(item: ScottTaskItem): Promise<boolean> {
  if (!fs.existsSync(item.htmlPath)) {
    console.error(`  ❌ Archivo HTML no encontrado: ${item.htmlPath}`);
    return false;
  }

  const html = fs.readFileSync(item.htmlPath, "utf-8");
  const bike = await parseScottHtml(html, item.url, item.discipline);
  if (!bike) {
    console.error(`  ❌ Error al parsear Scott: ${item.url}`);
    return false;
  }

  const validation = BikeProductSchema.safeParse(bike);
  if (!validation.success) {
    console.error(`  ❌ Error de validación Zod en ${bike.model}:`, JSON.stringify(validation.error.format(), null, 2));
    return false;
  }

  // Determinar archivo destino según disciplina
  let targetFile = CARRETERA_FILE;
  if (bike.discipline === "gravel") {
    targetFile = GRAVEL_FILE;
  } else if (bike.discipline === "mtb") {
    targetFile = MONTANA_FILE;
  }

  let catalog: BikeProduct[] = [];
  if (fs.existsSync(targetFile)) {
    catalog = JSON.parse(fs.readFileSync(targetFile, "utf-8"));
  }

  const existingIdx = catalog.findIndex((b) => b.id === bike.id || b.officialUrl === bike.officialUrl);
  if (existingIdx >= 0) {
    catalog[existingIdx] = validation.data;
    console.log(`  🔄 [Actualizado] Scott ${bike.model} (${bike.id}) en ${path.basename(targetFile)}`);
  } else {
    catalog.push(validation.data);
    console.log(`  ✅ [Añadido] Scott ${bike.model} (${bike.id}) a ${path.basename(targetFile)}`);
  }

  fs.writeFileSync(targetFile, JSON.stringify(catalog, null, 2), "utf-8");
  return true;
}

async function main() {
  const queuePath = process.argv[2] || path.join(process.cwd(), "scratch", "scott_queue.json");
  if (!fs.existsSync(queuePath)) {
    console.log(`No queue file found at ${queuePath}. Usage: npx tsx scripts/import-scott-batch.ts [queue_path]`);
    return;
  }

  const items: ScottTaskItem[] = JSON.parse(fs.readFileSync(queuePath, "utf-8"));
  console.log(`\n🚴 Procesando ${items.length} bicicletas Scott desde la cola...`);

  let successCount = 0;
  let failCount = 0;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    console.log(`[${i + 1}/${items.length}] ${item.url}`);
    const ok = await importScottItem(item);
    if (ok) successCount++;
    else failCount++;
  }

  console.log(`\n🏁 Finalizado: ${successCount} importados con éxito, ${failCount} fallos.`);
}

if (require.main === module) {
  main().catch(console.error);
}
