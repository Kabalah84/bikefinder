import { MetadataRoute } from "next";
import { getAllBikes } from "@/lib/data/bikes";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://bikefinder.es";
  const now = new Date();

  const bikes = getAllBikes();

  // Páginas principales
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/asistente`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/calculadora-desarrollos`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
    },
    {
      url: `${baseUrl}/comparador`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.8,
    },
  ];

  // Fichas de producto individuales (/bici/[id])
  const bikeRoutes: MetadataRoute.Sitemap = bikes.map((bike) => ({
    url: `${baseUrl}/bici/${bike.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Duelos comparativos populares (/comparativa/[slug])
  const popularDuelSlugs = [
    "giant-revolt-vs-canyon-grizl",
    "cannondale-topstone-vs-specialized-diverge",
    "giant-defy-vs-trek-domane",
    "cannondale-supersix-vs-specialized-tarmac",
    "bmc-teammachine-vs-giant-tcr",
    "canyon-grizl-vs-orbea-terra",
    "canyon-grizl-vs-trek-checkpoint",
    "canyon-endurace-vs-trek-domane",
    "trek-domane-vs-specialized-roubaix",
    "canyon-ultimate-vs-specialized-tarmac",
    "orbea-orca-vs-specialized-tarmac",
  ];

  const duelRoutes: MetadataRoute.Sitemap = popularDuelSlugs.map((slug) => ({
    url: `${baseUrl}/comparativa/${slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.7,
  }));

  return [...staticRoutes, ...bikeRoutes, ...duelRoutes];
}
