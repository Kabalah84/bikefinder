"use client";

import React, { useState } from "react";
import { DetailedSpecCategory } from "@/lib/schema/bike";
import {
  ChevronDown,
  Layers,
  Cog,
  ShieldCheck,
  CircleDot,
  Sparkles,
  SlidersHorizontal,
  Info,
} from "lucide-react";

interface DetailedSpecsAccordionProps {
  categories?: DetailedSpecCategory[];
  fallbackBrand: string;
  fallbackModel: string;
}

export function DetailedSpecsAccordion({
  categories,
  fallbackBrand,
  fallbackModel,
}: DetailedSpecsAccordionProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!categories || categories.length === 0) {
    return null;
  }

  const getCategoryIcon = (categoryName: string) => {
    const lower = categoryName.toLowerCase();
    if (lower.includes("cuadro") || lower.includes("horquilla")) {
      return <Layers className="w-5 h-5 text-teal-600" />;
    }
    if (lower.includes("transmisi") || lower.includes("cambio")) {
      return <Cog className="w-5 h-5 text-amber-600" />;
    }
    if (lower.includes("freno")) {
      return <ShieldCheck className="w-5 h-5 text-rose-600" />;
    }
    if (lower.includes("rueda") || lower.includes("neum")) {
      return <CircleDot className="w-5 h-5 text-sky-600" />;
    }
    return <Sparkles className="w-5 h-5 text-purple-600" />;
  };

  return (
    <section aria-label="Despiece técnico completo" className="rounded-3xl bg-white border border-slate-200 shadow-xs overflow-hidden">
      {/* Botón de despliegue / Toggle */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 sm:px-8 py-5 flex items-center justify-between bg-gradient-to-r from-slate-50 via-white to-slate-50 hover:from-teal-50/50 hover:to-slate-50 transition-all text-left"
      >
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-teal-600/10 text-teal-700 flex items-center justify-center border border-teal-200/50">
            <SlidersHorizontal className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base sm:text-lg font-bold text-slate-900 flex items-center gap-2">
              Despiece Técnico y Componentes Oficiales
              <span className="text-xs font-semibold px-2.5 py-0.5 bg-teal-100 text-teal-800 rounded-full">
                {categories.length} Bloques
              </span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              {isOpen
                ? "Haz clic para contraer el despiece técnico detallado."
                : "Consulta cada componente individual: ejes, pinzas, piñones, platos, radios y periféricos."}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="hidden sm:inline-block text-xs font-bold text-teal-700">
            {isOpen ? "Ocultar despiece" : "Ver despiece completo"}
          </span>
          <div
            className={`w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center transition-transform duration-300 text-slate-600 ${
              isOpen ? "rotate-180 bg-teal-600 text-white" : ""
            }`}
          >
            <ChevronDown className="w-4 h-4" />
          </div>
        </div>
      </button>

      {/* Contenido desplegable */}
      {isOpen && (
        <div className="p-6 sm:p-8 pt-2 border-t border-slate-100 space-y-8 animate-fadeIn">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, idx) => (
              <div
                key={idx}
                className="rounded-2xl border border-slate-200 bg-slate-50/50 p-5 space-y-4 shadow-2xs hover:border-slate-300 transition-colors"
              >
                <div className="flex items-center gap-2.5 pb-3 border-b border-slate-200">
                  {getCategoryIcon(cat.category)}
                  <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wide">
                    {cat.category}
                  </h3>
                </div>

                <div className="space-y-3 divide-y divide-slate-100">
                  {cat.items.map((item, itemIdx) => (
                    <div
                      key={itemIdx}
                      className={itemIdx === 0 ? "space-y-0.5" : "pt-2.5 space-y-0.5"}
                    >
                      <div className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
                        {item.label}
                      </div>
                      <div className="text-xs sm:text-sm font-bold text-slate-900 leading-snug">
                        {item.value}
                      </div>
                      {item.description && (
                        <div className="text-[11px] text-slate-500">
                          {item.description}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500 flex items-center gap-2">
            <Info className="w-4 h-4 text-teal-600 shrink-0" />
            <span>
              Especificaciones oficiales declaradas por <strong>{fallbackBrand}</strong> para el modelo{" "}
              <strong>{fallbackModel}</strong>. Los componentes pueden variar levemente según disponibilidad del fabricante en fábrica.
            </span>
          </div>
        </div>
      )}
    </section>
  );
}
