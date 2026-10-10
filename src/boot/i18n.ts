import { boot } from "quasar/wrappers";
import { createI18n, type I18n } from "vue-i18n";

import messages from "src/i18n";
import {
  LANGUAGE_STORAGE_KEY,
  mapUiLocaleToI18n,
  syncDocumentHtmlLang
} from "src/utils/applyLocale";

export type MessageLanguages = keyof typeof messages;
// Type-define 'en-US' as the master schema for the resource
export type MessageSchema = typeof messages["en-US"];

// See https://vue-i18n.intlify.dev/guide/advanced/typescript.html#global-resource-schema-type-definition
/* eslint-disable @typescript-eslint/no-empty-interface */
declare module "vue-i18n" {
  // define the locale messages schema
  export interface DefineLocaleMessage extends MessageSchema {}

  // define the datetime format schema
  export interface DefineDateTimeFormat {}

  // define the number format schema
  export interface DefineNumberFormat {}
}
/* eslint-enable @typescript-eslint/no-empty-interface */

/** Shared i18n instance for non-component locale sync (login / auth boot). */
export let appI18n: I18n | null = null;

export default boot(({ app }) => {
  // Load saved language from localStorage
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  const defaultLocale = mapUiLocaleToI18n(savedLanguage);

  /**
   * Slovak CLDR cardinal plural selection (Unicode CLDR; NOT the old mod10 “Slavic” heuristic).
   * Categories: one (n===1), few (n===2|3|4 only), many (decimals v!=0),
   * other (all other integers: 0,5,11,21,22,23,24,25,101,102…).
   * Bug fixed in 4E.4S: former slavicPluralRule treated 21 as one and 22–24 as few.
   * Pipe layouts:
   * - 2 forms: one | other
   * - 3 forms: one | few | other
   * - 4 forms: zero | one | few | other — index 0 is UX "Žiadne…" for n===0 only
   * Decimals (CLDR many): catalogs have no dedicated many pipe; map to other.
   * Current UI counts are integers (array.length); decimals documented for future use.
   */
  const slovakPluralRule = (choice: number, choicesLength: number): number => {
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
      if (n === 0) return 0; // UX zero (CLDR category for 0 is other)
      if (isOne) return 1;
      if (isFew) return 2;
      return 3;
    }
    if (choicesLength === 2) return isOne ? 0 : 1;
    if (isOne) return 0;
    if (isFew) return 1;
    return Math.min(2, Math.max(0, choicesLength - 1));
  };

  /**
   * Polish CLDR cardinal plural selection.
   * Categories: one (n===1), few (i%10=2..4 except 12–14 → includes 22–24),
   * many (other integers incl. 0,5,11,21…), other (decimals per CLDR).
   * Pipe layouts:
   * - 2 forms: one | other
   * - 3 forms: one | few | other(many)
   * - 4 forms: zero | one | few | other(many) — index 0 is UX "Brak…" for n===0 only
   */
  const polishPluralRule = (choice: number, choicesLength: number): number => {
    const n = Math.abs(Number(choice));
    const isInteger = Number.isFinite(n) && Math.floor(n) === n;
    // CLDR "other" for fractional quantities (e.g. 1.5, 2.5)
    if (!isInteger) {
      if (choicesLength >= 4) return 3;
      if (choicesLength === 2) return 1;
      return Math.min(2, Math.max(0, choicesLength - 1));
    }
    const mod10 = n % 10;
    const mod100 = n % 100;
    const isOne = n === 1;
    const isFew =
      mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14);

    if (choicesLength >= 4) {
      if (n === 0) return 0; // dedicated UX zero form (CLDR category for 0 is many)
      if (isOne) return 1;
      if (isFew) return 2;
      return 3;
    }
    if (choicesLength === 2) return isOne ? 0 : 1;
    if (isOne) return 0;
    if (isFew) return 1;
    return Math.min(2, Math.max(0, choicesLength - 1));
  };

  /**
   * Czech CLDR cardinal plural selection (Unicode CLDR; NOT Polish).
   * Categories: one (n===1), few (n===2|3|4 only), many (decimals v!=0),
   * other (all other integers: 0,5,11,21,22,23,24,25,101,102…).
   * Critical difference from Polish: 22–24 are OTHER ("výsledků"), not few ("výsledky").
   * Pipe layouts in our catalogs:
   * - 2 forms: one | other
   * - 3 forms: one | few | other
   * - 4 forms: zero | one | few | other — index 0 is UX "Žádné…" for n===0 only
   * Decimals (CLDR many): catalogs have no dedicated many pipe; map to other.
   * Current UI counts are integers (array.length); decimals documented for future use.
   */
  const czechPluralRule = (choice: number, choicesLength: number): number => {
    const n = Math.abs(Number(choice));
    const isInteger = Number.isFinite(n) && Math.floor(n) === n;
    if (!isInteger) {
      // CLDR many → no many pipe in current CS strings → use other
      if (choicesLength >= 4) return 3;
      if (choicesLength === 2) return 1;
      return Math.min(2, Math.max(0, choicesLength - 1));
    }
    const isOne = n === 1;
    const isFew = n === 2 || n === 3 || n === 4;

    if (choicesLength >= 4) {
      if (n === 0) return 0; // UX zero (CLDR category for 0 is other)
      if (isOne) return 1;
      if (isFew) return 2;
      return 3;
    }
    if (choicesLength === 2) return isOne ? 0 : 1;
    if (isOne) return 0;
    if (isFew) return 1;
    return Math.min(2, Math.max(0, choicesLength - 1));
  };

  /**
   * Romanian CLDR cardinal plural selection (Unicode CLDR).
   * Categories:
   * - one: n === 1 (integer)
   * - few: n === 0 OR (integer and n % 100 in 1..19) excluding n===1 which is one;
   *        also all non-integers (decimals) are few
   * - other: remaining integers (20, 21, …, 100, 120, …)
   * Critical: 19=few, 20=other, 101=few, 102=few — NOT like SK/CS/PL.
   * Pipe layouts:
   * - 2 forms: one | other  (few falls into other — avoid for RO when few≠other grammar)
   * - 3 forms: one | few | other
   * - 4 forms: zero | one | few | other — index 0 is UX zero for n===0 only
   *   (CLDR category for 0 is few; UX zero is a product exception)
   */
  const romanianPluralRule = (choice: number, choicesLength: number): number => {
    const n = Math.abs(Number(choice));
    const isInteger = Number.isFinite(n) && Math.floor(n) === n;
    const mod100 = isInteger ? n % 100 : -1;
    const isOne = isInteger && n === 1;
    // CLDR few: decimals OR n=0 OR (n%100 in 1..19 and n≠1)
    const isFew =
      !isInteger ||
      n === 0 ||
      (mod100 >= 1 && mod100 <= 19 && n !== 1);

    if (choicesLength >= 4) {
      if (isInteger && n === 0) return 0; // UX zero
      if (isOne) return 1;
      if (isFew) return 2;
      return 3;
    }
    if (choicesLength === 2) return isOne ? 0 : 1;
    if (isOne) return 0;
    if (isFew) return 1;
    return Math.min(2, Math.max(0, choicesLength - 1));
  };

  /**
   * Croatian CLDR cardinal (Unicode). Integers:
   * - one: i%10===1 && i%100!==11 (1, 21, 31, 101…)
   * - few: i%10∈{2,3,4} && i%100∉{12,13,14} (2–4, 22–24…)
   * - other: rest incl. 0, 5–19, 25…
   * Decimals use fractional digit rules (0.1→one, 0.2→few, 0.5→other).
   * NOT the same as SK/CS (21→other) or PL (21→many).
   * Pipe: 2=one|other; 3=one|few|other; 4=zero|one|few|other (UX zero at n===0).
   */
  const croatianPluralRule = (choice: number, choicesLength: number): number => {
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
      // Approximate CLDR fractional: use visible fractional part last digit
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
  };

  /**
   * Ukrainian CLDR cardinal (Unicode). Integers:
   * - one: i%10===1 && i%100!==11 (1, 21, 101…)
   * - few: i%10∈{2,3,4} && i%100∉{12,13,14}
   * - many: other integers (0, 5–19, 25, 111…)
   * - other: decimals
   * Pipe layouts in catalogs:
   * - 3 forms: one | few | many
   * - 4 forms: zero | one | few | many — UX zero at n===0 (CLDR many)
   * Decimals (CLDR other) map to many pipe when no dedicated other form.
   */
  const ukrainianPluralRule = (choice: number, choicesLength: number): number => {
    const n = Math.abs(Number(choice));
    const isInteger = Number.isFinite(n) && Math.floor(n) === n;
    if (!isInteger) {
      // CLDR other → last grammatical form (many in our layouts)
      if (choicesLength >= 4) return 3;
      if (choicesLength === 2) return 1;
      return Math.min(2, Math.max(0, choicesLength - 1));
    }
    const mod10 = n % 10;
    const mod100 = n % 100;
    const isOne = mod10 === 1 && mod100 !== 11;
    const isFew = mod10 >= 2 && mod10 <= 4 && !(mod100 >= 12 && mod100 <= 14);
    if (choicesLength >= 4) {
      if (n === 0) return 0; // UX zero
      if (isOne) return 1;
      if (isFew) return 2;
      return 3; // many
    }
    if (choicesLength === 2) return isOne ? 0 : 1;
    if (isOne) return 0;
    if (isFew) return 1;
    return Math.min(2, Math.max(0, choicesLength - 1));
  };

  const i18n = createI18n({
    locale: defaultLocale,
    fallbackLocale: "en-US",
    legacy: false,
    messages,
    // vue-i18n v9 Composition API uses `pluralRules` (not v8 `pluralizationRules`)
    pluralRules: {
      sk: slovakPluralRule,
      cs: czechPluralRule,
      pl: polishPluralRule,
      ro: romanianPluralRule,
      hr: croatianPluralRule,
      uk: ukrainianPluralRule
    }
  });

  appI18n = i18n;

  // Set i18n instance on app
  app.use(i18n);

  // Accessibility: <html lang> follows UI preference (en-GB stays en-GB).
  // Message pack for en-GB remains en-US via mapUiLocaleToI18n — fallback unchanged.
  const uiPreference = savedLanguage || "en-US";
  syncDocumentHtmlLang(uiPreference);

  // Keep Quasar built-in labels (e.g. QDate) aligned with UI locale.
  // syncQuasarLang restores html lang after Quasar Lang.set overwrites it.
  void import("src/utils/quasarLang").then(async ({ syncQuasarLang }) => {
    await syncQuasarLang(defaultLocale);
    syncDocumentHtmlLang(uiPreference);
  });
});
