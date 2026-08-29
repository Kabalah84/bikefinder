import { BikeProduct, Discipline } from "@/lib/schema/bike";

export interface UserPreferences {
  terrain: "gravel_adventure" | "road_endurance" | "road_race" | "all_road";
  budgetMax: number;
  shifting: "electronic" | "mechanical" | "any";
  priority: "weight" | "comfort" | "clearance" | "value";
}

export interface RecommendationResult {
  bike: BikeProduct;
  score: number; // 0 a 100
  badge: string; // ej. "Match Perfecto", "Mejor Relación Calidad/Precio", "Opción Confort"
  reasons: string[];
}

export function calculateRecommendations(
  bikes: BikeProduct[],
  prefs: UserPreferences
): RecommendationResult[] {
  const scoredList: RecommendationResult[] = [];

  for (const bike of bikes) {
    let score = 0;
    const reasons: string[] = [];

    // 1. Evaluación de Terreno vs Disciplina (hasta 40 pts)
    if (prefs.terrain === "gravel_adventure") {
      if (bike.discipline === "gravel") {
        score += 40;
        reasons.push(`Geometría gravel y paso de rueda de ${bike.maxTireClearanceMm} mm para rodar por pistas y grava suelta.`);
      } else if (bike.discipline === "all_road") {
        score += 25;
        reasons.push("Opción All-Road versátil para combinar carretera con pistas sencillas.");
      }
    } else if (prefs.terrain === "road_endurance") {
      if (bike.discipline === "road_endurance") {
        score += 40;
        reasons.push(`Postura Gran Fondo erguida (Stack/Reach ${bike.geometry.stackReachRatio.toFixed(2)}) para máxima comodidad en largas distancias.`);
      } else if (bike.discipline === "all_road") {
        score += 30;
        reasons.push("Gran capacidad de absorción y paso de rueda generoso para carreteras rugosas.");
      }
    } else if (prefs.terrain === "road_race") {
      if (bike.discipline === "road_race") {
        score += 40;
        reasons.push("Geometría de competición agresiva y máxima rigidez aerodinámica para alta velocidad.");
      } else if (bike.discipline === "road_endurance") {
        score += 20;
      }
    } else if (prefs.terrain === "all_road") {
      if (bike.discipline === "all_road" || bike.discipline === "road_endurance") {
        score += 40;
        reasons.push(`Paso de rueda polivalente (${bike.maxTireClearanceMm} mm) ideal para 70% asfalto y 30% caminos.`);
      } else if (bike.discipline === "gravel") {
        score += 30;
      }
    }

    // 2. Evaluación de Presupuesto (hasta 25 pts)
    if (bike.currentPriceEur <= prefs.budgetMax) {
      const priceRatio = bike.currentPriceEur / prefs.budgetMax;
      score += 25;
      if (priceRatio < 0.8) {
        reasons.push(`Dentro de tu presupuesto por un margen de ${(prefs.budgetMax - bike.currentPriceEur).toLocaleString("es-ES")} €.`);
      }
    } else {
      const overBudget = bike.currentPriceEur - prefs.budgetMax;
      if (overBudget <= 500) {
        score += 10;
        reasons.push(`Supera ligeramente tu presupuesto por ${overBudget} €, pero ofrece componentes de gama superior.`);
      } else {
        score -= 20;
      }
    }

    // 3. Preferencia de Cambio (hasta 15 pts)
    if (prefs.shifting === "electronic") {
      if (bike.groupset.isElectronic) {
        score += 15;
        reasons.push(`Transmisión electrónica inalámbrica ${bike.groupset.name} sin cables ni desajustes.`);
      } else {
        score += 2;
      }
    } else if (prefs.shifting === "mechanical") {
      if (!bike.groupset.isElectronic) {
        score += 15;
        reasons.push(`Transmisión mecánica fiable ${bike.groupset.name} con mantenimiento sencillo y económico.`);
      } else {
        score += 2;
      }
    } else {
      score += 15; // Indiferente
    }

    // 4. Prioridad Clave del Ciclista (hasta 20 pts)
    if (prefs.priority === "weight") {
      if (bike.weightKg && bike.weightKg <= 7.5) {
        score += 20;
        reasons.push(`Peso pluma oficial de solo ${bike.weightKg} kg, insuperable en subidas.`);
      } else if (bike.weightKg && bike.weightKg <= 8.8) {
        score += 14;
        reasons.push(`Excelente ligereza de ${bike.weightKg} kg.`);
      } else {
        score += 5;
      }
    } else if (prefs.priority === "comfort") {
      if (bike.geometry.stackReachRatio >= 1.50 || bike.maxTireClearanceMm >= 40) {
        score += 20;
        reasons.push("Filtración de vibraciones superior gracias a su geometría y absorción del cuadro.");
      } else {
        score += 8;
      }
    } else if (prefs.priority === "clearance") {
      if (bike.maxTireClearanceMm >= 47) {
        score += 20;
        reasons.push(`Paso de rueda masivo de ${bike.maxTireClearanceMm} mm para montar cubiertas de gran balón.`);
      } else if (bike.maxTireClearanceMm >= 38) {
        score += 12;
        reasons.push(`Paso de rueda holgado de ${bike.maxTireClearanceMm} mm.`);
      } else {
        score += 2;
      }
    } else if (prefs.priority === "value") {
      if (bike.discountPercentage && bike.discountPercentage > 0) {
        score += 20;
        reasons.push(`Descuento oficial activo del -${bike.discountPercentage}% sobre su PVP de salida.`);
      } else if (bike.currentPriceEur < 2500) {
        score += 16;
        reasons.push("Relación componentes/precio imbatible en su categoría.");
      } else {
        score += 8;
      }
    }

    // Normalizar score a máximo 100
    const finalScore = Math.min(100, Math.max(20, Math.round(score)));

    scoredList.push({
      bike,
      score: finalScore,
      badge: "Recomendado",
      reasons: reasons.slice(0, 3),
    });
  }

  // Ordenar por score descendente
  scoredList.sort((a, b) => b.score - a.score);

  // Asignar etiquetas destacadas a los top matches
  if (scoredList.length > 0) scoredList[0].badge = "Match Perfecto 🏅";
  if (scoredList.length > 1) scoredList[1].badge = "Alternativa Destacada ⭐";
  if (scoredList.length > 2) scoredList[2].badge = "Mejor Relación Calidad/Precio 💰";

  return scoredList.slice(0, 4);
}
