import { Metadata } from "next";
import Link from "next/link";
import { constructMetadata } from "@/lib/seo/metadata";
import { Cookie, ShieldCheck, ArrowLeft, CheckCircle2, Settings, ExternalLink } from "lucide-react";

export const metadata: Metadata = constructMetadata({
  title: "Política de Cookies y Almacenamiento Local",
  description:
    "Información sobre las cookies técnicas y almacenamiento local que utiliza ComparaBici.es conforme a la LSSI-CE.",
  canonicalPath: "/politica-cookies",
});

export default function PoliticaCookiesPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-teal-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Inicio
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold" aria-current="page">
          Política de Cookies
        </span>
      </nav>

      {/* Header */}
      <header className="space-y-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 border border-teal-200">
          <Cookie className="w-3.5 h-3.5 text-teal-600" />
          <span>Normativa LSSI-CE y Directrices AEPD</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950">
          Política de Cookies y Almacenamiento
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Última actualización: Septiembre de 2026 · Información transparente sobre el uso de cookies y tecnologías similares en ComparaBici.es.
        </p>
      </header>

      {/* Content */}
      <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 space-y-6">
        {/* 1. ¿Qué son las cookies? */}
        <section className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-3">
          <h2 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
            <Cookie className="w-5 h-5 text-teal-600 shrink-0" />
            <span>1. ¿Qué son las Cookies y el Almacenamiento Local?</span>
          </h2>
          <p>
            Una cookie es un pequeño archivo que se descarga en el navegador del usuario al acceder a determinadas páginas web. Permite a un sitio web almacenar y recuperar información sobre los hábitos de navegación del usuario o de su equipo.
          </p>
          <p>
            En <strong>ComparaBici.es</strong> también empleamos tecnologías de almacenamiento local del navegador (conocidas como <em>HTML5 Web Storage</em> o <em>LocalStorage/SessionStorage</em>), las cuales funcionan directamente en tu dispositivo sin enviar información personal a servidores externos.
          </p>
        </section>

        {/* 2. ¿Qué cookies y almacenamiento utilizamos? */}
        <section className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-4">
          <h2 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
            <span>2. Tecnologías Empleadas en ComparaBici.es</span>
          </h2>
          <p>
            ComparaBici.es prioriza la privacidad del ciclista. A continuación se desglosan los mecanismos técnicos que utilizamos:
          </p>

          <div className="space-y-3">
            {/* LocalStorage Técnico */}
            <div className="p-4 rounded-2xl bg-teal-50/60 border border-teal-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-teal-950 text-xs sm:text-sm">
                  1. Almacenamiento Local Técnico (Estrictamente Necesario)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-teal-200/70 text-[10px] font-black text-teal-900">
                  Técnico / Esencial
                </span>
              </div>
              <p className="text-xs text-slate-700">
                <strong>Clave:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-teal-200 font-mono text-[11px]">comparabici_comparison_v2</code>
              </p>
              <p className="text-xs text-slate-700">
                <strong>Finalidad:</strong> Permite que las bicicletas que añades a la comparativa (hasta 4 modelos) permanezcan guardadas mientras navegas entre el catálogo, la calculadora de desarrollos o la ficha técnica, sin necesidad de que crees una cuenta ni inicies sesión.
              </p>
              <p className="text-xs text-slate-600">
                <strong>Duración:</strong> Persistente en tu navegador hasta que pulses el botón &quot;Vaciar comparador&quot; o borres los datos del navegador. No se envía a ningún servidor.
              </p>
            </div>

            {/* SessionStorage Preferencias */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                  2. Almacenamiento de Sesión (Preferencia del Usuario)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-[10px] font-black text-slate-800">
                  Sesión
                </span>
              </div>
              <p className="text-xs text-slate-700">
                <strong>Finalidad:</strong> Recuerda si has cerrado un aviso informativo o barra superior durante la sesión actual para no volver a mostrarlo de forma intrusiva.
              </p>
              <p className="text-xs text-slate-600">
                <strong>Duración:</strong> Se borra automáticamente al cerrar la pestaña o el navegador.
              </p>
            </div>

            {/* Cookies de Seguridad / Infraestructura */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-extrabold text-slate-900 text-xs sm:text-sm">
                  3. Cookies de Infraestructura y Seguridad (Cloudflare)
                </span>
                <span className="px-2 py-0.5 rounded-full bg-slate-200 text-[10px] font-black text-slate-800">
                  Seguridad
                </span>
              </div>
              <p className="text-xs text-slate-700">
                <strong>Nombre:</strong> <code className="bg-white px-1.5 py-0.5 rounded border border-slate-200 font-mono text-[11px]">__cf_bm</code> u homólogas de red perimetral.
              </p>
              <p className="text-xs text-slate-700">
                <strong>Finalidad:</strong> Gestión de seguridad frente a ataques de denegación de servicio (DDoS), mitigación de bots automatizados y enrutamiento perimetral rápido a través de la red global de Cloudflare.
              </p>
              <p className="text-xs text-slate-600">
                <strong>Duración:</strong> Máximo 30 minutos a 1 año.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Cookies de Terceros y Publicidad Futura */}
        <section className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-3">
          <h2 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
            <span>3. Cookies Analíticas y Publicitarias de Terceros</span>
          </h2>
          <p>
            En caso de que ComparaBici.es active herramientas de analítica web (como Google Analytics) o redes de publicidad contextual (como Google AdSense o plataformas afines), se solicitará siempre el <strong>consentimiento previo, libre e informado del usuario</strong> mediante un banner de configuración antes de depositar cualquier cookie no esencial en su navegador.
          </p>
        </section>

        {/* 4. Cómo gestionar y desactivar cookies */}
        <section className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-3">
          <h2 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
            <Settings className="w-5 h-5 text-teal-600 shrink-0" />
            <span>4. Cómo Configurar o Desactivar las Cookies en tu Navegador</span>
          </h2>
          <p>
            El usuario puede permitir, bloquear o eliminar las cookies y los datos de sitios instalados en su equipo mediante la configuración de las opciones del navegador instalado en su ordenador o dispositivo móvil:
          </p>
          <ul className="list-disc pl-5 space-y-1.5 text-slate-700">
            <li>
              <strong>Google Chrome:</strong> Configuración → Privacidad y seguridad → Cookies y otros datos de sitios.
            </li>
            <li>
              <strong>Mozilla Firefox:</strong> Ajustes → Privacidad y seguridad → Cookies y datos del sitio.
            </li>
            <li>
              <strong>Apple Safari:</strong> Preferencias → Privacidad → Bloquear todas las cookies.
            </li>
            <li>
              <strong>Microsoft Edge:</strong> Configuración → Cookies y permisos del sitio.
            </li>
          </ul>
          <p className="text-xs text-slate-500 pt-1">
            Ten en cuenta que la desactivación de almacenamiento local técnico puede limitar algunas funciones interactivas como mantener las bicicletas seleccionadas en la bandeja del comparador.
          </p>
        </section>
      </div>
    </div>
  );
}
