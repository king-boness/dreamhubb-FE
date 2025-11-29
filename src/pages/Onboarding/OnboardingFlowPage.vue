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
import { ref } from "vue";
import { useRouter } from "vue-router";
import PickYourSide from "src/components/Onboarding/PickYourSide.vue";
import WhatIsYourGoal from "src/components/Onboarding/WhatIsYourGoal.vue";
import WhatKindOfDream from "src/components/Onboarding/WhatKindOfDream.vue";
import WhereAreYou from "src/components/Onboarding/WhereAreYou.vue";
import WhoAreYou from "src/components/Onboarding/WhoAreYou.vue";

const router = useRouter();

// Current step (1-5)
const currentStep = ref(1);

// User data
const userSide = ref<"donor" | "donee" | null>(null);
const userGoal = ref<"problem" | "dream" | "idea" | null>(null);
const dreamCategory = ref<string | null>(null);
const userContinent = ref("");
const userCountry = ref("");
const userCity = ref("");
const username = ref("");
const dateOfBirth = ref("");
const gender = ref("");
const email = ref("");
const password = ref("");
const repeatPassword = ref("");

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

const handleFinish = () => {
  // Save onboarding completion flag
  localStorage.setItem("dh_onboarding_done", "1");

  // Registration and redirect are handled in WhoAreYou component
  // This function is called after successful registration via emit("finish")
  // No need to redirect here as WhoAreYou already handles it
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
