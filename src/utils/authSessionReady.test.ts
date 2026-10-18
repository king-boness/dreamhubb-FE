import assert from "node:assert/strict";
import { describe, it, beforeEach } from "node:test";
import {
  isAuthSessionSettled,
  markAuthSessionSettled,
  resetAuthSessionReadyForTests,
  runColdStartAuthProbe,
  waitForAuthSessionSettled,
  waitForAuthUserId
} from "./authSessionReady.ts";
import { readStoredSidePreferences, resolvePostAuthRedirect } from "./postAuthRedirect.ts";

describe("cold start auth session gate (Risk B)", () => {
  beforeEach(() => {
    resetAuthSessionReadyForTests();
  });

  it("waitForAuthSessionSettled resolves after mark", async () => {
    const pending = waitForAuthSessionSettled(5000);
    assert.equal(isAuthSessionSettled(), false);
    setTimeout(() => markAuthSessionSettled(), 20);
    await pending;
    assert.equal(isAuthSessionSettled(), true);
  });

  it("waitForAuthSessionSettled times out without hanging", async () => {
    const started = Date.now();
    await waitForAuthSessionSettled(40);
    assert.ok(Date.now() - started >= 35);
  });

  it("DONEEe cold start: delayed userId then donee-posts (not donor)", async () => {
    const memory = new Map<string, string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).localStorage = {
      getItem: (k: string) => (memory.has(k) ? memory.get(k)! : null),
      setItem: (k: string, v: string) => memory.set(k, String(v)),
      removeItem: (k: string) => memory.delete(k)
    };

    memory.set(
      "preferences_store_55",
      JSON.stringify({ currentSide: "donee", onboardingInitialSide: "donee" })
    );

    let userId: number | null = null;
    let token: string | null = "valid-token";

    // Simulate splash finishing before /user returns
    const early = readStoredSidePreferences(userId);
    assert.deepEqual(resolvePostAuthRedirect(early), { name: "donor-posts" });

    setTimeout(() => {
      markAuthSessionSettled();
      userId = 55;
    }, 30);

    await waitForAuthSessionSettled(2000);
    const resolvedId = await waitForAuthUserId(
      () => userId,
      () => token,
      2000,
      10
    );

    assert.equal(resolvedId, 55);
    const sides = readStoredSidePreferences(resolvedId);
    assert.deepEqual(resolvePostAuthRedirect(sides), { name: "donee-posts" });
  });

  it("DONOR cold start resolves to donor-posts", async () => {
    const memory = new Map<string, string>();
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).localStorage = {
      getItem: (k: string) => (memory.has(k) ? memory.get(k)! : null),
      setItem: (k: string, v: string) => memory.set(k, String(v)),
      removeItem: (k: string) => memory.delete(k)
    };
    memory.set(
      "preferences_store_8",
      JSON.stringify({ currentSide: "donor", onboardingInitialSide: "donor" })
    );

    markAuthSessionSettled();
    const id = await waitForAuthUserId(
      () => 8,
      () => "t",
      500,
      10
    );
    assert.deepEqual(resolvePostAuthRedirect(readStoredSidePreferences(id)), {
      name: "donor-posts"
    });
  });

  it("missing token → waitForAuthUserId returns null (no infinite wait)", async () => {
    markAuthSessionSettled();
    const id = await waitForAuthUserId(
      () => null,
      () => null,
      500,
      10
    );
    assert.equal(id, null);
  });

  it("token cleared during wait → null (invalid/expired session path)", async () => {
    let token: string | null = "t";
    setTimeout(() => {
      token = null;
    }, 20);
    const id = await waitForAuthUserId(
      () => null,
      () => token,
      500,
      10
    );
    assert.equal(id, null);
  });

  it("single-flight: parallel probes run factory once; settle only after probe", async () => {
    let runs = 0;
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });

    const p1 = runColdStartAuthProbe(async () => {
      runs += 1;
      await gate;
    });
    const p2 = runColdStartAuthProbe(async () => {
      runs += 1;
      await gate;
    });

    assert.equal(isAuthSessionSettled(), false);
    assert.equal(runs, 1);

    release();
    await Promise.all([p1, p2]);
    assert.equal(runs, 1);
    assert.equal(isAuthSessionSettled(), true);
  });

  it("settled is not marked while probe still in flight (no premature donor redirect)", async () => {
    let release!: () => void;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });

    const probe = runColdStartAuthProbe(async () => {
      await gate;
    });

    // Waiter must still be blocked — premature settle would allow donor fallback too early.
    let waiterDone = false;
    void waitForAuthSessionSettled(10_000).then(() => {
      waiterDone = true;
    });
    await new Promise<void>((r) => setTimeout(r, 30));
    assert.equal(isAuthSessionSettled(), false);
    assert.equal(waiterDone, false);

    release();
    await probe;
    await waitForAuthSessionSettled(1000);
    assert.equal(waiterDone, true);
  });
});
