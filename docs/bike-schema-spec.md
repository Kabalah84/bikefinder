# 📐 Especificación del Esquema de Datos de Bicicletas

Este documento define la estructura de datos tipada con Zod para el catálogo de bicicletas de Gravel y Carretera.

## 🚲 Estructura Principal (`BikeProduct`)

| Campo | Tipo | Ejemplo | Descripción |
| :--- | :--- | :--- | :--- |
| `id` | `string` | `"canyon-grizl-cf-sl-7-2025"` | Identificador único / slug |
| `brand` | `string` | `"Canyon"` | Fabricante oficial |
| `model` | `string` | `"Grizl CF SL 7"` | Modelo y versión |
| `year` | `number` | `2025` | Año de la gama / temporada |
| `discipline` | `enum` | `"gravel" \| "road_endurance" \| "road_race" \| "all_road"` | Subdisciplina ciclista |
| `officialUrl` | `string` | `"https://www.canyon.com/..."` | Enlace oficial directo |
| `officialImageUrl` | `string` | `"https://media.canyon.com/..."` | Imagen oficial en alta resolución |
| `msrpEur` | `number` | `2299` | Precio oficial de salida (PVP) |
| `currentPriceEur` | `number` | `1999` | Precio oficial actual |
| `discountPercentage` | `number?`| `13` | Porcentaje de descuento si está rebajada |
| `isOutlet` | `boolean` | `false` | Indica si es oferta de fin de temporada |
| `frameMaterial` | `enum` | `"carbon" \| "aluminum" \| "titanium" \| "steel"` | Material del cuadro |
| `forkMaterial` | `enum` | `"carbon" \| "aluminum"` | Material de la horquilla |
| `weightKg` | `number?`| `9.35` | Peso oficial declarado |
| `weightSizeReference` | `string?` | `"M"` | Talla en la que se pesó oficialmente |
| `maxTireClearanceMm` | `number` | `50` | **Paso de rueda máximo oficial (mm)** |
| `integratedCockpit` | `boolean` | `true` | Cableado 100% interno |
| `bikepackingMounts` | `boolean` | `true` | Roscas en cuadro/horquilla |

---

## ⚙️ Transmisión y Grupo (`GroupsetSpec`)

| Campo | Tipo | Ejemplo |
| :--- | :--- | :--- |
| `brand` | `enum` | `"shimano" \| "sram" \| "campagnolo" \| "microshift"` |
| `name` | `string` | `"Shimano GRX RX820" \| "SRAM Rival AXS"` |
| `isElectronic` | `boolean` | `true` (Di2/AXS) o `false` (Mecánico) |
| `speedCount` | `number` | `12` (velocidades del cassette) |
| `chainrings` | `string` | `"48/31T"` o `"40T"` (1x o 2x) |
| `cassette` | `string` | `"11-36T"` o `"10-44T"` |
| `minGearRatio` | `number` | `0.86` (ej. 31/36 = ratio más blando para subir cuestas) |
| `maxGearRatio` | `number` | `4.36` (ej. 48/11 = ratio más duro para llanear) |

---

## 📏 Geometría de Referencia Talla M (`GeometrySpec`)

| Campo | Tipo | Ejemplo |
| :--- | :--- | :--- |
| `stackMm` | `number` | `579` |
| `reachMm` | `number` | `402` |
| `stackReachRatio` | `number` | `1.44` (>1.50 = Confort/Endurance, <1.45 = Aero/Racing) |
| `headTubeAngleDeg` | `number` | `72.5` |
| `chainstayLengthMm` | `number` | `435` |
