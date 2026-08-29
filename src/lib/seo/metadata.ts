import { Metadata } from "next";

export const SITE_CONFIG = {
  name: "BikeFinder.es",
  shortName: "BikeFinder",
  domain: "bikefinder.es",
  baseUrl: "https://bikefinder.es",
  defaultTitle: "BikeFinder.es · Buscador y Comparador de Bicicletas de Gravel y Carretera",
  titleTemplate: "%s · BikeFinder.es",
  defaultDescription:
    "Compara especificaciones oficiales reales: pesos en báscula, paso de rueda (tire clearance), grupos electrónicos Di2/AXS, ratios de desarrollo y tablas de geometría de Canyon, Orbea, Trek, Specialized, Giant, Scott, Cannondale y BMC.",
  defaultOgImage: "https://bikefinder.es/og-image.jpg",
  twitterHandle: "@bikefinder_es",
  locale: "es_ES",
  keywords: [
    "bicicletas gravel",
    "bicicletas carretera",
    "comparador bicicletas",
    "paso de rueda",
    "tire clearance",
    "shimano grx 12v",
    "sram axs gravel",
    "canyon grizl",
    "orbea terra",
    "trek checkpoint",
    "specialized diverge",
    "giant revolt",
    "scott addict gravel",
    "cannondale topstone",
    "bmc urs",
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
