import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ComparisonProvider } from "@/lib/context/ComparisonContext";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { ComparisonDrawer } from "@/components/comparator/ComparisonDrawer";

export const viewport: Viewport = {
  themeColor: "#0d9488",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL("https://bikefinder.es"),
  title: "BikeFinder.es · Buscador y Comparador de Bicicletas de Gravel y Carretera",
  description:
    "Compara especificaciones oficiales reales: pesos en báscula, paso de rueda (tire clearance), grupos electrónicos Di2/AXS, ratios de desarrollo y tablas de geometría de Canyon, Orbea, Trek, Specialized, Giant, Scott, Cannondale y BMC.",
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
  ],
  authors: [{ name: "BikeFinder.es", url: "https://bikefinder.es" }],
  creator: "BikeFinder.es",
  publisher: "BikeFinder.es",
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "BikeFinder.es · Comparador Técnico de Bicicletas",
    description:
      "Encuentra y compara técnicamente bicicletas de Gravel y Carretera con datos oficiales de fabricantes.",
    url: "https://bikefinder.es",
    siteName: "BikeFinder.es",
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "BikeFinder.es · Comparador de Bicicletas",
    description:
      "Buscador y comparador técnico oficial de bicicletas de Gravel y Carretera sin intermediarios de Amazon.",
  },
  alternates: {
    canonical: "https://bikefinder.es",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="scroll-smooth">
      <body className="flex flex-col min-h-screen bg-slate-50 text-slate-900 antialiased selection:bg-teal-500 selection:text-white">
        <ComparisonProvider>
          <Navbar />
          <main className="flex-1 pb-24">{children}</main>
          <ComparisonDrawer />
          <Footer />
        </ComparisonProvider>
      </body>
    </html>
  );
}
