import type {
  Router,
  RouteLocationRaw,
  RouteLocationNormalizedLoaded
} from "vue-router";

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

/**
 * Resolve a fallback route from route meta.
 *
 * Supports:
 * - string starting with "/" => treated as path
 * - string otherwise => treated as route name
 * - RouteLocationRaw object
 *
 * Also supports placeholder params in the fallback object, e.g.:
 *   { name: "donor-post-detail", params: { id: ":id" } }
 * where ":id" is replaced with currentRoute.params.id.
 */
export function resolveBackFallback(
  fallback: unknown,
  currentRoute: RouteLocationNormalizedLoaded,
  defaultFallback: RouteLocationRaw
): RouteLocationRaw {
  if (!fallback) return defaultFallback;

  if (typeof fallback === "string") {
    if (fallback.startsWith("/")) return fallback;
    // If route params exist (e.g. :id), preserve them for the target route when it makes sense.
    return {
      name: fallback,
      params: currentRoute.params
    };
  }

  if (typeof fallback === "object") {
    const replace = (val: unknown): unknown => {
      if (typeof val === "string" && val.startsWith(":")) {
        const key = val.slice(1);
        return (currentRoute.params as Record<string, unknown>)[key] ?? val;
      }
      if (Array.isArray(val)) return val.map(replace);
      if (val && typeof val === "object") {
        return Object.fromEntries(
          Object.entries(val as Record<string, unknown>).map(([k, v]) => [k, replace(v)])
        );
      }
      return val;
    };
    return replace(fallback) as RouteLocationRaw;
  }

  return defaultFallback;
}
