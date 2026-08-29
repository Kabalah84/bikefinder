import React from "react";

interface JsonLdProps {
  data: Record<string, any> | Record<string, any>[];
}

/**
 * Serializa de forma segura el objeto de Schema.org para prevenir XSS y anomalías de parser
 */
function safeJsonLdStringify(data: any): string {
  return JSON.stringify(data)
    .replace(/</g, "\\u003c")
    .replace(/>/g, "\\u003e")
    .replace(/&/g, "\\u0026")
    .replace(/\u2028/g, "\\u2028")
    .replace(/\u2029/g, "\\u2029");
}

export function JsonLd({ data }: JsonLdProps) {
  if (!data) return null;

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{
        __html: safeJsonLdStringify(data),
      }}
    />
  );
}

