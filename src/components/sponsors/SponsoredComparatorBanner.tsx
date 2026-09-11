"use client";

import React from "react";
import { Sparkles, Scale, ExternalLink, Plus, Check } from "lucide-react";
import { BikeProduct } from "@/lib/schema/bike";

interface SponsoredComparatorBannerProps {
  allBikes: BikeProduct[];
  selectedBikes: BikeProduct[];
  onAddBike: (bike: BikeProduct) => void;
}

export function SponsoredComparatorBanner({
  allBikes,
  selectedBikes,
  onAddBike,
}: SponsoredComparatorBannerProps) {
  const giantGravel = allBikes.find(
    (b) => b.id === "giant-revolt-advanced-pro-0-2026" || (b.brand === "Giant" && b.discipline === "gravel")
  );
  const giantRoad = allBikes.find(
    (b) => b.id === "giant-tcr-advanced-pro-0-axs-2026" || (b.brand === "Giant" && b.discipline === "road_race")
  );

  const isGravelSelected = giantGravel && selectedBikes.some((b) => b.id === giantGravel.id);
  const isRoadSelected = giantRoad && selectedBikes.some((b) => b.id === giantRoad.id);

  return (
    <div className="rounded-2xl bg-gradient-to-r from-blue-950 via-slate-900 to-blue-900 text-white p-5 sm:p-6 border-2 border-blue-600/40 shadow-lg relative overflow-hidden">
      {/* Decorative background glow */}
      <div className="absolute top-0 right-0 w-72 h-72 bg-blue-500/15 rounded-full blur-2xl pointer-events-none" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-5">
        {/* Left text */}
        <div className="space-y-1.5 max-w-xl">
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1 rounded-full bg-blue-500/25 px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider text-blue-300 border border-blue-400/30">
              <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
              Sugerencia de Patrocinador
            </span>
            <span className="text-xs font-semibold text-slate-300">
              Giant Bicycles Oficial
            </span>
          </div>

          <h3 className="text-base sm:text-lg font-black text-white">
            ¿Comparando rendimiento? Contrasta con la referencia Giant
          </h3>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            Compara la relación Stack/Reach, los ratios de desarrollo subida y el paso de rueda de tu selección
            frente a los buques insignia de carbono de Giant.
          </p>
        </div>

        {/* Right action buttons */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5 w-full lg:w-auto">
          {giantGravel && (
            <button
              type="button"
              disabled={isGravelSelected}
              onClick={() => onAddBike(giantGravel)}
              className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isGravelSelected
                  ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-500 text-white shadow-xs cursor-pointer"
              }`}
            >
              {isGravelSelected ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Revolt en Tabla</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Comparar Revolt Pro (Gravel)</span>
                </>
              )}
            </button>
          )}

          {giantRoad && (
            <button
              type="button"
              disabled={isRoadSelected}
              onClick={() => onAddBike(giantRoad)}
              className={`inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
                isRoadSelected
                  ? "bg-slate-800 text-slate-400 border border-slate-700 cursor-not-allowed"
                  : "bg-white/10 hover:bg-white/20 text-white border border-white/20 cursor-pointer"
              }`}
            >
              {isRoadSelected ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span>TCR en Tabla</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>+ Comparar TCR Pro (Carretera)</span>
                </>
              )}
            </button>
          )}

          <a
            href="https://www.giant-bicycles.com/es"
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="inline-flex items-center justify-center gap-1 px-3 py-2 rounded-xl bg-slate-800/80 hover:bg-slate-800 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors"
          >
            <span>Web Giant</span>
            <ExternalLink className="w-3 h-3 text-slate-400" />
          </a>
        </div>
      </div>
    </div>
  );
}
