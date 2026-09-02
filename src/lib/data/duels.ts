export interface DuelConfig {
  slug: string;
  bikeIdA: string;
  bikeIdB: string;
  title: string;
  summary: string;
}

export const POPULAR_DUELS: DuelConfig[] = [
  {
    slug: "canyon-grizl-vs-orbea-terra",
    bikeIdA: "canyon-grizl-cf-sl-7-2025",
    bikeIdB: "orbea-terra-m30team-2025",
    title: "Canyon Grizl CF SL 7 vs Orbea Terra M30TEAM: Duelo Gravel de Referencia",
    summary:
      "Dos de las bicicletas de gravel más vendidas del mercado frente a frente. La Canyon Grizl destaca por su paso de rueda de hasta 50 mm y precio directo ajustado, mientras que la Orbea Terra ofrece almacenamiento LOCKR interno en cuadro y ligereza.",
  },
  {
    slug: "canyon-grizl-vs-trek-checkpoint",
    bikeIdA: "canyon-grizl-cf-sl-7-2025",
    bikeIdB: "trek-checkpoint-sl-5-gen-3-2025",
    title: "Canyon Grizl vs Trek Checkpoint SL 5: Paso de 50mm vs IsoSpeed",
    summary:
      "Comparativa técnica entre la aventurera Canyon Grizl y la Trek Checkpoint de 3ª generación con tecnología de absorción IsoSpeed y guantera interna BITS.",
  },
  {
    slug: "canyon-endurace-vs-trek-domane",
    bikeIdA: "canyon-endurace-cf-7-2025",
    bikeIdB: "trek-domane-sl-5-gen-4-2025",
    title: "Canyon Endurace CF 7 vs Trek Domane SL 5: La Batalla del Gran Fondo",
    summary:
      "Las dos reinas de la comodidad en carretera. Analizamos su geometría Stack/Reach para evitar dolor de espalda, paso de rueda para neumáticos anchos y peso en báscula.",
  },
  {
    slug: "trek-domane-vs-specialized-roubaix",
    bikeIdA: "trek-domane-sl-5-gen-4-2025",
    bikeIdB: "specialized-roubaix-sl8-comp-2025",
    title: "Trek Domane SL 5 vs Specialized Roubaix SL8: IsoSpeed vs Future Shock 3.2",
    summary:
      "El gran enfrentamiento de la micro-suspensión en carretera. IsoSpeed trasero en la Domane frente al cartucho hidráulico delantero Future Shock 3.2 y paso de rueda de 40mm en la Roubaix.",
  },
  {
    slug: "canyon-ultimate-vs-specialized-tarmac",
    bikeIdA: "canyon-ultimate-cf-sl-8-di2-2025",
    bikeIdB: "specialized-tarmac-sl8-comp-2025",
    title: "Canyon Ultimate CF SL 8 Di2 vs Specialized Tarmac SL8: Duelo WorldTour",
    summary:
      "Pura escalada y aerodinámica al más alto nivel. Peso pluma de 7.42 kg con Ultegra Di2 frente a la aerodinámica Speed Sniffer de la campeona Tarmac SL8 con 105 Di2.",
  },
  {
    slug: "orbea-orca-vs-specialized-tarmac",
    bikeIdA: "orbea-orca-m30i-2025",
    bikeIdB: "specialized-tarmac-sl8-comp-2025",
    title: "Orbea Orca M30i vs Specialized Tarmac SL8: Escaladoras Puras",
    summary:
      "Confrontamos el cuadro de carbono OMR de Orbea con cambio electrónico 105 Di2 y MyO frente a la aerodinámica Speed Sniffer de la Tarmac SL8.",
  },
  {
    slug: "giant-revolt-vs-canyon-grizl",
    bikeIdA: "giant-revolt-advanced-2-2025",
    bikeIdB: "canyon-grizl-cf-sl-7-2025",
    title: "Giant Revolt Advanced vs Canyon Grizl CF SL: Duelo de Paso de Rueda",
    summary:
      "Giant Revolt con puntera Flip Chip (53 mm) y tija D-Fuse frente a la todoterreno Canyon Grizl (50 mm). Ambas con cuadros de carbono y gran capacidad de aventura.",
  },
  {
    slug: "scott-addict-gravel-vs-specialized-diverge",
    bikeIdA: "scott-addict-gravel-30-2025",
    bikeIdB: "specialized-diverge-sport-carbon-2025",
    title: "Scott Addict Gravel vs Specialized Diverge: Integración Suiza vs Future Shock",
    summary:
      "El diseño integrado Syncros y deportividad suiza de la Addict Gravel frente a la comodidad de la suspensión activa delantera Future Shock 1.5 de la Diverge.",
  },
  {
    slug: "giant-defy-vs-trek-domane",
    bikeIdA: "giant-defy-advanced-2-2025",
    bikeIdB: "trek-domane-sl-5-gen-4-2025",
    title: "Giant Defy Advanced 2 vs Trek Domane SL 5: Tecnología D-Fuse vs IsoSpeed",
    summary:
      "Confrontamos la absorción natural de carbono D-Fuse y desarrollo 11-36T de la Giant Defy frente a la suspensión mecánica IsoSpeed de la Trek Domane.",
  },
  {
    slug: "scott-addict-vs-giant-tcr",
    bikeIdA: "scott-addict-30-2025",
    bikeIdB: "giant-tcr-advanced-1-disc-2025",
    title: "Scott Addict 30 vs Giant TCR Advanced 1 Disc: Gran Fondo vs Escalada Pura",
    summary:
      "Comparamos la postura cómoda y cableado Syncros de la Scott Addict frente a la rigidez explosiva de competición de la mítica Giant TCR.",
  },
  {
    slug: "orbea-terra-vs-giant-revolt",
    bikeIdA: "orbea-terra-m30team-2025",
    bikeIdB: "giant-revolt-advanced-2-2025",
    title: "Orbea Terra M30TEAM vs Giant Revolt Advanced 2: Lockr vs Flip Chip",
    summary:
      "La guantera interna Lockr de Orbea frente a la puntera ajustable Flip Chip de Giant. Dos de las gravel de carbono más completas del mercado.",
  },
];

export function getDuelBySlug(slug: string): DuelConfig | undefined {
  return POPULAR_DUELS.find((d) => d.slug === slug);
}
