/**
 * Resolve AI translation target language.
 * Priority: explicit app preference > current i18n locale > navigator.language
 * Never uses IP/geo.
 */
export function resolveTargetLanguage(options?: {
  preferredLanguage?: string | null;
  i18nLocale?: string | null;
  navigatorLanguage?: string | null;
}): string {
  const preferred = normalizeLanguageTag(options?.preferredLanguage);
  if (preferred) return preferred;

  const locale = normalizeLanguageTag(options?.i18nLocale);
  if (locale) return locale;

  const nav =
    options?.navigatorLanguage ??
    (typeof navigator !== "undefined" ? navigator.language : null);
  const fromNav = normalizeLanguageTag(nav);
  if (fromNav) return fromNav;

  return "en";
}

export function normalizeLanguageTag(value?: string | null): string | null {
  if (!value) return null;
  const trimmed = String(value).trim().toLowerCase().replace(/_/g, "-");
  if (!trimmed) return null;
  if (!/^[a-z]{2,3}(-[a-z0-9]{2,8})*$/.test(trimmed)) return null;
  return trimmed.split("-")[0] || null;
}
