import { Metadata } from "next";
import Link from "next/link";
import { constructMetadata } from "@/lib/seo/metadata";
import { ShieldCheck, Lock, ArrowLeft, Mail, CheckCircle2, UserCheck, Eye } from "lucide-react";

export const metadata: Metadata = constructMetadata({
  title: "Política de Privacidad y Protección de Datos",
  description:
    "Información sobre el tratamiento de datos de carácter personal conforme al RGPD (UE 2016/679) y la LOPDGDD en ComparaBici.es.",
  canonicalPath: "/politica-privacidad",
});

export default function PoliticaPrivacidadPage() {
  return (
    <div className="mx-auto max-w-4xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-8">
      {/* Breadcrumbs */}
      <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-teal-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Inicio
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold" aria-current="page">
          Política de Privacidad
        </span>
      </nav>

      {/* Header */}
      <header className="space-y-2 border-b border-slate-200 pb-6">
        <div className="inline-flex items-center gap-2 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 border border-teal-200">
          <Lock className="w-3.5 h-3.5 text-teal-600" />
          <span>Protección de Datos RGPD & LOPDGDD</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-slate-950">
          Política de Privacidad
        </h1>
        <p className="text-xs sm:text-sm text-slate-500">
          Última actualización: Septiembre de 2026 · Conforme al Reglamento General de Protección de Datos (UE 2016/679) y la Ley Orgánica 3/2018 (LOPDGDD).
        </p>
      </header>

      {/* Content */}
      <div className="prose prose-slate max-w-none text-xs sm:text-sm leading-relaxed text-slate-700 space-y-6">
        {/* 1. Responsable */}
        <section className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-3">
          <h2 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
            <UserCheck className="w-5 h-5 text-teal-600 shrink-0" />
            <span>1. Responsable del Tratamiento de Datos</span>
          </h2>
          <p>
            El responsable del tratamiento de los datos personales recabados a través de este sitio web es el equipo editorial y técnico de <strong>ComparaBici.es</strong>:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-800 font-medium">
            <li><strong>Sitio web:</strong> <Link href="/" className="text-teal-600 hover:underline">https://comparabici.es</Link></li>
            <li><strong>Email de contacto en materia de privacidad:</strong> <a href="mailto:contacto@comparabici.es" className="text-teal-600 font-bold hover:underline">contacto@comparabici.es</a></li>
          </ul>
        </section>

        {/* 2. Datos recopilados y finalidad */}
        <section className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-3">
          <h2 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
            <Eye className="w-5 h-5 text-teal-600 shrink-0" />
            <span>2. Datos que se Recopilan y Finalidad del Tratamiento</span>
          </h2>
          <p>
            ComparaBici.es aplica el principio de <strong>minimización de datos</strong>. No solicitamos registro de usuario para comparar bicicletas ni solicitamos datos personales bancarios o de facturación:
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">📧 Consultas y Correos de Contacto</h3>
              <p className="text-xs text-slate-600">
                Cuando el usuario escribe a <span className="font-semibold text-slate-800">contacto@comparabici.es</span>, su dirección de correo y nombre se emplean exclusivamente para responder a su duda, sugerencia o propuesta.
              </p>
            </div>
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <h3 className="font-bold text-slate-900 text-xs sm:text-sm">💻 Almacenamiento Local (LocalStorage)</h3>
              <p className="text-xs text-slate-600">
                Las bicicletas añadidas al comparador se guardan en el almacenamiento local del dispositivo del usuario. Estos datos nunca salen de su navegador ni se asocian a identidades personales.
              </p>
            </div>
          </div>
        </section>

        {/* 3. Base Jurídica */}
        <section className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-3">
          <h2 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
            <span>3. Base Jurídica del Tratamiento</span>
          </h2>
          <ul className="list-disc pl-5 space-y-2 text-slate-700">
            <li>
              <strong>Consentimiento del interesado (Art. 6.1.a RGPD):</strong> Al enviar voluntariamente un correo electrónico a nuestro buzón de contacto.
            </li>
            <li>
              <strong>Interés legítimo (Art. 6.1.f RGPD):</strong> Para garantizar la seguridad de la infraestructura tecnológica y prevenir accesos no autorizados o ataques informáticos.
            </li>
          </ul>
        </section>

        {/* 4. Cesión y Conservación */}
        <section className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-3">
          <h2 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-teal-600 shrink-0" />
            <span>4. Destinatarios y Plazo de Conservación</span>
          </h2>
          <p>
            <strong>No vendemos, alquilamos ni cedemos datos de carácter personal a terceros.</strong>
          </p>
          <p>
            Los datos facilitados por correo electrónico se conservarán durante el tiempo imprescindible para tramitar y responder la consulta del usuario, tras lo cual se procederá a su supresión salvo que exista una obligación legal de conservación.
          </p>
        </section>

        {/* 5. Derechos del Usuario */}
        <section className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200/90 shadow-2xs space-y-3">
          <h2 className="text-base sm:text-lg font-black text-slate-950 flex items-center gap-2">
            <Lock className="w-5 h-5 text-teal-600 shrink-0" />
            <span>5. Derechos de los Usuarios (Derechos ARCO+)</span>
          </h2>
          <p>
            El usuario puede ejercer en cualquier momento sus derechos de:
          </p>
          <ul className="list-disc pl-5 space-y-1 text-slate-700">
            <li><strong>Acceso:</strong> Saber qué datos se están tratando.</li>
            <li><strong>Rectificación:</strong> Solicitar la modificación de datos inexactos.</li>
            <li><strong>Supresión:</strong> Solicitar la eliminación de sus datos cuando ya no sean necesarios.</li>
            <li><strong>Limitación y Oposición:</strong> Solicitar que se limite u oponerse al tratamiento de sus datos.</li>
            <li><strong>Portabilidad:</strong> Obtener sus datos en formato estructurado de uso común.</li>
          </ul>
          <p className="pt-2">
            Para ejercer cualquiera de estos derechos, el interesado puede remitir una solicitud por correo electrónico a:
          </p>
          <div>
            <a
              href="mailto:contacto@comparabici.es?subject=Ejercicio%20Derechos%20Proteccion%20de%20Datos"
              className="inline-flex items-center gap-2 text-xs font-bold text-teal-700 bg-teal-50 hover:bg-teal-100 px-4 py-2.5 rounded-xl border border-teal-200 transition-colors"
            >
              <Mail className="w-4 h-4 text-teal-600" />
              <span>contacto@comparabici.es (Asunto: Ejercicio de Derechos)</span>
            </a>
          </div>
          <p className="text-xs text-slate-500 pt-2">
            Asimismo, el usuario tiene derecho a presentar una reclamación ante la autoridad de control en materia de protección de datos, la <strong>Agencia Española de Protección de Datos (AEPD)</strong> en <a href="https://www.aepd.es" target="_blank" rel="noopener noreferrer" className="text-teal-600 hover:underline">www.aepd.es</a>.
          </p>
        </section>
      </div>
    </div>
  );
}
