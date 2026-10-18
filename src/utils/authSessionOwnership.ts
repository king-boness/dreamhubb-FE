/**
 * Session ownership for async auth ops (refresh / 401 / safe logout).
 * AUTH-RACE-003: stale responses must not mutate a newer login session.
 */

export type AuthSessionSnapshot = {
  /** Bearer token observed when the async op started. */
  token: string | null;
  /** auth.sessionGeneration at start (bumped on login/logout, not on refresh). */
  generation: number;
};

export async function captureAuthSessionSnapshot(): Promise<AuthSessionSnapshot> {
  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  let generation = 0;
  try {
    const { useAuthStore } = await import("src/stores/auth");
    generation = useAuthStore().sessionGeneration;
  } catch {
    // Pinia/store may not be ready during very early boot.
  }
  return { token, generation };
}

export function readCurrentAuthSessionSnapshot(
  getGeneration?: () => number
): AuthSessionSnapshot {
  const token =
    typeof localStorage !== "undefined" ? localStorage.getItem("token") : null;
  let generation = 0;
  if (getGeneration) {
    generation = getGeneration();
  }
  return { token, generation };
}

/**
 * True when the live session is still the same login/logout generation.
 * Token may change across a successful refresh within the same generation.
 */
export function isSameAuthGeneration(
  snapshot: AuthSessionSnapshot,
  currentGeneration: number
): boolean {
  return snapshot.generation === currentGeneration;
}

/**
 * Whether a completed refresh for `snapshot.token` may write a new token.
 * Blocks cross-account writes after login/logout (generation change) and
 * avoids clobbering a peer refresh that already rotated the token.
 */
export function canApplyRefreshedToken(
  snapshot: AuthSessionSnapshot,
  currentToken: string | null | undefined,
  currentGeneration: number
): boolean {
  if (!isSameAuthGeneration(snapshot, currentGeneration)) {
    return false;
  }
  if (snapshot.token == null) {
    return false;
  }
  // Still the token we set out to refresh.
  if (currentToken === snapshot.token) {
    return true;
  }
  // Token already rotated (or cleared) for this generation — do not overwrite.
  return false;
}

/**
 * Whether a 401/403 handler may refresh or log out for this snapshot.
 */
export function canHandleAuthFailureForSession(
  snapshot: AuthSessionSnapshot,
  currentGeneration: number
): boolean {
  return isSameAuthGeneration(snapshot, currentGeneration);
}

/**
 * Whether safeLogoutAndRedirect may clear/redirect for this snapshot.
 */
export function canSafeLogoutSession(
  snapshot: AuthSessionSnapshot,
  currentToken: string | null | undefined,
  currentGeneration: number
): boolean {
  if (!isSameAuthGeneration(snapshot, currentGeneration)) {
    return false;
  }
  // If a newer token is already present under the same generation (refresh),
  // still allow logout of the current session (invalid refresh path).
  // If token is for a different account, generation would have changed.
  if (
    snapshot.token != null &&
    currentToken != null &&
    currentToken !== snapshot.token
  ) {
    // Same generation but different token ⇒ refresh already applied; logout still
    // targets this generation's session (correct for failed post-refresh 401).
    return true;
  }
  return true;
}
