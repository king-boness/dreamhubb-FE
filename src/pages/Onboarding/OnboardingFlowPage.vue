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
    <WhereAreYou
      v-model:continent="feedContinent"
      v-model:country="feedCountry"
      v-model:city="feedCityId"
      :emit-city-id="true"
      city-model-mode="object"
      :enable-geolocation="false"
      :progress="80"
      :title="t('postsWillBeFrom')"
      @next="handleNext"
      @back="handleBack"
    />
  </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, nextTick } from "vue";
import { useRouter } from "vue-router";
import { useOnboardingStore } from "src/stores/onboarding";
import { usePreferencesStore } from "src/stores/preferences";
import { usePostsStore } from "src/stores/posts";
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
    // Don't fail registration - location filtering will just be skipped
  }

  // Execute registration via onboarding store
  try {
    await onboardingStore.register();
  } catch (error) {
    // registration errors are handled in store
    // If there are field errors (e.g., existing email), navigate back to step 1
    if (onboardingStore.fieldErrors && Object.keys(onboardingStore.fieldErrors).length > 0) {
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
    // Seed donor filters once from donee onboarding so first switch to donor uses these filters.
    preferencesStore.seedDonorFiltersFromDoneeOnboardingIfNeeded();
    router.push({ name: "submit-postCreation" });
  } else {
    preferencesStore.setCurrentSide("donor");
    preferencesStore.clearLastUsedFeedFilters();
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
</style>
