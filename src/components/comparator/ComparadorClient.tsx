"use client";

import React, { useEffect, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { getAllBikes, getBikesByIds } from "@/lib/data/bikes";
import { useComparison } from "@/lib/context/ComparisonContext";
import { ComparisonTable } from "@/components/comparator/ComparisonTable";
import { CategorizedBikePicker } from "@/components/comparator/CategorizedBikePicker";
import { Discipline } from "@/lib/schema/bike";
import { Scale, Sparkles, ArrowLeft } from "lucide-react";
import Link from "next/link";

export function ComparadorClient() {
  const searchParams = useSearchParams();
  const { selectedBikes, addBike, removeBike, clearAll, maxBikes } = useComparison();
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

  // Agrupar bicicletas disponibles por disciplina para el dropdown
  const availableBikesByDiscipline = useMemo(() => {
    const available = allBikes.filter((b) => !selectedBikes.some((sb) => sb.id === b.id));
    const groups: { discipline: Discipline; label: string; bikes: typeof allBikes }[] = [
      { discipline: "gravel", label: "Gravel", bikes: [] },
      { discipline: "road_endurance", label: "Carretera Gran Fondo", bikes: [] },
      { discipline: "road_race", label: "Carretera Competición & Aero", bikes: [] },
      { discipline: "all_road", label: "All-Road", bikes: [] },
    ];

    available.forEach((bike) => {
      const group = groups.find((g) => g.discipline === bike.discipline);
      if (group) {
        group.bikes.push(bike);
      }
    });

    return groups.filter((g) => g.bikes.length > 0);
  }, [allBikes, selectedBikes]);

  return (
    <div className="space-y-8">
      {/* Top Controls Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Scale className="w-6 h-6 text-teal-600" />
            Tabla Comparativa Oficial
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Confrontación milimétrica de pasos de rueda, pesos oficiales, ratios de desarrollo y geometría Stack/Reach.
          </p>
        </div>

        {/* Quick Add Model Dropdown (Categorized by optgroup) */}
        <div className="flex items-center gap-2">
          {selectedBikes.length < maxBikes && (
            <div className="flex items-center gap-2">
              <label htmlFor="add-bike-select" className="text-xs font-bold text-slate-600 shrink-0">
                Añadir modelo:
              </label>
              <select
                id="add-bike-select"
                onChange={handleAddBikeFromSelect}
                defaultValue=""
                className="rounded-xl border border-slate-300 bg-white py-2 px-3 text-xs font-semibold text-slate-800 focus:border-teal-500 focus:outline-hidden shadow-2xs max-w-[260px] truncate"
              >
                <option value="" disabled>
                  Seleccionar bicicleta...
                </option>
                {availableBikesByDiscipline.map((group) => (
                  <optgroup key={group.discipline} label={`── ${group.label} ──`}>
                    {group.bikes.map((b) => (
                      <option key={b.id} value={b.id}>
                        {b.brand} {b.model} ({b.year}) · {b.currentPriceEur}€
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
          )}

          {selectedBikes.length > 0 && (
            <button
              onClick={clearAll}
              className="rounded-xl border border-slate-200 bg-slate-100 hover:bg-rose-50 hover:border-rose-200 hover:text-rose-700 py-2 px-3 text-xs font-bold text-slate-600 transition-colors"
            >
              Vaciar ({selectedBikes.length})
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

      {/* Comparison View & Categorized Picker */}
      {selectedBikes.length > 0 ? (
        <div className="space-y-8">
          <ComparisonTable
            bikes={selectedBikes}
            onRemoveBike={removeBike}
          />

          {/* Quick Picker to add more bikes if less than 4 */}
          {selectedBikes.length < maxBikes && (
            <CategorizedBikePicker
              allBikes={allBikes}
              title={`Añadir más bicicletas (${selectedBikes.length}/${maxBikes})`}
              subtitle="Haz clic en cualquier modelo para incorporarlo a la tabla comparativa superior."
            />
          )}
        </div>
      ) : (
        /* Empty state: full categorized picker */
        <CategorizedBikePicker
          allBikes={allBikes}
          title="Elige tus Bicicletas para Comparar"
          subtitle="Selecciona hasta 4 bicicletas filtrando por categorías (Gravel, Gran Fondo, Competición, All-Road) para ver su comparativa técnica al instante."
        />
      )}
    </div>
  );
}
