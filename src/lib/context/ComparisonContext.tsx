"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { BikeProduct } from "@/lib/schema/bike";

interface ComparisonContextType {
  selectedBikes: BikeProduct[];
  addBike: (bike: BikeProduct) => boolean;
  removeBike: (bikeId: string) => void;
  toggleBike: (bike: BikeProduct) => void;
  clearAll: () => void;
  isInComparison: (bikeId: string) => boolean;
  maxBikes: number;
}

const ComparisonContext = createContext<ComparisonContextType | undefined>(undefined);

export function ComparisonProvider({ children }: { children: React.ReactNode }) {
  const [selectedBikes, setSelectedBikes] = useState<BikeProduct[]>([]);
  const maxBikes = 4;

  // Cargar de localStorage en cliente
  useEffect(() => {
    try {
      const saved = localStorage.getItem("bikefinder_comparison");
      if (saved) {
        setSelectedBikes(JSON.parse(saved));
      }
    } catch (e) {
      console.warn("No se pudo leer localStorage:", e);
    }
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    try {
      localStorage.setItem("bikefinder_comparison", JSON.stringify(selectedBikes));
    } catch (e) {
      console.warn("No se pudo escribir en localStorage:", e);
    }
  }, [selectedBikes]);

  const addBike = (bike: BikeProduct): boolean => {
    if (selectedBikes.length >= maxBikes) {
      alert(`Puedes comparar un máximo de ${maxBikes} bicicletas simultáneamente.`);
      return false;
    }
    if (selectedBikes.some((b) => b.id === bike.id)) {
      return false;
    }
    setSelectedBikes((prev) => [...prev, bike]);
    return true;
  };

  const removeBike = (bikeId: string) => {
    setSelectedBikes((prev) => prev.filter((b) => b.id !== bikeId));
  };

  const toggleBike = (bike: BikeProduct) => {
    if (selectedBikes.some((b) => b.id === bike.id)) {
      removeBike(bike.id);
    } else {
      addBike(bike);
    }
  };

  const clearAll = () => {
    setSelectedBikes([]);
  };

  const isInComparison = (bikeId: string) => {
    return selectedBikes.some((b) => b.id === bikeId);
  };

  return (
    <ComparisonContext.Provider
      value={{
        selectedBikes,
        addBike,
        removeBike,
        toggleBike,
        clearAll,
        isInComparison,
        maxBikes,
      }}
    >
      {children}
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
