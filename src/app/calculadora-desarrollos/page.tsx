import React from "react";
import { Metadata } from "next";
import { getAllBikes } from "@/lib/data/bikes";
import { GearCalculatorTool } from "@/components/tools/GearCalculatorTool";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateWebApplicationSchema, generateBreadcrumbsSchema } from "@/lib/seo/schema";
import { constructMetadata } from "@/lib/seo/metadata";
import { TrendingUp, Info, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = constructMetadata({
  title: "Calculadora de Desarrollos Ciclistas y Ratios (1x y 2x)",
  description:
    "Calcula metros de avance por pedalada, ratios de subida y velocidades en km/h a 70, 80, 90 y 100 RPM según tu combinación de platos (48/31, 50/34, 40T) y cassettes (11-36, 10-44, 10-50, 11-34).",
  canonicalPath: "/calculadora-desarrollos",
  keywords: [
    "calculadora desarrollos ciclismo",
    "calcular ratio plato piñon",
    "metros avance pedalada",
    "shimano grx desarrollos",
    "sram axs xplr desarrollos",
    "calculadora 1x gravel",
    "cadencia rpm kmh bicicleta",
  ],
});

export default function CalculadoraDesarrollosPage() {
  const bikes = getAllBikes();

  const webAppSchema = generateWebApplicationSchema({
    name: "Calculadora de Desarrollos Ciclistas y Ratios",
    description:
      "Calculadora y simulador de transmisiones 1x y 2x para ciclismo de Gravel y Carretera con tablas de cadencia, velocidad y avance por pedalada.",
    path: "/calculadora-desarrollos",
    applicationCategory: "SportsApplication",
  });

  const breadcrumbsSchema = generateBreadcrumbsSchema([
    { name: "Inicio", url: "/" },
    { name: "Calculadora de Desarrollos", url: "/calculadora-desarrollos" },
  ]);

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
      {/* Schema JSON-LD */}
      <JsonLd data={[webAppSchema, breadcrumbsSchema]} />

      {/* Breadcrumbs */}
      <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-teal-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Inicio
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold" aria-current="page">
          Calculadora de Desarrollos
        </span>
      </nav>

      {/* Header */}
      <header className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 border border-teal-200">
          <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
          <span>Herramienta Técnica para Ciclistas</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Calculadora de Desarrollos y Ratios
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Simula transmisiones completas de Gravel y Carretera (Shimano GRX, 105, Ultegra, SRAM AXS XPLR y Mullet). Comprueba la velocidad real en km/h para cada corona y tus metros de avance por pedalada.
        </p>
      </header>

      {/* Main Tool */}
      <section aria-label="Calculadora interactiva">
        <GearCalculatorTool catalogBikes={bikes} />
      </section>

      {/* Educational Guide */}
      <section aria-label="Guía técnica de desarrollos" className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-slate-900 flex items-center gap-2">
          <Info className="w-5 h-5 text-teal-600" />
          ¿Cómo entender los desarrollos de tu bicicleta?
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm text-slate-600">
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">¿Qué significa el Ratio de Transmisión?</h3>
            <p>
              Es el resultado de dividir los dientes del plato entre los del piñón (ej. 31T / 36T = 0.86). Un ratio <strong>menor a 1.0</strong> significa que la rueda da menos de una vuelta por cada pedalada, facilitando subir rampas muy duras con alta cadencia.
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Monoplato (1x) vs Biplato (2x)</h3>
            <p>
              El <strong>1x</strong> elimina el desviador delantero y posibles salidas de cadena en grava, utilizando cassettes amplios (10-44T o 10-50T). El <strong>2x</strong> ofrece saltos más progresivos entre marchas y mayor velocidad en carretera (plato de 48T o 50T).
            </p>
          </div>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-2">
            <h3 className="font-bold text-slate-900 text-sm">Influencia del Tamaño de Cubierta</h3>
            <p>
              Un neumático de Gravel 700x45c tiene una circunferencia mayor (2.22m) que uno de carretera 700x28c (2.13m). A igual desarrollo y cadencia, una rueda con más balón avanza más metros por pedalada.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
