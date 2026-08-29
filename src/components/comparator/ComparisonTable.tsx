"use client";

import React from "react";
import Link from "next/link";
import { BikeProduct } from "@/lib/schema/bike";
import {
  formatCurrencyEur,
  formatDisciplineName,
  formatMaterialName,
  formatWeight,
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
  ArrowUpRight,
  TrendingUp,
  CircleDot,
  Compass,
  Gauge,
} from "lucide-react";

interface ComparisonTableProps {
  bikes: BikeProduct[];
  onRemoveBike?: (id: string) => void;
  onAddMoreBikes?: () => void;
}

export function ComparisonTable({ bikes, onRemoveBike, onAddMoreBikes }: ComparisonTableProps) {
  if (bikes.length === 0) {
    return (
      <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
        <Compass className="mx-auto h-12 w-12 text-teal-600 mb-4" />
        <h3 className="text-xl font-bold text-slate-900 mb-2">No hay bicicletas seleccionadas</h3>
        <p className="text-sm text-slate-500 max-w-md mx-auto mb-6">
          Explora nuestro catálogo y pulsa el botón &quot;Comparar&quot; en hasta 4 modelos para ver sus especificaciones técnicas frente a frente.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-5 py-2.5 text-sm font-bold text-white shadow-md hover:bg-teal-700 transition-colors"
        >
          Ir al Catálogo de Bicicletas
        </Link>
      </div>
    );
  }

  // Identificar ganadores en métricas clave
  const minPrice = Math.min(...bikes.map((b) => b.currentPriceEur));
  const validWeights = bikes.map((b) => b.weightKg).filter((w): w is number => typeof w === "number");
  const minWeight = validWeights.length > 0 ? Math.min(...validWeights) : null;
  const maxClearance = Math.max(...bikes.map((b) => b.maxTireClearanceMm));
  const bestClimbingRatio = Math.min(...bikes.map((b) => b.groupset.minGearRatio));

  return (
    <div className="w-full space-y-8">
      {/* Resumen de medallas técnicas */}
      {bikes.length > 1 && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {/* Mejor Precio */}
          <div className="rounded-2xl bg-emerald-50/80 border border-emerald-200 p-3.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-emerald-600" />
              Más Económica
            </span>
            <p className="text-sm font-bold text-emerald-950 mt-1">
              {bikes.find((b) => b.currentPriceEur === minPrice)?.brand}{" "}
              {bikes.find((b) => b.currentPriceEur === minPrice)?.model}
            </p>
            <span className="text-xs text-emerald-700 font-extrabold">
              {formatCurrencyEur(minPrice)}
            </span>
          </div>

          {/* Más Ligera */}
          {minWeight && (
            <div className="rounded-2xl bg-sky-50/80 border border-sky-200 p-3.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800 flex items-center gap-1">
                <Trophy className="w-3.5 h-3.5 text-sky-600" />
                Más Ligera
              </span>
              <p className="text-sm font-bold text-sky-950 mt-1">
                {bikes.find((b) => b.weightKg === minWeight)?.brand}{" "}
                {bikes.find((b) => b.weightKg === minWeight)?.model}
              </p>
              <span className="text-xs text-sky-700 font-extrabold">{minWeight} kg</span>
            </div>
          )}

          {/* Mayor Paso de Rueda */}
          <div className="rounded-2xl bg-amber-50/80 border border-amber-200 p-3.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-amber-600" />
              Mayor Paso Rueda
            </span>
            <p className="text-sm font-bold text-amber-950 mt-1">
              {bikes.find((b) => b.maxTireClearanceMm === maxClearance)?.brand}{" "}
              {bikes.find((b) => b.maxTireClearanceMm === maxClearance)?.model}
            </p>
            <span className="text-xs text-amber-700 font-extrabold">{maxClearance} mm</span>
          </div>

          {/* Mejor Ratio de Subida */}
          <div className="rounded-2xl bg-teal-50/80 border border-teal-200 p-3.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-teal-800 flex items-center gap-1">
              <Trophy className="w-3.5 h-3.5 text-teal-600" />
              Mejor Escaladora
            </span>
            <p className="text-sm font-bold text-teal-950 mt-1">
              {bikes.find((b) => b.groupset.minGearRatio === bestClimbingRatio)?.brand}{" "}
              {bikes.find((b) => b.groupset.minGearRatio === bestClimbingRatio)?.model}
            </p>
            <span className="text-xs text-teal-700 font-extrabold">
              Ratio {bestClimbingRatio.toFixed(2)}
            </span>
          </div>
        </div>
      )}

      {/* Tabla Desplazable Horizontalmente */}
      <div className="overflow-x-auto rounded-3xl border border-slate-200 bg-white shadow-xs">
        <table className="w-full border-collapse text-left">
          {/* Header Row: Bicicletas y Enlaces Oficiales */}
          <thead>
            <tr className="border-b border-slate-200 bg-slate-50/70">
              <th className="sticky left-0 bg-slate-50 p-4 sm:p-6 w-48 sm:w-64 min-w-[180px] align-bottom shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-20">
                <span className="text-xs font-black uppercase tracking-wider text-slate-500 block mb-1">
                  Especificación
                </span>
                <span className="text-base sm:text-lg font-bold text-slate-900">
                  Comparativa ({bikes.length} modelos)
                </span>
              </th>
              {bikes.map((bike) => (
                <th
                  key={bike.id}
                  className="p-4 sm:p-6 min-w-[240px] max-w-[280px] align-top relative group"
                >
                  {/* Botón quitar sólo si se proporciona onRemoveBike */}
                  {onRemoveBike && (
                    <button
                      onClick={() => onRemoveBike(bike.id)}
                      className="absolute top-3 right-3 p-1.5 rounded-full bg-slate-200/80 text-slate-600 hover:bg-rose-100 hover:text-rose-700 transition-colors"
                      title="Quitar modelo"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}

                  {/* Imagen */}
                  <div className="aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100 mb-3 shadow-2xs">
                    <img
                      src={bike.officialImageUrl}
                      alt={`Bicicleta ${bike.brand} ${bike.model} (${bike.year})`}
                      className="h-full w-full object-cover"
                    />
                  </div>

                  {/* Nombre y Marca */}
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                    {bike.brand}
                  </span>
                  <h4 className="text-sm sm:text-base font-bold text-slate-900 line-clamp-2 mb-2">
                    <Link href={`/bici/${bike.id}`} className="hover:text-teal-600 hover:underline">
                      {bike.model}
                    </Link>
                  </h4>

                  {/* Precios */}
                  <div className="mb-4">
                    <span className="text-lg font-black text-slate-900 block">
                      {formatCurrencyEur(bike.currentPriceEur)}
                    </span>
                    {bike.msrpEur > bike.currentPriceEur && (
                      <span className="text-xs text-slate-400 line-through">
                        {formatCurrencyEur(bike.msrpEur)}
                      </span>
                    )}
                  </div>

                  {/* CTA Oficial */}
                  <a
                    href={sanitizeExternalUrl(bike.officialUrl)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full inline-flex items-center justify-center gap-1.5 rounded-xl bg-slate-900 py-2 px-3 text-xs font-bold text-white hover:bg-teal-700 transition-colors shadow-xs"
                  >
                    <span>Ficha Oficial {bike.brand}</span>
                    <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                  </a>
                </th>
              ))}
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 text-xs sm:text-sm">
            {/* SECCIÓN: DATOS BÁSICOS */}
            <tr className="bg-slate-100/60">
              <td
                colSpan={bikes.length + 1}
                className="sticky left-0 bg-slate-100 p-3 px-4 sm:px-6 font-bold text-slate-800 text-xs uppercase tracking-wider"
              >
                Información General y Disciplina
              </td>
            </tr>
            <tr>
              <td className="sticky left-0 bg-white p-4 sm:px-6 font-semibold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">Disciplina</td>
              {bikes.map((bike) => (
                <td key={bike.id} className="p-4">
                  <span className="font-semibold text-slate-900">
                    {formatDisciplineName(bike.discipline)}
                  </span>
                </td>
              ))}
            </tr>
            <tr>
              <td className="sticky left-0 bg-white p-4 sm:px-6 font-semibold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">Año de Temporada</td>
              {bikes.map((bike) => (
                <td key={bike.id} className="p-4 font-semibold text-slate-900">
                  {bike.year}
                </td>
              ))}
            </tr>

            {/* SECCIÓN: CUADRO, PESO Y PASO DE RUEDA */}
            <tr className="bg-slate-100/60">
              <td
                colSpan={bikes.length + 1}
                className="sticky left-0 bg-slate-100 p-3 px-4 sm:px-6 font-bold text-slate-800 text-xs uppercase tracking-wider"
              >
                Cuadro, Peso y Paso de Rueda
              </td>
            </tr>
            <tr>
              <td className="sticky left-0 bg-white p-4 sm:px-6 font-semibold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">
                Paso de Rueda Máximo (Clearance)
              </td>
              {bikes.map((bike) => (
                <td
                  key={bike.id}
                  className={`p-4 ${
                    bike.maxTireClearanceMm === maxClearance ? "bg-amber-50/60 font-bold" : ""
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <CircleDot className="w-4 h-4 text-teal-600" />
                    <span className="text-sm font-extrabold text-slate-900">
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
            <tr>
              <td className="sticky left-0 bg-white p-4 sm:px-6 font-semibold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">Peso Oficial Declarado</td>
              {bikes.map((bike) => (
                <td
                  key={bike.id}
                  className={`p-4 ${
                    minWeight && bike.weightKg === minWeight ? "bg-sky-50/60 font-bold" : ""
                  }`}
                >
                  <div className="flex items-center gap-1.5">
                    <span className="text-sm font-bold text-slate-900">
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
            <tr>
              <td className="sticky left-0 bg-white p-4 sm:px-6 font-semibold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">Material del Cuadro</td>
              {bikes.map((bike) => (
                <td key={bike.id} className="p-4 font-semibold text-slate-900">
                  {formatMaterialName(bike.frameMaterial)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="sticky left-0 bg-white p-4 sm:px-6 font-semibold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">Horquilla</td>
              {bikes.map((bike) => (
                <td key={bike.id} className="p-4 font-semibold text-slate-900">
                  {formatMaterialName(bike.forkMaterial)}
                </td>
              ))}
            </tr>
            <tr>
              <td className="sticky left-0 bg-white p-4 sm:px-6 font-semibold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">Cockpit / Cableado Interno</td>
              {bikes.map((bike) => (
                <td key={bike.id} className="p-4">
                  {bike.integratedCockpit ? (
                    <span className="inline-flex items-center gap-1 text-emerald-800 font-bold">
                      <Check className="w-4 h-4" /> 100% Integrado
                    </span>
                  ) : (
                    <span className="text-slate-600 font-medium">Semi-integrado</span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="sticky left-0 bg-white p-4 sm:px-6 font-semibold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">Roscas Bikepacking</td>
              {bikes.map((bike) => (
                <td key={bike.id} className="p-4">
                  {bike.bikepackingMounts ? (
                    <span className="inline-flex items-center gap-1 text-teal-800 font-bold">
                      <Check className="w-4 h-4" /> Cuadro + Horquilla
                    </span>
                  ) : (
                    <span className="text-slate-500 font-medium flex items-center gap-1">
                      <Minus className="w-4 h-4" /> Estándar
                    </span>
                  )}
                </td>
              ))}
            </tr>

            {/* SECCIÓN: TRANSMISIÓN Y DESARROLLOS */}
            <tr className="bg-slate-100/60">
              <td
                colSpan={bikes.length + 1}
                className="sticky left-0 bg-slate-100 p-3 px-4 sm:px-6 font-bold text-slate-800 text-xs uppercase tracking-wider"
              >
                Transmisión y Calculador de Desarrollos
              </td>
            </tr>
            <tr>
              <td className="sticky left-0 bg-white p-4 sm:px-6 font-semibold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">Grupo Completo</td>
              {bikes.map((bike) => (
                <td key={bike.id} className="p-4 font-bold text-slate-900">
                  {bike.groupset.name}
                </td>
              ))}
            </tr>
            <tr>
              <td className="sticky left-0 bg-white p-4 sm:px-6 font-semibold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">Tipo de Cambio</td>
              {bikes.map((bike) => (
                <td key={bike.id} className="p-4">
                  {bike.groupset.isElectronic ? (
                    <span className="inline-flex items-center gap-1 text-teal-900 font-bold bg-teal-50 px-2 py-0.5 rounded-lg border border-teal-200">
                      <Zap className="w-3.5 h-3.5 text-teal-600" /> Electrónico Di2/AXS
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1 text-slate-800 font-semibold bg-slate-100 px-2 py-0.5 rounded-lg">
                      <Cog className="w-3.5 h-3.5 text-slate-600" /> Mecánico {bike.groupset.speedCount}v
                    </span>
                  )}
                </td>
              ))}
            </tr>
            <tr>
              <td className="sticky left-0 bg-white p-4 sm:px-6 font-semibold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">Platos y Cassette</td>
              {bikes.map((bike) => (
                <td key={bike.id} className="p-4 font-medium text-slate-800">
                  {bike.groupset.chainrings} con {bike.groupset.cassette}
                </td>
              ))}
            </tr>
            <tr>
              <td className="sticky left-0 bg-white p-4 sm:px-6 font-semibold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">
                <span className="flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-teal-600" />
                  Ratio Mínimo (Subida)
                </span>
                <span className="text-[11px] text-slate-500 font-normal block">
                  Menor número = mayor facilidad en pendientes duras
                </span>
              </td>
              {bikes.map((bike) => {
                const gear = analyzeGearRatio(
                  bike.groupset.chainrings,
                  bike.groupset.cassette,
                  bike.groupset.minGearRatio,
                  bike.groupset.maxGearRatio
                );
                const isBest = bike.groupset.minGearRatio === bestClimbingRatio;
                return (
                  <td key={bike.id} className={`p-4 ${isBest ? "bg-teal-50/60" : ""}`}>
                    <div className="text-sm font-extrabold text-teal-950">
                      {bike.groupset.minGearRatio.toFixed(2)}
                    </div>
                    <span className="text-[11px] font-semibold text-teal-800 block mt-0.5">
                      {gear.climbingBadge.label}
                    </span>
                  </td>
                );
              })}
            </tr>
            <tr>
              <td className="sticky left-0 bg-white p-4 sm:px-6 font-semibold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">
                Ratio Máximo (Llano / Bajada)
                <span className="text-[11px] text-slate-500 font-normal block">
                  Mayor número = mayor velocidad punta
                </span>
              </td>
              {bikes.map((bike) => {
                const gear = analyzeGearRatio(
                  bike.groupset.chainrings,
                  bike.groupset.cassette,
                  bike.groupset.minGearRatio,
                  bike.groupset.maxGearRatio
                );
                return (
                  <td key={bike.id} className="p-4">
                    <div className="text-sm font-bold text-slate-900">
                      {bike.groupset.maxGearRatio.toFixed(2)}
                    </div>
                    <span className="text-[11px] text-slate-600 font-medium">
                      {gear.sprintBadge.label}
                    </span>
                  </td>
                );
              })}
            </tr>

            {/* SECCIÓN: GEOMETRÍA (TALLA M) */}
            <tr className="bg-slate-100/60">
              <td
                colSpan={bikes.length + 1}
                className="sticky left-0 bg-slate-100 p-3 px-4 sm:px-6 font-bold text-slate-800 text-xs uppercase tracking-wider"
              >
                Geometría Oficial Talla M (Postura & Manejo)
              </td>
            </tr>
            <tr>
              <td className="sticky left-0 bg-white p-4 sm:px-6 font-semibold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">
                Ratio Stack / Reach
                <span className="text-[11px] text-slate-500 font-normal block">
                  &gt;1.50 = Confort · &lt;1.45 = Racing
                </span>
              </td>
              {bikes.map((bike) => {
                const posture = analyzePosture(bike.geometry.stackReachRatio);
                return (
                  <td key={bike.id} className="p-4">
                    <span className="text-sm font-black text-slate-900">
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
            <tr>
              <td className="sticky left-0 bg-white p-4 sm:px-6 font-semibold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">Stack / Reach</td>
              {bikes.map((bike) => (
                <td key={bike.id} className="p-4 font-medium text-slate-800">
                  {bike.geometry.stackMm} mm / {bike.geometry.reachMm} mm
                </td>
              ))}
            </tr>
            <tr>
              <td className="sticky left-0 bg-white p-4 sm:px-6 font-semibold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">Ángulo de Dirección</td>
              {bikes.map((bike) => (
                <td key={bike.id} className="p-4 font-medium text-slate-800">
                  {bike.geometry.headTubeAngleDeg}°
                </td>
              ))}
            </tr>
            <tr>
              <td className="sticky left-0 bg-white p-4 sm:px-6 font-semibold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">Longitud de Vainas</td>
              {bikes.map((bike) => (
                <td key={bike.id} className="p-4 font-medium text-slate-800">
                  {bike.geometry.chainstayLengthMm} mm
                </td>
              ))}
            </tr>

            {/* SECCIÓN: COMPONENTES */}
            <tr className="bg-slate-100/60">
              <td
                colSpan={bikes.length + 1}
                className="sticky left-0 bg-slate-100 p-3 px-4 sm:px-6 font-bold text-slate-800 text-xs uppercase tracking-wider"
              >
                Ruedas, Neumáticos y Frenos
              </td>
            </tr>
            <tr>
              <td className="sticky left-0 bg-white p-4 sm:px-6 font-semibold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">Ruedas de Serie</td>
              {bikes.map((bike) => (
                <td key={bike.id} className="p-4 font-medium text-slate-800">
                  {bike.wheels || "N/D"}
                </td>
              ))}
            </tr>
            <tr>
              <td className="sticky left-0 bg-white p-4 sm:px-6 font-semibold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">Cubiertas de Serie</td>
              {bikes.map((bike) => (
                <td key={bike.id} className="p-4 font-medium text-slate-800">
                  {bike.tires || "N/D"}
                </td>
              ))}
            </tr>
            <tr>
              <td className="sticky left-0 bg-white p-4 sm:px-6 font-semibold text-slate-700 shadow-[2px_0_5px_-2px_rgba(0,0,0,0.05)] z-10">Frenos</td>
              {bikes.map((bike) => (
                <td key={bike.id} className="p-4 font-medium text-slate-800">
                  {bike.brakes || "Frenos de disco hidráulicos"}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}
