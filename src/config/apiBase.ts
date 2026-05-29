import { Capacitor } from "@capacitor/core";

const normalize = (value: unknown): string => String(value || "").trim().replace(/\/+$/, "");

const withApiSuffix = (value: string): string => {
  if (!value) return value;
  return value.endsWith("/api") ? value : `${value}/api`;
};

const webBase = withApiSuffix(normalize(import.meta.env.VITE_API_BASE));
const nativeDevBase = withApiSuffix(normalize(import.meta.env.VITE_API_BASE_NATIVE_DEV));

/** Used only when Release native build was shipped without VITE_API_BASE baked in. */
const PRODUCTION_API_FALLBACK = withApiSuffix(
  normalize(import.meta.env.VITE_API_BASE_FALLBACK || "https://api.dreamhubb.com")
);

const isNativeRuntime = Capacitor.isNativePlatform();
const isDev = import.meta.env.DEV;

const shouldUseNativeDevBase = isDev && isNativeRuntime && nativeDevBase.length > 0;

const resolveApiBase = (): { url: string; source: string } => {
  if (shouldUseNativeDevBase) {
    return { url: nativeDevBase, source: "VITE_API_BASE_NATIVE_DEV" };
  }
  if (webBase.length > 0) {
    return { url: webBase, source: "VITE_API_BASE" };
  }
  if (!isDev && isNativeRuntime && PRODUCTION_API_FALLBACK.length > 0) {
    console.error(
      "[apiBase] VITE_API_BASE is empty in native Release build; using fallback:",
      PRODUCTION_API_FALLBACK
    );
    return { url: PRODUCTION_API_FALLBACK, source: "VITE_API_BASE_FALLBACK" };
  }
  return { url: "", source: "unset" };
};

const resolved = resolveApiBase();

export const API_BASE_URL = resolved.url;
export const API_BASE_SOURCE = resolved.source;
export const IS_NATIVE_RUNTIME = isNativeRuntime;
