<template>
  <q-layout view="lHh Lpr lFf" class="onboardingLayout">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// Empty script - layout only
</script>

<style lang="scss" scoped>
/* Unified app background (iosSafeArea.scss) */
.onboardingLayout {
  background: transparent;
  min-height: 100vh;
}

:deep(.q-page-container) {
  padding: 0;
  background: transparent;
}
</style>
