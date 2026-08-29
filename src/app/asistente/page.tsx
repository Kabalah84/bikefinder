import React from "react";
import { Metadata } from "next";
import { getAllBikes } from "@/lib/data/bikes";
import { BikeRecommenderWizard } from "@/components/tools/BikeRecommenderWizard";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateWebApplicationSchema, generateBreadcrumbsSchema } from "@/lib/seo/schema";
import { constructMetadata } from "@/lib/seo/metadata";
import { Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export const metadata: Metadata = constructMetadata({
  title: "Asistente: Encuentra tu Bici Ideal de Gravel o Carretera",
  description:
    "Responde 4 preguntas sencillas sobre tu terreno, presupuesto, tipo de cambio y prioridades técnicas para recibir recomendaciones personalizadas con scoring de afinidad.",
  canonicalPath: "/asistente",
  keywords: [
    "asistente compra bicicleta",
    "recomendar bicicleta gravel",
    "que bicicleta carretera comprar",
    "test eleccion bicicleta",
    "asistente ciclista inteligente",
  ],
});

export default function AsistentePage() {
  const bikes = getAllBikes();

  const webAppSchema = generateWebApplicationSchema({
    name: "Asistente Inteligente de Elección de Bicicletas",
    description:
      "Herramienta interactiva para encontrar la bicicleta ideal de Gravel o Carretera según terreno, presupuesto y transmisión.",
    path: "/asistente",
    applicationCategory: "SportsApplication",
  });

  const breadcrumbsSchema = generateBreadcrumbsSchema([
    { name: "Inicio", url: "/" },
    { name: "Asistente de Elección", url: "/asistente" },
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
          Asistente de Elección
        </span>
      </nav>

      {/* Header */}
      <header className="text-center max-w-2xl mx-auto space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 border border-teal-200">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Recomendador Inteligente Ciclista</span>
        </div>
        <h1 className="text-3xl sm:text-5xl font-black text-slate-900 tracking-tight">
          Encuentra tu Bici Ideal en 4 Pasos
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 leading-relaxed">
          Analizamos tus preferencias de terreno, presupuesto, tipo de transmisión y confort para calcular la afinidad técnica exacta con los modelos oficiales del catálogo.
        </p>
      </header>

      {/* Interactive Wizard */}
      <section aria-label="Cuestionario de recomendación">
        <BikeRecommenderWizard allBikes={bikes} />
      </section>

      {/* Trust Badges */}
      <section aria-label="Garantías de imparcialidad" className="mx-auto max-w-3xl pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs text-slate-500">
        <div className="p-3 rounded-2xl bg-white border border-slate-100">
          <h2 className="font-bold text-slate-900 block mb-0.5 text-xs">100% Sin Afiliación</h2>
          <span>Recomendaciones técnicas imparciales sin links de Amazon.</span>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-100">
          <h2 className="font-bold text-slate-900 block mb-0.5 text-xs">Datos Oficiales</h2>
          <span>Pesos en báscula y pasos de rueda verificados de fabricantes.</span>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-100">
          <h2 className="font-bold text-slate-900 block mb-0.5 text-xs">Compra Directa</h2>
          <span>Enlaces directos a la tienda oficial de cada marca.</span>
        </div>
      </section>
    </div>
  );
}
