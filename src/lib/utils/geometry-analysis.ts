export interface GeometryPostureInsight {
  postureType: "endurance" | "balanced" | "aggressive";
  title: string;
  badgeLabel: string;
  badgeColor: string;
  description: string;
}

export function analyzePosture(stackReachRatio: number): GeometryPostureInsight {
  if (stackReachRatio > 1.52) {
    return {
      postureType: "endurance",
      title: "Postura Confort / Gran Fondo",
      badgeLabel: "Confort Erguido",
      badgeColor: "bg-amber-100 text-amber-900 border-amber-300",
      description:
        "Manillar más alto y cercano al ciclista (Stack/Reach > 1.52). Reduce la tensión en la zona lumbar y cuello, ideal para tiradas largas de varias horas.",
    };
  } else if (stackReachRatio >= 1.45) {
    return {
      postureType: "balanced",
      title: "Postura Equilibrada / Polivalente",
      badgeLabel: "Equilibrada",
      badgeColor: "bg-emerald-100 text-emerald-900 border-emerald-300",
      description:
        "Equilibrio perfecto entre penetración aerodinámica y confort para todo tipo de rutas mixtas y puertos.",
    };
  } else {
    return {
      postureType: "aggressive",
      title: "Postura Racing / Agresiva",
      badgeLabel: "Aero Racing",
      badgeColor: "bg-rose-100 text-rose-900 border-rose-300",
      description:
        "Postura baja y alargada (Stack/Reach < 1.45). Maximiza la aerodinámica y la reactividad a expensas de requerir mayor flexibilidad ciclista.",
    };
  }
}
