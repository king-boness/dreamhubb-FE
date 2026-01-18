if (process.env.NODE_ENV === "development") {
  console.log("🚀 Boot axios.ts loaded");
}

import { boot } from "quasar/wrappers";
import axios, { AxiosInstance } from "axios";

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
//  Vytvor axios inštancie
// ------------------------------------
const axiosInstance = axios.create({
  baseURL: BASE,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
});

const api = axios.create({
  baseURL: BASE,
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
  if (process.env.NODE_ENV === "development") {
    console.log("🔑 Token loaded from localStorage on boot");
  }
}

// ------------------------------------
//  Request interceptor (token)
// ------------------------------------
let didLogTokenAttached = false;
const attachInterceptor = (instance: AxiosInstance) => {
  instance.interceptors.request.use(
    async (config) => {
      const token = localStorage.getItem("token");

      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
        if (process.env.NODE_ENV === "development" && !didLogTokenAttached) {
          // eslint-disable-next-line no-console
          console.debug("🔐 Token attached (first request):", token.substring(0, 20));
          didLogTokenAttached = true;
        }
      }

      return config;
    },
    (error) => Promise.reject(error)
  );

  // ------------------------------------
  //  Response interceptor – refresh
  // ------------------------------------
  instance.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        const token = localStorage.getItem("token");
        if (!token) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return Promise.reject(error);
        }

        try {
          const refreshResponse = await axios.post(
            `${BASE}/refresh`,
            {},
            { headers: { Authorization: `Bearer ${token}` } }
          );

          const newToken =
            refreshResponse.data?.authorization?.token ||
            refreshResponse.data?.token;

          if (newToken) {
            localStorage.setItem("token", newToken);
            originalRequest.headers.Authorization = `Bearer ${newToken}`;
            return instance(originalRequest);
          }
        } catch (refreshError) {
          localStorage.removeItem("token");
          window.location.href = "/login";
          return Promise.reject(refreshError);
        }
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
