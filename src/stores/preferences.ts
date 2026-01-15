import { defineStore } from "pinia";
import { useAuthStore } from "./auth";

export type Side = "donor" | "donee";
export type PostType = "dream" | "problem" | "idea";

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

const loadFromStorage = (userId: number | null | undefined) => {
  const storageKey = getStorageKey(userId);
  const raw = localStorage.getItem(storageKey);
  if (!raw) {
    // Backwards compatibility: try old key if user-specific key doesn't exist
    if (userId) {
      const oldRaw = localStorage.getItem("preferences_store");
      if (oldRaw) {
        try {
          const oldData = JSON.parse(oldRaw);
          // Migrate old data to user-specific key
          localStorage.setItem(storageKey, oldRaw);
          localStorage.removeItem("preferences_store");
          return oldData;
        } catch {
          // ignore
        }
      }
    }
    return null;
  }
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
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
      const raw = localStorage.getItem(getStorageKey(userId));
      if (!raw) {
        // Backwards compatibility: try old key if user-specific key doesn't exist
        if (userId) {
          const oldRaw = localStorage.getItem("preferences_store");
          if (oldRaw) {
            try {
              const oldData = JSON.parse(oldRaw);
              // Migrate old data to user-specific key
              localStorage.setItem(getStorageKey(userId), oldRaw);
              localStorage.removeItem("preferences_store");
              const data = oldData;
              this.currentSide = data.currentSide ?? this.currentSide;
              this.onboardingInitialSide = data.onboardingInitialSide ?? this.onboardingInitialSide;
              this.preferredPostType = data.preferredPostType ?? this.preferredPostType;
              this.preferredSubcategory = data.preferredSubcategory ?? this.preferredSubcategory;
              this.preferredFeedLocation = data.preferredFeedLocation ?? this.preferredFeedLocation;
              this.lastUsedFeedFilters = data.lastUsedFeedFilters ?? this.lastUsedFeedFilters;
            } catch (e) {
              // ignore
            }
          }
        }
        return;
      }
      try {
        const data = JSON.parse(raw);
        this.currentSide = data.currentSide ?? this.currentSide;
        this.onboardingInitialSide = data.onboardingInitialSide ?? this.onboardingInitialSide;
        this.preferredPostType = data.preferredPostType ?? this.preferredPostType;
        this.preferredSubcategory = data.preferredSubcategory ?? this.preferredSubcategory;
        this.preferredFeedLocation = data.preferredFeedLocation ?? this.preferredFeedLocation;
        this.lastUsedFeedFilters = data.lastUsedFeedFilters ?? this.lastUsedFeedFilters;
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

      if (process.env.NODE_ENV === "development") {
        console.log("[DEBUG] [saveDonorFiltersToStorage] Saving to key:", key);
        console.log("[DEBUG] [saveDonorFiltersToStorage] Payload:", payload);
      }

      localStorage.setItem(key, JSON.stringify(payload));

      if (process.env.NODE_ENV === "development") {
        const saved = localStorage.getItem(key);
        console.log("[DEBUG] [saveDonorFiltersToStorage] What was actually saved:", saved);
      }
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
          if (process.env.NODE_ENV === "development") {
            console.error("Failed to parse migrated donor filters from storage", e);
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
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to parse donor filters from storage", e);
        }
        this.lastUsedFeedFilters = null;
      }
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

      const legacyKey = "preferences_store";
      const newKey = getDonorFiltersStorageKey(userId);

      // If user-specific key already exists, no migration needed
      if (localStorage.getItem(newKey)) {
        return;
      }

      // Try to load from legacy key
      const legacy = localStorage.getItem(legacyKey);
      if (!legacy) return;

      try {
        const parsed = JSON.parse(legacy);
        // Extract only donor filters from legacy data
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
          // Note: We don't remove the old key here, as it may contain other preferences
        }
      } catch (e) {
        if (process.env.NODE_ENV === "development") {
          console.error("Failed to migrate legacy donor filters", e);
        }
      }
    },
    setCurrentSide(side: Side) {
      this.currentSide = side;
      this.saveToStorage();
    }
  }
});
