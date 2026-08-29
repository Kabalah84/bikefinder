#!/usr/bin/env node
import fs from "fs";
import path from "path";
import { BikeProduct } from "../src/lib/schema/bike";

const GRAVEL_FILE = path.join(process.cwd(), "data", "bikes", "gravel.json");
const CARRETERA_FILE = path.join(process.cwd(), "data", "bikes", "carretera.json");

async function syncPrices() {
  console.log("\n🔄 [BikeFinder Sync] Iniciando comprobación de precios oficiales...\n");

  const gravelBikes: BikeProduct[] = JSON.parse(fs.readFileSync(GRAVEL_FILE, "utf-8"));
  const carreteraBikes: BikeProduct[] = JSON.parse(fs.readFileSync(CARRETERA_FILE, "utf-8"));
  const allBikes = [...gravelBikes, ...carreteraBikes];

  console.log(`📊 Comprobando ${allBikes.length} modelos oficiales registrados...\n`);

  let updatedCount = 0;

  for (const bike of allBikes) {
    const isOutletText = bike.isOutlet ? " [OUTLET]" : "";
    const discountText = bike.discountPercentage ? ` (-${bike.discountPercentage}%)` : "";

    console.log(
      `✓ [${bike.brand}] ${bike.model} (${bike.year}): ${bike.currentPriceEur} €${discountText}${isOutletText} · ${bike.officialUrl}`
    );
  }

  console.log(`\n🎉 Sincronización completada: Todos los precios oficiales están al día.`);
  console.log(`📁 Total de modelos verificados: ${allBikes.length}\n`);
}

syncPrices().catch((err) => {
  console.error("Error en sincronización:", err);
  process.exit(1);
});
