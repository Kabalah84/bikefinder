import { z } from "zod";

// Slug seguro: solo letras minúsculas, números y guiones
export const SafeSlugSchema = z
  .string()
  .min(1)
  .max(100)
  .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, {
    message: "El identificador debe ser un slug válido en minúsculas (ej: canyon-grizl-2025)",
  });

// Validador estricto de URL HTTP/HTTPS
export const SafeHttpsUrlSchema = z
  .string()
  .url()
  .max(500)
  .refine((url) => url.startsWith("https://") || url.startsWith("http://"), {
    message: "La URL debe comenzar con http:// o https://",
  });

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
  name: z.string().min(1).max(100),
  isElectronic: z.boolean(),
  speedCount: z.number().int().positive().max(15),
  chainrings: z.string().min(1).max(20), // e.g. "48/31T" or "40T"
  cassette: z.string().min(1).max(20), // e.g. "11-36T" or "10-44T"
  minGearRatio: z.number().positive().max(10), // Subida (ej. 31/36 = 0.86)
  maxGearRatio: z.number().positive().max(10), // Llano (ej. 48/11 = 4.36)
});
export type GroupsetSpec = z.infer<typeof GroupsetSpecSchema>;

export const GeometrySpecSchema = z.object({
  stackMm: z.number().positive().max(1000),
  reachMm: z.number().positive().max(1000),
  stackReachRatio: z.number().positive().max(3), // e.g. 1.44
  headTubeAngleDeg: z.number().positive().max(90), // e.g. 72.5
  chainstayLengthMm: z.number().positive().max(1000), // e.g. 435
});
export type GeometrySpec = z.infer<typeof GeometrySpecSchema>;

export const BikeProductSchema = z.object({
  id: SafeSlugSchema,
  brand: z.string().min(1).max(50),
  model: z.string().min(1).max(100),
  year: z.number().int().min(2020).max(2035),
  discipline: DisciplineEnum,
  officialUrl: SafeHttpsUrlSchema,
  officialImageUrl: SafeHttpsUrlSchema,
  msrpEur: z.number().positive().max(50000),
  currentPriceEur: z.number().positive().max(50000),
  discountPercentage: z.number().min(0).max(100).optional(),
  isOutlet: z.boolean().default(false),
  frameMaterial: FrameMaterialEnum,
  forkMaterial: ForkMaterialEnum.default("carbon"),
  weightKg: z.number().positive().max(30).optional(),
  weightSizeReference: z.string().max(20).optional(),
  maxTireClearanceMm: z.number().positive().max(100),
  integratedCockpit: z.boolean().default(false),
  bikepackingMounts: z.boolean().default(false),
  groupset: GroupsetSpecSchema,
  geometry: GeometrySpecSchema,
  description: z.string().max(1000).optional(),
  highlights: z.array(z.string().max(200)).max(10).optional(),
  brakes: z.string().max(100).optional(),
  wheels: z.string().max(100).optional(),
  tires: z.string().max(100).optional(),
  colors: z.array(z.string().max(50)).max(10).optional(),
});
export type BikeProduct = z.infer<typeof BikeProductSchema>;

export const BrandSchema = z.object({
  id: SafeSlugSchema,
  name: z.string().min(1).max(50),
  country: z.string().min(1).max(50),
  officialWebsite: SafeHttpsUrlSchema,
  logoUrl: SafeHttpsUrlSchema.optional(),
  description: z.string().max(1000).optional(),
});
export type Brand = z.infer<typeof BrandSchema>;

export const CategorySchema = z.object({
  id: DisciplineEnum,
  name: z.string().min(1).max(50),
  subtitle: z.string().min(1).max(100),
  description: z.string().min(1).max(1000),
  targetClearanceRange: z.string().max(50),
  idealFor: z.string().max(200),
});
export type Category = z.infer<typeof CategorySchema>;

