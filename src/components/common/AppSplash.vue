<template>
  <div class="app-splash">
    <div class="app-splash_animation" ref="animationContainer"></div>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import lottie from "lottie-web";
import animationData from "src/assets/Auth/splash-dark.json";

const animationContainer = ref<HTMLElement | null>(null);

onMounted(() => {
  if (animationContainer.value) {
    lottie.loadAnimation({
      container: animationContainer.value,
      renderer: "canvas",
      loop: true, // Loop for loading state
      autoplay: true,
      animationData
    });
  }
});
</script>

<style lang="scss" scoped>
.app-splash {
  display: flex;
  justify-content: center;
  align-items: center;
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important; max-width: 100%;
  height: 100vh !important;
  min-height: 100vh !important;
  background-color: #0f0026;
  margin: 0 !important;
  padding: 0 !important;
  z-index: 99999 !important;
  overflow: hidden !important;
}

.app-splash_animation {
  width: 100%;
  max-width: 400px;
  height: auto;
}
</style>
