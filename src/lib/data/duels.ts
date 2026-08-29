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
    bikeIdB: "orbea-terra-m20team-2025",
    title: "Canyon Grizl CF SL 7 vs Orbea Terra M20TEAM: Duelo Gravel de Referencia",
    summary:
      "Dos de las bicicletas de gravel más vendidas del mercado frente a frente. La Canyon Grizl destaca por su paso de rueda de hasta 50 mm y precio directo ajustado, mientras que la Orbea Terra ofrece almacenamiento LOCKR interno en cuadro y ligereza.",
  },
  {
    slug: "canyon-grizl-vs-trek-checkpoint",
    bikeIdA: "canyon-grizl-cf-sl-7-2025",
    bikeIdB: "trek-checkpoint-sl-6-axs-gen-3-2025",
    title: "Canyon Grizl vs Trek Checkpoint SL 6: Mecánica vs Electrónica e IsoSpeed",
    summary:
      "Comparativa técnica entre la aventurera Canyon Grizl y la Trek Checkpoint de 3ª generación con tecnología de absorción IsoSpeed y cambio electrónico inalámbrico SRAM AXS.",
  },
  {
    slug: "canyon-endurace-vs-trek-domane",
    bikeIdA: "canyon-endurace-cf-7-2025",
    bikeIdB: "trek-domane-sl-6-gen-4-2025",
    title: "Canyon Endurace CF 7 vs Trek Domane SL 6: La Batalla del Gran Fondo",
    summary:
      "Las dos reinas de la comodidad en carretera. Analizamos su geometría Stack/Reach para evitar dolor de espalda, paso de rueda para neumáticos de 35-38mm y peso en báscula.",
  },
  {
    slug: "trek-domane-vs-specialized-roubaix",
    bikeIdA: "trek-domane-sl-6-gen-4-2025",
    bikeIdB: "specialized-roubaix-sl8-expert-2025",
    title: "Trek Domane SL 6 vs Specialized Roubaix SL8: IsoSpeed vs Future Shock 3.2",
    summary:
      "El gran enfrentamiento de la micro-suspensión en carretera. IsoSpeed trasero en la Domane frente al cartucho hidráulico delantero Future Shock 3.2 y paso de rueda de 40mm en la Roubaix.",
  },
  {
    slug: "canyon-ultimate-vs-specialized-tarmac",
    bikeIdA: "canyon-ultimate-cf-sl-8-aero-2025",
    bikeIdB: "specialized-tarmac-sl8-pro-2025",
    title: "Canyon Ultimate CF SL Aero vs Specialized Tarmac SL8: Duelo WorldTour",
    summary:
      "Pura escalada y aerodinámica al más alto nivel. Peso pluma de 7.36 kg frente a 7.16 kg con transmisiones electrónicas Shimano Ultegra Di2 y cockpits 100% integrados.",
  },
  {
    slug: "orbea-orca-vs-specialized-tarmac",
    bikeIdA: "orbea-orca-m30iltd-2025",
    bikeIdB: "specialized-tarmac-sl8-pro-2025",
    title: "Orbea Orca OMX vs Specialized Tarmac SL8: Escaladoras Puras",
    summary:
      "Confrontamos el cuadro de carbono OMX de 750g de Orbea personalizable con MyO frente al cono frontal Speed Sniffer de la campeona del mundo Tarmac SL8.",
  },
  {
    slug: "giant-revolt-vs-canyon-grizl",
    bikeIdA: "giant-revolt-advanced-pro-1-2025",
    bikeIdB: "canyon-grizl-cf-sl-7-2025",
    title: "Giant Revolt Advanced Pro vs Canyon Grizl CF SL: Duelo de Paso de Rueda",
    summary:
      "Giant Revolt con puntera Flip Chip (53 mm) y tija D-Fuse frente a la todoterreno Canyon Grizl (50 mm). Ambas con cuadros de carbono y gran capacidad de aventura.",
  },
  {
    slug: "cannondale-topstone-vs-specialized-diverge",
    bikeIdA: "cannondale-topstone-carbon-2-l-2025",
    bikeIdB: "specialized-diverge-str-expert-2025",
    title: "Cannondale Topstone vs Specialized Diverge STR: Suspensión Kingpin vs Future Shock",
    summary:
      "La batalla de la suspensión en gravel. El pivote Kingpin sin amortiguador de Cannondale frente a la doble suspensión activa delantera y trasera Future Shock de Specialized.",
  },
  {
    slug: "giant-defy-vs-trek-domane",
    bikeIdA: "giant-defy-advanced-sl-1-2025",
    bikeIdB: "trek-domane-sl-6-gen-4-2025",
    title: "Giant Defy Advanced SL vs Trek Domane SL 6: Ligereza vs IsoSpeed",
    summary:
      "Confrontamos los 7.30 kg de peso pluma de la Giant Defy frente a la tecnología de absorción IsoSpeed y almacenamiento interno en cuadro de la Trek Domane.",
  },
  {
    slug: "cannondale-supersix-vs-specialized-tarmac",
    bikeIdA: "cannondale-supersix-evo-hi-mod-2-2025",
    bikeIdB: "specialized-tarmac-sl8-pro-2025",
    title: "Cannondale SuperSix EVO vs Specialized Tarmac SL8: Clásicas del WorldTour",
    summary:
      "Dos de las bicicletas más laureadas del pelotón profesional. Tubo de dirección Delta Steerer de Cannondale frente a aerodinámica Speed Sniffer de la Tarmac SL8.",
  },
  {
    slug: "bmc-teammachine-vs-giant-tcr",
    bikeIdA: "bmc-teammachine-slr01-one-2025",
    bikeIdB: "giant-tcr-advanced-sl-0-2025",
    title: "BMC Teammachine SLR01 vs Giant TCR Advanced SL: Supercomputación vs 6.6 kg",
    summary:
      "Ingeniería suiza ACE+ y portabidones integrados frente al peso récord de 6.60 kg con tija integrada de la 10ª generación de la Giant TCR.",
  },
];

export function getDuelBySlug(slug: string): DuelConfig | undefined {
  return POPULAR_DUELS.find((d) => d.slug === slug);
}
