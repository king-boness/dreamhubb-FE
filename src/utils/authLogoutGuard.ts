/**
 * Guards for logout vs newer login races (AUTH-RACE-002).
 */

export type LogoutSessionSnapshot = {
  /** Token that this logout intends to revoke (may be null if already cleared). */
  tokenToRevoke: string | null;
  /** sessionGeneration immediately after logout bumped it. */
  logoutGeneration: number;
};

/**
 * Whether local session cleanup for a logout may still run.
 * Returns false when a newer login/session already owns auth state.
 */
export function shouldApplyLocalLogoutCleanup(
  snapshot: LogoutSessionSnapshot,
  currentToken: string | null | undefined,
  currentGeneration: number
): boolean {
  if (currentGeneration !== snapshot.logoutGeneration) {
    return false;
  }
  if (
    currentToken != null &&
    snapshot.tokenToRevoke != null &&
    currentToken !== snapshot.tokenToRevoke
  ) {
    return false;
  }
  return true;
}

/**
 * Whether the shared Axios Authorization default may be cleared by this logout.
 * Must not strip a newer session's Bearer token.
 */
export function shouldClearAuthorizationHeader(
  snapshot: LogoutSessionSnapshot,
  authorizationHeader: unknown,
  currentTokenInStorage: string | null | undefined
): boolean {
  // Newer session token already in storage — never strip its Authorization.
  if (
    currentTokenInStorage != null &&
    snapshot.tokenToRevoke != null &&
    currentTokenInStorage !== snapshot.tokenToRevoke
  ) {
    return false;
  }
  if (currentTokenInStorage != null && currentTokenInStorage !== snapshot.tokenToRevoke) {
    return false;
  }

  const header = typeof authorizationHeader === "string" ? authorizationHeader : "";
  if (snapshot.tokenToRevoke && header === `Bearer ${snapshot.tokenToRevoke}`) {
    return true;
  }
  // Session ended and storage empty — clear leftover defaults.
  if (!currentTokenInStorage) {
    return true;
  }
  return false;
}
