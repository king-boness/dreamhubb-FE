<template>
  <div class="whereAreYou" :class="{ 'whereAreYou--filter-mode': hideHeader && hideFooter }">
    <!-- Back button + Title (hidden if hideHeader is true) -->
    <template v-if="!hideHeader">
      <div class="location-header">
        <button class="location-backBtn" @click="emit('back')">
          <q-icon name="chevron_left" />
        </button>
        <div class="location-progress">
          <span class="location-progress_fill" :style="{ width: progressWidth }"></span>
        </div>
      </div>
      <div class="location-content">
        <h1 class="location-title">{{ title }}</h1>

        <!-- World map illustration -->
        <div class="location-map">
          <img src="/images/Auth/map-image.svg" alt="World Map" />
        </div>

        <!-- Dropdowns -->
        <div class="location-form">
          <q-select
            v-model="localContinent"
            :options="continentOptions"
            label="Choose your continent"
            dark
            outlined
            class="location-select"
            fit
            @update:model-value="handleContinentChange"
          />

          <q-select
            v-model="localCountry"
            :options="countryOptions"
            label="Choose your country"
            dark
            outlined
            class="location-select"
            :disable="!localContinent"
            use-input
            input-debounce="0"
            fit
            @filter="filterCountries"
            @update:model-value="handleCountryChange"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No results
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-select
            v-if="useObjectCityModel"
            v-model="cityModel"
            :options="filteredCityOptions"
            option-label="label"
            label="Choose your city"
            dark
            outlined
            class="location-select"
            :loading="!!(emitCityId && localCountry && cityOptionsLoading)"
            :disable="!localCountry || !!(emitCityId && cityOptionsLoading)"
            use-input
            input-debounce="300"
            fit
            fill-input
            hide-selected
            @filter="filterCities"
            @update:model-value="handleCityChange"
          >
            <template v-slot:option="scope">
              <q-item
                v-if="scope.opt.disabled && scope.opt.value === '__divider__'"
                class="cities-divider"
                :clickable="false"
                v-ripple="false"
              >
                <q-separator />
              </q-item>
              <q-item
                v-else
                v-bind="scope.itemProps"
                v-on="scope.itemEvents || {}"
              >
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No results
                </q-item-section>
              </q-item>
            </template>
          </q-select>

          <q-select
            v-else
            v-model="localCity"
            :options="filteredCityOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            :display-value="localCity ? cityDisplayValue : undefined"
            :loading="!!(emitCityId && localCountry && cityOptionsLoading)"
            label="Choose your city"
            dark
            outlined
            class="location-select"
            :disable="!localCountry || !!(emitCityId && cityOptionsLoading)"
            use-input
            input-debounce="300"
            fit
            fill-input
            hide-selected
            @filter="filterCities"
            @update:model-value="handleCityChange"
          >
            <template v-slot:option="scope">
              <q-item
                v-if="scope.opt.disabled && scope.opt.value === '__divider__'"
                class="cities-divider"
                :clickable="false"
                v-ripple="false"
              >
                <q-separator />
              </q-item>
              <q-item
                v-else
                v-bind="scope.itemProps"
                v-on="scope.itemEvents || {}"
              >
                <q-item-section>
                  <q-item-label>{{ scope.opt.label }}</q-item-label>
                </q-item-section>
              </q-item>
            </template>
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey">
                  No results
                </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
      </div>
    </template>
    <template v-else>
      <div class="location-content">
        <!-- World map illustration -->
      <div class="location-map">
        <img src="/images/Auth/map-image.svg" alt="World Map" />
      </div>

      <!-- Dropdowns -->
      <div class="location-form">
        <q-select
          v-model="localContinent"
          :options="continentOptions"
          label="Choose your continent"
          dark
          outlined
          class="location-select"
          fit
          @update:model-value="handleContinentChange"
        />

        <q-select
          v-model="localCountry"
          :options="countryOptions"
          label="Choose your country"
          dark
          outlined
          class="location-select"
          :disable="!localContinent"
          use-input
          input-debounce="0"
          fit
          @filter="filterCountries"
          @update:model-value="handleCountryChange"
        >
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          v-if="useObjectCityModel"
          v-model="cityModel"
          :options="filteredCityOptions"
          option-label="label"
          label="Choose your city"
          dark
          outlined
          class="location-select"
          :loading="!!(emitCityId && localCountry && cityOptionsLoading)"
          :disable="!localCountry || !!(emitCityId && cityOptionsLoading)"
          use-input
          input-debounce="300"
          fit
          fill-input
          hide-selected
          @filter="filterCities"
          @update:model-value="handleCityChange"
        >
          <template v-slot:option="scope">
            <q-item
              v-if="scope.opt.disabled && scope.opt.value === '__divider__'"
              class="cities-divider"
              :clickable="false"
              v-ripple="false"
            >
              <q-separator />
            </q-item>
            <q-item
              v-else
              v-bind="scope.itemProps"
              v-on="scope.itemEvents || {}"
            >
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>

        <q-select
          v-else
          v-model="localCity"
          :options="filteredCityOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          :display-value="localCity ? cityDisplayValue : undefined"
          :loading="!!(emitCityId && localCountry && cityOptionsLoading)"
          label="Choose your city"
          dark
          outlined
          class="location-select"
          :disable="!localCountry || !!(emitCityId && cityOptionsLoading)"
          use-input
          input-debounce="300"
          fit
          fill-input
          hide-selected
          @filter="filterCities"
          @update:model-value="handleCityChange"
        >
          <template v-slot:option="scope">
            <q-item
              v-if="scope.opt.disabled && scope.opt.value === '__divider__'"
              class="cities-divider"
              :clickable="false"
              v-ripple="false"
            >
              <q-separator />
            </q-item>
            <q-item
              v-else
              v-bind="scope.itemProps"
              v-on="scope.itemEvents || {}"
            >
              <q-item-section>
                <q-item-label>{{ scope.opt.label }}</q-item-label>
              </q-item-section>
            </q-item>
          </template>
          <template v-slot:no-option>
            <q-item>
              <q-item-section class="text-grey">
                No results
              </q-item-section>
            </q-item>
          </template>
        </q-select>
      </div>
      </div>
    </template>

    <!-- Action button (hidden if hideFooter is true) -->
    <template v-if="!hideFooter">
      <button
        class="location-nextBtn"
        @click="handleNext"
        :disabled="!localContinent || !localCountry"
      >
        {{ nextButtonLabel }}
      </button>
    </template>

    <!-- Geolocation Permission Dialog (only show if enableGeolocation is true) -->
    <q-dialog
      v-model="showGeolocationDialog"
      persistent
      v-if="enableGeolocation"
      no-focus
      no-refocus
    >
      <q-card class="geolocation-dialog">
        <q-card-section>
          <div class="text-h6">Enable Location Services</div>
        </q-card-section>

        <q-card-section class="q-pt-none">
          <p>Would you like to automatically fill in your location based on your current position?</p>
        </q-card-section>

        <q-card-actions align="right">
          <q-btn flat label="No, thanks" color="primary" @click="handleGeolocationDeny" />
          <q-btn flat label="Allow" color="primary" @click="handleGeolocationAllow" />
        </q-card-actions>
      </q-card>
    </q-dialog>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, watch, withDefaults } from "vue";
import { notifyError, notifySuccess } from "src/utils/notify";
import { api } from "boot/axios";
import { continents, getCountriesByContinent, getAllCountries } from "src/data/countriesData";
import { getCitiesByCountryCode, buildCityOptionsForCountry, CityOption, CityFromBackend } from "src/data/citiesData";
import { useGeolocation } from "src/composables/useGeolocation";
import { useAuthStore } from "src/stores/auth";

const props = withDefaults(defineProps<{
  continent?: string;
  country?: string;
  city?: string | number; // Can be string (name) or number (id) depending on emitCityId
  progress?: number; // Progress percentage (0-100), defaults to 80 for onboarding
  title?: string; // Custom title, defaults to "you live in"
  nextButtonLabel?: string; // Custom next button label, defaults to "NEXT STEP"
  enableGeolocation?: boolean; // Enable geolocation dialog, defaults to true
  hideHeader?: boolean; // Hide header (back button + title), defaults to false
  hideFooter?: boolean; // Hide footer (CTA buttons), defaults to false
  emitCityId?: boolean; // If true, emit city ID instead of name, defaults to false
  cityDisplayFallback?: string; // Optional: label to show while city options are still loading
  cityModelMode?: "value" | "object"; // 'object' prevents 1-frame ID flash by not binding raw numeric id to QSelect model
}>(), {
  continent: "",
  country: "",
  city: "",
  emitCityId: false,
  cityDisplayFallback: "",
  cityModelMode: "value"
});

const emit = defineEmits<{
  "update:continent": [value: string];
  "update:country": [value: string];
  "update:city": [value: string | number];
  next: [];
  back: [];
}>();

const authStore = useAuthStore();

const localContinent = ref(props.continent || "");
const localCountry = ref(props.country || "");
// Initialize with the prop value, but allow it to be number (ID) or string (name)
const localCity = ref<string | number>(props.city ? (typeof props.city === "string" && !isNaN(Number(props.city)) ? Number(props.city) : props.city) : "");
const useObjectCityModel = computed(() => props.cityModelMode === "object");

// Object-mode city model (so QSelect never receives raw numeric id)
const localCityId = ref<number | null>(null);
const cityModel = ref<CityOption | null>(null);

const normalizeNumericId = (v: unknown): number | null => {
  if (typeof v === "number" && Number.isFinite(v)) return v;
  if (typeof v === "string" && v.trim() !== "" && !isNaN(Number(v))) return Number(v);
  return null;
};

const initCityModelFromFallback = () => {
  if (!useObjectCityModel.value) return;
  const id = localCityId.value;
  const label = (props.cityDisplayFallback || authStore.user?.location_city_name || authStore.user?.location_city || "").trim();
  if (id && label) {
    // IMPORTANT: Use an option object that is present in the QSelect options list
    // so Quasar never falls back to rendering the raw numeric id.
    const opt: CityOption = { label, value: id };
    cityModel.value = opt;

    // If options are not loaded yet, seed the options list with the placeholder option.
    // This guarantees label rendering from the very first paint.
    const alreadyInList = allCitiesForCountry.value.some((o) => o.value === id && !o.disabled);
    if (!alreadyInList) {
      allCitiesForCountry.value = [opt, ...allCitiesForCountry.value];
      filteredCityOptions.value = [opt, ...filteredCityOptions.value];
    }
  } else {
    cityModel.value = null; // show placeholder, never raw number
  }
};

const rehydrateCityModelFromOptions = () => {
  if (!useObjectCityModel.value) return;
  const id = localCityId.value;
  if (!id) {
    cityModel.value = null;
    return;
  }
  const found = allCitiesForCountry.value.find((o) => o.value === id && o.value !== "__divider__" && !o.disabled);
  if (found) {
    cityModel.value = found;
    return;
  }
  initCityModelFromFallback();
};

const progressWidth = computed(() => {
  return `${props.progress ?? 80}%`;
});

const title = computed(() => props.title ?? "you live in");
const nextButtonLabel = computed(() => props.nextButtonLabel ?? "NEXT STEP");
const enableGeolocation = computed(() => props.enableGeolocation ?? true);

// Geolocation
const showGeolocationDialog = ref(false);
const hasAskedForGeolocation = ref(false);
const { getCurrentLocation } = useGeolocation();

// Options
const continentOptions = continents;

// Country options with filtering
const allCountriesForContinent = ref<string[]>([]);
const countryOptions = ref<string[]>([]);
const countryFilter = ref("");

// City options with filtering
// Use CityOption[] from buildCityOptionsForCountry
const allCitiesForCountry = ref<CityOption[]>([]);
const filteredCityOptions = ref<CityOption[]>([]);
const cityFilter = ref("");
const citiesFromBackend = ref<CityFromBackend[]>([]); // Cities with IDs from BE
const countryIdForCities = ref<number | null>(null); // Store country ID for fetching cities
const cityOptionsLoading = ref(false);

const getHttpStatus = (err: unknown): number | null => {
  if (!err || typeof err !== "object") return null;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const e = err as any;
  const status = e?.response?.status;
  return typeof status === "number" ? status : null;
};

const selectedCityLabel = computed(() => {
  const val = localCity.value;
  if (val === "" || val === null || val === undefined) return "";
  const found = allCitiesForCountry.value.find((o) => o.value === val);
  return found?.label ?? "";
});

const cityLabel = computed(() => {
  // Prefer label from loaded options; fallback to user/profile label (for settings page) while options are loading.
  // Never return raw ID.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const legacyCity = (authStore.user as any)?.location_city as string | undefined;
  return (
    selectedCityLabel.value ||
    // Most reliable on settings page immediately after loading /api/user
    authStore.user?.location_city_name ||
    legacyCity ||
    props.cityDisplayFallback ||
    ""
  );
});

const cityDisplayValue = computed(() => {
  if (useObjectCityModel.value) {
    // Object mode: Quasar will render the label from the model object; keep display-value empty.
    // (Returning empty here avoids any chance of rendering raw id.)
    return "";
  }

  // Value mode: Ensure we never show raw ID (e.g., "6") while options are loading.
  if (!localCity.value) return "";
  return cityLabel.value || "Choose your city";
});

// Get country code from country name
const getCountryCode = (countryName: string): string | undefined => {
  const allCountries = getAllCountries();
  const country = allCountries.find(c => c.name === countryName);
  return country?.code;
};

// Update country options when continent changes
const updateCountryOptions = () => {
  if (!localContinent.value) {
    allCountriesForContinent.value = [];
    countryOptions.value = [];
    return;
  }

  const countries = getCountriesByContinent(localContinent.value);
  allCountriesForContinent.value = countries.map(c => c.name);
  countryOptions.value = allCountriesForContinent.value;
};

// Update city options when country changes
const updateCityOptions = async () => {
  if (!localCountry.value) {
    allCitiesForCountry.value = [];
    filteredCityOptions.value = [];
    citiesFromBackend.value = [];
    countryIdForCities.value = null;
    cityOptionsLoading.value = false;
    if (useObjectCityModel.value) cityModel.value = null;
    return;
  }

  // If emitCityId is true, fetch cities with IDs from BE
  if (props.emitCityId) {
    // BE resolver needs continent+country names; if continent is missing, skip BE and fall back.
    // This also prevents noisy 400s when props set country without continent.
    if (!localContinent.value) {
      const countryCode = getCountryCode(localCountry.value);
      if (countryCode) {
        const cities = getCitiesByCountryCode(countryCode);
        const citiesMapped: CityFromBackend[] = cities.map((name: string) => ({
          id: name,
          name
        }));
        citiesFromBackend.value = citiesMapped;
        const cityOptions = buildCityOptionsForCountry(countryCode, citiesMapped);
        allCitiesForCountry.value = cityOptions;
        filteredCityOptions.value = cityOptions;
        rehydrateCityModelFromOptions();
      } else {
        allCitiesForCountry.value = [];
        filteredCityOptions.value = [];
        citiesFromBackend.value = [];
      }
      return;
    }

    cityOptionsLoading.value = true;
    try {
      // First, get country_id from country name
      const { data: locationData } = await api.get("/locations/ids", {
        params: {
          continent: localContinent.value,
          country: localCountry.value
        }
      });

      if (locationData.status === "success" && locationData.location_ids?.country_id) {
        const countryId = locationData.location_ids.country_id;
        countryIdForCities.value = countryId;

        // Fetch cities with IDs from BE (scope=all to show all cities, deduplicated)
        const { data: citiesData } = await api.get("/locations/cities", {
          params: { country_id: countryId, scope: "all" }
        });

        if (citiesData.status === "success" && citiesData.cities) {
          const citiesMapped: CityFromBackend[] = citiesData.cities.map((c: { id: number; name: string }) => ({
            id: c.id,
            name: c.name
          }));
          citiesFromBackend.value = citiesMapped;

          // Get country code for buildCityOptionsForCountry
          const countryCode = getCountryCode(localCountry.value);
          if (countryCode) {
            const cityOptions = buildCityOptionsForCountry(countryCode, citiesMapped);
            allCitiesForCountry.value = cityOptions;
            filteredCityOptions.value = cityOptions;
            rehydrateCityModelFromOptions();
          }
        }
      }
    } catch (error) {
      const status = getHttpStatus(error);
      // 400 here usually means the DB doesn't contain the given continent/country yet.
      // Treat it as an expected "fallback to static list" case (avoid noisy console errors).
      if (import.meta.env.DEV) {
        if (status && status !== 400) {
          console.debug("Failed to fetch cities with IDs:", error);
        } else {
          // eslint-disable-next-line no-console
          console.debug("[WhereAreYou] Falling back to static cities list (no BE location match).", {
            status,
            continent: localContinent.value,
            country: localCountry.value
          });
        }
      }
      // Fallback to static data
      const countryCode = getCountryCode(localCountry.value);
      if (countryCode) {
        const cities = getCitiesByCountryCode(countryCode);
        // Convert string array to CityFromBackend format
        const citiesMapped: CityFromBackend[] = cities.map((name: string) => ({
          id: name,
          name
        }));
        citiesFromBackend.value = citiesMapped;
        const cityOptions = buildCityOptionsForCountry(countryCode, citiesMapped);
        allCitiesForCountry.value = cityOptions;
        filteredCityOptions.value = cityOptions;
        rehydrateCityModelFromOptions();
      }
    } finally {
      cityOptionsLoading.value = false;
    }
  } else {
    // Backward compatibility: use static data
    const countryCode = getCountryCode(localCountry.value);
    if (countryCode) {
      const cities = getCitiesByCountryCode(countryCode);
      // Convert string array to CityFromBackend format
      const citiesMapped: CityFromBackend[] = cities.map((name: string) => ({
        id: name,
        name
      }));
      citiesFromBackend.value = citiesMapped;
      const cityOptions = buildCityOptionsForCountry(countryCode, citiesMapped);
      allCitiesForCountry.value = cityOptions;
      filteredCityOptions.value = cityOptions;
      rehydrateCityModelFromOptions();
    } else {
      allCitiesForCountry.value = [];
      filteredCityOptions.value = [];
      citiesFromBackend.value = [];
    }
  }
};

// Filter countries
const filterCountries = (val: string, update: (callback: () => void) => void) => {
  countryFilter.value = val;
  update(() => {
    if (val === "") {
      countryOptions.value = allCountriesForContinent.value;
    } else {
      const needle = val.toLowerCase();
      countryOptions.value = allCountriesForContinent.value.filter(
        v => v.toLowerCase().indexOf(needle) > -1
      );
    }
  });
};

// Filter cities
const filterCities = (val: string, update: (callback: () => void) => void) => {
  cityFilter.value = val;
  update(() => {
    if (val === "") {
      filteredCityOptions.value = allCitiesForCountry.value;
    } else {
      const needle = val.toLowerCase();
      // Filter out dividers and match city labels
      filteredCityOptions.value = allCitiesForCountry.value.filter(
        (item) => {
          // Skip disabled dividers
          if (item.disabled && item.value === "__divider__") {
            return false;
          }
          // Filter by label
          return item.label.toLowerCase().includes(needle);
        }
      );
    }
  });
};

// Handle continent change
const handleContinentChange = () => {
  localCountry.value = "";
  localCity.value = "";
  if (useObjectCityModel.value) {
    localCityId.value = null;
    cityModel.value = null;
  }
  updateCountryOptions();
  updateCityOptions();
};

// Handle country change
const handleCountryChange = () => {
  localCity.value = "";
  if (useObjectCityModel.value) {
    localCityId.value = null;
    cityModel.value = null;
  }
  updateCityOptions();
};

// Handle city change - prevent selecting divider
const handleCityChange = (value: unknown) => {
  if (useObjectCityModel.value) {
    const opt = value as CityOption | null;
    if (opt?.value === "__divider__") {
      cityModel.value = null;
      localCityId.value = null;
      return;
    }
    cityModel.value = opt;
    localCityId.value = typeof opt?.value === "number" ? opt.value : null;
    return;
  }

  const v = value as string | number;
  if (v === "__divider__") {
    // Ignore divider selection
    localCity.value = "";
    return;
  }
  localCity.value = v;
};

// Handle next
const handleNext = () => {
  emit("update:continent", localContinent.value);
  emit("update:country", localCountry.value);
  emit("update:city", useObjectCityModel.value ? (localCityId.value ?? "") : localCity.value);
  emit("next");
};

// Geolocation handlers
const handleGeolocationAllow = async () => {
  showGeolocationDialog.value = false;
  hasAskedForGeolocation.value = true;

  try {
    const locationData = await getCurrentLocation();
    if (locationData) {
      localContinent.value = locationData.continent;
      updateCountryOptions();

      // Find matching country name
      if (locationData.country) {
        const allCountries = getAllCountries();
        const matchingCountry = allCountries.find(
          c => c.name === locationData.country || c.code === locationData.countryCode
        );
        if (matchingCountry) {
          localCountry.value = matchingCountry.name;
          updateCityOptions();
        }
      }

      // Set city if available
      if (locationData.city) {
        if (useObjectCityModel.value) {
          localCityId.value = normalizeNumericId(locationData.city);
          cityModel.value = null;
          initCityModelFromFallback();
          rehydrateCityModelFromOptions();
        } else {
          localCity.value = locationData.city;
        }
      }

      notifySuccess("common.success.locationAutoFilled", "Location filled automatically. You can still edit it if needed.", { position: "top" });
    }
  } catch (error) {
    notifyError({
      kind: "server",
      messageKey: "common.errors.server",
      fallbackMessage: "Failed to get your location. Please select manually.",
      retryable: true
    }, { position: "top" });
  }
};

const handleGeolocationDeny = () => {
  showGeolocationDialog.value = false;
  hasAskedForGeolocation.value = true;
};

// Show geolocation dialog on mount
onMounted(() => {
  if (useObjectCityModel.value) {
    localCityId.value = normalizeNumericId(props.city);
    // Keep value-model empty so QSelect never receives raw numeric id on first render
    localCity.value = "";
    initCityModelFromFallback();
  }

  updateCountryOptions();
  updateCityOptions();

  // Check if we should ask for geolocation
  if (enableGeolocation.value && !hasAskedForGeolocation.value && !localContinent.value && !localCountry.value) {
    // Small delay to let the component render first
    setTimeout(() => {
      showGeolocationDialog.value = true;
    }, 500);
  }
});

// Watch for prop changes
watch(() => props.continent, (newVal) => {
  if (newVal !== localContinent.value) {
    localContinent.value = newVal;
    updateCountryOptions();
  }
});

watch(() => props.country, (newVal) => {
  if (newVal !== localCountry.value) {
    localCountry.value = newVal;
    updateCityOptions();
  }
});

watch(() => props.city, (newVal) => {
  if (useObjectCityModel.value) {
    localCityId.value = normalizeNumericId(newVal);
    localCity.value = "";
    initCityModelFromFallback();
    rehydrateCityModelFromOptions();
    return;
  }

  if (newVal !== localCity.value) {
    localCity.value = newVal;
  }
});

// Watch local values and emit updates immediately (for filters page validation)
watch(localContinent, (newVal) => {
  emit("update:continent", newVal);
});

watch(localCountry, (newVal) => {
  emit("update:country", newVal);
});

watch(localCity, (newVal) => {
  if (!useObjectCityModel.value) {
    emit("update:city", newVal);
  }
});

watch(localCityId, (newVal) => {
  if (useObjectCityModel.value) {
    emit("update:city", newVal ?? "");
  }
});
</script>

<style lang="scss" scoped>
.whereAreYou {
  width: 100%;
  max-width: 390px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 24px 20px 40px;
  margin: 0 auto;
  background: radial-gradient(circle at top, #0b001c 0%, #05000e 40%, #010006 100%);
  overflow: hidden;
  position: relative;

  // When used in filters (hide-header and hide-footer), remove padding and background
  &.whereAreYou--filter-mode {
    padding: 0;
    margin: 0;
    background: transparent;
    height: 100%;
    max-width: 100%;
  }
}

.location-header {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  flex-shrink: 0;
  position: relative;
}

.location-backBtn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
  }

  .q-icon {
    font-size: 24px;
    color: #ffffff;
  }
}

.location-progress {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  max-width: calc(100% - 120px);
  height: 3px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 18px;
}

.location-progress_fill {
  display: block;
  height: 100%;
  background: #BD0043;
  transition: width 0.3s ease;
}

.location-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 0;
  min-height: 0;
  overflow: hidden;
  position: relative;
  gap: 0;
  padding-top: 0;

  // In filter mode, use flex-start for step 3 layout
  .whereAreYou--filter-mode & {
    justify-content: flex-start;
    padding-top: 0;
    gap: 0;
  }
}

.location-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 2rem 0;
  text-align: center;
  flex-shrink: 0;
  line-height: 1.2;
}

.location-map {
  width: 100%;
  margin: 0 0 2rem 0;
  opacity: 0.7;
  flex-shrink: 0;

  img {
    width: 100%;
    height: auto;
    object-fit: contain;
  }
}

.location-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
  margin: 0;
  margin-top: auto;
  margin-bottom: auto;
  flex-shrink: 0;
}

.location-select {
  position: relative;
  z-index: 1;
  width: 100%;

  :deep(.q-field__control) {
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    height: 48px;
    color: #ffffff;
  }

  :deep(.q-field) {
    width: 100%;
  }

  :deep(.q-menu) {
    margin-top: 4px !important;
    max-width: 100% !important;
    min-width: 100% !important;
    width: 100% !important;
    transition: opacity 0.01s ease, transform 0.01s ease !important;
    animation: none !important;
  }

  :deep(.q-select__dropdown-icon) {
    transition: transform 0.01s ease !important;
  }

  :deep(.q-field__control) {
    transition: background-color 0.01s ease !important;
  }

  :deep(.q-item) {
    transition: background-color 0.01s ease !important;
  }

  :deep(.q-field__marginal) {
    z-index: 1;
  }

  :deep(.q-field__native) {
    width: 100%;
  }

  :deep(.q-field__label) {
    color: rgba(255, 255, 255, 0.6);
  }

  :deep(.q-field__native) {
    color: #ffffff;
  }

  :deep(.q-icon) {
    color: rgba(255, 255, 255, 0.6);
  }

  :deep(.cities-divider) {
    padding: 0.5rem 0;
    min-height: auto;
    cursor: default;

    .q-separator {
      margin: 0.5rem 0;
      background-color: rgba(255, 255, 255, 0.2);
    }
  }
}

.location-instruction {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  text-align: center;
}

.location-nextBtn {
  width: 100%;
  height: 56px;
  border-radius: 9999px;
  background: #BD0043;
  border: none;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  margin-top: 0;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 8px 24px rgba(189, 0, 67, 0.3);
  flex-shrink: 0;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(189, 0, 67, 0.4);
  }
}

.geolocation-dialog {
  background: radial-gradient(circle at top, #0b001c 0%, #05000e 40%, #010006 100%);
  color: #ffffff;
  min-width: 300px;

  :deep(.q-card__section) {
    color: #ffffff;
  }

  :deep(.q-btn) {
    color: #BD0043;
  }
}
</style>
