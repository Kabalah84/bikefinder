"use client";

import React, { useState } from "react";
import { GeometrySpec } from "@/lib/schema/bike";
import { Layers, Info } from "lucide-react";

interface BikeGeometryDiagramProps {
  geometry: GeometrySpec;
  discipline: string;
  sizeRef?: string;
}

interface DimensionItem {
  id: string;
  letter: string;
  label: string;
  value: string;
  unit: string;
  description: string;
}

export function BikeGeometryDiagram({
  geometry,
  discipline,
  sizeRef = "M",
}: BikeGeometryDiagramProps) {
  const [activeDimension, setActiveDimension] = useState<string | null>(null);

  const dimensions: DimensionItem[] = [
    {
      id: "stack",
      letter: "I",
      label: "Stack (Altura del puesto)",
      value: `${geometry.stackMm}`,
      unit: "mm",
      description: "Distancia vertical desde el centro del eje de pedalier hasta el centro superior del tubo de dirección.",
    },
    {
      id: "reach",
      letter: "J",
      label: "Reach (Alcance del cuadro)",
      value: `${geometry.reachMm}`,
      unit: "mm",
      description: "Distancia horizontal desde el centro del eje de pedalier hasta el centro superior del tubo de dirección.",
    },
    {
      id: "topTube",
      letter: "C",
      label: "Longitud Tubo Superior Efectivo",
      value: `${geometry.topTubeLengthMm || Math.round(geometry.reachMm * 1.42)}`,
      unit: "mm",
      description: "Longitud horizontal virtual entre la tija de sillín y la dirección.",
    },
    {
      id: "seatTube",
      letter: "B",
      label: "Longitud Tubo de Sillín",
      value: `${geometry.seatTubeLengthMm || 520}`,
      unit: "mm",
      description: "Medida desde el centro del pedalier hasta el extremo superior del tubo de sillín.",
    },
    {
      id: "headTubeLength",
      letter: "D",
      label: "Largo Tubo de Dirección",
      value: `${geometry.headTubeLengthMm || 145}`,
      unit: "mm",
      description: "Altura del tubo frontal donde se aloja la horquilla y potencia.",
    },
    {
      id: "headAngle",
      letter: "E",
      label: "Ángulo del Tubo de Dirección",
      value: `${geometry.headTubeAngleDeg}`,
      unit: "°",
      description: "Inclinación de la horquilla respecto al suelo. Menor ángulo da más estabilidad en bajadas; mayor ángulo da más agilidad.",
    },
    {
      id: "seatAngle",
      letter: "F",
      label: "Ángulo del Tubo de Sillín",
      value: `${geometry.seatTubeAngleDeg || 73.5}`,
      unit: "°",
      description: "Inclinación del tubo de sillín. Determina la posición de la cadera sobre el eje de pedaleo.",
    },
    {
      id: "chainstay",
      letter: "G",
      label: "Longitud de Vainas",
      value: `${geometry.chainstayLengthMm}`,
      unit: "mm",
      description: "Distancia entre el eje de pedalier y el eje de la rueda trasera.",
    },
    {
      id: "wheelbase",
      letter: "H",
      label: "Batalla (Distancia entre ejes)",
      value: `${geometry.wheelbaseMm || 1015}`,
      unit: "mm",
      description: "Distancia total entre los ejes de las ruedas delantera y trasera.",
    },
    {
      id: "bbDrop",
      letter: "L",
      label: "Caída de Pedalier (BB Drop)",
      value: `${geometry.bbDropMm || 70}`,
      unit: "mm",
      description: "Distancia vertical que el eje de pedalier se sitúa por debajo de los ejes de las ruedas.",
    },
  ];

  return (
    <section aria-label="Geometría y dimensiones técnicas" className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-teal-600" />
            <h2 className="text-lg sm:text-xl font-bold text-slate-900">
              Geometría y Dimensiones Técnicas
            </h2>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Plano técnico vectorial oficial y cotas milimétricas normalizadas para la <strong>Talla {sizeRef}</strong>.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold px-3 py-1 bg-teal-50 text-teal-800 border border-teal-200 rounded-full">
            Talla de referencia: {sizeRef}
          </span>
          <span className="text-xs font-bold px-3 py-1 bg-slate-100 text-slate-700 rounded-full">
            Ratio S/R: {geometry.stackReachRatio.toFixed(2)}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
        {/* DIAGRAMA VECTORIAL SVG */}
        <div className="lg:col-span-6 bg-slate-50/70 border border-slate-200 rounded-2xl p-4 sm:p-6 relative flex flex-col items-center justify-center">
          <div className="w-full max-w-[480px] aspect-[4/3] relative">
            <svg
              viewBox="0 0 520 380"
              className="w-full h-full select-none"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              {/* Línea de suelo */}
              <line x1="20" y1="330" x2="500" y2="330" stroke="#cbd5e1" strokeWidth="1.5" strokeDasharray="4 4" />
              
              {/* Eje de ruedas a suelo */}
              <circle cx="90" cy="250" r="75" stroke="#94a3b8" strokeWidth="3" />
              <circle cx="90" cy="250" r="5" fill="#64748b" />
              
              <circle cx="430" cy="250" r="75" stroke="#94a3b8" strokeWidth="3" />
              <circle cx="430" cy="250" r="5" fill="#64748b" />

              {/* Pedalier (BB) */}
              <circle cx="230" cy="270" r="10" stroke="#0d9488" strokeWidth="3" fill="#ffffff" />
              <circle cx="230" cy="270" r="3" fill="#0d9488" />

              {/* Tubo de Dirección (Head Tube) */}
              <line x1="375" y1="120" x2="395" y2="185" stroke="#1e293b" strokeWidth="6" strokeLinecap="round" />

              {/* Horquilla (Fork) */}
              <line x1="395" y1="185" x2="430" y2="250" stroke="#334155" strokeWidth="4.5" strokeLinecap="round" />

              {/* Tubo Superior (Top Tube) */}
              <line x1="205" y1="150" x2="375" y2="120" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />

              {/* Tubo Diagonal (Down Tube) */}
              <line x1="230" y1="270" x2="395" y2="185" stroke="#1e293b" strokeWidth="5.5" strokeLinecap="round" />

              {/* Tubo de Sillín (Seat Tube) */}
              <line x1="230" y1="270" x2="195" y2="110" stroke="#1e293b" strokeWidth="5" strokeLinecap="round" />

              {/* Vainas Inferiores (Chainstays) */}
              <line x1="90" y1="250" x2="230" y2="270" stroke="#334155" strokeWidth="4" strokeLinecap="round" />

              {/* Tirantes Superiores (Seatstays) */}
              <line x1="90" y1="250" x2="205" y2="150" stroke="#334155" strokeWidth="3.5" strokeLinecap="round" />

              {/* Tija y Sillín */}
              <line x1="195" y1="110" x2="180" y2="70" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
              <path d="M145 65 Q 180 62 215 67 Q 200 75 165 72 Z" fill="#0f172a" />

              {/* Potencia y Manillar */}
              <line x1="375" y1="120" x2="400" y2="105" stroke="#475569" strokeWidth="4" strokeLinecap="round" />
              <path d="M400 105 Q 425 105 420 135 Q 410 155 395 150" stroke="#0f172a" strokeWidth="4" fill="none" strokeLinecap="round" />

              {/* LÍNEAS DE COTA TÉCNICA */}
              
              {/* COTA I: STACK (Vertical de BB a tope de dirección) */}
              <g
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setActiveDimension("stack")}
                onMouseLeave={() => setActiveDimension(null)}
                opacity={activeDimension === null || activeDimension === "stack" ? 1 : 0.25}
              >
                <line x1="230" y1="270" x2="450" y2="270" stroke="#0d9488" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="375" y1="120" x2="450" y2="120" stroke="#0d9488" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="440" y1="120" x2="440" y2="270" stroke="#0d9488" strokeWidth="2" markerEnd="url(#arrow)" />
                <circle cx="440" cy="195" r="12" fill="#0d9488" />
                <text x="440" y="200" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">I</text>
              </g>

              {/* COTA J: REACH (Horizontal de BB a tope de dirección) */}
              <g
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setActiveDimension("reach")}
                onMouseLeave={() => setActiveDimension(null)}
                opacity={activeDimension === null || activeDimension === "reach" ? 1 : 0.25}
              >
                <line x1="230" y1="270" x2="230" y2="90" stroke="#0d9488" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="375" y1="120" x2="375" y2="90" stroke="#0d9488" strokeWidth="1" strokeDasharray="2 2" />
                <line x1="230" y1="95" x2="375" y2="95" stroke="#0d9488" strokeWidth="2" />
                <circle cx="302" cy="95" r="12" fill="#0d9488" />
                <text x="302" y="100" fill="#ffffff" fontSize="12" fontWeight="bold" textAnchor="middle">J</text>
              </g>

              {/* COTA C: TUBO SUPERIOR (C) */}
              <g
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setActiveDimension("topTube")}
                onMouseLeave={() => setActiveDimension(null)}
                opacity={activeDimension === null || activeDimension === "topTube" ? 1 : 0.25}
              >
                <circle cx="280" cy="142" r="11" fill="#f59e0b" />
                <text x="280" y="146" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">C</text>
              </g>

              {/* COTA B: TUBO DE SILLÍN (B) */}
              <g
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setActiveDimension("seatTube")}
                onMouseLeave={() => setActiveDimension(null)}
                opacity={activeDimension === null || activeDimension === "seatTube" ? 1 : 0.25}
              >
                <circle cx="210" cy="205" r="11" fill="#6366f1" />
                <text x="210" y="209" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">B</text>
              </g>

              {/* COTA G: VAINAS (G) */}
              <g
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setActiveDimension("chainstay")}
                onMouseLeave={() => setActiveDimension(null)}
                opacity={activeDimension === null || activeDimension === "chainstay" ? 1 : 0.25}
              >
                <circle cx="155" cy="265" r="11" fill="#ec4899" />
                <text x="155" y="269" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">G</text>
              </g>

              {/* COTA H: BATALLA (H) */}
              <g
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setActiveDimension("wheelbase")}
                onMouseLeave={() => setActiveDimension(null)}
                opacity={activeDimension === null || activeDimension === "wheelbase" ? 1 : 0.25}
              >
                <line x1="90" y1="315" x2="430" y2="315" stroke="#64748b" strokeWidth="1.5" />
                <circle cx="260" cy="315" r="11" fill="#64748b" />
                <text x="260" y="319" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">H</text>
              </g>

              {/* COTA E: ÁNGULO DIRECCIÓN (E) */}
              <g
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setActiveDimension("headAngle")}
                onMouseLeave={() => setActiveDimension(null)}
                opacity={activeDimension === null || activeDimension === "headAngle" ? 1 : 0.25}
              >
                <circle cx="410" cy="180" r="11" fill="#8b5cf6" />
                <text x="410" y="184" fill="#ffffff" fontSize="11" fontWeight="bold" textAnchor="middle">E</text>
              </g>

              {/* COTA L: OFFSET PEDALIER (L) */}
              <g
                className="cursor-pointer transition-opacity"
                onMouseEnter={() => setActiveDimension("bbDrop")}
                onMouseLeave={() => setActiveDimension(null)}
                opacity={activeDimension === null || activeDimension === "bbDrop" ? 1 : 0.25}
              >
                <circle cx="230" cy="295" r="10" fill="#0284c7" />
                <text x="230" y="299" fill="#ffffff" fontSize="10" fontWeight="bold" textAnchor="middle">L</text>
              </g>
            </svg>
          </div>
          <div className="text-[11px] text-slate-500 mt-2 flex items-center gap-1">
            <Info className="w-3.5 h-3.5 text-teal-600" />
            <span>Pasa el ratón por los círculos o la tabla para resaltar cada cota en el esquema.</span>
          </div>
        </div>

        {/* TABLA DE MEDIDAS DE LA TALLA M */}
        <div className="lg:col-span-6 space-y-3">
          <div className="overflow-hidden border border-slate-200 rounded-2xl">
            <div className="bg-slate-100/80 px-4 py-2.5 border-b border-slate-200 flex items-center justify-between text-xs font-bold text-slate-700">
              <span>Cota Técnica</span>
              <span className="text-teal-700 bg-white px-2.5 py-0.5 rounded-md border border-slate-200">
                Talla {sizeRef}
              </span>
            </div>
            <div className="divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
              {dimensions.map((dim) => {
                const isHovered = activeDimension === dim.id;
                return (
                  <div
                    key={dim.id}
                    onMouseEnter={() => setActiveDimension(dim.id)}
                    onMouseLeave={() => setActiveDimension(null)}
                    className={`px-4 py-2.5 flex items-center justify-between transition-colors cursor-pointer text-xs ${
                      isHovered ? "bg-teal-50/90 text-teal-950 font-bold" : "hover:bg-slate-50 text-slate-700"
                    }`}
                  >
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                          isHovered ? "bg-teal-600 text-white" : "bg-slate-200 text-slate-700"
                        }`}
                      >
                        {dim.letter}
                      </span>
                      <span className="truncate">{dim.label}</span>
                    </div>
                    <div className="font-mono font-bold text-slate-900 text-right">
                      {dim.value} {dim.unit}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Explicación activa */}
          {activeDimension && (
            <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl text-xs text-teal-900 animate-fadeIn">
              <strong>{dimensions.find((d) => d.id === activeDimension)?.label}:</strong>{" "}
              {dimensions.find((d) => d.id === activeDimension)?.description}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
