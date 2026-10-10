import { LANGUAGE_STORAGE_KEY } from "src/utils/applyLocale";

/**
 * Resolve Accept-Language from the user's current UI preference.
 * Reads localStorage on every call so mid-session language changes apply
 * to subsequent API requests (not a boot-time snapshot).
 *
 * Preserves the stored UI code (sk, en-US, en-GB, de, …). Backend maps
 * system texts to en|sk without overwriting the stored preference.
 */
export function resolveAcceptLanguageHeader(): string {
  try {
    const saved = (localStorage.getItem(LANGUAGE_STORAGE_KEY) || "en-US").trim();
    if (!saved) return "en-US";
    return saved;
  } catch {
    return "en-US";
  }
}
