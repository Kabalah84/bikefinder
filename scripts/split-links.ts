import fs from "fs";
import path from "path";

const linksFile = path.join(process.cwd(), "links.txt");
const linksDir = path.join(process.cwd(), "links");

if (!fs.existsSync(linksDir)) {
  fs.mkdirSync(linksDir, { recursive: true });
}

const rawLines = fs.readFileSync(linksFile, "utf-8").split("\n");

interface BrandLinkStore {
  carretera: string[];
  gravel: string[];
  montana: string[];
}

const brands: Record<string, BrandLinkStore> = {
  canyon: { carretera: [], gravel: [], montana: [] },
  specialized: { carretera: [], gravel: [], montana: [] },
  scott: { carretera: [], gravel: [], montana: [] },
  giant: { carretera: [], gravel: [], montana: [] },
  liv: { carretera: [], gravel: [], montana: [] },
  orbea: { carretera: [], gravel: [], montana: [] },
};

function detectBrand(url: string): string | null {
  const lower = url.toLowerCase();
  if (lower.includes("canyon.com")) return "canyon";
  if (lower.includes("specialized.com")) return "specialized";
  if (lower.includes("scott-sports.com") || lower.includes("scott.com")) return "scott";
  if (lower.includes("liv-cycling.com")) return "liv";
  if (lower.includes("giant-bicycles.com") || lower.includes("giant.com")) return "giant";
  if (lower.includes("orbea.com")) return "orbea";
  return null;
}

let currentCategory: "carretera" | "gravel" | "montana" = "carretera";

for (const line of rawLines) {
  const trimmed = line.trim();
  if (trimmed.startsWith("#") && trimmed.includes("CARRETERA")) {
    currentCategory = "carretera";
  } else if (trimmed.startsWith("#") && trimmed.includes("GRAVEL")) {
    currentCategory = "gravel";
  } else if (trimmed.startsWith("#") && trimmed.includes("MONTAÑA")) {
    currentCategory = "montana";
  } else if (trimmed.startsWith("http://") || trimmed.startsWith("https://")) {
    const brand = detectBrand(trimmed);
    if (brand && brands[brand]) {
      if (!brands[brand][currentCategory].includes(trimmed)) {
        brands[brand][currentCategory].push(trimmed);
      }
    }
  }
}

for (const [brandName, store] of Object.entries(brands)) {
  const filePath = path.join(linksDir, `${brandName}.txt`);
  const lines: string[] = [];

  const title = brandName.toUpperCase();
  lines.push(`# ==============================================================================`);
  lines.push(`# BIKEFINDER.ES - ENLACES OFICIALES: ${title}`);
  lines.push(`# ==============================================================================`);
  lines.push(``);

  lines.push(`# ------------------------------------------------------------------------------`);
  lines.push(`# CARRETERA (${store.carretera.length} modelos)`);
  lines.push(`# ------------------------------------------------------------------------------`);
  lines.push(...store.carretera);
  lines.push(``);

  lines.push(`# ------------------------------------------------------------------------------`);
  lines.push(`# GRAVEL & ALL-ROAD (${store.gravel.length} modelos)`);
  lines.push(`# ------------------------------------------------------------------------------`);
  lines.push(...store.gravel);
  lines.push(``);

  lines.push(`# ------------------------------------------------------------------------------`);
  lines.push(`# MONTAÑA (MTB) (${store.montana.length} modelos)`);
  lines.push(`# ------------------------------------------------------------------------------`);
  lines.push(...store.montana);
  lines.push(``);

  fs.writeFileSync(filePath, lines.join("\n"), "utf-8");
  const total = store.carretera.length + store.gravel.length + store.montana.length;
  console.log(`✅ ${filePath}: ${total} enlaces (Carretera: ${store.carretera.length}, Gravel: ${store.gravel.length}, MTB: ${store.montana.length})`);
}
