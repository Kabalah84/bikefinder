import { Metadata } from "next";
import { getAllBikes, getAllBrands, getAllCategories } from "@/lib/data/bikes";
import { CatalogView } from "@/components/catalog/CatalogView";
import { Discipline } from "@/lib/schema/bike";
import { JsonLd } from "@/components/seo/JsonLd";
import { generateBreadcrumbsSchema } from "@/lib/seo/schema";
import { constructMetadata, SITE_CONFIG } from "@/lib/seo/metadata";
import {
  Compass,
  Zap,
  Flame,
  ShieldCheck,
  Scale,
  Sparkles,
  Mountain,
  CheckCircle2,
  ChevronRight,
  Layers,
  Activity,
} from "lucide-react";
import Link from "next/link";

export const runtime = "edge";

interface PageProps {
  searchParams: {
    discipline?: string;
    brand?: string;
  };
}

export function generateMetadata({ searchParams }: PageProps): Metadata {
  const bikes = getAllBikes();
  const brandSet = new Set(bikes.map((b) => b.brand));
  const brands = Array.from(brandSet);

  const discipline = searchParams.discipline as Discipline | undefined;
  const categories = getAllCategories();
  const currentCategory = categories.find((c) => c.id === discipline);

  const brandParam = searchParams.brand;
  const brandMatch = brandParam
    ? brands.find((b) => b.toLowerCase() === brandParam.toLowerCase())
    : undefined;

  // 1. Meta para combinación Disciplina + Marca
  if (currentCategory && brandMatch) {
    return constructMetadata({
      title: `Bicicletas ${brandMatch} de ${currentCategory.name} · Fichas y Precios Oficiales`,
      description: `Gama oficial ${brandMatch} en ${currentCategory.name} (${currentCategory.targetClearanceRange}). Consulta pesos reales, paso de rueda, transmisión y precio de catálogo del fabricante.`,
      canonicalPath: `/?discipline=${discipline}&brand=${brandParam!.toLowerCase()}`,
      keywords: [
        `${brandMatch.toLowerCase()} ${currentCategory.name.toLowerCase()}`,
        `bicicletas ${brandMatch.toLowerCase()} ${currentCategory.name.toLowerCase()}`,
        "comparador bicicletas",
        brandMatch.toLowerCase(),
      ],
    });
  }

  // 2. Meta para Marca
  if (brandMatch) {
    return constructMetadata({
      title: `Bicicletas ${brandMatch} · Catálogo Oficial, Modelos y Precios`,
      description: `Compara especificaciones oficiales de bicicletas ${brandMatch}: modelos de carretera, gravel y montaña, pesos reales en báscula, suspensiones y PVP oficial sin intermediarios.`,
      canonicalPath: `/?brand=${brandParam!.toLowerCase()}`,
      keywords: [
        brandMatch.toLowerCase(),
        `bicicletas ${brandMatch.toLowerCase()}`,
        `catalogo ${brandMatch.toLowerCase()}`,
        `precios ${brandMatch.toLowerCase()}`,
        "comparador bicicletas",
      ],
    });
  }

  // 3. Meta para Disciplina
  if (currentCategory) {
    return constructMetadata({
      title: `Bicicletas de ${currentCategory.name} · Catálogo y Comparador Oficial`,
      description: `Compara bicicletas de ${currentCategory.name} (${currentCategory.targetClearanceRange}). Pesos reales, paso de rueda máximo, suspensiones, desarrollos y PVP oficial de primeras marcas.`,
      canonicalPath: `/?discipline=${discipline}`,
      keywords: [
        `${currentCategory.name.toLowerCase()}`,
        `bicicletas ${currentCategory.name.toLowerCase()}`,
        "comparador bicicletas",
        "paso de rueda",
        "tire clearance",
      ],
    });
  }

  // 4. Meta Default Home
  return constructMetadata({
    title: "Buscador y Comparador de Bicicletas de Carretera, Gravel y Montaña",
    description:
      "Compara especificaciones oficiales reales de más de 800 bicicletas: pesos en báscula, suspensiones rígidas y dobles, e-bikes, grupos Di2/AXS, ratios de desarrollo y tablas de geometría sin intermediarios.",
    canonicalPath: "/",
  });
}

export default function HomePage({ searchParams }: PageProps) {
  const bikes = getAllBikes();
  const brandSet = new Set(bikes.map((b) => b.brand));
  const brands = Array.from(brandSet).sort();
  const categories = getAllCategories();

  const selectedDiscipline = searchParams.discipline as Discipline | undefined;
  const activeCategory = categories.find((c) => c.id === selectedDiscipline);

  const brandParam = searchParams.brand;
  const brandMatch = brandParam
    ? brands.find((b) => b.toLowerCase() === brandParam.toLowerCase())
    : undefined;

  // Conteo dinámico de modelos por categoría
  const countByDiscipline = bikes.reduce<Record<string, number>>((acc, bike) => {
    acc[bike.discipline] = (acc[bike.discipline] || 0) + 1;
    return acc;
  }, {});

  // Breadcrumbs dinámicos
  const breadcrumbItems: { name: string; url?: string }[] = [{ name: "Inicio", url: "/" }];
  if (activeCategory) {
    breadcrumbItems.push({
      name: activeCategory.name,
      url: `/?discipline=${activeCategory.id}`,
    });
  }
  if (brandMatch) {
    breadcrumbItems.push({
      name: brandMatch,
      url: activeCategory
        ? `/?discipline=${activeCategory.id}&brand=${brandMatch.toLowerCase()}`
        : `/?brand=${brandMatch.toLowerCase()}`,
    });
  }

  const breadcrumbsSchema = generateBreadcrumbsSchema(breadcrumbItems);

  const itemListSchema = {
    "@context": "https://schema.org",
    "@type": "ItemList",
    itemListElement: bikes.slice(0, 10).map((bike, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: `${bike.brand} ${bike.model} (${bike.year})`,
      url: `${SITE_CONFIG.baseUrl}/bici/${bike.id}`,
    })),
  };

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-5 sm:pt-8 space-y-8">
      {/* JSON-LD Structured Data */}
      <JsonLd data={[breadcrumbsSchema, itemListSchema]} />

      {/* Hero Section "Pro Performance" */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#060a13] via-[#091122] to-[#041a1a] p-6 sm:p-10 lg:p-12 text-white shadow-2xl border border-slate-800/80">
        {/* Subtle radial ambient grid aura */}
        <div className="absolute -right-24 -top-24 h-96 w-96 rounded-full bg-teal-500/15 blur-3xl pointer-events-none" />
        <div className="absolute right-1/3 -bottom-24 h-80 w-80 rounded-full bg-emerald-500/10 blur-3xl pointer-events-none" />
        <div className="absolute left-1/4 top-1/2 h-64 w-64 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />

        <div className="relative z-10 max-w-3xl space-y-5">
          {/* Top Pill Tag */}
          <div className="inline-flex items-center gap-2 rounded-full bg-slate-900/90 px-3.5 py-1.5 text-xs font-bold text-teal-300 border border-teal-500/30 shadow-inner backdrop-blur-md">
            <span className="flex h-2 w-2 rounded-full bg-teal-400 animate-pulse" />
            <span>Índice Técnico Oficial de Ciclismo · Temporadas 2025 – 2027</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-[1.1] text-white">
            El comparador definitivo de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-emerald-300 to-cyan-200">
              Carretera, Gravel y Montaña
            </span>
          </h1>

          {/* Copy */}
          <p className="text-xs sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Sin intermediarios ni comisiones de Amazon. Confronta pesos reales en báscula,
            pasos de rueda al milímetro, suspensiones rígidas y dobles, e-bikes y geometrías
            Stack/Reach de los mayores fabricantes del mundo.
          </p>

          {/* Live Metrics Grid */}
          <div className="grid grid-cols-3 gap-3 pt-2 max-w-lg">
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3 backdrop-blur-xs">
              <span className="block text-xl sm:text-2xl font-black text-teal-400">
                {bikes.length}+
              </span>
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Bicis Analizadas
              </span>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3 backdrop-blur-xs">
              <span className="block text-xl sm:text-2xl font-black text-emerald-400">
                {brands.length}
              </span>
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Marcas Oficiales
              </span>
            </div>
            <div className="rounded-2xl bg-white/5 border border-white/10 p-3 backdrop-blur-xs">
              <span className="block text-xl sm:text-2xl font-black text-amber-400">
                100%
              </span>
              <span className="text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                Datos Verificados
              </span>
            </div>
          </div>

          {/* Value Badges */}
          <div className="pt-1 flex flex-wrap items-center gap-x-5 gap-y-2 text-xs font-semibold text-slate-300">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-teal-400" />
              <span>Enlaces a webs oficiales</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Cálculo automático ratio subida</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-amber-400" />
              <span>Filtro E-Bikes y Suspensión</span>
            </div>
          </div>
        </div>
      </section>

      {/* Category Cards Selector (Refined Glassmorphic) */}
      <section aria-label="Categorías de bicicletas">
        <div className="flex items-center justify-between mb-3 px-1">
          <h2 className="text-xs font-black uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
            <Layers className="w-3.5 h-3.5 text-slate-500" />
            <span>Explorar por Disciplina</span>
          </h2>
          {(selectedDiscipline || brandMatch) && (
            <Link
              href="/"
              className="text-xs font-bold text-teal-600 hover:text-teal-700 hover:underline"
            >
              Ver todas ({bikes.length})
            </Link>
          )}
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {categories.map((cat) => {
            const isActive = selectedDiscipline === cat.id;
            const count = countByDiscipline[cat.id] || 0;

            const getCatAccent = () => {
              switch (cat.id) {
                case "gravel":
                  return {
                    icon: <Compass className="w-4 h-4 text-amber-500" />,
                    tagBg: "bg-amber-50 text-amber-900 border-amber-200",
                    borderActive: "border-amber-500 ring-2 ring-amber-500/20",
                  };
                case "road_endurance":
                  return {
                    icon: <Zap className="w-4 h-4 text-sky-500" />,
                    tagBg: "bg-sky-50 text-sky-900 border-sky-200",
                    borderActive: "border-sky-500 ring-2 ring-sky-500/20",
                  };
                case "road_race":
                  return {
                    icon: <Flame className="w-4 h-4 text-rose-500" />,
                    tagBg: "bg-rose-50 text-rose-900 border-rose-200",
                    borderActive: "border-rose-500 ring-2 ring-rose-500/20",
                  };
                case "mtb":
                  return {
                    icon: <Mountain className="w-4 h-4 text-purple-500" />,
                    tagBg: "bg-purple-50 text-purple-900 border-purple-200",
                    borderActive: "border-purple-500 ring-2 ring-purple-500/20",
                  };
                default:
                  return {
                    icon: <Sparkles className="w-4 h-4 text-emerald-500" />,
                    tagBg: "bg-emerald-50 text-emerald-900 border-emerald-200",
                    borderActive: "border-emerald-500 ring-2 ring-emerald-500/20",
                  };
              }
            };

            const accent = getCatAccent();

            return (
              <Link
                key={cat.id}
                href={isActive ? "/" : `/?discipline=${cat.id}`}
                className={`p-4 rounded-2xl border transition-all duration-200 card-hover-lift flex flex-col justify-between ${
                  isActive
                    ? `bg-slate-950 text-white border-slate-950 shadow-lg ${accent.borderActive}`
                    : "bg-white text-slate-800 border-slate-200/90 hover:border-slate-300 shadow-2xs hover:shadow-md"
                }`}
              >
                <div>
                  <div className="flex items-center justify-between mb-2.5">
                    <span
                      className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-md border ${
                        isActive
                          ? "bg-white/15 text-teal-300 border-white/20"
                          : accent.tagBg
                      }`}
                    >
                      {cat.targetClearanceRange}
                    </span>
                    {accent.icon}
                  </div>
                  <h3 className="font-extrabold text-sm sm:text-base tracking-tight leading-snug">
                    {cat.name}
                  </h3>
                  <p
                    className={`text-xs mt-0.5 line-clamp-1 ${
                      isActive ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    {cat.subtitle}
                  </p>
                </div>

                <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-bold">
                  <span className={isActive ? "text-slate-300" : "text-slate-600"}>
                    {count} bicicletas
                  </span>
                  <ChevronRight
                    className={`w-3.5 h-3.5 ${
                      isActive ? "text-teal-400" : "text-slate-400"
                    }`}
                  />
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Main Catalog with Live Filters and Grid */}
      <section aria-label="Listado de bicicletas" className="pt-2">
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-950 tracking-tight">
              {brandMatch && selectedDiscipline
                ? `Catálogo: ${brandMatch} en ${categories.find((c) => c.id === selectedDiscipline)?.name}`
                : brandMatch
                ? `Catálogo Oficial ${brandMatch} (${bikes.filter((b) => b.brand.toLowerCase() === brandMatch.toLowerCase()).length} modelos)`
                : selectedDiscipline
                ? `Catálogo: ${categories.find((c) => c.id === selectedDiscipline)?.name}`
                : "Catálogo Completo de Bicicletas"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-600 mt-0.5">
              Filtra por paso de rueda, transmisión electrónica Di2/AXS, suspensión, motor y presupuesto.
            </p>
          </div>
        </div>

        <CatalogView
          key={`${selectedDiscipline || "all"}-${brandMatch || "all"}`}
          initialBikes={bikes}
          brands={brands}
          initialDiscipline={selectedDiscipline}
          initialBrand={brandMatch}
        />
      </section>
    </div>
  );
}
