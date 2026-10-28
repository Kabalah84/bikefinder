import React, { Suspense } from "react";
import { Metadata } from "next";
import Link from "next/link";
import { getAllBikes } from "@/lib/data/bikes";
import { ComparadorClient } from "@/components/comparator/ComparadorClient";
import { JsonLd } from "@/components/seo/JsonLd";
import {
  generateWebApplicationSchema,
  generateBreadcrumbsSchema,
  generateComparisonItemListSchema,
} from "@/lib/seo/schema";
import { constructMetadata } from "@/lib/seo/metadata";
import { Scale, ArrowLeft } from "lucide-react";

export const metadata: Metadata = constructMetadata({
  title: "Comparador Técnico de Bicicletas 1v1 y Multivía",
  description:
    "Compara hasta 4 bicicletas de Carretera, Gravel, MTB y E-Bikes simultáneamente: pesos en báscula, paso de rueda (tire clearance), desarrollos, geometría Stack/Reach y precios oficiales.",
  canonicalPath: "/comparador",
  keywords: [
    "comparador bicicletas gravel",
    "comparador bicicletas carretera",
    "comparador bicicletas mtb",
    "comparar modelos de bicicletas",
    "tabla comparativa bicicletas",
    "stack reach comparativa",
    "peso bascula bicicletas comparativa",
  ],
});

export default function ComparadorPage() {
  const featuredBikes = getAllBikes().slice(0, 8);

  const webAppSchema = generateWebApplicationSchema({
    name: "Comparador Técnico de Bicicletas ComparaBici",
    description:
      "Herramienta interactiva para confrontar especificaciones oficiales, pesos, geometrías y transmisiones de hasta 4 bicicletas.",
    path: "/comparador",
    applicationCategory: "SportsApplication",
  });

  const itemListSchema = generateComparisonItemListSchema({
    name: "Modelos Destacados en el Comparador Técnico de Bicicletas",
    description:
      "Ranking y comparativa técnica de bicicletas de carretera, gravel, MTB y eléctricas.",
    urlPath: "/comparador",
    bikes: featuredBikes,
  });

  const breadcrumbsSchema = generateBreadcrumbsSchema([
    { name: "Inicio", url: "/" },
    { name: "Comparador Técnico", url: "/comparador" },
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
      {/* Schema JSON-LD */}
      <JsonLd data={[webAppSchema, itemListSchema, breadcrumbsSchema]} />

      {/* Breadcrumbs */}
      <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs font-semibold text-slate-600">
        <Link href="/" className="hover:text-teal-700 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Inicio
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold" aria-current="page">
          Comparador Técnico
        </span>
      </nav>

      {/* Header */}
      <header>
        <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-950 tracking-tight flex items-center gap-3">
          <Scale className="w-7 h-7 text-teal-700" />
          Comparador Técnico 1v1 y Multivía
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 mt-1">
          Confrontación milimétrica de pasos de rueda, pesos oficiales, ratios de desarrollo y geometría Stack/Reach.
        </p>
      </header>

      {/* Client Comparator Component */}
      <Suspense
        fallback={
          <div className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-600">
            Cargando comparador técnico...
          </div>
        }
      >
        <ComparadorClient />
      </Suspense>
    </div>
  );
}
