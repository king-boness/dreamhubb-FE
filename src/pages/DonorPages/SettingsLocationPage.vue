<template>
  <q-page class="settingsLocation-page">
    <div class="settingsLocation-container">
      <div class="settingsLocation-header">
        <div class="settingsLocation-title">{{ t("changeLocation") }}</div>
        <div v-if="currentLocationLabel" class="settingsLocation-current">
          {{ t("currentLocation") }}: {{ currentLocationLabel }}
        </div>
      </div>

      <q-card class="settingsLocation-card" flat bordered>
        <q-card-section class="settingsLocation-cardSection">
          <WhereAreYou
            v-model:continent="continent"
            v-model:country="country"
            v-model:city="city"
            :hide-header="true"
            :hide-footer="true"
            :emit-city-id="true"
            :enable-geolocation="false"
            :city-display-fallback="currentCityName"
          />
        </q-card-section>
      </q-card>

      <div class="settingsLocation-actions">
        <q-btn
          class="confirmButton full-width"
          :loading="saving"
          :disable="!canSave || saving"
          @click="handleSave"
        >
          {{ t("saveChanges") }}
        </q-btn>
        <q-btn class="cancelButton full-width" :disable="saving" flat @click="handleCancel">
          {{ t("cancel") }}
        </q-btn>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { api } from "boot/axios";
import { useAuthStore } from "src/stores/auth";
import WhereAreYou from "src/components/Onboarding/WhereAreYou.vue";
import { getLocationLabel } from "src/utils/cityNames";
import { useI18n } from "vue-i18n";

const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore();
const { t, locale } = useI18n();

const saving = ref(false);

const continent = ref<string>("");
const country = ref<string>("");
const city = ref<string | number>("");

const currentLocationLabel = computed(() => {
  return authStore.user ? getLocationLabel(authStore.user, locale.value as string) : "";
});

const currentCityName = computed(() => {
  // Prefer explicit name from BE if present; fall back to legacy fields
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (authStore.user as any)?.location_city_name || authStore.user?.location_city || "";
});

const canSave = computed(() => {
  // City is required (emitCityId => number)
  return !!(continent.value && country.value && city.value !== "" && city.value !== null);
});

onMounted(async () => {
  if (!authStore.user && authStore.isAuthenticated) {
    try {
      await authStore.fetchUser();
    } catch {
      // ignore
    }
  }

  // Initialize with current user location (names + city_id)
  continent.value = authStore.user?.location_continent || "";
  country.value = authStore.user?.location_country || "";
  city.value = authStore.user?.location_city_id ?? "";
});

const handleSave = async () => {
  if (!canSave.value || saving.value) return;
  saving.value = true;

  try {
    // Resolve continent_id + country_id from names (BE endpoint)
    const { data } = await api.get("/locations/ids", {
      params: {
        continent: continent.value,
        country: country.value,
        city: null // we already have city id
      }
    });

    if (data?.status !== "success" || !data?.location_ids?.continent_id || !data?.location_ids?.country_id) {
      throw new Error("Failed to resolve location IDs");
    }

    await authStore.updateProfile({
      location_continent_id: data.location_ids.continent_id,
      location_country_id: data.location_ids.country_id,
      location_city_id: Number(city.value)
    });

    // Refresh user data to get updated location_*_name fields from BE
    await authStore.fetchUser();

    $q.notify({
      type: "positive",
      message: t("locationUpdated"),
      position: "top"
    });

    router.back();
  } catch (e) {
    $q.notify({
      type: "negative",
      message: t("locationUpdateFailed"),
      position: "top"
    });
  } finally {
    saving.value = false;
  }
};

const handleCancel = () => {
  router.back();
};
</script>

<style scoped lang="scss">
.settingsLocation-page {
  padding: 16px;
}

.settingsLocation-container {
  max-width: 520px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding-bottom: calc(24px + env(safe-area-inset-bottom, 0px));
}

.settingsLocation-header {
  display: flex;
  flex-direction: column;
  gap: 6px;
}

.settingsLocation-title {
  font-size: 1.2rem;
  font-family: poppinsSemiBold;
  color: white;
}

.settingsLocation-current {
  color: rgba(255, 255, 255, 0.75);
  font-family: poppins;
}

.settingsLocation-card {
  background: rgba(0, 0, 0, 0.25);
  border-radius: 14px;
}

.settingsLocation-cardSection {
  padding: 12px;
}

/* Tame the onboarding component so it doesn't feel "stretched" on settings page */
:deep(.whereAreYou-container) {
  padding: 0 !important;
}

:deep(.whereAreYou-map),
:deep(.whereAreYou-image),
:deep(.whereAreYou-visual) {
  max-height: 140px;
  overflow: hidden;
  border-radius: 12px;
}

:deep(.q-field) {
  margin-top: 10px;
}

.settingsLocation-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.confirmButton {
  background-color: rgba(182, 0, 67, 1);
  color: white;
  border: none;
  font-size: 1.05rem;
  height: 3.15rem;
  border-radius: 0.75rem;
  font-family: montseraatSemiBold;
}

.cancelButton {
  background-color: rgba(221, 31, 97, 0.2) !important;
  color: rgb(218, 3, 82) !important;
  font-family: montseraatSemiBold;
  font-size: 1.05rem;
  height: 3.15rem;
  border-radius: 0.75rem;
}
</style>
