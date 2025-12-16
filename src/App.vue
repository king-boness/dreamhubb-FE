<template>
  <InitialLoader v-if="appStore.isInitializing" />
  <NoConnection v-else-if="!networkStore.isOnline" />
  <router-view v-else />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";
import { useQuasar } from "quasar";
import { useAuthStore } from "src/stores/auth";
import { useAppStore } from "src/stores/app";
import { useNetworkStore } from "src/stores/network";
import InitialLoader from "src/components/Onboarding/InitialLoader.vue";
import NoConnection from "src/components/common/NoConnection.vue";

const $q = useQuasar();
$q.dark.set(true);

const authStore = useAuthStore();
const appStore = useAppStore();
const networkStore = useNetworkStore();

// Sync initial online status
if (typeof navigator !== "undefined") {
  networkStore.setOnline(navigator.onLine);
}

const handleOnline = () => {
  networkStore.setOnline(true);
};

const handleOffline = () => {
  networkStore.setOnline(false);
};

// Inicializácia appky a auth stavu pri štarte
onMounted(async () => {
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Initialize global app state (auth + preferences, etc.)
  await appStore.initializeApp();

  // Ensure axios has the latest token after reload
  const token = authStore.token;
  if (token) {
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore
    import("src/boot/axios").then((mod) => {
      const { api } = mod;
      api.defaults.headers.common.Authorization = `Bearer ${token}`;
    });
  }
});

onBeforeUnmount(() => {
  window.removeEventListener("online", handleOnline);
  window.removeEventListener("offline", handleOffline);
});
</script>
