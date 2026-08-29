export interface GearRatioInsight {
  minRatio: number;
  maxRatio: number;
  climbingBadge: {
    label: string;
    description: string;
    level: "extreme" | "high" | "standard" | "pro";
  };
  sprintBadge: {
    label: string;
    description: string;
  };
  isOneBy: boolean;
  chainringType: string;
}

export function analyzeGearRatio(
  chainrings: string,
  cassette: string,
  minRatio: number,
  maxRatio: number
): GearRatioInsight {
  const isOneBy = !chainrings.includes("/");

  let climbingLevel: "extreme" | "high" | "standard" | "pro" = "standard";
  let climbingLabel = "Escalador Clásico";
  let climbingDesc = "Apto para puertos de montaña del 7-10% sin atrancarse.";

  if (minRatio < 0.85) {
    climbingLevel = "extreme";
    climbingLabel = "Super Escalador (<0.85)";
    climbingDesc = "Ratio ultracorto ideal para rampas de grava suelta y paredes >18%.";
  } else if (minRatio <= 1.00) {
    climbingLevel = "high";
    climbingLabel = "Gran Escalador (≤1.00)";
    climbingDesc = "Desarrollo 1:1 o inferior para subir puertos duros con agilidad de cadencia.";
  } else if (minRatio <= 1.15) {
    climbingLevel = "standard";
    climbingLabel = "Escalador Carretera";
    climbingDesc = "Desarrollo estándar de carretera para ciclistas en buena forma.";
  } else {
    climbingLevel = "pro";
    climbingLabel = "Rodador / Competición";
    climbingDesc = "Desarrollo exigente pensado para alta potencia en competición.";
  }

  let sprintLabel = "Velocidad Equilibrada";
  let sprintDesc = "Suficiente para llanear a 45-50 km/h.";

  if (maxRatio >= 4.70) {
    sprintLabel = "Sprint Pro (>4.70)";
    sprintDesc = "Desarrollo largo para sprintar y pedalear en bajadas rápidas a más de 60 km/h.";
  } else if (maxRatio >= 4.20) {
    sprintLabel = "Excelente Llano (>4.20)";
    sprintDesc = "Gran desarrollo para rodar a altas velocidades en pelotón.";
  } else {
    sprintLabel = "Ritmo Gravel";
    sprintDesc = "Optimizado para cadencia en pistas sin buscar sprints en asfalto a >55 km/h.";
  }

  return {
    minRatio,
    maxRatio,
    climbingBadge: {
      label: climbingLabel,
      description: climbingDesc,
      level: climbingLevel,
    },
    sprintBadge: {
      label: sprintLabel,
      description: sprintDesc,
    },
    isOneBy,
    chainringType: isOneBy ? "1x Monoplato" : "2x Biplato",
  };
}
