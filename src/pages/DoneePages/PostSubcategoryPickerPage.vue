<template>
  <WhatKindOfDream
    :model-value="selectedSubcategory || null"
    @update:model-value="selectedSubcategory = $event || ''"
    :progress="70"
    title="from category"
    next-button-label="NEXT STEP"
    @next="handleNext"
    @back="handleBack"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import WhatKindOfDream from "src/components/Onboarding/WhatKindOfDream.vue";
import { usePostCreationStore } from "src/stores/postCreation";
import { usePreferencesStore } from "src/stores/preferences";

const router = useRouter();
const postCreationStore = usePostCreationStore();
const preferencesStore = usePreferencesStore();

// Get selected category to filter subcategories
// IMPORTANT: Do NOT use preferencesStore for post creation flow - it's for onboarding only
const selectedCategory = computed(() => {
  return postCreationStore.category || localStorage.getItem("donee_postCreation_category") || null;
});

// Load subcategory value BEFORE initializing ref to prevent animation on mount
const loadInitialSubcategory = (): string => {
  // Priority 1: Use value from store (post creation flow)
  const fromStore = postCreationStore.subcategory;
  if (fromStore && fromStore.trim() !== "") {
    return fromStore;
  }

  // Priority 2: Fallback to localStorage (post creation flow)
  const fromStorage = localStorage.getItem("donee_postCreation_subcategory");
  if (fromStorage && fromStorage.trim() !== "") {
    return fromStorage;
  }

  // DO NOT use preferencesStore - it's for onboarding, not post creation
  // This ensures "traveling" is always the default for post creation flow

  // Priority 3: Default to first subcategory (same as category for now, since we use same categories)
  return selectedCategory.value || "traveling";
};

// Initialize with loaded value (or default) to prevent animation on mount
const selectedSubcategory = ref<string>(loadInitialSubcategory());

// Function to load subcategory value (same pattern as PostCategoryPickerPage)
const loadSubcategory = (): string => {
  // Priority 1: Use value from store (post creation flow)
  const fromStore = postCreationStore.subcategory;
  if (fromStore && fromStore.trim() !== "") {
    return fromStore;
  }

  // Priority 2: Fallback to localStorage (post creation flow)
  const fromStorage = localStorage.getItem("donee_postCreation_subcategory");
  if (fromStorage && fromStorage.trim() !== "") {
    return fromStorage;
  }

  // DO NOT use preferencesStore - it's for onboarding, not post creation
  // This ensures "traveling" is always the default for post creation flow

  // Priority 3: Default to first subcategory (same as category for now, since we use same categories)
  return selectedCategory.value || "traveling";
};

// Function to load and sync subcategory value
const loadAndSyncSubcategory = async () => {
  const loadedSubcategory = loadSubcategory();
  
  if (loadedSubcategory !== selectedSubcategory.value) {
    selectedSubcategory.value = loadedSubcategory;
    // Wait for next tick to ensure WhatKindOfDream component has updated
    await nextTick();
  }

  if (process.env.NODE_ENV === "development") {
    console.log("📝 PostSubcategoryPickerPage: Loaded subcategory:", selectedSubcategory.value, "for category:", selectedCategory.value);
  }
};

// Watch for changes from WhatKindOfDream component - save immediately on change
watch(() => selectedSubcategory.value, (newVal) => {
  if (newVal && newVal.trim() !== "") {
    // Save to store immediately
    postCreationStore.setField("subcategory", newVal);
    
    // Save to localStorage immediately
    localStorage.setItem("donee_postCreation_subcategory", newVal);
    
    if (process.env.NODE_ENV === "development") {
      console.log("📝 PostSubcategoryPickerPage: selectedSubcategory changed to:", newVal, "- saved to store and localStorage");
    }
  }
});

onMounted(async () => {
  if (process.env.NODE_ENV === "development") {
    console.log("📝 PostSubcategoryPickerPage: onMounted called");
  }
  
  await loadAndSyncSubcategory();
});

// Handle route re-entry (when user navigates back to this page)
// This ensures the swiper position is synchronized with the selected value
onActivated(async () => {
  await loadAndSyncSubcategory();
  // Give extra time for WhatKindOfDream component to re-mount and initialize Flicking
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 300));
  if (process.env.NODE_ENV === "development") {
    console.log("📝 PostSubcategoryPickerPage: onActivated - Synchronizing subcategory picker");
  }
});

const handleNext = () => {
  if (process.env.NODE_ENV === "development") {
    console.log("📝 PostSubcategoryPickerPage: handleNext called", {
      selectedSubcategory: selectedSubcategory.value,
      category: selectedCategory.value
    });
  }

  if (!selectedSubcategory.value || selectedSubcategory.value.trim() === "") {
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ PostSubcategoryPickerPage: No subcategory selected, cannot proceed");
    }
    return;
  }

  // Value is already saved in watch() - just ensure it's persisted
  // Save to store (redundant but ensures consistency)
  postCreationStore.setField("subcategory", selectedSubcategory.value);

  // Save to localStorage (redundant but ensures consistency)
  localStorage.setItem("donee_postCreation_subcategory", selectedSubcategory.value);

  if (process.env.NODE_ENV === "development") {
    console.log("📝 PostSubcategoryPickerPage: Saved subcategory:", selectedSubcategory.value);
    console.log("📝 PostSubcategoryPickerPage: Navigating to submit-postCreation");
  }

  // Navigate back to post creation - use nextTick to ensure state is saved
  nextTick(() => {
    router.push({ name: "submit-postCreation" }).catch((error) => {
      if (process.env.NODE_ENV === "development") {
        console.error("❌ PostSubcategoryPickerPage: Navigation error:", error);
        console.error("❌ Error details:", error.message, error.stack);
      }
    });
  });
};

const handleBack = () => {
  router.push({ name: "donee-postCreation-category" });
};
</script>

<style lang="scss" scoped>
// Styles are handled by WhatKindOfDream component
</style>
