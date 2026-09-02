import fs from "fs";
import path from "path";
import { BikeProductSchema, BrandSchema } from "../src/lib/schema/bike";

function validateJson(filePath: string, schema: any, label: string) {
  console.log(`\n🔍 Validando ${label} (${filePath})...`);
  const content = fs.readFileSync(filePath, "utf-8");
  const items = JSON.parse(content);

  let successCount = 0;
  let errorCount = 0;

  for (const item of items) {
    const result = schema.safeParse(item);
    if (result.success) {
      successCount++;
      console.log(`  ✅ [${result.data.brand || result.data.name}] ${result.data.model || result.data.name} (Validado)`);
    } else {
      errorCount++;
      console.error(`  ❌ Error en ${item.id || item.name || "desconocido"}:`);
      console.error(JSON.stringify(result.error.format(), null, 2));
    }
  }

  console.log(`📊 Resultado ${label}: ${successCount} válidos, ${errorCount} errores.\n`);
  return errorCount === 0;
}

function main() {
  const brandsPath = path.join(__dirname, "../data/brands.json");
  const gravelPath = path.join(__dirname, "../data/bikes/gravel.json");
  const roadPath = path.join(__dirname, "../data/bikes/carretera.json");

  const brandsOk = validateJson(brandsPath, BrandSchema, "Marcas");
  const gravelOk = validateJson(gravelPath, BikeProductSchema, "Gravel");
  const roadOk = validateJson(roadPath, BikeProductSchema, "Carretera");

  if (brandsOk && gravelOk && roadOk) {
    console.log("🎉 ¡El catálogo de las 6 marcas (Canyon, Orbea, Trek, Specialized, Scott, Giant) está 100% validado!");
    process.exit(0);
  } else {
    console.error("💥 Se detectaron errores de validación en el catálogo.");
    process.exit(1);
  }
}

main();
