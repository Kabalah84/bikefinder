export function formatCurrencyEur(amount: number): string {
  return new Intl.NumberFormat("es-ES", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatWeight(kg?: number, sizeRef?: string): string {
  if (!kg) return "N/D";
  return sizeRef ? `${kg.toFixed(2)} kg (Talla ${sizeRef})` : `${kg.toFixed(2)} kg`;
}

export function formatClearance(mm: number): string {
  return `${mm} mm`;
}

export function formatDisciplineName(discipline: string): string {
  switch (discipline) {
    case "gravel":
      return "Gravel";
    case "road_endurance":
      return "Gran Fondo (Endurance)";
    case "road_race":
      return "Competición & Aero";
    case "all_road":
      return "All-Road";
    case "mtb":
      return "Montaña (MTB)";
    default:
      return discipline;
  }
}

export function formatMaterialName(material: string): string {
  switch (material) {
    case "carbon":
      return "Carbono";
    case "aluminum":
      return "Aluminio";
    case "titanium":
      return "Titanio";
    case "steel":
      return "Acero";
    default:
      return material;
  }
}

export function formatSuspensionName(suspension: string): string {
  switch (suspension) {
    case "full":
      return "Doble";
    case "hardtail":
      return "Delantera";
    case "rigid":
      return "Rígida";
    default:
      return suspension;
  }
}

export interface ComponentTierInfo {
  label: string;
  shortLabel: string;
  badgeClass: string;
}

/**
 * Determina el nivel de gama de componentes (WorldTour/Pro, Performance, Sport)
 * según grupo de transmisión, cambio electrónico y precio oficial.
 */
export function getComponentTierBadge(
  groupsetName: string,
  isElectronic: boolean,
  priceEur: number
): ComponentTierInfo {
  const lower = groupsetName.toLowerCase();

  if (
    lower.includes("dura-ace") ||
    lower.includes("sram red") ||
    lower.includes("xx sl") ||
    lower.includes("xtr") ||
    lower.includes("super record") ||
    priceEur >= 7000
  ) {
    return {
      label: "Gama WorldTour · Tope",
      shortLabel: "Gama Pro / WorldTour",
      badgeClass: "bg-slate-900 text-amber-300 border-amber-500/40",
    };
  }

  if (
    lower.includes("ultegra") ||
    lower.includes("force") ||
    lower.includes("x0 ") ||
    lower.includes("xt ") ||
    lower.includes("grx 825") ||
    isElectronic ||
    priceEur >= 3500
  ) {
    return {
      label: "Gama Performance · Competición",
      shortLabel: "Gama Performance",
      badgeClass: "bg-teal-950/90 text-teal-200 border-teal-500/40",
    };
  }

  return {
    label: "Gama Sport · Entrenamiento",
    shortLabel: "Gama Sport",
    badgeClass: "bg-slate-800/90 text-slate-100 border-slate-600/50",
  };
}
