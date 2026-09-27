<template>
  <q-page class="doneeMyProfilePage" :padding="false">
    <div v-if="loadError" class="myProfilePage-error">
      <div class="myProfilePage-errorText">{{ loadError }}</div>
      <q-btn
        class="myProfilePage-retryBtn"
        unelevated
        no-caps
        color="primary"
        :disable="authStore.loading"
        @click="handleRetry"
      >
        {{ retryLabel }}
      </q-btn>
    </div>
    <MyProfileFilterComponent />
  </q-page>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "src/stores/auth";
import MyProfileFilterComponent from "src/components/doneeComponents/MyProfileFilterComponent.vue";
import { mapAxiosErrorToDhError } from "src/utils/httpError";
import { tGlobal } from "src/utils/i18nGlobal";

const authStore = useAuthStore();
const { t } = useI18n();

const loadError = ref<string | null>(null);
const retryLabel = computed(() => {
  const label = t("common.actions.retry");
  return label === "common.actions.retry" ? "Retry" : label;
});

onMounted(async () => {
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      loadError.value = null;
      await authStore.fetchUser();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.debug("Failed to fetch user data:", error);
      }
      const mapped = mapAxiosErrorToDhError(error);
      loadError.value = tGlobal(mapped.messageKey, mapped.fallbackMessage);
    }
  }
});

const handleRetry = async () => {
  if (!authStore.isAuthenticated) return;
  loadError.value = null;
  try {
    await authStore.fetchUser();
  } catch (error) {
    const mapped = mapAxiosErrorToDhError(error);
    loadError.value = tGlobal(mapped.messageKey, mapped.fallbackMessage);
  }
};
</script>
<style scoped lang="scss">
.doneeMyProfilePage {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}

.myProfilePage-error {
  width: calc(100% - 2rem);
  margin: 1rem auto 0.75rem;
  padding: 0.85rem 0.9rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
}

.myProfilePage-errorText {
  font-family: poppins;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.75);
}

.myProfilePage-retryBtn {
  margin-top: 0.6rem;
}
</style>
