<template>
  <q-page class="filters-page">
    <!-- Header with back button and title -->
    <header class="filters-header">
      <button class="filters-back" type="button" @click.stop="handleBack">
        <q-icon name="chevron_left" />
      </button>
      <h1 class="filters-title">
        <img src="/header_icons/filters_ns.svg" alt="" class="filters-title-icon" />
        {{ currentTitle }}
      </h1>
    </header>

    <!-- Main content area -->
    <main class="filters-content" :class="{ 'filters-content--step3': currentStep === 3 }">
      <!-- STEP 1: What is Your Goal (problem/dream/idea) -->
      <WhatIsYourGoal
        v-if="currentStep === 1"
        v-model="filterCategory"
        :hide-header="true"
        :hide-footer="true"
        @next="handleNext"
        @search="handleSearch"
        @back="handleBack"
      />

      <!-- STEP 2: What Kind of Dream (category) -->
      <WhatKindOfDream
        v-else-if="currentStep === 2"
        :model-value="filterSubcategory"
        :hide-header="true"
        :hide-footer="true"
        @update:modelValue="handleCategoryUpdate"
        @next="handleNext"
        @search="handleSearch"
        @back="handleBack"
      />

      <!-- STEP 3: Where are you (location) -->
      <WhereAreYou
        v-else-if="currentStep === 3"
        v-model:continent="filterContinent"
        v-model:country="filterCountry"
        v-model:city="filterCityId"
        :hide-header="true"
        :hide-footer="true"
        :enable-geolocation="false"
        :emit-city-id="true"
        @next="handleNext"
        @back="handleBack"
      />
    </main>

    <!-- Footer with CTA buttons -->
    <footer class="filters-footer">
      <!-- STEP 1 & 2: Search + Next buttons -->
      <template v-if="currentStep === 1 || currentStep === 2">
        <button class="filters-searchBtn" @click="handleSearch">SEARCH</button>
        <button class="filters-nextBtn" @click="handleNext">{{ currentNextLabel }}</button>
      </template>

      <!-- STEP 3: Search button only -->
      <template v-else-if="currentStep === 3">
        <button
          class="filters-nextBtn"
          @click="handleNext"
          :disabled="!filterContinent || !filterCountry"
        >
          {{ currentNextLabel }}
        </button>
      </template>

    </footer>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRouter } from "vue-router";
import { notifyError } from "src/utils/notify";
import { usePostsStore } from "src/stores/posts";
import { usePreferencesStore } from "src/stores/preferences";
import { api } from "boot/axios";
import type { CategorySlug, SubcategorySlug } from "src/domain/categories";
import WhatIsYourGoal from "src/components/Onboarding/WhatIsYourGoal.vue";
import WhatKindOfDream from "src/components/Onboarding/WhatKindOfDream.vue";
import WhereAreYou from "src/components/Onboarding/WhereAreYou.vue";
// getCategoryId už nie je potrebné - používame priamo fe_category

const router = useRouter();
const postsStore = usePostsStore();
const preferencesStore = usePreferencesStore();

// Current step (1-3)
const currentStep = ref(1);

// Filter values - synced with store - using new API
const filterCategory = ref<CategorySlug | null>(postsStore.filters.categorySlug);
const filterSubcategory = ref<SubcategorySlug | null>(postsStore.filters.subcategorySlug);
const filterContinent = ref("");
const filterCountry = ref("");
const filterCityId = ref<number | null>(null); // Changed from filterCity (string) to filterCityId (number)

// getCategoryId je importovaný z categoryMapping.ts

// Computed properties for dynamic titles and labels
const currentTitle = computed(() => {
  if (currentStep.value === 1) return "swap posts";
  if (currentStep.value === 2) return "swap category";
  if (currentStep.value === 3) return "choose a place";
  return "";
});

const currentNextLabel = computed(() => {
  if (currentStep.value === 1) return "swap category too";
  if (currentStep.value === 2) return "change a place too";
  if (currentStep.value === 3) return "search";
  return "";
});

const handleNext = () => {
  if (currentStep.value < 3) {
    currentStep.value++;
  } else {
    // Apply filters and go back to posts page
    applyFilters();
  }
};

// Handle search from step 1 (only category selected, no subcategory) - using new API
const handleSearchFromStep1 = () => {
  // Ak sme v kroku 1, resetovať subcategorySlug na null (len category sa aplikuje)
  if (currentStep.value === 1) {
    postsStore.setFilters({
      categorySlug: filterCategory.value,
      subcategorySlug: null // Explicitne nastaviť na null, ak nie je vybraná podkategória
    });
    preferencesStore.setLastUsedFeedFilters({
      postType: filterCategory.value, // Legacy key for preferences store
      subcategory: null,
      location: {
        continentId: null,
        countryId: null,
        cityId: null
      }
    });
    // Navigovať späť na posts page
    router.push({ name: "donor-posts" });
  } else {
    // Ak sme v kroku 2 alebo 3, použiť normálny applyFilters
    applyFilters();
  }
};

// Handle subcategory update from WhatKindOfDream component - using new API
const handleCategoryUpdate = (value: string) => {
  filterSubcategory.value = value;
};

const handleBack = (event?: Event) => {
  if (event) {
    event.preventDefault();
    event.stopPropagation();
  }

  if (currentStep.value === 1) {
    // Go back to donor feed
    router.push({ name: "donor-posts" });
  } else {
    // Go back one step
    const previousStep = currentStep.value - 1;
    currentStep.value = previousStep;
    // Reset values for the step we're going back to
    if (previousStep === 1) {
      filterSubcategory.value = null; // Reset subcategory when going back to step 1
      filterContinent.value = "";
      filterCountry.value = "";
      filterCityId.value = null;
    } else if (previousStep === 2) {
      filterContinent.value = "";
      filterCountry.value = "";
      filterCityId.value = null;
    }
  }
};

const applyFilters = async () => {
  // Ensure filterSubcategory is set if we're on step 2 or 3 - using new API
  if ((currentStep.value === 2 || currentStep.value === 3) && !filterSubcategory.value) {
    notifyError({
      kind: "validation",
      messageKey: "common.errors.validation",
      fallbackMessage: "Please check your input and try again.",
      retryable: false
    }, { position: "top", timeout: 4000 });
    return;
  }

  // Get country and continent IDs if needed (only if city is not selected)
  let countryId: number | null = null;
  let continentId: number | null = null;

  // If city is selected, use it directly (no lookup needed) - using new API
  if (filterCityId.value && filterCityId.value > 0) {
    postsStore.setFilters({
      categorySlug: filterCategory.value,
      subcategorySlug: filterSubcategory.value,
      cityId: Number(filterCityId.value),
      countryId: null,
      continentId: null
    });
  } else if (filterContinent.value && filterCountry.value) {
    // City is not selected, but country is - get country ID
    try {
      const { data } = await api.get("/locations/ids", {
        params: {
          continent: filterContinent.value,
          country: filterCountry.value
        }
      });

      if (data.status === "success" && data.location_ids) {
        countryId = data.location_ids.country_id || data.location_ids.countryId || null;
        continentId = data.location_ids.continent_id || data.location_ids.continentId || null;

        if (countryId && countryId > 0) {
          postsStore.setFilters({
            categorySlug: filterCategory.value,
            subcategorySlug: filterSubcategory.value,
            countryId: Number(countryId),
            cityId: null,
            continentId: null
          });
        } else if (continentId && continentId > 0) {
          postsStore.setFilters({
            categorySlug: filterCategory.value,
            subcategorySlug: filterSubcategory.value,
            continentId: Number(continentId),
            countryId: null,
            cityId: null
          });
        }
      }
    } catch (error) {
      // Fallback: apply filters without location - using new API
      postsStore.setFilters({
        categorySlug: filterCategory.value,
        subcategorySlug: filterSubcategory.value
      });
    }
  } else {
    // No location filters - using new API
    postsStore.setFilters({
      categorySlug: filterCategory.value,
      subcategorySlug: filterSubcategory.value
    });
  }

  // Ensure filterSubcategory is set before saving - but only if we're actually on step 2 or 3
  // If we're on step 1, filterSubcategory can be null (user only selected category)
  if (currentStep.value >= 2 && !filterSubcategory.value) {
    notifyError({
      kind: "validation",
      messageKey: "common.errors.validation",
      fallbackMessage: "Please check your input and try again.",
      retryable: false
    }, { position: "top", timeout: 4000 });
    return;
  }

  preferencesStore.setLastUsedFeedFilters({
    postType: filterCategory.value, // Legacy key for preferences store
    subcategory: filterSubcategory.value,
    location: {
      continentId,
      countryId,
      cityId: filterCityId.value
    }
  });

  // Note: preferences store persists filters to localStorage; no verbose logging here

  // Navigovať späť na posts page a načítať posty s filtrami
  // Use nextTick to ensure filters are saved before navigation
  await nextTick();
  router.push({ name: "donor-posts" });
  // PostsPage automaticky načíta posty pri mount alebo zmene tabu s filtrami zo store
};

const handleSearch = () => {
  // Apply current filters and search
  // Ak sme v kroku 1, použiť handleSearchFromStep1 (len typ, bez kategórie)
  if (currentStep.value === 1) {
    handleSearchFromStep1();
  } else {
    // Ak sme v kroku 2 alebo 3, použiť normálny applyFilters
    applyFilters();
  }
};

// Sync filter values with store on mount - using new API
onMounted(() => {
  // Načítať existujúce filtre zo store
  filterCategory.value = postsStore.filters.categorySlug;
  filterSubcategory.value = postsStore.filters.subcategorySlug;
  currentStep.value = 1;
});

// Watch filterCategory changes and update store immediately (for real-time updates) - using new API
watch(filterCategory, (newVal) => {
  postsStore.setFilters({ categorySlug: newVal });
  // Ak sa zmení category, resetovať subcategory
  filterSubcategory.value = null;
});

// Odstránený watch - filtre sa aplikujú len cez applyFilters() alebo handleSearchFromStep1()
// watch(filterCategory, (newVal) => {
//   const categoryId = getCategoryId(newVal);
//   postsStore.setFilters({ categoryId });
// });

</script>

<style lang="scss" scoped>
.filters-page {
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  background: radial-gradient(circle at top, #0b001c 0%, #05000e 40%, #010006 100%);
}

.filters-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1.25rem 1.5rem 0; // top padding from top bar
  flex-shrink: 0;
  position: relative;
  z-index: 100;
}

.filters-back {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;
  position: relative;
  z-index: 10;

  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.05);
  }

  &:active {
    transform: scale(0.95);
  }

  .q-icon {
    font-size: 24px;
    color: #ffffff;
    pointer-events: none;
  }
}

.filters-title {
  font-weight: 600;
  font-size: 1.5rem; // same typography as in onboarding/filters headings
  color: #ffffff;
  margin: 0;
  line-height: 1.2;
  flex: 1;
  text-align: center;
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: calc(100% - 80px); // Account for back button width
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;

  .filters-title-icon {
    height: 1.5rem;
    width: 1.5rem;
    object-fit: contain;
  }
}

.filters-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; // centrally between header and footer
  padding: 1.5rem 1.5rem 1rem;
  text-align: center;
  min-height: 0;
  overflow: hidden;
}

.filters-content--step3 {
  // For step 3 with map + selects, use flex-start to prevent overlap
  justify-content: flex-start;
  padding-top: 4.5rem;
  padding-bottom: 1rem;
  gap: 1rem;
}

.filters-footer {
  padding: 0 1.5rem 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
  flex-shrink: 0;
}

.filters-searchBtn {
  width: 100%;
  height: 48px;
  border-radius: 9999px;
  background: transparent;
  border: 2px solid #BD0043;
  color: #BD0043;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    background: rgba(189, 0, 67, 0.1);
  }
}

.filters-nextBtn {
  width: 100%;
  height: 48px;
  border-radius: 9999px;
  background: #BD0043;
  border: none;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 8px 24px rgba(189, 0, 67, 0.3);

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(189, 0, 67, 0.4);
  }
}

</style>
