export const LANGUAGE_STORAGE_KEY = "dreamhubb_language";

/**
 * Map a stored/UI language code to the vue-i18n locale key.
 * en-GB keeps preference in storage as en-GB but loads en-US messages.
 */
export function mapUiLocaleToI18n(code: string | null | undefined): string {
  if (!code) return "en-US";
  if (code === "en-GB") return "en-US";
  return code;
}

/**
 * BCP 47 / HTML lang from the UI preference (not the i18n message pack key).
 * en-GB → "en-GB" (messages still alias to en-US via mapUiLocaleToI18n).
 * de → "de", sk → "sk", en-US → "en-US".
 */
export function htmlLangFromUiPreference(code: string | null | undefined): string {
  if (!code || typeof code !== "string") return "en-US";
  return code;
}

/** Keep <html lang> aligned with the stored UI language preference. */
export function syncDocumentHtmlLang(uiLanguageCode: string | null | undefined): void {
  if (typeof document === "undefined") return;
  const lang = htmlLangFromUiPreference(uiLanguageCode);
  document.documentElement.setAttribute("lang", lang);
  document.documentElement.lang = lang;
}

type LocaleRef = { value: string };

/**
 * Apply a UI language preference to i18n, localStorage, html lang, Quasar.
 * Does not call the API.
 */
export async function applyUiLocale(
  languageCode: string,
  localeRef?: LocaleRef
): Promise<string> {
  const stored = languageCode || "en-US";
  const i18nLocale = mapUiLocaleToI18n(stored);

  try {
    localStorage.setItem(LANGUAGE_STORAGE_KEY, stored);
  } catch {
    // ignore quota / private mode
  }

  if (localeRef) {
    localeRef.value = i18nLocale;
  } else {
    try {
      const { appI18n } = await import("src/boot/i18n");
      if (appI18n && "global" in appI18n) {
        const globalLocale = (appI18n.global as { locale: LocaleRef }).locale;
        if (globalLocale && typeof globalLocale === "object" && "value" in globalLocale) {
          globalLocale.value = i18nLocale;
        }
      }
    } catch {
      // boot may not be ready yet
    }
  }

  try {
    const { syncQuasarLang } = await import("src/utils/quasarLang");
    await syncQuasarLang(i18nLocale);
  } catch {
    // ignore
  }

  // HTML lang follows UI preference (incl. en-GB), not the Quasar/i18n pack key.
  // Must run AFTER syncQuasarLang — Quasar Lang.set() overwrites documentElement.lang.
  syncDocumentHtmlLang(stored);

  return i18nLocale;
}

/**
 * After login / fetchUser: account preferred_locale is source of truth when set.
 * When null/missing, authenticated sessions fall back to en-US (no cross-account bleed).
 */
export async function syncLocaleFromUser(
  preferredLocale: string | null | undefined,
  localeRef?: LocaleRef
): Promise<void> {
  if (preferredLocale && typeof preferredLocale === "string") {
    await applyUiLocale(preferredLocale, localeRef);
    return;
  }
  await applyUiLocale("en-US", localeRef);
}
