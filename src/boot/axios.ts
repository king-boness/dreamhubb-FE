import { boot } from "quasar/wrappers";
import axios, { AxiosInstance } from "axios";
import { mapAxiosErrorToDhError, isNetworkError, isTimeoutError } from "src/utils/httpError";
import { notifyError } from "src/utils/notify";
import { tGlobal } from "src/utils/i18nGlobal";

if (import.meta.env.DEV) {
  console.debug("Boot axios.ts loaded");
}

declare module "@vue/runtime-core" {
  interface ComponentCustomProperties {
    $axios: AxiosInstance;
    $api: AxiosInstance;
  }
}

// 🔥 Použi .env hodnotu (ALWAYS!!)
// .env = VITE_API_BASE=http://localhost:8000/api
const BASE = import.meta.env.VITE_API_BASE;

// ------------------------------------
//  401 refresh single-flight (queue)
// ------------------------------------
let refreshPromise: Promise<string | null> | null = null;
let logoutPromise: Promise<void> | null = null;
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

const refreshTokenSingleFlight = async (): Promise<string | null> => {
  if (refreshPromise) return refreshPromise;

  refreshPromise = (async () => {
    const token = localStorage.getItem("token");
    if (!token) return null;

    try {
      const refreshResponse = await axios.post(
        `${BASE}/refresh`,
        {},
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const newToken =
        refreshResponse.data?.authorization?.token ||
        refreshResponse.data?.token;

      if (typeof newToken === "string" && newToken.length > 0) {
        localStorage.setItem("token", newToken);
        return newToken;
      }

      return null;
    } catch {
      return null;
    } finally {
      // Always clear lock (success/fail)
      refreshPromise = null;
    }
  })();

  return refreshPromise;
};

const safeLogoutAndRedirect = async () => {
  if (logoutPromise) return logoutPromise;

  logoutPromise = (async () => {
    try {
      localStorage.removeItem("token");
      try {
        const { useAuthStore } = await import("src/stores/auth");
        const authStore = useAuthStore();
        await authStore.logout({ remote: false, silent: true });
      } catch {
        // ignore
      }

      notifyError({
        kind: "unauthorized",
        messageKey: "common.errors.sessionExpired",
        fallbackMessage: tGlobal("common.errors.sessionExpired", "Session expired. Please sign in again."),
        retryable: false
      });

      // Avoid reload loops: if already on login, don't redirect again.
      if (!String(window.location.href).includes("/login") && !isRedirectingToLogin) {
        isRedirectingToLogin = true;
        window.location.href = "/login";
      }
    } finally {
      logoutPromise = null;
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
    async (config) => {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
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
      // If we get any successful response, we're effectively online.
      // This also clears "offline banner" after flaky network recovers.
      void setOnlineSafe(true);
      return response;
    },
    async (error) => {
      const originalRequest = error.config;
      const url = String(originalRequest?.url || "");

      // Network/offline/timeout -> unified notify (non-raw) + let callers decide UI state
      if (isTimeoutError(error) || isNetworkError(error)) {
        // Requirement: show offline banner also on ERR_NETWORK (even if navigator.onLine is true).
        if (isNetworkError(error)) {
          void setOnlineSafe(false);
        }
        notifyError(mapAxiosErrorToDhError(error));
        return Promise.reject(error);
      }

      if (error.response?.status === 401 && !originalRequest._retry) {
        if (isAuthEndpointUrl(url)) {
          return Promise.reject(error);
        }

        originalRequest._retry = true;

        const newToken = await refreshTokenSingleFlight();
        if (!newToken) {
          await safeLogoutAndRedirect();
          return Promise.reject(error);
        }

        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return instance(originalRequest);
      }

      // If we already retried once and still get 401, force a single safe logout + redirect.
      if (error.response?.status === 401 && originalRequest?._retry && !isAuthEndpointUrl(url)) {
        await safeLogoutAndRedirect();
        return Promise.reject(error);
      }

      // Non-401 responses: map status to safe user message (avoid raw backend strings)
      const status = error?.response?.status;
      // IMPORTANT: let Auth pages handle their own validation UX (avoid double toasts)
      if (isAuthEndpointUrl(url)) {
        return Promise.reject(error);
      }

      if (status === 403 || status === 404 || status === 422 || status === 429 || (typeof status === "number" && status >= 500)) {
        notifyError(mapAxiosErrorToDhError(error));
      }

      return Promise.reject(error);
    }
  );
};

attachInterceptor(axiosInstance);
attachInterceptor(api);

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axiosInstance;
  app.config.globalProperties.$api = api;
});

export { api };
