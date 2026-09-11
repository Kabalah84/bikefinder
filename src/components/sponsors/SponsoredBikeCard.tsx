"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  ExternalLink,
  Sparkles,
  ShieldCheck,
  Layers,
  MapPin,
  Flame,
  ArrowRight,
} from "lucide-react";

export function SponsoredBikeCard() {
  const [imageLoaded, setImageLoaded] = useState(true);

  return (
    <div className="group flex flex-col justify-between rounded-2xl bg-gradient-to-b from-blue-50/50 via-white to-white border-2 border-blue-400/60 hover:border-blue-500 hover:shadow-xl hover:-translate-y-0.5 transition-all duration-200 overflow-hidden relative shadow-xs">
      {/* Top Banner Accent Tag */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-blue-600 via-teal-400 to-blue-600 z-20" />

      {/* Top Image Section (Matching 16/10 aspect ratio of BikeCard) */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100 flex items-center justify-center">
        {imageLoaded ? (
          <img
            src="https://images2.giant-bicycles.com/b_white%2Cc_pad%2Ch_600%2Cq_80%2Cw_800/kairpcniftfft4yaxy4h/MY26RevoltAdvancedPro0_ColorACyberLime.jpg"
            alt="Giant Revolt Advanced Pro 2026 Patrocinado"
            className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageLoaded(false)}
          />
        ) : (
          <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-4">
            <span className="text-xl font-black tracking-widest text-blue-400">GIANT</span>
            <span className="text-xs text-slate-300">Revolt Advanced Pro 2026</span>
          </div>
        )}

        {/* Top Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          <span className="inline-flex items-center gap-1 rounded-lg bg-blue-600 px-2 py-0.5 text-[11px] font-extrabold text-white shadow-xs">
            <Sparkles className="w-3 h-3 text-amber-300 fill-amber-300" />
            Patrocinado
          </span>
          <span className="rounded-lg bg-slate-900/85 backdrop-blur-xs px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
            Giant Oficial 2026
          </span>
        </div>

        <div className="absolute top-2.5 right-2.5 z-10">
          <span className="inline-flex items-center gap-1 rounded-lg bg-amber-400 text-slate-950 font-black px-2 py-0.5 text-[10px] shadow-sm">
            <Flame className="w-3 h-3 text-rose-600 fill-rose-600" />
            Destacado
          </span>
        </div>

        {/* Bottom Tag over image */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          <span className="inline-flex items-center gap-1 rounded-md bg-blue-950/85 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-blue-200 border border-blue-500/30">
            <ShieldCheck className="w-3 h-3 text-teal-400" />
            Garantía de por Vida en Cuadro
          </span>
        </div>
      </div>

      {/* Content Section (Matching BikeCard layout) */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Model Headline */}
          <div className="mb-2">
            <span className="text-xs font-black uppercase tracking-wider text-blue-600">
              Giant Bicycles España
            </span>
            <h3 className="text-base font-black text-slate-900 group-hover:text-blue-600 transition-colors line-clamp-1">
              Nueva Gama Revolt & TCR Advanced
            </h3>
          </div>

          <p className="text-xs text-slate-600 font-medium line-clamp-2 mb-3">
            Carbono Advanced-Grade, absorción inteligente D-Fuse y geometría regulable Flip Chip para máxima velocidad y control.
          </p>

          {/* 3-spec Matrix */}
          <div className="grid grid-cols-3 gap-1.5 py-2.5 px-3 rounded-xl bg-blue-50/60 border border-blue-100 text-center mb-3">
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-medium text-slate-600">Tecnología</span>
              <span className="text-xs font-black text-blue-900">D-Fuse Flex</span>
            </div>
            <div className="flex flex-col items-center border-x border-blue-200/80 px-1">
              <span className="text-[10px] font-medium text-slate-600">Cuadro</span>
              <span className="text-xs font-black text-slate-900">Carbono Pro</span>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-medium text-slate-600">Entrega</span>
              <span className="text-xs font-black text-teal-700">En Tienda</span>
            </div>
          </div>

          {/* Promotion / Value Prop Pill */}
          <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg border border-blue-200 bg-blue-50/90 text-blue-950 mb-3">
            <span className="font-semibold flex items-center gap-1 text-blue-900">
              <MapPin className="w-3 h-3 text-blue-600 shrink-0" />
              Red de Distribuidores:
            </span>
            <span className="font-bold text-blue-950">200+ tiendas autorizadas</span>
          </div>
        </div>

        {/* Pricing & Footer Actions */}
        <div className="pt-3 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-xs font-semibold text-slate-500 mr-1">Desde</span>
              <span className="text-lg font-black text-blue-900">1.699 €</span>
            </div>
            <span className="text-[10px] font-extrabold text-blue-700 bg-blue-100/70 px-2 py-0.5 rounded-full border border-blue-200">
              Financiación 0%
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <Link
              href="/?brand=Giant"
              className="flex items-center justify-center gap-1 rounded-xl bg-slate-100 hover:bg-blue-50 hover:text-blue-700 text-slate-700 py-2 px-2.5 text-xs font-bold transition-all border border-slate-200"
            >
              <span>Ver Modelos</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>

            <a
              href="https://www.giant-bicycles.com/es"
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="flex items-center justify-center gap-1 rounded-xl bg-blue-600 hover:bg-blue-700 py-2 px-2.5 text-xs font-bold text-white transition-colors shadow-xs"
            >
              <span>Giant Oficial</span>
              <ExternalLink className="w-3.5 h-3.5 text-blue-200" />
            </a>
          </div>

          <div className="mt-2 text-center">
            <a
              href="https://www.giant-bicycles.com/es/stores"
              target="_blank"
              rel="sponsored noopener noreferrer"
              className="text-[11px] font-bold text-blue-600 hover:text-blue-800 hover:underline inline-flex items-center gap-1"
            >
              Encuentra tu tienda Giant más cercana →
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
