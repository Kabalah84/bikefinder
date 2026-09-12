import { MetadataRoute } from "next";

export const runtime = "edge";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "ComparaBici.es · Comparador y Buscador de Bicicletas",
    short_name: "ComparaBici",
    description: "Comparador técnico de bicicletas de Carretera, Gravel y Montaña con datos oficiales de fabricantes.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#0d9488",
    icons: [
      {
        src: "/icon.png",
        sizes: "192x192",
        type: "image/png",
      },
      {
        src: "/icon-512.png",
        sizes: "512x512",
        type: "image/png",
      },
    ],
  };
}
