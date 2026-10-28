"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BikeProduct } from "@/lib/schema/bike";
import {
  formatCurrencyEur,
  formatDisciplineName,
  formatMaterialName,
  formatWeight,
  getComponentTierBadge,
} from "@/lib/utils/formatters";
import { sanitizeExternalUrl } from "@/lib/utils/security";
import { analyzeGearRatio } from "@/lib/utils/gear-calculator";
import { analyzePosture } from "@/lib/utils/geometry-analysis";
import {
  ExternalLink,
  X,
  Trophy,
  Zap,
  Cog,
  Check,
  Minus,
  TrendingUp,
  CircleDot,
  Compass,
  ChevronDown,
  Eye,
  Award,
  Layers,
  ShieldCheck,
} from "lucide-react";

interface ComparisonTableProps {
  bikes: BikeProduct[];
  onRemoveBike?: (id: string) => void;
  onAddMoreBikes?: () => void;
}

type SectionKey = "general" | "frame" | "drivetrain" | "geometry" | "wheels";

export function ComparisonTable({ bikes, onRemoveBike }: ComparisonTableProps) {
  const [collapsedSections, setCollapsedSections] = useState<Record<SectionKey, boolean>>({
    general: false,
    frame: false,
    drivetrain: false,
    geometry: false,
    wheels: false,
  });
  const [highlightDiffsOnly, setHighlightDiffsOnly] = useState(false);

  if (bikes.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <Compass className="mx-auto h-12 w-12 text-teal-700 mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">No hay bicicletas seleccionadas</h3>
        <p className="text-sm text-slate-600 max-w-md mx-auto mb-6">
          Explora nuestro catálogo y pulsa el botón &quot;Comparar&quot; en hasta 4 modelos para ver sus especificaciones técnicas frente a frente.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-700 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-teal-800 transition-colors"
        >
          Ir al Catálogo de Bicicletas
        </Link>
      </div>
    );
  }

  const toggleSection = (key: SectionKey) => {
    setCollapsedSections((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  };

  const expandAll = () => {
    setCollapsedSections({
      general: false,
      frame: false,
      drivetrain: false,
      geometry: false,
      wheels: false,
    });
  };

  const collapseAll = () => {
    setCollapsedSections({
      general: true,
      frame: true,
      drivetrain: true,
      geometry: true,
      wheels: true,
    });
  };

  // Identificar ganadores en métricas clave
  const minPrice = Math.min(...bikes.map((b) => b.currentPriceEur));
  const validWeights = bikes.map((b) => b.weightKg).filter((w): w is number => typeof w === "number");
  const minWeight = validWeights.length > 0 ? Math.min(...validWeights) : null;
  const maxClearance = Math.max(...bikes.map((b) => b.maxTireClearanceMm));
  const bestClimbingRatio = Math.min(...bikes.map((b) => b.groupset.minGearRatio));

  // Helper para comprobar si una fila tiene diferencias entre los modelos seleccionados
  const hasDifferences = (getter: (b: BikeProduct) => string | number | boolean | undefined) => {
    if (bikes.length <= 1) return true;
    const firstVal = getter(bikes[0]);
    return bikes.some((b) => getter(b) !== firstVal);
  };

  const getDiffRowClass = (isDifferent: boolean) => {
    if (!highlightDiffsOnly) return "";
    return isDifferent ? "bg-teal-50/30" : "opacity-55";
  };

  return (
    <div className="w-full space-y-6">
      {/* Resumen de medallas técnicas */}
      {bikes.length > 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Mejor Precio */}
          <div className="rounded-2xl bg-emerald-50 border border-emerald-200 p-3.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-900 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-emerald-700" />
              Más Económica
            </span>
            <p className="text-sm font-bold text-emerald-950 mt-1">
              {bikes.find((b) => b.currentPriceEur === minPrice)?.brand}{" "}
              {bikes.find((b) => b.currentPriceEur === minPrice)?.model}
            </p>
            <span className="text-xs text-emerald-800 font-extrabold">
              {formatCurrencyEur(minPrice)}
            </span>
          </div>

          {/* Más Ligera */}
          {minWeight && (
            <div className="rounded-2xl bg-sky-50 border border-sky-200 p-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-900 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-sky-700" />
                Más Ligera
              </span>
              <p className="text-sm font-bold text-sky-950 mt-1">
                {bikes.find((b) => b.weightKg === minWeight)?.brand}{" "}
                {bikes.find((b) => b.weightKg === minWeight)?.model}
              </p>
              <span className="text-xs text-sky-800 font-extrabold">{minWeight} kg</span>
            </div>
          )}

          {/* Mayor Paso de Rueda */}
          <div className="rounded-2xl bg-amber-50 border border-amber-200 p-3.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-900 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-700" />
              Mayor Paso Rueda
            </span>
            <p className="text-sm font-bold text-amber-950 mt-1">
              {bikes.find((b) => b.maxTireClearanceMm === maxClearance)?.brand}{" "}
              {bikes.find((b) => b.maxTireClearanceMm === maxClearance)?.model}
            </p>
            <span className="text-xs text-amber-900 font-extrabold">{maxClearance} mm</span>
          </div>

          {/* Mejor Ratio de Subida */}
          <div className="rounded-2xl bg-teal-50 border border-teal-200 p-3.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-teal-700" />
              Mejor Escaladora
            </span>
            <p className="text-sm font-bold text-teal-950 mt-1">
              {bikes.find((b) => b.groupset.minGearRatio === bestClimbingRatio)?.brand}{" "}
              {bikes.find((b) => b.groupset.minGearRatio === bestClimbingRatio)?.model}
            </p>
            <span className="text-xs text-teal-800 font-extrabold">
              Ratio {bestClimbingRatio.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Barra de controles de visualización Mobile-First */}
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl bg-white p-3.5 border border-slate-200 shadow-2xs">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setHighlightDiffsOnly(!highlightDiffsOnly)}
            aria-pressed={highlightDiffsOnly}
            className={`inline-flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-xs font-bold border transition-all cursor-pointer ${
              highlightDiffsOnly
                ? "bg-teal-700 text-white border-teal-700 shadow-2xs"
                : "bg-slate-50 text-slate-800 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Eye className="w-3.5 h-3.5" />
            <span>Resaltar diferencias</span>
          </button>
          <span className="text-[11px] font-semibold text-slate-600 hidden sm:inline">
            Desliza horizontalmente en móvil o pliega bloques técnicos
          </span>
        </div>

        <div className="flex items-center gap-2 text-xs font-bold">
          <button
            type="button"
            onClick={expandAll}
            className="px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Expandir todo
          </button>
          <span className="text-slate-300">|</span>
          <button
            type="button"
            onClick={collapseAll}
            className="px-2.5 py-1 rounded-lg text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            Colapsar todo
          </button>
        </div>
      </div>

      {/* Sticky Header Fijo en Viewport al hacer Scroll Vertical */}
      <div
        aria-label="Cabecera fija de modelos comparados"
        className="sticky top-16 z-30 rounded-2xl bg-slate-950/95 backdrop-blur-md text-white border border-slate-800 shadow-lg px-3 py-2.5 sm:px-5"
      >
        <div className="flex items-center gap-3 overflow-x-auto no-scrollbar">
          <div className="hidden md:flex flex-col shrink-0 w-44 pr-2 border-r border-slate-800">
            <span className="text-[10px] font-black uppercase tracking-wider text-teal-400">
              Modelos Fijados
            </span>
            <span className="text-xs font-bold text-slate-200">
              {bikes.length} {bikes.length === 1 ? "bicicleta" : "bicicletas"} en pantalla
            </span>
          </div>
          <div className="grid grid-flow-col auto-cols-[minmax(175px,1fr)] gap-2.5 flex-1">
            {bikes.map((bike) => (
              <div
                key={`sticky-${bike.id}`}
                className="flex items-center justify-between gap-2 rounded-xl bg-slate-900/90 border border-slate-800 px-2.5 py-1.5"
              >
                <div className="min-w-0">
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-teal-400 block truncate">
                    {bike.brand} · {bike.year}
                  </span>
                  <Link
                    href={`/bici/${bike.id}`}
                    className="text-xs font-bold text-white hover:text-teal-300 truncate block"
                  >
                    {bike.model}
                  </Link>
                  <span className="text-[11px] font-black text-emerald-400">
                    {formatCurrencyEur(bike.currentPriceEur)}
                  </span>
                </div>
                <a
                  href={sanitizeExternalUrl(bike.officialUrl)}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={`Ver en web oficial de ${bike.brand}`}
                  title={`Ver en web oficial de ${bike.brand}`}
                  className="shrink-0 p-2 rounded-lg bg-teal-500 text-slate-950 hover:bg-teal-400 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Tabla Comparativa Desplazable Horizontalmente */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full border-collapse text-left">
          {/* Header Row: Bicicletas, Insignias y Enlaces Oficiales */}
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50">
              <th
                scope="col"
                className="sticky left-0 bg-slate-50 p-4 sm:p-6 w-44 sm:w-60 min-w-[165px] align-bottom shadow-[2px_0_5px_-2px_rgba(0,0,0,0.06)] z-20"
              >
                <span className="text-xs font-black uppercase tracking-wider text-slate-600 block mb-1">
                  Especificación Técnica
                </span>
                <span className="text-base sm:text-lg font-extrabold text-slate-950">
                  Comparativa ({bikes.length})
                </span>
              </th>
              {bikes.map((bike) => {
                const tier = getComponentTierBadge(
                  bike.groupset.name,
                  bike.groupset.isElectronic,
                  bike.currentPriceEur
                );
                return (
                  <th
                    scope="col"
                    key={bike.id}
                    className="p-4 sm:p-6 min-w-[235px] max-w-[280px] align-top relative group"
                  >
                    {/* Botón quitar sólo si se proporciona onRemoveBike */}
                    {onRemoveBike && (
                      <button
                        type="button"
                        onClick={() => onRemoveBike(bike.id)}
                        aria-label={`Quitar ${bike.brand} ${bike.model} de la comparativa`}
                        className="absolute top-3 right-3 z-10 p-1.5 rounded-full bg-slate-200 text-slate-700 hover:bg-rose-100 hover:text-rose-800 transition-colors cursor-pointer"
                        title="Quitar modelo"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}

                    {/* Imagen con width/height explícitos para evitar CLS */}
                    <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100 mb-3 border border-slate-200/70 shadow-2xs">
                      <img
                        src={bike.officialImageUrl}
                        alt={`Bicicleta ${bike.brand} ${bike.model} (${bike.year})`}
                        width={480}
                        height={300}
                        loading="lazy"
                        decoding="async"
                        className="h-full w-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                      <span className="absolute top-2 left-2 rounded-md bg-slate-950/85 px-2 py-0.5 text-[10px] font-bold text-white">
                        {bike.year}
                      </span>
                    </div>

                    {/* Insignia de gama */}
                    <div className="mb-2 flex flex-wrap gap-1">
                      <span
                        className={`inline-flex items-center gap-1 rounded-md px-2 py-0.5 text-[10px] font-bold border ${tier.badgeClass}`}
                      >
                        <Award className="w-3 h-3" />
                        <span>{tier.shortLabel}</span>
                      </span>
                    </div>

                    {/* Nombre y Marca */}
                    <span className="text-xs font-extrabold uppercase tracking-wider text-slate-600 block">
                      {bike.brand}
                    </span>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-950 line-clamp-2 mb-2">
                      <Link href={`/bici/${bike.id}`} className="hover:text-teal-700 hover:underline">
                        {bike.model}
                      </Link>
                    </h3>

                    {/* Precios */}
                    <div className="mb-4">
                      <span className="text-lg font-black text-slate-950 block">
                        {formatCurrencyEur(bike.currentPriceEur)}
                      </span>
                      {bike.msrpEur > bike.currentPriceEur && (
                        <span className="text-xs text-slate-600 line-through font-semibold">
                          {formatCurrencyEur(bike.msrpEur)}
                        </span>
                      )}
                    </div>

                    {/* CTA Oficial claramente identificable */}
                    <a
                      href={sanitizeExternalUrl(bike.officialUrl)}
                      target="_blank"
                      rel="noopener noreferrer"
                      aria-label={`Ver en web oficial de ${bike.brand} (se abre en nueva pestaña)`}
                      className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-950 py-2.5 px-3 text-xs font-bold text-white hover:bg-teal-700 transition-colors shadow-xs"
                    >
                      <span className="truncate">Ver en web oficial de {bike.brand}</span>
                      <ExternalLink className="w-3.5 h-3.5 text-teal-300 shrink-0" aria-hidden="true" />
                    </a>
                  </th>
                );
              })}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-200/70 text-xs sm:text-sm">
            {/* SECCIÓN 1: DATOS BÁSICOS */}
            <tr className="bg-slate-100/90">
              <td colSpan={bikes.length + 1} className="p-0">
                <button
                  type="button"
                  onClick={() => toggleSection("general")}
                  aria-expanded={!collapsedSections.general}
                  className="w-full flex items-center justify-between p-3.5 px-4 sm:px-6 text-left font-extrabold text-slate-900 text-xs uppercase tracking-wider hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-teal-700" />
                    <span>1. Información General, Categoría y Temporada</span>
                  </h2>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-700 transition-transform ${
                      collapsedSections.general ? "-rotate-90" : "rotate-0"
                    }`}
                  />
                </button>
              </td>
            </tr>
            {!collapsedSections.general && (
              <>
                <tr className={getDiffRowClass(hasDifferences((b) => b.discipline))}>
                  <th
                    scope="row"
                    className="sticky left-0 bg-white p-4 sm:px-6 font-bold text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10"
                  >
                    Disciplina
                  </th>
                  {bikes.map((bike) => (
                    <td key={bike.id} className="p-4">
                      <span className="font-bold text-slate-900">
                        {formatDisciplineName(bike.discipline)}
                      </span>
                    </td>
                  ))}
                </tr>
                <tr className={getDiffRowClass(hasDifferences((b) => b.year))}>
                  <th
                    scope="row"
                    className="sticky left-0 bg-white p-4 sm:px-6 font-bold text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10"
                  >
                    Año de Temporada
                  </th>
                  {bikes.map((bike) => (
                    <td key={bike.id} className="p-4 font-bold text-slate-900">
                      {bike.year}
                    </td>
                  ))}
                </tr>
                <tr className={getDiffRowClass(hasDifferences((b) => b.currentPriceEur))}>
                  <th
                    scope="row"
                    className="sticky left-0 bg-white p-4 sm:px-6 font-bold text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10"
                  >
                    Precio Orientativo (PVP)
                  </th>
                  {bikes.map((bike) => (
                    <td
                      key={bike.id}
                      className={`p-4 ${
                        bike.currentPriceEur === minPrice && bikes.length > 1
                          ? "bg-emerald-50/70 font-black text-emerald-950"
                          : "font-bold text-slate-900"
                      }`}
                    >
                      {formatCurrencyEur(bike.currentPriceEur)}
                      {bike.currentPriceEur === minPrice && bikes.length > 1 && (
                        <span className="ml-2 text-[10px] bg-emerald-200 text-emerald-950 px-1.5 py-0.5 rounded-md font-bold">
                          Mejor Precio
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              </>
            )}

            {/* SECCIÓN 2: CUADRO, PESO Y PASO DE RUEDA */}
            <tr className="bg-slate-100/90">
              <td colSpan={bikes.length + 1} className="p-0">
                <button
                  type="button"
                  onClick={() => toggleSection("frame")}
                  aria-expanded={!collapsedSections.frame}
                  className="w-full flex items-center justify-between p-3.5 px-4 sm:px-6 text-left font-extrabold text-slate-900 text-xs uppercase tracking-wider hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-teal-700" />
                    <span>2. Cuadro, Peso Oficial y Paso de Rueda</span>
                  </h2>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-700 transition-transform ${
                      collapsedSections.frame ? "-rotate-90" : "rotate-0"
                    }`}
                  />
                </button>
              </td>
            </tr>
            {!collapsedSections.frame && (
              <>
                <tr className={getDiffRowClass(hasDifferences((b) => b.maxTireClearanceMm))}>
                  <th
                    scope="row"
                    className="sticky left-0 bg-white p-4 sm:px-6 font-bold text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10"
                  >
                    Paso de Rueda Máximo (Clearance)
                  </th>
                  {bikes.map((bike) => (
                    <td
                      key={bike.id}
                      className={`p-4 ${
                        bike.maxTireClearanceMm === maxClearance && bikes.length > 1
                          ? "bg-amber-50/70 font-bold"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <CircleDot className="w-4 h-4 text-teal-700" />
                        <span className="text-sm font-extrabold text-slate-950">
                          {bike.maxTireClearanceMm} mm
                        </span>
                        {bike.maxTireClearanceMm === maxClearance && bikes.length > 1 && (
                          <span className="text-[10px] bg-amber-200 text-amber-950 px-1.5 py-0.5 rounded-md font-bold">
                            Mayor
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className={getDiffRowClass(hasDifferences((b) => b.weightKg))}>
                  <th
                    scope="row"
                    className="sticky left-0 bg-white p-4 sm:px-6 font-bold text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10"
                  >
                    Peso Oficial Declarado
                  </th>
                  {bikes.map((bike) => (
                    <td
                      key={bike.id}
                      className={`p-4 ${
                        minWeight && bike.weightKg === minWeight && bikes.length > 1
                          ? "bg-sky-50/70 font-bold"
                          : ""
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-950">
                          {formatWeight(bike.weightKg, bike.weightSizeReference)}
                        </span>
                        {minWeight && bike.weightKg === minWeight && bikes.length > 1 && (
                          <span className="text-[10px] bg-sky-200 text-sky-950 px-1.5 py-0.5 rounded-md font-bold">
                            Más Ligera
                          </span>
                        )}
                      </div>
                    </td>
                  ))}
                </tr>
                <tr className={getDiffRowClass(hasDifferences((b) => b.frameMaterial))}>
                  <th
                    scope="row"
                    className="sticky left-0 bg-white p-4 sm:px-6 font-bold text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10"
                  >
                    Material del Cuadro
                  </th>
                  {bikes.map((bike) => (
                    <td key={bike.id} className="p-4 font-bold text-slate-900">
                      {formatMaterialName(bike.frameMaterial)}
                    </td>
                  ))}
                </tr>
                <tr className={getDiffRowClass(hasDifferences((b) => b.forkMaterial))}>
                  <th
                    scope="row"
                    className="sticky left-0 bg-white p-4 sm:px-6 font-bold text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10"
                  >
                    Horquilla
                  </th>
                  {bikes.map((bike) => (
                    <td key={bike.id} className="p-4 font-bold text-slate-900">
                      {formatMaterialName(bike.forkMaterial)}
                    </td>
                  ))}
                </tr>
                <tr className={getDiffRowClass(hasDifferences((b) => b.integratedCockpit))}>
                  <th
                    scope="row"
                    className="sticky left-0 bg-white p-4 sm:px-6 font-bold text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10"
                  >
                    Cockpit / Cableado Interno
                  </th>
                  {bikes.map((bike) => (
                    <td key={bike.id} className="p-4">
                      {bike.integratedCockpit ? (
                        <span className="inline-flex items-center gap-1 text-emerald-900 font-bold">
                          <Check className="w-4 h-4 text-emerald-700" /> 100% Integrado
                        </span>
                      ) : (
                        <span className="text-slate-700 font-semibold">Semi-integrado</span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr className={getDiffRowClass(hasDifferences((b) => b.bikepackingMounts))}>
                  <th
                    scope="row"
                    className="sticky left-0 bg-white p-4 sm:px-6 font-bold text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10"
                  >
                    Roscas Bikepacking
                  </th>
                  {bikes.map((bike) => (
                    <td key={bike.id} className="p-4">
                      {bike.bikepackingMounts ? (
                        <span className="inline-flex items-center gap-1 text-teal-900 font-bold">
                          <Check className="w-4 h-4 text-teal-700" /> Cuadro + Horquilla
                        </span>
                      ) : (
                        <span className="text-slate-600 font-semibold flex items-center gap-1">
                          <Minus className="w-4 h-4" /> Estándar
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
              </>
            )}

            {/* SECCIÓN 3: TRANSMISIÓN Y DESARROLLOS */}
            <tr className="bg-slate-100/90">
              <td colSpan={bikes.length + 1} className="p-0">
                <button
                  type="button"
                  onClick={() => toggleSection("drivetrain")}
                  aria-expanded={!collapsedSections.drivetrain}
                  className="w-full flex items-center justify-between p-3.5 px-4 sm:px-6 text-left font-extrabold text-slate-900 text-xs uppercase tracking-wider hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Cog className="w-4 h-4 text-teal-700" />
                    <span>3. Transmisión, Grupo y Desarrollos</span>
                  </h2>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-700 transition-transform ${
                      collapsedSections.drivetrain ? "-rotate-90" : "rotate-0"
                    }`}
                  />
                </button>
              </td>
            </tr>
            {!collapsedSections.drivetrain && (
              <>
                <tr className={getDiffRowClass(hasDifferences((b) => b.groupset.name))}>
                  <th
                    scope="row"
                    className="sticky left-0 bg-white p-4 sm:px-6 font-bold text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10"
                  >
                    Grupo Completo
                  </th>
                  {bikes.map((bike) => (
                    <td key={bike.id} className="p-4 font-extrabold text-slate-950">
                      {bike.groupset.name}
                    </td>
                  ))}
                </tr>
                <tr className={getDiffRowClass(hasDifferences((b) => b.groupset.isElectronic))}>
                  <th
                    scope="row"
                    className="sticky left-0 bg-white p-4 sm:px-6 font-bold text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10"
                  >
                    Tipo de Cambio
                  </th>
                  {bikes.map((bike) => (
                    <td key={bike.id} className="p-4">
                      {bike.groupset.isElectronic ? (
                        <span className="inline-flex items-center gap-1 text-teal-950 font-bold bg-teal-50 px-2.5 py-0.5 rounded-lg border border-teal-200">
                          <Zap className="w-3.5 h-3.5 text-teal-700" /> Electrónico Di2/AXS
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-slate-800 font-bold bg-slate-100 px-2.5 py-0.5 rounded-lg border border-slate-200">
                          <Cog className="w-3.5 h-3.5 text-slate-700" /> Mecánico {bike.groupset.speedCount}v
                        </span>
                      )}
                    </td>
                  ))}
                </tr>
                <tr
                  className={getDiffRowClass(
                    hasDifferences((b) => `${b.groupset.chainrings}-${b.groupset.cassette}`)
                  )}
                >
                  <th
                    scope="row"
                    className="sticky left-0 bg-white p-4 sm:px-6 font-bold text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10"
                  >
                    Platos y Cassette
                  </th>
                  {bikes.map((bike) => (
                    <td key={bike.id} className="p-4 font-semibold text-slate-900">
                      {bike.groupset.chainrings} con {bike.groupset.cassette}
                    </td>
                  ))}
                </tr>
                <tr className={getDiffRowClass(hasDifferences((b) => b.groupset.minGearRatio))}>
                  <th
                    scope="row"
                    className="sticky left-0 bg-white p-4 sm:px-6 font-bold text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10"
                  >
                    <span className="flex items-center gap-1">
                      <TrendingUp className="w-3.5 h-3.5 text-teal-700" />
                      Ratio Mínimo (Subida)
                    </span>
                    <span className="text-[11px] text-slate-600 font-medium block">
                      Menor número = mayor facilidad en pendientes
                    </span>
                  </th>
                  {bikes.map((bike) => {
                    const gear = analyzeGearRatio(
                      bike.groupset.chainrings,
                      bike.groupset.cassette,
                      bike.groupset.minGearRatio,
                      bike.groupset.maxGearRatio
                    );
                    const isBest = bike.groupset.minGearRatio === bestClimbingRatio;
                    return (
                      <td key={bike.id} className={`p-4 ${isBest && bikes.length > 1 ? "bg-teal-50/70" : ""}`}>
                        <div className="text-sm font-extrabold text-teal-950">
                          {bike.groupset.minGearRatio.toFixed(2)}
                        </div>
                        <span className="text-[11px] font-bold text-teal-900 block mt-0.5">
                          {gear.climbingBadge.label}
                        </span>
                      </td>
                    );
                  })}
                </tr>
                <tr className={getDiffRowClass(hasDifferences((b) => b.groupset.maxGearRatio))}>
                  <th
                    scope="row"
                    className="sticky left-0 bg-white p-4 sm:px-6 font-bold text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10"
                  >
                    Ratio Máximo (Llano / Bajada)
                    <span className="text-[11px] text-slate-600 font-medium block">
                      Mayor número = mayor velocidad punta
                    </span>
                  </th>
                  {bikes.map((bike) => {
                    const gear = analyzeGearRatio(
                      bike.groupset.chainrings,
                      bike.groupset.cassette,
                      bike.groupset.minGearRatio,
                      bike.groupset.maxGearRatio
                    );
                    return (
                      <td key={bike.id} className="p-4">
                        <div className="text-sm font-bold text-slate-950">
                          {bike.groupset.maxGearRatio.toFixed(2)}
                        </div>
                        <span className="text-[11px] text-slate-700 font-semibold">
                          {gear.sprintBadge.label}
                        </span>
                      </td>
                    );
                  })}
                </tr>
              </>
            )}

            {/* SECCIÓN 4: GEOMETRÍA (TALLA M) */}
            <tr className="bg-slate-100/90">
              <td colSpan={bikes.length + 1} className="p-0">
                <button
                  type="button"
                  onClick={() => toggleSection("geometry")}
                  aria-expanded={!collapsedSections.geometry}
                  className="w-full flex items-center justify-between p-3.5 px-4 sm:px-6 text-left font-extrabold text-slate-900 text-xs uppercase tracking-wider hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <Compass className="w-4 h-4 text-teal-700" />
                    <span>4. Geometría Oficial Talla M (Postura & Manejo)</span>
                  </h2>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-700 transition-transform ${
                      collapsedSections.geometry ? "-rotate-90" : "rotate-0"
                    }`}
                  />
                </button>
              </td>
            </tr>
            {!collapsedSections.geometry && (
              <>
                <tr className={getDiffRowClass(hasDifferences((b) => b.geometry.stackReachRatio))}>
                  <th
                    scope="row"
                    className="sticky left-0 bg-white p-4 sm:px-6 font-bold text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10"
                  >
                    Ratio Stack / Reach
                    <span className="text-[11px] text-slate-600 font-medium block">
                      &gt;1.50 = Confort · &lt;1.45 = Racing
                    </span>
                  </th>
                  {bikes.map((bike) => {
                    const posture = analyzePosture(bike.geometry.stackReachRatio);
                    return (
                      <td key={bike.id} className="p-4">
                        <span className="text-sm font-black text-slate-950">
                          {bike.geometry.stackReachRatio.toFixed(2)}
                        </span>
                        <span
                          className={`inline-block ml-1.5 text-[10px] font-bold px-2 py-0.5 rounded-md border ${posture.badgeColor}`}
                        >
                          {posture.badgeLabel}
                        </span>
                      </td>
                    );
                  })}
                </tr>
                <tr
                  className={getDiffRowClass(
                    hasDifferences((b) => `${b.geometry.stackMm}-${b.geometry.reachMm}`)
                  )}
                >
                  <th
                    scope="row"
                    className="sticky left-0 bg-white p-4 sm:px-6 font-bold text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10"
                  >
                    Stack / Reach Oficial
                  </th>
                  {bikes.map((bike) => (
                    <td key={bike.id} className="p-4 font-semibold text-slate-900">
                      {bike.geometry.stackMm} mm / {bike.geometry.reachMm} mm
                    </td>
                  ))}
                </tr>
                <tr className={getDiffRowClass(hasDifferences((b) => b.geometry.headTubeAngleDeg))}>
                  <th
                    scope="row"
                    className="sticky left-0 bg-white p-4 sm:px-6 font-bold text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10"
                  >
                    Ángulo de Dirección
                  </th>
                  {bikes.map((bike) => (
                    <td key={bike.id} className="p-4 font-semibold text-slate-900">
                      {bike.geometry.headTubeAngleDeg}°
                    </td>
                  ))}
                </tr>
                <tr className={getDiffRowClass(hasDifferences((b) => b.geometry.chainstayLengthMm))}>
                  <th
                    scope="row"
                    className="sticky left-0 bg-white p-4 sm:px-6 font-bold text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10"
                  >
                    Longitud de Vainas
                  </th>
                  {bikes.map((bike) => (
                    <td key={bike.id} className="p-4 font-semibold text-slate-900">
                      {bike.geometry.chainstayLengthMm} mm
                    </td>
                  ))}
                </tr>
              </>
            )}

            {/* SECCIÓN 5: RUEDAS Y FRENOS */}
            <tr className="bg-slate-100/90">
              <td colSpan={bikes.length + 1} className="p-0">
                <button
                  type="button"
                  onClick={() => toggleSection("wheels")}
                  aria-expanded={!collapsedSections.wheels}
                  className="w-full flex items-center justify-between p-3.5 px-4 sm:px-6 text-left font-extrabold text-slate-900 text-xs uppercase tracking-wider hover:bg-slate-200/60 transition-colors cursor-pointer"
                >
                  <h2 className="text-xs font-black uppercase tracking-wider text-slate-900 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-teal-700" />
                    <span>5. Ruedas, Neumáticos y Sistema de Frenos</span>
                  </h2>
                  <ChevronDown
                    className={`w-4 h-4 text-slate-700 transition-transform ${
                      collapsedSections.wheels ? "-rotate-90" : "rotate-0"
                    }`}
                  />
                </button>
              </td>
            </tr>
            {!collapsedSections.wheels && (
              <>
                <tr className={getDiffRowClass(hasDifferences((b) => b.wheels))}>
                  <th
                    scope="row"
                    className="sticky left-0 bg-white p-4 sm:px-6 font-bold text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10"
                  >
                    Ruedas de Serie
                  </th>
                  {bikes.map((bike) => (
                    <td key={bike.id} className="p-4 font-semibold text-slate-900">
                      {bike.wheels || "Ruedas Tubeless Ready"}
                    </td>
                  ))}
                </tr>
                <tr className={getDiffRowClass(hasDifferences((b) => b.tires))}>
                  <th
                    scope="row"
                    className="sticky left-0 bg-white p-4 sm:px-6 font-bold text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10"
                  >
                    Cubiertas de Serie
                  </th>
                  {bikes.map((bike) => (
                    <td key={bike.id} className="p-4 font-semibold text-slate-900">
                      {bike.tires || "Cubiertas Tubeless"}
                    </td>
                  ))}
                </tr>
                <tr className={getDiffRowClass(hasDifferences((b) => b.brakes))}>
                  <th
                    scope="row"
                    className="sticky left-0 bg-white p-4 sm:px-6 font-bold text-slate-800 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10"
                  >
                    Frenos
                  </th>
                  {bikes.map((bike) => (
                    <td key={bike.id} className="p-4 font-semibold text-slate-900">
                      {bike.brakes || "Frenos de disco hidráulicos"}
                    </td>
                  ))}
                </tr>
              </>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
