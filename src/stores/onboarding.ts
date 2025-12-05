// src/stores/onboarding.ts
import { defineStore } from "pinia";
import { api } from "boot/axios";
import { useAuthStore } from "src/stores/auth";

export const useOnboardingStore = defineStore("onboarding", {
  state: () => ({
    // Step 1: Pick your side
    role: null as "donor" | "donee" | null,

    // Step 2: What is your goal
    goalType: null as "problem" | "dream" | "idea" | null,

    // Step 3: Category
    category: null as string | null,
    subcategory: null as string | null,

    // Step 4: Location
    locationContinent: "" as string,
    locationCountry: "" as string,
    locationCity: "" as string,
    // TODO: Location IDs - možno budeme musieť získať z BE alebo mapovať
    locationContinentId: null as number | null,
    locationCountryId: null as number | null,
    locationCityId: null as number | null,

    // Step 5: Registration form
    name: "" as string,
    email: "" as string,
    password: "" as string,
    passwordConfirmation: "" as string,
    dateOfBirth: "" as string,
    gender: "" as string,

    // UI state
    loading: false,
    error: null as string | null
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
        state.locationContinent &&
        state.locationCountry &&
        state.locationCity
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
      this.locationContinent = "";
      this.locationCountry = "";
      this.locationCity = "";
      this.locationContinentId = null;
      this.locationCountryId = null;
      this.locationCityId = null;
      this.name = "";
      this.email = "";
      this.password = "";
      this.passwordConfirmation = "";
      this.dateOfBirth = "";
      this.gender = "";
      this.loading = false;
      this.error = null;
    },

    // Pomocná metóda na získanie location IDs (zatiaľ placeholder - BE endpoint ešte nie je implementovaný)
    async fetchLocationIds() {
      // TODO: Keď BE implementuje /api/locations endpoint, použiť ho na získanie IDs
      // Zatiaľ používame placeholder hodnoty (1, 1, 1) - BE by malo mať aspoň jednu location v DB
      // V produkcii by sme mali volať napr.:
      // const { data } = await api.get("/locations", { params: { continent: this.locationContinent, country: this.locationCountry, city: this.locationCity } });
      // return { continentId: data.continent_id, countryId: data.country_id, cityId: data.city_id };

      // Placeholder - BE by malo mať aspoň jednu location v DB
      // V reálnom prípade by sme mali získať IDs z BE endpointu
      return {
        continentId: this.locationContinentId || 1,
        countryId: this.locationCountryId || 1,
        cityId: this.locationCityId || 1
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
        // Získať location IDs (zatiaľ placeholder)
        const locationIds = await this.fetchLocationIds();

        const payload = {
          username: this.name,
          email: this.email,
          password: this.password,
          password_confirmation: this.passwordConfirmation,
          date_birth: this.dateOfBirth,
          gender: this.gender,
          location_country_id: locationIds.countryId,
          location_continent_id: locationIds.continentId,
          location_city_id: locationIds.cityId
        };

        if (process.env.NODE_ENV === "development") {
          console.log("🚀 Register payload:", payload);
        }

        const { data } = await api.post("/register", payload);

        if (process.env.NODE_ENV === "development") {
          console.log("✅ Register response:", data);
        }

        // BE register endpoint NEVRÁTI token (len user)
        // Preto po úspešnej registrácii automaticky prihlásime používateľa
        if (data && data.status === "success" && data.user) {
          // Automaticky prihlásiť používateľa po registrácii
          const authStore = useAuthStore();
          await authStore.login({
            email: this.email,
            password: this.password
          });

          // Reset onboarding store po úspešnej registrácii
          this.reset();

          return data;
        } else {
          throw new Error(data?.message || "Registration failed");
        }
      } catch (error: unknown) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Registration error:", error);
        }

        // Spracovať error response z BE
        const errorResponse = error as {
          response?: {
            data?: {
              message?: string;
              errors?: Record<string, string[]>;
            };
          };
        };

        if (errorResponse.response?.data?.message) {
          this.error = errorResponse.response.data.message;
        } else if (errorResponse.response?.data?.errors) {
          // Laravel validation errors
          const errors = errorResponse.response.data.errors;
          const firstError = Object.values(errors)[0];
          this.error = Array.isArray(firstError) ? firstError[0] : "Validation error";
        } else {
          this.error = "Registration failed. Please try again.";
        }

        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
