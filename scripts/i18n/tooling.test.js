#!/usr/bin/env node
/**
 * Node built-in test suite for i18n tooling (no vitest dependency).
 * Run: node --test scripts/i18n/tooling.test.js
 *
 * Negative APPLY tests use isolated temp locale fixtures — never mutate en-US/sk
 * or unrelated production locales for failure cases.
 */

const { describe, it, before, after } = require("node:test");
const assert = require("node:assert/strict");
const fs = require("fs");
const os = require("os");
const path = require("path");
const crypto = require("crypto");

const {
  loadCatalogs,
  UI_ONLY_ALIASES,
  REF_LOCALE,
  extractPlaceholders,
  flatten,
  hashValue,
  ROOT
} = require("./lib/catalog");
const { buildInventory } = require("./lib/inventory");
const { buildExportPackage } = require("./lib/exportPackage");
const { validateImportPackage } = require("./lib/validateImport");
const { buildSourceHashes, diffAgainstSnapshot } = require("./lib/sourceHash");
const {
  applyImportPlan,
  renderNamespaceModule,
  planIndexWiring,
  PROTECTED_LOCALES
} = require("./lib/applyImport");

const FIXTURE_ROOT = path.join(
  os.tmpdir(),
  `dreamhubb-i18n-fixtures-${process.pid}-${crypto.randomBytes(4).toString("hex")}`
);

function writeFixtureLocale(root, locale) {
  const dir = path.join(root, "src", "i18n", locale);
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(
    path.join(dir, "index.ts"),
    "import auth from \"./auth\";\n\nexport default {\n  ...auth\n};\n",
    "utf8"
  );
  fs.writeFileSync(
    path.join(dir, "auth.ts"),
    "export default {\n  cancel: \"Abbrechen\"\n};\n",
    "utf8"
  );
  return dir;
}

before(() => {
  writeFixtureLocale(FIXTURE_ROOT, "de");
  fs.mkdirSync(path.join(FIXTURE_ROOT, "i18n-meta"), { recursive: true });
  fs.writeFileSync(
    path.join(FIXTURE_ROOT, "i18n-meta", "review-overrides.json"),
    JSON.stringify({ version: 1, entries: {} }, null, 2),
    "utf8"
  );
});

after(() => {
  try {
    fs.rmSync(FIXTURE_ROOT, { recursive: true, force: true });
  } catch {
    /* ignore */
  }
});

describe("i18n catalogs load", () => {
  it("loads en-US reference and expected UI/pack counts", () => {
    const c = loadCatalogs();
    assert.equal(c.REF_LOCALE || REF_LOCALE, "en-US");
    assert.ok(c.refKeys.length >= 800);
    assert.equal(c.appLanguages.length, 59);
    assert.equal(c.locales.length, 58);
    assert.ok(c.locales.includes("en-US"));
    assert.ok(c.locales.includes("sk"));
    assert.ok(!c.locales.includes("en-GB"));
    assert.ok(UI_ONLY_ALIASES.has("en-GB"));
  });

  it("en-US and sk have full key coverage", () => {
    const inv = buildInventory();
    const en = inv.locales.find((l) => l.locale === "en-US");
    const sk = inv.locales.find((l) => l.locale === "sk");
    assert.equal(en.missing, 0);
    assert.equal(sk.missing, 0);
    assert.equal(en.keyCoveragePct, 100);
    assert.equal(sk.keyCoveragePct, 100);
  });

  it("T: keeps 59 UI languages and 58 message packs", () => {
    const c = loadCatalogs();
    assert.equal(c.appLanguages.length, 59);
    assert.equal(c.locales.length, 58);
  });
});

describe("coverage metrics distinguish available / explicit / inherited", () => {
  it("de catalog is technically complete after 4B.3 (no runtime missing)", () => {
    const inv = buildInventory();
    const de = inv.locales.find((l) => l.locale === "de");
    assert.equal(de.missing, 0);
    assert.equal(de.estimatedRuntimeFallbackKeys, 0);
    assert.equal(de.availableKeys, de.referenceKeys);
    assert.equal(de.explicitOwnKeys, de.availableKeys);
    assert.equal(de.inheritedSourceKeys, 0);
    assert.equal(de.metricsConfidence.estimatedFallback, "EXACT");
    // Still not language-APPROVED — inventory readiness must not claim APPROVED
    assert.notEqual(de.readiness.status, "APPROVED");
  });

  it("de ownership: auth may keep ...enUS spread but all effective keys are explicit", () => {
    const inv = buildInventory();
    const de = inv.locales.find((l) => l.locale === "de");
    assert.equal(de.ownership.confidence, "EXACT");
    assert.equal(de.inheritedSourceKeys, 0, "effective inherited EN must be 0");
    assert.equal(de.explicitOwnKeys, de.availableKeys);
    assert.ok(de.explicitOwnKeys >= 800, "full explicit DE catalog");
  });

  it("sk and en-US have zero inherited enUS spreads", () => {
    const inv = buildInventory();
    const sk = inv.locales.find((l) => l.locale === "sk");
    const en = inv.locales.find((l) => l.locale === "en-US");
    assert.equal(sk.inheritedSourceKeys, 0);
    assert.equal(en.inheritedSourceKeys, 0);
    assert.equal(sk.explicitOwnKeys, sk.availableKeys);
    assert.equal(en.explicitOwnKeys, en.availableKeys);
  });

  it("de feed namespace is fully available after pilot (no feed missing)", () => {
    const c = loadCatalogs();
    const flat = flatten(c.messages.de);
    const feedKeys = c.refKeys.filter((k) => k.startsWith("feed."));
    assert.ok(feedKeys.length >= 30);
    const missingFeed = feedKeys.filter((k) => !(k in flat));
    assert.equal(missingFeed.length, 0, `missing feed keys: ${missingFeed.join(",")}`);
  });
});

describe("placeholders", () => {
  it("extracts vue-i18n placeholders", () => {
    assert.deepEqual(extractPlaceholders("Hello {name}, you have {count}"), [
      "count",
      "name"
    ]);
  });
});

describe("export", () => {
  it("A: exports missing de/feed (or empty after pilot apply)", () => {
    const pkg = buildExportPackage({
      locale: "de",
      onlyMissing: true,
      namespace: "feed",
      deterministic: true
    });
    assert.equal(pkg.kind, "dreamhubb-ui-translation-export");
    assert.ok(pkg.entries.every((e) => e.namespace === "feed"));
    assert.ok(pkg.entries.every((e) => e.sourceHash));
    // After pilot APPLY, missing feed keys should be 0
    assert.equal(pkg.entryCount, 0);
  });

  it("export is deterministic for same filters", () => {
    const a = buildExportPackage({
      locale: "de",
      onlyMissing: true,
      namespace: "legal",
      deterministic: true
    });
    const b = buildExportPackage({
      locale: "de",
      onlyMissing: true,
      namespace: "legal",
      deterministic: true
    });
    assert.deepEqual(a.entries, b.entries);
    assert.equal(a.generatedAt, null);
  });

  it("rejects en-GB alias export", () => {
    assert.throws(() => buildExportPackage({ locale: "en-GB" }), /alias/i);
  });

  it("can filter by namespace (nested packs like legal.*)", () => {
    // After 4D FR is complete — missing export is empty; filter still scopes correctly
    const missing = buildExportPackage({
      locale: "fr",
      onlyMissing: true,
      namespace: "legal"
    });
    assert.equal(missing.entryCount, 0);

    // After 4E.2 PT complete — use another still-incomplete locale as the non-empty fixture
    const all = buildExportPackage({
      locale: "ru",
      onlyMissing: true,
      namespace: "legal"
    });
    assert.ok(all.entryCount > 0);
    assert.ok(all.entries.every((e) => e.namespace === "legal"));
  });
});

describe("import validate", () => {
  it("B: accepts valid import package for de/feed key", () => {
    const r = validateImportPackage({
      targetLocale: "de",
      filters: { namespace: "feed" },
      entries: [
        {
          keyPath: "feed.searchPlaceholder",
          sourceText: loadCatalogs().refFlat["feed.searchPlaceholder"],
          sourceHash: hashValue(loadCatalogs().refFlat["feed.searchPlaceholder"]),
          translation: "Alles durchsuchen",
          status: "MACHINE_DRAFT"
        }
      ]
    });
    assert.equal(r.ok, true);
    assert.equal(r.summary.noop + r.summary.add + r.summary.update, 1);
  });

  it("C: rejects unknown locale", () => {
    const r = validateImportPackage({
      targetLocale: "xx-INVALID",
      entries: [{ keyPath: "feed.noResults", translation: "X" }]
    });
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => /Unknown target locale/i.test(e)));
  });

  it("D: rejects unknown key path", () => {
    const r = validateImportPackage({
      targetLocale: "de",
      entries: [{ keyPath: "this.key.does.not.exist.anywhere", translation: "X" }]
    });
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => /unknown keyPath/i.test(e)));
  });

  it("E: rejects wrong namespace vs allowlist", () => {
    const r = validateImportPackage(
      {
        targetLocale: "de",
        entries: [{ keyPath: "feed.noResults", translation: "Keine Ergebnisse" }]
      },
      { allowedNamespaces: ["legal"] }
    );
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => /not allowed/i.test(e)));
  });

  it("F: detects placeholder mismatch", () => {
    const c = loadCatalogs();
    const keyWithPh = c.refKeys.find(
      (k) => typeof c.refFlat[k] === "string" && /\{[a-zA-Z]+\}/.test(c.refFlat[k])
    );
    assert.ok(keyWithPh, "need at least one placeholder key in en-US");
    const r = validateImportPackage({
      targetLocale: "de",
      entries: [{ keyPath: keyWithPh, translation: "no placeholders here" }]
    });
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => /placeholder mismatch/i.test(e)));
  });

  it("G: detects plural pipe count mismatch", () => {
    const r = validateImportPackage({
      targetLocale: "de",
      entries: [
        {
          keyPath: "feed.resultsCount",
          translation: "Keine Ergebnisse | {n} Ergebnis"
        }
      ]
    });
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => /plural pipe/i.test(e)));
  });

  it("G2: 4E.2/4E.4R/4E.5 — extra pipe forms allowed for pl|cs|ro; rejected for de/fr/es/it/pt/hu/nl", () => {
    const c = loadCatalogs();
    const keyPath = "feed.resultsCount";
    const four =
      "A | {n} one | {n} few | {n} many";
    // sk is PROTECTED (import refused before plural check)
    for (const locale of ["de", "fr", "es", "it", "pt", "hu", "nl"]) {
      const r = validateImportPackage(
        {
          targetLocale: locale,
          filters: { namespace: "feed" },
          entries: [
            {
              keyPath,
              sourceText: c.refFlat[keyPath],
              sourceHash: hashValue(c.refFlat[keyPath]),
              translation: four,
              status: "MACHINE_DRAFT"
            }
          ]
        },
        { allowUpdates: true }
      );
      assert.equal(r.ok, false, `${locale} must reject 4-form vs EN 3-form`);
      assert.ok(
        r.errors.some((e) => /plural pipe/i.test(e)),
        `${locale} plural error missing`
      );
    }
    const plOk = validateImportPackage(
      {
        targetLocale: "pl",
        filters: { namespace: "feed" },
        entries: [
          {
            keyPath,
            sourceText: c.refFlat[keyPath],
            sourceHash: hashValue(c.refFlat[keyPath]),
            translation: "Brak | {n} wynik | {n} wyniki | {n} wyników",
            status: "MACHINE_DRAFT"
          }
        ]
      },
      { allowUpdates: true }
    );
    assert.equal(plOk.ok, true, "pl may use EN+1/+2 pipe forms");
    const csOk = validateImportPackage(
      {
        targetLocale: "cs",
        filters: { namespace: "feed" },
        entries: [
          {
            keyPath,
            sourceText: c.refFlat[keyPath],
            sourceHash: hashValue(c.refFlat[keyPath]),
            translation: "Žádné výsledky | {n} výsledek | {n} výsledky | {n} výsledků",
            status: "MACHINE_DRAFT"
          }
        ]
      },
      { allowUpdates: true }
    );
    assert.equal(csOk.ok, true, "cs may use EN+1/+2 pipe forms (separate from pl rules)");
    const roOk = validateImportPackage(
      {
        targetLocale: "ro",
        filters: { namespace: "feed" },
        entries: [
          {
            keyPath,
            sourceText: c.refFlat[keyPath],
            sourceHash: hashValue(c.refFlat[keyPath]),
            translation:
              "Niciun rezultat | {n} rezultat | {n} rezultate | {n} de rezultate",
            status: "MACHINE_DRAFT"
          }
        ]
      },
      { allowUpdates: true }
    );
    assert.equal(roOk.ok, true, "ro may use EN+1/+2 pipe forms for CLDR few/other");
  });

  it("H: rejects empty translation", () => {
    const r = validateImportPackage({
      targetLocale: "de",
      entries: [{ keyPath: "feed.noResults", translation: "" }]
    });
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => /empty translation/i.test(e)));
  });

  it("I: rejects duplicate keyPath", () => {
    const r = validateImportPackage({
      targetLocale: "de",
      entries: [
        { keyPath: "feed.noResults", translation: "A" },
        { keyPath: "feed.noResults", translation: "B" }
      ]
    });
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => /duplicate keyPath/i.test(e)));
  });

  it("J: rejects stale source hash", () => {
    const r = validateImportPackage({
      targetLocale: "de",
      entries: [
        {
          keyPath: "feed.noResults",
          sourceHash: "0000000000000000",
          translation: "Keine Ergebnisse"
        }
      ]
    });
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => /sourceHash mismatch|stale source/i.test(e)));
  });

  it("K: refuses overwrite APPROVED", () => {
    const overridesPath = path.join(ROOT, "i18n-meta", "review-overrides.json");
    const original = fs.readFileSync(overridesPath, "utf8");
    try {
      const data = JSON.parse(original);
      data.entries = data.entries || {};
      data.entries["de::feed.noResults"] = {
        status: "APPROVED",
        evidence: "test_temp"
      };
      fs.writeFileSync(overridesPath, JSON.stringify(data, null, 2));
      const r = validateImportPackage({
        targetLocale: "de",
        entries: [{ keyPath: "feed.noResults", translation: "ANDERER TEXT" }]
      });
      assert.equal(r.ok, false);
      assert.ok(r.errors.some((e) => /APPROVED/i.test(e)));
    } finally {
      fs.writeFileSync(overridesPath, original);
    }
  });

  it("L: refuses overwrite REVIEWED", () => {
    const overridesPath = path.join(ROOT, "i18n-meta", "review-overrides.json");
    const original = fs.readFileSync(overridesPath, "utf8");
    try {
      const data = JSON.parse(original);
      data.entries = data.entries || {};
      data.entries["de::feed.noResults"] = {
        status: "REVIEWED",
        evidence: "test_temp"
      };
      fs.writeFileSync(overridesPath, JSON.stringify(data, null, 2));
      const r = validateImportPackage({
        targetLocale: "de",
        entries: [{ keyPath: "feed.noResults", translation: "ANDERER TEXT" }]
      });
      assert.equal(r.ok, false);
      assert.ok(r.errors.some((e) => /REVIEWED/i.test(e)));
    } finally {
      fs.writeFileSync(overridesPath, original);
    }
  });

  it("M: refuses write into protected locale en-US", () => {
    const r = validateImportPackage({
      targetLocale: "en-US",
      entries: [{ keyPath: "feed.noResults", translation: "No results" }]
    });
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => /protected locale/i.test(e)));
    assert.ok(PROTECTED_LOCALES.has("en-US"));
  });

  it("N: safe escaping in generated TS module", () => {
    const src = renderNamespaceModule("feed", {
      quote: 'He said "Hallo" and used \\ slash'
    });
    assert.match(src, /He said \\"Hallo\\"/);
    assert.match(src, /export default/);
    // Must be valid-ish JS object literal
    assert.doesNotThrow(() => {
      // eslint-disable-next-line no-new-func
      const fn = new Function(src.replace("export default", "return"));
      fn();
    });
  });

  it("O+P: dry-run plans files without writing fixture", () => {
    const localeDir = path.join(FIXTURE_ROOT, "src", "i18n", "de");
    const feedPath = path.join(localeDir, "feed.ts");
    if (fs.existsSync(feedPath)) fs.unlinkSync(feedPath);

    const validation = {
      ok: true,
      targetLocale: "de",
      plannedChanges: [
        {
          keyPath: "feed.noResults",
          namespace: "feed",
          action: "add",
          current: null,
          next: "Keine Ergebnisse",
          status: "MACHINE_DRAFT"
        }
      ]
    };
    const beforeIndex = fs.readFileSync(path.join(localeDir, "index.ts"), "utf8");
    const plan = applyImportPlan(validation, {
      root: FIXTURE_ROOT,
      apply: false,
      dryRun: true
    });
    assert.equal(plan.mode, "DRY_RUN");
    assert.equal(plan.wrote, false);
    assert.equal(fs.existsSync(feedPath), false);
    assert.equal(fs.readFileSync(path.join(localeDir, "index.ts"), "utf8"), beforeIndex);
  });

  it("Q+R: safe APPLY + idempotency on fixture locale", () => {
    const validation = {
      ok: true,
      targetLocale: "de",
      plannedChanges: [
        {
          keyPath: "feed.noResults",
          namespace: "feed",
          action: "add",
          current: null,
          next: 'Test "escape" value',
          status: "MACHINE_DRAFT"
        },
        {
          keyPath: "feed.untitled",
          namespace: "feed",
          action: "add",
          current: null,
          next: "Ohne Titel",
          status: "MACHINE_DRAFT"
        }
      ]
    };
    const first = applyImportPlan(validation, {
      root: FIXTURE_ROOT,
      apply: true,
      dryRun: false,
      skipReviewOverrides: true
    });
    assert.equal(first.mode, "APPLY");
    assert.equal(first.wrote, true);
    const feedPath = path.join(FIXTURE_ROOT, "src", "i18n", "de", "feed.ts");
    assert.ok(fs.existsSync(feedPath));
    const content1 = fs.readFileSync(feedPath, "utf8");
    assert.match(content1, /Test \\"escape\\" value/);

    const indexSrc = fs.readFileSync(
      path.join(FIXTURE_ROOT, "src", "i18n", "de", "index.ts"),
      "utf8"
    );
    assert.match(indexSrc, /import feed from "\.\/feed"/);
    assert.match(indexSrc, /\.\.\.feed/);

    // Reload planned as noop for idempotency
    const validation2 = {
      ok: true,
      targetLocale: "de",
      plannedChanges: [
        {
          keyPath: "feed.noResults",
          namespace: "feed",
          action: "noop",
          current: 'Test "escape" value',
          next: 'Test "escape" value',
          status: "MACHINE_DRAFT"
        },
        {
          keyPath: "feed.untitled",
          namespace: "feed",
          action: "noop",
          current: "Ohne Titel",
          next: "Ohne Titel",
          status: "MACHINE_DRAFT"
        }
      ]
    };
    const second = applyImportPlan(validation2, {
      root: FIXTURE_ROOT,
      apply: true,
      dryRun: false,
      skipReviewOverrides: true
    });
    assert.equal(second.mode, "NO_CHANGES");
    assert.equal(second.wrote, false);
    assert.equal(fs.readFileSync(feedPath, "utf8"), content1);
  });

  it("S: refuses protected sk locale", () => {
    const r = validateImportPackage({
      targetLocale: "sk",
      entries: [{ keyPath: "feed.noResults", translation: "X" }]
    });
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => /protected locale/i.test(e)));
  });

  it("U: index wiring helper is stable", () => {
    const src = "import auth from \"./auth\";\n\nexport default {\n  ...auth\n};\n";
    const once = planIndexWiring(src, "feed");
    assert.equal(once.changed, true);
    const twice = planIndexWiring(once.next, "feed");
    assert.equal(twice.changed, false);
    assert.equal(twice.next, once.next);
  });
});

describe("source hash stale detection", () => {
  it("detects changed en-US values against snapshot", () => {
    const c = loadCatalogs();
    const snap = buildSourceHashes(c.refFlat);
    const key = Object.keys(snap.keys)[0];
    snap.keys[key].hash = "0000000000000000";
    const diff = diffAgainstSnapshot(c.refFlat, snap);
    assert.ok(diff.staleKeys.includes(key));
    assert.equal(diff.hasSnapshot, true);
  });
});

describe("inventory warning parity", () => {
  it("reports incomplete packs as incomplete readiness (not silent)", () => {
    const inv = buildInventory();
    const incomplete = inv.locales.filter(
      (l) => !l.isAlias && l.hasMessagePack && l.missing > 0
    );
    // After 4E.6 UK complete → 43 incomplete (FR 4D was 54; ES → 53; PL → 52; IT → 51; PT → 50; CS → 49; HU → 48; NL → 47; RO → 46; HR → 45; BG → 44; UK → 43)
    assert.equal(incomplete.length, 43);
    const de = inv.locales.find((l) => l.locale === "de");
    assert.equal(de.missing, 0);
    const fr = inv.locales.find((l) => l.locale === "fr");
    assert.equal(fr.missing, 0);
    assert.equal(fr.inheritedSourceKeys, 0);
    assert.equal(fr.explicitOwnKeys, inv.referenceKeyCount);
    const es = inv.locales.find((l) => l.locale === "es");
    assert.equal(es.missing, 0);
    assert.equal(es.inheritedSourceKeys, 0);
    assert.equal(es.explicitOwnKeys, inv.referenceKeyCount);
    const pl = inv.locales.find((l) => l.locale === "pl");
    assert.equal(pl.missing, 0);
    assert.equal(pl.inheritedSourceKeys, 0);
    assert.equal(pl.explicitOwnKeys, inv.referenceKeyCount);
    const it = inv.locales.find((l) => l.locale === "it");
    assert.equal(it.missing, 0);
    assert.equal(it.inheritedSourceKeys, 0);
    assert.equal(it.explicitOwnKeys, inv.referenceKeyCount);
    const pt = inv.locales.find((l) => l.locale === "pt");
    assert.equal(pt.missing, 0);
    assert.equal(pt.inheritedSourceKeys, 0);
    assert.equal(pt.explicitOwnKeys, inv.referenceKeyCount);
  });
});

describe("phase 4C.1 linguistic QA guards", () => {
  it("de remains technically complete with exclusive review statuses summing to ref", () => {
    const inv = buildInventory();
    const de = inv.locales.find((l) => l.locale === "de");
    assert.equal(de.missing, 0);
    assert.equal(de.inheritedSourceKeys, 0);
    assert.equal(de.availableKeys, de.referenceKeys);
    assert.equal(de.explicitOwnKeys, de.referenceKeys);
    const counts = de.statusCounts || {};
    const sum = Object.values(counts).reduce((a, b) => a + b, 0);
    assert.equal(sum, de.referenceKeys);
    assert.equal(counts.NEEDS_REVIEW || 0, 0);
    assert.ok((counts.INTENTIONALLY_UNCHANGED || 0) >= 50);
    assert.equal(counts.REVIEWED || 0, 0);
    assert.equal(counts.APPROVED || 0, 0);
  });

  it("common root/nested alias paths stay consistent", () => {
    const c = loadCatalogs();
    const flat = flatten(c.messages.de);
    const roots = Object.keys(flat).filter(
      (k) =>
        !k.startsWith("common.") &&
        (k.startsWith("errors.") ||
          k.startsWith("success.") ||
          k.startsWith("tokenShop.") ||
          k === "unknown")
    );
    for (const k of roots) {
      const nested = `common.${k}`;
      if (nested in flat) {
        assert.equal(flat[k], flat[nested], `mismatch ${k} vs ${nested}`);
      }
    }
    assert.equal(flat.events, flat["subcategories.events"]);
  });

  it("4C.1 glossary + human review package exist and cover 859 keys", () => {
    const glossaryPath = path.join(ROOT, "i18n-meta", "glossary.de.json");
    const hrPath = path.join(
      ROOT,
      "i18n-meta",
      "packages",
      "de-4c1-human-review.json"
    );
    assert.ok(fs.existsSync(glossaryPath));
    assert.ok(fs.existsSync(hrPath));
    const glossary = JSON.parse(fs.readFileSync(glossaryPath, "utf8"));
    assert.ok(Array.isArray(glossary.terms) && glossary.terms.length >= 15);
    assert.equal(glossary.addressStyle.decision.includes("du"), true);
    const hr = JSON.parse(fs.readFileSync(hrPath, "utf8"));
    assert.equal(hr.entryCount, 859);
    assert.ok(hr.entries.every((e) => e.sourceHash && e.keyPath && e.currentDe != null));
    assert.ok(!hr.entries.some((e) => e.reviewStatus === "APPROVED"));
  });

  it("confirmed 4C.1 terminology fixes are present in DE pack", () => {
    const c = loadCatalogs();
    const flat = flatten(c.messages.de);
    assert.equal(flat.contribute, "HELFEN");
    assert.equal(flat.contributions, "Hilfeaktionen");
    assert.equal(flat.privateContribution, "Private Hilfeaktion");
    assert.equal(flat["success.contributionSubmitted"], "Hilfeaktion erfolgreich gesendet");
    assert.match(flat["success.donationSuccessful"], /aufgestockt/);
    assert.equal(flat["posts.edit.donations"], "Auffüllungen");
    assert.equal(flat.aboutDonee, "Über den Donee");
    assert.equal(flat["tokensOnboarding.title"], "Wir stellen Tokens vor");
  });
});

describe("flat + auth APPLY support (4B.3)", () => {
  it("exports --inherited auth keys and --missing common", () => {
    const inh = buildExportPackage({
      locale: "de",
      onlyInherited: true,
      namespace: "auth",
      deterministic: true
    });
    assert.equal(inh.entryCount, 0, "all auth keys should be explicit after 4B.3");

    const miss = buildExportPackage({
      locale: "de",
      onlyMissing: true,
      namespace: "common",
      deterministic: true
    });
    assert.equal(miss.entryCount, 0);
  });

  it("flat common APPLY + idempotency on fixture", () => {
    const localeDir = path.join(FIXTURE_ROOT, "src", "i18n", "zz");
    fs.mkdirSync(localeDir, { recursive: true });
    fs.writeFileSync(
      path.join(localeDir, "index.ts"),
      'import auth from "./auth";\n\nexport default {\n  ...auth\n};\n',
      "utf8"
    );
    fs.writeFileSync(
      path.join(localeDir, "auth.ts"),
      'export default {\n  cancel: "X"\n};\n',
      "utf8"
    );

    // Use real locale "de" path under fixture via temporary rename — apply only
    // allows real app locales through validate; planFileChanges uses opts.root.
    const deDir = path.join(FIXTURE_ROOT, "src", "i18n", "de");
    const validation = {
      ok: true,
      targetLocale: "de",
      plannedChanges: [
        {
          keyPath: "unknown",
          namespace: "unknown",
          action: "add",
          current: null,
          next: "Unbekannt-FIXTURE",
          status: "MACHINE_DRAFT"
        },
        {
          keyPath: "errors.offline",
          namespace: "errors",
          action: "add",
          current: null,
          next: "Offline-FIXTURE",
          status: "MACHINE_DRAFT"
        }
      ]
    };
    // Isolate: write into a copy of de under fixture without touching repo de
    const bakCommon = path.join(deDir, "common.ts");
    const hadCommon = fs.existsSync(bakCommon);
    const prevCommon = hadCommon ? fs.readFileSync(bakCommon, "utf8") : null;
    const prevIndex = fs.readFileSync(path.join(deDir, "index.ts"), "utf8");

    try {
      // Ensure fixture de has minimal index (overwrite fixture de from before())
      fs.writeFileSync(
        path.join(deDir, "index.ts"),
        'import auth from "./auth";\n\nexport default {\n  ...auth\n};\n',
        "utf8"
      );
      if (hadCommon) fs.unlinkSync(bakCommon);

      const first = applyImportPlan(validation, {
        root: FIXTURE_ROOT,
        apply: true,
        dryRun: false,
        skipReviewOverrides: true
      });
      assert.equal(first.mode, "APPLY");
      assert.ok(fs.existsSync(bakCommon));
      const commonSrc = fs.readFileSync(bakCommon, "utf8");
      assert.match(commonSrc, /Unbekannt-FIXTURE/);
      assert.match(commonSrc, /Offline-FIXTURE/);
      const idx = fs.readFileSync(path.join(deDir, "index.ts"), "utf8");
      assert.match(idx, /\.\.\.common/);
      assert.match(idx, /(?:^|\n)\s*common\s*(?:,|\n)/);

      const second = applyImportPlan(
        {
          ok: true,
          targetLocale: "de",
          plannedChanges: validation.plannedChanges.map((p) => ({
            ...p,
            action: "noop",
            current: p.next
          }))
        },
        {
          root: FIXTURE_ROOT,
          apply: true,
          dryRun: false,
          skipReviewOverrides: true
        }
      );
      assert.equal(second.mode, "NO_CHANGES");
    } finally {
      // Restore fixture index; remove fixture common so later tests stay clean
      fs.writeFileSync(path.join(deDir, "index.ts"), prevIndex, "utf8");
      if (prevCommon != null) fs.writeFileSync(bakCommon, prevCommon, "utf8");
      else if (fs.existsSync(bakCommon)) fs.unlinkSync(bakCommon);
    }
  });

  it("refuses update of existing explicit DE without allowUpdates", () => {
    const r = validateImportPackage(
      {
        targetLocale: "de",
        entries: [
          {
            keyPath: "signIn",
            translation: "ANDERS",
            status: "MACHINE_DRAFT"
          }
        ]
      },
      { allowUpdates: false, allowedNamespaces: ["auth"] }
    );
    assert.equal(r.ok, false);
    assert.ok(r.errors.some((e) => /refuses to update existing/i.test(e)));
  });
});

describe("pilot package integrity", () => {
  it("V: pilot draft package validates and machine-draft statuses only", () => {
    const packPath = path.join(ROOT, "i18n-meta", "packages", "de-feed-machine-draft.json");
    assert.ok(fs.existsSync(packPath));
    const pkg = JSON.parse(fs.readFileSync(packPath, "utf8"));
    assert.equal(pkg.targetLocale, "de");
    assert.equal(pkg.filters.namespace, "feed");
    assert.equal(pkg.entryCount, 36);
    assert.ok(pkg.entries.every((e) => e.status === "MACHINE_DRAFT"));
    assert.ok(pkg.entries.every((e) => e.translation && e.translation.length > 0));
    const r = validateImportPackage(pkg, {
      allowedNamespaces: ["feed"],
      allowUpdates: false
    });
    assert.equal(r.ok, true);
    assert.equal(r.summary.noop, 36);
  });
});

describe("phase 4C.2 human review workflow", () => {
  const {
    buildHumanReviewPackage,
    validateHumanReviewPackage,
    applyHumanReviewPackage,
    isAttestationValid,
    detectStaleReviews,
    hashTranslation,
    REVIEWER_DECISIONS
  } = require("./lib/humanReview");

  it("exports 859 DE keys with empty reviewer decisions and priority buckets", () => {
    const pkg = buildHumanReviewPackage({ locale: "de", deterministic: true });
    assert.equal(pkg.entryCount, 859);
    assert.equal(pkg.uniqueKeyCount, 859);
    assert.ok(pkg.entries.every((e) => e.reviewerDecision === "NOT_REVIEWED"));
    assert.ok(pkg.entries.every((e) => e.sourceHash && e.keyPath));
    assert.ok(pkg.priorityCounts.P0_FIXED_4C1 >= 1);
    assert.ok(pkg.priorityCounts.P1_TERMINOLOGY >= 1);
    assert.ok(pkg.priorityCounts.P1_IDENTICAL_EN >= 1);
    const sumPri = Object.values(pkg.priorityCounts).reduce((a, b) => a + b, 0);
    assert.equal(sumPri, 859);
    assert.ok([...REVIEWER_DECISIONS].includes("ACCEPT"));
  });

  it("ACCEPT / CORRECT / REJECT / NEEDS_CONTEXT / NOT_REVIEWED semantics validate", () => {
    const c = loadCatalogs();
    const flat = flatten(c.messages.de);
    const keyAccept = "signIn";
    const keyCorrect = "feed.noResults";
    const keyReject = "faq";
    const keyCtx = "contribute";
    const keySkip = "welcomeTagline";

    const pkg = {
      targetLocale: "de",
      attestation: {
        reviewerId: "fixture.reviewer@example.com",
        reviewedAt: "2026-10-10T00:00:00.000Z",
        confirmedRealReview: true
      },
      entries: [
        {
          keyPath: keyAccept,
          sourceHash: hashValue(c.refFlat[keyAccept]),
          translationHash: hashTranslation(flat[keyAccept]),
          reviewerDecision: "ACCEPT"
        },
        {
          keyPath: keyCorrect,
          sourceHash: hashValue(c.refFlat[keyCorrect]),
          correctedTranslation: "Keine Treffer",
          reviewerDecision: "CORRECT"
        },
        {
          keyPath: keyReject,
          sourceHash: hashValue(c.refFlat[keyReject]),
          reviewerDecision: "REJECT"
        },
        {
          keyPath: keyCtx,
          sourceHash: hashValue(c.refFlat[keyCtx]),
          reviewerDecision: "NEEDS_CONTEXT"
        },
        {
          keyPath: keySkip,
          sourceHash: hashValue(c.refFlat[keySkip]),
          reviewerDecision: "NOT_REVIEWED"
        }
      ]
    };

    const v = validateHumanReviewPackage(pkg);
    assert.equal(v.ok, true, v.errors.join("; "));
    assert.equal(v.counts.ACCEPT, 1);
    assert.equal(v.counts.CORRECT, 1);
    assert.equal(v.counts.REJECT, 1);
    assert.equal(v.counts.NEEDS_CONTEXT, 1);
    assert.equal(v.counts.NOT_REVIEWED, 1);
    assert.equal(v.summary.catalogUpdates, 1);
    assert.equal(v.summary.qaFindings, 2);
  });

  it("rejects unknown key, duplicate key, bad decision, empty CORRECT, bad placeholder", () => {
    const c = loadCatalogs();
    const base = {
      targetLocale: "de",
      entries: [
        {
          keyPath: "feed.noResults",
          sourceHash: hashValue(c.refFlat["feed.noResults"]),
          reviewerDecision: "CORRECT",
          correctedTranslation: "x"
        }
      ]
    };
    assert.equal(
      validateHumanReviewPackage({
        ...base,
        entries: [{ keyPath: "no.such.key.ever", reviewerDecision: "ACCEPT" }]
      }).ok,
      false
    );
    assert.equal(
      validateHumanReviewPackage({
        ...base,
        entries: [
          { keyPath: "feed.noResults", sourceHash: hashValue(c.refFlat["feed.noResults"]), reviewerDecision: "ACCEPT" },
          { keyPath: "feed.noResults", sourceHash: hashValue(c.refFlat["feed.noResults"]), reviewerDecision: "ACCEPT" }
        ]
      }).ok,
      false
    );
    assert.equal(
      validateHumanReviewPackage({
        ...base,
        entries: [
          {
            keyPath: "feed.noResults",
            sourceHash: hashValue(c.refFlat["feed.noResults"]),
            reviewerDecision: "MAYBE"
          }
        ]
      }).ok,
      false
    );
    assert.equal(
      validateHumanReviewPackage({
        ...base,
        entries: [
          {
            keyPath: "feed.noResults",
            sourceHash: hashValue(c.refFlat["feed.noResults"]),
            reviewerDecision: "CORRECT",
            correctedTranslation: ""
          }
        ]
      }).ok,
      false
    );
    const phKey = c.refKeys.find(
      (k) => typeof c.refFlat[k] === "string" && /\{[a-zA-Z]+\}/.test(c.refFlat[k])
    );
    assert.ok(phKey);
    assert.equal(
      validateHumanReviewPackage({
        ...base,
        entries: [
          {
            keyPath: phKey,
            sourceHash: hashValue(c.refFlat[phKey]),
            reviewerDecision: "CORRECT",
            correctedTranslation: "ohne Platzhalter"
          }
        ]
      }).ok,
      false
    );
  });

  it("rejects stale source hash and fictional attestation on APPLY", () => {
    const c = loadCatalogs();
    const pkg = {
      targetLocale: "de",
      attestation: { reviewerId: "ai", confirmedRealReview: true, reviewedAt: "2026-01-01" },
      entries: [
        {
          keyPath: "feed.noResults",
          sourceHash: "0000000000000000",
          reviewerDecision: "ACCEPT"
        }
      ]
    };
    const v = validateHumanReviewPackage(pkg);
    assert.equal(v.ok, false);
    assert.ok(v.errors.some((e) => /sourceHash mismatch/i.test(e)));

    const att = isAttestationValid(pkg.attestation);
    assert.equal(att.ok, false);

    const dry = applyHumanReviewPackage(
      {
        targetLocale: "de",
        attestation: { reviewerId: "cursor", confirmedRealReview: true, reviewedAt: "x" },
        entries: [
          {
            keyPath: "feed.noResults",
            sourceHash: hashValue(c.refFlat["feed.noResults"]),
            reviewerDecision: "ACCEPT",
            translationHash: hashTranslation(flatten(c.messages.de)["feed.noResults"])
          }
        ]
      },
      { apply: true, dryRun: false, requireAttestation: true }
    );
    assert.equal(dry.ok, false);
    assert.equal(dry.mode, "APPLY_BLOCKED");
  });

  it("DRY RUN does not write review-overrides or qa-findings", () => {
    const c = loadCatalogs();
    const metaDir = path.join(FIXTURE_ROOT, "i18n-meta-hr-dry");
    fs.mkdirSync(metaDir, { recursive: true });
    const before = JSON.stringify(
      fs.existsSync(path.join(ROOT, "i18n-meta", "review-overrides.json"))
        ? JSON.parse(fs.readFileSync(path.join(ROOT, "i18n-meta", "review-overrides.json"), "utf8")).entries["de::signIn"]
        : null
    );
    const flat = flatten(c.messages.de);
    const r = applyHumanReviewPackage(
      {
        targetLocale: "de",
        attestation: {
          reviewerId: "real.reviewer@example.org",
          reviewedAt: "2026-10-10T12:00:00.000Z",
          confirmedRealReview: true
        },
        entries: [
          {
            keyPath: "signIn",
            sourceHash: hashValue(c.refFlat.signIn),
            translationHash: hashTranslation(flat.signIn),
            reviewerDecision: "ACCEPT"
          }
        ]
      },
      { apply: false, dryRun: true, metaDir }
    );
    assert.equal(r.ok, true);
    assert.equal(r.mode, "DRY_RUN");
    assert.equal(r.wrote, false);
    assert.equal(fs.existsSync(path.join(metaDir, "review-overrides.json")), false);
    const after = JSON.stringify(
      JSON.parse(fs.readFileSync(path.join(ROOT, "i18n-meta", "review-overrides.json"), "utf8"))
        .entries["de::signIn"]
    );
    assert.equal(after, before);
  });

  it("fixture APPLY with skipAttestation writes REVIEWED/QA only under metaDir", () => {
    const c = loadCatalogs();
    const metaDir = path.join(FIXTURE_ROOT, "i18n-meta-hr-apply");
    fs.mkdirSync(metaDir, { recursive: true });
    fs.writeFileSync(
      path.join(metaDir, "review-overrides.json"),
      JSON.stringify({ version: 1, entries: {} }, null, 2)
    );
    fs.writeFileSync(
      path.join(metaDir, "qa-findings.json"),
      JSON.stringify({ version: 1, findings: {} }, null, 2)
    );
    const flat = flatten(c.messages.de);
    const liveBefore = fs.readFileSync(
      path.join(ROOT, "i18n-meta", "review-overrides.json"),
      "utf8"
    );

    const r = applyHumanReviewPackage(
      {
        targetLocale: "de",
        attestation: {
          reviewerId: "fixture.reviewer",
          reviewedAt: "2026-10-10T12:00:00.000Z",
          confirmedRealReview: true
        },
        entries: [
          {
            keyPath: "signIn",
            sourceHash: hashValue(c.refFlat.signIn),
            translationHash: hashTranslation(flat.signIn),
            reviewerDecision: "ACCEPT"
          },
          {
            keyPath: "faq",
            sourceHash: hashValue(c.refFlat.faq),
            reviewerDecision: "NEEDS_CONTEXT"
          },
          {
            keyPath: "welcomeTagline",
            sourceHash: hashValue(c.refFlat.welcomeTagline),
            reviewerDecision: "NOT_REVIEWED"
          }
        ]
      },
      {
        apply: true,
        dryRun: false,
        skipAttestation: true,
        metaDir
        // no catalog CORRECT → live DE untouched
      }
    );
    assert.equal(r.ok, true, (r.errors || []).join("; "));
    assert.equal(r.wrote, true);
    const ov = JSON.parse(fs.readFileSync(path.join(metaDir, "review-overrides.json"), "utf8"));
    assert.equal(ov.entries["de::signIn"].status, "REVIEWED");
    assert.ok(ov.entries["de::signIn"].review.reviewedTranslationHash);
    const qa = JSON.parse(fs.readFileSync(path.join(metaDir, "qa-findings.json"), "utf8"));
    assert.equal(qa.findings["de::faq"].open, true);
    assert.equal(qa.findings["de::faq"].kind, "NEEDS_CONTEXT");
    // Live overrides unchanged
    assert.equal(
      fs.readFileSync(path.join(ROOT, "i18n-meta", "review-overrides.json"), "utf8"),
      liveBefore
    );
    // Live DE still has zero REVIEWED from this fixture apply
    const inv = buildInventory();
    const de = inv.locales.find((l) => l.locale === "de");
    assert.equal(de.statusCounts.REVIEWED || 0, 0);
    assert.equal(de.statusCounts.APPROVED || 0, 0);
  });

  it("detectStaleReviews returns array (no throw) and openQaFindings is separate metric", () => {
    const stale = detectStaleReviews("de");
    assert.ok(Array.isArray(stale));
    const inv = buildInventory();
    const de = inv.locales.find((l) => l.locale === "de");
    assert.equal(typeof de.openQaFindings, "number");
    // Primary status sum still exclusive
    const sum = Object.values(de.statusCounts).reduce((a, b) => a + b, 0);
    assert.equal(sum, de.referenceKeys);
  });
});

describe("phase 4E.3 release readiness reporting", () => {
  const {
    buildReleaseReadinessReport,
    formatReleaseReadinessText,
    PRIMARY_STATUSES
  } = require("./lib/releaseReadiness");

  it("builds report for 59 UI locales with exclusive PT status sum 859", () => {
    const report = buildReleaseReadinessReport();
    assert.equal(report.totals.uiLanguages, 59);
    assert.equal(report.totals.messagePacks, 58);
    assert.equal(report.totals.referenceKeys, 859);
    // 4E.6: UK complete → 15 technically complete / 43 incomplete
    assert.equal(report.totals.technicallyCompletePacks, 15);
    assert.equal(report.totals.incompletePacks, 43);
    assert.equal(report.locales.length, 59);

    const pt = report.ptExactReviewInventory;
    assert.ok(pt);
    assert.equal(pt.sum, 859);
    assert.equal(pt.sumOk, true);
    assert.equal(pt.REVIEWED, 0);
    assert.equal(pt.APPROVED, 0);
    assert.equal(
      pt.MACHINE_DRAFT +
        pt.EXISTING_UNREVIEWED +
        pt.INTENTIONALLY_UNCHANGED +
        pt.NEEDS_REVIEW +
        pt.REVIEWED +
        pt.APPROVED,
      859
    );
    assert.equal(pt.regionalDecision, "PRODUCT_DECISION_REQUIRED");
  });

  it("never marks overall READY from FE coverage alone; open QA separate from APPROVED", () => {
    const report = buildReleaseReadinessReport();
    for (const loc of ["de", "fr", "es", "pl", "it", "pt"]) {
      const row = report.locales.find((l) => l.locale === loc);
      assert.ok(row);
      assert.equal(row.dimensions.feCatalogCoverage.status, "READY");
      assert.notEqual(row.dimensions.overallReadiness.status, "READY");
      assert.equal(row.statusCounts.APPROVED, 0);
      assert.ok(row.openQaFindingsCount >= 0);
      // open QA must not inflate primary status sum
      const sum = PRIMARY_STATUSES.reduce(
        (a, k) => a + (row.statusCounts[k] || 0),
        0
      );
      assert.equal(sum, 859);
    }
    assert.ok(report.productDecisionsOpen.length >= 1);
    assert.ok(
      report.productDecisionsOpen.some((d) => d.id === "PD-PT-REGION-001")
    );
    const text = formatReleaseReadinessText(report);
    assert.match(text, /PT exact review inventory/);
    assert.match(text, /FE catalog READY ≠ human APPROVED/);
  });
});
