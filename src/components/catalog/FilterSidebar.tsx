"use client";

import React from "react";
import { Discipline, FrameMaterial, GroupsetBrand } from "@/lib/schema/bike";
import { BikeFilterCriteria } from "@/lib/data/bikes";
import {
  RotateCcw,
  Zap,
  Cog,
  SlidersHorizontal,
  CircleDot,
  Euro,
  Weight,
  Layers,
  Sparkles,
  Luggage,
} from "lucide-react";

interface FilterSidebarProps {
  filters: BikeFilterCriteria;
  onFilterChange: (newFilters: BikeFilterCriteria) => void;
  onReset: () => void;
  totalBikesCount: number;
  filteredBikesCount: number;
  availableBrands: string[];
}

export function FilterSidebar({
  filters,
  onFilterChange,
  onReset,
  totalBikesCount,
  filteredBikesCount,
  availableBrands,
}: FilterSidebarProps) {
  const handleDisciplineToggle = (disc: Discipline) => {
    const current = filters.disciplines || [];
    const updated = current.includes(disc)
      ? current.filter((d) => d !== disc)
      : [...current, disc];
    onFilterChange({ ...filters, disciplines: updated });
  };

  const handleBrandToggle = (brand: string) => {
    const current = filters.brands || [];
    const updated = current.includes(brand)
      ? current.filter((b) => b !== brand)
      : [...current, brand];
    onFilterChange({ ...filters, brands: updated });
  };

  const handleMaterialToggle = (mat: FrameMaterial) => {
    const current = filters.frameMaterials || [];
    const updated = current.includes(mat)
      ? current.filter((m) => m !== mat)
      : [...current, mat];
    onFilterChange({ ...filters, frameMaterials: updated });
  };

  const handleGroupsetBrandToggle = (gs: GroupsetBrand) => {
    const current = filters.groupsetBrands || [];
    const updated = current.includes(gs)
      ? current.filter((g) => g !== gs)
      : [...current, gs];
    onFilterChange({ ...filters, groupsetBrands: updated });
  };

  return (
    <aside className="w-full rounded-2xl bg-white p-5 border border-slate-200 shadow-xs space-y-6">
      {/* Header & Reset */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-teal-600" />
          <h2 className="font-bold text-slate-900 text-sm">Filtros Técnicos</h2>
        </div>
        <button
          onClick={onReset}
          className="flex items-center gap-1 text-xs font-semibold text-slate-500 hover:text-teal-600 hover:underline"
        >
          <RotateCcw className="w-3 h-3" />
          Limpiar
        </button>
      </div>

      {/* Disciplina */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
          Disciplina
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: "gravel", label: "Gravel", color: "hover:border-amber-400" },
            { id: "road_endurance", label: "Gran Fondo", color: "hover:border-sky-400" },
            { id: "road_race", label: "Racing & Aero", color: "hover:border-rose-400" },
            { id: "all_road", label: "All-Road", color: "hover:border-emerald-400" },
          ].map((item) => {
            const isSelected = (filters.disciplines || []).includes(item.id as Discipline);
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => handleDisciplineToggle(item.id as Discipline)}
                className={`py-2 px-2.5 rounded-xl text-xs font-semibold text-left border transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : `bg-slate-50 text-slate-700 border-slate-200 ${item.color}`
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Tipo de Cambio (Electrónico vs Mecánico) */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2.5">
          Tipo de Cambio
        </label>
        <div className="grid grid-cols-3 gap-1.5">
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, isElectronic: null })}
            className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center ${
              filters.isElectronic === null || filters.isElectronic === undefined
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            Todos
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, isElectronic: true })}
            className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center flex items-center justify-center gap-1 ${
              filters.isElectronic === true
                ? "bg-teal-600 text-white border-teal-600 shadow-xs"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Zap className="w-3 h-3 text-amber-400" />
            Di2 / AXS
          </button>
          <button
            type="button"
            onClick={() => onFilterChange({ ...filters, isElectronic: false })}
            className={`py-2 px-2 rounded-xl text-xs font-semibold border transition-all text-center flex items-center justify-center gap-1 ${
              filters.isElectronic === false
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            <Cog className="w-3 h-3 text-slate-400" />
            Mecánico
          </button>
        </div>
      </div>

      {/* Paso de Rueda Mínimo */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
            <CircleDot className="w-3.5 h-3.5 text-teal-600" />
            Paso Rueda Mínimo
          </label>
          <span className="text-xs font-black text-teal-700">
            {filters.minTireClearanceMm ? `≥ ${filters.minTireClearanceMm} mm` : "Cualquiera"}
          </span>
        </div>
        <div className="grid grid-cols-4 gap-1">
          {[
            { mm: 0, label: "Todos" },
            { mm: 32, label: "≥ 32mm" },
            { mm: 40, label: "≥ 40mm" },
            { mm: 47, label: "≥ 47mm" },
          ].map((item) => (
            <button
              key={item.mm}
              type="button"
              onClick={() =>
                onFilterChange({
                  ...filters,
                  minTireClearanceMm: item.mm === 0 ? undefined : item.mm,
                })
              }
              className={`py-1.5 px-1 rounded-lg text-xs font-semibold border transition-all ${
                (item.mm === 0 && !filters.minTireClearanceMm) ||
                filters.minTireClearanceMm === item.mm
                  ? "bg-teal-600 text-white border-teal-600"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Precio Máximo */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-xs font-bold uppercase tracking-wider text-slate-700 flex items-center gap-1">
            <Euro className="w-3.5 h-3.5 text-slate-500" />
            Precio Máximo
          </label>
          <span className="text-xs font-black text-slate-900">
            {filters.maxPriceEur ? `Hasta ${filters.maxPriceEur.toLocaleString("es-ES")} €` : "Sin límite"}
          </span>
        </div>
        <input
          type="range"
          min="1500"
          max="10000"
          step="250"
          value={filters.maxPriceEur || 10000}
          onChange={(e) => {
            const val = Number(e.target.value);
            onFilterChange({
              ...filters,
              maxPriceEur: val >= 10000 ? undefined : val,
            });
          }}
          className="w-full accent-teal-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
        />
        <div className="flex justify-between text-[10px] text-slate-600 mt-1">
          <span>1.500 €</span>
          <span>5.000 €</span>
          <span>10.000 €+</span>
        </div>
      </div>

      {/* Material del Cuadro */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2 flex items-center gap-1">
          <Layers className="w-3.5 h-3.5 text-slate-500" />
          Material del Cuadro
        </label>
        <div className="grid grid-cols-2 gap-1.5">
          {[
            { id: "carbon", label: "Carbono" },
            { id: "aluminum", label: "Aluminio" },
            { id: "titanium", label: "Titanio" },
            { id: "steel", label: "Acero" },
          ].map((mat) => {
            const isSelected = (filters.frameMaterials || []).includes(mat.id as FrameMaterial);
            return (
              <button
                key={mat.id}
                type="button"
                onClick={() => handleMaterialToggle(mat.id as FrameMaterial)}
                className={`py-1.5 px-2 rounded-xl text-xs font-semibold text-center border transition-all ${
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {mat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Marcas */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Fabricantes
        </label>
        <div className="flex flex-wrap gap-1.5">
          {availableBrands.map((brand) => {
            const isSelected = (filters.brands || []).includes(brand);
            return (
              <button
                key={brand}
                type="button"
                onClick={() => handleBrandToggle(brand)}
                className={`py-1 px-2.5 rounded-lg text-xs font-semibold border transition-all ${
                  isSelected
                    ? "bg-teal-600 text-white border-teal-600"
                    : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {brand}
              </button>
            );
          })}
        </div>
      </div>

      {/* Transmisión: Monoplato vs Biplato & Marca */}
      <div>
        <label className="block text-xs font-bold uppercase tracking-wider text-slate-700 mb-2">
          Platos & Grupo
        </label>
        <div className="grid grid-cols-2 gap-1.5 mb-2">
          <button
            type="button"
            onClick={() =>
              onFilterChange({
                ...filters,
                isOneBy: filters.isOneBy === true ? null : true,
              })
            }
            className={`py-1.5 px-2 rounded-xl text-xs font-semibold border text-center transition-all ${
              filters.isOneBy === true
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            1x Monoplato
          </button>
          <button
            type="button"
            onClick={() =>
              onFilterChange({
                ...filters,
                isOneBy: filters.isOneBy === false ? null : false,
              })
            }
            className={`py-1.5 px-2 rounded-xl text-xs font-semibold border text-center transition-all ${
              filters.isOneBy === false
                ? "bg-slate-900 text-white border-slate-900"
                : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
            }`}
          >
            2x Biplato
          </button>
        </div>
        <div className="flex gap-1.5">
          {["shimano", "sram"].map((gs) => {
            const isSelected = (filters.groupsetBrands || []).includes(gs as GroupsetBrand);
            return (
              <button
                key={gs}
                type="button"
                onClick={() => handleGroupsetBrandToggle(gs as GroupsetBrand)}
                className={`flex-1 py-1 px-2 rounded-lg text-xs font-semibold uppercase border transition-all ${
                  isSelected
                    ? "bg-slate-800 text-white border-slate-800"
                    : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                }`}
              >
                {gs}
              </button>
            );
          })}
        </div>
      </div>

      {/* Checkboxes de Descuentos y Bikepacking */}
      <div className="space-y-2 pt-2 border-t border-slate-100">
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={!!filters.onlyOutlets}
            onChange={(e) => onFilterChange({ ...filters, onlyOutlets: e.target.checked })}
            className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
          />
          <span className="flex items-center gap-1">
            <Sparkles className="w-3.5 h-3.5 text-rose-500" />
            Sólo Rebajas / Outlet
          </span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
          <input
            type="checkbox"
            checked={!!filters.bikepackingMounts}
            onChange={(e) =>
              onFilterChange({ ...filters, bikepackingMounts: e.target.checked || undefined })
            }
            className="rounded text-teal-600 focus:ring-teal-500 h-4 w-4"
          />
          <span className="flex items-center gap-1">
            <Luggage className="w-3.5 h-3.5 text-amber-600" />
            Roscas Bikepacking
          </span>
        </label>
      </div>

      {/* Resultados counter */}
      <div className="pt-3 border-t border-slate-100 text-center text-xs font-medium text-slate-500">
        Mostrando <span className="font-bold text-slate-900">{filteredBikesCount}</span> de{" "}
        <span className="font-bold text-slate-900">{totalBikesCount}</span> bicicletas
      </div>
    </aside>
  );
}
