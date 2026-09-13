import { Metadata } from "next";
import Link from "next/link";
import { constructMetadata } from "@/lib/seo/metadata";
import {
  Mail,
  ArrowLeft,
  Sparkles,
  MessageSquare,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Send,
} from "lucide-react";

export const metadata: Metadata = constructMetadata({
  title: "Contacto y Atención al Ciclista",
  description:
    "Ponte en contacto con el equipo de ComparaBici.es: dudas, reporte de erratas en especificaciones, nuevas marcas o colaboraciones.",
  canonicalPath: "/contacto",
});

export default function ContactoPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-teal-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Inicio
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold" aria-current="page">
          Contacto
        </span>
      </nav>

      {/* Header */}
      <header className="space-y-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 border border-teal-200">
          <Mail className="w-3.5 h-3.5 text-teal-600" />
          <span>Atención Directa y Feedback</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950">
          Contacto y Colaboraciones
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-2xl">
          ¿Has detectado alguna variación de precio o componente en el catálogo? ¿Representas a una marca de bicicletas o tienes una sugerencia técnica? Estamos a tu disposición.
        </p>
      </header>

      {/* Main Contact Card */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left: Contact Details Card */}
        <div className="md:col-span-2 rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-6">
          <div className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-teal-500 text-slate-950 font-black shadow-md shadow-teal-500/20">
              <Mail className="h-6 w-6" />
            </div>
            <div>
              <span className="text-[11px] font-black uppercase tracking-wider text-teal-700">
                Buzón Oficial
              </span>
              <h2 className="text-lg sm:text-xl font-black text-slate-950">
                Escríbenos directamente
              </h2>
              <p className="text-xs text-slate-500 mt-0.5">
                Canal centralizado de atención para ciclistas, tiendas y fabricantes.
              </p>
            </div>
          </div>

          {/* Email Callout Box */}
          <div className="rounded-2xl bg-slate-50 border border-slate-200/80 p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[11px] font-bold text-slate-500 block">
                Dirección de correo electrónico:
              </span>
              <a
                href="mailto:contacto@comparabici.es"
                className="text-base sm:text-lg font-black text-teal-700 hover:text-teal-800 hover:underline"
              >
                contacto@comparabici.es
              </a>
            </div>
            <a
              href="mailto:contacto@comparabici.es"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-950 hover:bg-teal-600 text-white font-bold text-xs px-5 py-3 shadow-sm transition-all"
            >
              <Send className="w-3.5 h-3.5" />
              <span>Abrir Correo</span>
            </a>
          </div>

          {/* SLA / Response time */}
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-600 pt-1">
            <Clock className="w-4 h-4 text-teal-600 shrink-0" />
            <span>Tiempo medio de respuesta: 24 a 48 horas laborables.</span>
          </div>

          {/* Topics grid */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <h3 className="font-extrabold text-xs uppercase tracking-wider text-slate-900">
              ¿Sobre qué podemos ayudarte?
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
                  Reporte de Erratas
                </span>
                <p className="text-[11px] text-slate-500">
                  Si un fabricante ha cambiado un grupo, peso o precio, avísanos con el enlace y lo actualizamos.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-amber-500" />
                  Nuevas Marcas y Modelos
                </span>
                <p className="text-[11px] text-slate-500">
                  ¿Echas en falta una marca de referencia? Indícanoslo para incluirla en la próxima actualización.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
                  Sugerencias Técnicas
                </span>
                <p className="text-[11px] text-slate-500">
                  Mejoras en el recomendador de bicicletas, calculadora de ratios o visualización de geometrías.
                </p>
              </div>
              <div className="p-3.5 rounded-xl bg-slate-50/70 border border-slate-200/70 space-y-1">
                <span className="font-bold text-xs text-slate-900 flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  Marcas y Patrocinios
                </span>
                <p className="text-[11px] text-slate-500">
                  Información sobre formatos publicitarios integrados y espacios patrocinados oficiales.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Quick Manifesto Sidebar */}
        <div className="rounded-3xl bg-slate-950 text-white p-6 sm:p-7 space-y-5 flex flex-col justify-between shadow-lg">
          <div className="space-y-4">
            <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-3 py-1 text-[10px] font-black text-teal-300 border border-teal-500/30">
              <ShieldCheck className="w-3 h-3 text-teal-400" />
              <span>Compromiso Editorial</span>
            </div>
            <h3 className="text-base sm:text-lg font-black tracking-tight text-white leading-snug">
              Datos oficiales sin intermediarios
            </h3>
            <p className="text-xs text-slate-300 leading-relaxed">
              ComparaBici.es nació con el objetivo de ofrecer al ciclista información limpia, contrastada y milimétrica.
            </p>
            <ul className="space-y-2 text-xs text-slate-300">
              <li className="flex items-start gap-2">
                <span className="text-teal-400 font-bold">✓</span>
                <span>Sin venta directa de producto</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400 font-bold">✓</span>
                <span>Sin enlaces de afiliados genéricos</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-teal-400 font-bold">✓</span>
                <span>Respeto escrupuloso a la privacidad del usuario</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 border-t border-slate-800">
            <p className="text-[11px] text-slate-400">
              ¿Dudas sobre privacidad? Consulta nuestra{" "}
              <Link href="/politica-privacidad" className="text-teal-400 hover:underline">
                Política de Privacidad
              </Link>{" "}
              o nuestro{" "}
              <Link href="/aviso-legal" className="text-teal-400 hover:underline">
                Aviso Legal
              </Link>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
