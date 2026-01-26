// src/stores/onboarding.ts
import { defineStore } from "pinia";
import { api } from "boot/axios";
import { mapAxiosErrorToDhError } from "src/utils/httpError";
import { tGlobal } from "src/utils/i18nGlobal";
import { useAuthStore } from "src/stores/auth";

const normalizeId = (value: unknown): number | null => {
  if (value === null || value === undefined) return null;
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (/^\d+$/.test(trimmed)) return Number(trimmed);
    return null;
  }
  if (typeof value === "object") {
    const anyVal = value as Record<string, unknown>;
    return normalizeId(anyVal.id ?? anyVal.value ?? anyVal.cityId);
  }
  return null;
};

export const useOnboardingStore = defineStore("onboarding", {
  state: () => ({
    // Step 1: Pick your side
    role: null as "donor" | "donee" | null,

    // Step 2: What is your goal
    goalType: null as "problem" | "dream" | "idea" | null,

    // Step 3: Category / Subcategory (preferred post subcategory)
    category: null as string | null,
    subcategory: null as string | null,

    // Step 1: User profile location (profile)
    profileContinent: "" as string,
    profileCountry: "" as string,
    profileCity: "" as string,
    profileContinentId: null as number | null,
    profileCountryId: null as number | null,
    profileCityId: null as number | null,

    // Step 5: Feed preferred location (preferences)
    feedContinent: "" as string,
    feedCountry: "" as string,
    feedCity: "" as string,
    feedContinentId: null as number | null,
    feedCountryId: null as number | null,
    feedCityId: null as number | null,

    // Step 5: Registration form
    name: "" as string,
    email: "" as string,
    password: "" as string,
    passwordConfirmation: "" as string,
    dateOfBirth: "" as string,
    gender: "" as string,

    // UI state
    loading: false,
    error: null as string | null,
    // per-field validation errors from BE
    fieldErrors: {} as Record<string, string> | null,
    profilePictureFile: null as File | null,
    profilePicturePreview: null as string | null // Base64 preview for avatar
  }),

  getters: {
    isReadyForRegister(state): boolean {
      return !!(
        state.role &&
        state.name &&
        state.email &&
        state.password &&
        state.passwordConfirmation &&
        state.password === state.passwordConfirmation &&
        state.dateOfBirth &&
        state.gender &&
        state.profileContinent &&
        state.profileCountry &&
        // City is REQUIRED for consistent "City, Country" display across the app
        (state.profileCityId || state.profileCity)
      );
    }
  },

  actions: {
    // Univerzálna metóda na nastavenie dát z jednotlivých krokov
    setStepData(stepKey: string, data: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any)[stepKey] = data;
    },

    // Reset celého state (pri logout-e alebo reštarte onboarding-u)
    reset() {
      this.role = null;
      this.goalType = null;
      this.category = null;
      this.subcategory = null;
      this.profileContinent = "";
      this.profileCountry = "";
      this.profileCity = "";
      this.profileContinentId = null;
      this.profileCountryId = null;
      this.profileCityId = null;
      this.feedContinent = "";
      this.feedCountry = "";
      this.feedCity = "";
      this.feedContinentId = null;
      this.feedCountryId = null;
      this.feedCityId = null;
      this.name = "";
      this.email = "";
      this.password = "";
      this.passwordConfirmation = "";
      this.dateOfBirth = "";
      this.gender = "";
      this.loading = false;
      this.error = null;
      this.fieldErrors = null;
      this.profilePictureFile = null;
      this.profilePicturePreview = null;
    },

    // Pomocná metóda na získanie location IDs pre profil (zatiaľ placeholder)
    async fetchProfileLocationIds() {
      // If IDs are already set, use them
      if (this.profileContinentId && this.profileCountryId && this.profileCityId) {
        return {
          continentId: this.profileContinentId,
          countryId: this.profileCountryId,
          cityId: this.profileCityId
        };
      }

      // If city is a numeric string (selected via BE city list), treat it as city_id directly.
      // We still fetch continent_id/country_id via /locations/ids using names.
      const parsedCityId =
        typeof this.profileCity === "string" && /^\d+$/.test(this.profileCity)
          ? Number(this.profileCity)
          : null;

      // If we have names but not IDs, fetch IDs from BE
      if (this.profileContinent && this.profileCountry) {
        try {
          if (import.meta.env.DEV) {
            console.debug("Fetching location IDs for profile:", {
              continent: this.profileContinent,
              country: this.profileCountry,
              city: this.profileCity
            });
          }

          const { data } = await api.get("/locations/ids", {
            params: {
              continent: this.profileContinent,
              country: this.profileCountry,
              // Pass city only if it's a NAME (not an ID string)
              city: parsedCityId ? null : (this.profileCity || null)
            }
          });

          if (import.meta.env.DEV) {
            console.debug("Location IDs response:", data);
          }

          if (data) {
            if (data.status === "error") {
              // BE returned an error (do not surface raw messages)
              throw new Error(tGlobal("common.errors.server", "Something went wrong. Please try again."));
            }

            if (data.status === "success" && data.location_ids) {
              const ids = data.location_ids;

              // Check if we got valid IDs (continent and country are required)
              if (!ids.continent_id || !ids.country_id) {
                if (import.meta.env.DEV) {
                  console.debug("Invalid location IDs received from server:", ids);
                }
                throw new Error(tGlobal("common.errors.server", "Something went wrong. Please try again."));
              }

              // Update store with IDs
              this.profileContinentId = ids.continent_id;
              this.profileCountryId = ids.country_id;
              // City must be present (either from parsed ID, or from BE lookup by name)
              this.profileCityId = parsedCityId || ids.city_id;

              if (!this.profileCityId) {
                throw new Error("City is required. Please select a valid city.");
              }

              if (import.meta.env.DEV) {
                console.debug("Location IDs set in store:", {
                  continentId: ids.continent_id,
                  countryId: ids.country_id,
                  cityId: ids.city_id
                });
              }

              return {
                continentId: ids.continent_id,
                countryId: ids.country_id,
                cityId: this.profileCityId
              };
            }
          }
        } catch (error: unknown) {
          if (import.meta.env.DEV) {
            console.debug("Failed to fetch location IDs:", error);
          }
          throw error;
        }
      }

      // Fallback: If we still don't have IDs, throw error instead of using defaults
      // This prevents silent failures where wrong location IDs are used
      if (!this.profileContinentId || !this.profileCountryId) {
        throw new Error(tGlobal("common.errors.server", "Something went wrong. Please try again."));
      }

      return {
        continentId: this.profileContinentId,
        countryId: this.profileCountryId,
        cityId: this.profileCityId
      };
    },

    // Pomocná metóda na získanie location IDs pre feed (podobne ako fetchProfileLocationIds)
    async fetchFeedLocationIds() {
      // If IDs are already set, use them (city is optional)
      if (this.feedContinentId && this.feedCountryId) {
        return {
          continentId: this.feedContinentId,
          countryId: this.feedCountryId,
          cityId: this.feedCityId || null
        };
      }

      const chosenCityId = normalizeId(this.feedCityId);

      // If we have names but not IDs, fetch IDs from BE
      if (this.feedContinent && this.feedCountry) {
        try {
          if (import.meta.env.DEV) {
            console.debug("[Onboarding] Fetching location IDs for feed");
          }

          const { data } = await api.get("/locations/ids", {
            params: {
              continent: this.feedContinent,
              country: this.feedCountry,
              // If user already picked a real city ID (emitCityId mode), don't override it via name lookup.
              city: chosenCityId ? null : (this.feedCity || null)
            }
          });

          // Do not log raw responses (may contain PII)

          if (data) {
            if (data.status === "error") {
              const errorMsg = data.message || "Failed to get feed location IDs from server";
              if (import.meta.env.DEV) {
                console.debug("[Onboarding] BE returned error for feed location IDs:", errorMsg);
              }
              throw new Error(tGlobal("common.errors.server", "Something went wrong. Please try again."));
            }

            if (data.status === "success" && data.location_ids) {
              const ids = data.location_ids;

              // Check if we got valid IDs (continent and country are required)
              if (!ids.continent_id || !ids.country_id) {
                if (import.meta.env.DEV) {
                  console.debug("[Onboarding] Invalid feed location IDs received from server.");
                }
                throw new Error(tGlobal("common.errors.server", "Something went wrong. Please try again."));
              }

              // Update store with IDs
              this.feedContinentId = ids.continent_id;
              this.feedCountryId = ids.country_id;
              // Preserve chosen city id if already selected; otherwise accept BE lookup.
              this.feedCityId = chosenCityId ?? (ids.city_id || null);

              // no verbose logs here

              return {
                continentId: ids.continent_id,
                countryId: ids.country_id,
                cityId: this.feedCityId || null
              };
            }
          }
        } catch (error) {
          if (import.meta.env.DEV) {
            console.debug("[Onboarding] Failed to fetch feed location IDs:", error);
          }
          // Re-throw error so it can be handled
          throw error;
        }
      }

      // If we still don't have IDs but have names, return null IDs (will filter by country if available)
      // This allows filtering by country even if city is not selected
      if (this.feedContinentId && this.feedCountryId) {
        return {
          continentId: this.feedContinentId,
          countryId: this.feedCountryId,
          cityId: this.feedCityId || null
        };
      }

      // If we have names but no IDs, return null (no filtering)
      return {
        continentId: null,
        countryId: null,
        cityId: null
      };
    },

    // Register - volá POST /api/register na BE
    async register() {
      if (!this.isReadyForRegister) {
        this.error = "Please fill in all required fields.";
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        // Získať location IDs - if it fails, use IDs from store or let backend validate
        let locationIds;
        try {
          locationIds = await this.fetchProfileLocationIds();
        } catch (locationError) {
          // If location fetch fails, use IDs from store if available
          // Backend will validate them anyway
          if (import.meta.env.DEV) {
            console.debug("[Onboarding] Location IDs fetch failed, using store IDs:", locationError);
          }
          locationIds = {
            continentId: this.profileContinentId,
            countryId: this.profileCountryId,
            cityId: this.profileCityId
          };
        }

        // Validate location IDs before proceeding
        if (!locationIds.continentId || !locationIds.countryId || !locationIds.cityId) {
          throw new Error(tGlobal("common.errors.validation", "Please check your input and try again."));
        }

        // Format date_birth - ensure it's in YYYY-MM-DD format
        // q-input type="date" returns YYYY-MM-DD format, but we need to handle other formats too
        let formattedDate = this.dateOfBirth;
        if (formattedDate) {
          // Remove any spaces
          formattedDate = formattedDate.trim();

          // If date is in DD.MM.YYYY format, convert to YYYY-MM-DD
          if (formattedDate.includes(".")) {
            const parts = formattedDate.split(".").map(p => p.trim());
            if (parts.length === 3) {
              // Pad day and month with leading zeros if needed
              const day = parts[0].padStart(2, "0");
              const month = parts[1].padStart(2, "0");
              const year = parts[2];
              formattedDate = `${year}-${month}-${day}`;
            }
          } else if (formattedDate.includes("/")) {
            // If date is in DD/MM/YYYY format, convert to YYYY-MM-DD
            const parts = formattedDate.split("/").map(p => p.trim());
            if (parts.length === 3) {
              // Pad day and month with leading zeros if needed
              const day = parts[0].padStart(2, "0");
              const month = parts[1].padStart(2, "0");
              const year = parts[2];
              formattedDate = `${year}-${month}-${day}`;
            }
          }
          // If already in YYYY-MM-DD format, use as is
        }

        const payload = {
          username: this.name,
          email: this.email,
          password: this.password,
          password_confirmation: this.passwordConfirmation,
          date_birth: formattedDate || this.dateOfBirth,
          gender: this.gender,
          location_country_id: locationIds.countryId || null,
          location_continent_id: locationIds.continentId || null,
          location_city_id: locationIds.cityId
        };

        // Never log registration payloads (may contain PII)

        const { data } = await api.post("/register", payload);

        // Never log raw register responses (may contain token/user PII)

        // BE register endpoint NEVRÁTI token (len user)
        // Preto po úspešnej registrácii automaticky prihlásime používateľa
        if (data && data.status === "success" && data.user) {
          // Automaticky prihlásiť používateľa po registrácii
          const authStore = useAuthStore();
          await authStore.login({
            email: this.email,
            password: this.password
          });

          // Upload profile picture if provided
          if (this.profilePictureFile) {
            try {
              const formData = new FormData();
              formData.append("file", this.profilePictureFile);
              await api.post("/user/profile-picture", formData, {
                headers: {
                  "Content-Type": "multipart/form-data"
                }
              });
              // Refresh user data to get updated profile picture
              await authStore.fetchUser();
            } catch (error) {
              // Log error but don't fail registration
              if (import.meta.env.DEV) {
                console.debug("[Onboarding] Failed to upload profile picture:", error);
              }
            }
          }

          return data;
        } else {
          throw new Error(data?.message || "Registration failed");
        }
      } catch (error: unknown) {
        if (import.meta.env.DEV) {
          console.debug("[Onboarding] Registration error:", error);
        }

        // Check if it's a location-related error
        if (error instanceof Error) {
          const errorMessage = error.message.toLowerCase();
          if (errorMessage.includes("location") || errorMessage.includes("failed to get location")) {
            this.error = "Failed to process your location. Please make sure you selected a valid continent, country, and city (if applicable).";
            this.loading = false;
            return;
          }
        }

        // Spracovať error response z BE
        const errorResponse = error as {
          response?: {
            status?: number;
            data?: {
              message?: string;
              errors?: Record<string, string[]>;
            };
          };
        };

        if (import.meta.env.DEV) {
          console.debug("[Onboarding] Registration error response status:", errorResponse.response?.status);
        }

        if (errorResponse.response?.data?.errors) {
          // Map Laravel validation errors to fieldErrors
          const fieldErrors: Record<string, string> = {};
          const errors = errorResponse.response.data.errors;
          Object.keys(errors).forEach((key) => {
            const value = errors[key];
            const raw =
              Array.isArray(value) && value.length > 0 ? String(value[0]) : "Validation error";
            // Friendlier message for already registered email
            if (key === "email" && /already been taken/i.test(raw)) {
              fieldErrors.email = "This email is already registered. Please choose another one or log in.";
            } else {
              fieldErrors[key] = raw;
            }
          });
          this.fieldErrors = fieldErrors;
          // do not log field errors (can contain sensitive validation data)
          // Also show first error as global message for visibility
          const firstKey = Object.keys(fieldErrors)[0];
          this.error = firstKey ? fieldErrors[firstKey] : "Validation error";
        } else {
          const mapped = mapAxiosErrorToDhError(error);
          this.error = tGlobal(mapped.messageKey, mapped.fallbackMessage);
        }

        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
