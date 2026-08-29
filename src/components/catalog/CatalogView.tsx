"use client";

import React, { useState, useMemo } from "react";
import { BikeProduct, Discipline } from "@/lib/schema/bike";
import { BikeFilterCriteria, filterBikes } from "@/lib/data/bikes";
import { BikeCard } from "./BikeCard";
import { FilterSidebar } from "./FilterSidebar";
import { AdBanner } from "../layout/AdBanner";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Compass,
  Zap,
  Sparkles,
  RefreshCw,
} from "lucide-react";

interface CatalogViewProps {
  initialBikes: BikeProduct[];
  brands: string[];
  initialDiscipline?: Discipline;
}

export function CatalogView({ initialBikes, brands, initialDiscipline }: CatalogViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<BikeFilterCriteria>({
    disciplines: initialDiscipline ? [initialDiscipline] : [],
    sortBy: "price_asc",
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);

  // Filtrado reactivo en cliente para respuesta instantánea
  const filteredBikes = useMemo(() => {
    return filterBikes(initialBikes, {
      ...filters,
      searchTerm,
    });
  }, [initialBikes, filters, searchTerm]);

  const handleResetFilters = () => {
    setSearchTerm("");
    setFilters({
      sortBy: "price_asc",
    });
  };

  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (filters.disciplines && filters.disciplines.length > 0) count += filters.disciplines.length;
    if (filters.brands && filters.brands.length > 0) count += filters.brands.length;
    if (filters.frameMaterials && filters.frameMaterials.length > 0) count += filters.frameMaterials.length;
    if (filters.isElectronic !== undefined && filters.isElectronic !== null) count += 1;
    if (filters.isOneBy !== undefined && filters.isOneBy !== null) count += 1;
    if (filters.minTireClearanceMm) count += 1;
    if (filters.maxPriceEur) count += 1;
    if (filters.onlyOutlets) count += 1;
    if (filters.bikepackingMounts) count += 1;
    if (searchTerm) count += 1;
    return count;
  }, [filters, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Top Search & Filter Bar */}
      <div className="rounded-2xl bg-white p-4 sm:p-5 border border-slate-200 shadow-xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por modelo, marca, grupo (ej. Grizl, Shimano GRX, Rival AXS)..."
              className="w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-teal-500 focus:outline-hidden transition-all"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Controls: Mobile filter trigger & Sort */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            <button
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              className="md:hidden flex-1 inline-flex items-center justify-center gap-2 rounded-xl bg-slate-100 px-4 py-2.5 text-xs font-bold text-slate-700 hover:bg-slate-200"
            >
              <SlidersHorizontal className="w-4 h-4 text-teal-600" />
              <span>Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-1.5 shrink-0">
              <ArrowUpDown className="w-4 h-4 text-slate-400 hidden sm:inline" />
              <select
                value={filters.sortBy || "price_asc"}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sortBy: e.target.value as any,
                  })
                }
                className="rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-800 focus:border-teal-500 focus:outline-hidden"
              >
                <option value="price_asc">Precio: Menor a Mayor</option>
                <option value="price_desc">Precio: Mayor a Menor</option>
                <option value="weight_asc">Peso: Más ligera primero</option>
                <option value="clearance_desc">Paso Rueda: Mayor a menor</option>
                <option value="discount_desc">Mayor descuento %</option>
                <option value="name_asc">Nombre A-Z</option>
              </select>
            </div>
          </div>
        </div>

        {/* Active Filter Tags */}
        {activeFiltersCount > 0 && (
          <div className="flex flex-wrap items-center gap-1.5 pt-3 mt-3 border-t border-slate-100">
            <span className="text-[11px] font-bold text-slate-400 mr-1">Filtros activos:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-800 border border-teal-200">
                Texto: &quot;{searchTerm}&quot;
                <button onClick={() => setSearchTerm("")}>
                  <X className="w-3 h-3 hover:text-teal-900" />
                </button>
              </span>
            )}
            {filters.disciplines?.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800"
              >
                {d}
                <button
                  onClick={() =>
                    setFilters({
                      ...filters,
                      disciplines: filters.disciplines?.filter((x) => x !== d),
                    })
                  }
                >
                  <X className="w-3 h-3 hover:text-rose-600" />
                </button>
              </span>
            ))}
            {filters.brands?.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-0.5 text-xs font-semibold text-slate-800"
              >
                {b}
                <button
                  onClick={() =>
                    setFilters({
                      ...filters,
                      brands: filters.brands?.filter((x) => x !== b),
                    })
                  }
                >
                  <X className="w-3 h-3 hover:text-rose-600" />
                </button>
              </span>
            ))}
            {filters.isElectronic !== undefined && filters.isElectronic !== null && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-800 border border-teal-200">
                {filters.isElectronic ? "Electrónico Di2/AXS" : "Mecánico"}
                <button onClick={() => setFilters({ ...filters, isElectronic: null })}>
                  <X className="w-3 h-3 hover:text-teal-900" />
                </button>
              </span>
            )}
            {filters.minTireClearanceMm && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 border border-amber-200">
                Paso ≥ {filters.minTireClearanceMm}mm
                <button onClick={() => setFilters({ ...filters, minTireClearanceMm: undefined })}>
                  <X className="w-3 h-3 hover:text-amber-900" />
                </button>
              </span>
            )}
            <button
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-rose-600 hover:underline ml-auto"
            >
              Borrar todos
            </button>
          </div>
        )}
      </div>

      {/* Main Layout: Sidebar + Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 items-start">
        {/* Desktop Filter Sidebar */}
        <div className="hidden md:block md:col-span-1 sticky top-20">
          <FilterSidebar
            filters={filters}
            onFilterChange={setFilters}
            onReset={handleResetFilters}
            totalBikesCount={initialBikes.length}
            filteredBikesCount={filteredBikes.length}
            availableBrands={brands}
          />
        </div>

        {/* Mobile Filter Drawer (toggleable) */}
        {mobileFilterOpen && (
          <div className="md:hidden col-span-1 mb-4">
            <FilterSidebar
              filters={filters}
              onFilterChange={(newF) => {
                setFilters(newF);
              }}
              onReset={handleResetFilters}
              totalBikesCount={initialBikes.length}
              filteredBikesCount={filteredBikes.length}
              availableBrands={brands}
            />
          </div>
        )}

        {/* Product Cards Grid */}
        <div className="col-span-1 md:col-span-3 space-y-6">
          {filteredBikes.length === 0 ? (
            <div className="rounded-3xl border border-slate-200 bg-white p-12 text-center shadow-xs">
              <Compass className="mx-auto h-12 w-12 text-slate-400 mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                No se encontraron bicicletas con estos filtros
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 max-w-sm mx-auto mb-4">
                Prueba a relajar los requisitos de precio, peso o paso de rueda para ver más opciones disponibles.
              </p>
              <button
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-600 px-4 py-2 text-xs font-bold text-white hover:bg-teal-700 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restablecer Filtros</span>
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredBikes.map((bike, index) => (
                <React.Fragment key={bike.id}>
                  <BikeCard bike={bike} />
                  {/* Insert sponsored showcase card every 6 bikes */}
                  {index === 5 && (
                    <AdBanner
                      slotType="in_feed"
                      title="Novedades Gravel & All-Road 2025"
                      ctaUrl="https://www.orbea.com/es-es/bicicletas/carretera/terra/cat/terra-m20team-2025"
                    />
                  )}
                </React.Fragment>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
