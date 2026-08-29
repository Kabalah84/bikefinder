import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getBikeById } from "@/lib/data/bikes";
import { POPULAR_DUELS, getDuelBySlug } from "@/lib/data/duels";
import { ComparisonTable } from "@/components/comparator/ComparisonTable";
import { formatCurrencyEur } from "@/lib/utils/formatters";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateArticleComparisonSchema, generateBreadcrumbsSchema } from "@/lib/seo/schema";
import { constructMetadata } from "@/lib/seo/metadata";
import {
  Scale,
  ArrowLeft,
  Sparkles,
} from "lucide-react";

export function generateStaticParams() {
  return POPULAR_DUELS.map((d) => ({
    slug: d.slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const duel = getDuelBySlug(params.slug);
  if (!duel) {
    return constructMetadata({
      title: "Comparativa de Bicicletas no encontrada",
      description: "La comparativa solicitada no existe o ha sido trasladada.",
      noIndex: true,
    });
  }

  const bikeA = getBikeById(duel.bikeIdA);
  const bikeB = getBikeById(duel.bikeIdB);
  const image = bikeA?.officialImageUrl || bikeB?.officialImageUrl;

  return constructMetadata({
    title: duel.title,
    description: duel.summary,
    canonicalPath: `/comparativa/${duel.slug}`,
    ogImage: image,
    ogType: "article",
    keywords: [
      "comparativa bicicletas",
      "duelo ciclista",
      `${bikeA?.brand.toLowerCase()} vs ${bikeB?.brand.toLowerCase()}`,
      `${bikeA?.model.toLowerCase()}`,
      `${bikeB?.model.toLowerCase()}`,
      "confrontación técnica bicicletas",
    ],
  });
}

export default function DueloPage({ params }: { params: { slug: string } }) {
  const duel = getDuelBySlug(params.slug);

  if (!duel) {
    notFound();
  }

  const bikeA = getBikeById(duel.bikeIdA);
  const bikeB = getBikeById(duel.bikeIdB);

  if (!bikeA || !bikeB) {
    notFound();
  }

  // Generar veredicto técnico automático
  const priceDiff = Math.abs(bikeA.currentPriceEur - bikeB.currentPriceEur);
  const cheaperBike = bikeA.currentPriceEur < bikeB.currentPriceEur ? bikeA : bikeB;
  const lighterBike =
    bikeA.weightKg && bikeB.weightKg
      ? bikeA.weightKg < bikeB.weightKg
        ? bikeA
        : bikeB
      : null;
  const higherClearanceBike =
    bikeA.maxTireClearanceMm > bikeB.maxTireClearanceMm
      ? bikeA
      : bikeA.maxTireClearanceMm < bikeB.maxTireClearanceMm
      ? bikeB
      : null;

  // JSON-LD Structured Data
  const articleSchema = generateArticleComparisonSchema({
    title: duel.title,
    summary: duel.summary,
    slug: duel.slug,
    bikeA,
    bikeB,
  });

  const breadcrumbsSchema = generateBreadcrumbsSchema([
    { name: "Inicio", url: "/" },
    { name: "Comparador", url: "/comparador" },
    { name: `${bikeA.brand} vs ${bikeB.brand}`, url: `/comparativa/${duel.slug}` },
  ]);

  return (
    <article className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      {/* Schema JSON-LD */}
      <JsonLd data={[articleSchema, breadcrumbsSchema]} />

      {/* Breadcrumbs */}
      <nav aria-label="Ruta de navegación" className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-teal-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Catálogo
        </Link>
        <span>/</span>
        <Link href="/comparador" className="hover:text-teal-600">
          Comparador
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold" aria-current="page">
          {bikeA.brand} vs {bikeB.brand}
        </span>
      </nav>

      {/* Header */}
      <header className="space-y-3">
        <div className="inline-flex items-center gap-1.5 rounded-full bg-teal-50 px-3 py-1 text-xs font-bold text-teal-800 border border-teal-200">
          <Scale className="w-3.5 h-3.5 text-teal-600" />
          <span>Duelo Técnico 1v1</span>
        </div>
        <h1 className="text-2xl sm:text-4xl font-black text-slate-900 tracking-tight">
          {duel.title}
        </h1>
        <p className="text-xs sm:text-sm text-slate-600 max-w-3xl leading-relaxed">
          {duel.summary}
        </p>
      </header>

      {/* Tarjeta de Veredicto Rápido */}
      <section aria-label="Veredicto técnico" className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
          <Sparkles className="w-4 h-4" />
          <h2 className="text-xs font-bold uppercase tracking-wider text-teal-400">Veredicto Técnico BikeFinder</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
          {/* Precio */}
          <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1">
            <span className="text-xs text-slate-300 font-medium">Ventaja en Precio:</span>
            <p className="text-sm font-bold text-white">
              {cheaperBike.brand} {cheaperBike.model}
            </p>
            <span className="text-xs text-emerald-400 font-semibold">
              Cuesta {priceDiff.toLocaleString("es-ES")} € menos ({formatCurrencyEur(cheaperBike.currentPriceEur)})
            </span>
          </div>

          {/* Peso */}
          {lighterBike && (
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1">
              <span className="text-xs text-slate-300 font-medium">Ventaja en Ligereza:</span>
              <p className="text-sm font-bold text-white">
                {lighterBike.brand} {lighterBike.model}
              </p>
              <span className="text-xs text-sky-400 font-semibold">
                {lighterBike.weightKg} kg oficial
              </span>
            </div>
          )}

          {/* Paso de Rueda */}
          {higherClearanceBike ? (
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1">
              <span className="text-xs text-slate-300 font-medium">Mayor Paso de Rueda:</span>
              <p className="text-sm font-bold text-white">
                {higherClearanceBike.brand} {higherClearanceBike.model}
              </p>
              <span className="text-xs text-amber-400 font-semibold">
                Hasta {higherClearanceBike.maxTireClearanceMm} mm
              </span>
            </div>
          ) : (
            <div className="p-4 rounded-2xl bg-white/10 backdrop-blur-xs border border-white/10 space-y-1">
              <span className="text-xs text-slate-300 font-medium">Paso de Rueda:</span>
              <p className="text-sm font-bold text-white">Empate Técnico</p>
              <span className="text-xs text-teal-400 font-semibold">
                Ambas admiten {bikeA.maxTireClearanceMm} mm
              </span>
            </div>
          )}
        </div>
      </section>

      {/* Tabla Comparativa 1v1 */}
      <section aria-label="Tabla comparativa de especificaciones">
        <ComparisonTable bikes={[bikeA, bikeB]} />
      </section>

      {/* Otros Duelos Populares */}
      <section aria-label="Otras comparativas recomendadas" className="pt-8 border-t border-slate-200 space-y-4">
        <h2 className="text-lg font-bold text-slate-900">Otras comparativas populares:</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {POPULAR_DUELS.filter((d) => d.slug !== duel.slug).map((d) => (
            <Link
              key={d.slug}
              href={`/comparativa/${d.slug}`}
              className="p-4 rounded-2xl bg-white border border-slate-200 hover:border-teal-500 hover:shadow-xs transition-all text-xs font-bold text-slate-800 flex items-center justify-between group"
            >
              <span className="line-clamp-1">{d.title.split(":")[0]}</span>
              <span className="text-teal-600 group-hover:translate-x-1 transition-transform">→</span>
            </Link>
          ))}
        </div>
      </section>
    </article>
  );
}
