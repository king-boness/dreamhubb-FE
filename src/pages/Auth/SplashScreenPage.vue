<template>
  <div id="splash-screen">
    <div id="animation-container"></div>
  </div>
</template>

<script setup>
import lottie from "lottie-web";
import animationData from "src/assets/Auth/splash-dark.json";
import { onMounted } from "vue";
import { useRouter } from "vue-router";
import { useUserStore } from "src/stores/user-store";

const router = useRouter();
const userStore = useUserStore();

onMounted(() => {
  const animationContainer = document.getElementById("animation-container");
  const animation = lottie.loadAnimation({
    container: animationContainer,
    renderer: "canvas",
    loop: false, // Set loop to false to play the animation only once
    autoplay: true,
    animationData
  });

  animation.addEventListener("complete", () => {
    const token = userStore.token || localStorage.getItem("jwtToken") || "";

    if (!token) {
      // Ak nemá token, presmerovať na auth-welcome
      router.push({ name: "auth-welcome" });
    } else {
      // Ak má token, presmerovať na donor-posts
      router.push({ name: "donor-posts" });
    }
  });
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
