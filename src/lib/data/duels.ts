export interface DuelConfig {
  slug: string;
  bikeIdA: string;
  bikeIdB: string;
  title: string;
  summary: string;
}

export const POPULAR_DUELS: DuelConfig[] = [
  {
    slug: "canyon-aeroad-vs-canyon-endurace",
    bikeIdA: "canyon-aeroad-cf-slx-9-axs-2026",
    bikeIdB: "canyon-endurace-cf-6-2026",
    title: "Canyon Aeroad CF SLX 9 AXS vs Canyon Endurace CF 6: Aero vs Gran Fondo",
    summary:
      "Duelo directo entre la máquina aerodinámica pura de competición Aeroad CF SLX 9 AXS (7.40 kg, SRAM RED AXS, ruedas Zipp de 58 mm) y la confortable Gran Fondo Endurace CF 6 (8.88 kg, paso de rueda de 38 mm y postura descansada).",
  },
];

export function getDuelBySlug(slug: string): DuelConfig | undefined {
  return POPULAR_DUELS.find((d) => d.slug === slug);
}
