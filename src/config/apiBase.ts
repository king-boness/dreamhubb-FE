import { Capacitor } from "@capacitor/core";

const normalize = (value: unknown): string => String(value || "").trim().replace(/\/+$/, "");

const withApiSuffix = (value: string): string => {
  if (!value) return value;
  return value.endsWith("/api") ? value : `${value}/api`;
};

const webBase = withApiSuffix(normalize(import.meta.env.VITE_API_BASE));
const nativeDevBase = withApiSuffix(normalize(import.meta.env.VITE_API_BASE_NATIVE_DEV));

/** Release fallback when VITE_API_BASE is missing or localhost on device. */
const PRODUCTION_API_FALLBACK = withApiSuffix(
  normalize(import.meta.env.VITE_API_BASE_FALLBACK || "https://api.dreamhubb.com")
);

const isDev = import.meta.env.DEV;

export function isNativeRuntime(): boolean {
  return Capacitor.isNativePlatform();
}

export function isLocalhostUrl(url: string): boolean {
  const trimmed = String(url || "").trim();
  if (!trimmed) return false;
  try {
    const withProto = /^https?:\/\//i.test(trimmed) ? trimmed : `http://${trimmed}`;
    const host = new URL(withProto).hostname.toLowerCase();
    return host === "localhost" || host === "127.0.0.1" || host === "::1" || host === "[::1]";
  } catch {
    return /(^|\/\/)(localhost|127\.0\.0\.1)([:/]|$)/i.test(trimmed);
  }
}

const warnApiBase = (message: string, extra?: Record<string, unknown>) => {
  console.warn("[DH-API-BASE-WARN]", message, extra ?? {});
};

const pickNativeDevBase = (): { url: string; source: string } | null => {
  if (nativeDevBase.length > 0 && !isLocalhostUrl(nativeDevBase)) {
    return { url: nativeDevBase, source: "VITE_API_BASE_NATIVE_DEV" };
  }
  if (nativeDevBase.length > 0 && isLocalhostUrl(nativeDevBase)) {
    warnApiBase("VITE_API_BASE_NATIVE_DEV points to localhost; ignored on native device.", {
      nativeDevBase
    });
  }
  return null;
};

const resolveApiBase = (): { url: string; source: string } => {
  const isNative = isNativeRuntime();

  // Native dev (physical iPhone / simulator with Capacitor live reload)
  if (isDev && isNative) {
    const nativeDev = pickNativeDevBase();
    if (nativeDev) return nativeDev;

    if (webBase.length > 0 && !isLocalhostUrl(webBase)) {
      return { url: webBase, source: "VITE_API_BASE" };
    }

    warnApiBase(
      "Native dev cannot use localhost — iPhone resolves localhost to itself, not your Mac. " +
        "Set VITE_API_BASE_NATIVE_DEV=http://<MAC_LAN_IP>:8000/api in .env and restart quasar dev.",
      {
        viteApiBase: webBase || "(empty)",
        viteApiBaseNativeDev: nativeDevBase || "(empty)"
      }
    );

    if (PRODUCTION_API_FALLBACK.length > 0) {
      return { url: PRODUCTION_API_FALLBACK, source: "VITE_API_BASE_FALLBACK" };
    }
    return { url: "", source: "unset" };
  }

  // Native release — never ship localhost to App Store builds
  if (!isDev && isNative) {
    if (webBase.length > 0 && !isLocalhostUrl(webBase)) {
      return { url: webBase, source: "VITE_API_BASE" };
    }
    if (webBase.length > 0 && isLocalhostUrl(webBase)) {
      warnApiBase("Production native build has localhost VITE_API_BASE; using fallback.", {
        webBase,
        fallback: PRODUCTION_API_FALLBACK
      });
    } else if (!webBase.length) {
      console.error(
        "[DH-API-BASE-WARN] VITE_API_BASE is empty in native Release build; using fallback:",
        PRODUCTION_API_FALLBACK
      );
    }
    if (PRODUCTION_API_FALLBACK.length > 0) {
      return { url: PRODUCTION_API_FALLBACK, source: "VITE_API_BASE_FALLBACK" };
    }
    return { url: "", source: "unset" };
  }

  // Browser (dev server / SPA)
  if (webBase.length > 0) {
    return { url: webBase, source: "VITE_API_BASE" };
  }

  return { url: "", source: "unset" };
};

const resolved = resolveApiBase();

export const API_BASE_URL = resolved.url;
export const API_BASE_SOURCE = resolved.source;
export const IS_NATIVE_RUNTIME = isNativeRuntime();
