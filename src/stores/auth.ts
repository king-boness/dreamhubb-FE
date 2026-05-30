// src/stores/auth.ts
import { defineStore } from "pinia";
import { api } from "boot/axios";
import { resolveProfileImageSrc } from "src/utils/avatar";

const TOKEN_KEY = "token";

interface User {
  id: number;
  username: string;
  email: string;
  date_birth?: string;
  gender?: string;
  bio?: string | null;
  location_country_id?: number;
  location_continent_id?: number;
  location_city_id?: number;
  location_city?: string | null;
  location_country?: string | null;
  location_continent?: string | null;
  tokens?: number;
  profile_picture?: string | null;
  profile_picture_public_id?: string | null;
  email_verified_at?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: (localStorage.getItem(TOKEN_KEY) || null) as string | null,
    user: null as User | null,
    loading: false
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    avatarUrl: (state) => resolveProfileImageSrc(state.user?.profile_picture ?? null),
    name: (state) => state.user?.username || ""
  },

  actions: {
    isAxiosStatus(error: unknown, status: number): boolean {
      if (!error || typeof error !== "object") return false;
      if (!("response" in error)) return false;
      const anyErr = error as { response?: { status?: number } };
      return anyErr.response?.status === status;
    },

    async login(payload: { email: string; password: string }) {
      this.loading = true;

      if (process.env.NODE_ENV === "development") {
        console.debug("🚀 Login attempt:", { email: payload.email });
      }

      try {
        const { data } = await api.post("/login", {
          email: payload.email,
          password: payload.password
        });

        if (process.env.NODE_ENV === "development") {
          console.debug("🔐 Login response:", {
            status: data?.status,
            userId: data?.user?.id
          });
        }

        if (data && data.status === "success") {
          this.user = data.user || null;
          this.token = data.authorization?.token || null;

          if (this.token) {
            localStorage.setItem(TOKEN_KEY, this.token);
            api.defaults.headers.common.Authorization = `Bearer ${this.token}`;
          }

          // Prevent "guest" filters leaking into authenticated session
          try {
            const { usePreferencesStore } = await import("src/stores/preferences");
            const preferencesStore = usePreferencesStore();
            preferencesStore.hydrateFromStorage();
            preferencesStore.loadDonorFiltersFromStorage();
            // Optional cleanup of guest keys (keeps things deterministic after login/register)
            localStorage.removeItem("dreamhubb_donor_filters_guest");
            localStorage.removeItem("preferences_store_guest");
          } catch {
            // ignore
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
          if (import.meta.env.DEV) {
            console.debug("[Auth] User data loaded:", {
              id: this.user?.id,
              username: this.user?.username,
              location_city: this.user?.location_city,
              location_country: this.user?.location_country,
              location_continent: this.user?.location_continent
            });
          }
        } else {
          this.user = data || null;
        }

        this.loading = false;
      } catch (error) {
        this.loading = false;
        // If token is invalid/expired, do local-only logout (avoid /logout spam + loops)
        if (this.isAxiosStatus(error, 401) || this.isAxiosStatus(error, 403)) {
          await this.logout({ remote: false, silent: true });
        } else {
          await this.logout({ remote: true, silent: false });
        }
        throw error;
      }
    },

    async logout(opts?: { remote?: boolean; silent?: boolean }) {
      const remote = opts?.remote ?? true;
      const silent = opts?.silent ?? false;

      try {
        if (remote) {
          // Pokúsiť sa zavolať POST /logout (endpoint existuje, ale token sa na BE pravdepodobne reálne neinvaliduje)
          await api.post("/logout");
        }
      } catch (error) {
        // Ignore errors - we still clear local session.
        // 401 is expected if token is already expired/invalid.
        const isExpected = this.isAxiosStatus(error, 401) || this.isAxiosStatus(error, 403);
        if (!silent && import.meta.env.DEV && !isExpected) {
          console.debug("[Auth] Logout API call failed:", error);
        }
      } finally {
        // Bez ohľadu na výsledok:
        this.user = null;
        this.token = null;
        localStorage.removeItem(TOKEN_KEY);
        delete api.defaults.headers.common.Authorization;

        // Clear guest filters to avoid inheriting old location/filters on next registration
        localStorage.removeItem("dreamhubb_donor_filters_guest");
        localStorage.removeItem("preferences_store_guest");

        // Reset onboarding store pri logout-e
        try {
          const { useOnboardingStore } = await import("src/stores/onboarding");
          const onboardingStore = useOnboardingStore();
          onboardingStore.reset();
        } catch (error) {
          // Ignorovať chyby - onboarding store možno nie je inicializovaný
          if (import.meta.env.DEV) {
            console.debug("[Auth] Failed to reset onboarding store:", error);
          }
        }

        // Reset preferences donor filters in-memory (avoid UI using stale filters after logout)
        try {
          const { usePreferencesStore } = await import("src/stores/preferences");
          const preferencesStore = usePreferencesStore();
          preferencesStore.clearLastUsedFeedFilters();
        } catch {
          // ignore
        }
      }
    },

    // Update user tokens (e.g., after donation)
    updateTokens(newTokens: number) {
      if (this.user) {
        this.user.tokens = newTokens;
      }
    },

    // Refresh token balance from API
    // This is a shared action that can be called after token-deducting operations
    // (e.g., after creating a post or contributing tokens)
    async refreshTokenBalance() {
      if (!this.token) {
        if (import.meta.env.DEV) {
          console.debug("[refreshTokenBalance] No token, skipping refresh");
        }
        return;
      }

      try {
        // Use existing fetchUser() which calls /api/user and updates this.user
        await this.fetchUser();
        if (import.meta.env.DEV) {
          console.debug("[refreshTokenBalance] Token balance refreshed:", this.user?.tokens);
        }
      } catch (error) {
        // Don't block UX if refresh fails - just log it
        if (import.meta.env.DEV) {
          console.debug("[refreshTokenBalance] Failed to refresh token balance:", error);
        }
        // Don't throw - allow the operation to continue
      }
    },

    async updateBio(newBio: string) {
      if (!this.token) return;

      const payload = { bio: newBio };
      const { data } = await api.put("/user/update", payload);

      if (data && data.status === "success") {
        if (!this.user) {
          this.user = data.user;
        } else {
          this.user.bio = data.user.bio;
        }
      }
    },

    /** Permanently delete the authenticated account (requires backend DELETE /user). */
    async deleteAccount(): Promise<void> {
      if (!this.token) {
        throw new Error("Not authenticated");
      }

      // TODO(backend): confirm Laravel exposes DELETE /api/user (or POST /api/user/delete).
      const { data } = await api.delete("/user");

      if (data?.status === "success") {
        await this.logout({ remote: false, silent: true });
        return;
      }

      throw new Error(data?.message || "Account deletion failed");
    },

    /** Set token (used after refresh to keep store in sync with localStorage) */
    setToken(token: string | null) {
      this.token = token;
      if (token) {
        localStorage.setItem(TOKEN_KEY, token);
      } else {
        localStorage.removeItem(TOKEN_KEY);
      }
    },

    // Generic profile update (supports location_city_id, etc.)
    async updateProfile(payload: Partial<Pick<User, "username" | "date_birth" | "gender" | "bio" | "location_continent_id" | "location_country_id" | "location_city_id">>) {
      if (!this.token) return;

      const { data } = await api.put("/user/update", payload);

      if (data && data.status === "success") {
        // Replace user object if provided (keeps new location_*_name fields from BE)
        if (data.user) {
          this.user = data.user;
        } else if (this.user) {
          Object.assign(this.user, payload);
        }
      }
    }
  }
});
