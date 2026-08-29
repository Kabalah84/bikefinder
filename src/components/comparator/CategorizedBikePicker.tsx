"use client";

import React, { useState, useMemo } from "react";
import { BikeProduct, Discipline } from "@/lib/schema/bike";
import { useComparison } from "@/lib/context/ComparisonContext";
import { formatCurrencyEur, formatDisciplineName } from "@/lib/utils/formatters";
import {
  Compass,
  Zap,
  Flame,
  Sparkles,
  Search,
  Check,
  Plus,
  CircleDot,
  Weight,
  Scale,
} from "lucide-react";

interface CategorizedBikePickerProps {
  allBikes: BikeProduct[];
  title?: string;
  subtitle?: string;
}

export function CategorizedBikePicker({
  allBikes,
  title = "Selecciona Bicicletas para Comparar",
  subtitle = "Elige hasta 4 modelos de cualquier disciplina para confrontar sus fichas técnicas frente a frente.",
}: CategorizedBikePickerProps) {
  const { selectedBikes, toggleBike, isInComparison, maxBikes } = useComparison();
  const [activeCategory, setActiveCategory] = useState<Discipline | "all">("all");
  const [searchTerm, setSearchTerm] = useState("");

  const categories: { id: Discipline | "all"; label: string; icon: React.ElementType; color: string }[] = [
    { id: "all", label: "Todas", icon: Scale, color: "text-teal-600" },
    { id: "gravel", label: "Gravel", icon: Compass, color: "text-amber-500" },
    { id: "road_endurance", label: "Gran Fondo", icon: Zap, color: "text-sky-500" },
    { id: "road_race", label: "Competición & Aero", icon: Flame, color: "text-rose-500" },
    { id: "all_road", label: "All-Road", icon: Sparkles, color: "text-emerald-500" },
  ];

  const filteredBikes = useMemo(() => {
    return allBikes.filter((bike) => {
      const matchCategory = activeCategory === "all" || bike.discipline === activeCategory;
      const matchSearch =
        searchTerm === "" ||
        bike.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bike.model.toLowerCase().includes(searchTerm.toLowerCase()) ||
        bike.groupset.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchCategory && matchSearch;
    });
  }, [allBikes, activeCategory, searchTerm]);

  return (
    <div className="rounded-3xl bg-white p-5 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
        <div>
          <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-2.5 py-0.5 text-xs font-bold text-teal-800 border border-teal-200 mb-1.5">
            <Scale className="w-3.5 h-3.5 text-teal-600" />
            <span>Selector por Categorías</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">{title}</h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">{subtitle}</p>
        </div>

        {/* Counter Badge */}
        <div className="flex items-center gap-2">
          <span className="rounded-xl bg-slate-100 px-3 py-1.5 text-xs font-bold text-slate-700 border border-slate-200">
            Comparando:{" "}
            <span className="text-teal-700 font-extrabold">
              {selectedBikes.length}/{maxBikes}
            </span>
          </span>
        </div>
      </div>

      {/* Category Tabs & Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        {/* Category Pills */}
        <div className="flex flex-wrap gap-1.5">
          {categories.map((cat) => {
            const isActive = activeCategory === cat.id;
            const Icon = cat.icon;
            const count =
              cat.id === "all"
                ? allBikes.length
                : allBikes.filter((b) => b.discipline === cat.id).length;

            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                type="button"
                className={`flex items-center gap-1.5 rounded-xl px-3 py-2 text-xs font-bold transition-all ${
                  isActive
                    ? "bg-slate-900 text-white shadow-xs"
                    : "bg-slate-50 text-slate-700 hover:bg-slate-100 border border-slate-200"
                }`}
              >
                <Icon className={`w-3.5 h-3.5 ${isActive ? "text-teal-400" : cat.color}`} />
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    isActive ? "bg-slate-800 text-teal-300" : "bg-slate-200 text-slate-600"
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search filter inside picker */}
        <div className="relative min-w-[200px] sm:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar marca o modelo..."
            className="w-full pl-9 pr-3 py-1.5 rounded-xl border border-slate-200 bg-slate-50 text-xs font-medium text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 focus:outline-hidden transition-all"
          />
        </div>
      </div>

      {/* Grid of Selectable Bike Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5">
        {filteredBikes.map((bike) => {
          const selected = isInComparison(bike.id);
          const isMaxReached = selectedBikes.length >= maxBikes && !selected;

          return (
            <div
              key={bike.id}
              onClick={() => {
                if (!isMaxReached) {
                  toggleBike(bike);
                }
              }}
              className={`rounded-2xl border-2 p-3 flex flex-col justify-between transition-all cursor-pointer select-none group relative ${
                selected
                  ? "border-teal-600 bg-teal-50/40 ring-2 ring-teal-500/20 shadow-md"
                  : isMaxReached
                  ? "border-slate-200 bg-slate-50/50 opacity-60 cursor-not-allowed"
                  : "border-slate-200 bg-white hover:border-teal-400 hover:shadow-xs"
              }`}
            >
              {/* Image & Selected Badge */}
              <div>
                <div className="relative aspect-[16/10] w-full overflow-hidden rounded-xl bg-slate-100 mb-2">
                  <img
                    src={bike.officialImageUrl}
                    alt={bike.model}
                    className="h-full w-full object-cover group-hover:scale-103 transition-transform"
                    loading="lazy"
                  />
                  {selected && (
                    <div className="absolute top-2 right-2 flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white shadow-md">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                  <span className="absolute bottom-1.5 left-1.5 rounded-md bg-slate-900/80 backdrop-blur-xs px-2 py-0.5 text-[10px] font-bold text-white">
                    {formatDisciplineName(bike.discipline)}
                  </span>
                </div>

                {/* Brand & Model */}
                <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                  {bike.brand}
                </span>
                <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 mb-0.5 group-hover:text-teal-700 transition-colors">
                  {bike.model}
                </h4>
                <p className="text-[11px] text-slate-600 font-medium line-clamp-1 mb-2">
                  {bike.groupset.name}
                </p>

                {/* Specs Pill Summary */}
                <div className="flex flex-wrap gap-1 text-[10px] font-bold text-slate-600 mb-2.5">
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5 flex items-center gap-0.5">
                    <CircleDot className="w-3 h-3 text-teal-600" />
                    {bike.maxTireClearanceMm} mm
                  </span>
                  {bike.weightKg && (
                    <span className="rounded-md bg-slate-100 px-1.5 py-0.5 flex items-center gap-0.5">
                      <Weight className="w-3 h-3 text-slate-500" />
                      {bike.weightKg} kg
                    </span>
                  )}
                  <span className="rounded-md bg-slate-100 px-1.5 py-0.5">
                    {bike.groupset.isElectronic ? "⚡ Di2/AXS" : "⚙️ Mec"}
                  </span>
                </div>
              </div>

              {/* Price & Action Button */}
              <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <span className="text-sm font-black text-slate-900">
                  {formatCurrencyEur(bike.currentPriceEur)}
                </span>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!isMaxReached) {
                      toggleBike(bike);
                    }
                  }}
                  disabled={isMaxReached}
                  className={`inline-flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-bold transition-all ${
                    selected
                      ? "bg-teal-600 text-white shadow-xs"
                      : isMaxReached
                      ? "bg-slate-200 text-slate-400 cursor-not-allowed"
                      : "bg-slate-100 text-slate-800 hover:bg-teal-600 hover:text-white"
                  }`}
                >
                  {selected ? (
                    <>
                      <Check className="w-3 h-3" />
                      <span>Añadida</span>
                    </>
                  ) : (
                    <>
                      <Plus className="w-3 h-3" />
                      <span>Añadir</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
