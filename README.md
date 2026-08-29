# 🚴‍♂️ BikeFinder.es — Comparador & Buscador de Bicicletas de Gravel y Carretera

> Plataforma web de alto rendimiento y SEO técnico especializada en **encontrar, filtrar y comparar técnicamente bicicletas oficiales de Gravel y Carretera** de los principales fabricantes del sector ciclista.

## 🎯 Propósito del Proyecto

A diferencia de webs de afiliados de productos genéricos, **BikeFinder.es** se centra en **bicicletas completas de las marcas líderes oficiales** (Canyon, Orbea, Trek, Specialized, Giant, Scott, Cannondale, BMC, Bianchi, Merida, Rose, etc.):

- ❌ **Sin afiliación de Amazon**: Foco 100% en producto oficial ciclista.
- 🔗 **Enlaces directos oficiales**: Cada modelo enlaza a su ficha oficial del fabricante.
- 📊 **Comparativas técnicas reales**: Peso en báscula oficial, paso de rueda máximo (*tire clearance*), tipo de cambio (electrónico/mecánico), desarrollos (calculador de ratios de subida y llano) y tabla de geometría comparada.
- 💰 **Monetización futura**: Diseñado para Google AdSense y patrocinio directo de marcas.

## 🛠️ Stack Tecnológico

- **Framework**: Next.js 14 / 15 (App Router, SSG/ISR)
- **Lenguaje**: TypeScript
- **Estilos**: Tailwind CSS + Lucide React
- **Validación de Datos**: Zod
- **Base de Datos / Catálogo**: Datasets JSON normalizados en `/data/bikes/` versionados en Git (inmunes a despliegues y sin coste de servidor).
- **Despliegue**: Cloudflare Pages / Vercel (Edge CDN)

## 📁 Estructura del Proyecto

```
bikefinder.es/
├── data/                         # Catálogo maestro en JSON
│   ├── categories.json           # Disciplinas (Gravel, Carretera Endurance, Aero, etc.)
│   ├── brands.json               # Marcas soportadas y metadatos oficiales
│   └── bikes/                    # Datasets de bicicletas validados con Zod
│       ├── gravel.json
│       └── carretera.json
├── docs/                         # Especificaciones técnicas y esquemas
│   └── bike-schema-spec.md
├── scripts/                      # Herramientas de extracción y sincronización
│   ├── import-bike.ts            # Importador de URL oficial asistido por IA
│   └── sync-official-prices.ts   # Sincronizador periódico de precios
├── skills/                       # Reglas de negocio del proyecto
│   └── SKILL.md
└── src/                          # Código fuente de Next.js
    ├── app/                      # Rutas (Buscador, Catálogo, Fichas, Comparador 1v1)
    ├── components/               # Componentes UI (Filtros, Tablas, Geometría, Ads)
    └── lib/                      # Validadores Zod y utilidades
```
