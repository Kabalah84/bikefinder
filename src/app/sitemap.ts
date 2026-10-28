import { MetadataRoute } from "next";
import { getAllBikes } from "@/lib/data/bikes";
import { POPULAR_DUELS } from "@/lib/data/duels";
import { SITE_CONFIG } from "@/lib/seo/metadata";

export const runtime = "edge";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = SITE_CONFIG.baseUrl;
  const now = new Date();

  const bikes = getAllBikes();

  // Páginas estáticas canónicas principales (sin query params para evitar canibalización)
  const staticRoutes: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: now,
      changeFrequency: "daily",
      priority: 1.0,
    },
    {
      url: `${baseUrl}/comparador`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 0.9,
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
      url: `${baseUrl}/contacto`,
      lastModified: now,
      changeFrequency: "monthly",
      priority: 0.5,
    },
    {
      url: `${baseUrl}/aviso-legal`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politica-privacidad`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
    {
      url: `${baseUrl}/politica-cookies`,
      lastModified: now,
      changeFrequency: "yearly",
      priority: 0.3,
    },
  ];

  // Duelos comparativos populares (/comparativa/[slug])
  const duelRoutes: MetadataRoute.Sitemap = POPULAR_DUELS.map((duel) => ({
    url: `${baseUrl}/comparativa/${duel.slug}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.85,
  }));

  // Fichas de producto individuales (/bici/[id]) - más de 800 modelos canónicos
  const bikeRoutes: MetadataRoute.Sitemap = bikes.map((bike) => ({
    url: `${baseUrl}/bici/${bike.id}`,
    lastModified: now,
    changeFrequency: "weekly",
    priority: 0.8,
  }));

  return [...staticRoutes, ...duelRoutes, ...bikeRoutes];
}
