"use client";

import React, { createContext, useContext, useState, useEffect, useCallback } from "react";
import { BikeProduct, BikeProductSchema } from "@/lib/schema/bike";
import { z } from "zod";
import { Scale, X } from "lucide-react";

interface ComparisonContextType {
  selectedBikes: BikeProduct[];
  addBike: (bike: BikeProduct) => boolean;
  setComparisonBikes: (bikes: BikeProduct[]) => void;
  removeBike: (bikeId: string) => void;
  toggleBike: (bike: BikeProduct) => void;
  clearAll: () => void;
  isInComparison: (bikeId: string) => boolean;
  maxBikes: number;
  warningMessage: string | null;
  clearWarning: () => void;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);
const MAX_COMPARISON_ITEMS = 4;
const STORAGE_KEY = "comparabici_comparison_v2";

// Esquema de validación para almacenamiento local
const SavedComparisonSchema = z.array(BikeProductSchema).max(MAX_COMPARISON_ITEMS);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [selectedBikes, setSelectedBikes] = useState<BikeProduct[]>([]);
  const [warningMessage, setWarningMessage] = useState<string | null>(null);
  const maxBikes = MAX_COMPARISON_ITEMS;

  // Cargar de localStorage en cliente de forma defensiva y limpiar clave antigua
  useEffect(() => {
    try {
      // Limpiar versiones anteriores para garantizar que el comparador empiece limpio si el usuario lo desea
      localStorage.removeItem("bikefinder_comparison");

      const saved = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("bikefinder_comparison_v2");
      if (saved) {
        const rawJson = JSON.parse(saved);
        const parsed = SavedComparisonSchema.safeParse(rawJson);
        if (parsed.success) {
          setSelectedBikes(parsed.data);
        } else {
          localStorage.removeItem(STORAGE_KEY);
        }
      }
    } catch {
      // Ignorar errores de localStorage en navegación privada/restringida
    }
  }, []);

  // Guardar en localStorage cuando cambie el estado
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(selectedBikes));
    } catch (e) {
      console.warn("No se pudo escribir en localStorage:", e);
    }
  }, [selectedBikes]);

  // Auto-ocultar notificación de aviso a los 3.5 segundos
  useEffect(() => {
    if (warningMessage) {
      const timer = setTimeout(() => {
        setWarningMessage(null);
      }, 3500);
      return () => clearTimeout(timer);
    }
  }, [warningMessage]);

  const clearWarning = useCallback(() => {
    setWarningMessage(null);
  }, []);

  const addBike = useCallback((bike: BikeProduct): boolean => {
    let added = false;
    setSelectedBikes((prev) => {
      if (prev.some((b) => b.id === bike.id)) {
        return prev;
      }
      if (prev.length >= maxBikes) {
        setWarningMessage(`Puedes comparar un máximo de ${maxBikes} bicicletas simultáneamente.`);
        return prev;
      }
      added = true;
      return [...prev, bike];
    });
    return added;
  }, [maxBikes]);

  const setComparisonBikes = useCallback((bikes: BikeProduct[]) => {
    setSelectedBikes(bikes.slice(0, maxBikes));
    setWarningMessage(null);
  }, [maxBikes]);

  const removeBike = useCallback((bikeId: string) => {
    setSelectedBikes((prev) => prev.filter((b) => b.id !== bikeId));
  }, []);

  const toggleBike = useCallback((bike: BikeProduct) => {
    setSelectedBikes((prev) => {
      if (prev.some((b) => b.id === bike.id)) {
        return prev.filter((b) => b.id !== bike.id);
      }
      if (prev.length >= maxBikes) {
        setWarningMessage(`Puedes comparar un máximo de ${maxBikes} bicicletas simultáneamente.`);
        return prev;
      }
      return [...prev, bike];
    });
  }, [maxBikes]);

  const clearAll = useCallback(() => {
    setSelectedBikes([]);
    setWarningMessage(null);
  }, []);

  const isInComparison = useCallback(
    (bikeId: string) => {
      return selectedBikes.some((b) => b.id === bikeId);
    },
    [selectedBikes]
  );

  return (
    <ComparisonContext.Provider
      value={{
        selectedBikes,
        addBike,
        setComparisonBikes,
        removeBike,
        toggleBike,
        clearAll,
        isInComparison,
        maxBikes,
        warningMessage,
        clearWarning,
      }}
    >
      {children}

      {/* Notificación Toast no bloqueante en caso de alcanzar el límite */}
      {warningMessage && (
        <aside
          role="alert"
          aria-live="polite"
          className="fixed top-20 right-4 z-50 flex items-center gap-3 rounded-2xl bg-slate-900/95 text-white px-4 py-3 shadow-2xl backdrop-blur-md border border-slate-700 animate-in fade-in slide-in-from-top-3 duration-200"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-teal-500/20 text-teal-400 shrink-0">
            <Scale className="h-4 w-4" />
          </div>
          <p className="text-xs font-semibold">{warningMessage}</p>
          <button
            onClick={clearWarning}
            className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors ml-1"
            title="Cerrar aviso"
          >
            <X className="h-3.5 w-3.5" />
          </button>
        </aside>
      )}
    </ComparisonContext.Provider>
  );
}

export function useComparison() {
  const context = useContext(ComparisonContext);
  if (!context) {
    throw new Error("useComparison debe usarse dentro de un ComparisonProvider");
  }
  return context;
}
