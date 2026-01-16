<template>
  <q-page class="onboardingFlow">
  <!-- STEP 1: Who are you + user profile location -->
  <template v-if="currentStep === 1">
    <WhoAreYou
      :key="`step1-${onboardingStore.fieldErrors ? Object.keys(onboardingStore.fieldErrors).length : 0}`"
      v-model:username="username"
      v-model:dateOfBirth="dateOfBirth"
      v-model:gender="gender"
      v-model:email="email"
      v-model:password="password"
      v-model:repeatPassword="repeatPassword"
      v-model:profile-continent="profileContinent"
      v-model:profile-country="profileCountry"
      v-model:profile-city="profileCity"
      :user-side="userSide"
      :progress="20"
      @next="handleNext"
      @finish="handleFinish"
      @back="handleBack"
    />
  </template>

  <!-- STEP 2: Pick Your Side (donor/donee) -->
  <template v-else-if="currentStep === 2">
    <PickYourSide
      v-model="userSide"
      @next="handleNext"
      @back="handleBack"
    />
  </template>

  <!-- STEP 3: What is Your Goal (problem/dream/idea) -->
  <template v-else-if="currentStep === 3">
    <WhatIsYourGoal
      v-model="userGoal"
      :progress="40"
      @next="handleNext"
      @back="handleBack"
    />
  </template>

  <!-- STEP 4: What Kind of Dream (subcategory) -->
  <template v-else-if="currentStep === 4">
    <WhatKindOfDream
      v-model="dreamCategory"
      :progress="60"
      @next="handleNext"
      @back="handleBack"
    />
  </template>

  <!-- STEP 5: Where are you (feed location preferences) -->
  <template v-else-if="currentStep === 5">
    <div class="step5-wrap">
      <WhereAreYou
        :key="feedWhereKey"
        v-model:continent="feedContinent"
        v-model:country="feedCountry"
        v-model:city="feedCityId"
        :emit-city-id="true"
        :enable-geolocation="false"
        :hide-footer="true"
        :progress="80"
        :title="t('postsWillBeFrom')"
        @next="handleNext"
        @back="handleBack"
      />

      <!-- Footer area for this step (no overlay): primary CTA always visible -->
      <div class="step5-footer">
        <q-btn
          class="step5-nextBtn full-width"
          :disable="!feedContinent || !feedCountry"
          @click="handleNext"
        >
          NEXT STEP
        </q-btn>

        <!-- Preview indicator (only when city selected) -->
        <div v-if="selectedCityId && previewLoading" class="step5-previewRow">
          <q-spinner size="18px" color="primary" />
          <span class="step5-previewText">{{ t("loadingPosts") }}</span>
        </div>

        <!-- Empty state (only after successful fetch + 0 posts + city selected) -->
        <div v-if="showEmptyState" class="step5-emptyPanel">
          <p class="step5-emptyText">{{ t("noPostsFromThisCityYet") }}</p>
          <q-btn class="step5-resetBtn" flat @click="resetFeedLocation">
            {{ t("resetFilters") }}
          </q-btn>
        </div>

        <!-- Optional preview error (do NOT show empty-state on error) -->
        <p v-if="previewError" class="step5-errorText">
          {{ previewError }}
        </p>
      </div>
    </div>
  </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, nextTick, watch } from "vue";
import { useRouter } from "vue-router";
import { useOnboardingStore } from "src/stores/onboarding";
import { usePreferencesStore } from "src/stores/preferences";
import { usePostsStore } from "src/stores/posts";
import { api } from "boot/axios";
import PickYourSide from "src/components/Onboarding/PickYourSide.vue";
import WhatIsYourGoal from "src/components/Onboarding/WhatIsYourGoal.vue";
import WhatKindOfDream from "src/components/Onboarding/WhatKindOfDream.vue";
import WhereAreYou from "src/components/Onboarding/WhereAreYou.vue";
import WhoAreYou from "src/components/Onboarding/WhoAreYou.vue";
import { useI18n } from "vue-i18n";

const router = useRouter();
const onboardingStore = useOnboardingStore();
const preferencesStore = usePreferencesStore();
const postsStore = usePostsStore();
const { t } = useI18n();

// Current step (1-5)
const currentStep = ref(1);

// Computed properties from store
const userSide = computed({
  get: () => onboardingStore.role,
  set: (value) => onboardingStore.setStepData("role", value)
});

const userGoal = computed({
  get: () => onboardingStore.goalType,
  set: (value) => onboardingStore.setStepData("goalType", value)
});

const dreamCategory = computed({
  get: () => onboardingStore.category,
  set: (value) => onboardingStore.setStepData("category", value)
});

// Profile location (step 1)
const profileContinent = computed({
  get: () => onboardingStore.profileContinent,
  set: (value) => onboardingStore.setStepData("profileContinent", value)
});

const profileCountry = computed({
  get: () => onboardingStore.profileCountry,
  set: (value) => onboardingStore.setStepData("profileCountry", value)
});

const profileCity = computed({
  get: () => onboardingStore.profileCity,
  set: (value) => onboardingStore.setStepData("profileCity", value)
});

// Feed location (step 5)
const feedContinent = computed({
  get: () => onboardingStore.feedContinent,
  set: (value) => onboardingStore.setStepData("feedContinent", value)
});

const feedCountry = computed({
  get: () => onboardingStore.feedCountry,
  set: (value) => onboardingStore.setStepData("feedCountry", value)
});

const feedCityId = computed({
  get: () => onboardingStore.feedCityId,
  set: (value) => onboardingStore.setStepData("feedCityId", value)
});

// STEP 5 preview state: if selected city has 0 posts, show message + reset
const feedWhereKey = ref(0);
const previewCount = ref<number>(0);
const previewLoading = ref(false);
const previewFetched = ref(false);
const previewError = ref<string | null>(null);
const previewRequestId = ref(0);

const selectedCityId = computed(() => (typeof feedCityId.value === "number" ? feedCityId.value : null));

const showEmptyState = computed(() => {
  return (
    previewFetched.value &&
    !previewLoading.value &&
    selectedCityId.value !== null &&
    previewCount.value === 0
  );
});

const normalizePostsArray = (data: unknown): unknown[] => {
  const anyData = data as any;
  const candidates = [anyData?.data, anyData?.posts, anyData];
  for (const c of candidates) {
    if (Array.isArray(c)) return c;
  }
  return [];
};

watch(
  () => feedCityId.value,
  async (cityId) => {
    previewFetched.value = false;
    previewError.value = null;
    previewCount.value = 0;
    if (!cityId) return;

    const current = ++previewRequestId.value;
    previewLoading.value = true;

    const params = { location_city_id: Number(cityId) };
    if (process.env.NODE_ENV === "development") {
      console.log("[onboarding-step5] preview /posts params:", params);
    }

    try {
      const { data } = await api.get("/posts", { params });
      if (current !== previewRequestId.value) return; // stale
      const posts = normalizePostsArray(data);
      previewCount.value = posts.length;
      previewFetched.value = true;
    } catch {
      previewError.value = null; // keep silent; no empty-state on error
      previewFetched.value = false;
    } finally {
      if (current === previewRequestId.value) {
        previewLoading.value = false;
      }
    }
  }
);

const resetFeedLocation = () => {
  onboardingStore.setStepData("feedContinent", "");
  onboardingStore.setStepData("feedCountry", "");
  onboardingStore.setStepData("feedCity", "");
  onboardingStore.setStepData("feedContinentId", null);
  onboardingStore.setStepData("feedCountryId", null);
  onboardingStore.setStepData("feedCityId", null);
  previewFetched.value = false;
  previewError.value = null;
  previewCount.value = 0;
  feedWhereKey.value++;
};

const username = computed({
  get: () => onboardingStore.name,
  set: (value) => onboardingStore.setStepData("name", value)
});

const dateOfBirth = computed({
  get: () => onboardingStore.dateOfBirth,
  set: (value) => onboardingStore.setStepData("dateOfBirth", value)
});

const gender = computed({
  get: () => onboardingStore.gender,
  set: (value) => onboardingStore.setStepData("gender", value)
});

const email = computed({
  get: () => onboardingStore.email,
  set: (value) => onboardingStore.setStepData("email", value)
});

const password = computed({
  get: () => onboardingStore.password,
  set: (value) => onboardingStore.setStepData("password", value)
});

const repeatPassword = computed({
  get: () => onboardingStore.passwordConfirmation,
  set: (value) => onboardingStore.setStepData("passwordConfirmation", value)
});

const handleNext = () => {
  if (currentStep.value < 5) {
    currentStep.value++;
  } else {
    handleFinish();
  }
};

const handleBack = () => {
  if (currentStep.value > 1) {
    currentStep.value--;
  } else {
    // Go back to auth welcome page
    router.push({ name: "auth-welcome-page" });
  }
};

const handleFinish = async () => {
  // First, fetch feed location IDs if we have feed location names
  try {
    if (onboardingStore.feedContinent && onboardingStore.feedCountry) {
      await onboardingStore.fetchFeedLocationIds();
    }
  } catch (error) {
    // Log error but don't fail registration - location filtering will just be skipped
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to fetch feed location IDs:", error);
    }
  }

  // Execute registration via onboarding store
  try {
    await onboardingStore.register();
  } catch (error) {
    // registration errors are handled in store
    // If there are field errors (e.g., existing email), navigate back to step 1
    if (onboardingStore.fieldErrors && Object.keys(onboardingStore.fieldErrors).length > 0) {
      if (process.env.NODE_ENV === "development") {
        console.log("❌ Registration failed with field errors:", onboardingStore.fieldErrors);
      }
      // Use nextTick to ensure store is updated before navigating
      await nextTick();
      // Small delay to ensure component re-renders
      setTimeout(() => {
        currentStep.value = 1;
        // Scroll to top to ensure user sees the error
        window.scrollTo({ top: 0, behavior: "smooth" });
      }, 100);
    }
    return;
  }

  const initialSide = onboardingStore.role === "donee" ? "donee" : "donor";

  // Persist onboarding preferences
  preferencesStore.setInitialSide(initialSide);
  preferencesStore.setPreferredPostType(
    (onboardingStore.goalType as "dream" | "problem" | "idea") || null
  );
  preferencesStore.setPreferredSubcategory(onboardingStore.category);
  preferencesStore.setPreferredFeedLocation({
    continentId: onboardingStore.feedContinentId,
    countryId: onboardingStore.feedCountryId,
    cityId: onboardingStore.feedCityId
  });
  preferencesStore.clearLastUsedFeedFilters();

  // Apply initial feed filters for donor side
  const applyInitialFeedFilters = () => {
    // Determine location filters: if city is selected, use city; otherwise use country; otherwise use continent
    let locationFilters: {
      continentId: number | null;
      countryId: number | null;
      cityId: number | null;
    };

    if (onboardingStore.feedCityId) {
      // City is selected - filter by city
      locationFilters = {
        continentId: null,
        countryId: null,
        cityId: onboardingStore.feedCityId
      };
    } else if (onboardingStore.feedCountryId) {
      // Country is selected but no city - filter by country
      locationFilters = {
        continentId: null,
        countryId: onboardingStore.feedCountryId,
        cityId: null
      };
    } else if (onboardingStore.feedContinentId) {
      // Only continent is selected - filter by continent
      locationFilters = {
        continentId: onboardingStore.feedContinentId,
        countryId: null,
        cityId: null
      };
    } else {
      // No location filters
      locationFilters = {
        continentId: null,
        countryId: null,
        cityId: null
      };
    }

    // Apply filters using setFilters method
    postsStore.setFilters({
      type: onboardingStore.goalType || null,
      feCategory: onboardingStore.category || null,
      ...locationFilters
    });

    // Save to lastUsedFeedFilters so PostsPage will use them
    preferencesStore.setLastUsedFeedFilters({
      postType: onboardingStore.goalType || null,
      subcategory: onboardingStore.category || null,
      location: locationFilters
    });
  };

  if (initialSide === "donee") {
    preferencesStore.setCurrentSide("donee");
    router.push({ name: "submit-postCreation" });
  } else {
    preferencesStore.setCurrentSide("donor");
    applyInitialFeedFilters();
    router.push({ name: "donor-posts" });
  }

  onboardingStore.reset();
};
</script>

<style lang="scss" scoped>
.onboardingFlow {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  padding: 0;
  background: transparent;
}

.step5-wrap {
  width: 100%;
  position: relative;
}

.step5-emptyText {
  color: rgba(255, 255, 255, 0.85);
  text-align: center;
  margin: 0;
  font-family: poppins;
}

.step5-footer {
  padding: 0 20px 24px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-top: -12px;
}

.step5-nextBtn {
  background: rgba(182, 0, 67, 1);
  color: #fff;
  border-radius: 12px;
  height: 48px;
  font-family: montseraatSemiBold;
}

.step5-previewRow {
  display: flex;
  align-items: center;
  gap: 8px;
  justify-content: center;
  color: rgba(255, 255, 255, 0.7);
}

.step5-previewText {
  font-family: poppins;
  font-size: 0.95rem;
}

.step5-emptyPanel {
  border-radius: 12px;
  padding: 12px 12px 6px;
  background: rgba(255, 255, 255, 0.06);
  border: 1px solid rgba(255, 255, 255, 0.08);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 6px;
}

.step5-resetBtn {
  color: rgba(255, 255, 255, 0.9);
}

.step5-errorText {
  color: rgba(255, 255, 255, 0.65);
  text-align: center;
  margin: 0;
  font-family: poppins;
  font-size: 0.9rem;
}
</style>
