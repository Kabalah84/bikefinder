/**
 * src/lib/utils/security.ts
 * Utilidades de validación y sanitización de seguridad defensiva
 */

import { Discipline } from "@/lib/schema/bike";

const SAFE_PROTOCOL_REGEX = /^https?:\/\//i;
const DANGEROUS_PROTOCOLS = ["javascript:", "data:", "vbscript:", "file:"];
const SAFE_SLUG_REGEX = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

const ALLOWED_DISCIPLINES: readonly Discipline[] = [
  "gravel",
  "road_endurance",
  "road_race",
  "all_road",
  "mtb",
];

/**
 * Valida si una URL es estrictamente HTTP o HTTPS y no contiene pseudo-protocolos maliciosos
 */
export function isSafeExternalUrl(url: unknown): boolean {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed || trimmed.length > 500) return false;

  const lower = trimmed.toLowerCase();
  for (const dangerous of DANGEROUS_PROTOCOLS) {
    if (lower.startsWith(dangerous)) {
      return false;
    }
  }

  return SAFE_PROTOCOL_REGEX.test(trimmed);
}

/**
 * Sanitiza una URL retornando un fallback seguro ('#' por defecto) si no cumple los requisitos
 */
export function sanitizeExternalUrl(url: unknown, fallback: string = "#"): string {
  return isSafeExternalUrl(url) ? (url as string).trim() : fallback;
}

/**
 * Sanitiza entradas de búsqueda interna eliminando etiquetas HTML, caracteres de control y exceso de longitud
 */
export function sanitizeSearchInput(input: unknown, maxLength: number = 80): string {
  if (typeof input !== "string") return "";
  return input
    .replace(/[\u0000-\u001F\u007F]/g, "") // Eliminar caracteres de control
    .replace(/[<>"'`\\]/g, "") // Neutralizar delimitadores de inyección HTML/XSS
    .slice(0, maxLength);
}

/**
 * Sanitiza contenido textual dinámico procedente de catálogos o APIs antes de procesarlo
 */
export function sanitizeTextContent(text: unknown, maxLength: number = 500): string {
  if (typeof text !== "string") return "";
  return text
    .replace(/[\u0000-\u001F\u007F]/g, "")
    .replace(/[<>]/g, "")
    .trim()
    .slice(0, maxLength);
}

/**
 * Valida un identificador slug individual contra inyecciones en parámetros URL
 */
export function sanitizeSlugParam(slug: unknown): string | null {
  if (typeof slug !== "string") return null;
  const normalized = slug.trim().toLowerCase();
  if (!normalized || normalized.length > 100) return null;
  return SAFE_SLUG_REGEX.test(normalized) ? normalized : null;
}

/**
 * Sanitiza una lista de IDs separados por comas (ej. ?ids=bici-1,bici-2)
 */
export function sanitizeSlugArray(
  rawIds: string | null | undefined,
  maxItems: number = 4
): string[] {
  if (!rawIds || typeof rawIds !== "string") return [];
  const uniqueIds = new Set<string>();
  const parts = rawIds.split(",");

  for (const part of parts) {
    if (uniqueIds.size >= maxItems) break;
    const validSlug = sanitizeSlugParam(part);
    if (validSlug) {
      uniqueIds.add(validSlug);
    }
  }

  return Array.from(uniqueIds);
}

/**
 * Valida un parámetro de disciplina contra la lista blanca de disciplinas soportadas
 */
export function validateDisciplineParam(param: string | null | undefined): Discipline | null {
  if (!param || typeof param !== "string") return null;
  const normalized = param.trim().toLowerCase() as Discipline;
  return ALLOWED_DISCIPLINES.includes(normalized) ? normalized : null;
}

/**
 * Valida un parámetro de marca contra las marcas oficiales del catálogo
 */
export function validateBrandParam(
  param: string | null | undefined,
  allowedBrands: string[]
): string | null {
  if (!param || typeof param !== "string") return null;
  const cleaned = sanitizeSearchInput(param, 50).trim().toLowerCase();
  if (!cleaned) return null;
  const matched = allowedBrands.find((b) => b.toLowerCase() === cleaned);
  return matched || null;
}
