import { Metadata } from "next";
import Link from "next/link";
import { constructMetadata } from "@/lib/seo/metadata";
import { ShieldCheck, Scale, ArrowLeft, Mail, FileText, CheckCircle2 } from "lucide-react";

export const metadata: Metadata = constructMetadata({
  title: "Aviso Legal y Condiciones de Uso",
  description:
    "Aviso legal, información identificativa, propiedad intelectual y condiciones de uso del portal oficial ComparaBici.es.",
  canonicalPath: "/aviso-legal",
});

export default function AvisoLegalPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-teal-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Inicio
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold" aria-current="page">
          Aviso Legal
        </span>
      </nav>

      {/* Header */}
      <header className="space-y-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 border border-teal-200">
          <FileText className="w-3.5 h-3.5 text-teal-600" />
          <span>Información Legal LSSI-CE</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950">
          Aviso Legal y Condiciones de Uso
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Última actualización: Septiembre de 2026 · Cumplimiento de la Ley 34/2002 (LSSI-CE).
        </p>
      </header>

      {/* Content */}
      <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 space-y-6">
        {/* 1. Datos Identificativos */}
        <section className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-3">
          <h2 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
            <span>1. Información General y Datos Identificativos</span>
          </h2>
          <p>
            En cumplimiento con el artículo 10 de la <strong>Ley 34/2002, de 11 de julio, de Servicios de la Sociedad de la Información y del Comercio Electrónico (LSSI-CE)</strong>, se informa a los usuarios de los datos identificativos del titular de este sitio web:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-800 font-medium">
            <li><strong>Denominación del portal:</strong> ComparaBici.es</li>
            <li><strong>Actividad:</strong> Portal web divulgativo e independiente de comparación técnica, búsqueda y recomendación de bicicletas de carretera, gravel y montaña.</li>
            <li><strong>Dominio web:</strong> <Link href="/" className="text-teal-600 font-semibold hover:underline">https://comparabici.es</Link></li>
            <li><strong>Correo electrónico de contacto directo:</strong> <a href="mailto:contacto@comparabici.es" className="text-teal-600 font-bold hover:underline">contacto@comparabici.es</a></li>
          </ul>
        </section>

        {/* 2. Objeto y Ámbito de Aplicación */}
        <section className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-3">
          <h2 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
            <Scale className="w-5 h-5 text-teal-600 shrink-0" />
            <span>2. Objeto y Condiciones de Uso</span>
          </h2>
          <p>
            El acceso y navegación por <strong>ComparaBici.es</strong> atribuye la condición de usuario e implica la aceptación plena de todas las condiciones aquí expuestas. Si el usuario no estuviera conforme con estas condiciones, deberá abstenerse de utilizar este sitio web.
          </p>
          <p>
            El acceso al portal es de carácter libre y gratuito. El usuario se compromete a hacer un uso adecuado de los contenidos y herramientas (comparador de geometrías, asistente inteligente, calculadora de desarrollos) sin incurrir en actividades ilícitas, contrarias a la buena fe o al orden público.
          </p>
        </section>

        {/* 3. Propiedad Intelectual y Marcas de Terceros */}
        <section className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-3">
          <h2 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
            <span>3. Propiedad Intelectual, Industrial y Marcas de Terceros</span>
          </h2>
          <p>
            El código fuente, arquitectura de software, diseño gráfico, logotipos de ComparaBici.es, algoritmos de recomendación y selección de datos son titularidad exclusiva de ComparaBici.es, quedando protegidos por los derechos de propiedad intelectual e industrial españoles e internacionales.
          </p>
          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
            <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
              Mención sobre marcas de fabricantes de ciclismo:
            </h3>
            <p className="text-xs text-slate-600">
              Todas las marcas registradas, nombres comerciales, logotipos, fotografías y nombres de modelos de bicicletas citados en este sitio web (incluyendo a título enunciativo: <em>Specialized, Canyon, Trek, Orbea, Giant, Cannondale, Scott, Megamo, Merida, BH, Bianchi, Pinarello, Liv, Shimano, SRAM</em>, etc.) son propiedad exclusiva de sus respectivos titulares.
            </p>
            <p className="text-xs text-slate-600">
              Su presencia en ComparaBici.es tiene una finalidad <strong>estrictamente informativa, divulgativa, descriptiva y de comparación técnica neutral</strong>, amparada por el derecho de cita y el principio de uso leal de marcas comerciales. ComparaBici.es es un proyecto independiente y no ostenta relación de representación oficial o exclusividad con dichas marcas salvo en aquellos casos donde se indique explícitamente un patrocinio o colaboración.
            </p>
          </div>
        </section>

        {/* 4. Exclusión de Responsabilidad */}
        <section className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-3">
          <h2 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
            <span>4. Exclusión de Responsabilidad y Enlaces Salientes</span>
          </h2>
          <p>
            Los datos técnicos (pasos de rueda, peso, relaciones de transmisión, componentes y precios PVP de referencia) son extraídos y verificados a partir de los catálogos y especificaciones públicas oficiales facilitadas por cada fabricante.
          </p>
          <p>
            A pesar del estricto control de calidad, los fabricantes pueden modificar sin previo aviso especificaciones, componentes de montaje o precios recomendados. ComparaBici.es no garantiza la total ausencia de erratas o cambios sobrevenidos de catálogo, recomendando siempre confirmar las especificaciones finales con el distribuidor oficial o la tienda autorizada correspondiente antes de formalizar una compra.
          </p>
          <p>
            ComparaBici.es no comercializa directamente bicicletas ni actúa como pasarela de pago. Los enlaces externos dirigen al usuario a las páginas oficiales del fabricante o a distribuidores autorizados. ComparaBici.es no se hace responsable de las condiciones de venta, disponibilidad o garantías aplicadas en páginas de terceros.
          </p>
        </section>

        {/* 5. Legislación Aplicable */}
        <section className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-3">
          <h2 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
            <Scale className="w-5 h-5 text-teal-600 shrink-0" />
            <span>5. Legislación Aplicable y Fuero</span>
          </h2>
          <p>
            Para la resolución de todas las controversias o cuestiones relacionadas con el presente sitio web o de las actividades en él desarrolladas, será de aplicación la <strong>legislación española</strong>, a la que se someten expresamente las partes, siendo competentes para la resolución de todos los conflictos derivados o relacionados con su uso los Juzgados y Tribunales competentes con arreglo a la normativa de consumidores y usuarios.
          </p>
          <div className="pt-2">
            <a
              href="mailto:contacto@comparabici.es"
              className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2.5 rounded-xl border border-teal-200 transition-colors"
            >
              <Mail className="w-4 h-4 text-teal-600" />
              <span>Contactar con el responsable: contacto@comparabici.es</span>
            </a>
          </div>
        </section>
      </div>
    </div>
  );
}
