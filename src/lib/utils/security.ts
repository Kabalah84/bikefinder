/**
 * src/lib/utils/security.ts
 * Utilidades de validación y sanitización de seguridad defensiva
 */

const SAFE_PROTOCOL_REGEX = /^https?:\/\//i;
const DANGEROUS_PROTOCOLS = ["javascript:", "data:", "vbscript:", "file:"];

/**
 * Valida si una URL es estrictamente HTTP o HTTPS y no contiene pseudo-protocolos maliciosos
 */
export function isSafeExternalUrl(url: unknown): boolean {
  if (typeof url !== "string") return false;
  const trimmed = url.trim();
  if (!trimmed) return false;

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
