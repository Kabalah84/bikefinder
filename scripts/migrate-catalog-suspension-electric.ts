import fs from "fs";
import path from "path";
import { BikeProduct, BikeProductSchema, SuspensionType } from "../src/lib/schema/bike";

function detectIsElectric(bike: any): boolean {
  const model = bike.model || "";
  const id = bike.id || "";
  const url = bike.officialUrl || "";

  // Keywords in model / id / url
  if (/(?:e\+|eride|turbo|:on\b|\bneo\b|ilynx|hybrid|electric)/i.test(model)) return true;
  if (/(?:e\+|eride|turbo|:on\b|\bneo\b|ilynx|hybrid|electric)/i.test(id)) return true;
  if (/(\/electric\/|\/e-bikes\/|\/e-mountain\/|\/e-road\/|\/e-gravel\/)/i.test(url)) return true;

  // Check detailed specs for motor / battery mentions
  if (bike.detailedSpecs && Array.isArray(bike.detailedSpecs)) {
    for (const cat of bike.detailedSpecs) {
      for (const item of cat.items || []) {
        const text = `${item.label} ${item.value}`.toLowerCase();
        if (/(?:motor|batería|battery|drive unit|bosch|shimano ep|mahle|fazua|tq|brose)/i.test(text)) {
          return true;
        }
      }
    }
  }

  return false;
}

function detectSuspensionType(bike: any, disciplineSection: "carretera" | "gravel" | "montana"): SuspensionType {
  const model = (bike.model || "").toLowerCase();

  if (disciplineSection === "carretera") {
    return "rigid";
  }

  if (disciplineSection === "gravel") {
    if (bike.forkMaterial === "suspension" || /suspension|lefty|rudy/i.test(model)) {
      return "hardtail";
    }
    return "rigid";
  }

  // Montana (MTB)
  if (/epic hardtail/i.test(model) || /scalpel ht/i.test(model) || /habit ht/i.test(model) || /xc hardtail/i.test(model)) {
    return "hardtail";
  }

  const fullSuspensionKeywords = [
    "spark", "ransom", "genius", "gambler", "reign", "trance", "anthem", "stance",
    "faith", "glory", "embolden", "pique", "intrigue", "lynx", "stumpjumper", "status",
    "epic", "spectral", "lux", "sender", "neuron", "strive", "torque", "demo", "enduro",
    "scalpel", "habit", "bad habit", "moterra", "methanol fs", "track", "ninety-six",
    "one-twenty", "one-forty", "one-sixty", "dogma xc", "pinarello xc"
  ];

  if (fullSuspensionKeywords.some((k) => model.includes(k))) {
    return "full";
  }

  const hardtailKeywords = [
    "scale", "xtc", "talon", "stp", "fathom", "tempt", "lurra", "ultimate", "expert",
    "spike", "chisel", "rockhopper", "exceed", "grand canyon", "trail", "duel", "nitron",
    "magma", "methanol rs", "factory", "natural", "sport", "ku2", "ku4", "dx3",
    "bignine", "bigseven", "bigtrail", "dirt"
  ];

  if (hardtailKeywords.some((k) => model.includes(k))) {
    return "hardtail";
  }

  return "hardtail";
}

function migrateFile(filePath: string, section: "carretera" | "gravel" | "montana") {
  const fullPath = path.resolve(filePath);
  const rawData: any[] = JSON.parse(fs.readFileSync(fullPath, "utf-8"));

  let electricCount = 0;
  let rigidCount = 0;
  let hardtailCount = 0;
  let fullCount = 0;

  const migrated: BikeProduct[] = rawData.map((bike) => {
    const isElectric = detectIsElectric(bike);
    const suspensionType = detectSuspensionType(bike, section);

    if (isElectric) electricCount++;
    if (suspensionType === "rigid") rigidCount++;
    else if (suspensionType === "hardtail") hardtailCount++;
    else if (suspensionType === "full") fullCount++;

    const updated = {
      ...bike,
      isElectric,
      suspensionType,
    };

    // Strict validation
    return BikeProductSchema.parse(updated);
  });

  fs.writeFileSync(fullPath, JSON.stringify(migrated, null, 2), "utf-8");

  console.log(`\n✅ Migrado ${path.basename(filePath)}:`);
  console.log(`   Total: ${migrated.length}`);
  console.log(`   Eléctricas: ${electricCount}, Convencionales: ${migrated.length - electricCount}`);
  console.log(`   Suspensión -> Rígida: ${rigidCount}, Hardtail: ${hardtailCount}, Doble: ${fullCount}`);
}

function main() {
  console.log("Iniciando migración de catálogo para suspensionType e isElectric...");
  migrateFile("data/bikes/carretera.json", "carretera");
  migrateFile("data/bikes/gravel.json", "gravel");
  migrateFile("data/bikes/montana.json", "montana");
  console.log("\n🎉 ¡Migración completada con éxito!");
}

main();
