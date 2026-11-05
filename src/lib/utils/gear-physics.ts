export interface TireSize {
  id: string;
  name: string;
  circumferenceMeters: number; // Circunferencia real en metros
}

export const TIRE_SIZES: TireSize[] = [
  { id: "700x25", name: "700 x 25c (Carretera Racing)", circumferenceMeters: 2.105 },
  { id: "700x28", name: "700 x 28c (Carretera Estándar)", circumferenceMeters: 2.136 },
  { id: "700x32", name: "700 x 32c (Gran Fondo / All-Road)", circumferenceMeters: 2.155 },
  { id: "700x38", name: "700 x 38c (Gravel Rápido)", circumferenceMeters: 2.180 },
  { id: "700x40", name: "700 x 40c (Gravel Equilibrado)", circumferenceMeters: 2.200 },
  { id: "700x45", name: "700 x 45c (Gravel Aventura)", circumferenceMeters: 2.224 },
  { id: "700x50", name: "700 x 50c (Gravel Monstruo / 2.0\")", circumferenceMeters: 2.240 },
  { id: "29x2.2", name: "29 x 2.25\" (MTB XC / Maratón)", circumferenceMeters: 2.310 },
  { id: "29x2.4", name: "29 x 2.40\" (MTB Trail / Enduro)", circumferenceMeters: 2.340 },
];

export interface GearCombination {
  chainring: number;
  cog: number;
  ratio: number;
  metersOfDevelopment: number;
  speedAt70Rpm: number;
  speedAt80Rpm: number;
  speedAt90Rpm: number;
  speedAt100Rpm: number;
}

export interface TransmissionPreset {
  id: string;
  name: string;
  category: "Gravel" | "Carretera" | "All-Road" | "MTB";
  chainrings: number[];
  cogs: number[];
  defaultTireId: string;
  description: string;
}

export const TRANSMISSION_PRESETS: TransmissionPreset[] = [
  {
    id: "grx-2x12",
    name: "Shimano GRX 2x12v (48/31T + 11-36T)",
    category: "Gravel",
    chainrings: [48, 31],
    cogs: [11, 13, 15, 17, 19, 21, 24, 27, 30, 33, 36],
    defaultTireId: "700x45",
    description: "El grupo biplato de referencia en gravel: ratio 0.86 para subidas y 4.36 para llanear a >50 km/h.",
  },
  {
    id: "sram-xplr-1x12",
    name: "SRAM XPLR 1x12v (40T + 10-44T)",
    category: "Gravel",
    chainrings: [40],
    cogs: [10, 11, 13, 15, 17, 19, 21, 24, 28, 32, 38, 44],
    defaultTireId: "700x40",
    description: "Monoplato gravel inalámbrico con corona de 10T para velocidad y 44T para subidas (ratio 0.91).",
  },
  {
    id: "sram-mullet-1x12",
    name: "SRAM Mullet Eagle 1x12v (40T + 10-50T)",
    category: "Gravel",
    chainrings: [40],
    cogs: [10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 42, 50],
    defaultTireId: "700x45",
    description: "Desarrollo super escalador para pendientes extremas >20% y bikepacking con carga pesada (ratio 0.80).",
  },
  {
    id: "shimano-105-compact",
    name: "Shimano 105 / Ultegra Di2 Compact (50/34T + 11-34T)",
    category: "Carretera",
    chainrings: [50, 34],
    cogs: [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30, 34],
    defaultTireId: "700x28",
    description: "El estándar dorado de gran fondo y cicloturismo con desarrollo 1:1 (34/34) y plato 50T para rodar.",
  },
  {
    id: "shimano-race-semi-compact",
    name: "Shimano Ultegra / Dura-Ace Semi-Compact (52/36T + 11-30T)",
    category: "Carretera",
    chainrings: [52, 36],
    cogs: [11, 12, 13, 14, 15, 16, 17, 19, 21, 24, 27, 30],
    defaultTireId: "700x28",
    description: "Desarrollo de competición escaladora: saltos de 1 diente entre piñones y plato 52T para sprints a >55 km/h.",
  },
  {
    id: "mtb-1x12-51",
    name: "Shimano XT / SRAM Eagle 1x12v (32T + 10-51T)",
    category: "MTB",
    chainrings: [32],
    cogs: [10, 12, 14, 16, 18, 21, 24, 28, 33, 39, 45, 51],
    defaultTireId: "29x2.2",
    description: "Transmisión estándar de MTB XC y Trail con 510% de rango y ratio de escalada extrema 0.63.",
  },
];

const KNOWN_CASSETTE_COGS: Record<string, number[]> = {
  "10-52": [10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 42, 52],
  "10-51": [10, 12, 14, 16, 18, 21, 24, 28, 33, 39, 45, 51],
  "11-51": [11, 13, 15, 18, 21, 24, 28, 33, 39, 45, 51],
  "10-50": [10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 42, 50],
  "11-50": [11, 13, 15, 17, 19, 22, 25, 28, 32, 36, 42, 50],
  "10-46": [10, 11, 12, 13, 15, 17, 19, 21, 24, 28, 32, 38, 46],
  "11-46": [11, 13, 15, 17, 19, 21, 24, 28, 32, 37, 46],
  "10-45": [10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 40, 45],
  "11-45": [11, 13, 15, 17, 20, 23, 26, 30, 34, 39, 45],
  "10-44": [10, 11, 13, 15, 17, 19, 21, 24, 28, 32, 38, 44],
  "11-44": [11, 12, 13, 15, 17, 19, 21, 24, 28, 32, 38, 44],
  "11-42": [11, 13, 15, 17, 19, 21, 24, 28, 32, 37, 42],
  "11-39": [11, 13, 15, 17, 20, 23, 26, 30, 34, 39],
  "10-36": [10, 11, 12, 13, 15, 17, 19, 21, 24, 28, 32, 36],
  "11-36": [11, 12, 13, 15, 17, 19, 21, 24, 28, 32, 36],
  "11-34": [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30, 34],
  "10-33": [10, 11, 12, 13, 14, 15, 17, 19, 21, 24, 28, 33],
  "11-32": [11, 12, 13, 14, 15, 17, 19, 21, 23, 25, 28, 32],
  "11-30": [11, 12, 13, 14, 15, 16, 17, 19, 21, 24, 27, 30],
};

export function buildCogsFromCassette(cassette: string, speedCount: number = 12): number[] {
  const clean = cassette.replace(/T$/i, "").trim();
  if (KNOWN_CASSETTE_COGS[clean]) {
    return KNOWN_CASSETTE_COGS[clean];
  }
  const parts = clean.split("-").map((c) => parseInt(c.trim(), 10));
  if (parts.length === 2 && parts[0] > 5 && parts[1] > parts[0]) {
    const [minCog, maxCog] = parts;
    const steps = Math.max(7, Math.min(13, speedCount || 12));
    const cogs = new Set<number>([minCog]);
    for (let i = 1; i < steps - 1; i++) {
      const ratio = i / (steps - 1);
      const interpolated = Math.round(minCog * Math.pow(maxCog / minCog, ratio));
      cogs.add(Math.max(minCog + 1, Math.min(maxCog - 1, interpolated)));
    }
    cogs.add(maxCog);
    return Array.from(cogs).sort((a, b) => a - b);
  }
  return [11, 13, 15, 17, 19, 21, 24, 28, 32, 36];
}

export function calculateGearMatrix(
  chainrings: number[],
  cogs: number[],
  tireCircumferenceMeters: number
): GearCombination[] {
  const result: GearCombination[] = [];

  for (const ring of chainrings) {
    if (!Number.isFinite(ring) || ring <= 5) continue;
    for (const cog of cogs) {
      if (!Number.isFinite(cog) || cog <= 5) continue;
      const ratio = ring / cog;
      const meters = ratio * tireCircumferenceMeters;
      result.push({
        chainring: ring,
        cog: cog,
        ratio,
        metersOfDevelopment: Number(meters.toFixed(2)),
        speedAt70Rpm: Number(((meters * 70 * 60) / 1000).toFixed(1)),
        speedAt80Rpm: Number(((meters * 80 * 60) / 1000).toFixed(1)),
        speedAt90Rpm: Number(((meters * 90 * 60) / 1000).toFixed(1)),
        speedAt100Rpm: Number(((meters * 100 * 60) / 1000).toFixed(1)),
      });
    }
  }

  return result;
}
