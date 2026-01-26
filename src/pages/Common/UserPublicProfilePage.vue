<template>
  <q-page class="publicProfile">
    <div v-if="loading" class="publicProfile__state">
      <q-spinner color="primary" size="32px" />
      <div class="state-label">Loading profile...</div>
    </div>

    <div v-else-if="error" class="publicProfile__state">
      <div class="state-label">{{ error }}</div>
      <div class="publicProfile__actions">
        <q-btn flat color="primary" @click="goBack">Go back</q-btn>
        <q-btn
          unelevated
          no-caps
          color="primary"
          :disable="loading"
          @click="handleRetry"
        >
          {{ retryLabel }}
        </q-btn>
      </div>
    </div>

    <div v-else-if="userData">
      <!-- Tabs (same as my profile) -->
      <PublicProfileFilterComponent :user-data="userData" />
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { api } from "boot/axios";
import { useAuthStore } from "src/stores/auth";
import PublicProfileFilterComponent from "src/components/partials/PublicProfileFilterComponent.vue";
import { mapAxiosErrorToDhError } from "src/utils/httpError";
import { tGlobal } from "src/utils/i18nGlobal";

interface PublicUser {
  id: number;
  username?: string;
  name?: string;
  email?: string;
  bio?: string | null;
  profile_picture?: string | null;
  tokens?: number;
  posts_count?: number;
  followers_count?: number;
  following_count?: number;
  selected_badge?: string | null;
  role?: string;
  location_city?: string | null;
  location_country?: string | null;
  location_continent?: string | null;
}

const route = useRoute();
const router = useRouter();
const authStore = useAuthStore();
const { t } = useI18n();

const loading = ref(true);
const error = ref<string | null>(null);
const userData = ref<PublicUser | null>(null);
const retryLabel = computed(() => {
  const label = t("common.actions.retry");
  return label === "common.actions.retry" ? "Retry" : label;
});

const goBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    const side = route.path.includes("/donee/") ? "donee" : "donor";
    router.push({ name: `${side}-posts` });
  }
};

const fetchUser = async (id: number) => {
  loading.value = true;
  error.value = null;
  try {
    const { data } = await api.get(`/user/${id}`);
    userData.value = data.user || data || null;
    if (!userData.value) {
      throw new Error("User not found");
    }
  } catch (err: unknown) {
    if (import.meta.env.DEV) {
      console.debug("Error fetching user profile:", err);
    }
    const mapped = mapAxiosErrorToDhError(err);
    error.value = tGlobal(mapped.messageKey, mapped.fallbackMessage);
    userData.value = null;
  } finally {
    loading.value = false;
  }
};

const handleRetry = async () => {
  const userId = Number(route.params.userId);
  if (Number.isNaN(userId)) return;
  await fetchUser(userId);
};

onMounted(async () => {
  const userId = Number(route.params.userId);
  if (Number.isNaN(userId)) {
    error.value = tGlobal("common.errors.validation", "Please check your input and try again.");
    loading.value = false;
    return;
  }

  // If viewing own profile, redirect to existing myprofile route
  if (authStore.user?.id === userId) {
    const side = route.path.includes("/donee/") ? "donee" : "donor";
    router.replace({ name: `${side}-myprofile` });
    return;
  }

  await fetchUser(userId);
});
</script>

<style scoped lang="scss">
.publicProfile {
  min-height: 100vh;
}

.publicProfile__state {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  padding-top: 64px;
  color: #fff;
}

.publicProfile__actions {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 4px;
}

.state-label {
  font-weight: 600;
  color: #fff;
}

</style>
