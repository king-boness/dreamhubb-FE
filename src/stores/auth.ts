// src/stores/auth.ts
import { defineStore } from "pinia";
import axios from "axios";
import { api } from "boot/axios";
import { API_BASE_URL } from "src/config/apiBase";
import { resolveProfileImageSrc } from "src/utils/avatar";
import {
  shouldApplyLocalLogoutCleanup,
  shouldClearAuthorizationHeader,
  type LogoutSessionSnapshot
} from "src/utils/authLogoutGuard";

const TOKEN_KEY = "token";

interface User {
  id: number;
  username: string;
  email: string;
  date_birth?: string;
  gender?: string;
  bio?: string | null;
  preferred_locale?: string | null;
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
    loading: false,
    /** Bumped on login/logout so late /user responses cannot mutate a newer session. */
    sessionGeneration: 0
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

    bumpSessionGeneration(): number {
      this.sessionGeneration += 1;
      return this.sessionGeneration;
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
          // Invalidate any in-flight cold-start /user from a previous session.
          this.bumpSessionGeneration();
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

          try {
            const { useBlocksStore } = await import("src/stores/blocks");
            await useBlocksStore().loadBlockedUsers(true);
          } catch {
            // ignore
          }

          try {
            const { syncLocaleFromUser } = await import("src/utils/applyLocale");
            await syncLocaleFromUser(this.user?.preferred_locale);
          } catch {
            // ignore locale sync failures
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

      const generation = this.sessionGeneration;
      const tokenAtStart = this.token;
      this.loading = true;

      try {
        const { data } = await api.get("/user");

        // Stale response from an older session/token — ignore.
        if (generation !== this.sessionGeneration || this.token !== tokenAtStart) {
          this.loading = false;
          return;
        }

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
          try {
            const { syncLocaleFromUser } = await import("src/utils/applyLocale");
            await syncLocaleFromUser(this.user?.preferred_locale);
          } catch {
            // ignore
          }
        } else {
          this.user = data || null;
        }

        this.loading = false;
      } catch (error) {
        this.loading = false;
        // Stale failure must not log out a newer session.
        if (generation !== this.sessionGeneration || this.token !== tokenAtStart) {
          return;
        }
        // If token is invalid/expired, do local-only logout (avoid /logout spam + loops)
        if (this.isAxiosStatus(error, 401) || this.isAxiosStatus(error, 403)) {
          await this.logout({ remote: false, silent: true });
        } else {
          await this.logout({ remote: true, silent: false });
        }
        throw error;
      }
    },

    /**
     * Apply local logout cleanup only if this logout still owns the session.
     * AUTH-RACE-002: a delayed logout must never wipe a newer login.
     */
    applyLocalLogoutCleanup(snapshot: LogoutSessionSnapshot): boolean {
      if (
        !shouldApplyLocalLogoutCleanup(snapshot, this.token, this.sessionGeneration)
      ) {
        return false;
      }

      const authHeader = api.defaults.headers.common.Authorization;
      const storageToken = localStorage.getItem(TOKEN_KEY);

      this.user = null;
      this.token = null;
      // Only remove storage token if it still matches the revoked session (or is already empty).
      if (!storageToken || storageToken === snapshot.tokenToRevoke) {
        localStorage.removeItem(TOKEN_KEY);
      }

      if (
        shouldClearAuthorizationHeader(
          snapshot,
          authHeader,
          localStorage.getItem(TOKEN_KEY)
        )
      ) {
        delete api.defaults.headers.common.Authorization;
      }

      // Clear guest filters to avoid inheriting old location/filters on next registration
      localStorage.removeItem("dreamhubb_donor_filters_guest");
      localStorage.removeItem("preferences_store_guest");

      return true;
    },

    async logout(opts?: { remote?: boolean; silent?: boolean }) {
      const remote = opts?.remote ?? true;
      const silent = opts?.silent ?? false;

      // Capture credentials for THIS logout before any await / newer login.
      const tokenToRevoke = this.token;
      const logoutGeneration = this.bumpSessionGeneration();
      const snapshot: LogoutSessionSnapshot = { tokenToRevoke, logoutGeneration };

      // Immediate local invalidation so UI/session cannot keep using token A.
      // Remote revoke happens next with the captured token (not ambient interceptor token).
      const cleared = this.applyLocalLogoutCleanup(snapshot);

      if (cleared) {
        try {
          const { useOnboardingStore } = await import("src/stores/onboarding");
          // Re-check after await — a newer login must not get onboarding reset.
          if (shouldApplyLocalLogoutCleanup(snapshot, this.token, this.sessionGeneration)) {
            useOnboardingStore().reset();
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.debug("[Auth] Failed to reset onboarding store:", error);
          }
        }
        try {
          const { usePreferencesStore } = await import("src/stores/preferences");
          if (shouldApplyLocalLogoutCleanup(snapshot, this.token, this.sessionGeneration)) {
            usePreferencesStore().clearLastUsedFeedFilters();
          }
        } catch {
          // ignore
        }
      }

      if (remote && tokenToRevoke) {
        try {
          // Use plain axios (no api request interceptor). The interceptor always
          // injects localStorage token — after a newer login that would be token B,
          // which must never be sent to /logout for session A.
          const base = String(API_BASE_URL || "").replace(/\/$/, "");
          await axios.post(
            `${base}/logout`,
            {},
            {
              headers: {
                Authorization: `Bearer ${tokenToRevoke}`,
                Accept: "application/json",
                "Content-Type": "application/json"
              },
              timeout: 20000
            }
          );
        } catch (error) {
          // Ignore errors - local session for A was already cleared when we owned it.
          // 401 is expected if token is already expired/invalid.
          const isExpected = this.isAxiosStatus(error, 401) || this.isAxiosStatus(error, 403);
          if (!silent && import.meta.env.DEV && !isExpected) {
            console.debug("[Auth] Logout API call failed:", error);
          }
        }
      }

      // Idempotent: if no newer session appeared, ensure cleanup still applied
      // (e.g. remote:false, or first clear was a no-op edge case).
      if (shouldApplyLocalLogoutCleanup(snapshot, this.token, this.sessionGeneration)) {
        this.applyLocalLogoutCleanup(snapshot);
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
