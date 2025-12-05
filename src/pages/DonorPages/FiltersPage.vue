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
        v-model="filterGoal"
        :hide-header="true"
        :hide-footer="true"
        @next="handleNext"
        @search="handleSearch"
        @back="handleBack"
      />

      <!-- STEP 2: What Kind of Dream (category) -->
      <WhatKindOfDream
        v-else-if="currentStep === 2"
        v-model="filterCategory"
        :hide-header="true"
        :hide-footer="true"
        @next="handleNext"
        @search="handleSearch"
        @back="handleBack"
      />

      <!-- STEP 3: Where are you (location) -->
      <WhereAreYou
        v-else-if="currentStep === 3"
        v-model:continent="filterContinent"
        v-model:country="filterCountry"
        v-model:city="filterCity"
        :hide-header="true"
        :hide-footer="true"
        :enable-geolocation="false"
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

      <!-- Reset filters button (show if any filters are active) -->
      <button
        v-if="hasActiveFilters"
        class="filters-resetBtn"
        @click="handleResetFilters"
      >
        Reset Filters
      </button>
    </footer>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch } from "vue";
import { useRouter } from "vue-router";
import { usePostsStore } from "src/stores/posts";
import WhatIsYourGoal from "src/components/Onboarding/WhatIsYourGoal.vue";
import WhatKindOfDream from "src/components/Onboarding/WhatKindOfDream.vue";
import WhereAreYou from "src/components/Onboarding/WhereAreYou.vue";
// getCategoryId už nie je potrebné - používame priamo fe_category

const router = useRouter();
const postsStore = usePostsStore();

// Current step (1-3)
const currentStep = ref(1);

// Filter values - synced with store
const filterGoal = ref<"problem" | "dream" | "idea" | null>(postsStore.filters.type);
const filterCategory = ref<string | null>(null);
const filterContinent = ref("");
const filterCountry = ref("");
const filterCity = ref("");

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

// Handle search from step 1 (only type selected, no category)
const handleSearchFromStep1 = () => {
  // Ak sme v kroku 1, resetovať categoryId na null (len typ sa aplikuje)
  if (currentStep.value === 1) {
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 Applying filters from step 1 (type only):", {
        type: filterGoal.value,
        categoryId: null
      });
    }
    postsStore.setFilters({
      type: filterGoal.value,
      categoryId: null, // Explicitne nastaviť na null, ak nie je vybraná podkategória
      feCategory: null // Explicitne nastaviť na null, ak nie je vybraná podkategória
    });
    // Navigovať späť na posts page
    router.push({ name: "donor-posts" });
  } else {
    // Ak sme v kroku 2 alebo 3, použiť normálny applyFilters
    applyFilters();
  }
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
      filterCategory.value = null;
      filterContinent.value = "";
      filterCountry.value = "";
      filterCity.value = "";
    } else if (previousStep === 2) {
      filterContinent.value = "";
      filterCountry.value = "";
      filterCity.value = "";
    }
  }
};

const applyFilters = async () => {
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 Applying filters:", {
      type: filterGoal.value,
      feCategory: filterCategory.value, // FE category name (traveling, health, etc.)
      currentStep: currentStep.value
    });
  }

  // Aktualizovať filtre v store
  // Použiť fe_category (FE category name) - každá FE kategória má svoj vlastný filter
  postsStore.setFilters({
    type: filterGoal.value,
    categoryId: null, // Už nepoužívame category_id
    feCategory: filterCategory.value // FE category name (traveling, health, etc.) - povinné
    // TODO: Location IDs - keď BE podporí, pridať:
    // continentId: getContinentId(filterContinent.value),
    // countryId: getCountryId(filterCountry.value),
    // cityId: getCityId(filterCity.value)
  });

  // Navigovať späť na posts page a načítať posty s filtrami
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

// Sync filter values with store on mount
onMounted(() => {
  // Načítať existujúce filtre zo store
  filterGoal.value = postsStore.filters.type;
  // categoryId sa musí mapovať späť na category name - TODO keď bude endpoint
  // filterCategory.value = getCategoryName(postsStore.filters.categoryId);
  currentStep.value = 1;
});

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return !!(
    postsStore.filters.type ||
    postsStore.filters.categoryId
    // TODO: Keď BE podporí location filtre, pridať:
    // postsStore.filters.continentId ||
    // postsStore.filters.countryId ||
    // postsStore.filters.cityId
  );
});

// Watch filter changes and update store immediately (for real-time updates)
watch(filterGoal, (newVal) => {
  postsStore.setFilters({ type: newVal });
  // Ak sa zmení typ, resetovať categoryId (ak nie je vybraná podkategória)
  if (!filterCategory.value) {
    postsStore.setFilters({ categoryId: null });
  }
});

// Odstránený watch - filtre sa aplikujú len cez applyFilters() alebo handleSearchFromStep1()
// watch(filterCategory, (newVal) => {
//   const categoryId = getCategoryId(newVal);
//   postsStore.setFilters({ categoryId });
// });

// Reset filters handler
const handleResetFilters = async () => {
  // Reset store filters
  postsStore.resetFilters();

  // Reset local filter values
  filterGoal.value = null;
  filterCategory.value = null;
  filterContinent.value = "";
  filterCountry.value = "";
  filterCity.value = "";
  currentStep.value = 1;

  // Načítať posty bez filtrov
  await postsStore.fetchPosts({ sort: "help" });

  // Navigovať späť na posts page
  router.push({ name: "donor-posts" });
};
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

.filters-resetBtn {
  width: 100%;
  height: 48px;
  border-radius: 9999px;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  margin-top: 0.5rem;

  &:hover {
    border-color: rgba(255, 255, 255, 0.5);
    color: rgba(255, 255, 255, 0.9);
    background: rgba(255, 255, 255, 0.05);
  }
}
</style>
