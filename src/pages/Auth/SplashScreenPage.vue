<template>
  <div id="splash-screen">
    <div id="animation-container"></div>
  </div>
</template>

<script setup>
import lottie from "lottie-web";
import animationData from "src/assets/Auth/splash-dark.json";
import { onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "src/stores/auth";
import { usePreferencesStore } from "src/stores/preferences";
import { readStoredSidePreferences, resolvePostAuthRedirect } from "src/utils/postAuthRedirect";
import {
  waitForAuthSessionSettled,
  waitForAuthUserId
} from "src/utils/authSessionReady";

const router = useRouter();
const authStore = useAuthStore();
const preferencesStore = usePreferencesStore();
let lottieInstance = null;

async function navigateAfterSplash() {
  // Router bootstrap must not depend on legacy jwtToken store.
  // Canonical key is "token" (auth store + axios boot).
  const token = authStore.token || localStorage.getItem("token") || "";

  if (!token) {
    await router.replace({ name: "auth-welcome-page" });
    return;
  }

  // Cold start: animation may finish before /user resolves — wait for boot/init settle,
  // then for userId without issuing an extra API call.
  await waitForAuthSessionSettled(8000);
  const tokenAfter = authStore.token || localStorage.getItem("token") || "";
  if (!tokenAfter) {
    await router.replace({ name: "auth-welcome-page" });
    return;
  }

  const userId = await waitForAuthUserId(
    () => authStore.user?.id ?? null,
    () => authStore.token || localStorage.getItem("token"),
    5000
  );

  if (!authStore.token && !localStorage.getItem("token")) {
    await router.replace({ name: "auth-welcome-page" });
    return;
  }

  preferencesStore.hydrateFromStorage();
  const storedSides = readStoredSidePreferences(userId);
  await router.replace(
    resolvePostAuthRedirect({
      currentSide: storedSides.currentSide,
      onboardingInitialSide: storedSides.onboardingInitialSide
    })
  );
}

onMounted(() => {
  const animationContainer = document.getElementById("animation-container");
  if (!animationContainer) return;
  lottieInstance = lottie.loadAnimation({
    container: animationContainer,
    renderer: "canvas",
    loop: false,
    autoplay: true,
    animationData
  });

  lottieInstance.addEventListener("complete", () => {
    void navigateAfterSplash();
  });
});

onBeforeUnmount(() => {
  if (lottieInstance) {
    lottieInstance.destroy();
    lottieInstance = null;
  }
});
</script>

<style scoped>

#splash-screen {
  display: flex;
  justify-content: center;
  align-items: center;
  height: 100vh;
  background-color: #0f0026; /* Customize as needed */
}
</style>
