<template>
  <WhatKindOfDream
    :model-value="selectedCategory || null"
    @update:model-value="selectedCategory = $event || ''"
    :progress="50"
    :center-offset-y="-17"
    :roller-axis-offset-y="-19"
    title="from category"
    next-button-label="NEXT STEP"
    @next="handleNext"
    @back="handleBack"
  />
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { useRouter } from "vue-router";
import WhatKindOfDream from "src/components/Onboarding/WhatKindOfDream.vue";
import { usePostCreationStore } from "src/stores/postCreation";

const router = useRouter();
const postCreationStore = usePostCreationStore();

// Load subcategory value BEFORE initializing ref to prevent animation on mount
const loadInitialSubcategory = (): string => {
  // Priority 1: Use value from store (post creation flow) - using subcategory field
  const fromStore = postCreationStore.subcategory;
  if (fromStore && fromStore.trim() !== "") {
    return fromStore;
  }

  // Priority 2: Fallback to localStorage (post creation flow) - legacy key for backward compatibility
  const fromStorage = localStorage.getItem("donee_postCreation_category");
  if (fromStorage && fromStorage.trim() !== "") {
    return fromStorage;
  }

  // DO NOT use preferencesStore - it's for onboarding, not post creation
  // This ensures "traveling" is always the default for post creation flow

  // Priority 3: Default to first subcategory (traveling)
  return "traveling";
};

// Initialize with loaded value (or "traveling" if no saved value) to prevent animation on mount
const selectedCategory = ref<string>(loadInitialSubcategory());

onMounted(() => {
  // no logs
});

const handleNext = () => {
  if (!selectedCategory.value || selectedCategory.value.trim() === "") return;

  // Save to store - using new API: subcategory (slug)
  postCreationStore.setSubcategory(selectedCategory.value as import("src/domain/categories").SubcategorySlug);

  // Save to localStorage - keep legacy key for backward compatibility
  localStorage.setItem("donee_postCreation_category", selectedCategory.value);

  // Navigate directly to final post creation page (skip duplicate subcategory picker)
  router.push({ name: "submit-postCreation" });
};

const handleBack = () => {
  router.push({ name: "donee-postCreation-goal" });
};
</script>
