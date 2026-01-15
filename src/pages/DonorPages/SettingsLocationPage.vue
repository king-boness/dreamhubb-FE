<template>
  <div class="settingsLocation-page">
    <div class="settingsLocation-main">
      <span class="settingsLocation-title">{{ t("changeLocation") }}</span>

      <p v-if="currentLocationLabel" class="settingsLocation-current">
        {{ t("currentLocation") }}: {{ currentLocationLabel }}
      </p>

      <WhereAreYou
        v-model:continent="continent"
        v-model:country="country"
        v-model:city="city"
        :hide-header="true"
        :hide-footer="true"
        :emit-city-id="true"
        :enable-geolocation="false"
      />
    </div>

    <div class="confirmationButton-div">
      <q-btn class="confirmButton" :loading="saving" :disable="!canSave || saving" @click="handleSave">
        {{ t("saveChanges") }}
      </q-btn>
    </div>

    <div class="pageFooter-div">
      <q-btn class="cancelButton" :disable="saving" @click="handleCancel">
        {{ t("cancel") }}
      </q-btn>
    </div>
  </div>
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
  padding: 0 1.2rem;
  padding-bottom: 3rem;
}

.settingsLocation-title {
  font-size: 1.4rem;
  font-family: poppinsSemiBold;
  margin: 1.5rem 0 0.7rem;
  color: white;
  display: block;
}

.settingsLocation-current {
  color: rgba(255, 255, 255, 0.75);
  font-family: poppins;
  margin-bottom: 1rem;
}

.confirmationButton-div {
  display: flex;
  align-items: center;
  justify-content: center;

  .confirmButton {
    background-color: rgba(182, 0, 67, 1);
    color: white;
    border: none;
    font-size: 1.2rem;
    height: 3.3rem;
    border-radius: 0.5rem;
    width: 100%;
    font-family: montseraatSemiBold;
  }
}

.pageFooter-div {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;
  margin-bottom: 2rem;

  .cancelButton {
    background-color: rgba(221, 31, 97, 0.2) !important;
    color: rgb(218, 3, 82) !important;
    font-family: montseraatSemiBold;
    border: none;
    font-size: 1.2rem;
    height: 3.3rem;
    border-radius: 0.5rem;
    width: 100%;
    margin: 0 auto;
  }
}
</style>
