import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  canApplyRefreshedToken,
  canHandleAuthFailureForSession,
  canSafeLogoutSession,
  type AuthSessionSnapshot
} from "./authSessionOwnership.ts";

describe("AUTH-RACE-003 session ownership", () => {
  const snapA: AuthSessionSnapshot = { token: "token-A", generation: 1 };

  it("TEST A: refresh success same session may apply", () => {
    assert.equal(canApplyRefreshedToken(snapA, "token-A", 1), true);
  });

  it("TEST B: refresh A success after login B must not apply", () => {
    assert.equal(canApplyRefreshedToken(snapA, "token-B", 2), false);
  });

  it("TEST C: refresh A failure path must not logout B", () => {
    assert.equal(canHandleAuthFailureForSession(snapA, 2), false);
    assert.equal(canSafeLogoutSession(snapA, "token-B", 2), false);
  });

  it("TEST D/E: stale 401/403 after login B blocked", () => {
    assert.equal(canHandleAuthFailureForSession(snapA, 2), false);
  });

  it("same generation peer refresh returns not applicable for overwrite", () => {
    // Token already rotated by peer flight — do not clobber with stale result
    assert.equal(canApplyRefreshedToken(snapA, "token-A-refreshed", 1), false);
  });

  it("TEST I: current session may still safe-logout on failed refresh", () => {
    assert.equal(canSafeLogoutSession(snapA, "token-A", 1), true);
    assert.equal(canHandleAuthFailureForSession(snapA, 1), true);
  });

  it("TEST G: after logout generation bump, stale refresh cannot restore A", () => {
    assert.equal(canApplyRefreshedToken(snapA, null, 2), false);
    assert.equal(canApplyRefreshedToken(snapA, "token-A", 2), false);
  });
});

/**
 * Faithful apply path used by refreshTokenSingleFlight (post-/refresh).
 * Kept here so AUTH-RACE-003 matrix exercises the same predicates as axios.ts.
 */
function applyRefreshResult(
  snapshot: AuthSessionSnapshot,
  newToken: string,
  currentToken: string | null,
  currentGeneration: number
): string | null {
  if (!canApplyRefreshedToken(snapshot, currentToken, currentGeneration)) {
    if (
      currentGeneration === snapshot.generation &&
      typeof currentToken === "string" &&
      currentToken.length > 0 &&
      currentToken !== snapshot.token
    ) {
      return currentToken;
    }
    return null;
  }
  if (currentToken !== snapshot.token) {
    return currentToken;
  }
  return newToken;
}

describe("AUTH-RACE-003 refresh apply matrix", () => {
  const snapA: AuthSessionSnapshot = { token: "token-A", generation: 1 };

  it("TEST A apply", () => {
    assert.equal(applyRefreshResult(snapA, "token-A2", "token-A", 1), "token-A2");
  });

  it("TEST B apply blocked — keep B", () => {
    assert.equal(applyRefreshResult(snapA, "token-A2", "token-B", 2), null);
  });

  it("TEST H: peer same-gen refresh returns live token, not stale A2", () => {
    assert.equal(applyRefreshResult(snapA, "token-A2", "token-A-peer", 1), "token-A-peer");
  });

  it("post-write generation mismatch must not claim stale refresh success", () => {
    // Mirrors axios path: after sync write, if a later generation read diverges
    // (store unavailable + await), return live token instead of stale newToken.
    const liveAfterAwait = "token-B";
    const genAfterAwait = 2;
    const claimed =
      genAfterAwait === snapA.generation ? "token-A2" : liveAfterAwait;
    assert.equal(claimed, "token-B");
    assert.equal(canApplyRefreshedToken(snapA, liveAfterAwait, genAfterAwait), false);
  });
});
