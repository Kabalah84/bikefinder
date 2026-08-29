import React from "react";
import { Sparkles, ExternalLink } from "lucide-react";
import { sanitizeExternalUrl } from "@/lib/utils/security";

interface AdBannerProps {
  slotType?: "leaderboard" | "in_feed" | "sidebar";
  title?: string;
  brandName?: string;
  ctaText?: string;
  ctaUrl?: string;
}

export function AdBanner({
  slotType = "in_feed",
  title = "Espacio Patrocinado · Lanzamientos y Novedades de Temporada",
  brandName,
  ctaText = "Ver Novedades",
  ctaUrl,
}: AdBannerProps) {
  if (slotType === "leaderboard") {
    return (
      <div className="w-full my-6 rounded-2xl bg-gradient-to-r from-slate-900 via-slate-800 to-teal-950 p-4 sm:p-6 text-white shadow-md relative overflow-hidden border border-slate-700/50">
        <div className="absolute top-2 right-3 text-[10px] font-bold tracking-widest text-slate-400 uppercase">
          PATROCINIO OFICIAL
        </div>
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="space-y-1 text-center sm:text-left">
            <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-500/20 px-2.5 py-0.5 text-xs font-semibold text-teal-300 border border-teal-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              Nuevas Gamas 2025
            </div>
            <h3 className="text-lg font-bold text-white tracking-tight">
              ¿Buscando tu próxima bicicleta de Gravel o Carretera?
            </h3>
            <p className="text-xs sm:text-sm text-slate-300">
              Compara pesos reales, pasos de rueda y grupos de transmisión oficiales sin intermediarios.
            </p>
          </div>
          {ctaUrl && (
            <a
              href={sanitizeExternalUrl(ctaUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 inline-flex items-center gap-2 rounded-xl bg-teal-500 px-4 py-2 text-xs sm:text-sm font-bold text-slate-950 hover:bg-teal-400 transition-colors shadow-lg shadow-teal-500/20"
            >
              {ctaText} <ExternalLink className="w-4 h-4" />
            </a>
          )}
        </div>
      </div>
    );
  }

  // In-Feed Card Banner
  return (
    <div className="rounded-2xl border-2 border-dashed border-teal-200 bg-gradient-to-br from-teal-50/50 via-emerald-50/30 to-white p-5 flex flex-col justify-between relative overflow-hidden hover:border-teal-300 transition-all">
      <div className="flex items-center justify-between text-[10px] font-bold tracking-widest text-teal-700 uppercase mb-2">
        <span className="flex items-center gap-1">
          <Sparkles className="w-3 h-3 text-amber-500" />
          Destacado Oficial
        </span>
        <span className="text-slate-400">Patrocinado</span>
      </div>

      <div className="my-auto py-2">
        <h4 className="font-bold text-slate-900 text-base mb-1.5">{title}</h4>
        <p className="text-xs text-slate-600 leading-relaxed">
          Consulta directamente las promociones activas, disponibilidad de tallas y configuraciones de color MyO en las webs de los fabricantes.
        </p>
      </div>

      <div className="pt-3 mt-2 border-t border-teal-100">
        <a
          href={sanitizeExternalUrl(ctaUrl || "https://www.canyon.com/es-es/")}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2.5 px-3 text-xs font-semibold text-white hover:bg-teal-700 transition-colors shadow-sm"
        >
          <span>Visitar Fabricante Oficial</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      </div>
    </div>
  );
}
