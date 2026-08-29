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
