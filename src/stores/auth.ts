// src/stores/auth.ts
import { defineStore } from "pinia";
import { api } from "boot/axios";

const TOKEN_KEY = "jwtToken";

interface User {
  id: number;
  username: string;
  email: string;
  // doplň si ďalšie polia podľa BE (profile_picture, tokens, atď.)
}

type Status = "idle" | "loading" | "success" | "error";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: null as string | null,
    user: null as User | null,
    status: "idle" as Status
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async login(payload: { email: string; password: string; remember?: boolean }) {
      this.status = "loading";

      if (process.env.NODE_ENV === "development") {
        console.log("🚀 Login payload:", payload, "typeof email:", typeof payload.email);
      }

      try {
        // ⬇️ DÔLEŽITÉ: nič nezabalujeme, posielame presne email + password
        const { data } = await api.post("/login", {
          email: payload.email,
          password: payload.password
        });

        if (process.env.NODE_ENV === "development") {
          console.log("🔐 Login response:", data);
        }

        this.token = data?.authorization?.token || null;
        this.user = data?.user || null;

        if (payload.remember && this.token) {
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
        const { data } = await api.get("/user"); // alebo /me podľa BE
        this.user = data;
      } catch (error) {
        // napr. token neplatný – radšej odhlásiť
        this.logout();
        throw error;
      }
    },

    async checkStoredToken() {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        return;
      }

      this.token = storedToken;
      try {
        await this.fetchUser();
      } catch {
        // ak validácia spadne, token zahodíme
        this.logout();
      }
    }
  }
});
