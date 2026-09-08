import fs from "fs";
import path from "path";
import { importBikeFromUrl } from "./import-bike";

async function main() {
  const linksPath = path.join(process.cwd(), "links.txt");
  if (!fs.existsSync(linksPath)) {
    console.error(`❌ No se encontró el archivo ${linksPath}`);
    process.exit(1);
  }

  const rawLines = fs.readFileSync(linksPath, "utf-8").split("\n");
  const urls = rawLines
    .map((l) => l.trim())
    .filter((l) => l.length > 0 && !l.startsWith("#") && (l.startsWith("http://") || l.startsWith("https://")));

  console.log(`\n📋 Se encontraron ${urls.length} enlaces para procesar en links.txt.\n`);

  for (let i = 0; i < urls.length; i++) {
    const url = urls[i];
    console.log(`[${i + 1}/${urls.length}] Procesando: ${url}`);
    try {
      await importBikeFromUrl(url);
    } catch (err: any) {
      console.error(`  ⚠️ Error al procesar ${url}:`, err.message);
    }
  }

  console.log("\n🏁 Procesamiento de links.txt finalizado.");
}

main();
