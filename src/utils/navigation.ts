import type { Router, RouteLocationRaw } from "vue-router";

/**
 * Navigate back if there is browser history; otherwise go to a provided fallback route.
 * This prevents "stuck" pages when users open deep links directly (no history).
 */
export function goBackOrFallback(router: Router, fallback: RouteLocationRaw) {
  if (typeof window !== "undefined" && window.history.length > 1) {
    router.back();
    return;
  }
  router.push(fallback);
}

