#!/usr/bin/env node
/**
 * Smoke-check SK/EN plural pipe forms (Phase 3).
 * Exit non-zero on unexpected Slovak forms for resultsCount / tokensMeta.
 */
const path = require("path");
const os = require("os");
const esbuild = require("esbuild");
const { createI18n } = require("vue-i18n");

const outfile = path.join(os.tmpdir(), `dreamhubb-i18n-plural-${process.pid}.cjs`);
esbuild.buildSync({
  entryPoints: [path.join(__dirname, "..", "src", "i18n", "index.ts")],
  bundle: true,
  platform: "node",
  format: "cjs",
  outfile,
  logLevel: "silent"
});

const messages = require(outfile).default || require(outfile);

/**
 * Slovak CLDR (Unicode): one=n===1; few=n===2|3|4 only; many=decimals; other=rest.
 * NOT the old mod10 heuristic (21≠one, 22–24≠few). Cross-checked via Intl.PluralRules('sk').
 */
function skPluralRule(choice, choicesLength) {
  const n = Math.abs(Number(choice));
  const isInteger = Number.isFinite(n) && Math.floor(n) === n;
  if (!isInteger) {
    if (choicesLength >= 4) return 3;
    if (choicesLength === 2) return 1;
    return Math.min(2, Math.max(0, choicesLength - 1));
  }
  const isOne = n === 1;
  const isFew = n === 2 || n === 3 || n === 4;
  if (choicesLength >= 4) {
    if (n === 0) return 0; // UX zero
    if (isOne) return 1;
    if (isFew) return 2;
    return 3;
  }
  if (choicesLength === 2) return isOne ? 0 : 1;
  if (isOne) return 0;
  if (isFew) return 1;
  return Math.min(2, Math.max(0, choicesLength - 1));
}

/** Polish CLDR: one=exactly 1; few=2–4 except 12–14 (incl. 22–24); decimals→other; 0→UX zero */
function plPluralRule(choice, choicesLength) {
  const n = Math.abs(Number(choice));
  const isInteger = Number.isFinite(n) && Math.floor(n) === n;
  if (!isInteger) {
    if (choicesLength >= 4) return 3;
    if (choicesLength === 2) return 1;
    return Math.min(2, Math.max(0, choicesLength - 1));
  }
  const mod10 = n % 10;
  const mod100 = n % 100;
  const isOne = n === 1;
  const isFew = mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14);
  if (choicesLength >= 4) {
    if (n === 0) return 0;
    if (isOne) return 1;
    if (isFew) return 2;
    return 3;
  }
  if (choicesLength === 2) return isOne ? 0 : 1;
  if (isOne) return 0;
  if (isFew) return 1;
  return Math.min(2, Math.max(0, choicesLength - 1));
}

/**
 * Czech CLDR (Unicode): one=n===1; few=n===2|3|4 only; many=decimals; other=rest.
 * NOT Polish — 22–24 are other ("výsledků"), not few.
 * Expectations below are independent of this function (also cross-checked via Intl.PluralRules).
 */
function csPluralRule(choice, choicesLength) {
  const n = Math.abs(Number(choice));
  const isInteger = Number.isFinite(n) && Math.floor(n) === n;
  if (!isInteger) {
    if (choicesLength >= 4) return 3;
    if (choicesLength === 2) return 1;
    return Math.min(2, Math.max(0, choicesLength - 1));
  }
  const isOne = n === 1;
  const isFew = n === 2 || n === 3 || n === 4;
  if (choicesLength >= 4) {
    if (n === 0) return 0; // UX zero
    if (isOne) return 1;
    if (isFew) return 2;
    return 3;
  }
  if (choicesLength === 2) return isOne ? 0 : 1;
  if (isOne) return 0;
  if (isFew) return 1;
  return Math.min(2, Math.max(0, choicesLength - 1));
}

/**
 * Romanian CLDR: one=n===1; few=0|2–19|101–119 (+decimals); other=20–100|120+.
 * Independent of SK/CS/PL. Cross-checked via Intl.PluralRules('ro').
 */
function roPluralRule(choice, choicesLength) {
  const n = Math.abs(Number(choice));
  const isInteger = Number.isFinite(n) && Math.floor(n) === n;
  const mod100 = isInteger ? n % 100 : -1;
  const isOne = isInteger && n === 1;
  const isFew =
    !isInteger || n === 0 || (mod100 >= 1 && mod100 <= 19 && n !== 1);
  if (choicesLength >= 4) {
    if (isInteger && n === 0) return 0;
    if (isOne) return 1;
    if (isFew) return 2;
    return 3;
  }
  if (choicesLength === 2) return isOne ? 0 : 1;
  if (isOne) return 0;
  if (isFew) return 1;
  return Math.min(2, Math.max(0, choicesLength - 1));
}

const i18n = createI18n({
  locale: "sk",
  fallbackLocale: "en-US",
  legacy: false,
  messages,
  pluralRules: {
    sk: skPluralRule,
    pl: plPluralRule,
    cs: csPluralRule,
    ro: roPluralRule,
    hr: hrPluralRule,
    uk: ukPluralRule
  }
});

/** Croatian CLDR: one=i%10=1≠11; few=2–4 except teens; other=rest (+ fractional digit rules) */
function hrPluralRule(choice, choicesLength) {
  const n = Math.abs(Number(choice));
  const isInteger = Number.isFinite(n) && Math.floor(n) === n;
  let isOne = false;
  let isFew = false;
  if (isInteger) {
    const mod10 = n % 10;
    const mod100 = n % 100;
    isOne = mod10 === 1 && mod100 !== 11;
    isFew = mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14);
  } else {
    const frac = String(n).split(".")[1] || "";
    const f = parseInt(frac.replace(/0+$/, "") || "0", 10) || 0;
    const fMod10 = f % 10;
    const fMod100 = f % 100;
    isOne = fMod10 === 1 && fMod100 !== 11;
    isFew = fMod10 >= 2 && fMod10 <= 4 && !(fMod100 >= 12 && fMod100 <= 14);
  }
  if (choicesLength >= 4) {
    if (isInteger && n === 0) return 0;
    if (isOne) return 1;
    if (isFew) return 2;
    return 3;
  }
  if (choicesLength === 2) return isOne ? 0 : 1;
  if (isOne) return 0;
  if (isFew) return 1;
  return Math.min(2, Math.max(0, choicesLength - 1));
}

/** Ukrainian CLDR: one/few/many integers; other=decimals → many pipe */
function ukPluralRule(choice, choicesLength) {
  const n = Math.abs(Number(choice));
  const isInteger = Number.isFinite(n) && Math.floor(n) === n;
  if (!isInteger) {
    if (choicesLength >= 4) return 3;
    if (choicesLength === 2) return 1;
    return Math.min(2, Math.max(0, choicesLength - 1));
  }
  const mod10 = n % 10;
  const mod100 = n % 100;
  const isOne = mod10 === 1 && mod100 !== 11;
  const isFew = mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14);
  if (choicesLength >= 4) {
    if (n === 0) return 0;
    if (isOne) return 1;
    if (isFew) return 2;
    return 3;
  }
  if (choicesLength === 2) return isOne ? 0 : 1;
  if (isOne) return 0;
  if (isFew) return 1;
  return Math.min(2, Math.max(0, choicesLength - 1));
}

const t = i18n.global.t.bind(i18n.global);
const counts = [0, 1, 2, 4, 5, 11, 21, 101];

let failed = 0;

// Slovak: 4 forms + slovakPluralRule — CLDR-independent table + Intl.PluralRules('sk')
i18n.global.locale.value = "sk";
const skIntl = new Intl.PluralRules("sk");
const skCounts = [0, 1, 2, 3, 4, 5, 11, 21, 22, 23, 24, 25, 101, 102, 111, 112];
/** @type {Record<number, {cldr: string, index: number, text: string}>} */
const skResultsExpected = {
  0: { cldr: "other", index: 0, text: "Žiadne výsledky" }, // UX zero
  1: { cldr: "one", index: 1, text: "1 výsledok" },
  2: { cldr: "few", index: 2, text: "2 výsledky" },
  3: { cldr: "few", index: 2, text: "3 výsledky" },
  4: { cldr: "few", index: 2, text: "4 výsledky" },
  5: { cldr: "other", index: 3, text: "5 výsledkov" },
  11: { cldr: "other", index: 3, text: "11 výsledkov" },
  21: { cldr: "other", index: 3, text: "21 výsledkov" },
  22: { cldr: "other", index: 3, text: "22 výsledkov" },
  23: { cldr: "other", index: 3, text: "23 výsledkov" },
  24: { cldr: "other", index: 3, text: "24 výsledkov" },
  25: { cldr: "other", index: 3, text: "25 výsledkov" },
  101: { cldr: "other", index: 3, text: "101 výsledkov" },
  102: { cldr: "other", index: 3, text: "102 výsledkov" },
  111: { cldr: "other", index: 3, text: "111 výsledkov" },
  112: { cldr: "other", index: 3, text: "112 výsledkov" }
};
console.log("SK feed.resultsCount (CLDR-independent table)");
console.log("locale | n | CLDR | Intl | idx | got | expected | result");
for (const n of skCounts) {
  const exp = skResultsExpected[n];
  const intlCat = skIntl.select(n);
  const idx = skPluralRule(n, 4);
  const got = t("feed.resultsCount", n, { n });
  const ok = intlCat === exp.cldr && idx === exp.index && got === exp.text;
  console.log(
    `  sk | ${n} | ${exp.cldr} | ${intlCat} | ${idx} | ${got} | ${exp.text} | ${
      ok ? "PASS" : "FAIL"
    }`
  );
  if (!ok) failed++;
}

console.log("SK feed.resultsCount decimals (CLDR many → other pipe; UI uses integers)");
for (const n of [0.5, 1.5, 2.5, 3.5, 10.5]) {
  const intlCat = skIntl.select(n);
  const idx = skPluralRule(n, 4);
  const got = t("feed.resultsCount", n, { n });
  const ok = intlCat === "many" && idx === 3 && String(got).includes("výsledkov");
  console.log(
    `  sk | ${n} | many | ${intlCat} | ${idx} | ${got} | …výsledkov | ${
      ok ? "PASS" : "FAIL"
    }`
  );
  if (!ok) failed++;
}

// 3-form SK tokens (one | few | other) — no UX zero pipe; 0 → other
const skTokensExpected = {
  0: "0 tokenov",
  1: "1 token",
  2: "2 tokeny",
  3: "3 tokeny",
  4: "4 tokeny",
  5: "5 tokenov",
  11: "11 tokenov",
  21: "21 tokenov",
  22: "22 tokenov",
  25: "25 tokenov",
  101: "101 tokenov",
  102: "102 tokenov"
};
console.log("SK profileUi.tokensMeta (3-form)");
for (const n of [0, 1, 2, 3, 4, 5, 11, 21, 22, 25, 101, 102]) {
  const got = t("profileUi.tokensMeta", n, { n });
  const exp = skTokensExpected[n];
  const ok = got === exp;
  console.log(`  ${n}: ${got}${ok ? "" : `  ✗ expected ${exp}`}`);
  if (!ok) failed++;
}

i18n.global.locale.value = "en-US";
console.log("EN feed.resultsCount");
for (const n of [0, 1, 2, 5]) {
  console.log(`  ${n}: ${t("feed.resultsCount", n, { n })}`);
}

// German: 3 pipe forms (zero | one | other) — do not assume Slovak rules
i18n.global.locale.value = "de";
const deResultsExpected = {
  0: "Keine Ergebnisse",
  1: "1 Ergebnis",
  2: "2 Ergebnisse",
  5: "5 Ergebnisse",
  11: "11 Ergebnisse",
  21: "21 Ergebnisse",
  101: "101 Ergebnisse"
};
console.log("DE feed.resultsCount");
for (const n of [0, 1, 2, 5, 11, 21, 101]) {
  const got = t("feed.resultsCount", n, { n });
  const exp = deResultsExpected[n];
  const ok = got === exp;
  console.log(`  ${n}: ${got}${ok ? "" : `  ✗ expected ${exp}`}`);
  if (!ok) failed++;
}

// French: vue-i18n default (one | other); pipe form is zero | one | other
i18n.global.locale.value = "fr";
const frResultsExpected = {
  0: "Aucun résultat",
  1: "1 résultat",
  2: "2 résultats",
  4: "4 résultats",
  5: "5 résultats",
  11: "11 résultats",
  21: "21 résultats",
  101: "101 résultats"
};
console.log("FR feed.resultsCount");
for (const n of counts) {
  const got = t("feed.resultsCount", n, { n });
  const exp = frResultsExpected[n];
  const ok = got === exp;
  console.log(`  ${n}: ${got}${ok ? "" : `  ✗ expected ${exp}`}`);
  if (!ok) failed++;
}

// Spanish: vue-i18n default-compatible 3 forms
i18n.global.locale.value = "es";
const esResultsExpected = {
  0: "Ningún resultado",
  1: "1 resultado",
  2: "2 resultados",
  4: "4 resultados",
  5: "5 resultados",
  11: "11 resultados",
  21: "21 resultados",
  101: "101 resultados"
};
console.log("ES feed.resultsCount");
for (const n of counts) {
  const got = t("feed.resultsCount", n, { n });
  const exp = esResultsExpected[n];
  const ok = got === exp;
  console.log(`  ${n}: ${got}${ok ? "" : `  ✗ expected ${exp}`}`);
  if (!ok) failed++;
}

// Polish: 4 forms + polishPluralRule (one = exactly 1)
i18n.global.locale.value = "pl";
const plCounts = [0, 1, 2, 3, 4, 5, 11, 12, 14, 21, 22, 24, 25, 101, 102, 111, 112];
const plResultsExpected = {
  0: "Brak wyników",
  1: "1 wynik",
  2: "2 wyniki",
  3: "3 wyniki",
  4: "4 wyniki",
  5: "5 wyników",
  11: "11 wyników",
  12: "12 wyników",
  14: "14 wyników",
  21: "21 wyników",
  22: "22 wyniki",
  24: "24 wyniki",
  25: "25 wyników",
  101: "101 wyników",
  102: "102 wyniki",
  111: "111 wyników",
  112: "112 wyników"
};
console.log("PL feed.resultsCount");
for (const n of plCounts) {
  const got = t("feed.resultsCount", n, { n });
  const exp = plResultsExpected[n];
  const ok = got === exp;
  console.log(`  ${n}: ${got}${ok ? "" : `  ✗ expected ${exp}`}`);
  if (!ok) failed++;
}

// PL decimals → CLDR other (many/other pipe index); UI currently passes integers only
console.log("PL feed.resultsCount decimals (CLDR other)");
for (const n of [0.5, 1.5, 2.5]) {
  const got = t("feed.resultsCount", n, { n });
  const ok = String(got).includes("wyników");
  console.log(`  ${n}: ${got}${ok ? "" : "  ✗ expected …wyników (other)"}`);
  if (!ok) failed++;
}

// Italian / Portuguese: EN-compatible 3 forms (default vue-i18n)
i18n.global.locale.value = "it";
const itResultsExpected = {
  0: "Nessun risultato",
  1: "1 risultato",
  2: "2 risultati",
  5: "5 risultati",
  21: "21 risultati",
  101: "101 risultati"
};
console.log("IT feed.resultsCount");
for (const n of [0, 1, 2, 5, 21, 101]) {
  const got = t("feed.resultsCount", n, { n });
  const exp = itResultsExpected[n];
  const ok = got === exp;
  console.log(`  ${n}: ${got}${ok ? "" : `  ✗ expected ${exp}`}`);
  if (!ok) failed++;
}

i18n.global.locale.value = "pt";
const ptResultsExpected = {
  0: "Nenhum resultado",
  1: "1 resultado",
  2: "2 resultados",
  5: "5 resultados",
  21: "21 resultados",
  101: "101 resultados"
};
console.log("PT feed.resultsCount");
for (const n of [0, 1, 2, 5, 21, 101]) {
  const got = t("feed.resultsCount", n, { n });
  const exp = ptResultsExpected[n];
  const ok = got === exp;
  console.log(`  ${n}: ${got}${ok ? "" : `  ✗ expected ${exp}`}`);
  if (!ok) failed++;
}

// Czech: 4 forms + czechPluralRule — expectations from Unicode CLDR + natural Czech
// (independent of implementation; cross-checked with Intl.PluralRules('cs'))
i18n.global.locale.value = "cs";
const csIntl = new Intl.PluralRules("cs");
const csCounts = [0, 1, 2, 3, 4, 5, 11, 21, 22, 23, 24, 25, 101, 102, 111, 112];
/** @type {Record<number, {cldr: string, index: number, text: string}>} */
const csResultsExpected = {
  0: { cldr: "other", index: 0, text: "Žádné výsledky" }, // UX zero (CLDR other)
  1: { cldr: "one", index: 1, text: "1 výsledek" },
  2: { cldr: "few", index: 2, text: "2 výsledky" },
  3: { cldr: "few", index: 2, text: "3 výsledky" },
  4: { cldr: "few", index: 2, text: "4 výsledky" },
  5: { cldr: "other", index: 3, text: "5 výsledků" },
  11: { cldr: "other", index: 3, text: "11 výsledků" },
  21: { cldr: "other", index: 3, text: "21 výsledků" },
  22: { cldr: "other", index: 3, text: "22 výsledků" },
  23: { cldr: "other", index: 3, text: "23 výsledků" },
  24: { cldr: "other", index: 3, text: "24 výsledků" },
  25: { cldr: "other", index: 3, text: "25 výsledků" },
  101: { cldr: "other", index: 3, text: "101 výsledků" },
  102: { cldr: "other", index: 3, text: "102 výsledků" },
  111: { cldr: "other", index: 3, text: "111 výsledků" },
  112: { cldr: "other", index: 3, text: "112 výsledků" }
};
console.log("CS feed.resultsCount (CLDR-independent table)");
console.log("locale | n | CLDR | Intl | idx | got | expected | result");
for (const n of csCounts) {
  const exp = csResultsExpected[n];
  const intlCat = csIntl.select(n);
  const idx = csPluralRule(n, 4);
  const got = t("feed.resultsCount", n, { n });
  const cldrOk = intlCat === exp.cldr;
  const idxOk = idx === exp.index;
  const textOk = got === exp.text;
  const ok = cldrOk && idxOk && textOk;
  console.log(
    `  cs | ${n} | ${exp.cldr} | ${intlCat} | ${idx} | ${got} | ${exp.text} | ${ok ? "PASS" : "FAIL"}` +
      (!cldrOk ? " ✗CLDR" : "") +
      (!idxOk ? ` ✗idx want ${exp.index}` : "") +
      (!textOk ? " ✗text" : "")
  );
  if (!ok) failed++;
}

// CS decimals: CLDR many; catalogs have no many pipe → map to other (index 3)
console.log("CS feed.resultsCount decimals (CLDR many → other pipe; UI uses integers)");
for (const n of [0.5, 1.5, 2.5, 3.5, 10.5]) {
  const intlCat = csIntl.select(n);
  const idx = csPluralRule(n, 4);
  const got = t("feed.resultsCount", n, { n });
  const ok = intlCat === "many" && idx === 3 && String(got).includes("výsledků");
  console.log(
    `  cs | ${n} | many | ${intlCat} | ${idx} | ${got} | …výsledků | ${ok ? "PASS" : "FAIL"}`
  );
  if (!ok) failed++;
}

// Critical SK / CS / PL contrast at 22 and 102
console.log("SK vs CS vs PL contrast at n=22 and n=102");
{
  const cases = [
    [22, { sk: "22 výsledkov", cs: "22 výsledků", pl: "22 wyniki" }],
    [102, { sk: "102 výsledkov", cs: "102 výsledků", pl: "102 wyniki" }]
  ];
  for (const [n, exp] of cases) {
    i18n.global.locale.value = "sk";
    const skT = t("feed.resultsCount", n, { n });
    i18n.global.locale.value = "cs";
    const csT = t("feed.resultsCount", n, { n });
    i18n.global.locale.value = "pl";
    const plT = t("feed.resultsCount", n, { n });
    const ok = skT === exp.sk && csT === exp.cs && plT === exp.pl;
    console.log(
      `  n=${n} SK=${skT} CS=${csT} PL=${plT} | ${ok ? "PASS" : "FAIL"}`
    );
    if (!ok) failed++;
  }
}

// Hungarian: EN-compatible 3 forms (default vue-i18n; no custom rule)
i18n.global.locale.value = "hu";
const huResultsExpected = {
  0: "Nincs találat",
  1: "1 találat",
  2: "2 találat",
  5: "5 találat",
  11: "11 találat",
  21: "21 találat",
  22: "22 találat",
  25: "25 találat",
  101: "101 találat"
};
console.log("HU feed.resultsCount");
for (const n of [0, 1, 2, 5, 11, 21, 22, 25, 101]) {
  const got = t("feed.resultsCount", n, { n });
  const exp = huResultsExpected[n];
  const ok = got === exp;
  console.log(`  ${n}: ${got}${ok ? "" : `  ✗ expected ${exp}`}`);
  if (!ok) failed++;
}

// Dutch: EN-compatible 3 forms (default vue-i18n; CLDR one/other; cross-check Intl)
i18n.global.locale.value = "nl";
const nlIntl = new Intl.PluralRules("nl");
const nlResultsExpected = {
  0: { cldr: "other", text: "Geen resultaten" },
  1: { cldr: "one", text: "1 resultaat" },
  2: { cldr: "other", text: "2 resultaten" },
  5: { cldr: "other", text: "5 resultaten" },
  11: { cldr: "other", text: "11 resultaten" },
  21: { cldr: "other", text: "21 resultaten" },
  22: { cldr: "other", text: "22 resultaten" },
  25: { cldr: "other", text: "25 resultaten" },
  101: { cldr: "other", text: "101 resultaten" },
  102: { cldr: "other", text: "102 resultaten" }
};
console.log("NL feed.resultsCount (CLDR-independent)");
for (const n of [0, 1, 2, 5, 11, 21, 22, 25, 101, 102]) {
  const exp = nlResultsExpected[n];
  const intlCat = nlIntl.select(n);
  const got = t("feed.resultsCount", n, { n });
  const ok = intlCat === exp.cldr && got === exp.text;
  console.log(
    `  nl | ${n} | ${exp.cldr} | ${intlCat} | ${got} | ${exp.text} | ${ok ? "PASS" : "FAIL"}`
  );
  if (!ok) failed++;
}
// NL decimals: CLDR other. UI counts are integers; default vue-i18n may not accept fractional choice.
console.log("NL decimals (CLDR via Intl only; UI uses integers)");
for (const n of [0.5, 1.5, 2.5]) {
  const intlCat = nlIntl.select(n);
  const ok = intlCat === "other";
  console.log(`  nl | ${n} | other | ${intlCat} | ${ok ? "PASS" : "FAIL"}`);
  if (!ok) failed++;
}

// Romanian: 4 forms + romanianPluralRule — CLDR-independent table
i18n.global.locale.value = "ro";
const roIntl = new Intl.PluralRules("ro");
const roCounts = [
  0, 1, 2, 3, 4, 5, 11, 19, 20, 21, 22, 25, 99, 100, 101, 102, 111, 112, 119, 120
];
/** @type {Record<number, {cldr: string, index: number, text: string}>} */
const roResultsExpected = {
  0: { cldr: "few", index: 0, text: "Niciun rezultat" }, // UX zero
  1: { cldr: "one", index: 1, text: "1 rezultat" },
  2: { cldr: "few", index: 2, text: "2 rezultate" },
  3: { cldr: "few", index: 2, text: "3 rezultate" },
  4: { cldr: "few", index: 2, text: "4 rezultate" },
  5: { cldr: "few", index: 2, text: "5 rezultate" },
  11: { cldr: "few", index: 2, text: "11 rezultate" },
  19: { cldr: "few", index: 2, text: "19 rezultate" },
  20: { cldr: "other", index: 3, text: "20 de rezultate" },
  21: { cldr: "other", index: 3, text: "21 de rezultate" },
  22: { cldr: "other", index: 3, text: "22 de rezultate" },
  25: { cldr: "other", index: 3, text: "25 de rezultate" },
  99: { cldr: "other", index: 3, text: "99 de rezultate" },
  100: { cldr: "other", index: 3, text: "100 de rezultate" },
  101: { cldr: "few", index: 2, text: "101 rezultate" },
  102: { cldr: "few", index: 2, text: "102 rezultate" },
  111: { cldr: "few", index: 2, text: "111 rezultate" },
  112: { cldr: "few", index: 2, text: "112 rezultate" },
  119: { cldr: "few", index: 2, text: "119 rezultate" },
  120: { cldr: "other", index: 3, text: "120 de rezultate" }
};
console.log("RO feed.resultsCount (CLDR-independent table)");
for (const n of roCounts) {
  const exp = roResultsExpected[n];
  const intlCat = roIntl.select(n);
  const idx = roPluralRule(n, 4);
  const got = t("feed.resultsCount", n, { n });
  const ok = intlCat === exp.cldr && idx === exp.index && got === exp.text;
  console.log(
    `  ro | ${n} | ${exp.cldr} | ${intlCat} | ${idx} | ${got} | ${exp.text} | ${
      ok ? "PASS" : "FAIL"
    }`
  );
  if (!ok) failed++;
}
console.log("RO critical pairs 19/20, 100/101, 119/120");
for (const [a, b] of [
  [19, 20],
  [20, 21],
  [21, 101],
  [22, 102],
  [100, 101],
  [119, 120]
]) {
  const ta = t("feed.resultsCount", a, { n: a });
  const tb = t("feed.resultsCount", b, { n: b });
  const ok = ta === roResultsExpected[a].text && tb === roResultsExpected[b].text;
  console.log(`  ${a}→${ta} | ${b}→${tb} | ${ok ? "PASS" : "FAIL"}`);
  if (!ok) failed++;
}
console.log("RO decimals (CLDR few → few pipe index 2)");
for (const n of [0.5, 1.5, 2.5]) {
  const intlCat = roIntl.select(n);
  const idx = roPluralRule(n, 4);
  const got = t("feed.resultsCount", n, { n });
  const ok = intlCat === "few" && idx === 2 && String(got).includes("rezultate");
  console.log(
    `  ro | ${n} | few | ${intlCat} | ${idx} | ${got} | ${ok ? "PASS" : "FAIL"}`
  );
  if (!ok) failed++;
}

// Croatian: 4 forms + croatianPluralRule — 21=one (≠ SK/CS/PL)
i18n.global.locale.value = "hr";
const hrIntl = new Intl.PluralRules("hr");
const hrCounts = [0, 1, 2, 3, 4, 5, 11, 12, 14, 21, 22, 23, 24, 25, 101, 102, 111, 112];
const hrResultsExpected = {
  0: { cldr: "other", index: 0, text: "Nema rezultata" },
  1: { cldr: "one", index: 1, text: "1 rezultat" },
  2: { cldr: "few", index: 2, text: "2 rezultata" },
  3: { cldr: "few", index: 2, text: "3 rezultata" },
  4: { cldr: "few", index: 2, text: "4 rezultata" },
  5: { cldr: "other", index: 3, text: "5 rezultata" },
  11: { cldr: "other", index: 3, text: "11 rezultata" },
  12: { cldr: "other", index: 3, text: "12 rezultata" },
  14: { cldr: "other", index: 3, text: "14 rezultata" },
  21: { cldr: "one", index: 1, text: "21 rezultat" },
  22: { cldr: "few", index: 2, text: "22 rezultata" },
  23: { cldr: "few", index: 2, text: "23 rezultata" },
  24: { cldr: "few", index: 2, text: "24 rezultata" },
  25: { cldr: "other", index: 3, text: "25 rezultata" },
  101: { cldr: "one", index: 1, text: "101 rezultat" },
  102: { cldr: "few", index: 2, text: "102 rezultata" },
  111: { cldr: "other", index: 3, text: "111 rezultata" },
  112: { cldr: "other", index: 3, text: "112 rezultata" }
};
console.log("HR feed.resultsCount (CLDR-independent; 21=one)");
for (const n of hrCounts) {
  const exp = hrResultsExpected[n];
  const intlCat = hrIntl.select(n);
  const idx = hrPluralRule(n, 4);
  const got = t("feed.resultsCount", n, { n });
  const ok = intlCat === exp.cldr && idx === exp.index && got === exp.text;
  console.log(
    `  hr | ${n} | ${exp.cldr} | ${intlCat} | ${idx} | ${got} | ${exp.text} | ${
      ok ? "PASS" : "FAIL"
    }`
  );
  if (!ok) failed++;
}
console.log("HR vs SK contrast at n=21 (HR one, SK other)");
{
  i18n.global.locale.value = "hr";
  const hr21 = t("feed.resultsCount", 21, { n: 21 });
  i18n.global.locale.value = "sk";
  const sk21 = t("feed.resultsCount", 21, { n: 21 });
  const ok = hr21 === "21 rezultat" && sk21 === "21 výsledkov";
  console.log(`  HR=${hr21} SK=${sk21} | ${ok ? "PASS" : "FAIL"}`);
  if (!ok) failed++;
}

// Ukrainian: 4 forms + ukrainianPluralRule — 21=one, 22=few, 25=many
i18n.global.locale.value = "uk";
const ukIntl = new Intl.PluralRules("uk");
const ukCounts = [0, 1, 2, 3, 4, 5, 11, 12, 14, 21, 22, 23, 24, 25, 100, 101, 102, 111, 112];
const ukResultsExpected = {
  0: { cldr: "many", index: 0, text: "Немає результатів" },
  1: { cldr: "one", index: 1, text: "1 результат" },
  2: { cldr: "few", index: 2, text: "2 результати" },
  3: { cldr: "few", index: 2, text: "3 результати" },
  4: { cldr: "few", index: 2, text: "4 результати" },
  5: { cldr: "many", index: 3, text: "5 результатів" },
  11: { cldr: "many", index: 3, text: "11 результатів" },
  12: { cldr: "many", index: 3, text: "12 результатів" },
  14: { cldr: "many", index: 3, text: "14 результатів" },
  21: { cldr: "one", index: 1, text: "21 результат" },
  22: { cldr: "few", index: 2, text: "22 результати" },
  23: { cldr: "few", index: 2, text: "23 результати" },
  24: { cldr: "few", index: 2, text: "24 результати" },
  25: { cldr: "many", index: 3, text: "25 результатів" },
  100: { cldr: "many", index: 3, text: "100 результатів" },
  101: { cldr: "one", index: 1, text: "101 результат" },
  102: { cldr: "few", index: 2, text: "102 результати" },
  111: { cldr: "many", index: 3, text: "111 результатів" },
  112: { cldr: "many", index: 3, text: "112 результатів" }
};
console.log("UK feed.resultsCount (CLDR-independent)");
for (const n of ukCounts) {
  const exp = ukResultsExpected[n];
  const intlCat = ukIntl.select(n);
  const idx = ukPluralRule(n, 4);
  const got = t("feed.resultsCount", n, { n });
  const ok = intlCat === exp.cldr && idx === exp.index && got === exp.text;
  console.log(
    `  uk | ${n} | ${exp.cldr} | ${intlCat} | ${idx} | ${got} | ${exp.text} | ${
      ok ? "PASS" : "FAIL"
    }`
  );
  if (!ok) failed++;
}
console.log("UK decimals (CLDR other → many pipe)");
for (const n of [0.5, 1.5, 2.5]) {
  const intlCat = ukIntl.select(n);
  const idx = ukPluralRule(n, 4);
  const got = t("feed.resultsCount", n, { n });
  const ok = intlCat === "other" && idx === 3 && String(got).includes("результатів");
  console.log(
    `  uk | ${n} | other | ${intlCat} | ${idx} | ${got} | ${ok ? "PASS" : "FAIL"}`
  );
  if (!ok) failed++;
}

console.log(failed === 0 ? "\nPASS" : `\nFAIL (${failed})`);
process.exit(failed === 0 ? 0 : 1);
