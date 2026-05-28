<template>
  <q-page
    class="filters-page"
    :class="{
      'filters-page--wheelSteps': currentStep === 1 || currentStep === 2,
      'filters-page--swapPosts': currentStep === 1
    }"
  >
    <!-- Header with back button and title -->
    <header class="filters-header">
      <button class="filters-back" type="button" @click.stop="handleBack">
        <q-icon name="chevron_left" />
      </button>
      <div class="filters-progress" aria-hidden="true">
        <span class="filters-progress_fill" :style="{ width: progressWidth }"></span>
      </div>
    </header>
    <h1 class="filters-title" :class="{ 'filters-title--swapPosts': currentStep === 1 }">
      <img src="/header_icons/filters_ns.svg" alt="" class="filters-title-icon" />
      {{ currentTitle }}
    </h1>

    <!-- Main content area -->
    <main
      class="filters-content"
      :class="{
        'filters-content--step3': currentStep === 3,
        'filters-content--compact': currentStep === 1 || currentStep === 2
      }"
    >
      <!-- Steps 1–2: roller + ? only; hint lives in fixed footer above SEARCH -->
      <div v-if="currentStep === 1 || currentStep === 2" class="filters-pickerMount">
        <WhatIsYourGoal
          v-if="currentStep === 1"
          v-model="filterCategory"
          :center-offset-y="-11"
          :roller-axis-offset-y="-19"
          :hide-header="true"
          :hide-footer="true"
          @next="handleNext"
          @search="handleSearch"
          @back="handleBack"
        />
        <WhatKindOfDream
          v-else
          :model-value="filterSubcategory"
          :center-offset-y="-13"
          :roller-axis-offset-y="-18"
          :hide-header="true"
          :hide-footer="true"
          @update:modelValue="handleCategoryUpdate"
          @next="handleNext"
          @search="handleSearch"
          @back="handleBack"
        />
      </div>

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
      <!-- STEP 1 & 2: hint above SEARCH (same copy as onboarding, not under the wheel) -->
      <template v-if="currentStep === 1 || currentStep === 2">
        <p class="filters-footerHint">choose by swiping up or down</p>
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
import { ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
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

// Current step (1–3, 1-based: 1 = swap posts / category wheel)
const currentStep = ref(1);
let wheelTouchLockAttached = false;

const wheelTouchMoveLockHandler = (event: TouchEvent) => {
  const target = event.target as HTMLElement | null;
  const isWheelTouch =
    !!target?.closest(".goal-swiper, .dream-swiper, .goal-swiper-shell, .dream-swiper-shell, .swiper, .swiper-wrapper, .swiper-slide");
  if (!isWheelTouch) {
    event.preventDefault();
  }
};

const setWheelScrollLock = (locked: boolean) => {
  if (typeof document === "undefined") return;
  document.documentElement.classList.toggle("filters-wheel-scroll-lock", locked);
  document.body.classList.toggle("filters-wheel-scroll-lock", locked);
  if (locked && !wheelTouchLockAttached) {
    document.addEventListener("touchmove", wheelTouchMoveLockHandler, { passive: false });
    wheelTouchLockAttached = true;
  } else if (!locked && wheelTouchLockAttached) {
    document.removeEventListener("touchmove", wheelTouchMoveLockHandler);
    wheelTouchLockAttached = false;
  }
};

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

const progressWidth = computed(() => {
  if (currentStep.value <= 1) return "33%";
  if (currentStep.value === 2) return "66%";
  return "100%";
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
  setWheelScrollLock(currentStep.value === 1 || currentStep.value === 2);
});

watch(currentStep, (step) => {
  setWheelScrollLock(step === 1 || step === 2);
});

onBeforeUnmount(() => {
  setWheelScrollLock(false);
  if (wheelTouchLockAttached) {
    document.removeEventListener("touchmove", wheelTouchMoveLockHandler);
    wheelTouchLockAttached = false;
  }
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
/* Unified app background (iosSafeArea.scss) – no local override */
.filters-page {
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  flex: 1 1 auto;
  min-height: 0;
  background: transparent;
  overflow: hidden;
  box-sizing: border-box;
}

/* Wheel steps: less top slack so the roller block can sit closer to true vertical center */
.filters-page--wheelSteps .filters-header {
  margin-top: 0;
  padding-top: calc(env(safe-area-inset-top, 0px) + 41px);
  transform: translateY(-35px);
}

.filters-page--wheelSteps .filters-title {
  transform: translateY(-35px);
}

.filters-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  padding: 0 1.5rem 0;
  margin-top: 0;
  margin-bottom: 20px;
  flex-shrink: 0;
  position: relative;
  z-index: 100;
}

.filters-progress {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  top: calc(env(safe-area-inset-top, 0px) + 59px);
  width: 200px;
  max-width: calc(100% - 120px);
  height: 3px;
  background-color: rgba(255, 255, 255, 0.12);
  border-radius: 2px;
  overflow: hidden;
}

.filters-progress_fill {
  display: block;
  height: 100%;
  background: #BD0043;
  transition: width 0.3s ease;
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
  margin: 0 0 12px 0;
  line-height: 1.2;
  text-align: center;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  padding: 0 1.5rem;
  flex-shrink: 0;

  .filters-title-icon {
    height: 1.5rem;
    width: 1.5rem;
    object-fit: contain;
  }
}

.filters-page--swapPosts .filters-title.filters-title--swapPosts {
  color: #ffffff !important;
}

/* Fixed footer: hint line + gap + two buttons + safe area + shadow slack */
$filters-footer-reserve-2btn: calc(
  1.25rem + 0.5rem + 48px + 0.5rem + 48px + max(0.65rem, env(safe-area-inset-bottom, 0px)) + 12px
);
$filters-footer-reserve-1btn: calc(48px + max(0.65rem, env(safe-area-inset-bottom, 0px)) + 12px);

.filters-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center; // centrally between header and footer
  padding: 0 1.5rem $filters-footer-reserve-2btn;
  text-align: center;
  min-height: 0;
  overflow: hidden;
}

.filters-content--compact {
  position: relative;
  flex: 1 1 auto;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 0 1.5rem $filters-footer-reserve-2btn;
  /* Existing nested content layer under .filters-content. */
  overflow: hidden;
  min-height: 0;
}

.filters-pickerMount {
  position: relative;
  width: 100%;
  max-width: 390px;
  display: flex;
  flex-direction: column;
  align-items: stretch;
  justify-content: center;
  flex: 0 1 auto;
  min-height: 0;
  pointer-events: none;

  & > * {
    pointer-events: auto;
    width: 100%;
  }
}

/* Fill <main> and re-center the picker so the block isn’t visually low vs header + fixed footer */
.filters-content--compact .filters-pickerMount {
  flex: 1 1 auto;
  align-self: stretch;
  justify-content: center;
  align-items: center;
}

/*
 * Filters wheel: shared flex row so stage + "?" share one cross-axis; compact slide height; swiper
 * scroll contained (no page rubber-band).
 */
.filters-content--compact :deep(.whatIsYourGoal.whatIsYourGoal--filter-mode),
.filters-content--compact :deep(.whatKindOfDream.whatKindOfDream--filter-mode) {
  /* Match donee roller metrics so spacing/icons are visually identical. */
  --goal-wheel-shell-height: 400px;
  --goal-wheel-shell-min-height: 320px;
  --goal-wheel-shell-max-height: 48vh;
  --goal-wheel-slide-size: 152px;
  --goal-wheel-wrapper-pad-y: 0.5rem;
  --goal-wheel-track-pad-y: 20px;
  --goal-inline-instruction-gap: 0.9rem;
  --goal-bottom-top-gap: 10px;
  --goal-instruction-bottom-gap: 14px;
}

.filters-content--compact :deep(.whatIsYourGoal.whatIsYourGoal--filter-mode .goal-carousel-wrapper),
.filters-content--compact :deep(.whatKindOfDream.whatKindOfDream--filter-mode .dream-carousel-wrapper) {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  padding: var(--goal-wheel-wrapper-pad-y, 0.5rem) 0;
}

.filters-content--compact :deep(.whatIsYourGoal.whatIsYourGoal--filter-mode .goal-carousel-stage),
.filters-content--compact :deep(.whatKindOfDream.whatKindOfDream--filter-mode .dream-carousel-stage) {
  flex: 0 1 auto;
  min-width: 0;
}

/* Fixed viewport band; only this area scrolls (Swiper), not q-page */
.filters-content--compact :deep(.whatIsYourGoal .goal-swiper),
.filters-content--compact :deep(.whatKindOfDream .dream-swiper) {
  height: var(--goal-wheel-shell-height, 400px) !important;
  min-height: var(--goal-wheel-shell-min-height, 320px) !important;
  max-height: var(--goal-wheel-shell-max-height, 48vh) !important;
  overflow: visible !important;
  overscroll-behavior: contain;
  touch-action: pan-y;
}

/* Use same row size as donee (icon + halo spacing). */
.filters-content--compact :deep(.whatIsYourGoal .swiper-slide),
.filters-content--compact :deep(.whatKindOfDream .swiper-slide) {
  height: var(--goal-wheel-slide-size, 152px) !important;
  min-height: var(--goal-wheel-slide-size, 152px) !important;
  max-height: var(--goal-wheel-slide-size, 152px) !important;
}

.filters-content--compact :deep(.whatIsYourGoal .goal-option),
.filters-content--compact :deep(.whatKindOfDream .dream-option) {
  min-height: var(--goal-wheel-slide-size, 152px) !important;
}

/* Softer bottom fade + tighter wrapper padding = peek of next slide */
.filters-content--compact :deep(.goal-swiper-shell),
.filters-content--compact :deep(.dream-swiper-shell) {
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 10%,
    black 86%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 10%,
    black 86%,
    transparent 100%
  );
}

/* Symmetric vertical padding so centered slide axis matches wrapper box + help btn */
.filters-content--compact :deep(.goal-swiper .swiper-wrapper),
.filters-content--compact :deep(.dream-swiper .swiper-wrapper) {
  padding-top: var(--goal-wheel-track-pad-y, 20px) !important;
  padding-bottom: var(--goal-wheel-track-pad-y, 20px) !important;
}

/*
 * Active icon sits slightly below pure 50% — anchor help with top: calc(50% + 14px) (filters).
 * right: 1.25rem matches component.
 */
.filters-content--compact :deep(.whatIsYourGoal .goal-helpBtn),
.filters-content--compact :deep(.whatKindOfDream .dream-helpBtn) {
  z-index: 60;
  top: 50%;
  transform: translateY(-50%);
}

/* Swap posts only: move ? button slightly right without affecting anything else. */
.filters-page--swapPosts .filters-content--compact :deep(.whatIsYourGoal .goal-helpBtn) {
  right: calc(1.25rem - 4px);
}

/* Filters: onboarding pickers majú min-height: 100dvh; v "filter mode" to vytlačí CTA mimo viewport */
.filters-content :deep(.whatIsYourGoal.whatIsYourGoal--filter-mode),
.filters-content :deep(.whatKindOfDream.whatKindOfDream--filter-mode) {
  min-height: 0;
  height: auto;
  max-height: 100%;
  overflow: hidden;
}

.filters-content--step3 {
  // For step 3 with map + selects, use flex-start to prevent overlap
  justify-content: flex-start;
  padding-top: 4.5rem;
  padding-bottom: $filters-footer-reserve-1btn;
  gap: 1rem;
  overflow-x: hidden;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;

  :deep(.whereAreYou.whereAreYou--filter-mode) {
    overflow: visible;
  }
}

.filters-footer {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  z-index: 200;
  width: 100%;
  max-width: 390px;
  margin: 0 auto;
  padding: 0 1.5rem max(0.65rem, env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  gap: 0.62rem;
  flex-shrink: 0;
  /* Strip matches app background so CTAs sit on the real bottom edge */
  background: transparent;
}

.filters-footerHint {
  margin: 0;
  padding: 0.1rem 0.25rem 0;
  font-size: 0.875rem;
  line-height: 1.35;
  font-weight: 400;
  text-align: center;
  color: rgba(255, 255, 255, 0.62);
}

.body--light .filters-footer {
  background: #f5f5f5;
}

/* Unscoped: dark theme strip under fixed CTAs (scoped .body--light block above wins in light mode) */
body:not(.body--light) .filters-footer {
  background: #0a0a0a;
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

<style lang="scss">
/*
 * QPage sets minHeight ≈ full window; donor chrome is outside QLayout — page can exceed container.
 * Cap height to the container (no rubber-band scroll). Do NOT set min-height:0 or height:100% here:
 * that collapsed the flex column so <main> had 0 height and the absolute picker mount disappeared.
 */
.q-page.filters-page {
  max-height: 100% !important;
  overflow: hidden !important;
  overscroll-behavior: none;
}

.q-layout .q-page-container:has(.q-page.filters-page) {
  overflow: hidden !important;
  overscroll-behavior: none;
}

/* Donor filters (wheel steps): lock page scrolling so wheel+? stays static like donee screen. */
body.filters-wheel-scroll-lock {
  overflow: hidden !important;
  overscroll-behavior: none;
  touch-action: none;
}

html.filters-wheel-scroll-lock {
  overflow: hidden !important;
  overscroll-behavior: none !important;
}

body.filters-wheel-scroll-lock .q-layout,
body.filters-wheel-scroll-lock .q-page-container {
  overflow: hidden !important;
  overscroll-behavior: none !important;
  -webkit-overflow-scrolling: auto;
}

body.filters-wheel-scroll-lock .goal-swiper,
body.filters-wheel-scroll-lock .dream-swiper,
body.filters-wheel-scroll-lock .swiper {
  touch-action: pan-y !important;
}

.body--light .filters-page .filters-title {
  .filters-titlePatchTag {
    font-size: 0.62em;
    letter-spacing: 0.08em;
    opacity: 0.88;
    margin-left: 0.35rem;
  }
  color: #1a1a1a !important;
}

/* “swap posts” blue: see src/css/partials/abstracts/_darkMode.scss (beats .body--light h1) */
body:not(.body--light) .filters-page.filters-page--swapPosts .filters-title.filters-title--swapPosts {
  color: #ffffff !important;
}

/* filters_ns.svg uses #FCFCFC — invisible on light background */
.body--light .filters-page .filters-title-icon {
  filter: brightness(0) saturate(100%);
  opacity: 0.88;
}

/* Light header: same affordance as other round header controls */
.body--light .filters-page .filters-back {
  background: rgba(255, 255, 255, 0.96) !important;
  border: 2px solid rgba(0, 0, 0, 0.22) !important;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08) !important;

  .q-icon {
    color: #0a0a0a !important;
  }

  &:hover,
  &:active {
    background: rgba(255, 255, 255, 1) !important;
    border-color: rgba(0, 0, 0, 0.28) !important;
  }
}

.body--light .filters-page .filters-footerHint {
  color: rgba(26, 26, 26, 0.55) !important;
}
</style>
