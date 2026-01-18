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
      if (process.env.NODE_ENV === "development") {
        console.log("🟣 [AppStore] initializeApp called");
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
            // If fetchUser fails, log out and fall back to guest flow
            if (process.env.NODE_ENV === "development") {
              console.warn("⚠️ [AppStore] fetchUser failed during init:", error);
            }
            // If token is expired/invalid, avoid calling /logout (it would 401 and spam console)
            const is401 =
              error &&
              typeof error === "object" &&
              "response" in error &&
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              ((error as any).response?.status === 401 || (error as any).response?.status === 403);
            await authStore.logout({ remote: !is401, silent: true });
          }
        }
      } finally {
        this.isInitializingApp = false;
        if (process.env.NODE_ENV === "development") {
          console.log("🟢 [AppStore] initializeApp finished");
        }
      }
    },

    setInitializingApp(value: boolean) {
      this.isInitializingApp = value;
    }
  }
});
