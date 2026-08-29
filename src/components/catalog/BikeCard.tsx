"use client";

import React from "react";
import Link from "next/link";
import { BikeProduct } from "@/lib/schema/bike";
import { useComparison } from "@/lib/context/ComparisonContext";
import { formatCurrencyEur, formatDisciplineName, formatMaterialName } from "@/lib/utils/formatters";
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
  Info,
} from "lucide-react";

interface BikeCardProps {
  bike: BikeProduct;
}

export function BikeCard({ bike }: BikeCardProps) {
  const { isInComparison, toggleBike } = useComparison();
  const selected = isInComparison(bike.id);

  const gearRatio = analyzeGearRatio(
    bike.groupset.chainrings,
    bike.groupset.cassette,
    bike.groupset.minGearRatio,
    bike.groupset.maxGearRatio
  );

  const getDisciplineBadgeClass = () => {
    switch (bike.discipline) {
      case "gravel":
        return "bg-amber-100 text-amber-950 border-amber-300";
      case "road_endurance":
        return "bg-sky-100 text-sky-950 border-sky-300";
      case "road_race":
        return "bg-rose-100 text-rose-950 border-rose-300";
      case "all_road":
        return "bg-emerald-100 text-emerald-950 border-emerald-300";
      default:
        return "bg-slate-100 text-slate-900 border-slate-300";
    }
  };

  return (
    <div
      className={`group flex flex-col justify-between rounded-2xl bg-white border transition-all duration-200 overflow-hidden ${
        selected
          ? "border-teal-500 ring-2 ring-teal-500/20 shadow-lg shadow-teal-500/10"
          : "border-slate-200 hover:border-slate-300 hover:shadow-md"
      }`}
    >
      {/* Top Image & Badges */}
      <div className="relative aspect-[16/10] w-full overflow-hidden bg-slate-100">
        <img
          src={bike.officialImageUrl}
          alt={`${bike.brand} ${bike.model} (${bike.year})`}
          className="h-full w-full object-cover object-center group-hover:scale-105 transition-transform duration-300"
          loading="lazy"
        />

        {/* Top left discipline & year badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-wrap gap-1.5 z-10">
          <span
            className={`rounded-lg px-2 py-0.5 text-[11px] font-bold border shadow-xs ${getDisciplineBadgeClass()}`}
          >
            {formatDisciplineName(bike.discipline)}
          </span>
          <span className="rounded-lg bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 text-[11px] font-bold text-white shadow-xs">
            {bike.year}
          </span>
        </div>

        {/* Top right discount badge */}
        {bike.discountPercentage && bike.discountPercentage > 0 ? (
          <div className="absolute top-2.5 right-2.5 flex items-center gap-1 rounded-lg bg-rose-600 px-2 py-0.5 text-[11px] font-extrabold text-white shadow-sm">
            <Flame className="w-3 h-3" />
            <span>-{bike.discountPercentage}%</span>
          </div>
        ) : null}

        {/* Shifting tech badge */}
        <div className="absolute bottom-2.5 left-2.5 z-10">
          {bike.groupset.isElectronic ? (
            <span className="inline-flex items-center gap-1 rounded-md bg-teal-900/85 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-teal-200 border border-teal-500/30">
              <Zap className="w-3 h-3 text-teal-400" />
              Electrónico Di2/AXS
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 rounded-md bg-slate-900/75 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium text-slate-200">
              <Cog className="w-3 h-3 text-slate-400" />
              Mecánico {bike.groupset.speedCount}v
            </span>
          )}
        </div>
      </div>

      {/* Content Section */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Model */}
          <div className="mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-600">
              {bike.brand}
            </span>
            <h3 className="text-base font-bold text-slate-900 group-hover:text-teal-600 transition-colors line-clamp-1">
              <Link href={`/bici/${bike.id}`}>{bike.model}</Link>
            </h3>
          </div>

          {/* Groupset summary */}
          <p className="text-xs text-slate-700 font-medium line-clamp-1 mb-3">
            {bike.groupset.name} · {bike.groupset.chainrings} ({bike.groupset.cassette})
          </p>

          {/* Technical Spec Matrix (Grid) */}
          <div className="grid grid-cols-3 gap-1.5 py-2.5 px-3 rounded-xl bg-slate-50 border border-slate-100 text-center mb-3">
            {/* Paso de rueda */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-medium text-slate-600 flex items-center gap-0.5">
                <CircleDot className="w-3 h-3 text-teal-600" />
                Paso Rueda
              </span>
              <span className="text-xs font-bold text-slate-900">
                {bike.maxTireClearanceMm} mm
              </span>
            </div>

            {/* Peso */}
            <div className="flex flex-col items-center border-x border-slate-200/80 px-1">
              <span className="text-[10px] font-medium text-slate-600 flex items-center gap-0.5">
                <Weight className="w-3 h-3 text-slate-600" />
                Peso
              </span>
              <span className="text-xs font-bold text-slate-900">
                {bike.weightKg ? `${bike.weightKg} kg` : "N/D"}
              </span>
            </div>

            {/* Material Cuadro */}
            <div className="flex flex-col items-center">
              <span className="text-[10px] font-medium text-slate-600 flex items-center gap-0.5">
                <Layers className="w-3 h-3 text-slate-600" />
                Cuadro
              </span>
              <span className="text-xs font-bold text-slate-900">
                {formatMaterialName(bike.frameMaterial)}
              </span>
            </div>
          </div>

          {/* Gear Ratio badge */}
          <div className="flex items-center justify-between text-[11px] px-2.5 py-1.5 rounded-lg bg-teal-50/70 border border-teal-100/80 mb-3">
            <span className="font-medium text-teal-900 flex items-center gap-1">
              <TrendingUp className="w-3 h-3 text-teal-600" />
              Subida (Ratio Mín):
            </span>
            <span className="font-bold text-teal-950">
              {bike.groupset.minGearRatio.toFixed(2)} ({gearRatio.climbingBadge.label.split(" ")[0]})
            </span>
          </div>
        </div>

        {/* Pricing & Footer Actions */}
        <div className="pt-3 border-t border-slate-100">
          {/* Price Row */}
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-lg font-black text-slate-900">
                {formatCurrencyEur(bike.currentPriceEur)}
              </span>
              {bike.msrpEur > bike.currentPriceEur && (
                <span className="ml-1.5 text-xs text-slate-500 line-through">
                  {formatCurrencyEur(bike.msrpEur)}
                </span>
              )}
            </div>
            <span className="text-[10px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              PVP Oficial
            </span>
          </div>

          {/* Action Buttons */}
          <div className="grid grid-cols-2 gap-2">
            {/* Compare Toggle */}
            <button
              onClick={() => toggleBike(bike)}
              type="button"
              className={`flex items-center justify-center gap-1.5 rounded-xl py-2 px-2.5 text-xs font-bold transition-all ${
                selected
                  ? "bg-teal-600 text-white hover:bg-teal-700 shadow-sm"
                  : "bg-slate-100 text-slate-700 hover:bg-slate-200"
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
              href={bike.officialUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center gap-1 rounded-xl bg-slate-900 py-2 px-2.5 text-xs font-bold text-white hover:bg-teal-700 transition-colors shadow-xs"
              title={`Ver ${bike.brand} ${bike.model} en la web oficial`}
            >
              <span>Web Oficial</span>
              <ExternalLink className="w-3.5 h-3.5 text-slate-400 group-hover:text-white" />
            </a>
          </div>

          {/* View Specs link */}
          <div className="mt-2 text-center">
            <Link
              href={`/bici/${bike.id}`}
              className="text-[11px] font-semibold text-slate-500 hover:text-teal-600 hover:underline"
            >
              Ver geometría y ficha técnica completa →
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
