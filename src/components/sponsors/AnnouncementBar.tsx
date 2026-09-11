"use client";

import React, { useState, useEffect } from "react";
import { Sparkles, ExternalLink, X } from "lucide-react";

export function AnnouncementBar() {
  const [dismissed, setDismissed] = useState(false);

  useEffect(() => {
    const isHidden = sessionStorage.getItem("giant_announcement_dismissed");
    if (isHidden === "true") {
      setDismissed(true);
    }
  }, []);

  const handleDismiss = () => {
    setDismissed(true);
    sessionStorage.setItem("giant_announcement_dismissed", "true");
  };

  if (dismissed) return null;

  return (
    <aside
      aria-label="Anuncio patrocinado oficial"
      className="relative z-50 bg-gradient-to-r from-slate-950 via-[#002b66] to-slate-950 text-white text-xs py-2 px-3 sm:px-4 border-b border-blue-900/40 shadow-sm"
    >
      <div className="mx-auto max-w-7xl flex items-center justify-between gap-3">
        {/* Left / Center content */}
        <div className="flex-1 flex flex-wrap items-center justify-center sm:justify-start gap-2 text-center sm:text-left">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 font-extrabold text-[10px] tracking-wide border border-blue-400/30 uppercase">
            <Sparkles className="w-2.5 h-2.5 text-blue-300" />
            Partner Oficial
          </span>
          <span className="font-semibold text-slate-200 text-[11px] sm:text-xs">
            Nueva Colección Giant 2026: Máxima rigidez y confort en{" "}
            <span className="text-white font-bold">Revolt Gravel</span> y{" "}
            <span className="text-white font-bold">TCR Advanced</span>.
          </span>
          <span className="hidden md:inline text-blue-200 text-[11px]">
            Garantía de por vida en cuadro y recogida en 200+ tiendas autorizadas.
          </span>
        </div>

        {/* Right action & Close */}
        <div className="flex items-center gap-2 shrink-0">
          <a
            href="https://www.giant-bicycles.com/es"
            target="_blank"
            rel="sponsored noopener noreferrer"
            className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-bold text-[11px] shadow-xs transition-colors"
          >
            <span>Ver Gama Giant</span>
            <ExternalLink className="w-3 h-3 text-blue-200" />
          </a>
          <button
            onClick={handleDismiss}
            aria-label="Cerrar anuncio"
            className="p-1 rounded-md text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}
