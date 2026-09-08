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
  {
    slug: "canyon-grizl-vs-canyon-grail",
    bikeIdA: "canyon-grizl-cf-8-di2-2026",
    bikeIdB: "canyon-grail-cfr-di2-2026",
    title: "Canyon Grizl CF 8 Di2 vs Canyon Grail CFR Di2: Aventura vs Competición Gravel",
    summary:
      "Grizl con paso de rueda masivo y puntos de anclaje para bikepacking frente a la aerodinámica y ligereza récord (8.18 kg) de la Grail CFR con cockpit integrado.",
  },
  {
    slug: "canyon-aeroad-vs-canyon-ultimate",
    bikeIdA: "canyon-aeroad-cfr-di2-2026",
    bikeIdB: "canyon-ultimate-cfr-axs-2026",
    title: "Canyon Aeroad CFR vs Canyon Ultimate CFR: La Batalla WorldTour",
    summary:
      "Aerodinámica extrema con 7.12 kg frente a los 6.78 kg de peso pluma de la escaladora Ultimate CFR con grupo SRAM RED AXS.",
  },
  {
    slug: "canyon-lux-vs-canyon-spectral",
    bikeIdA: "canyon-lux-trail-cf-7-2026",
    bikeIdB: "canyon-spectral-cf-8-2026",
    title: "Canyon Lux Trail CF 7 vs Canyon Spectral CF 8: Downcountry vs Trail",
    summary:
      "La agilidad escaladora y ligereza de 12.8 kg de la Lux Trail frente a la capacidad bajadora y geometría endurera de la Spectral CF 8.",
  },
];

export function getDuelBySlug(slug: string): DuelConfig | undefined {
  return POPULAR_DUELS.find((d) => d.slug === slug);
}
