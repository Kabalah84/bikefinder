import { MetadataRoute } from "next";
import { getAllBikes, getAllCategories } from "@/lib/data/bikes";
import { POPULAR_DUELS } from "@/lib/data/duels";
import { SITE_CONFIG } from "@/lib/seo/metadata";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.baseUrl;
  const now = new Date();

  const bikes = getAllBikes();
  const categories = getAllCategories();

  // Páginas estáticas principales
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
      priority: 0.9,
    },
  ];

  // Páginas de categorías principales
  const categoryRoutes: MetadataRoute.Sitemap = categories.map((cat) => ({
    url: `${baseUrl}/?discipline=${cat.id}`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 0.85,
  }));

  // Fichas de producto individuales (/bici/[id])
  const bikeRoutes: MetadataRoute.Sitemap = bikes.map((bike) => ({
    url: `${baseUrl}/bici/${bike.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  // Duelos comparativos populares (/comparativa/[slug])
  const duelRoutes: MetadataRoute.Sitemap = POPULAR_DUELS.map((duel) => ({
    url: `${baseUrl}/comparativa/${duel.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.75,
  }));

  return [...staticRoutes, ...categoryRoutes, ...bikeRoutes, ...duelRoutes];
}
