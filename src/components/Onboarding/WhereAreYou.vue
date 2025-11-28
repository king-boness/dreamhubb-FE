<template>
  <div class="whereAreYou">
    <!-- Back button + Title (hidden if hideHeader is true) -->
    <template v-if="!hideHeader">
      <div class="location-header">
        <button class="location-backBtn" @click="emit('back')">
          <q-icon name="chevron_left" />
        </button>
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
            label="Choose your city"
            dark
            outlined
            class="location-select"
            :disable="!localCountry"
            use-input
            input-debounce="300"
            @filter="filterCities"
          >
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
          label="Choose your city"
          dark
          outlined
          class="location-select"
          :disable="!localCountry"
          use-input
          input-debounce="300"
          @filter="filterCities"
        >
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
        :disabled="!localContinent || !localCountry || !localCity"
      >
        {{ nextButtonLabel }}
      </button>
    </template>

    <!-- Geolocation Permission Dialog (only show if enableGeolocation is true) -->
    <q-dialog v-model="showGeolocationDialog" persistent v-if="enableGeolocation">
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
import { ref, computed, onMounted, watch } from "vue";
import { Notify } from "quasar";
import { continents, getCountriesByContinent, getAllCountries, getCountryByCode } from "src/data/countriesData";
import { getCitiesByCountryCode, getCitySuggestions } from "src/data/citiesData";
import { useGeolocation } from "src/composables/useGeolocation";

const props = defineProps<{
  continent: string;
  country: string;
  city: string;
  progress?: number; // Progress percentage (0-100), defaults to 80 for onboarding
  title?: string; // Custom title, defaults to "you live in"
  nextButtonLabel?: string; // Custom next button label, defaults to "NEXT STEP"
  enableGeolocation?: boolean; // Enable geolocation dialog, defaults to true
  hideHeader?: boolean; // Hide header (back button + title), defaults to false
  hideFooter?: boolean; // Hide footer (CTA buttons), defaults to false
}>();

const emit = defineEmits<{
  "update:continent": [value: string];
  "update:country": [value: string];
  "update:city": [value: string];
  next: [];
  back: [];
}>();

const localContinent = ref(props.continent || "");
const localCountry = ref(props.country || "");
const localCity = ref(props.city || "");

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
const allCitiesForCountry = ref<string[]>([]);
const filteredCityOptions = ref<string[]>([]);
const cityFilter = ref("");

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
const updateCityOptions = () => {
  if (!localCountry.value) {
    allCitiesForCountry.value = [];
    filteredCityOptions.value = [];
    return;
  }

  const countryCode = getCountryCode(localCountry.value);
  if (countryCode) {
    const cities = getCitiesByCountryCode(countryCode);
    allCitiesForCountry.value = cities;
    filteredCityOptions.value = cities;
  } else {
    allCitiesForCountry.value = [];
    filteredCityOptions.value = [];
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
      const countryCode = getCountryCode(localCountry.value);
      if (countryCode) {
        filteredCityOptions.value = getCitySuggestions(countryCode, val);
      } else {
        filteredCityOptions.value = allCitiesForCountry.value.filter(
          v => v.toLowerCase().includes(val.toLowerCase())
        );
      }
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
</script>

<style lang="scss" scoped>
.whereAreYou {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 0;
  margin: 0;
  background: transparent;
  overflow: hidden;
  position: relative;
}

.location-header {
  display: flex;
  align-items: flex-start;
  margin-bottom: 0;
  flex-shrink: 0;
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
  flex: 1;
  height: 4px;
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
  justify-content: center;
  padding: 0;
  min-height: 0;
  overflow: hidden;
  position: relative;
  width: 100%;
  gap: 3rem;
}

.location-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 5px 0 20px 0;
  text-align: center;
  flex-shrink: 0;
  line-height: 1.2;
  width: 100%;
}

.location-map {
  width: 100%;
  max-width: 280px;
  margin: 0 0 2rem 0;
  opacity: 0.7;
  flex-shrink: 0;

  img {
    width: 100%;
    height: auto;
    display: block;
    filter: brightness(0.8) saturate(1.5) hue-rotate(300deg);
  }
}

.location-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 0;
  flex-shrink: 0;
}

.location-select {
  :deep(.q-field__control) {
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    height: 48px;
    color: #ffffff;
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
}

.location-instruction {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0;
  text-align: center;
}

.location-nextBtn {
  width: 100%;
  height: 48px;
  flex-shrink: 0;
  border-radius: 9999px;
  background: #BD0043;
  border: none;
  color: #ffffff;
  font-size: 0.9rem;
  font-weight: 700;
  margin-top: -40px;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 8px 24px rgba(189, 0, 67, 0.3);

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
