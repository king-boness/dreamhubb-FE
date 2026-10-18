import { defineStore } from "pinia";
import { useAuthStore } from "./auth";
import {
  LEGACY_PREFERENCES_KEY,
  canAdoptLegacyPreferences,
  loadPreferencesRecordForUser
} from "src/utils/legacyPreferencesAdoption";

export type Side = "donor" | "donee";
export type PostType = "dream" | "problem" | "idea";

// Re-export for existing call sites / tests
export { LEGACY_PREFERENCES_KEY, canAdoptLegacyPreferences };

interface FeedLocation {
  continentId: number | null;
  countryId: number | null;
  cityId: number | null;
}

interface FeedFilters {
  postType: PostType | null;
  subcategory: string | null;
  location: FeedLocation;
}

// Get user-specific storage key for general preferences
const getStorageKey = (userId: number | null | undefined): string => {
  return `preferences_store_${userId ?? "guest"}`;
};

// Get user-specific storage key for donor filters
const getDonorFiltersStorageKey = (userId: number | null | undefined): string => {
  return `dreamhubb_donor_filters_${userId ?? "guest"}`;
};

const getSeededDonorFiltersFlagKey = (userId: number | null | undefined): string => {
  return `seeded_donor_filters_from_donee_${userId ?? "guest"}`;
};

const loadFromStorage = (userId: number | null | undefined) => {
  return loadPreferencesRecordForUser(userId);
};

export const usePreferencesStore = defineStore("preferences", {
  state: () => {
    const authStore = useAuthStore();
    const userId = authStore.user?.id;
    const stored = loadFromStorage(userId);
    return {
      currentSide: (stored?.currentSide as Side) || "donor",
      onboardingInitialSide: (stored?.onboardingInitialSide as Side) || "donor",
      preferredPostType: (stored?.preferredPostType as PostType | null) || null,
      preferredSubcategory: (stored?.preferredSubcategory as string | null) || null,
      preferredFeedLocation: (stored?.preferredFeedLocation as FeedLocation) || {
        continentId: null,
        countryId: null,
        cityId: null
      },
      lastUsedFeedFilters: (stored?.lastUsedFeedFilters as FeedFilters | null) || null
    };
  },
  persist: false,
  getters: {
    storageKey(): string {
      const authStore = useAuthStore();
      return getStorageKey(authStore.user?.id);
    }
  },
  actions: {
    saveToStorage() {
      const payload = {
        currentSide: this.currentSide,
        onboardingInitialSide: this.onboardingInitialSide,
        preferredPostType: this.preferredPostType,
        preferredSubcategory: this.preferredSubcategory,
        preferredFeedLocation: this.preferredFeedLocation,
        lastUsedFeedFilters: this.lastUsedFeedFilters
      };
      localStorage.setItem(this.storageKey, JSON.stringify(payload));
    },
    hydrateFromStorage() {
      const authStore = useAuthStore();
      const userId = authStore.user?.id;
      const data = loadFromStorage(userId);
      if (!data) {
        // No prefs for this account — reset in-memory state so a previous user's
        // side (e.g. donee) cannot leak into the next login session.
        // Unowned legacy `preferences_store` is left untouched.
        this.currentSide = "donor";
        this.onboardingInitialSide = "donor";
        this.preferredPostType = null;
        this.preferredSubcategory = null;
        this.preferredFeedLocation = { continentId: null, countryId: null, cityId: null };
        this.lastUsedFeedFilters = null;
        return;
      }
      try {
        this.currentSide = data.currentSide ?? "donor";
        this.onboardingInitialSide = data.onboardingInitialSide ?? "donor";
        this.preferredPostType = data.preferredPostType ?? null;
        this.preferredSubcategory = data.preferredSubcategory ?? null;
        this.preferredFeedLocation = data.preferredFeedLocation ?? {
          continentId: null,
          countryId: null,
          cityId: null
        };
        this.lastUsedFeedFilters = data.lastUsedFeedFilters ?? null;
      } catch (e) {
        // ignore
      }
    },
    setInitialSide(side: Side) {
      this.onboardingInitialSide = side;
      this.currentSide = side;
      this.saveToStorage();
    },
    setPreferredPostType(type: PostType | null) {
      this.preferredPostType = type;
      this.saveToStorage();
    },
    setPreferredSubcategory(sub: string | null) {
      this.preferredSubcategory = sub;
      this.saveToStorage();
    },
    setPreferredFeedLocation(location: FeedLocation) {
      this.preferredFeedLocation = { ...location };
      this.saveToStorage();
    },
    setLastUsedFeedFilters(filters: FeedFilters) {
      this.lastUsedFeedFilters = { ...filters };
      this.saveDonorFiltersToStorage();
    },
    clearLastUsedFeedFilters() {
      this.lastUsedFeedFilters = null;
      this.saveDonorFiltersToStorage();
    },
    // Save donor filters to user-specific localStorage key
    saveDonorFiltersToStorage() {
      const authStore = useAuthStore();
      const userId = authStore.user?.id;
      const key = getDonorFiltersStorageKey(userId);
      const payload = {
        postType: this.lastUsedFeedFilters?.postType || null,
        subcategory: this.lastUsedFeedFilters?.subcategory || null,
        location: this.lastUsedFeedFilters?.location || {
          continentId: null,
          countryId: null,
          cityId: null
        }
      };

      localStorage.setItem(key, JSON.stringify(payload));
    },
    // Load donor filters from user-specific localStorage key
    loadDonorFiltersFromStorage() {
      const authStore = useAuthStore();
      const userId = authStore.user?.id;
      const key = getDonorFiltersStorageKey(userId);
      const raw = localStorage.getItem(key);

      if (!raw) {
        // Backwards compatibility: try old key if user-specific key doesn't exist
        this.migrateLegacyDonorFiltersIfNeeded();
        // After migration, try loading again
        const migratedRaw = localStorage.getItem(key);
        if (!migratedRaw) {
          // No filters found, set to null (will use defaults in applyInitialFiltersFromPreferences)
          this.lastUsedFeedFilters = null;
          return;
        }
        // Use migrated data
        try {
          const data = JSON.parse(migratedRaw);
          this.lastUsedFeedFilters = {
            postType: data.postType || null,
            subcategory: data.subcategory || null,
            location: data.location || {
              continentId: null,
              countryId: null,
              cityId: null
            }
          };
        } catch (e) {
          if (import.meta.env.DEV) {
            console.debug("Failed to parse migrated donor filters from storage", e);
          }
          this.lastUsedFeedFilters = null;
        }
        return;
      }

      try {
        const data = JSON.parse(raw);
        this.lastUsedFeedFilters = {
          postType: data.postType || null,
          subcategory: data.subcategory || null,
          location: data.location || {
            continentId: null,
            countryId: null,
            cityId: null
          }
        };
      } catch (e) {
        if (import.meta.env.DEV) {
          console.debug("Failed to parse donor filters from storage", e);
        }
        this.lastUsedFeedFilters = null;
      }
    },

    /**
     * Seed donor filters exactly once from DONEE onboarding preferences.
     *
     * Rules:
     * - Runs at most once per user (localStorage flag).
     * - Does NOT overwrite donor filters if user already has any non-empty donor filters stored.
     * - Uses existing donor filters storage key + shape (lastUsedFeedFilters).
     */
    seedDonorFiltersFromDoneeOnboardingIfNeeded() {
      const authStore = useAuthStore();
      const userId = authStore.user?.id;
      if (!userId) return;

      const flagKey = getSeededDonorFiltersFlagKey(userId);
      if (localStorage.getItem(flagKey) === "1") return;

      // B) Do not overwrite if user already has donor filters stored (non-empty)
      const donorKey = getDonorFiltersStorageKey(userId);
      const raw = localStorage.getItem(donorKey);
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as Partial<FeedFilters>;
          const loc = parsed.location;
          const hasAny =
            !!parsed.postType ||
            !!parsed.subcategory ||
            !!loc?.continentId ||
            !!loc?.countryId ||
            !!loc?.cityId;
          if (hasAny) {
            localStorage.setItem(flagKey, "1");
            return;
          }
        } catch {
          // ignore parse errors; continue to attempt seed
        }
      }

      // C) Seed from onboarding preferences (already persisted into preferences store)
      const postType = this.preferredPostType;
      const subcategory = this.preferredSubcategory;
      if (!postType || !subcategory) return;

      const prefLoc = this.preferredFeedLocation;
      const location: FeedLocation =
        prefLoc?.cityId
          ? { continentId: null, countryId: null, cityId: prefLoc.cityId }
          : prefLoc?.countryId
            ? { continentId: null, countryId: prefLoc.countryId, cityId: null }
            : prefLoc?.continentId
              ? { continentId: prefLoc.continentId, countryId: null, cityId: null }
              : { continentId: null, countryId: null, cityId: null };

      this.setLastUsedFeedFilters({
        postType,
        subcategory,
        location
      });

      localStorage.setItem(flagKey, "1");
    },
    // Reset donor filters to defaults
    // NOTE: This only resets in memory, NOT in localStorage
    // We don't want to overwrite saved preferences before loading them
    resetDonorFiltersToDefaults() {
      this.lastUsedFeedFilters = {
        postType: "dream",
        subcategory: null,
        location: {
          continentId: null,
          countryId: null,
          cityId: null
        }
      };
      // Do NOT call saveDonorFiltersToStorage() here - we only reset in memory
      // saveToStorage() will be called when user actually changes filters
    },
    // Migrate legacy filters from old global key to per-user key
    migrateLegacyDonorFiltersIfNeeded() {
      const authStore = useAuthStore();
      const userId = authStore.user?.id;
      if (!userId) return;

      const newKey = getDonorFiltersStorageKey(userId);

      // If user-specific key already exists, no migration needed
      if (localStorage.getItem(newKey)) {
        return;
      }

      const legacy = localStorage.getItem(LEGACY_PREFERENCES_KEY);
      if (!legacy) return;

      try {
        const parsed = JSON.parse(legacy);
        // Only adopt when legacy explicitly belongs to this user (no owner → skip).
        if (!canAdoptLegacyPreferences(parsed, Number(userId))) {
          return;
        }
        if (parsed.lastUsedFeedFilters) {
          const donorFiltersPayload = {
            postType: parsed.lastUsedFeedFilters.postType || null,
            subcategory: parsed.lastUsedFeedFilters.subcategory || null,
            location: parsed.lastUsedFeedFilters.location || {
              continentId: null,
              countryId: null,
              cityId: null
            }
          };
          localStorage.setItem(newKey, JSON.stringify(donorFiltersPayload));
          // Do not remove legacy key — may contain other preferences / unknown owner history.
        }
      } catch (e) {
        if (import.meta.env.DEV) {
          console.debug("Failed to migrate legacy donor filters", e);
        }
      }
    },
    setCurrentSide(side: Side) {
      this.currentSide = side;
      this.saveToStorage();
    }
  }
});
