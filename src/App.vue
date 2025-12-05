<template>
  <router-view />
</template>

<script setup lang="ts">
import { onMounted } from "vue";
import { useQuasar } from "quasar";
import { useAuthStore } from "src/stores/auth";

const $q = useQuasar();
$q.dark.set(true);

const auth = useAuthStore();

// Inicializácia usera pri štarte appky
onMounted(() => {
  if (auth.token) {
    auth.fetchUser().catch(() => {
      auth.logout();
    });
  }
});
</script>
