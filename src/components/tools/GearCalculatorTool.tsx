"use client";

import React, { useState, useMemo } from "react";
import { BikeProduct } from "@/lib/schema/bike";
import {
  TIRE_SIZES,
  TRANSMISSION_PRESETS,
  calculateGearMatrix,
  TransmissionPreset,
} from "@/lib/utils/gear-physics";
import {
  TrendingUp,
  Gauge,
  CircleDot,
  RotateCcw,
  Zap,
  Info,
  Bike,
  Sparkles,
  ArrowRight,
  Flame,
  Layers,
} from "lucide-react";

interface GearCalculatorToolProps {
  catalogBikes: BikeProduct[];
}

export function GearCalculatorTool({ catalogBikes }: GearCalculatorToolProps) {
  // Estado de configuración
  const [selectedPresetId, setSelectedPresetId] = useState<string>("grx-2x12");
  const [selectedTireId, setSelectedTireId] = useState<string>("700x45");
  const [targetCadence, setTargetCadence] = useState<number>(85);

  // Transmisión actual
  const [chainrings, setChainrings] = useState<number[]>([48, 31]);
  const [cogs, setCogs] = useState<number[]>([11, 13, 15, 17, 19, 21, 24, 27, 30, 33, 36]);
  const [customChainringText, setCustomChainringText] = useState("48/31");
  const [customCassetteText, setCustomCassetteText] = useState("11, 13, 15, 17, 19, 21, 24, 27, 30, 33, 36");

  const currentTire = useMemo(() => {
    return TIRE_SIZES.find((t) => t.id === selectedTireId) || TIRE_SIZES[4];
  }, [selectedTireId]);

  // Aplicar Preset
  const handleSelectPreset = (preset: TransmissionPreset) => {
    setSelectedPresetId(preset.id);
    setChainrings(preset.chainrings);
    setCogs(preset.cogs);
    setCustomChainringText(preset.chainrings.join("/"));
    setCustomCassetteText(preset.cogs.join(", "));
    setSelectedTireId(preset.defaultTireId);
  };

  // Cargar bicicleta del catálogo
  const handleLoadBike = (bikeId: string) => {
    const bike = catalogBikes.find((b) => b.id === bikeId);
    if (!bike) return;

    // Parsear platos
    const rings = bike.groupset.chainrings
      .replace("T", "")
      .split("/")
      .map((r) => parseInt(r.trim(), 10))
      .filter((n) => !isNaN(n));

    // Parsear cassette aproximado según min/max
    const isOneBy = rings.length === 1;
    let newCogs: number[] = [];
    if (bike.groupset.cassette.includes("10-44")) {
      newCogs = [10, 11, 13, 15, 17, 19, 21, 24, 28, 32, 38, 44];
    } else if (bike.groupset.cassette.includes("10-50")) {
      newCogs = [10, 12, 14, 16, 18, 21, 24, 28, 32, 36, 42, 50];
    } else if (bike.groupset.cassette.includes("11-36")) {
      newCogs = [11, 13, 15, 17, 19, 21, 24, 27, 30, 33, 36];
    } else if (bike.groupset.cassette.includes("11-34")) {
      newCogs = [11, 12, 13, 14, 15, 17, 19, 21, 24, 27, 30, 34];
    } else if (bike.groupset.cassette.includes("11-30")) {
      newCogs = [11, 12, 13, 14, 15, 16, 17, 19, 21, 24, 27, 30];
    } else {
      newCogs = [11, 13, 15, 17, 19, 21, 24, 28, 32, 36];
    }

    setChainrings(rings.length > 0 ? rings : [48, 31]);
    setCogs(newCogs);
    setCustomChainringText(rings.join("/"));
    setCustomCassetteText(newCogs.join(", "));
    setSelectedPresetId("custom");

    // Asignar neumático adecuado
    if (bike.discipline === "gravel") {
      setSelectedTireId(bike.maxTireClearanceMm >= 48 ? "700x50" : "700x45");
    } else if (bike.discipline === "road_race") {
      setSelectedTireId("700x28");
    } else {
      setSelectedTireId("700x32");
    }
  };

  // Matriz de combinaciones
  const matrix = useMemo(() => {
    return calculateGearMatrix(chainrings, cogs, currentTire.circumferenceMeters);
  }, [chainrings, cogs, currentTire]);

  // Cálculos resumen
  const minRatio = useMemo(() => {
    if (matrix.length === 0) return 1;
    return Math.min(...matrix.map((m) => m.ratio));
  }, [matrix]);

  const maxRatio = useMemo(() => {
    if (matrix.length === 0) return 4;
    return Math.max(...matrix.map((m) => m.ratio));
  }, [matrix]);

  const totalRangePercentage = useMemo(() => {
    return Math.round((maxRatio / minRatio) * 100);
  }, [maxRatio, minRatio]);

  // Velocidad mínima y máxima a la cadencia elegida
  const minSpeedAtCadence = useMemo(() => {
    const minComb = matrix.find((m) => m.ratio === minRatio);
    if (!minComb) return 0;
    return Number(((minComb.metersOfDevelopment * targetCadence * 60) / 1000).toFixed(1));
  }, [matrix, minRatio, targetCadence]);

  const maxSpeedAtCadence = useMemo(() => {
    const maxComb = matrix.find((m) => m.ratio === maxRatio);
    if (!maxComb) return 0;
    return Number(((maxComb.metersOfDevelopment * targetCadence * 60) / 1000).toFixed(1));
  }, [matrix, maxRatio, targetCadence]);

  return (
    <div className="space-y-8">
      {/* Controles Superiores: Presets y Carga de Catálogo */}
      <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-100">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-teal-600 block mb-1">
              Configurador Rápido
            </span>
            <h3 className="text-lg font-bold text-slate-900">
              Selecciona una transmisión o carga una bicicleta del catálogo
            </h3>
          </div>

          {/* Selector de modelos del catálogo */}
          <div className="flex items-center gap-2">
            <Bike className="w-4 h-4 text-slate-400" />
            <select
              onChange={(e) => handleLoadBike(e.target.value)}
              defaultValue=""
              className="rounded-xl border border-slate-300 bg-slate-50 py-2 px-3 text-xs font-bold text-slate-800 focus:border-teal-500 focus:outline-hidden"
            >
              <option value="" disabled>
                Cargar bicicleta oficial...
              </option>
              {catalogBikes.map((bike) => (
                <option key={bike.id} value={bike.id}>
                  {bike.brand} {bike.model} ({bike.groupset.chainrings} · {bike.groupset.name})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Presets Estándar */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            Presets de Referencia:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
            {TRANSMISSION_PRESETS.map((preset) => {
              const isSelected = selectedPresetId === preset.id;
              return (
                <button
                  key={preset.id}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`p-3 rounded-2xl border text-left transition-all ${
                    isSelected
                      ? "border-teal-600 bg-teal-50/50 shadow-xs ring-1 ring-teal-500"
                      : "border-slate-200 bg-slate-50 hover:bg-white hover:border-slate-300"
                  }`}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-xs font-extrabold text-slate-900">{preset.name}</span>
                    <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-white border border-slate-200 text-slate-600">
                      {preset.category}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-500 line-clamp-1">{preset.description}</p>
                </button>
              );
            })}
          </div>
        </div>

        {/* Ajustes de Balón de Neumático y Cadencia */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100">
          {/* Neumático */}
          <div>
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5 flex items-center gap-1">
              <CircleDot className="w-3.5 h-3.5 text-teal-600" />
              Medida de Neumático (Circunferencia)
            </label>
            <select
              value={selectedTireId}
              onChange={(e) => setSelectedTireId(e.target.value)}
              className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2.5 px-3 text-xs font-semibold text-slate-800 focus:border-teal-500 focus:outline-hidden"
            >
              {TIRE_SIZES.map((tire) => (
                <option key={tire.id} value={tire.id}>
                  {tire.name} — {tire.circumferenceMeters}m
                </option>
              ))}
            </select>
          </div>

          {/* Slider de Cadencia */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1">
                <Gauge className="w-3.5 h-3.5 text-teal-600" />
                Cadencia Objetivo
              </label>
              <span className="text-xs font-black text-teal-700">{targetCadence} RPM</span>
            </div>
            <input
              type="range"
              min="60"
              max="110"
              step="5"
              value={targetCadence}
              onChange={(e) => setTargetCadence(Number(e.target.value))}
              className="w-full accent-teal-600 h-2 bg-slate-200 rounded-lg cursor-pointer"
            />
            <div className="flex justify-between text-[10px] text-slate-600 font-medium mt-1">
              <span>60 RPM (Fuerza)</span>
              <span>85-90 RPM (Óptima)</span>
              <span>110 RPM (Agilidad)</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tarjetas de Métricas Clave */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Ratio Mínimo (Subida) */}
        <div className="p-5 rounded-3xl bg-teal-50/80 border border-teal-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-teal-900 flex items-center gap-1">
              <TrendingUp className="w-4 h-4 text-teal-600" />
              Desarrollo de Subida (Más Blando)
            </span>
            <span className="text-xs font-bold text-teal-800 bg-teal-200/60 px-2 py-0.5 rounded-md">
              Corona {cogs[cogs.length - 1]}T
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-teal-950">{minRatio.toFixed(2)}</span>
            <span className="text-xs font-bold text-teal-800">Ratio</span>
          </div>
          <p className="text-xs text-teal-800 font-medium">
            Velocidad a {targetCadence} RPM: <strong>{minSpeedAtCadence} km/h</strong> (
            {minRatio <= 0.85
              ? "Apto para paredes >18% y rampas de tierra suelta"
              : minRatio <= 1.0
              ? "Excelente para puertos duros de montaña"
              : "Desarrollo exigente para ciclistas en forma"}
            ).
          </p>
        </div>

        {/* Ratio Máximo (Llano / Sprint) */}
        <div className="p-5 rounded-3xl bg-slate-900 text-white shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-300 flex items-center gap-1">
              <Flame className="w-4 h-4 text-amber-400" />
              Desarrollo de Llano (Más Duro)
            </span>
            <span className="text-xs font-bold text-slate-300 bg-slate-800 px-2 py-0.5 rounded-md">
              Corona {cogs[0]}T
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{maxRatio.toFixed(2)}</span>
            <span className="text-xs font-bold text-slate-400">Ratio</span>
          </div>
          <p className="text-xs text-slate-300 font-medium">
            Velocidad a {targetCadence} RPM: <strong>{maxSpeedAtCadence} km/h</strong> (
            {maxRatio >= 4.5
              ? "Velocidad Pro para sprints y bajadas rápidas"
              : "Ritmo crucero ideal para pistas y pelotón"}
            ).
          </p>
        </div>

        {/* Rango Total */}
        <div className="p-5 rounded-3xl bg-white border border-slate-200 shadow-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-slate-500 flex items-center gap-1">
              <Layers className="w-4 h-4 text-teal-600" />
              Rango de Transmisión
            </span>
            <span className="text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded-md">
              {chainrings.length === 1 ? "1x Monoplato" : "2x Biplato"}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-900">{totalRangePercentage}%</span>
            <span className="text-xs font-bold text-slate-500">Amplitud</span>
          </div>
          <p className="text-xs text-slate-500">
            Diferencia entre la marcha más blanda y la más dura ({minRatio.toFixed(2)} a {maxRatio.toFixed(2)}).
          </p>
        </div>
      </div>

      {/* Matriz Completa de Marchas y Velocidades */}
      <div className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-slate-100">
          <div>
            <h3 className="text-lg font-bold text-slate-900">
              Tabla de Marchas, Metros de Avance y Velocidades a {targetCadence} RPM
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Cada fila muestra la combinación exacta de plato y piñón con sus metros recorridos por pedalada.
            </p>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs sm:text-sm border-collapse">
            <thead>
              <tr className="border-b border-slate-200 text-[11px] font-bold uppercase text-slate-500 bg-slate-50">
                <th className="py-3 px-4">Plato</th>
                <th className="py-3 px-4">Piñón</th>
                <th className="py-3 px-4">Ratio</th>
                <th className="py-3 px-4">Avance / Pedalada</th>
                <th className="py-3 px-4">Velocidad ({targetCadence} RPM)</th>
                <th className="py-3 px-4 min-w-[140px]">Escala Visual</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {matrix.map((item, idx) => {
                const speed = Number(
                  ((item.metersOfDevelopment * targetCadence * 60) / 1000).toFixed(1)
                );
                const percentOfMax = (speed / maxSpeedAtCadence) * 100;
                const isClimbingGear = item.ratio <= 1.0;

                return (
                  <tr
                    key={idx}
                    className={`hover:bg-slate-50 transition-colors ${
                      isClimbingGear ? "bg-teal-50/20" : ""
                    }`}
                  >
                    <td className="py-2.5 px-4 font-bold text-slate-900">{item.chainring}T</td>
                    <td className="py-2.5 px-4 font-semibold text-slate-700">{item.cog}T</td>
                    <td className="py-2.5 px-4">
                      <span
                        className={`font-mono font-bold ${
                          isClimbingGear ? "text-teal-700" : "text-slate-900"
                        }`}
                      >
                        {item.ratio.toFixed(2)}
                      </span>
                    </td>
                    <td className="py-2.5 px-4 font-mono text-slate-600">
                      {item.metersOfDevelopment} m
                    </td>
                    <td className="py-2.5 px-4 font-bold text-slate-900">
                      {speed} km/h
                    </td>
                    <td className="py-2.5 px-4">
                      <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
                        <div
                          className={`h-full rounded-full ${
                            isClimbingGear ? "bg-teal-500" : "bg-slate-800"
                          }`}
                          style={{ width: `${Math.min(100, Math.max(10, percentOfMax))}%` }}
                        />
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
