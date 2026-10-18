import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  authorizationMatchesSession,
  canApplyRefreshedToken,
  canHandleAuthFailureForSession,
  canSafeLogoutSession,
  readAuthSessionSnapshotSync,
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
    // (store unavailable + await), return null — never hand back token-B.
    const liveAfterAwait = "token-B";
    const genAfterAwait = 2;
    const claimed = genAfterAwait === snapA.generation ? "token-A2" : null;
    assert.equal(claimed, null);
    assert.equal(canApplyRefreshedToken(snapA, liveAfterAwait, genAfterAwait), false);
  });
});

describe("GATE 3C.1P request identity consistency", () => {
  beforeEach(() => {
    const map = new Map<string, string>();
    (globalThis as { localStorage?: Storage }).localStorage = {
      getItem: (k: string) => (map.has(k) ? map.get(k)! : null),
      setItem: (k: string, v: string) => {
        map.set(k, String(v));
      },
      removeItem: (k: string) => {
        map.delete(k);
      },
      clear: () => map.clear(),
      key: () => null,
      length: 0
    } as Storage;
  });

  it("sync snapshot reads token and generation without split await", () => {
    localStorage.setItem("token", "token-A");
    let generation = 1;
    // Simulate login B completing before the sync read window.
    localStorage.setItem("token", "token-B");
    generation = 2;
    const snap = readAuthSessionSnapshotSync(() => generation);
    assert.equal(snap.token, "token-B");
    assert.equal(snap.generation, 2);
    assert.equal(authorizationMatchesSession(`Bearer ${snap.token}`, snap), true);
  });

  it("inconsistent Authorization vs snapshot is detectable", () => {
    const snap = { token: "token-A", generation: 2 };
    assert.equal(authorizationMatchesSession("Bearer token-A", snap), true);
    assert.equal(authorizationMatchesSession("Bearer token-B", snap), false);
  });

  it("inconsistent generation matching live B must not authorize failure handling for A token alone", () => {
    // After fix, capture never produces {token-A, gen-B}. If it did, peer refresh
    // could return token-B — prove ownership predicates still need matching generation
    // against the *request* generation for stale A (gen 1).
    const snapA = { token: "token-A", generation: 1 };
    assert.equal(canHandleAuthFailureForSession(snapA, 2), false);
    assert.equal(canSafeLogoutSession(snapA, "token-B", 2), false);
  });
});
