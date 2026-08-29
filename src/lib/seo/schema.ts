import { BikeProduct } from "@/lib/schema/bike";
import { formatDisciplineName, formatMaterialName } from "@/lib/utils/formatters";
import { SITE_CONFIG } from "./metadata";

/**
 * Genera el Schema.org Organization para la entidad principal del sitio
 */
export function generateOrganizationSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": `${SITE_CONFIG.baseUrl}/#organization`,
    name: SITE_CONFIG.name,
    alternateName: SITE_CONFIG.shortName,
    url: SITE_CONFIG.baseUrl,
    logo: {
      "@type": "ImageObject",
      url: `${SITE_CONFIG.baseUrl}/icon-512.png`,
      caption: SITE_CONFIG.name,
    },
    description: SITE_CONFIG.defaultDescription,
    sameAs: [
      "https://twitter.com/bikefinder_es",
      "https://github.com/Kabalah84/bikefinder",
    ],
  };
}

/**
 * Genera el Schema.org WebSite con capacidad de SearchAction (Sitelinks Searchbox de Google)
 */
export function generateWebSiteSchema() {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": `${SITE_CONFIG.baseUrl}/#website`,
    url: SITE_CONFIG.baseUrl,
    name: SITE_CONFIG.name,
    description: SITE_CONFIG.defaultDescription,
    publisher: {
      "@id": `${SITE_CONFIG.baseUrl}/#organization`,
    },
    inLanguage: "es-ES",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: `${SITE_CONFIG.baseUrl}/?q={search_term_string}`,
      },
      "query-input": "required name=search_term_string",
    },
  };
}

/**
 * Genera el Schema.org BreadcrumbList dinámico para cualquier ruta
 */
export function generateBreadcrumbsSchema(
  items: { name: string; url?: string }[]
) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      ...(item.url
        ? {
            item: item.url.startsWith("http")
              ? item.url
              : `${SITE_CONFIG.baseUrl}${item.url.startsWith("/") ? item.url : `/${item.url}`}`,
          }
        : {}),
    })),
  };
}

/**
 * Genera el Schema.org Product enriquecido para fichas técnicas individuales de bicicletas
 */
export function generateProductSchema(bike: BikeProduct) {
  const productUrl = `${SITE_CONFIG.baseUrl}/bici/${bike.id}`;
  const disciplineName = formatDisciplineName(bike.discipline);

  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "@id": `${productUrl}#product`,
    name: `${bike.brand} ${bike.model} (${bike.year})`,
    image: [bike.officialImageUrl],
    description:
      bike.description ||
      `Bicicleta ${bike.brand} ${bike.model} de ${disciplineName}. Cuadro ${formatMaterialName(bike.frameMaterial)}, grupo ${bike.groupset.name}, paso de rueda de hasta ${bike.maxTireClearanceMm} mm y peso oficial declarado de ${bike.weightKg ? `${bike.weightKg} kg` : "catálogo"}.`,
    sku: bike.id,
    mpn: bike.id,
    brand: {
      "@type": "Brand",
      name: bike.brand,
    },
    category: `Sporting Goods > Outdoor Recreation > Cycling > Bicycles > ${disciplineName}`,
    offers: {
      "@type": "Offer",
      url: bike.officialUrl,
      priceCurrency: "EUR",
      price: bike.currentPriceEur,
      priceValidUntil: "2026-12-31",
      availability: "https://schema.org/InStock",
      itemCondition: "https://schema.org/NewCondition",
      seller: {
        "@type": "Organization",
        name: bike.brand,
      },
    },
    additionalProperty: [
      {
        "@type": "PropertyValue",
        name: "Paso de Rueda Máximo (Tire Clearance)",
        value: `${bike.maxTireClearanceMm} mm`,
      },
      {
        "@type": "PropertyValue",
        name: "Peso Declarado Oficial",
        value: bike.weightKg ? `${bike.weightKg} kg` : "N/D",
      },
      {
        "@type": "PropertyValue",
        name: "Grupo de Transmisión",
        value: bike.groupset.name,
      },
      {
        "@type": "PropertyValue",
        name: "Tipo de Cambio",
        value: bike.groupset.isElectronic ? "Electrónico Inalámbrico (Di2/AXS)" : "Mecánico",
      },
      {
        "@type": "PropertyValue",
        name: "Material del Cuadro",
        value: formatMaterialName(bike.frameMaterial),
      },
      {
        "@type": "PropertyValue",
        name: "Disciplina Ciclista",
        value: disciplineName,
      },
      {
        "@type": "PropertyValue",
        name: "Ratio Stack / Reach",
        value: bike.geometry.stackReachRatio.toFixed(2),
      },
      {
        "@type": "PropertyValue",
        name: "Ratio Mínimo de Subida",
        value: bike.groupset.minGearRatio.toFixed(2),
      },
    ],
  };
}

/**
 * Genera el Schema.org TechArticle para páginas de comparativas y duelos 1v1
 */
export function generateArticleComparisonSchema({
  title,
  summary,
  slug,
  bikeA,
  bikeB,
}: {
  title: string;
  summary: string;
  slug: string;
  bikeA?: BikeProduct;
  bikeB?: BikeProduct;
}) {
  const comparisonUrl = `${SITE_CONFIG.baseUrl}/comparativa/${slug}`;

  return {
    "@context": "https://schema.org",
    "@type": "TechArticle",
    "@id": `${comparisonUrl}#article`,
    headline: title,
    description: summary,
    inLanguage: "es-ES",
    url: comparisonUrl,
    mainEntityOfPage: comparisonUrl,
    datePublished: "2025-01-15T08:00:00+01:00",
    dateModified: new Date().toISOString(),
    author: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.baseUrl,
    },
    publisher: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.baseUrl,
      logo: {
        "@type": "ImageObject",
        url: `${SITE_CONFIG.baseUrl}/icon-512.png`,
      },
    },
    about: [
      ...(bikeA ? [generateProductSchema(bikeA)] : []),
      ...(bikeB ? [generateProductSchema(bikeB)] : []),
    ],
  };
}

/**
 * Genera el Schema.org WebApplication para herramientas interactivas (Calculadora, Asistente, Comparador)
 */
export function generateWebApplicationSchema({
  name,
  description,
  path,
  applicationCategory = "SportsApplication",
}: {
  name: string;
  description: string;
  path: string;
  applicationCategory?: string;
}) {
  const appUrl = `${SITE_CONFIG.baseUrl}${path.startsWith("/") ? path : `/${path}`}`;

  return {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    "@id": `${appUrl}#webapp`,
    name,
    description,
    url: appUrl,
    applicationCategory,
    operatingSystem: "All",
    browserRequirements: "Requires JavaScript. Requires HTML5.",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "EUR",
      availability: "https://schema.org/InStock",
    },
    creator: {
      "@type": "Organization",
      name: SITE_CONFIG.name,
      url: SITE_CONFIG.baseUrl,
    },
  };
}
