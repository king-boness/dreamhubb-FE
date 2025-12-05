// src/stores/postCreation.ts
import { defineStore } from "pinia";
import { api } from "boot/axios";
// getCategoryId už nie je potrebné - používame priamo fe_category

export const usePostCreationStore = defineStore("postCreation", {
  state: () => ({
    // Post type (dream/problem/idea)
    type: null as "dream" | "problem" | "idea" | null,

    // Category
    category: null as string | null,
    categoryId: null as number | null, // BE očakáva category_id

    // Post content
    title: "" as string,
    description: "" as string,

    // Tokens (initial reward)
    tokens: 0 as number,

    // Location (zatiaľ stringy - TODO: mapovať na IDs ak BE vyžaduje)
    locationContinent: "" as string,
    locationCountry: "" as string,
    locationCity: "" as string,

    // Deadline (optional)
    dateDeadline: null as string | null,

    // Images (pole stringov - base64 alebo URL)
    // TODO: Reálny upload obrázkov cez /api/upload alebo FormData
    images: [] as string[],

    // UI state
    loading: false,
    error: null as string | null
  }),

  getters: {
    isValid(state): boolean {
      return !!(
        state.type &&
        state.category && // Kontrolujeme category (string), categoryId sa nastaví pri submit-e
        state.title &&
        state.description &&
        state.title.trim().length > 0 &&
        state.description.trim().length > 0 &&
        state.tokens >= 1 // Musí byť vybraný aspoň 1 token
      );
    }
  },

  actions: {
    // Univerzálna metóda na nastavenie poľa
    setField(fieldName: string, value: unknown) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (this as any)[fieldName] = value;
    },

    // Reset celého state
    reset() {
      this.type = null;
      this.category = null;
      this.categoryId = null;
      this.title = "";
      this.description = "";
      this.tokens = 0;
      this.locationContinent = "";
      this.locationCountry = "";
      this.locationCity = "";
      this.dateDeadline = null;
      this.images = [];
      this.loading = false;
      this.error = null;
    },

    // Mapovať category name na category_id pomocou categoryMapping
    async fetchCategoryId(categoryName: string): Promise<number | null> {
      // Použiť rovnaké mapovanie ako v FiltersPage
      // categoryId už nie je potrebné - používame priamo fe_category
      const categoryId = null;

      if (process.env.NODE_ENV === "development") {
        console.log("📝 Mapping category to ID:", {
          categoryName,
          categoryId
        });
      }

      return categoryId;
    },

    // Submit post - volá POST /api/post-create na BE
    async submit() {
      if (!this.isValid) {
        if (this.tokens < 1) {
          this.error = "Please select at least 1 token as initial reward.";
        } else {
          this.error = "Please fill in all required fields (type, category, title, description).";
        }
        return;
      }

      this.loading = true;
      this.error = null;

      try {
        // fe_category je povinné - používame priamo FE category name
        if (!this.category) {
          throw new Error("Category is required. Please select a category.");
        }

        // TODO: Reálny upload obrázkov
        // Zatiaľ používame placeholder URL ak nie sú obrázky
        // V produkcii by sme mali:
        // 1. Upload obrázkov cez /api/upload alebo FormData
        // 2. Získať URL-y z response
        // 3. Poslať ich v payload alebo ako multipart/form-data

        const payload: Record<string, unknown> = {
          title: this.title.trim(),
          description: this.description.trim(),
          fe_category: this.category, // FE category name (traveling, health, etc.) - povinné
          tokens: this.tokens || 0, // Pridať tokens (initial reward)
          type: this.type || "dream" // Post type (dream/problem/idea) - povinné
        };

        // Pridať optional polia
        if (this.dateDeadline) {
          payload.date_deadline = this.dateDeadline;
        }

        // TODO: Ak máme obrázky, poslať ich ako FormData alebo v payload
        // Zatiaľ neposielame obrázky - BE ich očakáva ako files v multipart/form-data
        // Ak máme base64 obrázky, museli by sme ich konvertovať na File objekty

        if (process.env.NODE_ENV === "development") {
          console.log("🚀 Post creation payload:", payload);
        }

        // POST na /api/post-create (podľa routes je to POST /api/post-create)
        const { data } = await api.post("/post-create", payload);

        if (process.env.NODE_ENV === "development") {
          console.log("✅ Post creation response:", data);
        }

        if (data && data.status === "success") {
          // Reset store po úspešnom submit-e
          this.reset();

          return data;
        } else {
          throw new Error(data?.message || "Post creation failed");
        }
      } catch (error: unknown) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Post creation error:", error);
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
          this.error = "Failed to create post. Please try again.";
        }

        throw error;
      } finally {
        this.loading = false;
      }
    }
  }
});
