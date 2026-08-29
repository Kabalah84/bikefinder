import {
  BikeProduct,
  BikeProductSchema,
  Brand,
  BrandSchema,
  Category,
  CategorySchema,
  Discipline,
  FrameMaterial,
  GroupsetBrand,
} from "@/lib/schema/bike";

import gravelData from "../../../data/bikes/gravel.json";
import carreteraData from "../../../data/bikes/carretera.json";
import brandsData from "../../../data/brands.json";
import categoriesData from "../../../data/categories.json";

// Validamos en carga estática para garantizar integridad del esquema Zod
const parsedBrands: Brand[] = BrandSchema.array().parse(brandsData);
const parsedCategories: Category[] = CategorySchema.array().parse(categoriesData);

const rawBikes = [...gravelData, ...carreteraData];
const parsedBikes: BikeProduct[] = rawBikes.map((item) => {
  const result = BikeProductSchema.safeParse(item);
  if (!result.success) {
    console.error("Error al validar bicicleta:", item, result.error.format());
    throw new Error(`Error de validación Zod en bicicleta: ${item.id || "desconocido"}`);
  }
  return result.data;
});

export function getAllBikes(): BikeProduct[] {
  return parsedBikes;
}

export function getBikeById(id: string): BikeProduct | undefined {
  return parsedBikes.find((bike) => bike.id === id);
}

export function getBikesByIds(ids: string[]): BikeProduct[] {
  const idSet = new Set(ids);
  return parsedBikes.filter((bike) => idSet.has(bike.id));
}

export function getBikesByDiscipline(discipline: Discipline): BikeProduct[] {
  return parsedBikes.filter((bike) => bike.discipline === discipline);
}

export function getAllBrands(): Brand[] {
  return parsedBrands;
}

export function getAllCategories(): Category[] {
  return parsedCategories;
}

export interface BikeFilterCriteria {
  searchTerm?: string;
  disciplines?: Discipline[];
  brands?: string[];
  frameMaterials?: FrameMaterial[];
  isElectronic?: boolean | null; // null = all
  isOneBy?: boolean | null; // null = all
  minTireClearanceMm?: number;
  maxPriceEur?: number;
  minPriceEur?: number;
  maxWeightKg?: number;
  onlyOutlets?: boolean;
  bikepackingMounts?: boolean;
  groupsetBrands?: GroupsetBrand[];
  sortBy?: "price_asc" | "price_desc" | "weight_asc" | "clearance_desc" | "discount_desc" | "name_asc";
}

export function filterBikes(bikes: BikeProduct[], criteria: BikeFilterCriteria): BikeProduct[] {
  let result = [...bikes];

  if (criteria.searchTerm && criteria.searchTerm.trim() !== "") {
    const term = criteria.searchTerm.toLowerCase().trim();
    result = result.filter(
      (b) =>
        b.brand.toLowerCase().includes(term) ||
        b.model.toLowerCase().includes(term) ||
        b.groupset.name.toLowerCase().includes(term) ||
        b.groupset.brand.toLowerCase().includes(term) ||
        (b.description && b.description.toLowerCase().includes(term))
    );
  }

  if (criteria.disciplines && criteria.disciplines.length > 0) {
    const discSet = new Set(criteria.disciplines);
    result = result.filter((b) => discSet.has(b.discipline));
  }

  if (criteria.brands && criteria.brands.length > 0) {
    const brandSet = new Set(criteria.brands.map((br) => br.toLowerCase()));
    result = result.filter((b) => brandSet.has(b.brand.toLowerCase()));
  }

  if (criteria.frameMaterials && criteria.frameMaterials.length > 0) {
    const matSet = new Set(criteria.frameMaterials);
    result = result.filter((b) => matSet.has(b.frameMaterial));
  }

  if (criteria.isElectronic !== undefined && criteria.isElectronic !== null) {
    result = result.filter((b) => b.groupset.isElectronic === criteria.isElectronic);
  }

  if (criteria.isOneBy !== undefined && criteria.isOneBy !== null) {
    result = result.filter((b) => {
      const isOneBy = !b.groupset.chainrings.includes("/");
      return isOneBy === criteria.isOneBy;
    });
  }

  if (criteria.minTireClearanceMm !== undefined && criteria.minTireClearanceMm > 0) {
    result = result.filter((b) => b.maxTireClearanceMm >= criteria.minTireClearanceMm!);
  }

  if (criteria.minPriceEur !== undefined && criteria.minPriceEur > 0) {
    result = result.filter((b) => b.currentPriceEur >= criteria.minPriceEur!);
  }

  if (criteria.maxPriceEur !== undefined && criteria.maxPriceEur > 0) {
    result = result.filter((b) => b.currentPriceEur <= criteria.maxPriceEur!);
  }

  if (criteria.maxWeightKg !== undefined && criteria.maxWeightKg > 0) {
    result = result.filter((b) => !b.weightKg || b.weightKg <= criteria.maxWeightKg!);
  }

  if (criteria.onlyOutlets) {
    result = result.filter((b) => b.isOutlet || (b.discountPercentage && b.discountPercentage > 0));
  }

  if (criteria.bikepackingMounts) {
    result = result.filter((b) => b.bikepackingMounts);
  }

  if (criteria.groupsetBrands && criteria.groupsetBrands.length > 0) {
    const gsSet = new Set(criteria.groupsetBrands);
    result = result.filter((b) => gsSet.has(b.groupset.brand));
  }

  // Ordenación
  const sort = criteria.sortBy || "price_asc";
  result.sort((a, b) => {
    switch (sort) {
      case "price_asc":
        return a.currentPriceEur - b.currentPriceEur;
      case "price_desc":
        return b.currentPriceEur - a.currentPriceEur;
      case "weight_asc":
        return (a.weightKg ?? 99) - (b.weightKg ?? 99);
      case "clearance_desc":
        return b.maxTireClearanceMm - a.maxTireClearanceMm;
      case "discount_desc":
        return (b.discountPercentage ?? 0) - (a.discountPercentage ?? 0);
      case "name_asc":
        return `${a.brand} ${a.model}`.localeCompare(`${b.brand} ${b.model}`);
      default:
        return 0;
    }
  });

  return result;
}
