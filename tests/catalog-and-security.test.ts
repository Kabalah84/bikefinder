import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  isSafeExternalUrl,
  sanitizeExternalUrl,
  sanitizeSearchInput,
  sanitizeSlugParam,
  sanitizeSlugArray,
  validateDisciplineParam,
  validateBrandParam,
} from "@/lib/utils/security";
import { isPrivateHost } from "../scripts/import-bike";
import { getAllBikes, getAllBrands, getBikeById, filterBikes } from "@/lib/data/bikes";
import { POPULAR_DUELS, getDuelBySlug } from "@/lib/data/duels";
import { GroupsetSpecSchema } from "@/lib/schema/bike";
import { buildCogsFromCassette, calculateGearMatrix } from "@/lib/utils/gear-physics";
import { calculateRecommendations } from "@/lib/utils/bike-recommender";
import {
  generateOrganizationSchema,
  generateProductSchema,
  generateArticleComparisonSchema,
} from "@/lib/seo/schema";

describe("Security & Input Sanitization", () => {
  it("validates external URLs and blocks dangerous pseudo-protocols", () => {
    assert.equal(isSafeExternalUrl("https://www.giant-bicycles.com/es"), true);
    assert.equal(isSafeExternalUrl("http://www.specialized.com"), true);
    assert.equal(isSafeExternalUrl("javascript:alert(1)"), false);
    assert.equal(isSafeExternalUrl("data:text/html,<script>alert(1)</script>"), false);
    assert.equal(isSafeExternalUrl("vbscript:msgbox(1)"), false);
    assert.equal(sanitizeExternalUrl("javascript:alert(1)"), "#");
  });

  it("blocks SSRF private/internal hosts including full 172.16.0.0/12 and 0.0.0.0", () => {
    assert.equal(isPrivateHost("localhost"), true);
    assert.equal(isPrivateHost("0.0.0.0"), true);
    assert.equal(isPrivateHost("127.0.0.1"), true);
    assert.equal(isPrivateHost("169.254.169.254"), true);
    assert.equal(isPrivateHost("172.16.0.1"), true);
    assert.equal(isPrivateHost("172.24.10.5"), true);
    assert.equal(isPrivateHost("172.31.255.255"), true);
    assert.equal(isPrivateHost("172.15.0.1"), false);
    assert.equal(isPrivateHost("172.32.0.1"), false);
    assert.equal(isPrivateHost("www.canyon.com"), false);
  });

  it("sanitizes search input, slugs, and filter parameters against XSS/injection", () => {
    assert.equal(sanitizeSearchInput("<script>alert('xss')</script>Grizl"), "scriptalert(xss)/scriptGrizl");
    assert.equal(sanitizeSlugParam("giant-revolt-2026"), "giant-revolt-2026");
    assert.equal(sanitizeSlugParam("../etc/passwd"), null);
    assert.equal(sanitizeSlugParam("slug<script>"), null);
    assert.deepEqual(sanitizeSlugArray("bici-1,bici-2,invalid<script>,bici-3,bici-4,bici-5", 4), [
      "bici-1",
      "bici-2",
      "bici-3",
      "bici-4",
    ]);
    assert.equal(validateDisciplineParam("mtb"), "mtb");
    assert.equal(validateDisciplineParam("invalid_disc"), null);
    assert.equal(validateBrandParam("giant", ["Giant", "Specialized"]), "Giant");
    assert.equal(validateBrandParam("unknown", ["Giant", "Specialized"]), null);
  });
});

describe("Catalog Data Integrity & Zod Schema Hardening", () => {
  const bikes = getAllBikes();

  it("loads all 814 catalog bikes with valid chainrings, cassettes, and gear ratios", () => {
    assert.ok(bikes.length >= 800, `Expected >= 800 bikes, got ${bikes.length}`);

    for (const bike of bikes) {
      const rings = bike.groupset.chainrings
        .replace(/T$/i, "")
        .split("/")
        .map(Number);
      const cogs = bike.groupset.cassette
        .replace(/T$/i, "")
        .split("-")
        .map(Number);

      assert.ok(rings.every((r) => r >= 20 && r <= 65), `Invalid chainring on ${bike.id}: ${bike.groupset.chainrings}`);
      assert.ok(cogs.length === 2 && cogs[0] >= 9 && cogs[1] >= 24, `Invalid cassette on ${bike.id}: ${bike.groupset.cassette}`);

      const expectedMin = Number((Math.min(...rings) / Math.max(...cogs)).toFixed(2));
      const expectedMax = Number((Math.max(...rings) / Math.min(...cogs)).toFixed(2));
      assert.ok(
        Math.abs(bike.groupset.minGearRatio - expectedMin) <= 0.02,
        `minGearRatio mismatch on ${bike.id}: got ${bike.groupset.minGearRatio}, expected ${expectedMin}`
      );
      assert.ok(
        Math.abs(bike.groupset.maxGearRatio - expectedMax) <= 0.02,
        `maxGearRatio mismatch on ${bike.id}: got ${bike.groupset.maxGearRatio}, expected ${expectedMax}`
      );

      // Ensure no raw HTML entities remain in user-facing strings
      const combinedText = [bike.model, bike.groupset.name, bike.wheels, bike.tires, bike.brakes]
        .filter(Boolean)
        .join(" ");
      assert.equal(
        /&quot;|&#0?39;|&amp;|&nbsp;/.test(combinedText),
        false,
        `Raw HTML entity found on ${bike.id}: ${combinedText}`
      );
    }
  });

  it("rejects corrupted chainrings (00T, 01T, 1T) and corrupted cassettes (00-10, 00-11T) in GroupsetSpecSchema", () => {
    assert.equal(
      GroupsetSpecSchema.safeParse({
        brand: "shimano",
        name: "Shimano GRX",
        isElectronic: false,
        speedCount: 12,
        chainrings: "00T",
        cassette: "10-45T",
        minGearRatio: 0.89,
        maxGearRatio: 4.0,
      }).success,
      false
    );

    assert.equal(
      GroupsetSpecSchema.safeParse({
        brand: "shimano",
        name: "Shimano CUES",
        isElectronic: false,
        speedCount: 11,
        chainrings: "40T",
        cassette: "00-11T",
        minGearRatio: 0.8,
        maxGearRatio: 3.64,
      }).success,
      false
    );
  });
});

describe("Comparator Presets, Duels, Filtering & Gear Calculator", () => {
  const bikes = getAllBikes();

  it("resolves all POPULAR_DUELS and ComparadorClient preset IDs in the catalog", () => {
    for (const duel of POPULAR_DUELS) {
      assert.ok(getDuelBySlug(duel.slug), `Duel ${duel.slug} should resolve`);
      assert.ok(getBikeById(duel.bikeIdA), `Duel bikeIdA ${duel.bikeIdA} should exist`);
      assert.ok(getBikeById(duel.bikeIdB), `Duel bikeIdB ${duel.bikeIdB} should exist`);
    }
    assert.equal(getDuelBySlug("invalid<script>slug"), undefined);

    const presetIds = [
      "giant-revolt-advanced-2-2026",
      "specialized-diverge-4-comp-carbon-sram-apex-axs-s1000-2026",
      "canyon-grail-cf-7-2026",
      "giant-defy-advanced-0-2026",
      "specialized-roubaix-sl8-comp-2026",
      "canyon-endurace-cf-6-2027",
      "specialized-tarmac-sl9-expert-shimano-ultegra-di2-2026",
      "canyon-aeroad-cf-slx-8-di2-2027",
      "giant-propel-advanced-pro-0-di2-2027",
      "specialized-epic-9-comp-2026",
      "canyon-lux-world-cup-cfr-x0-axs-2027",
      "giant-anthem-advanced-sl-2-2026",
    ];
    for (const id of presetIds) {
      assert.ok(getBikeById(id), `Preset bike ID ${id} must exist in catalog`);
    }
  });

  it("builds accurate cog arrays for all catalog cassettes and guards calculateGearMatrix", () => {
    const distinctCassettes = Array.from(new Set(bikes.map((b) => b.groupset.cassette)));
    for (const cas of distinctCassettes) {
      const [expectedMinCog, expectedMaxCog] = cas.replace(/T$/i, "").split("-").map(Number);
      const cogs = buildCogsFromCassette(cas, 12);
      assert.equal(cogs[0], expectedMinCog, `First cog for ${cas} must be ${expectedMinCog}`);
      assert.equal(cogs[cogs.length - 1], expectedMaxCog, `Last cog for ${cas} must be ${expectedMaxCog}`);
    }

    assert.deepEqual(calculateGearMatrix([0, -5, 3], [0, 11], 2.2), []);
    const validMatrix = calculateGearMatrix([40], [10, 44], 2.2);
    assert.equal(validMatrix.length, 2);
  });

  it("filters E-Bikes and suspension types accurately and generates valid Schema.org JSON-LD", () => {
    const ebikes = filterBikes(bikes, { isElectric: true });
    assert.ok(ebikes.length > 0 && ebikes.every((b) => b.isElectric === true));

    const fullSusp = filterBikes(bikes, { suspensionTypes: ["full"] });
    assert.ok(fullSusp.length > 0 && fullSusp.every((b) => b.suspensionType === "full"));

    const recs = calculateRecommendations(bikes, {
      terrain: "mtb_full",
      budgetMax: 3800,
      shifting: "any",
      priority: "comfort",
    });
    assert.equal(recs.length, 4);

    const orgSchema = generateOrganizationSchema();
    assert.equal(orgSchema.logo.url.endsWith("/icon"), true);

    const productSchema = generateProductSchema(bikes[0]) as Record<string, any>;
    assert.equal("hasMerchantReturnPolicy" in productSchema.offers, false);
    assert.equal("shippingDetails" in productSchema.offers, false);

    const articleSchema = generateArticleComparisonSchema({
      title: "Test Duel",
      summary: "Test Summary",
      slug: "test-duel",
      bikeA: bikes[0],
      bikeB: bikes[1],
    });
    assert.ok(Array.isArray(articleSchema.image) && articleSchema.image.length === 2);
  });
});
