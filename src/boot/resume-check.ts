import { boot } from "quasar/wrappers";
import { useNetworkStore } from "src/stores/network";

/**
 * Resume check boot - handles app resume from background
 *
 * When app returns from background (visibilitychange/focus):
 * - Re-checks navigator.onLine status
 * - Updates networkStore.isOnline if online
 * - Does NOT auto-retry (user must click Retry button)
 *
 * DEV-only: Logs are wrapped in import.meta.env.DEV guard
 * No token/password/authorization logging
 */
export default boot(() => {
  const networkStore = useNetworkStore();

  function handleResume() {
    // Re-check online status when app becomes visible
    if (typeof navigator !== "undefined" && navigator.onLine) {
      // Only update if we were offline (to avoid unnecessary updates)
      if (!networkStore.isOnline) {
        if (import.meta.env.DEV) {
          console.debug("[resume-check] App resumed, navigator.onLine=true, updating networkStore");
        }
        networkStore.setOnline(true);
      }
    } else {
      // Still offline
      if (import.meta.env.DEV) {
        console.debug("[resume-check] App resumed, navigator.onLine=false, staying offline");
      }
      networkStore.setOnline(false);
    }
  }

  // Handle visibilitychange (when tab/window becomes visible)
  if (typeof document !== "undefined") {
    document.addEventListener("visibilitychange", () => {
      if (!document.hidden) {
        // App became visible
        handleResume();
      }
    });
  }

  // Handle window focus (additional check for mobile apps)
  if (typeof window !== "undefined") {
    window.addEventListener("focus", () => {
      handleResume();
    });
  }

  if (import.meta.env.DEV) {
    console.debug("[resume-check] Resume check handlers registered");
  }
});
