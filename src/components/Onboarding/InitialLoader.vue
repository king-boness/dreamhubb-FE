<template>
  <div class="initial-loader">
    <div class="initial-loader__content">
      <img
        src="/icons/logo.svg"
        alt="dreamhubb"
        class="initial-loader__logo"
      />
      <q-spinner color="white" size="40px" />
      <p class="initial-loader__text">Loading your dream experience…</p>
    </div>
  </div>
</template>

<script setup lang="ts">
// Simple presentational loader used as initial splash
</script>

<style scoped lang="scss">
/* Unified app background shows through */
.initial-loader {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  z-index: 9999;
}

.initial-loader__content {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 1.5rem;
}

.initial-loader__logo {
  width: 120px;
  height: auto;
}

.initial-loader__text {
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}
</style>
