"use client";

import React, { useState } from "react";
import Link from "next/link";
import { BikeProduct } from "@/lib/schema/bike";
import {
  UserPreferences,
  calculateRecommendations,
  RecommendationResult,
} from "@/lib/utils/bike-recommender";
import { useComparison } from "@/lib/context/ComparisonContext";
import { formatCurrencyEur, formatDisciplineName } from "@/lib/utils/formatters";
import {
  Compass,
  Zap,
  Flame,
  Scale,
  Sparkles,
  ArrowRight,
  ArrowLeft,
  RotateCcw,
  Check,
  CheckCircle2,
  ExternalLink,
  ShieldCheck,
  CircleDot,
  Weight,
  Layers,
} from "lucide-react";

interface BikeRecommenderWizardProps {
  allBikes: BikeProduct[];
}

export function BikeRecommenderWizard({ allBikes }: BikeRecommenderWizardProps) {
  const [step, setStep] = useState<number>(1);
  const [preferences, setPreferences] = useState<UserPreferences>({
    terrain: "gravel_adventure",
    budgetMax: 3500,
    shifting: "any",
    priority: "comfort",
  });
  const [results, setResults] = useState<RecommendationResult[] | null>(null);

  const { addBike, isInComparison } = useComparison();

  const handleNextStep = () => {
    if (step < 4) {
      setStep(step + 1);
    } else {
      // Calcular resultados
      const recs = calculateRecommendations(allBikes, preferences);
      setResults(recs);
      setStep(5); // Paso de resultados
    }
  };

  const handlePrevStep = () => {
    if (step > 1) {
      setStep(step - 1);
    }
  };

  const handleReset = () => {
    setStep(1);
    setResults(null);
    setPreferences({
      terrain: "gravel_adventure",
      budgetMax: 3500,
      shifting: "any",
      priority: "comfort",
    });
  };

  return (
    <div className="mx-auto max-w-4xl rounded-3xl bg-white p-6 sm:p-10 border border-slate-200 shadow-lg">
      {/* Progress Header */}
      {step <= 4 && (
        <div className="mb-8 space-y-3">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider">
            <span>Paso {step} de 4</span>
            <span>
              {step === 1 && "Terreno y Rutas"}
              {step === 2 && "Presupuesto Máximo"}
              {step === 3 && "Tecnología de Transmisión"}
              {step === 4 && "Prioridad Clave"}
            </span>
          </div>
          <div className="h-2 w-full rounded-full bg-slate-100 overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-teal-500 to-emerald-500 transition-all duration-300 rounded-full"
              style={{ width: `${(step / 4) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* STEP 1: Terreno y Tipo de Rutas */}
      {step === 1 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ¿Por qué tipo de terreno rodarás principalmente?
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Selecciona el entorno que mejor describa tus salidas habituales.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              {
                id: "gravel_adventure",
                title: "Gravel & Aventura Off-Road",
                desc: "Pistas forestales, grava, senderos y viajes de bikepacking (Paso de rueda 45-50mm+).",
                icon: Compass,
                color: "text-amber-600 bg-amber-50 border-amber-200",
              },
              {
                id: "road_endurance",
                title: "Carretera Gran Fondo / Confort",
                desc: "Rutas de más de 80-100 km, asfalto secundario y marchas cicloturistas sin dolor de espalda.",
                icon: Zap,
                color: "text-sky-600 bg-sky-50 border-sky-200",
              },
              {
                id: "road_race",
                title: "Carretera Competición & Aero",
                desc: "Máxima velocidad, aceleración y aerodinámica para sprints y puertos a ritmo exigente.",
                icon: Flame,
                color: "text-rose-600 bg-rose-50 border-rose-200",
              },
              {
                id: "all_road",
                title: "All-Road Mixto (70% Asfalto / 30% Pistas)",
                desc: "Bicicleta rápida en carretera con capacidad para enlazar pistas de tierra compacta.",
                icon: Sparkles,
                color: "text-emerald-600 bg-emerald-50 border-emerald-200",
              },
            ].map((option) => {
              const isSelected = preferences.terrain === option.id;
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    setPreferences({
                      ...preferences,
                      terrain: option.id as any,
                    })
                  }
                  className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-teal-600 bg-teal-50/40 shadow-md ring-2 ring-teal-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className={`p-2.5 rounded-xl border ${option.color}`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    {isSelected && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{option.title}</h3>
                    <p className="text-xs text-slate-500 mt-1 leading-relaxed">{option.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 2: Presupuesto Máximo */}
      {step === 2 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ¿Cuál es tu presupuesto aproximado?
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Filtraremos opciones con la mejor relación componentes/precio en tu rango.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              {
                budget: 2200,
                title: "Hasta 2.200 €",
                desc: "Aluminio de gama alta o carbono accesible con grupos mecánicos fiables (Shimano GRX / 105).",
              },
              {
                budget: 3800,
                title: "Hasta 3.800 €",
                desc: "Cuadro de carbono de alto rendimiento y opciones con cambio electrónico inalámbrico Di2 o AXS.",
              },
              {
                budget: 5500,
                title: "Hasta 5.500 €",
                desc: "Carbono de competición, ruedas de perfil de carbono y transmisión electrónica de gama media-alta.",
              },
              {
                budget: 10000,
                title: "Sin límite (> 6.000 €)",
                desc: "Montajes WorldTour insignia (Dura-Ace Di2, SRAM Red AXS, carbono de alta densidad y pesos <7.5kg).",
              },
            ].map((option) => {
              const isSelected = preferences.budgetMax === option.budget;
              return (
                <button
                  key={option.budget}
                  type="button"
                  onClick={() => setPreferences({ ...preferences, budgetMax: option.budget })}
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-teal-600 bg-teal-50/40 shadow-md ring-2 ring-teal-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-lg font-black text-slate-900">{option.title}</span>
                    {isSelected && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 leading-relaxed">{option.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 3: Tipo de Transmisión */}
      {step === 3 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ¿Qué tipo de cambio prefieres?
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Electrónico inalámbrico vs mecánico tradicional.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3.5">
            {[
              {
                id: "electronic",
                title: "Electrónico (Di2 / AXS)",
                desc: "Cambios instantáneos y sin cables con un solo toque de botón.",
                icon: Zap,
              },
              {
                id: "mechanical",
                title: "Mecánico Tradicional",
                desc: "Mantenimiento económico, cables reemplazables y sin necesidad de cargar baterías.",
                icon: Layers,
              },
              {
                id: "any",
                title: "Me es Indiferente",
                desc: "Muéstrame la mejor opción global dentro de mi presupuesto.",
                icon: Sparkles,
              },
            ].map((option) => {
              const isSelected = preferences.shifting === option.id;
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    setPreferences({
                      ...preferences,
                      shifting: option.id as any,
                    })
                  }
                  className={`p-5 rounded-2xl border-2 text-left transition-all flex flex-col justify-between ${
                    isSelected
                      ? "border-teal-600 bg-teal-50/40 shadow-md ring-2 ring-teal-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-slate-100 text-slate-800">
                      <Icon className="w-5 h-5" />
                    </div>
                    {isSelected && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-slate-900 text-base">{option.title}</h3>
                    <p className="text-xs text-slate-500 mt-1">{option.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 4: Prioridad Clave */}
      {step === 4 && (
        <div className="space-y-6 animate-fadeIn">
          <div>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
              ¿Cuál es tu máxima prioridad técnica?
            </h2>
            <p className="text-sm text-slate-500 mt-1">
              Esto nos ayudará a desempatar entre los mejores modelos del catálogo.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {[
              {
                id: "comfort",
                title: "Máximo Confort & Absorción",
                desc: "Postura erguida y sistemas de micro-suspensión (IsoSpeed, Future Shock).",
                icon: ShieldCheck,
              },
              {
                id: "weight",
                title: "Máxima Ligereza Escaladora",
                desc: "Cuadro ultraligero para volar en los puertos de montaña.",
                icon: Weight,
              },
              {
                id: "clearance",
                title: "Gran Paso de Rueda (>45mm)",
                desc: "Capacidad para cubiertas anchas de grava y tracción off-road.",
                icon: CircleDot,
              },
              {
                id: "value",
                title: "Mejor Relación Calidad/Precio / Outlet",
                desc: "El mejor equipamiento y componentes por cada euro invertido.",
                icon: Sparkles,
              },
            ].map((option) => {
              const isSelected = preferences.priority === option.id;
              const Icon = option.icon;
              return (
                <button
                  key={option.id}
                  type="button"
                  onClick={() =>
                    setPreferences({
                      ...preferences,
                      priority: option.id as any,
                    })
                  }
                  className={`p-5 rounded-2xl border-2 text-left transition-all ${
                    isSelected
                      ? "border-teal-600 bg-teal-50/40 shadow-md ring-2 ring-teal-500/20"
                      : "border-slate-200 bg-white hover:border-slate-300 hover:bg-slate-50/50"
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-bold text-slate-900 text-base">{option.title}</span>
                    {isSelected && (
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-teal-600 text-white">
                        <Check className="w-4 h-4" />
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-slate-500">{option.desc}</p>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* STEP 5: Resultados de Recomendación */}
      {step === 5 && results && (
        <div className="space-y-8 animate-fadeIn">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
            <div>
              <div className="inline-flex items-center gap-1.5 rounded-full bg-emerald-50 px-3 py-1 text-xs font-bold text-emerald-800 border border-emerald-200 mb-2">
                <Sparkles className="w-3.5 h-3.5 text-emerald-600" />
                <span>Recomendación Personalizada</span>
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                Tus Mejores Bicicletas Recomendadas
              </h2>
            </div>
            <button
              onClick={handleReset}
              className="inline-flex items-center gap-1.5 text-xs font-bold text-slate-600 hover:text-teal-700 bg-slate-100 hover:bg-slate-200 px-3 py-2 rounded-xl transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Repetir Asistente
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {results.map((item, index) => {
              const bike = item.bike;
              const inComp = isInComparison(bike.id);

              return (
                <div
                  key={bike.id}
                  className={`rounded-3xl border-2 p-5 sm:p-6 flex flex-col justify-between transition-all ${
                    index === 0
                      ? "border-teal-500 bg-gradient-to-b from-teal-50/40 via-white to-white shadow-xl ring-2 ring-teal-500/20"
                      : "border-slate-200 bg-white shadow-sm hover:border-slate-300"
                  }`}
                >
                  <div>
                    {/* Header badge & score */}
                    <div className="flex items-center justify-between mb-3">
                      <span
                        className={`rounded-lg px-2.5 py-1 text-xs font-black ${
                          index === 0
                            ? "bg-teal-600 text-white shadow-xs"
                            : "bg-slate-100 text-slate-800"
                        }`}
                      >
                        {item.badge}
                      </span>
                      <div className="text-right">
                        <span className="text-xs font-bold text-slate-500 block text-[10px] uppercase">
                          Afinidad
                        </span>
                        <span className="text-base font-black text-teal-700">
                          {item.score}% Match
                        </span>
                      </div>
                    </div>

                    {/* Image & Model */}
                    <div className="aspect-[16/10] w-full overflow-hidden rounded-2xl bg-slate-100 mb-4">
                      <img
                        src={bike.officialImageUrl}
                        alt={`Bicicleta recomendada ${bike.brand} ${bike.model} (${bike.year})`}
                        className="h-full w-full object-cover"
                      />
                    </div>

                    <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      {bike.brand}
                    </span>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">
                      <Link href={`/bici/${bike.id}`} className="hover:text-teal-600">
                        {bike.model} ({bike.year})
                      </Link>
                    </h3>
                    <p className="text-xs text-slate-600 font-medium mb-3">
                      {bike.groupset.name} · {bike.groupset.chainrings}
                    </p>

                    {/* Spec badges */}
                    <div className="flex flex-wrap gap-1.5 mb-4 text-xs font-semibold">
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-700">
                        Ø {bike.maxTireClearanceMm} mm
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-700">
                        {bike.weightKg ? `${bike.weightKg} kg` : "Peso N/D"}
                      </span>
                      <span className="rounded-md bg-slate-100 px-2 py-0.5 text-slate-700">
                        {bike.groupset.isElectronic ? "⚡ Di2/AXS" : "⚙️ Mecánico"}
                      </span>
                    </div>

                    {/* Why this bike matches */}
                    <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-100 mb-4 space-y-1.5">
                      <span className="text-[11px] font-bold text-slate-700 block uppercase tracking-wider">
                        ¿Por qué encaja contigo?
                      </span>
                      <ul className="space-y-1 text-xs text-slate-600">
                        {item.reasons.map((reason, rIdx) => (
                          <li key={rIdx} className="flex items-start gap-1.5">
                            <CheckCircle2 className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
                            <span>{reason}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-slate-100 space-y-2.5">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xl font-black text-slate-900">
                        {formatCurrencyEur(bike.currentPriceEur)}
                      </span>
                      <span className="text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                        PVP Oficial
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => addBike(bike)}
                        className={`rounded-xl py-2 px-2.5 text-xs font-bold transition-all flex items-center justify-center gap-1.5 ${
                          inComp
                            ? "bg-teal-700 text-white"
                            : "bg-slate-100 text-slate-800 hover:bg-slate-200"
                        }`}
                      >
                        <Scale className="w-3.5 h-3.5" />
                        <span>{inComp ? "En Comparador" : "Comparar"}</span>
                      </button>

                      <a
                        href={bike.officialUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl bg-slate-900 hover:bg-teal-700 py-2 px-2.5 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1 shadow-xs"
                      >
                        <span>Web Oficial</span>
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                      </a>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Footer Navigation Controls (Steps 1-4) */}
      {step <= 4 && (
        <div className="mt-8 flex items-center justify-between pt-6 border-t border-slate-100">
          <button
            type="button"
            onClick={handlePrevStep}
            disabled={step === 1}
            className={`inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-bold transition-colors ${
              step === 1
                ? "text-slate-300 cursor-not-allowed"
                : "text-slate-700 hover:bg-slate-100"
            }`}
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Anterior</span>
          </button>

          <button
            type="button"
            onClick={handleNextStep}
            className="inline-flex items-center gap-2 rounded-xl bg-teal-600 px-6 py-2.5 text-xs sm:text-sm font-bold text-white shadow-md shadow-teal-600/25 hover:bg-teal-700 transition-all"
          >
            <span>{step === 4 ? "Ver Mis Recomendaciones" : "Siguiente"}</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  );
}
