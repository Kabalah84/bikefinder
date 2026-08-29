import React from "react";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Metadata } from "next";
import { getBikeById, getAllBikes } from "@/lib/data/bikes";
import { ComparisonTable } from "@/components/comparator/ComparisonTable";
import { formatCurrencyEur, formatDisciplineName } from "@/lib/utils/formatters";
import {
  Scale,
  ArrowLeft,
  Trophy,
  ShieldCheck,
  CheckCircle2,
  ExternalLink,
  Sparkles,
  Zap,
} from "lucide-react";

interface DuelConfig {
  slug: string;
  bikeIdA: string;
  bikeIdB: string;
  title: string;
  summary: string;
}

const POPULAR_DUELS: DuelConfig[] = [
  {
    slug: "canyon-grizl-vs-orbea-terra",
    bikeIdA: "canyon-grizl-cf-sl-7-2025",
    bikeIdB: "orbea-terra-m20team-2025",
    title: "Canyon Grizl CF SL 7 vs Orbea Terra M20TEAM: Duelo Gravel de Referencia",
    summary:
      "Dos de las bicicletas de gravel más vendidas del mercado frente a frente. La Canyon Grizl destaca por su paso de rueda de hasta 50 mm y precio directo ajustado, mientras que la Orbea Terra ofrece almacenamiento LOCKR interno en cuadro y ligereza.",
  },
  {
    slug: "canyon-grizl-vs-trek-checkpoint",
    bikeIdA: "canyon-grizl-cf-sl-7-2025",
    bikeIdB: "trek-checkpoint-sl-6-axs-gen-3-2025",
    title: "Canyon Grizl vs Trek Checkpoint SL 6: Mecánica vs Electrónica e IsoSpeed",
    summary:
      "Comparativa técnica entre la aventurera Canyon Grizl y la Trek Checkpoint de 3ª generación con tecnología de absorción IsoSpeed y cambio electrónico inalámbrico SRAM AXS.",
  },
  {
    slug: "canyon-endurace-vs-trek-domane",
    bikeIdA: "canyon-endurace-cf-7-2025",
    bikeIdB: "trek-domane-sl-6-gen-4-2025",
    title: "Canyon Endurace CF 7 vs Trek Domane SL 6: La Batalla del Gran Fondo",
    summary:
      "Las dos reinas de la comodidad en carretera. Analizamos su geometría Stack/Reach para evitar dolor de espalda, paso de rueda para neumáticos de 35-38mm y peso en báscula.",
  },
  {
    slug: "trek-domane-vs-specialized-roubaix",
    bikeIdA: "trek-domane-sl-6-gen-4-2025",
    bikeIdB: "specialized-roubaix-sl8-expert-2025",
    title: "Trek Domane SL 6 vs Specialized Roubaix SL8: IsoSpeed vs Future Shock 3.2",
    summary:
      "El gran enfrentamiento de la micro-suspensión en carretera. IsoSpeed trasero en la Domane frente al cartucho hidráulico delantero Future Shock 3.2 y paso de rueda de 40mm en la Roubaix.",
  },
  {
    slug: "canyon-ultimate-vs-specialized-tarmac",
    bikeIdA: "canyon-ultimate-cf-sl-8-aero-2025",
    bikeIdB: "specialized-tarmac-sl8-pro-2025",
    title: "Canyon Ultimate CF SL Aero vs Specialized Tarmac SL8: Duelo WorldTour",
    summary:
      "Pura escalada y aerodinámica al más alto nivel. Peso pluma de 7.36 kg frente a 7.16 kg con transmisiones electrónicas Shimano Ultegra Di2 y cockpits 100% integrados.",
  },
  {
    slug: "orbea-orca-vs-specialized-tarmac",
    bikeIdA: "orbea-orca-m30iltd-2025",
    bikeIdB: "specialized-tarmac-sl8-pro-2025",
    title: "Orbea Orca OMX vs Specialized Tarmac SL8: Escaladoras Puras",
    summary:
      "Confrontamos el cuadro de carbono OMX de 750g de Orbea personalizable con MyO frente al cono frontal Speed Sniffer de la campeona del mundo Tarmac SL8.",
  },
  {
    slug: "giant-revolt-vs-canyon-grizl",
    bikeIdA: "giant-revolt-advanced-pro-1-2025",
    bikeIdB: "canyon-grizl-cf-sl-7-2025",
    title: "Giant Revolt Advanced Pro vs Canyon Grizl CF SL: Duelo de Paso de Rueda",
    summary:
      "Giant Revolt con puntera Flip Chip (53 mm) y tija D-Fuse frente a la todoterreno Canyon Grizl (50 mm). Ambas con cuadros de carbono y gran capacidad de aventura.",
  },
  {
    slug: "cannondale-topstone-vs-specialized-diverge",
    bikeIdA: "cannondale-topstone-carbon-2-l-2025",
    bikeIdB: "specialized-diverge-str-expert-2025",
    title: "Cannondale Topstone vs Specialized Diverge STR: Suspensión Kingpin vs Future Shock",
    summary:
      "La batalla de la suspensión en gravel. El pivote Kingpin sin amortiguador de Cannondale frente a la doble suspensión activa delantera y trasera Future Shock de Specialized.",
  },
  {
    slug: "giant-defy-vs-trek-domane",
    bikeIdA: "giant-defy-advanced-sl-1-2025",
    bikeIdB: "trek-domane-sl-6-gen-4-2025",
    title: "Giant Defy Advanced SL vs Trek Domane SL 6: Ligereza vs IsoSpeed",
    summary:
      "Confrontamos los 7.30 kg de peso pluma de la Giant Defy frente a la tecnología de absorción IsoSpeed y almacenamiento interno en cuadro de la Trek Domane.",
  },
  {
    slug: "cannondale-supersix-vs-specialized-tarmac",
    bikeIdA: "cannondale-supersix-evo-hi-mod-2-2025",
    bikeIdB: "specialized-tarmac-sl8-pro-2025",
    title: "Cannondale SuperSix EVO vs Specialized Tarmac SL8: Clásicas del WorldTour",
    summary:
      "Dos de las bicicletas más laureadas del pelotón profesional. Tubo de dirección Delta Steerer de Cannondale frente a aerodinámica Speed Sniffer de la Tarmac SL8.",
  },
  {
    slug: "bmc-teammachine-vs-giant-tcr",
    bikeIdA: "bmc-teammachine-slr01-one-2025",
    bikeIdB: "giant-tcr-advanced-sl-0-2025",
    title: "BMC Teammachine SLR01 vs Giant TCR Advanced SL: Supercomputación vs 6.6 kg",
    summary:
      "Ingeniería suiza ACE+ y portabidones integrados frente al peso récord de 6.60 kg con tija integrada de la 10ª generación de la Giant TCR.",
  },
];

export function generateStaticParams() {
  return POPULAR_DUELS.map((d) => ({
    slug: d.slug,
  }));
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const duel = POPULAR_DUELS.find((d) => d.slug === params.slug);
  if (!duel) {
    return {
      title: "Comparativa de Bicicletas | BikeFinder.es",
    };
  }

  return {
    title: `${duel.title} | BikeFinder.es`,
    description: duel.summary,
    openGraph: {
      title: duel.title,
      description: duel.summary,
    },
  };
}

export default function DueloPage({ params }: { params: { slug: string } }) {
  const duel = POPULAR_DUELS.find((d) => d.slug === params.slug);

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

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-8 space-y-8">
      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs font-semibold text-slate-500">
        <Link href="/" className="hover:text-teal-600 flex items-center gap-1">
          <ArrowLeft className="w-3.5 h-3.5" /> Catálogo
        </Link>
        <span>/</span>
        <Link href="/comparador" className="hover:text-teal-600">
          Comparativas
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-bold">{bikeA.brand} vs {bikeB.brand}</span>
      </div>

      {/* Header */}
      <div className="space-y-3">
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
      </div>

      {/* Tarjeta de Veredicto Rápido */}
      <div className="rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-950 p-6 sm:p-8 text-white shadow-xl space-y-4">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-teal-400">
          <Sparkles className="w-4 h-4" />
          <span>Veredicto Técnico BikeFinder</span>
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
      </div>

      {/* Tabla Comparativa 1v1 */}
      <ComparisonTable bikes={[bikeA, bikeB]} />

      {/* Otros Duelos Populares */}
      <div className="pt-8 border-t border-slate-200 space-y-4">
        <h3 className="text-lg font-bold text-slate-900">Otras comparativas populares:</h3>
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
      </div>
    </div>
  );
}
