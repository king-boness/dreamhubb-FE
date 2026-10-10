import { Lang } from "quasar";

type QuasarLangPack = Parameters<typeof Lang.set>[0];

const packLoaders: Record<string, () => Promise<{ default: QuasarLangPack }>> = {
  "en-US": () => import("quasar/lang/en-US"),
  sk: () => import("quasar/lang/sk"),
  de: () => import("quasar/lang/de"),
  fr: () => import("quasar/lang/fr"),
  es: () => import("quasar/lang/es"),
  pl: () => import("quasar/lang/pl"),
  it: () => import("quasar/lang/it"),
  // App locale code is `pt` (APP_LANGUAGES); Quasar ships `pt-BR` as the pt pack.
  pt: () => import("quasar/lang/pt-BR"),
  cs: () => import("quasar/lang/cs"),
  hu: () => import("quasar/lang/hu"),
  nl: () => import("quasar/lang/nl"),
  ro: () => import("quasar/lang/ro"),
  hr: () => import("quasar/lang/hr"),
  bg: () => import("quasar/lang/bg"),
  uk: () => import("quasar/lang/uk")
};

/**
 * Map app UI locale → Quasar lang pack.
 * en-GB aliases to en-US. Unsupported locales fall back to en-US.
 * App `pt` maps to Quasar pt-BR (only pt pack shipped; regional product decision open).
 */
export function resolveQuasarLangCode(
  locale: string
):
  | "en-US"
  | "sk"
  | "de"
  | "fr"
  | "es"
  | "pl"
  | "it"
  | "pt"
  | "cs"
  | "hu"
  | "nl"
  | "ro"
  | "hr"
  | "bg"
  | "uk" {
  if (locale === "sk") return "sk";
  if (locale === "de") return "de";
  if (locale === "fr") return "fr";
  if (locale === "es") return "es";
  if (locale === "pl") return "pl";
  if (locale === "it") return "it";
  if (locale === "pt") return "pt";
  if (locale === "cs") return "cs";
  if (locale === "hu") return "hu";
  if (locale === "nl") return "nl";
  if (locale === "ro") return "ro";
  if (locale === "hr") return "hr";
  if (locale === "bg") return "bg";
  if (locale === "uk") return "uk";
  return "en-US";
}

export async function syncQuasarLang(locale: string): Promise<void> {
  const code = resolveQuasarLangCode(locale);
  try {
    const mod = await packLoaders[code]();
    Lang.set(mod.default);
  } catch {
    try {
      const fallback = await packLoaders["en-US"]();
      Lang.set(fallback.default);
    } catch {
      // Quasar pack unavailable — leave framework defaults
    }
  }

  // Quasar Lang.set() writes pack isoName onto <html lang>. Restore UI preference
  // (e.g. de / en-GB) so accessibility lang matches the app language choice.
  try {
    const { LANGUAGE_STORAGE_KEY, syncDocumentHtmlLang } = await import(
      "src/utils/applyLocale"
    );
    const stored =
      typeof localStorage !== "undefined"
        ? localStorage.getItem(LANGUAGE_STORAGE_KEY)
        : null;
    syncDocumentHtmlLang(stored || locale);
  } catch {
    // ignore
  }
}
