import React from "react";
import { Metadata } from "next";
import { getAllBikes } from "@/lib/data/bikes";
import { GearCalculatorTool } from "@/components/tools/GearCalculatorTool";
import { TrendingUp, Gauge, Layers, Info } from "lucide-react";

export const metadata: Metadata = {
  title: "Calculadora de Desarrollos Ciclistas y Ratios (1x y 2x) | BikeFinder.es",
  description:
    "Calcula metros de avance por pedalada, ratios de subida y velocidades en km/h a 70, 80, 90 y 100 RPM según tu combinación de platos (48/31, 50/34, 40T) y cassettes (11-36, 10-44, 10-50, 11-34).",
};

export default function CalculadoraDesarrollosPage() {
  const bikes = getAllBikes();

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      {/* Header */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
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
      </div>

      {/* Main Tool */}
      <GearCalculatorTool catalogBikes={bikes} />

      {/* Educational Guide */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
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
      </div>
    </div>
  );
}
