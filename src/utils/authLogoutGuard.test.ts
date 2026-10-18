import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  shouldApplyLocalLogoutCleanup,
  shouldClearAuthorizationHeader,
  type LogoutSessionSnapshot
} from "./authLogoutGuard.ts";

/**
 * Faithful simulation of pre-fix logout race (AUTH-RACE-002).
 * Mirrors former auth.logout: bump → await remote → finally always clears.
 */
async function simulateBuggyLogoutThenLoginB(): Promise<{
  user: { id: number; name: string } | null;
  token: string | null;
  storageToken: string | null;
  authorization: string | null;
}> {
  let user: { id: number; name: string } | null = { id: 1, name: "A" };
  let token: string | null = "token-A";
  let storageToken: string | null = "token-A";
  let authorization: string | null = "Bearer token-A";
  let sessionGeneration = 0;

  let resolveLogout!: () => void;
  const remoteLogout = new Promise<void>((resolve) => {
    resolveLogout = resolve;
  });

  const logoutPromise = (async () => {
    sessionGeneration += 1; // bump
    try {
      await remoteLogout; // pending /logout
    } finally {
      // BUG: unconditional finally
      user = null;
      token = null;
      storageToken = null;
      authorization = null;
    }
  })();

  // Login B succeeds while logout A is pending
  sessionGeneration += 1;
  user = { id: 2, name: "B" };
  token = "token-B";
  storageToken = "token-B";
  authorization = "Bearer token-B";

  resolveLogout();
  await logoutPromise;

  return { user, token, storageToken, authorization };
}

/**
 * Fixed algorithm: immediate clear of A + guarded cleanup + remote uses captured token.
 */
async function simulateFixedLogoutThenLoginB(): Promise<{
  user: { id: number; name: string } | null;
  token: string | null;
  storageToken: string | null;
  authorization: string | null;
  remoteAuthHeader: string | null;
}> {
  let user: { id: number; name: string } | null = { id: 1, name: "A" };
  let token: string | null = "token-A";
  let storageToken: string | null = "token-A";
  let authorization: string | null = "Bearer token-A";
  let sessionGeneration = 0;
  let remoteAuthHeader: string | null = null;

  let resolveLogout!: () => void;
  const remoteLogout = new Promise<void>((resolve) => {
    resolveLogout = resolve;
  });

  const logoutPromise = (async () => {
    const tokenToRevoke = token;
    sessionGeneration += 1;
    const snapshot: LogoutSessionSnapshot = {
      tokenToRevoke,
      logoutGeneration: sessionGeneration
    };

    // Immediate local clear if we still own the session
    if (shouldApplyLocalLogoutCleanup(snapshot, token, sessionGeneration)) {
      user = null;
      token = null;
      if (!storageToken || storageToken === tokenToRevoke) {
        storageToken = null;
      }
      if (shouldClearAuthorizationHeader(snapshot, authorization, storageToken)) {
        authorization = null;
      }
    }

    // Remote with captured token (not ambient storage token)
    remoteAuthHeader = tokenToRevoke ? `Bearer ${tokenToRevoke}` : null;
    await remoteLogout;

    // Delayed cleanup must not wipe B
    if (shouldApplyLocalLogoutCleanup(snapshot, token, sessionGeneration)) {
      user = null;
      token = null;
      storageToken = null;
      authorization = null;
    }
  })();

  // Login B while remote logout pending
  sessionGeneration += 1;
  user = { id: 2, name: "B" };
  token = "token-B";
  storageToken = "token-B";
  authorization = "Bearer token-B";

  resolveLogout();
  await logoutPromise;

  return { user, token, storageToken, authorization, remoteAuthHeader };
}

describe("AUTH-RACE-002 logout vs newer login", () => {
  it("REPRODUCE: buggy finally clears session B (CONFIRMED)", async () => {
    const result = await simulateBuggyLogoutThenLoginB();
    assert.equal(result.user, null);
    assert.equal(result.token, null);
    assert.equal(result.storageToken, null);
    assert.equal(result.authorization, null);
  });

  it("FIX: delayed logout A preserves session B", async () => {
    const result = await simulateFixedLogoutThenLoginB();
    assert.deepEqual(result.user, { id: 2, name: "B" });
    assert.equal(result.token, "token-B");
    assert.equal(result.storageToken, "token-B");
    assert.equal(result.authorization, "Bearer token-B");
    assert.equal(result.remoteAuthHeader, "Bearer token-A");
  });

  it("shouldApplyLocalLogoutCleanup: newer generation blocks cleanup", () => {
    const snapshot: LogoutSessionSnapshot = {
      tokenToRevoke: "token-A",
      logoutGeneration: 1
    };
    assert.equal(shouldApplyLocalLogoutCleanup(snapshot, "token-B", 2), false);
    assert.equal(shouldApplyLocalLogoutCleanup(snapshot, null, 1), true);
    assert.equal(shouldApplyLocalLogoutCleanup(snapshot, "token-A", 1), true);
  });

  it("shouldClearAuthorizationHeader: must not strip token B", () => {
    const snapshot: LogoutSessionSnapshot = {
      tokenToRevoke: "token-A",
      logoutGeneration: 1
    };
    assert.equal(
      shouldClearAuthorizationHeader(snapshot, "Bearer token-B", "token-B"),
      false
    );
    assert.equal(
      shouldClearAuthorizationHeader(snapshot, "Bearer token-A", null),
      true
    );
  });

  it("normal logout cleanup still allowed for own session", () => {
    const snapshot: LogoutSessionSnapshot = {
      tokenToRevoke: "token-A",
      logoutGeneration: 3
    };
    assert.equal(shouldApplyLocalLogoutCleanup(snapshot, "token-A", 3), true);
    assert.equal(
      shouldClearAuthorizationHeader(snapshot, "Bearer token-A", "token-A"),
      true
    );
  });

  it("logout pending + failed login B: cleanup of A remains valid", () => {
    // After immediate clear, token is null; generation still logout's.
    const snapshot: LogoutSessionSnapshot = {
      tokenToRevoke: "token-A",
      logoutGeneration: 5
    };
    assert.equal(shouldApplyLocalLogoutCleanup(snapshot, null, 5), true);
    assert.equal(shouldClearAuthorizationHeader(snapshot, null, null), true);
  });
});
