/**
 * Post-auth home navigation helpers (login / guest-route bounce).
 * Side preference is FE-only (preferences store); BE has no durable donor/donee role.
 */

export type AppSide = "donor" | "donee";

export type PostAuthLocation = { name: "donor-posts" } | { name: "donee-posts" } | string;

const DEFAULT_HOME: { name: "donor-posts" } = { name: "donor-posts" };

export function normalizeAppSide(side: unknown): AppSide | null {
  if (side === "donee" || side === "donor") {
    return side;
  }
  return null;
}

/** Home feed route for a known side; unknown → donor feed (safe fallback). */
export function homeRouteForSide(side: unknown): { name: "donor-posts" } | { name: "donee-posts" } {
  return normalizeAppSide(side) === "donee" ? { name: "donee-posts" } : DEFAULT_HOME;
}

/**
 * Allow only same-origin app paths (leading single slash).
 * Rejects protocol-relative URLs, absolute URLs, empty values,
 * and auth/onboarding paths that would bounce or loop after login.
 */
export function isSafeInternalRedirect(redirect: unknown): redirect is string {
  if (typeof redirect !== "string") {
    return false;
  }
  const value = redirect.trim();
  if (!value.startsWith("/")) {
    return false;
  }
  if (value.startsWith("//")) {
    return false;
  }
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(value)) {
    return false;
  }
  if (value.includes("\\")) {
    return false;
  }
  const pathOnly = value.split("?")[0].split("#")[0];
  if (/^\/(login|landing|auth|onboarding)(\/|$)/i.test(pathOnly)) {
    return false;
  }
  if (/^\/register(\/|$)/i.test(pathOnly)) {
    return false;
  }
  return true;
}

/** Read side prefs for a specific user id directly from localStorage (no cross-account leak). */
export function readStoredSidePreferences(userId: number | null | undefined): {
  currentSide: AppSide | null;
  onboardingInitialSide: AppSide | null;
} {
  if (userId == null || !Number.isFinite(Number(userId))) {
    return { currentSide: null, onboardingInitialSide: null };
  }
  try {
    const raw = localStorage.getItem(`preferences_store_${userId}`);
    if (!raw) {
      return { currentSide: null, onboardingInitialSide: null };
    }
    const data = JSON.parse(raw) as {
      currentSide?: unknown;
      onboardingInitialSide?: unknown;
    };
    return {
      currentSide: normalizeAppSide(data.currentSide),
      onboardingInitialSide: normalizeAppSide(data.onboardingInitialSide)
    };
  } catch {
    return { currentSide: null, onboardingInitialSide: null };
  }
}

export type ResolvePostAuthRedirectInput = {
  /** Optional `?redirect=` (or similar) from the login/deep-link query. */
  explicitRedirect?: unknown;
  /** Last chosen side from preferences (`currentSide`). */
  currentSide?: unknown;
  /** Onboarding initial side — used only when currentSide is unset/invalid. */
  onboardingInitialSide?: unknown;
};

/**
 * Priority:
 * 1) Valid explicit internal redirect
 * 2) currentSide
 * 3) onboardingInitialSide
 * 4) Safe fallback (donor-posts)
 */
export function resolvePostAuthRedirect(input: ResolvePostAuthRedirectInput = {}): PostAuthLocation {
  if (isSafeInternalRedirect(input.explicitRedirect)) {
    return input.explicitRedirect.trim();
  }

  const fromCurrent = normalizeAppSide(input.currentSide);
  if (fromCurrent) {
    return homeRouteForSide(fromCurrent);
  }

  const fromInitial = normalizeAppSide(input.onboardingInitialSide);
  if (fromInitial) {
    return homeRouteForSide(fromInitial);
  }

  return DEFAULT_HOME;
}
