"use client";

import React from "react";
import { Sparkles, ExternalLink, ShieldCheck, MapPin, Check } from "lucide-react";

interface SponsoredSidebarSpotlightProps {
  isGiantSelected: boolean;
  onToggleGiant: () => void;
}

export function SponsoredSidebarSpotlight({
  isGiantSelected,
  onToggleGiant,
}: SponsoredSidebarSpotlightProps) {
  return (
    <div className="rounded-xl border-2 border-blue-500/40 bg-gradient-to-br from-blue-50/70 via-white to-slate-50 p-3.5 shadow-xs relative overflow-hidden transition-all">
      {/* Decorative corner glow */}
      <div className="absolute top-0 right-0 w-16 h-16 bg-blue-500/10 rounded-full blur-xl pointer-events-none" />

      {/* Top Header */}
      <div className="flex items-center justify-between gap-1 mb-2">
        <div className="flex items-center gap-1.5">
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-600 px-1.5 py-0.5 text-[10px] font-black text-white uppercase tracking-wider">
            <Sparkles className="w-2.5 h-2.5 text-amber-300 fill-amber-300" />
            Partner Oficial
          </span>
          <span className="text-xs font-black text-slate-900 tracking-tight">
            Giant Bicycles
          </span>
        </div>
        <span className="text-[10px] font-bold text-blue-700 bg-blue-100/80 px-1.5 py-0.2 rounded">
          España
        </span>
      </div>

      <p className="text-[11px] text-slate-600 leading-snug mb-2.5">
        Referente mundial en fibra de carbono y componentes Syncros/Cadex. Modelos TCR, Revolt, Defy y Trance disponibles.
      </p>

      {/* Perks summary */}
      <div className="space-y-1 mb-3 text-[10px] text-slate-700">
        <div className="flex items-center gap-1">
          <ShieldCheck className="w-3 h-3 text-teal-600 shrink-0" />
          <span>Garantía de por vida en cuadro</span>
        </div>
        <div className="flex items-center gap-1">
          <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
          <span>200+ distribuidores oficiales con taller</span>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="space-y-1.5">
        <button
          type="button"
          onClick={onToggleGiant}
          className={`w-full py-1.5 px-2 rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
            isGiantSelected
              ? "bg-blue-600 text-white shadow-xs"
              : "bg-blue-100/80 hover:bg-blue-200/80 text-blue-900 border border-blue-200"
          }`}
        >
          {isGiantSelected ? (
            <>
              <Check className="w-3.5 h-3.5" />
              <span>Giant Seleccionado (Filtro Activo)</span>
            </>
          ) : (
            <span>Ver solo bicicletas Giant</span>
          )}
        </button>

        <a
          href="https://www.giant-bicycles.com/es"
          target="_blank"
          rel="sponsored noopener noreferrer"
          className="w-full py-1 px-2 rounded-lg text-[11px] font-semibold text-slate-600 hover:text-blue-700 hover:bg-slate-100 transition-colors flex items-center justify-center gap-1 text-center"
        >
          <span>Web Oficial & Tiendas Giant</span>
          <ExternalLink className="w-3 h-3 text-slate-400" />
        </a>
      </div>
    </div>
  );
}
