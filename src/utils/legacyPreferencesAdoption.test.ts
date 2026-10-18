import assert from "node:assert/strict";
import { describe, it, beforeEach, afterEach } from "node:test";
import {
  LEGACY_PREFERENCES_KEY,
  canAdoptLegacyPreferences,
  loadPreferencesRecordForUser
} from "./legacyPreferencesAdoption.ts";
import { readStoredSidePreferences, resolvePostAuthRedirect } from "./postAuthRedirect.ts";

describe("legacy preferences adoption (Risk A)", () => {
  const memory = new Map<string, string>();
  const original = globalThis.localStorage;

  beforeEach(() => {
    memory.clear();
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

  it("does not adopt unowned legacy prefs for account B", () => {
    memory.set(
      LEGACY_PREFERENCES_KEY,
      JSON.stringify({
        currentSide: "donee",
        onboardingInitialSide: "donee",
        preferredPostType: "dream",
        lastUsedFeedFilters: { postType: "dream", subcategory: "x", location: {} }
      })
    );

    assert.equal(canAdoptLegacyPreferences(JSON.parse(memory.get(LEGACY_PREFERENCES_KEY)!), 99), false);

    const loaded = loadPreferencesRecordForUser(99);
    assert.equal(loaded, null);
    assert.equal(memory.get("preferences_store_99"), undefined);
    // Legacy must remain (do not auto-delete)
    assert.ok(memory.get(LEGACY_PREFERENCES_KEY));

    const sides = readStoredSidePreferences(99);
    assert.deepEqual(sides, { currentSide: null, onboardingInitialSide: null });
    assert.deepEqual(resolvePostAuthRedirect(sides), { name: "donor-posts" });
  });

  it("adopts legacy only when explicit userId matches", () => {
    memory.set(
      LEGACY_PREFERENCES_KEY,
      JSON.stringify({
        userId: 42,
        currentSide: "donee",
        onboardingInitialSide: "donee"
      })
    );

    const loaded = loadPreferencesRecordForUser(42);
    assert.equal(loaded?.currentSide, "donee");
    assert.equal(memory.get("preferences_store_42") != null, true);
    // Legacy key preserved
    assert.ok(memory.get(LEGACY_PREFERENCES_KEY));
  });

  it("does not overwrite existing account B prefs with legacy", () => {
    memory.set(
      LEGACY_PREFERENCES_KEY,
      JSON.stringify({ currentSide: "donee", onboardingInitialSide: "donee" })
    );
    memory.set(
      "preferences_store_7",
      JSON.stringify({ currentSide: "donor", onboardingInitialSide: "donor" })
    );

    const loaded = loadPreferencesRecordForUser(7);
    assert.equal(loaded?.currentSide, "donor");
  });

  it("invalid legacy JSON is ignored and left in place when unreadable for adopt check", () => {
    memory.set(LEGACY_PREFERENCES_KEY, "{not-json");
    const loaded = loadPreferencesRecordForUser(3);
    assert.equal(loaded, null);
    assert.equal(memory.get(LEGACY_PREFERENCES_KEY), "{not-json");
  });

  it("empty user-specific storage without adoptable legacy → null", () => {
    assert.equal(loadPreferencesRecordForUser(5), null);
  });

  it("wrong owner ID on legacy must not adopt for current user", () => {
    memory.set(
      LEGACY_PREFERENCES_KEY,
      JSON.stringify({
        userId: 1,
        currentSide: "donee",
        onboardingInitialSide: "donee",
        preferredPostType: "dream"
      })
    );
    assert.equal(canAdoptLegacyPreferences(JSON.parse(memory.get(LEGACY_PREFERENCES_KEY)!), 2), false);
    assert.equal(loadPreferencesRecordForUser(2), null);
    assert.equal(memory.get("preferences_store_2"), undefined);
    assert.ok(memory.get(LEGACY_PREFERENCES_KEY));
  });
});
