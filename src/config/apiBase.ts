import { Capacitor } from "@capacitor/core";

const normalize = (value: unknown): string => String(value || "").trim().replace(/\/+$/, "");

const withApiSuffix = (value: string): string => {
  if (!value) return value;
  return value.endsWith("/api") ? value : `${value}/api`;
};

const webBase = withApiSuffix(normalize(import.meta.env.VITE_API_BASE));
const nativeDevBase = withApiSuffix(normalize(import.meta.env.VITE_API_BASE_NATIVE_DEV));

const isNativeRuntime = Capacitor.isNativePlatform();
const isDev = import.meta.env.DEV;

const shouldUseNativeDevBase = isDev && isNativeRuntime && nativeDevBase.length > 0;

export const API_BASE_URL = shouldUseNativeDevBase ? nativeDevBase : webBase;
export const API_BASE_SOURCE = shouldUseNativeDevBase ? "VITE_API_BASE_NATIVE_DEV" : "VITE_API_BASE";
export const IS_NATIVE_RUNTIME = isNativeRuntime;
