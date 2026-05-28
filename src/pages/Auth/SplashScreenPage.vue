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

const router = useRouter();
const authStore = useAuthStore();
let lottieInstance = null;

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
    // Router bootstrap must not depend on legacy jwtToken store.
    // Canonical key is "token" (auth store + axios boot).
    const token = authStore.token || localStorage.getItem("token") || "";

    if (!token) {
      router.replace({ name: "auth-welcome-page" });
    } else {
      router.replace({ name: "donor-posts" });
    }
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
