import { z } from "zod";

export const DisciplineEnum = z.enum([
  "gravel",
  "road_endurance",
  "road_race",
  "all_road",
]);
export type Discipline = z.infer<typeof DisciplineEnum>;

export const FrameMaterialEnum = z.enum([
  "carbon",
  "aluminum",
  "titanium",
  "steel",
]);
export type FrameMaterial = z.infer<typeof FrameMaterialEnum>;

export const ForkMaterialEnum = z.enum(["carbon", "aluminum"]);
export type ForkMaterial = z.infer<typeof ForkMaterialEnum>;

export const GroupsetBrandEnum = z.enum([
  "shimano",
  "sram",
  "campagnolo",
  "microshift",
]);
export type GroupsetBrand = z.infer<typeof GroupsetBrandEnum>;

export const GroupsetSpecSchema = z.object({
  brand: GroupsetBrandEnum,
  name: z.string().min(1),
  isElectronic: z.boolean(),
  speedCount: z.number().int().positive(),
  chainrings: z.string().min(1), // e.g. "48/31T" or "40T"
  cassette: z.string().min(1), // e.g. "11-36T" or "10-44T"
  minGearRatio: z.number().positive(), // Subida (ej. 31/36 = 0.86)
  maxGearRatio: z.number().positive(), // Llano (ej. 48/11 = 4.36)
});
export type GroupsetSpec = z.infer<typeof GroupsetSpecSchema>;

export const GeometrySpecSchema = z.object({
  stackMm: z.number().positive(),
  reachMm: z.number().positive(),
  stackReachRatio: z.number().positive(), // e.g. 1.44
  headTubeAngleDeg: z.number().positive(), // e.g. 72.5
  chainstayLengthMm: z.number().positive(), // e.g. 435
});
export type GeometrySpec = z.infer<typeof GeometrySpecSchema>;

export const BikeProductSchema = z.object({
  id: z.string().min(1),
  brand: z.string().min(1),
  model: z.string().min(1),
  year: z.number().int().min(2020).max(2030),
  discipline: DisciplineEnum,
  officialUrl: z.string().url(),
  officialImageUrl: z.string().url(),
  msrpEur: z.number().positive(),
  currentPriceEur: z.number().positive(),
  discountPercentage: z.number().min(0).max(100).optional(),
  isOutlet: z.boolean().default(false),
  frameMaterial: FrameMaterialEnum,
  forkMaterial: ForkMaterialEnum.default("carbon"),
  weightKg: z.number().positive().optional(),
  weightSizeReference: z.string().optional(),
  maxTireClearanceMm: z.number().positive(),
  integratedCockpit: z.boolean().default(false),
  bikepackingMounts: z.boolean().default(false),
  groupset: GroupsetSpecSchema,
  geometry: GeometrySpecSchema,
  description: z.string().optional(),
  highlights: z.array(z.string()).optional(),
  brakes: z.string().optional(),
  wheels: z.string().optional(),
  tires: z.string().optional(),
  colors: z.array(z.string()).optional(),
});
export type BikeProduct = z.infer<typeof BikeProductSchema>;

export const BrandSchema = z.object({
  id: z.string().min(1),
  name: z.string().min(1),
  country: z.string().min(1),
  officialWebsite: z.string().url(),
  logoUrl: z.string().optional(),
  description: z.string().optional(),
});
export type Brand = z.infer<typeof BrandSchema>;

export const CategorySchema = z.object({
  id: DisciplineEnum,
  name: z.string().min(1),
  subtitle: z.string().min(1),
  description: z.string().min(1),
  targetClearanceRange: z.string(),
  idealFor: z.string(),
});
export type Category = z.infer<typeof CategorySchema>;
