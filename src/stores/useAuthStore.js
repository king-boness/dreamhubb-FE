// src/stores/useAuthStore.js
import { defineStore } from "pinia";
import { api } from "boot/axios";

const TOKEN_KEY = "jwtToken";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null,
    user: null,
    status: "idle"
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async login(rawPayload) {
      this.status = "loading";

      // Normalizácia payloadu (legacy ochrana)
      let payload;
      if (
        rawPayload &&
        typeof rawPayload.email === "object" &&
        rawPayload.email !== null &&
        Object.prototype.hasOwnProperty.call(rawPayload.email, "email")
      ) {
        payload = rawPayload.email;
      } else {
        payload = rawPayload;
      }

      const email = String(payload.email ?? "");
      const password = String(payload.password ?? "");
      // NOTE: never keep/print sensitive flags (remember) in logs here; legacy store

      // Never log credentials/tokens (even in dev)

      try {
        const { data } = await api.post("/login", {
          email,
          password
        });

        this.token = data?.authorization?.token || null;
        this.user = data?.user || null;

        // ⬇️ DÔLEŽITÉ: token ULOŽ vždy, ak existuje
        if (this.token) {
          localStorage.setItem(TOKEN_KEY, this.token);
        }

        this.status = "success";
        return data;
      } catch (error) {
        this.status = "error";
        throw error;
      }
    },

    logout() {
      this.token = null;
      this.user = null;
      this.status = "idle";
      localStorage.removeItem(TOKEN_KEY);
    },

    async fetchUser() {
      if (!this.token) return;

      try {
        const { data } = await api.get("/user");
        this.user = data;
      } catch (error) {
        this.logout();
        throw error;
      }
    },

    async checkStoredToken() {
      const storedToken = localStorage.getItem(TOKEN_KEY);
      if (!storedToken) return;

      this.token = storedToken;
      try {
        await this.fetchUser();
      } catch {
        this.logout();
      }
    }
  }
});
