// src/stores/auth.ts
import { defineStore } from "pinia";
import { api } from "boot/axios";

const TOKEN_KEY = "token";

interface User {
  id: number;
  username: string;
  email: string;
  date_birth?: string;
  gender?: string;
  location_country_id?: number;
  location_continent_id?: number;
  location_city_id?: number;
  tokens?: number;
  profile_picture?: string | null;
  profile_picture_public_id?: string | null;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

type Status = "idle" | "loading" | "success" | "error";

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: (localStorage.getItem(TOKEN_KEY) || null) as string | null,
    user: null as User | null,
    loading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token
  },

  actions: {
    async login(payload: { email: string; password: string }) {
      this.loading = true;

      if (process.env.NODE_ENV === "development") {
        console.log("🚀 Login payload:", payload);
      }

      try {
        const { data } = await api.post("/login", {
          email: payload.email,
          password: payload.password
        });

        if (process.env.NODE_ENV === "development") {
          console.log("🔐 Login response:", data);
        }

        if (data && data.status === "success") {
          this.user = data.user || null;
          this.token = data.authorization?.token || null;

          if (this.token) {
            localStorage.setItem(TOKEN_KEY, this.token);
            api.defaults.headers.common.Authorization = `Bearer ${this.token}`;
          }

          this.loading = false;
          return data;
        } else {
          throw new Error(data?.message || "Login failed");
        }
      } catch (error) {
        this.loading = false;
        throw error;
      }
    },

    async fetchUser() {
      if (!this.token) {
        return;
      }

      this.loading = true;

      try {
        const { data } = await api.get("/user");

        if (data && data.status === "success") {
          this.user = data.user || null;
        } else {
          this.user = data || null;
        }

        this.loading = false;
      } catch (error) {
        this.loading = false;
        this.logout();
        throw error;
      }
    },

    async logout() {
      try {
        // Pokúsiť sa zavolať POST /logout (endpoint existuje, ale token sa na BE pravdepodobne reálne neinvaliduje)
        await api.post("/logout");
      } catch (error) {
        // Ignorovať chyby - aj tak vymazeme token
        if (process.env.NODE_ENV === "development") {
          console.warn("Logout API call failed:", error);
        }
      } finally {
        // Bez ohľadu na výsledok:
        this.user = null;
        this.token = null;
        localStorage.removeItem(TOKEN_KEY);
        delete api.defaults.headers.common.Authorization;

        // Reset onboarding store pri logout-e
        try {
          const { useOnboardingStore } = await import("src/stores/onboarding");
          const onboardingStore = useOnboardingStore();
          onboardingStore.reset();
        } catch (error) {
          // Ignorovať chyby - onboarding store možno nie je inicializovaný
          if (process.env.NODE_ENV === "development") {
            console.warn("Failed to reset onboarding store:", error);
          }
        }
      }
    }
  }
});
