"use client";

import React, { Suspense, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { getAllBikes, getBikesByIds } from "@/lib/data/bikes";
import { useComparison } from "@/lib/context/ComparisonContext";
import { ComparisonTable } from "@/components/comparator/ComparisonTable";
import { Scale, Plus, Sparkles, ArrowLeft, RefreshCw } from "lucide-react";
import Link from "next/link";

function ComparadorContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const { selectedBikes, addBike, removeBike, clearAll } = useComparison();
  const allBikes = getAllBikes();

  const idsParam = searchParams.get("ids");

  // Si se pasa query param ids, sincronizar con el contexto
  useEffect(() => {
    if (idsParam) {
      const ids = idsParam.split(",").filter(Boolean);
      const urlBikes = getBikesByIds(ids);
      urlBikes.forEach((b) => addBike(b));
    }
  }, [idsParam]);

  const handleAddBikeFromSelect = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const bikeId = e.target.value;
    if (!bikeId) return;
    const bike = allBikes.find((b) => b.id === bikeId);
    if (bike) {
      addBike(bike);
      e.target.value = "";
    }
  };

  const handleLoadPreset = (ids: string[]) => {
    clearAll();
    const presetBikes = getBikesByIds(ids);
    presetBikes.forEach((b) => addBike(b));
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      {/* Top Breadcrumb & Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <Link
            href="/"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-900 mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Volver al Catálogo
          </Link>
          <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight flex items-center gap-3">
            <Scale className="w-7 h-7 text-teal-600" />
            Comparador Técnico 1v1 y Multivía
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Confrontación milimétrica de pasos de rueda, pesos oficiales, ratios de desarrollo y geometría Stack/Reach.
          </p>
        </div>

        {/* Quick Add Model Dropdown */}
        <div className="flex items-center gap-2">
          {selectedBikes.length < 4 && (
            <div className="flex items-center gap-2">
              <label htmlFor="add-bike-select" className="text-xs font-bold text-slate-600 shrink-0">
                Añadir modelo:
              </label>
              <select
                id="add-bike-select"
                onChange={handleAddBikeFromSelect}
                defaultValue=""
                className="rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-semibold text-slate-800 focus:border-teal-500 focus:outline-hidden shadow-2xs"
              >
                <option value="" disabled>
                  Seleccionar bicicleta...
                </option>
                {allBikes
                  .filter((b) => !selectedBikes.some((sb) => sb.id === b.id))
                  .map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.brand} {b.model} ({b.year}) · {b.currentPriceEur}€
                    </option>
                  ))}
              </select>
            </div>
          )}

          {selectedBikes.length > 0 && (
            <button
              onClick={clearAll}
              className="rounded-xl border border-slate-200 bg-slate-100 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 py-2 px-3 text-xs font-bold text-slate-600 transition-colors"
            >
              Vaciar
            </button>
          )}
        </div>
      </div>

      {/* Preset Comparisons */}
      <div className="rounded-2xl bg-gradient-to-r from-teal-50 via-slate-50 to-emerald-50 p-4 border border-teal-100">
        <div className="flex items-center gap-1.5 text-xs font-bold text-teal-900 mb-2">
          <Sparkles className="w-3.5 h-3.5 text-teal-600" />
          <span>Comparativas Rápidas Recomendadas:</span>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() =>
              handleLoadPreset([
                "canyon-grizl-cf-sl-7-2025",
                "orbea-terra-m20team-2025",
                "trek-checkpoint-sl-6-axs-gen-3-2025",
              ])
            }
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 border border-slate-200 hover:border-teal-400 hover:text-teal-700 shadow-2xs transition-all"
          >
            🚴‍♂️ Duelo Gravel Referencia: Canyon Grizl vs Orbea Terra vs Trek Checkpoint
          </button>
          <button
            onClick={() =>
              handleLoadPreset([
                "canyon-endurace-cf-7-2025",
                "trek-domane-sl-6-gen-4-2025",
                "specialized-roubaix-sl8-expert-2025",
              ])
            }
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 border border-slate-200 hover:border-teal-400 hover:text-teal-700 shadow-2xs transition-all"
          >
            ⚡ Batalla Gran Fondo: Endurace vs Domane vs Roubaix
          </button>
          <button
            onClick={() =>
              handleLoadPreset([
                "canyon-ultimate-cf-sl-8-aero-2025",
                "orbea-orca-m30iltd-2025",
                "specialized-tarmac-sl8-pro-2025",
              ])
            }
            className="rounded-lg bg-white px-3 py-1.5 text-xs font-semibold text-slate-800 border border-slate-200 hover:border-teal-400 hover:text-teal-700 shadow-2xs transition-all"
          >
            🏆 Escaladoras y Racing: Ultimate vs Orca OMX vs Tarmac SL8
          </button>
        </div>
      </div>

      {/* Comparison Table View */}
      <ComparisonTable
        bikes={selectedBikes}
        onRemoveBike={removeBike}
      />
    </div>
  );
}

export default function ComparadorPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-7xl px-4 py-16 text-center text-slate-500">
          Cargando comparador técnico...
        </div>
      }
    >
      <ComparadorContent />
    </Suspense>
  );
}
