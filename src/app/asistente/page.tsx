import React from "react";
import { Metadata } from "next";
import { getAllBikes } from "@/lib/data/bikes";
import { BikeRecommenderWizard } from "@/components/tools/BikeRecommenderWizard";
import { Sparkles, HelpCircle, ShieldCheck } from "lucide-react";

export const metadata: Metadata = {
  title: "Asistente: Encuentra tu Bici Ideal de Gravel o Carretera | BikeFinder.es",
  description:
    "Responde 4 preguntas sencillas sobre tu terreno, presupuesto, tipo de cambio y prioridades técnicas para recibir recomendaciones personalizadas con scoring de afinidad.",
};

export default function AsistentePage() {
  const bikes = getAllBikes();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto space-y-3">
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
      </div>

      {/* Interactive Wizard */}
      <BikeRecommenderWizard allBikes={bikes} />

      {/* Trust Badges */}
      <div className="mx-auto max-w-3xl pt-8 border-t border-slate-200 grid grid-cols-1 sm:grid-cols-3 gap-4 text-center text-xs text-slate-500">
        <div className="p-3 rounded-2xl bg-white border border-slate-100">
          <span className="font-bold text-slate-900 block mb-0.5">100% Sin Afiliación</span>
          <span>Recomendaciones técnicas imparciales sin links de Amazon.</span>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-100">
          <span className="font-bold text-slate-900 block mb-0.5">Datos Oficiales</span>
          <span>Pesos en báscula y pasos de rueda verificados de fabricantes.</span>
        </div>
        <div className="p-3 rounded-2xl bg-white border border-slate-100">
          <span className="font-bold text-slate-900 block mb-0.5">Compra Directa</span>
          <span>Enlaces directos a la tienda oficial de cada marca.</span>
        </div>
      </div>
    </div>
  );
}
