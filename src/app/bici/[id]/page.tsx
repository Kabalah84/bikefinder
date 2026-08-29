import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getAllBikes, getBikeById, getBikesByDiscipline } from "@/lib/data/bikes";
import {
  formatCurrencyEur,
  formatDisciplineName,
  formatMaterialName,
  formatWeight,
} from "@/lib/utils/formatters";
import { analyzeGearRatio } from "@/lib/utils/gear-calculator";
import { analyzePosture } from "@/lib/utils/geometry-analysis";
import { BikeCard } from "@/components/catalog/BikeCard";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateProductSchema, generateBreadcrumbsSchema } from "@/lib/seo/schema";
import { constructMetadata } from "@/lib/seo/metadata";
import { sanitizeExternalUrl } from "@/lib/utils/security";
import {
  ExternalLink,
  ShieldCheck,
  Zap,
  Cog,
  Sparkles,
  TrendingUp,
  Layers,
  CheckCircle2,
  Flame,
  ArrowLeft,
} from "lucide-react";

interface BikePageProps {
  params: {
    id: string;
  };
}

export function generateStaticParams() {
  const bikes = getAllBikes();
  return bikes.map((bike) => ({
    id: bike.id,
  }));
}

export function generateMetadata({ params }: BikePageProps): Metadata {
  const bike = getBikeById(params.id);
  if (!bike) {
    return constructMetadata({
      title: "Bicicleta no encontrada",
      description: "La ficha técnica solicitada no está disponible en el catálogo de BikeFinder.es.",
      noIndex: true,
    });
  }

  const discipline = formatDisciplineName(bike.discipline);
  const title = `${bike.brand} ${bike.model} (${bike.year}) · Ficha Técnica y Precio Oficial`;
  const description = `Especificaciones oficiales de la ${bike.brand} ${bike.model} de ${discipline}: peso ${bike.weightKg ? `${bike.weightKg} kg` : "oficial"}, paso de rueda ${bike.maxTireClearanceMm} mm, grupo ${bike.groupset.name} (${bike.groupset.isElectronic ? "electrónico" : "mecánico"}) y PVP oficial ${bike.currentPriceEur} €. Enlace directo al fabricante.`;

  return constructMetadata({
    title,
    description,
    canonicalPath: `/bici/${bike.id}`,
    ogImage: bike.officialImageUrl,
    ogType: "article",
    keywords: [
      `${bike.brand.toLowerCase()} ${bike.model.toLowerCase()}`,
      `${bike.brand.toLowerCase()} ${bike.year}`,
      `peso ${bike.brand.toLowerCase()} ${bike.model.toLowerCase()}`,
      `paso de rueda ${bike.model.toLowerCase()}`,
      `${bike.groupset.name.toLowerCase()}`,
      `bicicleta ${discipline.toLowerCase()}`,
    ],
  });
}

export default function BikeDetailPage({ params }: BikePageProps) {
  const bike = getBikeById(params.id);

  if (!bike) {
    notFound();
  }

  const gearRatio = analyzeGearRatio(
    bike.groupset.chainrings,
    bike.groupset.cassette,
    bike.groupset.minGearRatio,
    bike.groupset.maxGearRatio
  );

  const posture = analyzePosture(bike.geometry.stackReachRatio);

  const relatedBikes = getBikesByDiscipline(bike.discipline)
    .filter((b) => b.id !== bike.id)
    .slice(0, 3);

  // JSON-LD Structured Data
  const productSchema = generateProductSchema(bike);
  const breadcrumbsSchema = generateBreadcrumbsSchema([
    { name: "Inicio", url: "/" },
    { name: formatDisciplineName(bike.discipline), url: `/?discipline=${bike.discipline}` },
    { name: `${bike.brand} ${bike.model}`, url: `/bici/${bike.id}` },
  ]);

  return (
    <article className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 space-y-10">
      {/* Schema JSON-LD */}
      <JsonLd data={[productSchema, breadcrumbsSchema]} />

      {/* Breadcrumb & Navigation */}
      <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-teal-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Catálogo
        </Link>
        <span>/</span>
        <Link href={`/?discipline=${bike.discipline}`} className="hover:text-teal-600">
          {formatDisciplineName(bike.discipline)}
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold" aria-current="page">
          {bike.brand} {bike.model}
        </span>
      </nav>

      {/* Hero Product Overview */}
      <section aria-label="Resumen del producto" className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left: Image Showcase */}
        <div className="lg:col-span-7 space-y-4">
          <div className="relative aspect-[16/10] w-full overflow-hidden rounded-3xl bg-slate-100 border border-slate-200 shadow-md">
            <img
              src={bike.officialImageUrl}
              alt={`Bicicleta ${bike.brand} ${bike.model} (${bike.year}) de ${formatDisciplineName(bike.discipline)} - Vista oficial`}
              className="h-full w-full object-cover"
            />
            {bike.discountPercentage && bike.discountPercentage > 0 && (
              <div className="absolute top-4 right-4 flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-1 text-xs font-black text-white shadow-md">
                <Flame className="w-4 h-4" />
                <span>OFERTA -{bike.discountPercentage}%</span>
              </div>
            )}
          </div>

          <div className="p-4 rounded-2xl bg-white border border-slate-200 flex items-center justify-between text-xs text-slate-500">
            <span className="flex items-center gap-1.5 font-medium">
              <ShieldCheck className="w-4 h-4 text-emerald-600" />
              Especificaciones verificadas en catálogo oficial del fabricante
            </span>
            <span className="font-bold text-slate-700">Gama {bike.year}</span>
          </div>
        </div>

        {/* Right: Key Info, Price & Actions */}
        <div className="lg:col-span-5 space-y-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="rounded-lg bg-teal-100 text-teal-900 px-2.5 py-0.5 text-xs font-bold border border-teal-200">
                {formatDisciplineName(bike.discipline)}
              </span>
              <span className="text-xs font-bold uppercase tracking-wider text-slate-500">
                {bike.brand}
              </span>
            </div>
            <h1 className="text-2xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
              {bike.model}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 font-medium mt-1">
              {bike.groupset.name} · {bike.groupset.chainrings}
            </p>
          </div>

          {/* Pricing Box */}
          <div className="p-5 rounded-2xl bg-slate-900 text-white shadow-lg space-y-4">
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 block mb-0.5">
                  Precio Oficial Actual
                </span>
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-black text-white">
                    {formatCurrencyEur(bike.currentPriceEur)}
                  </span>
                  {bike.msrpEur > bike.currentPriceEur && (
                    <span className="text-sm text-slate-400 line-through">
                      {formatCurrencyEur(bike.msrpEur)}
                    </span>
                  )}
                </div>
              </div>
              <span className="text-[11px] font-bold text-emerald-400 bg-emerald-950/80 px-2.5 py-1 rounded-lg border border-emerald-500/30">
                Web Oficial {bike.brand}
              </span>
            </div>

            {/* Official Button */}
            <a
              href={sanitizeExternalUrl(bike.officialUrl)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-teal-500 py-3.5 px-4 text-sm font-bold text-slate-950 hover:bg-teal-400 transition-colors shadow-md"
            >
              <span>Ver y Configurar en {bike.brand} Oficial</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <div className="text-[11px] text-slate-400 text-center">
              Enlace directo al fabricante oficial · Consulta stock y tallas disponibles
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-3 gap-2 p-3 rounded-2xl bg-white border border-slate-200 text-center">
            <div className="p-2">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                Paso Rueda
              </span>
              <span className="text-base font-extrabold text-teal-700">
                {bike.maxTireClearanceMm} mm
              </span>
            </div>
            <div className="p-2 border-x border-slate-100">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                Peso Oficial
              </span>
              <span className="text-base font-extrabold text-slate-900">
                {bike.weightKg ? `${bike.weightKg} kg` : "N/D"}
              </span>
            </div>
            <div className="p-2">
              <span className="text-[10px] font-bold uppercase text-slate-500 block mb-0.5">
                Cambio
              </span>
              <span className="text-xs font-bold text-slate-900 flex items-center justify-center gap-1 mt-1">
                {bike.groupset.isElectronic ? (
                  <>
                    <Zap className="w-3.5 h-3.5 text-teal-600" /> Di2/AXS
                  </>
                ) : (
                  <>
                    <Cog className="w-3.5 h-3.5 text-slate-500" /> {bike.groupset.speedCount}v Mec
                  </>
                )}
              </span>
            </div>
          </div>

          {/* Highlights */}
          {bike.highlights && bike.highlights.length > 0 && (
            <div className="p-5 rounded-2xl bg-white border border-slate-200 space-y-2.5">
              <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-teal-600" />
                Puntos Fuertes Destacados
              </h2>
              <ul className="space-y-2 text-xs sm:text-sm text-slate-700">
                {bike.highlights.map((h, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <CheckCircle2 className="w-4 h-4 text-teal-600 shrink-0 mt-0.5" />
                    <span>{h}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Technical Deep Dive: Gear Ratios & Geometry */}
      <section aria-label="Análisis técnico y geometría" className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Gear Calculator & Ratio Analysis */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-teal-600" />
              Análisis de Desarrollos y Ratios
            </h2>
            <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-lg">
              {gearRatio.chainringType}
            </span>
          </div>

          <p className="text-xs text-slate-600">
            Los ratios de desarrollo determinan qué tan fácil es pedalear cuesta arriba y cuánta velocidad puedes mantener en el llano sin quedarte sin cadencia.
          </p>

          <div className="grid grid-cols-2 gap-4">
            {/* Climbing Ratio */}
            <div className="p-4 rounded-2xl bg-teal-50/80 border border-teal-200">
              <span className="text-xs font-bold text-teal-900 uppercase block mb-1">
                Ratio Mínimo (Subida)
              </span>
              <div className="text-2xl font-black text-teal-950 mb-1">
                {bike.groupset.minGearRatio.toFixed(2)}
              </div>
              <span className="text-xs font-bold text-teal-800 block mb-1">
                {gearRatio.climbingBadge.label}
              </span>
              <p className="text-[11px] text-teal-700 leading-tight">
                {gearRatio.climbingBadge.description}
              </p>
            </div>

            {/* Sprint Ratio */}
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200">
              <span className="text-xs font-bold text-slate-700 uppercase block mb-1">
                Ratio Máximo (Llano)
              </span>
              <div className="text-2xl font-black text-slate-900 mb-1">
                {bike.groupset.maxGearRatio.toFixed(2)}
              </div>
              <span className="text-xs font-bold text-slate-800 block mb-1">
                {gearRatio.sprintBadge.label}
              </span>
              <p className="text-[11px] text-slate-500 leading-tight">
                {gearRatio.sprintBadge.description}
              </p>
            </div>
          </div>

          <div className="text-xs text-slate-500 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span>Platos: <strong>{bike.groupset.chainrings}</strong></span>
            <span>Cassette: <strong>{bike.groupset.cassette}</strong></span>
          </div>
        </div>

        {/* Geometry & Posture Analyzer */}
        <div className="rounded-3xl bg-white p-6 border border-slate-200 shadow-xs space-y-5">
          <div className="flex items-center justify-between pb-3 border-b border-slate-100">
            <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
              <Layers className="w-5 h-5 text-teal-600" />
              Geometría y Postura (Talla M)
            </h2>
            <span
              className={`text-xs font-bold px-2.5 py-0.5 rounded-lg border ${posture.badgeColor}`}
            >
              {posture.badgeLabel}
            </span>
          </div>

          <p className="text-xs text-slate-600">
            El ratio <strong>Stack / Reach</strong> define la posición del cuerpo sobre la bicicleta: &gt;1.50 favorece la comodidad lumbar en salidas largas, mientras que &lt;1.45 optimiza la aerodinámica para competir.
          </p>

          <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700">Ratio Stack / Reach Oficial:</span>
              <span className="text-lg font-black text-slate-900">
                {bike.geometry.stackReachRatio.toFixed(2)}
              </span>
            </div>
            <p className="text-xs text-slate-600 leading-relaxed">
              {posture.description}
            </p>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-center">
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Stack</span>
              <span className="text-xs font-bold text-slate-900">{bike.geometry.stackMm} mm</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Reach</span>
              <span className="text-xs font-bold text-slate-900">{bike.geometry.reachMm} mm</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Ángulo Dirección</span>
              <span className="text-xs font-bold text-slate-900">{bike.geometry.headTubeAngleDeg}°</span>
            </div>
            <div className="p-2 rounded-xl bg-slate-50 border border-slate-100">
              <span className="text-[10px] text-slate-500 block">Vainas</span>
              <span className="text-xs font-bold text-slate-900">{bike.geometry.chainstayLengthMm} mm</span>
            </div>
          </div>
        </div>
      </section>

      {/* Full Specs Table */}
      <section aria-label="Ficha técnica detallada" className="rounded-3xl bg-white p-6 sm:p-8 border border-slate-200 shadow-xs space-y-6">
        <h2 className="text-lg font-bold text-slate-900 pb-3 border-b border-slate-100">
          Ficha Técnica Detallada
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-12 gap-y-4 text-xs sm:text-sm">
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-500">Fabricante</span>
            <span className="font-bold text-slate-900">{bike.brand}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-500">Modelo</span>
            <span className="font-bold text-slate-900">{bike.model}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-500">Año de Gama</span>
            <span className="font-bold text-slate-900">{bike.year}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-500">Disciplina</span>
            <span className="font-bold text-slate-900">{formatDisciplineName(bike.discipline)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-500">Material Cuadro</span>
            <span className="font-bold text-slate-900">{formatMaterialName(bike.frameMaterial)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-500">Horquilla</span>
            <span className="font-bold text-slate-900">{formatMaterialName(bike.forkMaterial)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-500">Paso de Rueda Máximo</span>
            <span className="font-bold text-teal-700">{bike.maxTireClearanceMm} mm</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-500">Peso Oficial Declarado</span>
            <span className="font-bold text-slate-900">{formatWeight(bike.weightKg, bike.weightSizeReference)}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-500">Grupo de Transmisión</span>
            <span className="font-bold text-slate-900">{bike.groupset.name}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-500">Tipo de Cambio</span>
            <span className="font-bold text-slate-900">
              {bike.groupset.isElectronic ? "Electrónico Inalámbrico Di2/AXS" : `Mecánico ${bike.groupset.speedCount} Velocidades`}
            </span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-500">Ruedas</span>
            <span className="font-bold text-slate-900">{bike.wheels || "Ruedas Tubeless Ready"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-500">Cubiertas</span>
            <span className="font-bold text-slate-900">{bike.tires || "Cubiertas tubeless"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-500">Frenos</span>
            <span className="font-bold text-slate-900">{bike.brakes || "Discos hidráulicos"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-500">Cockpit Integrado</span>
            <span className="font-bold text-slate-900">{bike.integratedCockpit ? "Sí, 100% Interno" : "Semi-integrado"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-500">Soportes Bikepacking</span>
            <span className="font-bold text-slate-900">{bike.bikepackingMounts ? "Sí (Cuadro + Horquilla)" : "No"}</span>
          </div>
          <div className="flex justify-between py-2 border-b border-slate-100">
            <span className="font-semibold text-slate-500">PVP Oficial / Precio Actual</span>
            <span className="font-bold text-slate-900">{formatCurrencyEur(bike.currentPriceEur)}</span>
          </div>
        </div>
      </section>

      {/* Related Bikes in Same Category */}
      {relatedBikes.length > 0 && (
        <section aria-label="Modelos alternativos" className="space-y-4 pt-6">
          <h2 className="text-xl font-extrabold text-slate-900">
            Modelos Alternativos en {formatDisciplineName(bike.discipline)}
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedBikes.map((relBike) => (
              <BikeCard key={relBike.id} bike={relBike} />
            ))}
          </div>
        </section>
      )}
    </article>
  );
}
