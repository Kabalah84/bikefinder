---
name: bikefinder-es-gravel-carretera
description: Plataforma web BikeFinder.es especializada en encontrar y comparar técnicamente bicicletas de Gravel y Carretera con datos oficiales de fabricantes (Canyon, Orbea, Trek, Specialized, Scott, Giant, etc.), sin afiliación de Amazon, con enlaces salientes a páginas oficiales y monetización mediante Google AdSense y patrocinio directo.
---

# Directivas del Proyecto · BikeFinder.es 🚴‍♂️⚡

**BikeFinder.es** es una plataforma de alto rendimiento y SEO técnico enfocada en ayudar a los ciclistas a **encontrar, filtrar y comparar técnicamente bicicletas de Gravel y Carretera** basándose en datos oficiales.

## 🎯 Reglas Maestras de Negocio y Arquitectura

1. **Sin Afiliación de Amazon:**
   - No se utilizan enlaces ni ASINs de Amazon.
   - Los productos son **bicicletas completas oficiales** de marcas reconocidas del sector ciclista.
   - Cada bicicleta tiene un enlace saliente a su **página web oficial de producto** con `rel="noopener noreferrer"` y apertura en nueva pestaña.

2. **Monetización:**
   - Diseñado para **Google AdSense** (espacios publicitarios in-feed no intrusivos en catálogo y comparativas).
   - Preparado para **patrocinio directo de marcas / tiendas oficiales** (banners de lanzamiento de nuevas temporadas).

3. **Arquitectura de Datos (Zero Cost & Inmune a Deploys):**
   - El catálogo maestro reside en archivos **JSON fuertemente tipados con Zod** en `/data/bikes/` dentro del repositorio Git.
   - Renderizado en **Next.js (App Router, SSG/ISR)** para velocidad máxima de carga y SEO 100% en Googlebot.
   - Despliegue estático en Cloudflare Pages / Vercel sin pérdida de datos en despliegues.

4. **Dimensiones Técnicas Clave para Encontrar la Bici Ideal:**
   - **Paso de rueda máximo (Max Tire Clearance):** Crucial en Gravel (ej. 45mm, 50mm) y Carretera Endurance (ej. 32mm, 35mm).
   - **Grupo de transmisión y desarrollos:** Shimano GRX, 105, Ultegra, Dura-Ace / SRAM Apex, Rival, Force, Red AXS / Campagnolo Ekar.
   - **Calculador de Desarrollos:** Cálculo dinámico de ratios para subidas (min gear ratio) y llano (max gear ratio).
   - **Geometría y Postura:** Stack, Reach, Ángulo de dirección y Ratio Stack/Reach (Agresiva vs Relajada/Endurance).
   - **Materiales y Peso Oficial:** Cuadro (Carbono/Aluminio/Titanio), ruedas y peso oficial declarado.
   - **Precios Oficiales:** PVP oficial (MSRP), precio actual en web oficial y etiquetas de descuento/outlet.

5. **Herramientas de Ingestión y Sincronización:**
   - CLI de importación rápida por URL oficial asistida por IA/Gemini: `npm run bike:import <URL_OFICIAL>`.
   - Script de comprobación de precios oficiales para ejecuciones programadas (GitHub Actions).
