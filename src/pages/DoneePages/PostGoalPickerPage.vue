<template>
  <WhatIsYourGoal
    :model-value="selectedGoal"
    @update:model-value="selectedGoal = $event"
    :progress="30"
    title="the post will be about"
    next-button-label="NEXT STEP"
    @next="handleNext"
    @back="handleBack"
  />
</template>

<script setup lang="ts">
import { ref, onMounted, onActivated, nextTick } from "vue";
import { useRouter } from "vue-router";
import { notifyError } from "src/utils/notify";
import WhatIsYourGoal from "src/components/Onboarding/WhatIsYourGoal.vue";
import { usePostCreationStore } from "src/stores/postCreation";

const router = useRouter();
const postCreationStore = usePostCreationStore();

// Load current category (goal) from store/localStorage - initialize with "dream" as default
// IMPORTANT: Do NOT use preferencesStore for post creation flow - it's for onboarding only
const loadCategory = (): "problem" | "dream" | "idea" | null => {
  // Priority 1: Use value from store (post creation flow) - using category field (slug)
  const fromStore = postCreationStore.category;
  if (fromStore === "problem" || fromStore === "dream" || fromStore === "idea") {
    return fromStore;
  }

  // Priority 2: Fallback to localStorage (post creation flow) - legacy key "donee_postCreation_goal" for backward compatibility
  const goalFromStorage = localStorage.getItem("donee_postCreation_goal");
  if (goalFromStorage === "problem" || goalFromStorage === "dream" || goalFromStorage === "idea") {
    return goalFromStorage;
  }

  // DO NOT use preferencesStore - it's for onboarding, not post creation
  // This ensures "dream" is always the default for post creation flow

  // Return null if no category is saved - will default to "dream" in ref initialization
  return null;
};

// Load category value BEFORE initializing ref to prevent animation
const initialCategory = loadCategory() || "dream";

// Initialize with loaded value (or "dream" if no saved value) to prevent animation on mount
const selectedGoal = ref<"problem" | "dream" | "idea">(initialCategory);

// Reset post creation flow when entering goal picker (new post creation)
const resetPostCreationFlow = () => {
  // Reset store - using new API: category (slug) for goal
  postCreationStore.setCategory("dream");
  postCreationStore.setSubcategory(null);

  // Reset localStorage - keep legacy key for backward compatibility
  localStorage.setItem("donee_postCreation_goal", "dream");
  localStorage.removeItem("donee_postCreation_category");

  // Set selectedGoal to "dream"
  selectedGoal.value = "dream";
};

// Function to load and sync category value (used on route re-entry)
const loadAndSyncGoal = async () => {
  // Check if this is a new post creation (no category in store/localStorage from current flow)
  const hasExistingCategory = postCreationStore.category || localStorage.getItem("donee_postCreation_goal");

  if (!hasExistingCategory) {
    // New post creation - reset to defaults
    resetPostCreationFlow();
  } else {
    // Existing post creation - load saved values
    const loadedCategory = loadCategory();
    if (loadedCategory && loadedCategory !== selectedGoal.value) {
      selectedGoal.value = loadedCategory;
      // Wait for next tick to ensure WhatIsYourGoal component has updated
      await nextTick();
    }
  }

  // no verbose logs
};

onMounted(async () => {
  // On mount, category is already loaded in initialCategory, so we just need to check if we should reset
  const hasExistingCategory = postCreationStore.category || localStorage.getItem("donee_postCreation_goal");
  if (!hasExistingCategory) {
    // New post creation - reset to defaults
    resetPostCreationFlow();
  } else {
    // Existing post creation - category is already loaded in initialCategory, just log
    // no logs
  }
});

// Handle route re-entry (when user navigates back to this page)
// This ensures the swiper position is synchronized with the selected value
onActivated(async () => {
  await loadAndSyncGoal();
  // Give extra time for WhatIsYourGoal component to re-mount and initialize Flicking
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 300));
  // no logs
});

const handleNext = () => {
  if (!selectedGoal.value) {
    notifyError({
      kind: "validation",
      messageKey: "common.errors.validation",
      fallbackMessage: "Please check your input and try again.",
      retryable: false
    }, { position: "top", timeout: 3500 });
    return;
  }

  // Save to store - using new API: category (slug) for goal
  postCreationStore.setCategory(selectedGoal.value);

  // Save to localStorage - keep legacy key for backward compatibility
  localStorage.setItem("donee_postCreation_goal", selectedGoal.value);

  // Clear subcategory when category changes
  postCreationStore.setSubcategory(null);
  localStorage.removeItem("donee_postCreation_category");

  // Navigate to category picker
  router.push({ name: "donee-postCreation-category" }).catch((error) => {
    if (import.meta.env.DEV) {
      console.debug("[PostGoalPickerPage] Navigation error:", error);
    }
  });
};

const handleBack = () => {
  router.push({ name: "donee-posts" });
};
</script>

<style lang="scss" scoped>
// Styles are handled by WhatIsYourGoal component
</style>
