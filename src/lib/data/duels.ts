export interface DuelConfig {
  slug: string;
  bikeIdA: string;
  bikeIdB: string;
  title: string;
  summary: string;
}

export const POPULAR_DUELS: DuelConfig[] = [
  // --- CARRETERA COMPETICIÓN & AERO ---
  {
    slug: "specialized-tarmac-vs-pinarello-dogma",
    bikeIdA: "specialized-s-works-tarmac-sl9-shimano-dura-ace-di2-2026",
    bikeIdB: "pinarello-dogma-f-my26-2026",
    title: "Specialized Tarmac SL9 vs Pinarello Dogma F: Duelo Reina del WorldTour",
    summary:
      "El enfrentamiento definitivo de la élite ciclista profesional. Comparamos la legendaria aerodinámica Speed Sniffer y ligereza de la Tarmac SL9 frente a las formas asimétricas italianas y precisión de carbono M40X de la mítica Dogma F.",
  },
  {
    slug: "canyon-aeroad-vs-merida-scultura",
    bikeIdA: "canyon-aeroad-cf-slx-8-di2-2027",
    bikeIdB: "merida-scultura-10k-2026",
    title: "Canyon Aeroad CF SLX vs Merida Scultura 10K: Máxima Velocidad vs Escalada",
    summary:
      "Duelo directo entre la referencia aerodinámica alemana Aeroad CF SLX con Shimano Ultegra Di2 y cockpit Pace Bar frente al peso pluma y confort escalador de la Scultura 10K de Merida.",
  },
  {
    slug: "giant-tcr-vs-cannondale-supersix",
    bikeIdA: "giant-tcr-advanced-0-pro-compact-2026",
    bikeIdB: "cannondale-supersix-evo-1-2026",
    title: "Giant TCR Advanced vs Cannondale SuperSix EVO: Leyendas de la Competición",
    summary:
      "Confrontación técnica entre dos iconos del pelotón: la rigidez torsional y ligereza del cuadro Compact Road de Giant TCR frente a la integración y dirección Delta Steerer de la SuperSix EVO de Cannondale.",
  },
  {
    slug: "canyon-aeroad-vs-canyon-endurace",
    bikeIdA: "canyon-aeroad-cf-slx-9-axs-2026",
    bikeIdB: "canyon-endurace-cf-6-2027",
    title: "Canyon Aeroad CF SLX vs Canyon Endurace CF 6: Aero vs Gran Fondo",
    summary:
      "Duelo de filosofías dentro de la marca alemana: la máquina aerodinámica pura de competición Aeroad (SRAM RED AXS) frente a la confortable Gran Fondo Endurace con paso de rueda de 38 mm y postura descansada para largas distancias.",
  },
  {
    slug: "canyon-aeroad-vs-canyon-ultimate",
    bikeIdA: "canyon-aeroad-cfr-di2-2027",
    bikeIdB: "canyon-ultimate-cfr-axs-2026",
    title: "Canyon Aeroad CFR vs Canyon Ultimate CFR: La Batalla WorldTour de Canyon",
    summary:
      "Aerodinámica extrema en el llano con la Aeroad CFR frente al récord de ligereza en puertos de montaña de la escaladora pura Ultimate CFR con carbono de ultra-alto módulo.",
  },

  // --- GRAVEL & AVENTURA ---
  {
    slug: "megamo-jakar-vs-canyon-grizl",
    bikeIdA: "megamo-jakar-20-2027",
    bikeIdB: "canyon-grizl-6-2027",
    title: "Megamo Jakar vs Canyon Grizl: El Gran Duelo Gravel Súper Ventas",
    summary:
      "Las dos bicicletas de gravel de referencia más populares y deseadas del mercado español. La versatilidad y precio imbatible de la Megamo Jakar frente a los 50 mm de paso de rueda y robustez alemana de la Canyon Grizl.",
  },
  {
    slug: "merida-silex-vs-giant-revolt",
    bikeIdA: "merida-silex-400-2026",
    bikeIdB: "giant-revolt-1-2026",
    title: "Merida Silex 400 vs Giant Revolt 1: Reinas del Gravel Polivalente",
    summary:
      "La laureada Merida Silex (geometría inspirada en MTB con pipa de dirección alta) frente a la versatilidad de la Giant Revolt con tija D-Fuse y puntera Flip-Chip para ajustar la distancia entre ejes.",
  },
  {
    slug: "specialized-diverge-vs-cannondale-topstone",
    bikeIdA: "specialized-diverge-4-comp-alloy-sram-apex-2026",
    bikeIdB: "cannondale-topstone-1-2026",
    title: "Specialized Diverge vs Cannondale Topstone: Innovación en Absorción Gravel",
    summary:
      "Comparativa técnica entre la tecnología de amortiguación delantera Future Shock en la Diverge frente al sistema de pivote flexible Kingpin y geometría OutFront de la Cannondale Topstone.",
  },
  {
    slug: "canyon-grizl-vs-canyon-grail",
    bikeIdA: "canyon-grizl-cf-8-di2-2026",
    bikeIdB: "canyon-grail-cfr-di2-2026",
    title: "Canyon Grizl CF vs Canyon Grail CFR: Aventura Bikepacking vs Competición Rápida",
    summary:
      "Grizl con paso de rueda masivo y múltiples puntos de anclaje para bolsas frente a la aerodinámica agresiva, ligereza récord y manillar Double Decker / Gear Groove de la Grail CFR.",
  },

  // --- CARRETERA GRAN FONDO / ENDURANCE ---
  {
    slug: "giant-defy-vs-specialized-roubaix",
    bikeIdA: "giant-defy-advanced-0-2026",
    bikeIdB: "specialized-roubaix-sl8-comp-2026",
    title: "Giant Defy Advanced vs Specialized Roubaix SL8: Las Reinas del Gran Fondo",
    summary:
      "Máximo confort para superar los 150 km sin fatiga lumbar. La Giant Defy con cuadro ligero y tija D-Fuse frente al cartucho de suspensión hidráulica Future Shock 3.0 de la Specialized Roubaix SL8.",
  },

  // --- MONTAÑA / MTB (XC, DOWNCOUNTRY & TRAIL) ---
  {
    slug: "cannondale-scalpel-vs-scott-spark",
    bikeIdA: "cannondale-scalpel-2-lefty-2026",
    bikeIdB: "scott-spark-910-2026",
    title: "Cannondale Scalpel vs Scott Spark: El Clásico de la Copa del Mundo XCO",
    summary:
      "Dos de las dobles de cross-country más laureadas del planeta. La revolucionaria horquilla monobrazo Lefty Ocho y suspensión FlexPivot de la Scalpel frente al amortiguador integrado en cuadro y sistema TwinLoc de la Scott Spark.",
  },
  {
    slug: "canyon-lux-vs-bh-lynx",
    bikeIdA: "canyon-lux-trail-cf-6-2027",
    bikeIdB: "bh-lynx-race-3-0-2026",
    title: "Canyon Lux Trail vs BH Lynx Race: Duelo Europeo de Doble Suspensión",
    summary:
      "La consagrada Canyon Lux Trail con cinemática progresiva y peso pluma frente al aclamado sistema Split Pivot de BH Lynx Race que aísla las fuerzas de pedaleo y frenada en senderos técnicos.",
  },
  {
    slug: "specialized-epic-vs-megamo-track",
    bikeIdA: "specialized-epic-8-expert-di2-2026",
    bikeIdB: "megamo-track-00-slr-2026",
    title: "Specialized Epic 8 vs Megamo Track SLR: Pura Reactividad Maratón",
    summary:
      "La referencia mundial de carreras por etapas Specialized Epic 8 con cinemática optimizada frente al diseño ultraligero monocasco y montaje tope de gama de la Megamo Track SLR.",
  },
  {
    slug: "canyon-lux-vs-canyon-spectral",
    bikeIdA: "canyon-lux-trail-cf-7-2027",
    bikeIdB: "canyon-spectral-cf-8-2027",
    title: "Canyon Lux Trail vs Canyon Spectral: Downcountry vs Trail Agresivo",
    summary:
      "La agilidad escaladora y reactividad de 120 mm de la Lux Trail frente al aplomo en descensos rotos, horquilla de 150 mm y geometría relajada de la Spectral CF 8.",
  },
];

export function getDuelBySlug(slug: string): DuelConfig | undefined {
  return POPULAR_DUELS.find((d) => d.slug === slug);
}
