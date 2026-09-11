"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Sparkles,
  ExternalLink,
  ShieldCheck,
  Zap,
  MapPin,
  ChevronRight,
  Bike,
} from "lucide-react";

interface SponsoredWideBannerProps {
  onFilterGiant?: () => void;
}

export function SponsoredWideBanner({ onFilterGiant }: SponsoredWideBannerProps) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="col-span-1 sm:col-span-2 lg:col-span-3 rounded-3xl bg-gradient-to-br from-slate-950 via-[#021f47] to-slate-950 border-2 border-blue-600/30 shadow-xl overflow-hidden relative my-2">
      {/* Glow Effects */}
      <div className="absolute -top-24 -right-24 w-96 h-96 bg-blue-600/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="relative z-10 p-6 sm:p-8 lg:p-10 flex flex-col lg:flex-row items-center justify-between gap-8">
        {/* Left column: Value Proposition & Copy */}
        <div className="flex-1 space-y-4 text-center lg:text-left">
          {/* Top Badges */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-500/25 text-blue-300 border border-blue-400/40 text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5 text-blue-300" />
              Patrocinador Destacado
            </span>
            <span className="px-2.5 py-1 rounded-full bg-white/10 text-slate-200 text-xs font-semibold backdrop-blur-xs">
              Gama Giant Oficial 2026
            </span>
          </div>

          {/* Headline */}
          <h3 className="text-xl sm:text-2xl lg:text-3xl font-black text-white tracking-tight leading-tight">
            Ingeniería de Campeones del Mundo:{" "}
            <span className="bg-gradient-to-r from-blue-400 to-teal-300 bg-clip-text text-transparent">
              Rendimiento Puro en Todo Terreno
            </span>
          </h3>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-slate-300 max-w-2xl leading-relaxed">
            Desde la legendaria aceleración de la <strong>TCR Advanced</strong> en puertos míticos, hasta la versatilidad
            imbatible de la <strong>Revolt</strong> en pistas de gravel y la tracción del sistema <strong>Maestro MTB</strong>.
            Diseñadas, fabricadas y probadas por el mayor fabricante de bicicletas del mundo.
          </p>

          {/* Feature Highlights Pills */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-1 text-xs">
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-900/40 text-blue-200 border border-blue-700/40 font-semibold">
              <ShieldCheck className="w-3.5 h-3.5 text-teal-400" />
              Garantía de por vida
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-900/40 text-blue-200 border border-blue-700/40 font-semibold">
              <Zap className="w-3.5 h-3.5 text-amber-400" />
              Carbono Advanced-Grade
            </span>
            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-900/40 text-blue-200 border border-blue-700/40 font-semibold">
              <MapPin className="w-3.5 h-3.5 text-blue-400" />
              Recogida en tienda y puesta a punto
            </span>
          </div>

          {/* CTAs */}
          <div className="flex flex-wrap items-center justify-center lg:justify-start gap-3 pt-3">
            {onFilterGiant ? (
              <button
                type="button"
                onClick={onFilterGiant}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/30 transition-all cursor-pointer"
              >
                <Bike className="w-4 h-4" />
                <span>Ver Modelos Giant en Catálogo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <Link
                href="/?brand=Giant"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs sm:text-sm shadow-md shadow-blue-600/30 transition-all"
              >
                <Bike className="w-4 h-4" />
                <span>Ver Modelos Giant en Catálogo</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            )}

            <a
              href="https://www.giant-bicycles.com/es/stores"
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-slate-100 font-semibold text-xs sm:text-sm border border-white/15 backdrop-blur-xs transition-colors"
            >
              <span>Localizar Tienda Oficial</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-300" />
            </a>
          </div>
        </div>

        {/* Right column: Bicycle showcase image */}
        <div className="w-full lg:w-96 shrink-0 flex flex-col items-center justify-center">
          <div className="relative w-full max-w-sm rounded-2xl bg-white/5 border border-white/10 p-3 backdrop-blur-md shadow-2xl">
            <div className="relative aspect-[16/10] w-full rounded-xl overflow-hidden bg-white/90 flex items-center justify-center">
              {!imgError ? (
                <img
                  src="https://images2.giant-bicycles.com/b_white%2Cc_pad%2Ch_600%2Cq_80%2Cw_800/wa52h5d3yixax6z69acl/MY26TCRAdvancedPro0-AXS_ColorBMidnightMoon.jpg"
                  alt="Giant TCR Advanced Pro 2026"
                  className="w-full h-full object-cover object-center"
                  loading="lazy"
                  referrerPolicy="no-referrer"
                  onError={() => setImgError(true)}
                />
              ) : (
                <div className="p-4 text-center text-slate-900 font-black">
                  GIANT TCR ADVANCED PRO
                </div>
              )}
              <div className="absolute bottom-2 right-2 bg-slate-950/85 backdrop-blur-xs px-2 py-0.5 rounded text-[10px] font-bold text-white">
                TCR Advanced Pro 0 · 2026
              </div>
            </div>

            <div className="flex items-center justify-between mt-2.5 px-1 text-slate-300 text-xs">
              <span className="font-semibold text-white">Giant TCR Advanced</span>
              <span className="font-black text-blue-400">SRAM Force AXS</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
