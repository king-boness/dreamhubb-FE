import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import {
  homeRouteForSide,
  isSafeInternalRedirect,
  normalizeAppSide,
  readStoredSidePreferences,
  resolvePostAuthRedirect
} from "./postAuthRedirect.ts";

describe("postAuthRedirect", () => {
  it("TEST A/B: currentSide maps to side home", () => {
    assert.deepEqual(resolvePostAuthRedirect({ currentSide: "donee" }), { name: "donee-posts" });
    assert.deepEqual(resolvePostAuthRedirect({ currentSide: "donor" }), { name: "donor-posts" });
  });

  it("TEST C/D: last currentSide wins over onboardingInitialSide", () => {
    assert.deepEqual(
      resolvePostAuthRedirect({ currentSide: "donor", onboardingInitialSide: "donee" }),
      { name: "donor-posts" }
    );
    assert.deepEqual(
      resolvePostAuthRedirect({ currentSide: "donee", onboardingInitialSide: "donor" }),
      { name: "donee-posts" }
    );
  });

  it("TEST E: explicit internal redirect has priority", () => {
    assert.equal(
      resolvePostAuthRedirect({
        explicitRedirect: "/donee/myprofile",
        currentSide: "donor"
      }),
      "/donee/myprofile"
    );
  });

  it("TEST F: no preference → safe donor fallback", () => {
    assert.deepEqual(resolvePostAuthRedirect({}), { name: "donor-posts" });
    assert.deepEqual(resolvePostAuthRedirect({ currentSide: "nope" }), { name: "donor-posts" });
  });

  it("falls back to onboardingInitialSide when currentSide missing", () => {
    assert.deepEqual(
      resolvePostAuthRedirect({ onboardingInitialSide: "donee" }),
      { name: "donee-posts" }
    );
  });

  it("rejects unsafe external redirects and auth-loop paths", () => {
    assert.equal(isSafeInternalRedirect("https://evil.example/phish"), false);
    assert.equal(isSafeInternalRedirect("//evil.example/phish"), false);
    assert.equal(isSafeInternalRedirect("javascript:alert(1)"), false);
    assert.equal(isSafeInternalRedirect(""), false);
    assert.equal(isSafeInternalRedirect("/\\evil"), false);
    assert.equal(isSafeInternalRedirect("/login"), false);
    assert.equal(isSafeInternalRedirect("/login?x=1"), false);
    assert.equal(isSafeInternalRedirect("/auth"), false);
    assert.equal(isSafeInternalRedirect("/landing"), false);
    assert.equal(isSafeInternalRedirect("/onboarding"), false);
    assert.equal(isSafeInternalRedirect("/register/form"), false);
    assert.equal(isSafeInternalRedirect("/donor/posts"), true);
    assert.equal(isSafeInternalRedirect("  /donee/posts  "), true);
  });

  it("normalize/home helpers", () => {
    assert.equal(normalizeAppSide("donee"), "donee");
    assert.equal(normalizeAppSide(null), null);
    assert.deepEqual(homeRouteForSide("donee"), { name: "donee-posts" });
    assert.deepEqual(homeRouteForSide(undefined), { name: "donor-posts" });
  });
});

describe("readStoredSidePreferences isolation", () => {
  const memory = new Map<string, string>();
  const original = globalThis.localStorage;

  beforeEach(() => {
    memory.clear();
    // Minimal localStorage stub for node tests
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).localStorage = {
      getItem: (k: string) => (memory.has(k) ? memory.get(k)! : null),
      setItem: (k: string, v: string) => {
        memory.set(k, String(v));
      },
      removeItem: (k: string) => {
        memory.delete(k);
      }
    };
  });

  afterEach(() => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (globalThis as any).localStorage = original;
  });

  it("restores donee for the matching user id", () => {
    memory.set(
      "preferences_store_42",
      JSON.stringify({ currentSide: "donee", onboardingInitialSide: "donee" })
    );
    assert.deepEqual(readStoredSidePreferences(42), {
      currentSide: "donee",
      onboardingInitialSide: "donee"
    });
    assert.deepEqual(resolvePostAuthRedirect(readStoredSidePreferences(42)), {
      name: "donee-posts"
    });
  });

  it("does not leak previous account prefs to another user id", () => {
    memory.set(
      "preferences_store_1",
      JSON.stringify({ currentSide: "donee", onboardingInitialSide: "donee" })
    );
    // User 2 has no stored prefs
    const user2 = readStoredSidePreferences(2);
    assert.deepEqual(user2, { currentSide: null, onboardingInitialSide: null });
    assert.deepEqual(resolvePostAuthRedirect(user2), { name: "donor-posts" });
  });

  it("null/invalid user id yields empty prefs", () => {
    memory.set(
      "preferences_store_9",
      JSON.stringify({ currentSide: "donee", onboardingInitialSide: "donee" })
    );
    assert.deepEqual(readStoredSidePreferences(null), {
      currentSide: null,
      onboardingInitialSide: null
    });
  });
});
