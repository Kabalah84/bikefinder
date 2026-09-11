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
    <aside
      aria-label="Bandeja de comparativa activa"
      className="fixed bottom-4 left-1/2 -translate-x-1/2 z-50 w-[95%] max-w-5xl rounded-3xl bg-[#080d18]/95 backdrop-blur-xl border border-white/15 p-3 sm:p-4 text-white shadow-2xl ring-1 ring-white/10 transition-all duration-300 animate-in fade-in slide-in-from-bottom-5"
    >
      <div className="flex flex-col md:flex-row items-center justify-between gap-3">
        {/* Left header / title */}
        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-start">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-teal-500 text-slate-950 shadow-md shadow-teal-500/30 font-black">
              <Scale className="h-4.5 w-4.5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs sm:text-sm font-black text-white">
                  Comparativa Activa
                </span>
                <span className="px-2 py-0.5 rounded-full bg-white/15 text-teal-300 text-[10px] font-black">
                  {selectedBikes.length}/4
                </span>
              </div>
              <span className="text-[10px] text-slate-400 hidden sm:block">
                Confrontación milimétrica de pesos, desarrollos y Stack/Reach
              </span>
            </div>
          </div>

          <button
            onClick={clearAll}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center gap-1 transition-colors px-2 py-1 rounded-lg hover:bg-white/5 cursor-pointer"
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
              className="relative flex items-center gap-2 rounded-2xl bg-white/10 border border-white/10 p-1.5 pr-2.5 shrink-0 backdrop-blur-xs group hover:border-teal-500/50 transition-colors"
            >
              <img
                src={bike.officialImageUrl}
                alt={bike.model}
                className="h-9 w-12 rounded-xl object-cover bg-white"
                referrerPolicy="no-referrer"
              />
              <div className="text-left">
                <p className="text-[11px] font-bold text-white line-clamp-1 max-w-[100px] sm:max-w-[130px]">
                  {bike.brand} {bike.model}
                </p>
                <p className="text-[10px] font-extrabold text-teal-400">
                  {formatCurrencyEur(bike.currentPriceEur)}
                </p>
              </div>
              <button
                onClick={() => removeBike(bike.id)}
                className="p-1 rounded-full text-slate-400 hover:text-rose-400 hover:bg-white/10 transition-colors cursor-pointer"
                title={`Quitar ${bike.model}`}
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>

        {/* Action Button */}
        <div className="w-full md:w-auto shrink-0">
          <Link
            href={`/comparador?ids=${queryParams}`}
            className="w-full md:w-auto inline-flex items-center justify-center gap-2 rounded-2xl bg-teal-500 hover:bg-teal-400 px-5 py-2.5 text-xs sm:text-sm font-black text-slate-950 shadow-lg shadow-teal-500/25 transition-all hover:scale-102 cursor-pointer"
          >
            <span>Ver Comparativa Completa</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    </aside>
  );
}
