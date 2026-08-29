"use client";

import React from "react";
import Link from "next/link";
import { useComparison } from "@/lib/context/ComparisonContext";
import { formatCurrencyEur } from "@/lib/utils/formatters";
import { Scale, X, ArrowRight, Trash2 } from "lucide-react";

export function ComparisonDrawer() {
  const { selectedBikes, removeBike, clearAll } = useComparison();

  if (selectedBikes.length === 0) {
    return null;
  }

  const queryParams = selectedBikes.map((b) => b.id).join(",");

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-3 sm:p-4 bg-white/95 backdrop-blur-md border-t border-slate-200 shadow-2xl transition-all">
      <div className="mx-auto max-w-7xl flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Left info */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-start">
          <div className="flex items-center gap-2">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-teal-600 text-white shadow-md shadow-teal-600/30">
              <Scale className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xs sm:text-sm font-bold text-slate-900 block">
                Comparativa ({selectedBikes.length}/4)
              </span>
              <span className="text-[11px] text-slate-500 hidden sm:block">
                Selecciona hasta 4 modelos para confrontar geometrías y ratios
              </span>
            </div>
          </div>

          <button
            onClick={clearAll}
            className="text-xs text-slate-400 hover:text-rose-600 flex items-center gap-1 sm:ml-2 transition-colors"
            title="Vaciar comparador"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">Vaciar</span>
          </button>
        </div>

        {/* Selected Bike Thumbnails */}
        <div className="flex items-center gap-2 overflow-x-auto max-w-full py-1">
          {selectedBikes.map((bike) => (
            <div
              key={bike.id}
              className="relative flex items-center gap-2 rounded-xl bg-slate-50 border border-slate-200 p-1.5 pr-2.5 shrink-0 shadow-2xs group"
            >
              <img
                src={bike.officialImageUrl}
                alt={bike.model}
                className="h-9 w-12 rounded-lg object-cover bg-white"
              />
              <div className="text-left">
                <p className="text-[11px] font-bold text-slate-900 line-clamp-1 max-w-[100px] sm:max-w-[130px]">
                  {bike.brand} {bike.model}
                </p>
                <p className="text-[10px] font-semibold text-teal-700">
                  {formatCurrencyEur(bike.currentPriceEur)}
                </p>
              </div>
              <button
                onClick={() => removeBike(bike.id)}
                className="p-1 rounded-full text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                title={`Quitar ${bike.model}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* CTA Button */}
        <div className="w-full sm:w-auto">
          <Link
            href={`/comparador?ids=${queryParams}`}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-xs sm:text-sm font-bold text-white shadow-lg shadow-teal-600/25 hover:bg-teal-700 transition-all hover:scale-102"
          >
            <span>Comparar {selectedBikes.length} Bicicletas</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
