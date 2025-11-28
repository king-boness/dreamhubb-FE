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
.onboardingLayout {
  background: radial-gradient(circle at top, #0b001c 0%, #05000e 40%, #010006 100%);
  min-height: 100vh;
}

:deep(.q-page-container) {
  padding: 0;
  background: transparent;
}
</style>
