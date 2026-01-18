<template>
  <div class="whoAreYou">
    <!-- Back button + Progress -->
    <div class="who-header">
      <button class="who-backBtn" @click="emit('back')">
        <q-icon name="chevron_left" />
      </button>
      <div class="who-progress">
        <span class="who-progress_fill" :style="{ width: progressWidth }"></span>
      </div>
    </div>

    <div class="who-content">
      <h1 class="who-title">Who are you?</h1>

      <!-- Profile picture upload -->
      <div class="who-avatar">
        <div class="who-avatarPlaceholder" @click="handleAvatarClick">
          <img
            v-if="avatarPreview"
            :src="avatarPreview"
            alt="Profile"
            class="who-avatarImage"
          />
          <q-icon v-else name="image" size="48px" class="who-avatarIcon" />
          <div class="who-avatarPlus">
            <q-icon name="add" size="16px" />
          </div>
        </div>
        <input
          ref="avatarInput"
          type="file"
          accept="image/*"
          class="who-avatarInput"
          @change="handleAvatarChange"
        />
      </div>

      <!-- Form -->
      <div class="who-form">
        <q-input
          v-model="localUsername"
          label="Username"
          dark
          outlined
          class="who-input"
        />

        <q-input
          v-model="localDateOfBirth"
          label="Date of birth"
          dark
          outlined
          class="who-input"
          type="date"
        >
          <template #append>
            <q-icon name="event" />
          </template>
        </q-input>

        <!-- Gender dropdown -->
        <div class="who-genderWrapper">
          <label class="who-genderLabel">Gender</label>
          <div
            class="who-genderSelect"
            :class="{ 'who-genderSelect--open': isGenderDropdownOpen }"
            @click="toggleGenderDropdown"
            tabindex="0"
          >
            <span class="who-genderValue" :class="{ 'who-genderValue--placeholder': !localGender }">
              {{ localGender || "Select gender" }}
            </span>
            <q-icon
              name="keyboard_arrow_down"
              class="who-genderArrow"
              :class="{ 'who-genderArrow--rotated': isGenderDropdownOpen }"
            />
            <div
              v-if="isGenderDropdownOpen"
              class="who-genderDropdown"
            >
              <button
                v-for="option in genderOptions"
                :key="option"
                class="who-genderOption"
                :class="{ 'who-genderOption--selected': localGender === option }"
                @mousedown.prevent="selectGender(option)"
              >
                {{ option }}
              </button>
            </div>
          </div>
        </div>

        <q-input
          v-model="localEmail"
          label="Email Address"
          dark
          outlined
          class="who-input"
          type="email"
          :error="shouldShowEmailError"
          :error-message="emailErrorMessage"
          @blur="handleEmailBlur"
        >
          <template #append>
            <q-spinner v-if="emailChecking" size="16px" color="grey-5" />
          </template>
        </q-input>

        <div class="who-passwordFieldWrapper" ref="passwordFieldRef">
          <q-input
            v-model="localPassword"
            label="Password"
            dark
            outlined
            class="who-input"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            name="password"
            :error="!!passwordError"
            :error-message="passwordError || ''"
            @focus="handlePasswordFocus"
            @blur="handlePasswordBlur"
          >
            <template #append>
              <q-icon
                :name="showPassword ? 'visibility' : 'visibility_off'"
                @click="showPassword = !showPassword"
                class="cursor-pointer"
              />
            </template>
          </q-input>

          <!-- Password requirements bubble -->
          <div
            v-if="showPasswordRulesDialog"
            class="who-passwordRulesBubble"
            @click.stop
          >
              <button
                class="who-passwordRulesClose"
                @click="closePasswordRulesDialog"
                aria-label="Close"
              >
                ×
              </button>
              <div class="who-passwordRulesContent">
                <h3 class="who-passwordRulesTitle">Password requirements</h3>
                <ul class="who-passwordRulesList">
                  <li :class="{ 'who-passwordRule--valid': passwordHasMinLength }">
                    At least 8 characters
                  </li>
                  <li :class="{ 'who-passwordRule--valid': passwordHasUpper }">
                    At least one uppercase letter (A–Z)
                  </li>
                  <li :class="{ 'who-passwordRule--valid': passwordHasNumber }">
                    At least one number (0–9)
                  </li>
                  <li :class="{ 'who-passwordRule--valid': passwordHasSpecial }">
                    At least one special character (e.g. ! @ # $ % _ )
                  </li>
                </ul>
              </div>
              <div class="who-passwordRulesArrow"></div>
            </div>
        </div>

        <!--
          Poznámka: Biele okno "Sila hesla - Nízká" pri tomto poli nie je súčasťou našej aplikácie,
          ale je generované prehliadačom, antivírusom alebo správcom hesiel.
          Nemôžeme ho priamo deaktivovať alebo presmerovať.
        -->
        <q-input
          v-model="localRepeatPassword"
          label="Repeat Password"
          dark
          outlined
          class="who-input"
          :type="showRepeatPassword ? 'text' : 'password'"
          name="password_confirmation"
          autocomplete="off"
          data-lpignore="true"
          :error="!!repeatPasswordError"
          :error-message="repeatPasswordError || ''"
        >
          <template #append>
            <q-icon
              :name="showRepeatPassword ? 'visibility' : 'visibility_off'"
              @click="showRepeatPassword = !showRepeatPassword"
              class="cursor-pointer"
            />
          </template>
        </q-input>

        <!-- User profile location (required) -->
        <div class="who-location">
          <q-select
            v-model="localProfileContinent"
            :options="continentOptions"
            label="Continent"
            dark
            outlined
            class="who-input"
            fit
            behavior="menu"
            :options-dense="true"
            :input-debounce="0"
            :hide-dropdown-icon="false"
            @update:model-value="handleProfileContinentChange"
          />
          <q-select
            v-model="localProfileCountry"
            :options="profileCountryOptions"
            label="Country"
            dark
            outlined
            class="who-input"
            :disable="!localProfileContinent"
            use-input
            input-debounce="0"
            fit
            behavior="menu"
            :options-dense="true"
            @filter="filterProfileCountries"
            @update:model-value="handleProfileCountryChange"
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
            v-model="localProfileCity"
            :options="filteredProfileCityOptions"
            option-label="label"
            option-value="value"
            emit-value
            map-options
            label="City"
            dark
            outlined
            class="who-input"
            :disable="!localProfileCountry"
            use-input
            input-debounce="0"
            fit
            behavior="menu"
            :options-dense="true"
            fill-input
            hide-selected
            @filter="filterProfileCities"
            @update:model-value="handleProfileCityChange"
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

      <p class="who-instruction">Fill up your data</p>

      <!-- Error message -->
      <div v-if="onboardingStore.error" class="who-error">
        {{ onboardingStore.error }}
      </div>
    </div>

    <!-- Finish button -->
    <button
      class="who-finishBtn"
      @click="handleNextStep"
      :disabled="!isFormValid"
    >
      <span>NEXT STEP</span>
    </button>

  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount, withDefaults } from "vue";
import { useOnboardingStore } from "src/stores/onboarding";
import { Notify } from "quasar";
import { api } from "boot/axios";
import { continents, getCountriesByContinent, getAllCountries } from "src/data/countriesData";
import { getCitiesByCountryCode, buildCityOptionsForCountry, CityOption, CityFromBackend } from "src/data/citiesData";

const onboardingStore = useOnboardingStore();

const props = withDefaults(defineProps<{
  username: string;
  dateOfBirth: string;
  gender: string;
  email: string;
  password: string;
  repeatPassword: string;
  userSide?: "donor" | "donee" | null;
  profileContinent?: string;
  profileCountry?: string;
  profileCity?: string;
  progress?: number;
}>(), {
  progress: 20
});

const emit = defineEmits<{
  "update:username": [value: string];
  "update:dateOfBirth": [value: string];
  "update:gender": [value: string];
  "update:email": [value: string];
  "update:password": [value: string];
  "update:repeatPassword": [value: string];
  "update:profileContinent": [value: string];
  "update:profileCountry": [value: string];
  "update:profileCity": [value: string];
  finish: [];
  back: [];
  next: [];
}>();

const localUsername = ref(props.username || "");
const localDateOfBirth = ref(props.dateOfBirth || "");
const localGender = ref(props.gender || "");
const localEmail = ref(props.email || "");
const localPassword = ref(props.password || "");
const localRepeatPassword = ref(props.repeatPassword || "");
const localProfileContinent = ref(props.profileContinent || "");
const localProfileCountry = ref(props.profileCountry || "");
// Initialize with the prop value, but allow it to be number (ID) or string (name)
const localProfileCity = ref<string | number>(props.profileCity ? (typeof props.profileCity === "string" && !isNaN(Number(props.profileCity)) ? Number(props.profileCity) : props.profileCity) : "");

// Sync local values with store
watch(localUsername, (val) => {
  onboardingStore.setStepData("name", val);
  emit("update:username", val);
});

watch(localDateOfBirth, (val) => {
  onboardingStore.setStepData("dateOfBirth", val);
  emit("update:dateOfBirth", val);
});

watch(localGender, (val) => {
  onboardingStore.setStepData("gender", val);
  emit("update:gender", val);
});

// Debounce timer for email validation
let emailCheckTimeout: ReturnType<typeof setTimeout> | null = null;
let emailCheckAbort: AbortController | null = null;
const emailExistsCache = new Map<string, boolean>();
const emailChecking = ref(false);
let emailCheckSeq = 0;
let emailCheckRetryTimeout: ReturnType<typeof setTimeout> | null = null;
let emailCheckRetryEmail = "";
let emailCheckRetryCount = 0;

// Check if email exists on backend
const checkEmailExists = async (email: string) => {
  const trimmedEmail = email?.trim() || "";

  // Validate email format before making API call
  if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
    return; // Don't check invalid emails
  }

  try {
    // Cache: reuse result instantly for already checked emails
    if (emailExistsCache.has(trimmedEmail)) {
      const exists = emailExistsCache.get(trimmedEmail) === true;
      if (exists) {
        if (!onboardingStore.fieldErrors) onboardingStore.fieldErrors = {};
        onboardingStore.fieldErrors.email =
          "This email is already registered. Please choose another one or log in.";
        emailTouched.value = true;
      } else if (onboardingStore.fieldErrors?.email) {
        delete onboardingStore.fieldErrors.email;
      }
      return;
    }

    // Cancel previous in-flight request so only latest result can win
    if (emailCheckAbort) {
      emailCheckAbort.abort();
    }
    emailCheckAbort = new AbortController();
    const seq = ++emailCheckSeq;
    emailChecking.value = true;

    const { data } = await api.post(
      "/check-email",
      { email: trimmedEmail },
      { signal: emailCheckAbort.signal }
    );

    // Ignore stale responses (user typed a new email)
    if (seq !== emailCheckSeq) return;
    if ((localEmail.value || "").trim() !== trimmedEmail) return;

    const exists = !!data?.exists;
    emailExistsCache.set(trimmedEmail, exists);

    if (exists) {
      // Email exists - set field error
      if (!onboardingStore.fieldErrors) {
        onboardingStore.fieldErrors = {};
      }
      onboardingStore.fieldErrors.email = "This email is already registered. Please choose another one or log in.";
      emailTouched.value = true; // Show error immediately
    } else {
      // Email doesn't exist - clear error if it was set
      if (onboardingStore.fieldErrors && onboardingStore.fieldErrors.email) {
        delete onboardingStore.fieldErrors.email;
      }
    }
  } catch (error: unknown) {
    // Abort is expected when user keeps typing
    if (error && typeof error === "object" && "name" in error && (error as { name?: string }).name === "CanceledError") {
      return;
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const errorResponse = (error as any).response;

    // Handle 429 (Too Many Requests) - rate limiting
    // Don't block user; backend will validate on register.
    // But try one quick retry (using Retry-After if present) so UX still feels responsive.
    if (errorResponse?.status === 429) {
      const current = (localEmail.value || "").trim();
      if (current === trimmedEmail && emailCheckRetryCount < 1) {
        emailCheckRetryCount += 1;
        emailCheckRetryEmail = trimmedEmail;
        const retryAfterRaw = errorResponse?.headers?.["retry-after"];
        const retryAfterSec = Number(retryAfterRaw);
        const delayMs = Number.isFinite(retryAfterSec) && retryAfterSec > 0 ? retryAfterSec * 1000 : 1000;
        if (emailCheckRetryTimeout) clearTimeout(emailCheckRetryTimeout);
        emailCheckRetryTimeout = setTimeout(() => {
          void checkEmailExists(trimmedEmail);
        }, delayMs);
      }
    }

    // Silently fail for all other errors (including 422 validation errors)
    // Frontend validation will handle email format validation
    // Don't block user from continuing with registration
  } finally {
    // Only clear loading for the current email
    const current = (localEmail.value || "").trim();
    if (current === trimmedEmail) {
      emailChecking.value = false;
    }
  }
};

watch(localEmail, (val) => {
  onboardingStore.setStepData("email", val);

  // Clear existing error when user types
  if (onboardingStore.fieldErrors && onboardingStore.fieldErrors.email) {
    delete onboardingStore.fieldErrors.email;
  }

  // Clear previous timeout
  if (emailCheckTimeout) {
    clearTimeout(emailCheckTimeout);
  }

  // Clear any scheduled retry when user changes the email
  if (emailCheckRetryTimeout) {
    clearTimeout(emailCheckRetryTimeout);
    emailCheckRetryTimeout = null;
  }
  if ((val || "").trim() !== emailCheckRetryEmail) {
    emailCheckRetryEmail = "";
    emailCheckRetryCount = 0;
  }

  // Cancel in-flight request when user edits email
  if (emailCheckAbort) {
    emailCheckAbort.abort();
    emailCheckAbort = null;
  }
  emailChecking.value = false;

  // Debounce email check - keep UX snappy but avoid spamming backend
  if (val && val.trim() && emailRegex.test(val.trim())) {
    emailCheckTimeout = setTimeout(() => {
      checkEmailExists(val);
    }, 450);
  }

  emit("update:email", val);
});

watch(localPassword, (val) => {
  onboardingStore.setStepData("password", val);
  if (onboardingStore.fieldErrors && onboardingStore.fieldErrors.password) {
    delete onboardingStore.fieldErrors.password;
  }
  emit("update:password", val);
});

watch(localRepeatPassword, (val) => {
  onboardingStore.setStepData("passwordConfirmation", val);
  if (onboardingStore.fieldErrors && onboardingStore.fieldErrors.password) {
    // Clear any server-side password error when user edits password fields
    delete onboardingStore.fieldErrors.password;
  }
  emit("update:repeatPassword", val);
});

// Watch only for city changes (continent and country are handled in their change handlers)
watch(localProfileCity, (val) => {
  onboardingStore.setStepData("profileCity", String(val || ""));
  emit("update:profileCity", String(val || ""));
});

const showPassword = ref(false);
const showRepeatPassword = ref(false);
const showPasswordRulesDialog = ref(false);
const passwordFieldRef = ref<HTMLElement | null>(null);
const avatarInput = ref<HTMLInputElement | null>(null);
const avatarPreview = ref<string | null>(null);
const avatarFile = ref<File | null>(null);
const isGenderDropdownOpen = ref(false);

// Email UX flags
const emailTouched = ref(false);
const triedSubmit = ref(false);

const genderOptions = ["Male", "Female", "Other", "Prefer not to say"];

// Email & password validation
const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const emailError = computed(() => {
  if (!localEmail.value) {
    return null;
  }
  if (!emailRegex.test(localEmail.value.trim())) {
    return "Please enter a valid email address";
  }
  return null;
});

// Combine client-side and server-side email errors
const emailServerError = computed(() => onboardingStore.fieldErrors?.email || null);

const shouldShowEmailError = computed(() => {
  // No error at all → nothing to show
  if (!emailError.value && !emailServerError.value) {
    return false;
  }
  // Show server errors immediately (e.g., existing email), client errors only after blur or submit
  if (emailServerError.value) {
    return true; // Always show server errors immediately
  }
  // Show client-side errors only after blur or submit attempt
  return emailTouched.value || triedSubmit.value;
});

const emailErrorMessage = computed(() => {
  if (!shouldShowEmailError.value) return "";
  return (emailServerError.value || emailError.value) ?? "";
});

// Individual password validation checks for dynamic UI
const passwordHasMinLength = computed(() => {
  const value = localPassword.value || "";
  return value.length >= 8;
});

const passwordHasUpper = computed(() => {
  const value = localPassword.value || "";
  return /[A-Z]/.test(value);
});

const passwordHasNumber = computed(() => {
  const value = localPassword.value || "";
  return /\d/.test(value);
});

const passwordHasSpecial = computed(() => {
  const value = localPassword.value || "";
  return /[!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(value);
});

const passwordError = computed(() => {
  const value = localPassword.value || "";
  if (!value) return null;

  if (!passwordHasMinLength.value || !passwordHasUpper.value || !passwordHasNumber.value || !passwordHasSpecial.value) {
    return "Invalid password";
  }

  return null;
});

const repeatPasswordError = computed(() => {
  if (!localRepeatPassword.value) return null;
  if (localPassword.value && localPassword.value !== localRepeatPassword.value) {
    return "Passwords do not match.";
  }
  return null;
});

// Progress bar
const progressWidth = computed(() => {
  return `${props.progress}%`;
});

// Location options
const continentOptions = continents;
const allProfileCountriesForContinent = ref<string[]>([]);
const profileCountryOptions = ref<string[]>([]);
const profileCountryFilter = ref("");
const allProfileCitiesForCountry = ref<CityOption[]>([]);
const filteredProfileCityOptions = ref<CityOption[]>([]);
const profileCityFilter = ref("");

// Pre-load all countries once for faster lookups
const allCountriesList = getAllCountries();
const countryCodeMap = new Map<string, string>();

// Build country code map once
allCountriesList.forEach(country => {
  countryCodeMap.set(country.name, country.code);
});

// Get country code from country name - optimized with pre-built map
const getCountryCode = (countryName: string): string | undefined => {
  if (!countryName) return undefined;
  return countryCodeMap.get(countryName);
};

// Update profile country options when continent changes
const updateProfileCountryOptions = () => {
  if (!localProfileContinent.value) {
    allProfileCountriesForContinent.value = [];
    profileCountryOptions.value = [];
    return;
  }

  const countries = getCountriesByContinent(localProfileContinent.value);
  allProfileCountriesForContinent.value = countries.map(c => c.name);
  profileCountryOptions.value = allProfileCountriesForContinent.value;
};

// Update profile city options when country changes
const updateProfileCityOptions = async () => {
  if (!localProfileCountry.value) {
    allProfileCitiesForCountry.value = [];
    filteredProfileCityOptions.value = [];
    return;
  }

  const countryCode = getCountryCode(localProfileCountry.value);

  // Prefer BE-backed city IDs (real DB IDs). Fallback to safe "name values" if BE is unavailable.
  try {
    const { data: idsData } = await api.get("/locations/ids", {
      params: {
        continent: localProfileContinent.value,
        country: localProfileCountry.value
      }
    });

    const countryId = idsData?.location_ids?.country_id;
    if (idsData?.status === "success" && countryId) {
      const { data: citiesData } = await api.get("/locations/cities", {
        params: { country_id: countryId, scope: "all" }
      });

      if (citiesData?.status === "success" && Array.isArray(citiesData.cities)) {
        const citiesMapped: CityFromBackend[] = citiesData.cities.map((c: { id: number; name: string }) => ({
          id: c.id,
          name: c.name
        }));

        // If we can, use country code to keep TOP 10 + divider ordering
        if (countryCode) {
          const cityOptions = buildCityOptionsForCountry(countryCode, citiesMapped);
          allProfileCitiesForCountry.value = cityOptions;
          filteredProfileCityOptions.value = cityOptions;
          return;
        }

        // Otherwise, simple alphabetical list
        const cityOptions: CityOption[] = citiesMapped
          .slice()
          .sort((a, b) => a.name.localeCompare(b.name, "sk", { sensitivity: "base" }))
          .map((c) => ({ label: c.name, value: c.id }));

        allProfileCitiesForCountry.value = cityOptions;
        filteredProfileCityOptions.value = cityOptions;
        return;
      }
    }
  } catch {
    // ignore, fall back to static list below
  }

  // Fallback: static list (IMPORTANT: use city NAME as value, not numeric index)
  if (countryCode) {
    const cities = getCitiesByCountryCode(countryCode);
    const citiesMapped: CityFromBackend[] = cities.map((name: string) => ({
      id: name,
      name
    }));
    const cityOptions = buildCityOptionsForCountry(countryCode, citiesMapped);
    allProfileCitiesForCountry.value = cityOptions;
    filteredProfileCityOptions.value = cityOptions;
    return;
  }

  allProfileCitiesForCountry.value = [];
  filteredProfileCityOptions.value = [];
};

// Filter profile countries
const filterProfileCountries = (val: string, update: (callback: () => void) => void) => {
  profileCountryFilter.value = val;
  update(() => {
    if (val === "") {
      profileCountryOptions.value = allProfileCountriesForContinent.value;
    } else {
      const needle = val.toLowerCase();
      profileCountryOptions.value = allProfileCountriesForContinent.value.filter(
        v => v.toLowerCase().indexOf(needle) > -1
      );
    }
  });
};

// Filter profile cities
const filterProfileCities = (val: string, update: (callback: () => void) => void) => {
  profileCityFilter.value = val;
  update(() => {
    if (val === "") {
      filteredProfileCityOptions.value = allProfileCitiesForCountry.value;
    } else {
      const needle = val.toLowerCase();
      // Filter out dividers and match city labels
      filteredProfileCityOptions.value = allProfileCitiesForCountry.value.filter(
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

// Handle profile continent change - optimized for instant response
const handleProfileContinentChange = (val: string) => {
  // Update store and emit immediately
  onboardingStore.setStepData("profileContinent", val);
  emit("update:profileContinent", val);

  // Clear dependent fields immediately
  localProfileCountry.value = "";
  localProfileCity.value = "";

  // Update options synchronously - no async operations
  updateProfileCountryOptions();
  void updateProfileCityOptions();
};

// Handle profile country change - optimized for instant response
const handleProfileCountryChange = (val: string) => {
  // Update store and emit immediately
  onboardingStore.setStepData("profileCountry", val);
  emit("update:profileCountry", val);

  // Clear dependent field immediately
  localProfileCity.value = "";
  onboardingStore.setStepData("profileCity", "");
  emit("update:profileCity", "");

  // Update options synchronously - no async operations
  void updateProfileCityOptions();
};

// Handle profile city change - prevent selecting divider
const handleProfileCityChange = (value: string | number) => {
  if (value === "__divider__") {
    // Ignore divider selection
    localProfileCity.value = "";
    onboardingStore.setStepData("profileCity", "");
    emit("update:profileCity", "");
    return;
  }
  // Store the value (ID) - q-select will map it to label automatically
  localProfileCity.value = value;
  onboardingStore.setStepData("profileCity", String(value));
  emit("update:profileCity", String(value));
};

// Initialize location options on mount
// Watch for server errors and auto-show them
watch(
  () => onboardingStore.fieldErrors?.email,
  (emailError, oldEmailError) => {
    if (emailError) {
      // If there's a server error (e.g., existing email), mark field as touched
      // so the error is immediately visible
      emailTouched.value = true;
      triedSubmit.value = true;
      // Show notification only if error is new (not on initial mount)
      if (emailError !== oldEmailError) {
        Notify.create({
          type: "negative",
          message: emailError,
          position: "top",
          timeout: 5000
        });
      }
    }
  },
  { immediate: true }
);

// Handle email blur - check email immediately
const handleEmailBlur = async () => {
  emailTouched.value = true;
  // If debounce is scheduled, cancel it so blur triggers only ONE request
  if (emailCheckTimeout) {
    clearTimeout(emailCheckTimeout);
    emailCheckTimeout = null;
  }
  // Check email immediately on blur
  if (localEmail.value && localEmail.value.trim()) {
    await checkEmailExists(localEmail.value);
  }
};

onMounted(() => {
  updateProfileCountryOptions();
  void updateProfileCityOptions();

  // Restore avatar preview from store if it exists (e.g., after re-render due to email error)
  if (onboardingStore.profilePicturePreview) {
    avatarPreview.value = onboardingStore.profilePicturePreview;
  }
  if (onboardingStore.profilePictureFile) {
    avatarFile.value = onboardingStore.profilePictureFile;
  }

  // Check if there's already a server error when component mounts (e.g., after returning from step 5)
  if (onboardingStore.fieldErrors?.email) {
    emailTouched.value = true;
    triedSubmit.value = true;
  }
});

onBeforeUnmount(() => {
  // Clear timeout on unmount
  if (emailCheckTimeout) {
    clearTimeout(emailCheckTimeout);
  }
  if (emailCheckAbort) {
    emailCheckAbort.abort();
    emailCheckAbort = null;
  }
});

const toggleGenderDropdown = () => {
  isGenderDropdownOpen.value = !isGenderDropdownOpen.value;
};

const closeGenderDropdown = () => {
  isGenderDropdownOpen.value = false;
};

const selectGender = (option: string) => {
  localGender.value = option;
  // Use requestAnimationFrame to ensure the value is set before closing
  requestAnimationFrame(() => {
    isGenderDropdownOpen.value = false;
  });
};

// Handle click outside to close gender dropdown
const handleGenderClickOutside = (event: MouseEvent) => {
  if (!isGenderDropdownOpen.value) return;

  const target = event.target as HTMLElement;
  const genderSelect = document.querySelector(".who-genderSelect");
  const genderWrapper = document.querySelector(".who-genderWrapper");

  // Don't close if clicking inside gender select or wrapper
  if (genderSelect && genderSelect.contains(target)) {
    return;
  }
  if (genderWrapper && genderWrapper.contains(target)) {
    return;
  }

  // Close if clicking outside
  closeGenderDropdown();
};

// Watch for gender dropdown state changes
watch(isGenderDropdownOpen, (isOpen) => {
  if (isOpen) {
    // Add click listener after a small delay to avoid immediate close
    setTimeout(() => {
      document.addEventListener("click", handleGenderClickOutside);
    }, 100);
  } else {
    // Remove click listener when dropdown closes
    document.removeEventListener("click", handleGenderClickOutside);
  }
});

const handleAvatarClick = () => {
  avatarInput.value?.click();
};

const handleAvatarChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (file) {
    avatarFile.value = file;
    const reader = new FileReader();
    reader.onload = (e) => {
      const preview = e.target?.result as string;
      avatarPreview.value = preview;
      // Store both file and preview in onboarding store
      onboardingStore.setStepData("profilePictureFile", file);
      onboardingStore.setStepData("profilePicturePreview", preview);
    };
    reader.readAsDataURL(file);
  }
};

const isFormValid = computed(() => {
  const usernameValid = localUsername.value && localUsername.value.trim() !== "";
  const emailValid = !!localEmail.value && !emailError.value && !emailServerError.value && !emailChecking.value;
  const passwordValid = !!localPassword.value && !passwordError.value;
  const repeatPasswordValid = localRepeatPassword.value && localRepeatPassword.value.trim() !== "";
  const passwordsMatch =
    passwordValid && repeatPasswordValid && localPassword.value === localRepeatPassword.value;
  const dateOfBirthValid = localDateOfBirth.value && localDateOfBirth.value.trim() !== "";
  const genderValid = localGender.value && localGender.value.trim() !== "";
  const continentValid = localProfileContinent.value && String(localProfileContinent.value).trim() !== "";
  const countryValid = localProfileCountry.value && String(localProfileCountry.value).trim() !== "";
  // City is optional - user can type it manually

  const isValid =
    !!usernameValid &&
    !!emailValid &&
    !!passwordValid &&
    !!repeatPasswordValid &&
    passwordsMatch &&
    !!dateOfBirthValid &&
    !!genderValid &&
    !!continentValid &&
    !!countryValid;

  return isValid;
});

// Handle password field focus - show dialog
const handlePasswordFocus = () => {
  showPasswordRulesDialog.value = true;
};

// Close password rules dialog
const closePasswordRulesDialog = () => {
  showPasswordRulesDialog.value = false;
};

// Handle password field blur - close dialog if clicking on another input
const handlePasswordBlur = () => {
  // Small delay to check if focus moved to another input
  setTimeout(() => {
    const activeElement = document.activeElement;
    // If focus moved to another input field, close the dialog
    if (activeElement && (activeElement.tagName === "INPUT" || activeElement.tagName === "TEXTAREA")) {
      closePasswordRulesDialog();
    }
  }, 150);
};

// Handle click outside to close dialog
let clickOutsideTimeout: ReturnType<typeof setTimeout> | null = null;

const handleClickOutside = (event: MouseEvent) => {
  if (!showPasswordRulesDialog.value) return;

  const target = event.target as HTMLElement;
  const bubble = document.querySelector(".who-passwordRulesBubble");
  const passwordInput = passwordFieldRef.value?.querySelector("input");
  const passwordWrapper = passwordFieldRef.value;

  // Don't close if clicking on password input, wrapper, or bubble
  if (passwordInput && (target === passwordInput || passwordInput.contains(target))) {
    return;
  }
  if (passwordWrapper && passwordWrapper.contains(target)) {
    return;
  }
  if (bubble && bubble.contains(target)) {
    return;
  }

  // Close if clicking outside
  closePasswordRulesDialog();
};

// Watch for clicks outside when dialog is open
watch(showPasswordRulesDialog, (isOpen) => {
  if (isOpen) {
    // Clear any existing timeout
    if (clickOutsideTimeout) {
      clearTimeout(clickOutsideTimeout);
    }
    // Use setTimeout to ensure DOM is updated and avoid immediate close
    clickOutsideTimeout = setTimeout(() => {
      document.addEventListener("mousedown", handleClickOutside, true);
    }, 300);
  } else {
    if (clickOutsideTimeout) {
      clearTimeout(clickOutsideTimeout);
      clickOutsideTimeout = null;
    }
    document.removeEventListener("mousedown", handleClickOutside, true);
  }
});

const handleNextStep = () => {
  // Mark that user attempted to submit – errors can now be shown
  triedSubmit.value = true;

  if (!isFormValid.value) {
    // Prefer specific field errors for better UX
    const firstEmailError = emailError.value || emailServerError.value;
    const fieldError =
      passwordError.value ||
      repeatPasswordError.value ||
      firstEmailError ||
      "Please fill in all required fields including your location.";

    Notify.create({
      type: "negative",
      message: fieldError,
      position: "top"
    });
    return;
  }
  emit("next");
};
</script>

<style lang="scss" scoped>
// Global styles for faster Quasar select animations
:deep(.q-menu) {
  transition: opacity 0.01s ease, transform 0.01s ease !important;
  animation: none !important;
}

:deep(.q-select__dropdown-icon) {
  transition: transform 0.01s ease !important;
}

:deep(.q-field--highlighted .q-field__control) {
  transition: background-color 0.01s ease !important;
}

:deep(.q-field__control) {
  transition: background-color 0.01s ease !important;
}

:deep(.q-item) {
  transition: background-color 0.01s ease !important;
}

:deep(.q-item__section--side) {
  transition: opacity 0.01s ease !important;
}

.whoAreYou {
  width: 100%;
  max-width: 390px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 16px 20px 40px;
  margin: 0 auto;
  background: radial-gradient(circle at top, #0b001c 0%, #05000e 40%, #010006 100%);
  overflow-y: auto;
  overflow-x: hidden;
  position: relative;
}

.who-header {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
  margin-bottom: 12px;
  flex-shrink: 0;
  position: relative;
}

.who-backBtn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.01s ease;
  flex-shrink: 0;

  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
  }

  .q-icon {
    font-size: 24px;
    color: #ffffff;
  }
}

.who-progress {
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

.who-progress_fill {
  display: block;
  height: 100%;
  background: #BD0043;
  transition: width 0.01s ease;
}

.who-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0;
  min-height: 0;
  overflow-y: visible;
  overflow-x: hidden;
  position: relative;
}

.who-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 16px 0;
  text-align: center;
  flex-shrink: 0;
  line-height: 1.2;
}

.who-avatar {
  width: 120px;
  height: 120px;
  margin-bottom: 20px;
  position: relative;
  flex-shrink: 0;
}

.who-avatarInput {
  display: none;
}

.who-avatarPlaceholder {
  width: 100%;
  height: 100%;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.05);
  border: 2px solid #BD0043;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  cursor: pointer;
  transition: background 0.01s ease;
  overflow: hidden;

  &:hover {
    background: rgba(255, 255, 255, 0.08);
  }
}

.who-avatarImage {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 50%;
}

.who-avatarIcon {
  color: #BD0043;
}

.who-avatarPlus {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 32px;
  height: 32px;
  background: #BD0043;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid rgba(0, 0, 0, 0.2);
  z-index: 1;

  .q-icon {
    color: #ffffff;
  }
}

.who-form {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 16px;
  margin-bottom: 16px;
  flex-shrink: 0;
}

.who-input {
  :deep(.q-field__control) {
    background-color: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    height: 56px;
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

.who-genderWrapper {
  width: 100%;
  position: relative;
}

.who-genderLabel {
  display: block;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.75rem;
  margin-bottom: 4px;
  font-weight: 500;
}

.who-genderSelect {
  width: 100%;
  height: 56px;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  cursor: pointer;
  transition: all 0.01s ease;
  position: relative;
  color: #ffffff;
  will-change: background-color, border-color;

  &:hover {
    background-color: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 255, 255, 0.2);
  }

  &:focus {
    outline: none;
    border-color: #BD0043;
    box-shadow: 0 0 0 2px rgba(189, 0, 67, 0.2);
  }

  &--open {
    border-color: #BD0043;
    background-color: rgba(255, 255, 255, 0.08);
  }
}

.who-genderValue {
  flex: 1;
  font-size: 1rem;
  color: #ffffff;
  opacity: 0.9;

  &--placeholder {
    color: rgba(255, 255, 255, 0.5);
    opacity: 0.7;
  }
}

.who-genderArrow {
  font-size: 24px;
  color: rgba(255, 255, 255, 0.6);
  transition: transform 0.01s ease;
  flex-shrink: 0;
  margin-left: 8px;
  will-change: transform;

  &--rotated {
    transform: rotate(180deg);
  }
}

.who-genderDropdown {
  position: absolute;
  top: calc(100% + 4px);
  left: 0;
  right: 0;
  background-color: rgba(26, 26, 26, 0.98);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 12px;
  overflow: hidden;
  z-index: 1000;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.4);
  backdrop-filter: blur(8px);
  animation: dropdownSlideDown 0.01s ease-out;
  will-change: transform, opacity;
}

@keyframes dropdownSlideDown {
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.who-genderOption {
  width: 100%;
  padding: 14px 16px;
  background: transparent;
  border: none;
  color: #ffffff;
  font-size: 1rem;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.01s ease;
  display: flex;
  align-items: center;
  will-change: background-color;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }

  &:active {
    background-color: rgba(255, 255, 255, 0.15);
    transition: background-color 0.01s ease;
  }

  &--selected {
    background-color: rgba(189, 0, 67, 0.2);
    color: #BD0043;
    font-weight: 600;

    &:hover {
      background-color: rgba(189, 0, 67, 0.3);
    }
  }

  &:not(:last-child) {
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }
}

.who-location {
  display: grid;
  grid-template-columns: 1fr;
  gap: 16px;
  margin-top: 0.5rem;
}

.who-location .who-input {
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

  :deep(.q-menu--square) {
    transition: opacity 0.01s ease, transform 0.01s ease !important;
  }

  :deep(.q-select__dropdown-icon) {
    transition: transform 0.01s ease !important;
  }
}

// Speed up all q-select animations
.who-input {
  :deep(.q-menu) {
    transition: opacity 0.01s ease, transform 0.01s ease !important;
    animation: none !important;
  }

  :deep(.q-select__dropdown-icon) {
    transition: transform 0.01s ease !important;
  }

  :deep(.q-field__control) {
    transition: background-color 0.01s ease !important;
  }

  :deep(.q-field__native) {
    transition: color 0.01s ease !important;
  }
}

.who-instruction {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 24px 0 32px 0;
  padding: 0 1rem;
  text-align: center;
  flex-shrink: 0;
}

.who-error {
  font-size: 0.875rem;
  color: #ff2c8b;
  margin-top: 12px;
  text-align: center;
  flex-shrink: 0;
  padding: 8px 12px;
  background: rgba(255, 44, 139, 0.1);
  border-radius: 8px;
  border: 1px solid rgba(255, 44, 139, 0.3);
}

.who-finishBtn {
  width: 100%;
  height: 56px;
  border-radius: 9999px;
  background: #BD0043;
  border: none;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.01s ease, box-shadow 0.01s ease;
  box-shadow: 0 8px 24px rgba(189, 0, 67, 0.3);
  margin-top: auto;
  margin-bottom: 0;
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

/* Password field wrapper for positioning bubble */
/* Password field wrapper - relative positioning for popup */
.who-passwordFieldWrapper {
  position: relative;
  width: 100%;
}

/* Password requirements bubble */
.who-passwordRulesBubble {
  position: absolute;
  bottom: 100%;
  left: 50%;
  transform: translateX(-50%) translateY(-5px);
  margin-bottom: 0.5rem;
  background: linear-gradient(135deg, rgba(189, 0, 67, 0.5), rgba(255, 0, 110, 0.5));
  backdrop-filter: blur(8px);
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  max-width: 320px;
  width: 100%;
  box-shadow: 0 8px 24px rgba(189, 0, 67, 0.4);
  z-index: 10;
  animation: fadeInScale 0.2s ease-out;
}

@keyframes fadeInScale {
  from {
    opacity: 0;
    transform: translateX(-50%) translateY(-5px) scale(0.98);
  }
  to {
    opacity: 1;
    transform: translateX(-50%) translateY(-5px) scale(1);
  }
}

.who-passwordRulesClose {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.2s;
  z-index: 10;

  &:hover {
    opacity: 1;
  }
}

.who-passwordRulesContent {
  color: white;
  text-align: center;
  position: relative;
  z-index: 1;
}

.who-passwordRulesTitle {
  font-family: poppinsSemiBold;
  font-size: 1rem;
  margin: 0 0 1rem 0;
  color: white;
  text-align: center;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
}

.who-passwordRulesList {
  list-style: none;
  padding: 0;
  margin: 0;
  text-align: left;
}

.who-passwordRulesList li {
  font-family: poppins;
  font-size: 0.85rem;
  margin: 0.5rem 0;
  color: white;
  line-height: 1.5;
  padding-left: 1.5rem;
  position: relative;
  transition: color 0.3s ease;
  text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);

  &::before {
    content: "•";
    position: absolute;
    left: 0;
    color: rgba(255, 180, 180, 1);
    font-size: 1.2rem;
    transition: color 0.3s ease;
    text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
  }

  &.who-passwordRule--valid {
    color: white;

    &::before {
      content: "✓";
      color: rgba(180, 255, 180, 1);
      font-size: 1rem;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);
    }
  }
}

.who-passwordRulesArrow {
  position: absolute;
  bottom: -0.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 0.75rem solid transparent;
  border-right: 0.75rem solid transparent;
  border-top: 0.75rem solid rgba(189, 0, 67, 0.95);
}
</style>
