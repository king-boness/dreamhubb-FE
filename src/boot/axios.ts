import { boot } from "quasar/wrappers";
import axios, { AxiosInstance, InternalAxiosRequestConfig } from "axios";
import { mapAxiosErrorToDhError, isNetworkError, isTimeoutError } from "src/utils/httpError";
import { notifyError } from "src/utils/notify";
import { tGlobal } from "src/utils/i18nGlobal";
import { pushRequest } from "src/utils/diagnostics-buffer";
import {
  API_BASE_SOURCE,
  API_BASE_URL,
  IS_NATIVE_RUNTIME,
  isLocalhostUrl
} from "src/config/apiBase";
import { resolveAcceptLanguageHeader } from "src/utils/apiLanguage";

import {
  captureAuthSessionSnapshot,
  canApplyRefreshedToken,
  canHandleAuthFailureForSession,
  canSafeLogoutSession,
  type AuthSessionSnapshot
} from "src/utils/authSessionOwnership";

declare module "axios" {
  interface InternalAxiosRequestConfig {
    _diagnosticsStart?: number;
    _diagnosticsUrl?: string;
    _diagnosticsMethod?: string;
    /** Set by 401 refresh path before re-issuing the request. */
    _retry?: boolean;
    /** Session identity captured when the request was sent (AUTH-RACE-003). */
    _authSession?: AuthSessionSnapshot;
  }
}

if (import.meta.env.DEV) {
  console.debug("Boot axios.ts loaded");
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// Base URL resolver:
// - Browser dev/prod: VITE_API_BASE
// - Native live-reload dev (Capacitor on device): VITE_API_BASE_NATIVE_DEV (if set)
const BASE = API_BASE_URL;

if (import.meta.env.DEV || IS_NATIVE_RUNTIME) {
  console.info("[DH-API-BASE]", {
    selectedBase: BASE || "(empty)",
    source: API_BASE_SOURCE,
    nativeRuntime: IS_NATIVE_RUNTIME,
    viteApiBase: import.meta.env.VITE_API_BASE || "(empty)",
    viteApiBaseNativeDev: import.meta.env.VITE_API_BASE_NATIVE_DEV || "(empty)",
    localhostOnDevice: IS_NATIVE_RUNTIME && isLocalhostUrl(BASE)
  });
  if (IS_NATIVE_RUNTIME && isLocalhostUrl(BASE)) {
    console.error(
      "[DH-API-BASE-WARN] API base is localhost on a native device — requests will fail with ERR_NETWORK. " +
        "Set VITE_API_BASE_NATIVE_DEV to your Mac LAN URL in .env and restart quasar dev."
    );
  }
}

// ------------------------------------
//  401 refresh single-flight (per session token)
// ------------------------------------
type RefreshFlight = {
  token: string;
  promise: Promise<string | null>;
};

let activeRefreshFlight: RefreshFlight | null = null;
let logoutPromise: Promise<void> | null = null;
let logoutForGeneration: number | null = null;
let isRedirectingToLogin = false;

const isAuthEndpointUrl = (url: string) => {
  // Never refresh for auth endpoints (prevents loops / form wipe)
  return (
    url.includes("/login") ||
    url.includes("/register") ||
    url.includes("/refresh") ||
    url.includes("/logout") ||
    url.includes("/check-email") ||
    url.includes("/forgot-password") ||
    url.includes("/reset-password")
  );
};

async function readLiveGeneration(): Promise<number> {
  try {
    const { useAuthStore } = await import("src/stores/auth");
    return useAuthStore().sessionGeneration;
  } catch {
    return 0;
  }
}

const refreshTokenSingleFlight = async (
  updateTargets?: { api: AxiosInstance; axiosInstance: AxiosInstance },
  sessionHint?: AuthSessionSnapshot
): Promise<string | null> => {
  const snapshot = sessionHint ?? (await captureAuthSessionSnapshot());
  const tokenAtStart = snapshot.token;
  if (!tokenAtStart) {
    return null;
  }

  // Join in-flight refresh only for the SAME session token (never reuse A for B).
  if (activeRefreshFlight && activeRefreshFlight.token === tokenAtStart) {
    return activeRefreshFlight.promise;
  }

  const promise = (async (): Promise<string | null> => {
    try {
      const refreshResponse = await axios.post(
        `${BASE}/refresh`,
        {},
        { headers: { Authorization: `Bearer ${tokenAtStart}` } }
      );

      const newToken =
        refreshResponse.data?.authorization?.token ||
        refreshResponse.data?.token;

      if (typeof newToken !== "string" || newToken.length === 0) {
        return null;
      }

      const liveGeneration = await readLiveGeneration();
      const liveToken =
        typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;

      // AUTH-RACE-003: never write if login/logout created a newer session.
      if (!canApplyRefreshedToken(snapshot, liveToken, liveGeneration)) {
        // Peer refresh for the same generation already rotated the token.
        if (
          liveGeneration === snapshot.generation &&
          typeof liveToken === "string" &&
          liveToken.length > 0 &&
          liveToken !== tokenAtStart
        ) {
          return liveToken;
        }
        return null;
      }

      // Final ownership check immediately before mutating auth state.
      let authStore: { sessionGeneration: number; setToken: (t: string | null) => void } | null =
        null;
      try {
        const mod = await import("src/stores/auth");
        authStore = mod.useAuthStore();
      } catch {
        authStore = null;
      }

      const genNow = authStore?.sessionGeneration ?? (await readLiveGeneration());
      const tokenNow =
        typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
      if (!canApplyRefreshedToken(snapshot, tokenNow, genNow)) {
        if (
          genNow === snapshot.generation &&
          typeof tokenNow === "string" &&
          tokenNow.length > 0 &&
          tokenNow !== tokenAtStart
        ) {
          return tokenNow;
        }
        return null;
      }

      // Mutate window: ownership re-check + localStorage/store writes are synchronous.
      // No await between the final checks and setItem/setToken, so login/logout
      // cannot interleave under JS single-threading (AUTH-RACE-003).
      if (authStore && authStore.sessionGeneration !== snapshot.generation) {
        return null;
      }
      if (localStorage.getItem("token") !== tokenAtStart) {
        const cur = localStorage.getItem("token");
        return typeof cur === "string" && cur.length > 0 ? cur : null;
      }

      localStorage.setItem("token", newToken);
      if (authStore) {
        authStore.setToken(newToken);
      }

      if (updateTargets) {
        // Prefer sync generation when store is available — avoids an await after write.
        const genHeaders =
          authStore != null
            ? authStore.sessionGeneration
            : await readLiveGeneration();
        if (genHeaders === snapshot.generation) {
          updateTargets.api.defaults.headers.common.Authorization = `Bearer ${newToken}`;
          updateTargets.axiosInstance.defaults.headers.common.Authorization = `Bearer ${newToken}`;
        } else {
          // Session changed during the rare store-unavailable await — never hand the
          // caller a live token from a different session (could be user B).
          return null;
        }
      }
      if (import.meta.env.DEV) {
        console.debug("refresh ok, new token head:", newToken.slice(0, 20) + "...");
      }
      return newToken;
    } catch {
      return null;
    } finally {
      if (activeRefreshFlight?.promise === promise) {
        activeRefreshFlight = null;
      }
    }
  })();

  activeRefreshFlight = { token: tokenAtStart, promise };
  return promise;
};

const safeLogoutAndRedirect = async (sessionHint?: AuthSessionSnapshot) => {
  const snapshot = sessionHint ?? (await captureAuthSessionSnapshot());

  // Single-flight per generation — never let session A's logout finish as B's.
  if (logoutPromise && logoutForGeneration === snapshot.generation) {
    return logoutPromise;
  }

  logoutPromise = (async () => {
    logoutForGeneration = snapshot.generation;
    try {
      const liveGeneration = await readLiveGeneration();
      const liveToken =
        typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;

      if (!canSafeLogoutSession(snapshot, liveToken, liveGeneration)) {
        return;
      }

      try {
        const { useAuthStore } = await import("src/stores/auth");
        const authStore = useAuthStore();
        // Re-check after import — AUTH-RACE-002 logout itself is also generation-safe.
        if (
          !canSafeLogoutSession(
            snapshot,
            localStorage.getItem("token"),
            authStore.sessionGeneration
          )
        ) {
          return;
        }
        await authStore.logout({ remote: false, silent: true });
      } catch {
        // ignore
      }

      // Logout bumps sessionGeneration. A newer login during/after logout will have
      // written a token — in that case do not toast/redirect the new user away.
      // If storage is empty, this logout still owns the outcome → notify + redirect.
      const tokenAfter =
        typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
      if (tokenAfter) {
        return;
      }

      notifyError({
        kind: "unauthorized",
        messageKey: "common.errors.sessionExpired",
        fallbackMessage: tGlobal("common.errors.sessionExpired", "Session expired. Please sign in again."),
        retryable: false
      });

      if (typeof localStorage !== "undefined" && localStorage.getItem("token")) {
        return;
      }

      // Avoid reload loops: if already on login, don't redirect again.
      if (!String(window.location.href).includes("/login") && !isRedirectingToLogin) {
        isRedirectingToLogin = true;
        window.location.href = "/login";
      }
    } finally {
      if (logoutForGeneration === snapshot.generation) {
        logoutPromise = null;
        logoutForGeneration = null;
      }
    }
  })();

  return logoutPromise;
};

// ------------------------------------
//  Vytvor axios inštancie
// ------------------------------------
const axiosInstance = axios.create({
  baseURL: BASE,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
});

const api = axios.create({
  baseURL: BASE,
  timeout: 20000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
});

// ------------------------------------
//  Token zo storage
// ------------------------------------
const savedToken = localStorage.getItem("token");
if (savedToken) {
  api.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
  axiosInstance.defaults.headers.common.Authorization = `Bearer ${savedToken}`;
}

// ------------------------------------
//  Request interceptor (token)
// ------------------------------------
const attachInterceptor = (instance: AxiosInstance) => {
  const summarizeBodyPreview = (data: unknown) => {
    if (!data || typeof data !== "object") return data;
    const rec = data as Record<string, unknown>;
    return {
      status: rec.status,
      message: rec.message,
      errorKeys:
        rec.errors && typeof rec.errors === "object"
          ? Object.keys(rec.errors as Record<string, unknown>)
          : undefined
    };
  };

  const payloadKeysFromConfig = (config: InternalAxiosRequestConfig): string[] => {
    const payload = config.data as unknown;
    if (!payload) return [];
    if (payload instanceof FormData) {
      const keys = new Set<string>();
      try {
        for (const key of payload.keys()) keys.add(String(key));
      } catch {
        // ignore
      }
      return Array.from(keys);
    }
    if (typeof payload === "object") {
      return Object.keys(payload as Record<string, unknown>);
    }
    return [];
  };

  const setOnlineSafe = async (value: boolean) => {
    try {
      const mod = await import("src/stores/network");
      const networkStore = mod.useNetworkStore();
      networkStore.setOnline(value);
    } catch {
      // ignore (boot race / store not ready)
    }
  };

  instance.interceptors.request.use(
    async (config: InternalAxiosRequestConfig) => {
      // GATE 3C.1P: Authorization and _authSession must bind to the same session.
      // Auth retries keep the identity set by the 401 refresh path and must not be
      // rebound to a newer login that completed before the retry is sent.
      if (config._retry && config._authSession) {
        const live = await captureAuthSessionSnapshot();
        if (!canHandleAuthFailureForSession(config._authSession, live.generation)) {
          return Promise.reject(
            Object.assign(new Error("Auth session changed before retry"), {
              config,
              code: "ERR_AUTH_SESSION_CHANGED"
            })
          );
        }
        // Keep Authorization + _authSession from the refresh/retry owner.
      } else {
        const snapshot = await captureAuthSessionSnapshot();
        config._authSession = snapshot;
        if (snapshot.token) {
          config.headers.Authorization = `Bearer ${snapshot.token}`;
        }
      }

      const token = config._authSession?.token ?? null;

      // Prefer explicit app language over browser language for BE system texts.
      // Resolved per request so Settings language changes apply immediately.
      config.headers["Accept-Language"] = resolveAcceptLanguageHeader();

      const rel = String(config.url || "");
      const method = String(config.method || "get").toLowerCase();
      if (method === "post" && rel.includes("/login") && !rel.includes("forgot")) {
        const base = String(config.baseURL || "").replace(/\/$/, "");
        const path = rel.startsWith("/") ? rel : `/${rel}`;
        console.info("[DH-LOGIN-DIAG]", "axios.request.out", {
          method,
          baseURL: config.baseURL ?? "(empty)",
          url: rel,
          resolvedUrl: base ? `${base}${path}` : path,
          navigatorOnLine: typeof navigator !== "undefined" ? navigator.onLine : null
        });
      }
      if (method === "post" && rel.includes("/register")) {
        const base = String(config.baseURL || "").replace(/\/$/, "");
        const path = rel.startsWith("/") ? rel : `/${rel}`;
        console.info("[DH-REGISTER-DIAG]", "axios.request.out", {
          method,
          baseURL: config.baseURL ?? "(empty)",
          url: rel,
          resolvedUrl: base ? `${base}${path}` : path,
          payloadKeys: payloadKeysFromConfig(config),
          navigatorOnLine: typeof navigator !== "undefined" ? navigator.onLine : null
        });
      }

      // Pre FormData: nech axios/XHR nastaví Content-Type vrátane boundary.
      // Len `delete headers["Content-Type"]` na AxiosHeaders 1.x nemusí stačiť;
      // ručne nastavené `multipart/form-data` bez boundary potom láme opakované uploady (BE: has_file=false).
      if (config.data instanceof FormData) {
        const h = config.headers;
        if (h && typeof (h as { delete?: (k: string) => void }).delete === "function") {
          (h as { delete: (k: string) => void }).delete("Content-Type");
          (h as { delete: (k: string) => void }).delete("content-type");
        } else {
          delete (config.headers as Record<string, unknown>)["Content-Type"];
          delete (config.headers as Record<string, unknown>)["content-type"];
        }
      }

      if (import.meta.env.DEV) {
        config._diagnosticsStart = Date.now();
        config._diagnosticsUrl = config.url ?? "";
        config._diagnosticsMethod = config.method ?? "GET";
        const endpoint = String(config.url || config.baseURL || "?");
        const head = token ? token.slice(0, 18) + "..." : "none";
        console.debug(`request ${endpoint} | token head: ${head}`);
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // ------------------------------------
  //  Response interceptor – refresh
  // ------------------------------------
  instance.interceptors.response.use(
    (response) => {
      const rel = String(response.config?.url || "");
      const method = String(response.config?.method || "get").toLowerCase();
      if (method === "post" && rel.includes("/register")) {
        console.info("[DH-REGISTER-DIAG]", "axios.response.success", {
          method,
          url: rel,
          baseURL: response.config?.baseURL ?? "(empty)",
          status: response.status,
          bodyPreview: summarizeBodyPreview(response.data)
        });
      }
      if (import.meta.env.DEV && response.config) {
        const c = response.config as InternalAxiosRequestConfig;
        const start = c._diagnosticsStart ?? Date.now();
        pushRequest({
          ts: start,
          kind: "axios",
          method: c._diagnosticsMethod ?? c.method ?? "GET",
          url: c._diagnosticsUrl ?? c.url ?? "",
          status: response.status,
          ok: true,
          durationMs: Date.now() - start
        });
      }
      // If we get any successful response, we're effectively online.
      // This also clears "offline banner" after flaky network recovers.
      void setOnlineSafe(true);
      return response;
    },
    async (error) => {
      const originalRequest = error.config as InternalAxiosRequestConfig | undefined;
      const url = String(originalRequest?.url || "");
      const method = String(originalRequest?.method || "get").toLowerCase();
      if (method === "post" && url.includes("/register")) {
        const mapped = mapAxiosErrorToDhError(error);
        console.info("[DH-REGISTER-DIAG]", "axios.response.error", {
          method,
          url,
          baseURL: originalRequest?.baseURL ?? "(empty)",
          status: error.response?.status,
          code: (error as { code?: string }).code,
          message: (error as { message?: string }).message,
          isTimeout: isTimeoutError(error),
          isNetwork: isNetworkError(error),
          mappedKind: mapped.kind,
          mappedAsOffline: mapped.kind === "offline",
          navigatorOnLine: typeof navigator !== "undefined" ? navigator.onLine : null,
          bodyPreview: summarizeBodyPreview(error.response?.data)
        });
      }
      if (import.meta.env.DEV && originalRequest) {
        const start = originalRequest._diagnosticsStart ?? Date.now();
        pushRequest({
          ts: start,
          kind: "axios",
          method: originalRequest._diagnosticsMethod ?? originalRequest.method ?? "GET",
          url: originalRequest._diagnosticsUrl ?? originalRequest.url ?? "",
          status: error.response?.status,
          ok: false,
          durationMs: Date.now() - start,
          errorMessage: error.message ?? String(error)
        });
      }

      // Network/offline/timeout -> unified notify + offline banner (non-auth only).
      // Auth pages (login/register/forgot/…) already map errors and show toasts; notifying here
      // duplicated messages. ERR_NETWORK on auth also wrongly forced OfflineBanner via setOnline(false).
      if (isTimeoutError(error) || isNetworkError(error)) {
        const authUrl = isAuthEndpointUrl(url);
        if (authUrl) {
          const localhostMisconfig = IS_NATIVE_RUNTIME && isLocalhostUrl(API_BASE_URL);
          console.error("[DH-LOGIN-DIAG]", "axios.response.authTransportFailure", {
            url,
            method: originalRequest?.method,
            baseURL: originalRequest?.baseURL ?? "(empty)",
            resolvedApiBase: API_BASE_URL || "(empty)",
            resolvedApiSource: API_BASE_SOURCE,
            code: (error as { code?: string }).code,
            message: (error as { message?: string }).message,
            isTimeout: isTimeoutError(error),
            isNetwork: isNetworkError(error),
            navigatorOnLine: typeof navigator !== "undefined" ? navigator.onLine : null,
            ...(localhostMisconfig
              ? {
                  hint:
                    "ERR_NETWORK likely because API base is localhost on iPhone. " +
                    "Use VITE_API_BASE_NATIVE_DEV=http://<MAC_LAN_IP>:8000/api in .env"
                }
              : {})
          });
        } else if (isNetworkError(error)) {
          // Requirement: show offline banner also on ERR_NETWORK (even if navigator.onLine is true).
          void setOnlineSafe(false);
          notifyError(mapAxiosErrorToDhError(error));
        } else {
          notifyError(mapAxiosErrorToDhError(error));
        }
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
        if (isAuthEndpointUrl(url)) {
          return Promise.reject(error);
        }

        const requestSession =
          originalRequest._authSession ?? (await captureAuthSessionSnapshot());
        const liveGen = await readLiveGeneration();
        if (!canHandleAuthFailureForSession(requestSession, liveGen)) {
          // Stale 401 from a previous account — do not refresh/logout the new session.
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        const newToken = await refreshTokenSingleFlight(
          { api, axiosInstance },
          requestSession
        );

        const genAfterRefresh = await readLiveGeneration();
        if (!canHandleAuthFailureForSession(requestSession, genAfterRefresh)) {
          return Promise.reject(error);
        }

        if (!newToken) {
          await safeLogoutAndRedirect(requestSession);
          return Promise.reject(error);
        }

        // Retry only while the original session still owns the app.
        if (!canHandleAuthFailureForSession(requestSession, await readLiveGeneration())) {
          return Promise.reject(error);
        }

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return instance(originalRequest);
      }

      // If we already retried once and still get 401, force a single safe logout + redirect.
      if (
        error.response?.status === 401 &&
        originalRequest?._retry &&
        !isAuthEndpointUrl(url)
      ) {
        const requestSession =
          originalRequest._authSession ?? (await captureAuthSessionSnapshot());
        if (!canHandleAuthFailureForSession(requestSession, await readLiveGeneration())) {
          return Promise.reject(error);
        }
        await safeLogoutAndRedirect(requestSession);
        return Promise.reject(error);
      }

      // 403 (Forbidden) - also logout (user doesn't have permission)
      if (error.response?.status === 403 && !isAuthEndpointUrl(url)) {
        const requestSession =
          originalRequest?._authSession ?? (await captureAuthSessionSnapshot());
        if (!canHandleAuthFailureForSession(requestSession, await readLiveGeneration())) {
          return Promise.reject(error);
        }
        await safeLogoutAndRedirect(requestSession);
        return Promise.reject(error);
      }

      // Non-401/403 responses: map status to safe user message (avoid raw backend strings)
      // IMPORTANT: Do NOT logout on 404/500 - these are not auth errors
      const status = error?.response?.status;
      // IMPORTANT: let Auth pages handle their own validation UX (avoid double toasts)
      if (isAuthEndpointUrl(url)) {
        return Promise.reject(error);
      }

      // Show error toast for 404/422/429/500, but do NOT logout
      if (status === 404 || status === 422 || status === 429 || (typeof status === "number" && status >= 500)) {
        notifyError(mapAxiosErrorToDhError(error));
      }

      return Promise.reject(error);
    }
  );
};

attachInterceptor(axiosInstance);
attachInterceptor(api);

/** Proactive refresh before Donor/Donee switch. Uses single-flight lock. */
export const refreshTokenIfNeeded = () => refreshTokenSingleFlight({ api, axiosInstance });

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axiosInstance;
  app.config.globalProperties.$api = api;
});

export { api };
