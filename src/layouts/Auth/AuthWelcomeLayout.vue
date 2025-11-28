<template>
  <q-layout view="hHh lpR fFf" class="authWelcomeLayout">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
// Simple layout wrapper for auth welcome page
</script>

<style lang="scss" scoped>
.authWelcomeLayout {
  background: transparent;
}

:deep(.q-page-container) {
  padding: 0;
}
</style>
