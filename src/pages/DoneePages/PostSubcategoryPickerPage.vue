<template>
  <WhatKindOfDream
    :model-value="selectedSubcategory || null"
    @update:model-value="selectedSubcategory = $event || ''"
    :progress="70"
    :center-offset-y="-17"
    :roller-axis-offset-y="-19"
    title="from category"
    next-button-label="NEXT STEP"
    @next="handleNext"
    @back="handleBack"
  />
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onActivated, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { notifyError } from "src/utils/notify";
import WhatKindOfDream from "src/components/Onboarding/WhatKindOfDream.vue";
import { usePostCreationStore } from "src/stores/postCreation";

const router = useRouter();
const postCreationStore = usePostCreationStore();

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

  // no verbose logs
};

// Watch for changes from WhatKindOfDream component - save immediately on change
watch(() => selectedSubcategory.value, (newVal) => {
  if (newVal && newVal.trim() !== "") {
    // Save to store immediately
    postCreationStore.setField("subcategory", newVal);

    // Save to localStorage immediately
    localStorage.setItem("donee_postCreation_subcategory", newVal);

    // no logs
  }
});

onMounted(async () => {
  await loadAndSyncSubcategory();
});

// Handle route re-entry (when user navigates back to this page)
// This ensures the swiper position is synchronized with the selected value
onActivated(async () => {
  await loadAndSyncSubcategory();
  // Give extra time for WhatKindOfDream component to re-mount and initialize Flicking
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 300));
  // no logs
});

const handleNext = () => {
  if (!selectedSubcategory.value || selectedSubcategory.value.trim() === "") {
    notifyError({
      kind: "validation",
      messageKey: "common.errors.validation",
      fallbackMessage: "Please check your input and try again.",
      retryable: false
    }, { position: "top", timeout: 3500 });
    return;
  }

  // Value is already saved in watch() - just ensure it's persisted
  // Save to store (redundant but ensures consistency)
  postCreationStore.setField("subcategory", selectedSubcategory.value);

  // Save to localStorage (redundant but ensures consistency)
  localStorage.setItem("donee_postCreation_subcategory", selectedSubcategory.value);

  // Navigate back to post creation - use nextTick to ensure state is saved
  nextTick(() => {
    router.push({ name: "submit-postCreation" }).catch((error) => {
      if (import.meta.env.DEV) {
        console.debug("[PostSubcategoryPickerPage] Navigation error:", error);
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
