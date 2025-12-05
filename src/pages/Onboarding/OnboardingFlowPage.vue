<template>
  <q-page class="onboardingFlow">
    <!-- STEP 1: Pick Your Side (donor/donee) -->
    <template v-if="currentStep === 1">
      <PickYourSide
        v-model="userSide"
        @next="handleNext"
        @back="handleBack"
      />
    </template>

    <!-- STEP 2: What is Your Goal (problem/dream/idea) -->
    <template v-else-if="currentStep === 2">
      <WhatIsYourGoal
        v-model="userGoal"
        :progress="40"
        @next="handleNext"
        @back="handleBack"
      />
    </template>

    <!-- STEP 3: What Kind of Dream (category) -->
    <template v-else-if="currentStep === 3">
      <WhatKindOfDream
        v-model="dreamCategory"
        :progress="60"
        @next="handleNext"
        @back="handleBack"
      />
    </template>

    <!-- STEP 4: Where are you (location) -->
    <template v-else-if="currentStep === 4">
      <WhereAreYou
        v-model:continent="userContinent"
        v-model:country="userCountry"
        v-model:city="userCity"
        :progress="80"
        @next="handleNext"
        @back="handleBack"
      />
    </template>

    <!-- STEP 5: Who are you (registration form) -->
    <template v-else-if="currentStep === 5">
      <WhoAreYou
        v-model:username="username"
        v-model:dateOfBirth="dateOfBirth"
        v-model:gender="gender"
        v-model:email="email"
        v-model:password="password"
        v-model:repeatPassword="repeatPassword"
        :user-side="userSide"
        @finish="handleFinish"
        @back="handleBack"
      />
    </template>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { useOnboardingStore } from "src/stores/onboarding";
import PickYourSide from "src/components/Onboarding/PickYourSide.vue";
import WhatIsYourGoal from "src/components/Onboarding/WhatIsYourGoal.vue";
import WhatKindOfDream from "src/components/Onboarding/WhatKindOfDream.vue";
import WhereAreYou from "src/components/Onboarding/WhereAreYou.vue";
import WhoAreYou from "src/components/Onboarding/WhoAreYou.vue";

const router = useRouter();
const onboardingStore = useOnboardingStore();

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

const userContinent = computed({
  get: () => onboardingStore.locationContinent,
  set: (value) => onboardingStore.setStepData("locationContinent", value)
});

const userCountry = computed({
  get: () => onboardingStore.locationCountry,
  set: (value) => onboardingStore.setStepData("locationCountry", value)
});

const userCity = computed({
  get: () => onboardingStore.locationCity,
  set: (value) => onboardingStore.setStepData("locationCity", value)
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
  // Registration is handled in WhoAreYou component via onboarding store
  // This function is called after successful registration via emit("finish")
  // Redirect based on role
  if (onboardingStore.role === "donee") {
    router.push({ name: "donee-posts" });
  } else {
    router.push({ name: "donor-posts" });
  }
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
