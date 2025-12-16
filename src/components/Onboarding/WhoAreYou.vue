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
            @blur="closeGenderDropdown"
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
              @click.stop
            >
              <button
                v-for="option in genderOptions"
                :key="option"
                class="who-genderOption"
                :class="{ 'who-genderOption--selected': localGender === option }"
                @click="selectGender(option)"
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
        />

        <div class="who-passwordFieldWrapper" ref="passwordFieldRef">
          <q-input
            v-model="localPassword"
            label="Password"
            dark
            outlined
            class="who-input"
            :type="showPassword ? 'text' : 'password'"
            autocomplete="new-password"
            name="new-password"
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
          <template v-if="showPasswordRulesDialog">
            <div
              class="who-passwordRulesBackdrop"
              @click="closePasswordRulesDialog"
            ></div>
            <div
              class="who-passwordRulesBubble"
              :style="{ top: `${bubblePosition.top}px`, left: `${bubblePosition.left}px` }"
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
          </template>
        </div>

        <q-input
          v-model="localRepeatPassword"
          label="Repeat Password"
          dark
          outlined
          class="who-input"
          :type="showRepeatPassword ? 'text' : 'password'"
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
            label="City"
            dark
            outlined
            class="who-input"
            :disable="!localProfileCountry"
            use-input
            input-debounce="300"
            fit
            @filter="filterProfileCities"
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
import { ref, computed, watch, onMounted, onBeforeUnmount, nextTick, withDefaults } from "vue";
import { useOnboardingStore } from "src/stores/onboarding";
import { Notify } from "quasar";
import { continents, getCountriesByContinent, getAllCountries } from "src/data/countriesData";
import { getCitiesByCountryCode, getCitySuggestions } from "src/data/citiesData";

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
const localProfileCity = ref(props.profileCity || "");

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

// Check if email exists on backend
const checkEmailExists = async (email: string) => {
  if (!email || !emailRegex.test(email.trim())) {
    return; // Don't check invalid emails
  }

  try {
    const { api } = await import("boot/axios");
    const { data } = await api.post("/check-email", { email: email.trim() });

    if (data.exists) {
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
  } catch (error) {
    // Silently fail - don't show error if check fails
    if (process.env.NODE_ENV === "development") {
      console.warn("Failed to check email:", error);
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

  // Debounce email check - wait 500ms after user stops typing
  if (val && val.trim()) {
    emailCheckTimeout = setTimeout(() => {
      checkEmailExists(val);
    }, 500);
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

watch(localProfileContinent, (val) => {
  onboardingStore.setStepData("profileContinent", val);
  emit("update:profileContinent", val);
});

watch(localProfileCountry, (val) => {
  onboardingStore.setStepData("profileCountry", val);
  emit("update:profileCountry", val);
});

watch(localProfileCity, (val) => {
  onboardingStore.setStepData("profileCity", val);
  emit("update:profileCity", val);
});

const showPassword = ref(false);
const showRepeatPassword = ref(false);
const showPasswordRulesDialog = ref(false);
const passwordFieldRef = ref<HTMLElement | null>(null);
const bubblePosition = ref({ top: 0, left: 0 });
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
const allProfileCitiesForCountry = ref<string[]>([]);
const filteredProfileCityOptions = ref<string[]>([]);
const profileCityFilter = ref("");

// Get country code from country name
const getCountryCode = (countryName: string): string | undefined => {
  const allCountries = getAllCountries();
  const country = allCountries.find(c => c.name === countryName);
  return country?.code;
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
const updateProfileCityOptions = () => {
  if (!localProfileCountry.value) {
    allProfileCitiesForCountry.value = [];
    filteredProfileCityOptions.value = [];
    return;
  }

  const countryCode = getCountryCode(localProfileCountry.value);
  if (countryCode) {
    const cities = getCitiesByCountryCode(countryCode);
    allProfileCitiesForCountry.value = cities;
    filteredProfileCityOptions.value = cities;
  } else {
    allProfileCitiesForCountry.value = [];
    filteredProfileCityOptions.value = [];
  }
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
      const countryCode = getCountryCode(localProfileCountry.value);
      if (countryCode) {
        filteredProfileCityOptions.value = getCitySuggestions(countryCode, val);
      } else {
        filteredProfileCityOptions.value = allProfileCitiesForCountry.value.filter(
          v => v.toLowerCase().includes(val.toLowerCase())
        );
      }
    }
  });
};

// Handle profile continent change
const handleProfileContinentChange = () => {
  localProfileCountry.value = "";
  localProfileCity.value = "";
  updateProfileCountryOptions();
  updateProfileCityOptions();
};

// Handle profile country change
const handleProfileCountryChange = () => {
  localProfileCity.value = "";
  updateProfileCityOptions();
};

// Initialize location options on mount
// Watch for server errors and auto-show them
watch(
  () => onboardingStore.fieldErrors?.email,
  (emailError, oldEmailError) => {
    if (process.env.NODE_ENV === "development") {
      console.log("📧 Watch triggered - emailError:", emailError, "oldEmailError:", oldEmailError);
      console.log("📧 Full fieldErrors:", onboardingStore.fieldErrors);
    }
    if (emailError) {
      // If there's a server error (e.g., existing email), mark field as touched
      // so the error is immediately visible
      emailTouched.value = true;
      triedSubmit.value = true;
      if (process.env.NODE_ENV === "development") {
        console.log("📧 Setting emailTouched and triedSubmit to true");
        console.log("📧 shouldShowEmailError will be:", shouldShowEmailError.value);
        console.log("📧 emailErrorMessage will be:", emailErrorMessage.value);
      }
      // Show notification only if error is new (not on initial mount)
      if (emailError !== oldEmailError) {
        Notify.create({
          type: "negative",
          message: emailError,
          position: "top",
          timeout: 5000
        });
      }
    } else if (oldEmailError && !emailError) {
      // Error was cleared
      if (process.env.NODE_ENV === "development") {
        console.log("📧 Email error was cleared");
      }
    }
  },
  { immediate: true }
);

// Handle email blur - check email immediately
const handleEmailBlur = async () => {
  emailTouched.value = true;
  // Check email immediately on blur
  if (localEmail.value && localEmail.value.trim()) {
    await checkEmailExists(localEmail.value);
  }
};

onMounted(() => {
  updateProfileCountryOptions();
  updateProfileCityOptions();

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
    if (process.env.NODE_ENV === "development") {
      console.log("📧 Component mounted with email error:", onboardingStore.fieldErrors.email);
      console.log("📧 emailTouched:", emailTouched.value, "triedSubmit:", triedSubmit.value);
      console.log("📧 emailServerError:", emailServerError.value);
      console.log("📧 shouldShowEmailError:", shouldShowEmailError.value);
      console.log("📧 emailErrorMessage:", emailErrorMessage.value);
    }
    // Force update to ensure error is visible
    nextTick(() => {
      if (process.env.NODE_ENV === "development") {
        console.log("📧 After nextTick - shouldShowEmailError:", shouldShowEmailError.value);
        console.log("📧 After nextTick - emailErrorMessage:", emailErrorMessage.value);
      }
    });
  }
});

onBeforeUnmount(() => {
  // Clear timeout on unmount
  if (emailCheckTimeout) {
    clearTimeout(emailCheckTimeout);
  }
});

const toggleGenderDropdown = () => {
  isGenderDropdownOpen.value = !isGenderDropdownOpen.value;
};

const closeGenderDropdown = () => {
  // Delay to allow click event to fire first
  setTimeout(() => {
    isGenderDropdownOpen.value = false;
  }, 150);
};

const selectGender = (option: string) => {
  localGender.value = option;
  isGenderDropdownOpen.value = false;
};

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
  const emailValid = !!localEmail.value && !emailError.value;
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

  // Debug logging in development
  if (process.env.NODE_ENV === "development" && !isValid) {
    console.log("Form validation check:", {
      username: usernameValid,
      email: emailValid,
      password: passwordValid,
      repeatPassword: repeatPasswordValid,
      passwordsMatch,
      dateOfBirth: dateOfBirthValid,
      gender: genderValid,
      continent: continentValid,
      country: countryValid,
      city: "optional",
      values: {
        username: localUsername.value,
        email: localEmail.value,
        password: localPassword.value ? "***" : "",
        repeatPassword: localRepeatPassword.value ? "***" : "",
        dateOfBirth: localDateOfBirth.value,
        gender: localGender.value,
        continent: localProfileContinent.value,
        country: localProfileCountry.value,
        city: localProfileCity.value
      }
    });
  }

  return isValid;
});

// Calculate bubble position above password field
const calculateBubblePosition = () => {
  if (!passwordFieldRef.value) return;
  const rect = passwordFieldRef.value.getBoundingClientRect();
  // Position bubble above the password field, centered horizontally
  // We'll position it so the bottom of bubble is 1rem above the top of the field
  const bubbleHeight = 220; // Approximate height of bubble with content
  bubblePosition.value = {
    top: rect.top - bubbleHeight - 26, // 26px above field (10px higher than before)
    left: rect.left + rect.width / 2 // Centered horizontally
  };

  // Ensure bubble doesn't go off screen
  if (bubblePosition.value.top < 20) {
    bubblePosition.value.top = 20; // Minimum 20px from top
  }
};

// Handle password field focus - show dialog and calculate position
const handlePasswordFocus = () => {
  showPasswordRulesDialog.value = true;
  // Calculate position after DOM update
  nextTick(() => {
    calculateBubblePosition();
  });
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
  const backdrop = document.querySelector(".who-passwordRulesBackdrop");
  const passwordInput = passwordFieldRef.value?.querySelector("input");
  const passwordWrapper = passwordFieldRef.value;

  // Don't close if clicking on password input or wrapper
  if (passwordInput && (target === passwordInput || passwordInput.contains(target))) {
    return;
  }
  if (passwordWrapper && passwordWrapper.contains(target)) {
    return;
  }

  // Close if clicking on backdrop or outside bubble
  if (target === backdrop || (bubble && !bubble.contains(target))) {
    closePasswordRulesDialog();
  }
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
  gap: 16px;
  margin-bottom: 12px;
  flex-shrink: 0;
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
  flex: 1;
  height: 4px;
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
.who-passwordFieldWrapper {
  position: relative;
  width: 100%;
}

/* Password requirements backdrop */
.who-passwordRulesBackdrop {
  position: fixed;
  inset: 0;
  background: transparent;
  z-index: 9999;
  animation: fadeIn 0.2s ease-out;
}

@keyframes fadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

/* Password requirements bubble */
.who-passwordRulesBubble {
  position: fixed;
  transform: translate(-50%, 0);
  background: linear-gradient(135deg, rgba(189, 0, 67, 0.5), rgba(255, 0, 110, 0.5));
  backdrop-filter: blur(8px);
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  max-width: 320px;
  width: calc(100vw - 3rem);
  box-shadow: 0 8px 24px rgba(189, 0, 67, 0.4);
  z-index: 10000;
  animation: fadeInUp 0.3s ease-out;
  margin: 0;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translate(-50%, 10px);
  }
  to {
    opacity: 1;
    transform: translate(-50%, 0);
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
