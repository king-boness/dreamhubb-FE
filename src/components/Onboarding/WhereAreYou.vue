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
            v-model="localCity"
            :options="filteredCityOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            :display-value="localCity && selectedCityLabel ? selectedCityLabel : undefined"
            :loading="!!(emitCityId && localCountry && cityOptionsLoading)"
            label="Choose your city"
            dark
            outlined
            class="location-select"
            :disable="!localCountry"
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
          v-model="localCity"
          :options="filteredCityOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          :display-value="localCity && selectedCityLabel ? selectedCityLabel : undefined"
          :loading="!!(emitCityId && localCountry && cityOptionsLoading)"
          label="Choose your city"
          dark
          outlined
          class="location-select"
          :disable="!localCountry"
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
import { Notify } from "quasar";
import { api } from "boot/axios";
import { continents, getCountriesByContinent, getAllCountries } from "src/data/countriesData";
import { getCitiesByCountryCode, buildCityOptionsForCountry, CityOption, CityFromBackend } from "src/data/citiesData";
import { useGeolocation } from "src/composables/useGeolocation";

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
}>(), {
  continent: "",
  country: "",
  city: "",
  emitCityId: false
});

const emit = defineEmits<{
  "update:continent": [value: string];
  "update:country": [value: string];
  "update:city": [value: string | number];
  next: [];
  back: [];
}>();

const localContinent = ref(props.continent || "");
const localCountry = ref(props.country || "");
// Initialize with the prop value, but allow it to be number (ID) or string (name)
const localCity = ref<string | number>(props.city ? (typeof props.city === "string" && !isNaN(Number(props.city)) ? Number(props.city) : props.city) : "");

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

const selectedCityLabel = computed(() => {
  const val = localCity.value;
  if (val === "" || val === null || val === undefined) return "";
  const found = allCitiesForCountry.value.find((o) => o.value === val);
  return found?.label ?? "";
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
    return;
  }

  // If emitCityId is true, fetch cities with IDs from BE
  if (props.emitCityId) {
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

        if (process.env.NODE_ENV === "development") {
          console.log("🔍 Cities data from BE:", {
            status: citiesData.status,
            citiesCount: citiesData.cities?.length || 0,
            cities: citiesData.cities
          });
        }

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

            if (process.env.NODE_ENV === "development") {
              console.log("🔍 Cities options:", {
                count: cityOptions.length,
                cities: cityOptions
              });
            }
          }
        } else {
          if (process.env.NODE_ENV === "development") {
            console.warn("⚠️ No cities data from BE, using fallback");
          }
        }
      }
    } catch (error) {
      console.error("Failed to fetch cities with IDs:", error);
      // Fallback to static data
      const countryCode = getCountryCode(localCountry.value);
      if (countryCode) {
        const cities = getCitiesByCountryCode(countryCode);
        // Convert string array to CityFromBackend format
        const citiesMapped: CityFromBackend[] = cities.map((name: string, index: number) => ({
          id: index,
          name
        }));
        citiesFromBackend.value = citiesMapped;
        const cityOptions = buildCityOptionsForCountry(countryCode, citiesMapped);
        allCitiesForCountry.value = cityOptions;
        filteredCityOptions.value = cityOptions;
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
      const citiesMapped: CityFromBackend[] = cities.map((name: string, index: number) => ({
        id: index,
        name
      }));
      citiesFromBackend.value = citiesMapped;
      const cityOptions = buildCityOptionsForCountry(countryCode, citiesMapped);
      allCitiesForCountry.value = cityOptions;
      filteredCityOptions.value = cityOptions;
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
  updateCountryOptions();
  updateCityOptions();
};

// Handle country change
const handleCountryChange = () => {
  localCity.value = "";
  updateCityOptions();
};

// Handle city change - prevent selecting divider
const handleCityChange = (value: string | number) => {
  if (value === "__divider__") {
    // Ignore divider selection
    localCity.value = "";
    return;
  }
  localCity.value = value;
};

// Handle next
const handleNext = () => {
  emit("update:continent", localContinent.value);
  emit("update:country", localCountry.value);
  emit("update:city", localCity.value);
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
        localCity.value = locationData.city;
      }

      Notify.create({
        type: "positive",
        message: "Location filled automatically. You can still edit it if needed.",
        position: "top"
      });
    }
  } catch (error) {
    Notify.create({
      type: "negative",
      message: "Failed to get your location. Please select manually.",
      position: "top"
    });
  }
};

const handleGeolocationDeny = () => {
  showGeolocationDialog.value = false;
  hasAskedForGeolocation.value = true;
};

// Show geolocation dialog on mount
onMounted(() => {
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
  emit("update:city", newVal);
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
