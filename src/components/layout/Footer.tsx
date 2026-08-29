import React from "react";
import Link from "next/link";
import { Bike, ShieldCheck, ExternalLink, Sparkles, Scale, TrendingUp } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-white text-slate-600 mt-20">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
          {/* Brand & Manifesto */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-teal-600 text-white">
                <Bike className="h-5 w-5" />
              </div>
              <span className="text-xl font-bold text-slate-900">
                BikeFinder<span className="text-teal-600 font-extrabold">.es</span>
              </span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed max-w-md">
              Buscador y comparador técnico especializado en bicicletas de Gravel y Carretera. Analizamos especificaciones oficiales reales (pesos, pasos de rueda, ratios de desarrollo y geometría) para ayudarte a elegir tu bicicleta perfecta.
            </p>
            <div className="inline-flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-800 border border-emerald-200">
              <ShieldCheck className="h-4 w-4 text-emerald-600" />
              <span>100% Enlaces oficiales a fabricantes · Cero enlaces de Amazon</span>
            </div>
          </div>

          {/* Duelos Populares */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Duelos Destacados
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link
                  href="/comparativa/canyon-grizl-vs-orbea-terra"
                  className="hover:text-teal-600 transition-colors"
                >
                  Canyon Grizl vs Orbea Terra
                </Link>
              </li>
              <li>
                <Link
                  href="/comparativa/canyon-grizl-vs-trek-checkpoint"
                  className="hover:text-teal-600 transition-colors"
                >
                  Canyon Grizl vs Trek Checkpoint
                </Link>
              </li>
              <li>
                <Link
                  href="/comparativa/trek-domane-vs-specialized-roubaix"
                  className="hover:text-teal-600 transition-colors"
                >
                  Trek Domane vs Specialized Roubaix
                </Link>
              </li>
              <li>
                <Link
                  href="/comparativa/canyon-ultimate-vs-specialized-tarmac"
                  className="hover:text-teal-600 transition-colors"
                >
                  Canyon Ultimate vs Specialized Tarmac
                </Link>
              </li>
            </ul>
          </div>

          {/* Categorías y Herramientas */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-slate-900 mb-3">
              Herramientas Ciclistas
            </h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link href="/asistente" className="hover:text-teal-600 transition-colors font-bold text-teal-700 flex items-center gap-1">
                  <Sparkles className="w-3 h-3" /> Asistente de Elección
                </Link>
              </li>
              <li>
                <Link href="/calculadora-desarrollos" className="hover:text-teal-600 transition-colors font-semibold text-slate-800 flex items-center gap-1">
                  <TrendingUp className="w-3 h-3 text-emerald-600" /> Calculadora de Desarrollos
                </Link>
              </li>
              <li>
                <Link href="/comparador" className="hover:text-teal-600 transition-colors font-semibold text-slate-800 flex items-center gap-1">
                  <Scale className="w-3 h-3 text-teal-600" /> Comparador Multivía
                </Link>
              </li>
              <li>
                <Link href="/?discipline=gravel" className="hover:text-teal-600 transition-colors">
                  Catálogo Gravel
                </Link>
              </li>
              <li>
                <Link href="/?discipline=road_endurance" className="hover:text-teal-600 transition-colors">
                  Catálogo Gran Fondo
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="border-t border-slate-100 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} BikeFinder.es — Todos los derechos reservados. Datos técnicos de catálogos oficiales.</p>
          <p className="flex items-center gap-1">
            Desarrollado para ciclistas con pasión por el detalle técnico <Sparkles className="w-3.5 h-3.5 text-amber-500" />
          </p>
        </div>
      </div>
    </footer>
  );
}
