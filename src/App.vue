<template>
  <InitialLoader v-if="appStore.isInitializing" />
  <router-view v-else />
  <OfflineBanner />
  <DevNetStatus />
  <ImagePickIosMenu />
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount } from "vue";
import { useQuasar } from "quasar";
import { useAuthStore } from "src/stores/auth";
import { useAppStore } from "src/stores/app";
import { useNetworkStore } from "src/stores/network";
import InitialLoader from "src/components/Onboarding/InitialLoader.vue";
import OfflineBanner from "src/components/common/OfflineBanner.vue";
import DevNetStatus from "src/components/common/DevNetStatus.vue";
import ImagePickIosMenu from "src/components/common/ImagePickIosMenu.vue";

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

onMounted(() => {
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  void (async () => {
    try {
      await appStore.initializeApp();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.debug("[App] initializeApp failed:", error);
      }
      appStore.setInitializingApp(false);
    }

    const token = authStore.token;
    if (token) {
      try {
        const mod = await import("src/boot/axios");
        mod.api.defaults.headers.common.Authorization = `Bearer ${token}`;
      } catch {
        // ignore
      }
    }
  })();
});

onBeforeUnmount(() => {
  window.removeEventListener("online", handleOnline);
  window.removeEventListener("offline", handleOffline);
});
</script>
