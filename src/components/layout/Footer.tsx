import React from "react";
import Link from "next/link";
import { Bike, ShieldCheck, Sparkles, Scale, TrendingUp, Compass, Zap, Mountain, ArrowUpRight } from "lucide-react";

export function Footer() {
  return (
    <footer className="border-t border-slate-900 bg-[#070b14] text-slate-400 mt-24">
      <div className="mx-auto max-w-7xl px-4 py-14 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-14">
          {/* Brand & Manifesto */}
          <div className="md:col-span-2 space-y-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-900 text-teal-400 border border-teal-500/30 shadow-md">
                <Bike className="h-5 w-5" />
              </div>
              <span className="text-xl font-black text-white tracking-tight">
                BikeFinder<span className="text-teal-400 font-extrabold">.es</span>
              </span>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 leading-relaxed max-w-md">
              El índice técnico independiente de referencia para el ciclismo moderno.
              Analizamos especificaciones oficiales verificadas (pesos en báscula, suspensiones,
              ratios de escalada y geometría Stack/Reach) sin comisiones ocultas ni enlaces de Amazon.
            </p>
            <div className="inline-flex items-center gap-2 rounded-xl bg-teal-950/60 px-3 py-1.5 text-xs font-semibold text-teal-300 border border-teal-800/50">
              <ShieldCheck className="h-4 w-4 text-teal-400 shrink-0" />
              <span>100% Enlaces a webs oficiales de fabricantes</span>
            </div>
          </div>

          {/* Disciplinas */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white mb-4">
              Disciplinas
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/?discipline=gravel"
                  className="hover:text-teal-400 transition-colors flex items-center gap-1.5"
                >
                  <Compass className="w-3.5 h-3.5 text-amber-500" />
                  <span>Bicicletas Gravel</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/?discipline=road_endurance"
                  className="hover:text-teal-400 transition-colors flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-sky-500" />
                  <span>Carretera Gran Fondo</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/?discipline=road_race"
                  className="hover:text-teal-400 transition-colors flex items-center gap-1.5"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-rose-500" />
                  <span>Aero & Competición</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/?discipline=mtb"
                  className="hover:text-teal-400 transition-colors flex items-center gap-1.5"
                >
                  <Mountain className="w-3.5 h-3.5 text-purple-500" />
                  <span>Montaña (MTB & Doble)</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/?discipline=all_road"
                  className="hover:text-teal-400 transition-colors flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                  <span>All-Road Polivalente</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Herramientas */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white mb-4">
              Herramientas
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/asistente"
                  className="hover:text-teal-300 font-bold text-teal-400 flex items-center gap-1.5"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Recomendador Inteligente</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/comparador"
                  className="hover:text-teal-400 transition-colors flex items-center gap-1.5"
                >
                  <Scale className="w-3.5 h-3.5 text-slate-400" />
                  <span>Comparador 1v1 y Multivía</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/calculadora-desarrollos"
                  className="hover:text-teal-400 transition-colors flex items-center gap-1.5"
                >
                  <TrendingUp className="w-3.5 h-3.5 text-slate-400" />
                  <span>Calculadora Desarrollos</span>
                </Link>
              </li>
              <li>
                <Link
                  href="/?isElectric=true"
                  className="hover:text-teal-400 transition-colors flex items-center gap-1.5"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  <span>Catálogo E-Bikes Eléctricas</span>
                </Link>
              </li>
            </ul>
          </div>

          {/* Duelos Populares */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-white mb-4">
              Comparativas Clave
            </h3>
            <ul className="space-y-2.5 text-xs">
              <li>
                <Link
                  href="/comparativa/canyon-grizl-vs-orbea-terra"
                  className="hover:text-teal-400 transition-colors flex items-center justify-between"
                >
                  <span>Grizl vs Terra</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600" />
                </Link>
              </li>
              <li>
                <Link
                  href="/comparativa/canyon-grizl-vs-trek-checkpoint"
                  className="hover:text-teal-400 transition-colors flex items-center justify-between"
                >
                  <span>Grizl vs Checkpoint</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600" />
                </Link>
              </li>
              <li>
                <Link
                  href="/comparativa/trek-domane-vs-specialized-roubaix"
                  className="hover:text-teal-400 transition-colors flex items-center justify-between"
                >
                  <span>Domane vs Roubaix</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600" />
                </Link>
              </li>
              <li>
                <Link
                  href="/comparativa/canyon-ultimate-vs-specialized-tarmac"
                  className="hover:text-teal-400 transition-colors flex items-center justify-between"
                >
                  <span>Ultimate vs Tarmac</span>
                  <ArrowUpRight className="w-3 h-3 text-slate-600" />
                </Link>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright */}
        <div className="border-t border-slate-900 pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <p>© {new Date().getFullYear()} BikeFinder.es — Índice Técnico Oficial de Bicicletas. Todos los derechos reservados.</p>
          <p className="flex items-center gap-1.5 text-slate-400">
            <span>Hecho con pasión por la geometría y el ciclismo</span>
            <Sparkles className="w-3.5 h-3.5 text-teal-400" />
          </p>
        </div>
      </div>
    </footer>
  );
}
