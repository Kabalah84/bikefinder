"use client";

import React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BikeProduct } from "@/lib/schema/bike";
import { useComparison } from "@/lib/context/ComparisonContext";
import {
  formatCurrencyEur,
  formatDisciplineName,
  formatMaterialName,
  formatSuspensionName,
} from "@/lib/utils/formatters";
import { sanitizeExternalUrl } from "@/lib/utils/security";
import { analyzeGearRatio } from "@/lib/utils/gear-calculator";
import {
  ExternalLink,
  Scale,
  Check,
  Zap,
  Cog,
  Weight,
  Layers,
  CircleDot,
  TrendingUp,
  Flame,
  Activity,
  ArrowRight,
} from "lucide-react";

interface BikeCardProps {
  bike: BikeProduct;
}

export function BikeCard({ bike }: BikeCardProps) {
  const router = useRouter();
  const { isInComparison, toggleBike } = useComparison();
  const selected = isInComparison(bike.id);
  const [imageError, setImageError] = React.useState(false);

  const handleCardClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target.closest("button") || target.closest("a")) {
      return;
    }
    router.push(`/bici/${bike.id}`);
  };

  const gearRatio = analyzeGearRatio(
    bike.groupset.chainrings,
    bike.groupset.cassette,
    bike.groupset.minGearRatio,
    bike.groupset.maxGearRatio
  );

  const getDisciplinePillClass = () => {
    switch (bike.discipline) {
      case "gravel":
        return "bg-amber-100/90 text-amber-950 border-amber-300/80";
      case "road_endurance":
        return "bg-sky-100/90 text-sky-950 border-sky-300/80";
      case "road_race":
        return "bg-rose-100/90 text-rose-950 border-rose-300/80";
      case "all_road":
        return "bg-emerald-100/90 text-emerald-950 border-emerald-300/80";
      case "mtb":
        return "bg-purple-100/90 text-purple-950 border-purple-300/80";
      default:
        return "bg-slate-100/90 text-slate-900 border-slate-300/80";
    }
  };

  return (
    <article
      onClick={handleCardClick}
      className={`group flex flex-col justify-between rounded-3xl bg-white border card-hover-lift overflow-hidden cursor-pointer relative ${
        selected
          ? "border-teal-500 ring-2 ring-teal-500/30 shadow-lg shadow-teal-500/10"
          : "border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-xl"
      }`}
    >
      {/* Top Image & Floating Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-gradient-to-b from-slate-100/90 via-slate-50 to-white flex items-center justify-center">
        {!imageError ? (
          <img
            src={bike.officialImageUrl}
            alt={`Bicicleta ${bike.brand} ${bike.model} (${bike.year}) de ${formatDisciplineName(bike.discipline)}`}
            className="h-full w-full object-cover object-center group-hover:scale-108 transition-transform duration-500 ease-out"
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
          />
        ) : (
          <div className="flex flex-col items-center justify-center p-4 text-center select-none w-full h-full bg-slate-50">
            <div className="w-12 h-12 rounded-2xl bg-slate-200/70 flex items-center justify-center mb-2 text-slate-400">
              <Layers className="w-6 h-6" />
            </div>
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-400">
              {bike.brand}
            </span>
            <span className="text-xs font-bold text-slate-700 line-clamp-1 max-w-[200px]">
              {bike.model}
            </span>
          </div>
        )}

        {/* Top left floating discipline & year tags */}
        <div className="absolute top-3 left-3 flex flex-wrap gap-1.5 z-10">
          <span
            className={`rounded-full px-2.5 py-0.5 text-[10px] font-black uppercase tracking-wider border backdrop-blur-xs shadow-2xs ${getDisciplinePillClass()}`}
          >
            {formatDisciplineName(bike.discipline)}
          </span>
          <span className="rounded-full bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white shadow-2xs">
            {bike.year}
          </span>
          {bike.isElectric && (
            <span className="rounded-full bg-amber-400 text-slate-950 px-2 py-0.5 text-[10px] font-black shadow-2xs">
              ⚡ E-Bike
            </span>
          )}
          {bike.suspensionType === "full" && (
            <span className="rounded-full bg-purple-950/80 text-purple-200 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold shadow-2xs">
              Doble
            </span>
          )}
        </div>

        {/* Top right discount badge */}
        {bike.discountPercentage && bike.discountPercentage > 0 ? (
          <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-rose-600 px-2.5 py-0.5 text-[10px] font-black text-white shadow-xs">
            <Flame className="w-3 h-3 fill-white" />
            <span>-{bike.discountPercentage}%</span>
          </div>
        ) : null}

        {/* Bottom Shifting tech pill */}
        <div className="absolute bottom-2.5 left-3 z-10">
          {bike.groupset.isElectronic ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-teal-950/85 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-teal-200 border border-teal-500/30">
              <Zap className="w-3 h-3 text-teal-400" />
              Di2 / AXS
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-950/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium text-slate-200">
              <Cog className="w-3 h-3 text-slate-400" />
              Mecánico {bike.groupset.speedCount}v
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Model Headline */}
          <div className="mb-2">
            <span className="text-[11px] font-black uppercase tracking-wider text-slate-600">
              {bike.brand}
            </span>
            <h3 className="text-base font-black text-slate-950 group-hover:text-teal-600 transition-colors line-clamp-1">
              <Link href={`/bici/${bike.id}`} onClick={(e) => e.stopPropagation()}>
                {bike.model}
              </Link>
            </h3>
          </div>

          {/* Groupset summary */}
          <p className="text-xs text-slate-600 font-semibold line-clamp-1 mb-3">
            {bike.groupset.name} · {bike.groupset.chainrings} ({bike.groupset.cassette})
          </p>

          {/* Technical Spec Matrix (Redesigned Capsule) */}
          <div className="grid grid-cols-3 gap-1 py-2.5 px-3 rounded-2xl bg-slate-50 border border-slate-100 text-center mb-3">
            {/* Suspensión en MTB o Paso de rueda en Carretera/Gravel */}
            {bike.discipline === "mtb" ? (
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-0.5">
                  <Activity className="w-3 h-3 text-purple-600" />
                  Suspensión
                </span>
                <span className="text-xs font-black text-slate-900 mt-0.5">
                  {formatSuspensionName(bike.suspensionType)}
                </span>
              </div>
            ) : (
              <div className="flex flex-col items-center">
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-0.5">
                  <CircleDot className="w-3 h-3 text-teal-600" />
                  Paso Rueda
                </span>
                <span className="text-xs font-black text-slate-900 mt-0.5">
                  {bike.maxTireClearanceMm} mm
                </span>
              </div>
            )}

            {/* Peso */}
            <div className="flex flex-col items-center border-x border-slate-200/70 px-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-0.5">
                <Weight className="w-3 h-3 text-slate-600" />
                Peso
              </span>
              <span className="text-xs font-black text-slate-900 mt-0.5">
                {bike.weightKg ? `${bike.weightKg} kg` : "N/D"}
              </span>
            </div>

            {/* Material Cuadro */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-600 flex items-center gap-0.5">
                <Layers className="w-3 h-3 text-slate-600" />
                Cuadro
              </span>
              <span className="text-xs font-black text-slate-900 mt-0.5">
                {formatMaterialName(bike.frameMaterial)}
              </span>
            </div>
          </div>

          {/* Gear Ratio or E-Bike Assistance */}
          <div
            className={`flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-xl border mb-3 ${
              bike.isElectric
                ? "bg-amber-50/90 border-amber-200/90 text-amber-950"
                : "bg-teal-50/80 border-teal-100/90 text-teal-950"
            }`}
          >
            <span
              className={`font-semibold flex items-center gap-1 ${
                bike.isElectric ? "text-amber-900" : "text-teal-900"
              }`}
            >
              {bike.isElectric ? (
                <>
                  <Zap className="w-3 h-3 text-amber-600 fill-amber-500" />
                  Motor & Asistencia:
                </>
              ) : (
                <>
                  <TrendingUp className="w-3 h-3 text-teal-600" />
                  Subida (Ratio Mín):
                </>
              )}
            </span>
            <span className="font-extrabold">
              {bike.isElectric ? (
                <span className="text-amber-950">
                  Asistencia 25 km/h · {bike.groupset.minGearRatio.toFixed(2)}
                </span>
              ) : (
                <span>
                  {bike.groupset.minGearRatio.toFixed(2)} ({gearRatio.climbingBadge.label.split(" ")[0]})
                </span>
              )}
            </span>
          </div>
        </div>

        {/* Pricing & Footer Actions */}
        <div className="pt-3 border-t border-slate-100">
          {/* Price Row */}
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-xl font-black text-slate-950 tracking-tight">
                {formatCurrencyEur(bike.currentPriceEur)}
              </span>
              {bike.msrpEur > bike.currentPriceEur && (
                <span className="ml-2 text-xs text-slate-500 line-through font-medium">
                  {formatCurrencyEur(bike.msrpEur)}
                </span>
              )}
            </div>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              PVP Oficial
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {/* Compare Toggle */}
            <button
              onClick={(e) => {
                e.stopPropagation();
                toggleBike(bike);
              }}
              type="button"
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-xs font-bold transition-all cursor-pointer ${
                selected
                  ? "bg-teal-600 text-white hover:bg-teal-700 shadow-xs"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200 hover:text-slate-900 border border-slate-200/80"
              }`}
            >
              {selected ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>En Comparador</span>
                </>
              ) : (
                <>
                  <Scale className="w-3.5 h-3.5 text-slate-500" />
                  <span>Comparar</span>
                </>
              )}
            </button>

            {/* Official Web Link */}
            <a
              href={sanitizeExternalUrl(bike.officialUrl)}
              target="_blank"
              rel="noopener noreferrer"
              onClick={(e) => e.stopPropagation()}
              className="flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 py-2 px-2.5 text-xs font-bold text-white hover:bg-teal-600 transition-colors shadow-xs"
              title={`Ver ${bike.brand} ${bike.model} en la web oficial`}
            >
              <span>Web Oficial</span>
              <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-white" />
            </a>
          </div>

          {/* View Specs link */}
          <div className="mt-2.5 text-center">
            <Link
              href={`/bici/${bike.id}`}
              onClick={(e) => e.stopPropagation()}
              className="inline-flex items-center gap-1 text-[11px] font-bold text-slate-600 hover:text-teal-600 hover:underline transition-colors"
            >
              <span>Ver geometría y ficha técnica</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}
