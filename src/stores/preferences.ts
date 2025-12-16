import { defineStore } from "pinia";

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

const loadFromStorage = () => {
  const raw = localStorage.getItem("preferences_store");
  if (!raw) return null;
  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const usePreferencesStore = defineStore("preferences", {
  state: () => ({
    ...(loadFromStorage() || {}),
    currentSide: (loadFromStorage()?.currentSide as Side) || "donor",
    onboardingInitialSide: (loadFromStorage()?.onboardingInitialSide as Side) || "donor",
    preferredPostType: (loadFromStorage()?.preferredPostType as PostType | null) || null,
    preferredSubcategory: (loadFromStorage()?.preferredSubcategory as string | null) || null,
    preferredFeedLocation: (loadFromStorage()?.preferredFeedLocation as FeedLocation) || {
      continentId: null,
      countryId: null,
      cityId: null
    },
    lastUsedFeedFilters: (loadFromStorage()?.lastUsedFeedFilters as FeedFilters | null) || null
  }),
  persist: false,
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
      localStorage.setItem("preferences_store", JSON.stringify(payload));
    },
    hydrateFromStorage() {
      const raw = localStorage.getItem("preferences_store");
      if (!raw) return;
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
      this.saveToStorage();
    },
    clearLastUsedFeedFilters() {
      this.lastUsedFeedFilters = null;
      this.saveToStorage();
    },
    setCurrentSide(side: Side) {
      this.currentSide = side;
      this.saveToStorage();
    }
  }
});
