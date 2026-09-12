import { Metadata } from "next";

export const SITE_CONFIG = {
  name: "ComparaBici.es",
  shortName: "ComparaBici",
  domain: "comparabici.es",
  baseUrl: "https://comparabici.es",
  defaultTitle: "ComparaBici.es · Comparador de Bicicletas de Carretera, Gravel, Montaña (MTB) y Eléctricas",
  titleTemplate: "%s · ComparaBici.es",
  defaultDescription:
    "Buscador y comparador técnico oficial de más de 800 bicicletas: pesos reales en báscula, pasos de rueda al milímetro, suspensiones rígidas y dobles, e-bikes y geometrías de Specialized, Canyon, Giant, Scott, Cannondale, Megamo, Merida, BH, Bianchi, Pinarello y Liv.",
  defaultOgImage: "https://comparabici.es/og-image.jpg",
  twitterHandle: "@comparabici_es",
  locale: "es_ES",
  keywords: [
    "comparador bicicletas",
    "buscador bicicletas",
    "bicicletas carretera",
    "bicicletas gravel",
    "bicicletas montana",
    "bicicletas mtb",
    "bicicletas electricas",
    "ebikes ciclismo",
    "doble suspension mtb",
    "rigidas mtb",
    "paso de rueda",
    "tire clearance",
    "shimano grx 12v",
    "sram axs xplr",
    "shimano di2 carretera",
    "sram transmission t-type",
    "specialized tarmac",
    "pinarello dogma",
    "canyon aeroad",
    "giant tcr",
    "cannondale supersix",
    "megamo jakar",
    "merida silex",
    "cannondale scalpel",
    "scott spark",
    "bh lynx",
    "canyon lux",
    "geometría stack reach",
    "calculadora desarrollos ciclismo",
    "pesos reales bicicletas",
  ],
};

export interface ConstructMetadataProps {
  title?: string;
  description?: string;
  canonicalPath?: string;
  ogImage?: string;
  ogType?: "website" | "article";
  keywords?: string[];
  noIndex?: boolean;
}

export function constructMetadata({
  title,
  description = SITE_CONFIG.defaultDescription,
  canonicalPath = "/",
  ogImage = SITE_CONFIG.defaultOgImage,
  ogType = "website",
  keywords = SITE_CONFIG.keywords,
  noIndex = false,
}: ConstructMetadataProps = {}): Metadata {
  const fullCanonicalUrl = canonicalPath.startsWith("http")
    ? canonicalPath
    : `${SITE_CONFIG.baseUrl}${canonicalPath.startsWith("/") ? canonicalPath : `/${canonicalPath}`}`;

  const resolvedTitle = title ? `${title} · ${SITE_CONFIG.name}` : SITE_CONFIG.defaultTitle;

  return {
    title: title ? title : { default: SITE_CONFIG.defaultTitle, template: SITE_CONFIG.titleTemplate },
    description,
    keywords,
    metadataBase: new URL(SITE_CONFIG.baseUrl),
    alternates: {
      canonical: fullCanonicalUrl,
    },
    robots: {
      index: !noIndex,
      follow: !noIndex,
      googleBot: {
        index: !noIndex,
        follow: !noIndex,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
    openGraph: {
      title: resolvedTitle,
      description,
      url: fullCanonicalUrl,
      siteName: SITE_CONFIG.name,
      locale: SITE_CONFIG.locale,
      type: ogType,
      images: [
        {
          url: ogImage,
          width: 1200,
          height: 630,
          alt: resolvedTitle,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: resolvedTitle,
      description,
      images: [ogImage],
      creator: SITE_CONFIG.twitterHandle,
    },
  };
}
