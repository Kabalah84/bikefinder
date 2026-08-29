import { getAllBikes, getAllBrands, getAllCategories } from "@/lib/data/bikes";
import { CatalogView } from "@/components/catalog/CatalogView";
import { AdBanner } from "@/components/layout/AdBanner";
import { Discipline } from "@/lib/schema/bike";
import {
  Compass,
  Zap,
  Flame,
  ShieldCheck,
  Scale,
  Sparkles,
  Layers,
  CircleDot,
} from "lucide-react";
import Link from "next/link";

interface PageProps {
  searchParams: {
    discipline?: string;
  };
}

export default function HomePage({ searchParams }: PageProps) {
  const bikes = getAllBikes();
  const brands = getAllBrands().map((b) => b.name);
  const categories = getAllCategories();

  const selectedDiscipline = searchParams.discipline as Discipline | undefined;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-6 sm:pt-10 space-y-8">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-teal-950 px-6 py-10 sm:px-12 sm:py-14 text-white shadow-xl">
        <div className="relative z-10 max-w-3xl space-y-4">
          <div className="inline-flex items-center gap-2 rounded-full bg-teal-500/20 px-3 py-1 text-xs font-semibold text-teal-300 border border-teal-500/30 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Comparador Técnico de Ciclismo Oficial · Temporada 2025</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight text-white">
            Encuentra y compara tu bicicleta de{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-emerald-400">
              Gravel y Carretera
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl leading-relaxed">
            Sin intermediarios ni enlaces de Amazon. Confronta pesos reales en báscula, paso de rueda máximo, desarrollos para escalada y geometría de marcas líderes: Canyon, Orbea, Trek y Specialized.
          </p>

          {/* Quick value badges */}
          <div className="pt-2 flex flex-wrap gap-4 text-xs font-medium text-slate-300">
            <div className="flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>Enlaces 100% Oficiales</span>
            </div>
            <div className="flex items-center gap-1.5">
              <CircleDot className="w-4 h-4 text-teal-400" />
              <span>Filtro de Tire Clearance (mm)</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Scale className="w-4 h-4 text-amber-400" />
              <span>Comparador 1v1 y Multivía</span>
            </div>
          </div>
        </div>

        {/* Decorative background glow */}
        <div className="absolute -right-20 -top-20 h-96 w-96 rounded-full bg-teal-500/15 blur-3xl" />
        <div className="absolute right-40 -bottom-20 h-64 w-64 rounded-full bg-emerald-500/10 blur-2xl" />
      </section>

      {/* Category Pills Selector */}
      <section className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        {categories.map((cat) => {
          const isActive = selectedDiscipline === cat.id;
          return (
            <Link
              key={cat.id}
              href={isActive ? "/" : `/?discipline=${cat.id}`}
              className={`p-4 rounded-2xl border transition-all ${
                isActive
                  ? "bg-slate-900 text-white border-slate-900 shadow-md ring-2 ring-teal-500/30"
                  : "bg-white text-slate-800 border-slate-200 hover:border-slate-300 hover:shadow-xs"
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-teal-600">
                  {cat.targetClearanceRange}
                </span>
                {cat.id === "gravel" ? (
                  <Compass className="w-4 h-4 text-amber-500" />
                ) : (
                  <Zap className="w-4 h-4 text-sky-500" />
                )}
              </div>
              <h3 className="font-bold text-sm sm:text-base leading-snug">{cat.name}</h3>
              <p
                className={`text-xs mt-1 line-clamp-1 ${
                  isActive ? "text-slate-300" : "text-slate-500"
                }`}
              >
                {cat.subtitle}
              </p>
            </Link>
          );
        })}
      </section>

      {/* AdSense Leaderboard Banner Slot */}
      <AdBanner
        slotType="leaderboard"
        ctaUrl="https://www.canyon.com/es-es/bicicletas-gravel/"
        ctaText="Ver Gama Gravel 2025"
      />

      {/* Main Catalog with Live Filters and Grid */}
      <section>
        <div className="flex items-baseline justify-between mb-4">
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-slate-900 tracking-tight">
              {selectedDiscipline
                ? `Catálogo: ${categories.find((c) => c.id === selectedDiscipline)?.name}`
                : "Catálogo de Bicicletas"}
            </h2>
            <p className="text-xs sm:text-sm text-slate-500">
              Filtra por paso de rueda, transmisión electrónica Di2/AXS, peso y presupuesto.
            </p>
          </div>
        </div>

        <CatalogView
          initialBikes={bikes}
          brands={brands}
          initialDiscipline={selectedDiscipline}
        />
      </section>
    </div>
  );
}
