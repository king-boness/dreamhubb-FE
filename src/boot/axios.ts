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

const api = axios.create({
  baseURL: "http://127.0.0.1:8000/api", // ← pevne nastav lokálne API (nespoliehaj sa na .env zatiaľ)
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json"
  }
});

// 🟢 Automaticky pridať JWT token, ak existuje
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("jwtToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      if (process.env.NODE_ENV === "development") {
      console.log("✅ Token pridaný do requestu:", token.substring(0, 30) + "...");
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// 🔴 Response interceptor: ak 401, vymazať token a presmerovať na login
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      if (process.env.NODE_ENV === "development") {
        console.log("❌ 401 Unauthorized - vymazávam token a presmerovávam na login");
      }
      localStorage.removeItem("jwtToken");
      // Presmerovať na login (ak sme v router kontexte)
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  }
);

export default boot(({ app }) => {
  app.config.globalProperties.$axios = axios;
  app.config.globalProperties.$api = api;
});

export { api };
