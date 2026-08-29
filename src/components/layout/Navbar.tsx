"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useComparison } from "@/lib/context/ComparisonContext";
import {
  Bike,
  Scale,
  Search,
  Menu,
  X,
  ExternalLink,
  Zap,
  Compass,
  Sparkles,
  TrendingUp,
  Flame,
} from "lucide-react";

export function Navbar() {
  const { selectedBikes } = useComparison();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full border-b border-slate-200 bg-white/95 backdrop-blur shadow-xs">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8 h-16">
        {/* Brand Logo */}
        <div className="flex items-center gap-6 lg:gap-8">
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-tr from-teal-600 to-emerald-500 text-white shadow-md shadow-teal-500/20 group-hover:scale-105 transition-transform">
              <Bike className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-1">
                BikeFinder<span className="text-teal-600 font-extrabold">.es</span>
              </span>
              <span className="block text-[10px] font-semibold uppercase tracking-wider text-slate-500">
                Gravel & Carretera Oficial
              </span>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            <Link
              href="/"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-slate-50 rounded-lg transition-colors"
            >
              Catálogo
            </Link>
            <Link
              href="/?discipline=gravel"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Compass className="w-4 h-4 text-amber-600" />
              Gravel
            </Link>
            <Link
              href="/?discipline=road_endurance"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <Zap className="w-4 h-4 text-sky-600" />
              Gran Fondo
            </Link>
            <Link
              href="/asistente"
              className="px-3 py-2 text-sm font-bold text-teal-700 hover:bg-teal-50 rounded-lg transition-colors flex items-center gap-1.5 bg-teal-50/60 border border-teal-100"
            >
              <Sparkles className="w-4 h-4 text-teal-600" />
              Encuentra tu Bici
            </Link>
            <Link
              href="/calculadora-desarrollos"
              className="px-3 py-2 text-sm font-medium text-slate-700 hover:text-teal-600 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              Calculadora Desarrollos
            </Link>
          </nav>
        </div>

        {/* Right actions */}
        <div className="flex items-center gap-3">
          {/* Comparador button */}
          <Link
            href="/comparador"
            className={`relative flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition-all ${
              selectedBikes.length > 0
                ? "bg-teal-600 text-white shadow-md shadow-teal-600/25 hover:bg-teal-700 animate-pulse"
                : "bg-slate-100 text-slate-700 hover:bg-slate-200"
            }`}
          >
            <Scale className="h-4 w-4" />
            <span className="hidden sm:inline">Comparador</span>
            {selectedBikes.length > 0 && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-white text-[11px] font-bold text-teal-700">
                {selectedBikes.length}
              </span>
            )}
          </Link>

          {/* Mobile Menu Trigger */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            aria-label="Abrir menú"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile dropdown */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-slate-200 bg-white px-4 py-3 space-y-1 shadow-lg">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            Catálogo Completo
          </Link>
          <Link
            href="/asistente"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-base font-bold text-teal-700 bg-teal-50/70 rounded-lg"
          >
            <Sparkles className="w-4 h-4 text-teal-600" />
            Asistente: Encuentra tu Bici Ideal
          </Link>
          <Link
            href="/calculadora-desarrollos"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            <TrendingUp className="w-4 h-4 text-emerald-600" />
            Calculadora de Desarrollos Ciclistas
          </Link>
          <Link
            href="/?discipline=gravel"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            <Compass className="w-4 h-4 text-amber-600" />
            Bicicletas Gravel
          </Link>
          <Link
            href="/?discipline=road_endurance"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            <Zap className="w-4 h-4 text-sky-600" />
            Carretera Gran Fondo
          </Link>
          <Link
            href="/?discipline=road_race"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            <Flame className="w-4 h-4 text-rose-600" />
            Carretera Competición & Aero
          </Link>
          <Link
            href="/?discipline=all_road"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 px-3 py-2 text-base font-medium text-slate-700 hover:bg-slate-50 rounded-lg"
          >
            <Sparkles className="w-4 h-4 text-emerald-600" />
            All-Road Polivalente
          </Link>
          <Link
            href="/comparador"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center justify-between px-3 py-2 text-base font-medium text-teal-700 hover:bg-teal-50 rounded-lg"
          >
            <span className="flex items-center gap-2">
              <Scale className="w-4 h-4" />
              Comparador Técnico
            </span>
            <span className="rounded-full bg-teal-100 px-2 py-0.5 text-xs font-bold text-teal-800">
              {selectedBikes.length}/4
            </span>
          </Link>
        </div>
      )}
    </header>
  );
}
