"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useComparison } from "@/lib/context/ComparisonContext";
import {
  Bike,
  Scale,
  Menu,
  X,
  Zap,
  Compass,
  Sparkles,
  TrendingUp,
  Mountain,
  ChevronRight,
  Flame,
} from "lucide-react";

export function Navbar() {
  const { selectedBikes } = useComparison();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200/80 bg-white/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Brand Logo */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative flex h-10 w-10 items-center justify-center rounded-xl bg-slate-950 text-teal-400 shadow-md group-hover:shadow-teal-500/20 group-hover:scale-105 transition-all duration-300 ring-1 ring-white/10">
              <Bike className="h-5 w-5 group-hover:rotate-[-6deg] transition-transform" />
              <div className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full bg-teal-400 ring-2 ring-white" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-lg font-black tracking-tight text-slate-950">
                  BikeFinder<span className="text-teal-600">.es</span>
                </span>
                <span className="hidden sm:inline-block px-1.5 py-0.2 rounded bg-slate-100 text-[9px] font-extrabold uppercase tracking-wider text-slate-600 border border-slate-200/70">
                  Pro Index
                </span>
              </div>
              <span className="block text-[10px] font-semibold tracking-wide text-slate-600 -mt-0.5">
                Gravel · Carretera · Montaña Oficial
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-1.5 text-xs font-bold text-slate-700 hover:text-slate-950 hover:bg-slate-100 rounded-lg transition-colors"
            >
              Catálogo
            </Link>
            <Link
              href="/?discipline=gravel"
              className="px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-amber-700 hover:bg-amber-50/70 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              Gravel
            </Link>
            <Link
              href="/?discipline=road_endurance"
              className="px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-sky-700 hover:bg-sky-50/70 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-3.5 h-3.5 text-sky-600" />
              Gran Fondo
            </Link>
            <Link
              href="/?discipline=mtb"
              className="px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-purple-700 hover:bg-purple-50/70 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Mountain className="w-3.5 h-3.5 text-purple-600" />
              Montaña
            </Link>
            <Link
              href="/asistente"
              className="px-3 py-1.5 text-xs font-extrabold text-teal-800 bg-gradient-to-r from-teal-50 to-emerald-50 hover:from-teal-100 hover:to-emerald-100 border border-teal-200/80 rounded-lg transition-all flex items-center gap-1.5 shadow-2xs"
            >
              <Sparkles className="w-3.5 h-3.5 text-teal-600" />
              Recomendador IA
            </Link>
            <Link
              href="/calculadora-desarrollos"
              className="px-2.5 py-1.5 text-xs font-bold text-slate-700 hover:text-emerald-700 hover:bg-emerald-50/70 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
              Desarrollos
            </Link>
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-2.5">
          {/* Comparador Button */}
          <Link
            href="/comparador"
            className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-xs font-extrabold transition-all cursor-pointer ${
              selectedBikes.length > 0
                ? "bg-slate-950 text-white shadow-md hover:bg-teal-700 ring-2 ring-teal-500/50"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200 border border-slate-200/70"
            }`}
          >
            <Scale className="h-4 w-4 text-teal-400" />
            <span>Comparador</span>
            {selectedBikes.length > 0 ? (
              <span className="flex h-5 px-1.5 items-center justify-center rounded-full bg-teal-500 text-[11px] font-black text-slate-950">
                {selectedBikes.length}
              </span>
            ) : (
              <span className="hidden sm:inline text-[11px] text-slate-600 font-medium">
                (0)
              </span>
            )}
          </Link>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white/95 backdrop-blur-md px-4 py-3 space-y-1.5 shadow-xl">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-xs font-bold text-slate-800 hover:bg-slate-100 rounded-xl"
          >
            <span>Catálogo Completo</span>
            <ChevronRight className="w-4 h-4 text-slate-400" />
          </Link>
          <Link
            href="/asistente"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2.5 text-xs font-black text-teal-900 bg-teal-50/90 rounded-xl border border-teal-200"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span>Recomendador Inteligente</span>
          </Link>
          <div className="grid grid-cols-2 gap-1 pt-1">
            <Link
              href="/?discipline=gravel"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <Compass className="w-3.5 h-3.5 text-amber-600" />
              Gravel
            </Link>
            <Link
              href="/?discipline=road_endurance"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <Zap className="w-3.5 h-3.5 text-sky-600" />
              Gran Fondo
            </Link>
            <Link
              href="/?discipline=mtb"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <Mountain className="w-3.5 h-3.5 text-purple-600" />
              Montaña (MTB)
            </Link>
            <Link
              href="/?discipline=road_race"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg"
            >
              <Flame className="w-3.5 h-3.5 text-rose-600" />
              Racing / Aero
            </Link>
          </div>
          <Link
            href="/calculadora-desarrollos"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-xl"
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Calculadora de Desarrollos
          </Link>
          <Link
            href="/comparador"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2.5 text-xs font-black text-white bg-slate-950 rounded-xl shadow-xs"
          >
            <span className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-teal-400" />
              Abrir Comparador Técnico
            </span>
            <span className="rounded-full bg-teal-500 px-2 py-0.5 text-[10px] font-black text-slate-950">
              {selectedBikes.length}/4
            </span>
          </Link>
        </div>
      )}
    </header>
  );
}
