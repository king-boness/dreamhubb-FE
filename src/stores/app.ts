// src/stores/app.ts
import { defineStore } from "pinia";
import { useAuthStore } from "./auth";
import { usePreferencesStore } from "./preferences";

export const useAppStore = defineStore("app", {
  state: () => ({
    // Global app init state – used for initial splash/loading
    isInitializingApp: true as boolean
  }),
  actions: {
    async initializeApp() {
      if (import.meta.env.DEV) {
        console.debug("[AppStore] initializeApp called");
      }

      const authStore = useAuthStore();
      const preferencesStore = usePreferencesStore();

      try {
        // Hydrate preferences from localStorage (safe to call multiple times)
        preferencesStore.hydrateFromStorage();

        // If we already have a token, make sure user data is loaded
        if (authStore.token) {
          try {
            await authStore.fetchUser();
          } catch (error) {
            // Requirement (auth UX): never spam console with token verification failures.
            // If /user fails during init (401/403 OR network/CORS/timeout), silently clear session and stay in guest flow.
            if (import.meta.env.DEV) {
              console.debug("[AppStore] fetchUser failed during init; clearing session silently.");
            }
            await authStore.logout({ remote: false, silent: true });
          }
        }
      } finally {
        this.isInitializingApp = false;
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
