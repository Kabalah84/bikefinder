"use client";

import React, { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import { BikeProduct, Discipline } from "@/lib/schema/bike";
import { BikeFilterCriteria, filterBikes } from "@/lib/data/bikes";
import { formatDisciplineName, formatMaterialName } from "@/lib/utils/formatters";
import {
  sanitizeSearchInput,
  validateBrandParam,
  validateDisciplineParam,
} from "@/lib/utils/security";
import { BikeCard } from "./BikeCard";
import { FilterSidebar } from "./FilterSidebar";
import {
  Search,
  SlidersHorizontal,
  ArrowUpDown,
  X,
  Compass,
  RefreshCw,
  ArrowUp,
  ChevronDown,
} from "lucide-react";

const PAGE_SIZE = 24;

interface CatalogViewProps {
  initialBikes: BikeProduct[];
  brands: string[];
  initialDiscipline?: Discipline;
  initialBrand?: string;
}

export function CatalogView({ initialBikes, brands, initialDiscipline, initialBrand }: CatalogViewProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filters, setFilters] = useState<BikeFilterCriteria>({
    disciplines: initialDiscipline ? [initialDiscipline] : [],
    brands: initialBrand ? [initialBrand] : [],
    sortBy: "price_asc",
  });
  const [mobileFilterOpen, setMobileFilterOpen] = useState(false);
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [showScrollTop, setShowScrollTop] = useState(false);
  const searchParams = useSearchParams();
  const rawQueryDiscipline = searchParams?.get("discipline");
  const rawQueryBrand = searchParams?.get("brand");
  const rawSearchQuery = searchParams?.get("q");

  // Sincronizar disciplina, marca y búsqueda desde la URL previa validación/sanitización
  useEffect(() => {
    const validDiscipline = validateDisciplineParam(rawQueryDiscipline) || initialDiscipline;
    const validBrand = validateBrandParam(rawQueryBrand, brands) || initialBrand;

    setFilters((prev) => ({
      ...prev,
      disciplines: validDiscipline ? [validDiscipline] : [],
      brands: validBrand ? [validBrand] : [],
    }));

    if (rawSearchQuery) {
      setSearchTerm(sanitizeSearchInput(rawSearchQuery, 80));
    }
  }, [rawQueryDiscipline, rawQueryBrand, rawSearchQuery, initialDiscipline, initialBrand, brands]);

  // Restablecer paginación progresiva cuando cambian los filtros o la búsqueda
  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [filters, searchTerm]);

  // Listener para botón flotante "Volver arriba"
  useEffect(() => {
    const handleScroll = () => {
      setShowScrollTop(window.scrollY > 400);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filtrado reactivo en cliente para respuesta instantánea
  const filteredBikes = useMemo(() => {
    return filterBikes(initialBikes, {
      ...filters,
      searchTerm: sanitizeSearchInput(searchTerm, 80),
    });
  }, [initialBikes, filters, searchTerm]);

  // Lista visible recortada para carga progresiva y alto rendimiento en DOM
  const displayedBikes = useMemo(() => {
    return filteredBikes.slice(0, visibleCount);
  }, [filteredBikes, visibleCount]);

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
    if (filters.suspensionTypes && filters.suspensionTypes.length > 0) count += filters.suspensionTypes.length;
    if (filters.isElectric !== undefined && filters.isElectric !== null) count += 1;
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
      <div className="rounded-3xl bg-white p-4 sm:p-5 border border-slate-200/90 shadow-2xs">
        <div className="flex flex-col md:flex-row items-center gap-3">
          {/* Search Box */}
          <div className="relative w-full flex-1">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" aria-hidden="true" />
            <input
              type="search"
              maxLength={80}
              aria-label="Buscar bicicletas por modelo, marca o grupo de transmisión"
              value={searchTerm}
              onChange={(e) => setSearchTerm(sanitizeSearchInput(e.target.value, 80))}
              placeholder="Buscar por modelo, marca, grupo (ej. Grizl, Shimano GRX, Rival AXS)..."
              className="w-full pl-11 pr-10 py-3 rounded-2xl border border-slate-200 bg-slate-50 text-xs sm:text-sm text-slate-900 placeholder:text-slate-500 focus:bg-white focus:border-teal-600 focus:ring-4 focus:ring-teal-500/15 focus:outline-hidden transition-all"
            />
            {searchTerm && (
              <button
                type="button"
                aria-label="Limpiar búsqueda"
                onClick={() => setSearchTerm("")}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-800 p-1 rounded-md cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Controls: Mobile filter trigger & Sort */}
          <div className="flex items-center gap-2.5 w-full md:w-auto justify-between md:justify-end">
            <button
              type="button"
              onClick={() => setMobileFilterOpen(!mobileFilterOpen)}
              aria-expanded={mobileFilterOpen}
              className="md:hidden flex-1 inline-flex items-center justify-center gap-2 rounded-2xl bg-slate-100 px-4 py-3 text-xs font-bold text-slate-800 hover:bg-slate-200 transition-colors cursor-pointer"
            >
              <SlidersHorizontal className="w-4 h-4 text-teal-700" />
              <span>Filtros {activeFiltersCount > 0 && `(${activeFiltersCount})`}</span>
            </button>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2 shrink-0">
              <ArrowUpDown className="w-4 h-4 text-slate-500 hidden sm:inline" aria-hidden="true" />
              <select
                aria-label="Ordenar catálogo de bicicletas"
                value={filters.sortBy || "price_asc"}
                onChange={(e) =>
                  setFilters({
                    ...filters,
                    sortBy: e.target.value as BikeFilterCriteria["sortBy"],
                  })
                }
                className="rounded-2xl border border-slate-200 bg-slate-50 py-3 px-3.5 text-xs font-bold text-slate-900 focus:border-teal-600 focus:bg-white focus:outline-hidden transition-all cursor-pointer"
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
            <span className="text-[11px] font-bold text-slate-600 mr-1">Filtros activos:</span>
            {searchTerm && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2 py-0.5 text-xs font-semibold text-teal-900 border border-teal-200">
                Texto: &quot;{searchTerm}&quot;
                <button
                  type="button"
                  onClick={() => setSearchTerm("")}
                  aria-label="Quitar búsqueda de texto"
                >
                  <X className="w-3 h-3 hover:text-teal-950" />
                </button>
              </span>
            )}
            {filters.disciplines?.map((d) => (
              <span
                key={d}
                className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-bold text-teal-950 border border-teal-200"
              >
                {formatDisciplineName(d)}
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      disciplines: filters.disciplines?.filter((x) => x !== d),
                    })
                  }
                  aria-label={`Eliminar filtro ${formatDisciplineName(d)}`}
                >
                  <X className="w-3 h-3 text-teal-800 hover:text-rose-700" />
                </button>
              </span>
            ))}
            {filters.brands?.map((b) => (
              <span
                key={b}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-900 border border-slate-200"
              >
                {b}
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      brands: filters.brands?.filter((x) => x !== b),
                    })
                  }
                  aria-label={`Eliminar filtro ${b}`}
                >
                  <X className="w-3 h-3 text-slate-600 hover:text-rose-700" />
                </button>
              </span>
            ))}
            {filters.frameMaterials?.map((m) => (
              <span
                key={m}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-900 border border-slate-200"
              >
                {formatMaterialName(m)}
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      frameMaterials: filters.frameMaterials?.filter((x) => x !== m),
                    })
                  }
                  aria-label={`Eliminar filtro ${formatMaterialName(m)}`}
                >
                  <X className="w-3 h-3 text-slate-600 hover:text-rose-700" />
                </button>
              </span>
            ))}
            {filters.groupsetBrands?.map((g) => (
              <span
                key={g}
                className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-900 uppercase border border-slate-200"
              >
                {g}
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      groupsetBrands: filters.groupsetBrands?.filter((x) => x !== g),
                    })
                  }
                  aria-label={`Eliminar filtro ${g}`}
                >
                  <X className="w-3 h-3 text-slate-600 hover:text-rose-700" />
                </button>
              </span>
            ))}
            {filters.suspensionTypes?.map((s) => (
              <span
                key={s}
                className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-950 border border-teal-200"
              >
                {s === "rigid" ? "Suspensión: Rígida" : s === "hardtail" ? "Suspensión: Delantera" : "Doble Suspensión"}
                <button
                  type="button"
                  onClick={() =>
                    setFilters({
                      ...filters,
                      suspensionTypes: filters.suspensionTypes?.filter((x) => x !== s),
                    })
                  }
                  aria-label={`Eliminar filtro ${s}`}
                >
                  <X className="w-3 h-3 text-teal-800 hover:text-rose-700" />
                </button>
              </span>
            ))}
            {filters.isElectric !== undefined && filters.isElectric !== null && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-950 border border-amber-200">
                {filters.isElectric ? "⚡ E-Bike Eléctrica" : "Convencional (Sin motor)"}
                <button type="button" onClick={() => setFilters({ ...filters, isElectric: null })}>
                  <X className="w-3 h-3 hover:text-rose-700" />
                </button>
              </span>
            )}
            {filters.isElectronic !== undefined && filters.isElectronic !== null && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-teal-50 px-2.5 py-1 text-xs font-semibold text-teal-900 border border-teal-200">
                {filters.isElectronic ? "Electrónico Di2/AXS" : "Mecánico"}
                <button type="button" onClick={() => setFilters({ ...filters, isElectronic: null })}>
                  <X className="w-3 h-3 hover:text-rose-700" />
                </button>
              </span>
            )}
            {filters.isOneBy !== undefined && filters.isOneBy !== null && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-900 border border-slate-200">
                {filters.isOneBy ? "1x Monoplato" : "2x Biplato"}
                <button type="button" onClick={() => setFilters({ ...filters, isOneBy: null })}>
                  <X className="w-3 h-3 hover:text-rose-700" />
                </button>
              </span>
            )}
            {filters.minTireClearanceMm && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-950 border border-amber-200">
                Paso ≥ {filters.minTireClearanceMm}mm
                <button type="button" onClick={() => setFilters({ ...filters, minTireClearanceMm: undefined })}>
                  <X className="w-3 h-3 hover:text-rose-700" />
                </button>
              </span>
            )}
            {filters.maxPriceEur && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-semibold text-slate-900 border border-slate-200">
                ≤ {filters.maxPriceEur.toLocaleString("es-ES")} €
                <button type="button" onClick={() => setFilters({ ...filters, maxPriceEur: undefined })}>
                  <X className="w-3 h-3 hover:text-rose-700" />
                </button>
              </span>
            )}
            {filters.onlyOutlets && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-900 border border-rose-200">
                Sólo Rebajas
                <button type="button" onClick={() => setFilters({ ...filters, onlyOutlets: false })}>
                  <X className="w-3 h-3 hover:text-rose-950" />
                </button>
              </span>
            )}
            {filters.bikepackingMounts && (
              <span className="inline-flex items-center gap-1 rounded-lg bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-950 border border-amber-200">
                Roscas Bikepacking
                <button type="button" onClick={() => setFilters({ ...filters, bikepackingMounts: undefined })}>
                  <X className="w-3 h-3 hover:text-rose-900" />
                </button>
              </span>
            )}
            <button
              type="button"
              onClick={handleResetFilters}
              className="text-[11px] font-bold text-rose-700 hover:underline ml-auto cursor-pointer"
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
              <Compass className="mx-auto h-12 w-12 text-slate-500 mb-3" />
              <h3 className="text-lg font-bold text-slate-900 mb-1">
                No se encontraron bicicletas con estos filtros
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 max-w-sm mx-auto mb-4">
                Prueba a relajar los requisitos de precio, peso o paso de rueda para ver más opciones disponibles.
              </p>
              <button
                type="button"
                onClick={handleResetFilters}
                className="inline-flex items-center gap-1.5 rounded-xl bg-teal-700 px-4 py-2 text-xs font-bold text-white hover:bg-teal-800 transition-colors cursor-pointer"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Restablecer Filtros</span>
              </button>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {displayedBikes.map((bike) => (
                  <BikeCard key={bike.id} bike={bike} />
                ))}
              </div>

              {/* Paginación progresiva / Cargar más */}
              {filteredBikes.length > visibleCount && (
                <div className="flex flex-col items-center justify-center pt-8 pb-4 space-y-4 border-t border-slate-200">
                  <div className="text-xs font-bold text-slate-600">
                    Mostrando <span className="text-slate-900 font-black">{displayedBikes.length}</span> de{" "}
                    <span className="text-slate-900 font-black">{filteredBikes.length}</span> bicicletas
                  </div>
                  <div className="w-full max-w-xs h-2 bg-slate-200 rounded-full overflow-hidden p-0.5">
                    <div
                      className="h-full bg-gradient-to-r from-teal-600 to-emerald-500 rounded-full transition-all duration-300"
                      style={{
                        width: `${Math.min(100, Math.round((displayedBikes.length / filteredBikes.length) * 100))}%`,
                      }}
                    />
                  </div>
                  <div className="flex flex-wrap items-center justify-center gap-3 pt-1">
                    <button
                      type="button"
                      onClick={() =>
                        setVisibleCount((prev) => Math.min(prev + PAGE_SIZE, filteredBikes.length))
                      }
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-2xl bg-slate-950 hover:bg-teal-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-slate-950/10 active:scale-98 transition-all cursor-pointer"
                    >
                      <span>Cargar más (+{Math.min(PAGE_SIZE, filteredBikes.length - visibleCount)})</span>
                      <ChevronDown className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => setVisibleCount(filteredBikes.length)}
                      className="px-5 py-3 rounded-2xl border border-slate-200 bg-white text-slate-800 text-xs sm:text-sm font-bold hover:bg-slate-50 transition-colors cursor-pointer shadow-2xs"
                    >
                      Ver todas ({filteredBikes.length})
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* Botón flotante para volver arriba */}
      {showScrollTop && (
        <button
          type="button"
          onClick={scrollToTop}
          aria-label="Volver arriba"
          className="fixed bottom-6 right-6 z-40 p-3.5 rounded-2xl bg-slate-950/90 text-white shadow-xl backdrop-blur-md hover:bg-teal-700 transition-all active:scale-95 cursor-pointer ring-1 ring-white/10"
        >
          <ArrowUp className="w-5 h-5" />
        </button>
      )}
    </div>
  );
}
