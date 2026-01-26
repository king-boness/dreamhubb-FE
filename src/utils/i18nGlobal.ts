import messages from "src/i18n";

type Messages = typeof messages;

const LANGUAGE_STORAGE_KEY = "dreamhubb_language";

function getLocale(): keyof Messages {
  try {
    const saved = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (saved && (saved in messages)) {
      return saved as keyof Messages;
    }
    // map en-GB -> en-US (matches boot/i18n.ts behavior)
    if (saved === "en-GB") return "en-US";
    if (saved === "sk") return "sk";
  } catch {
    // ignore
  }
  return "en-US";
}

function getByPath(obj: unknown, path: string): unknown {
  const parts = path.split(".");
  let cur: unknown = obj;
  for (const p of parts) {
    if (!cur || typeof cur !== "object") return undefined;
    const rec = cur as Record<string, unknown>;
    if (!(p in rec)) return undefined;
    cur = rec[p];
  }
  return cur;
}

function interpolate(template: string, params?: Record<string, unknown>): string {
  if (!params) return template;
  return template.replace(/\{(\w+)\}/g, (_, key) => String(params[key] ?? `{${key}}`));
}

/**
 * Minimal "global" translation helper for non-component code (axios interceptors, utils).
 * Falls back to en-US and then to provided fallback.
 */
export function tGlobal(key: string, fallback: string, params?: Record<string, unknown>): string {
  const locale = getLocale();
  const localized = getByPath(messages[locale], key);
  if (typeof localized === "string") return interpolate(localized, params);
  const en = getByPath(messages["en-US"], key);
  if (typeof en === "string") return interpolate(en, params);
  return interpolate(fallback, params);
}
