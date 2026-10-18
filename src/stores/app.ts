// src/stores/app.ts
import { defineStore } from "pinia";
import { useAuthStore } from "./auth";
import { usePreferencesStore } from "./preferences";
import { markAuthSessionSettled, runColdStartAuthProbe } from "src/utils/authSessionReady";

export const useAppStore = defineStore("app", {
  state: () => ({
    // Global app init state – used for initial splash/loading
    isInitializingApp: true as boolean
  }),
  getters: {
    /** Alias used by App.vue */
    isInitializing: (state) => state.isInitializingApp
  },
  actions: {
    async initializeApp() {
      if (import.meta.env.DEV) {
        console.debug("[AppStore] initializeApp called");
      }

      const authStore = useAuthStore();
      const preferencesStore = usePreferencesStore();

      try {
        // TOKEN → AUTH INIT → USER ID → PREFERENCES
        if (authStore.token) {
          await runColdStartAuthProbe(async () => {
            try {
              await authStore.fetchUser();
            } catch {
              if (import.meta.env.DEV) {
                console.debug("[AppStore] fetchUser failed during init; clearing session silently.");
              }
              try {
                await authStore.logout({ remote: false, silent: true });
              } catch {
                // ignore — guest flow must still render
              }
            }
          });
        } else {
          markAuthSessionSettled();
        }

        try {
          preferencesStore.hydrateFromStorage();
        } catch (error) {
          if (import.meta.env.DEV) {
            console.debug("[AppStore] hydrateFromStorage failed:", error);
          }
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          console.debug("[AppStore] initializeApp unexpected error:", error);
        }
      } finally {
        this.isInitializingApp = false;
        // Idempotent if cold-start probe already settled.
        markAuthSessionSettled();
        if (import.meta.env.DEV) {
          console.debug("[AppStore] initializeApp finished");
        }
      }
    },

    setInitializingApp(value: boolean) {
      this.isInitializingApp = value;
    }
  }
});
