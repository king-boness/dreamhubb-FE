// src/stores/postCreation.ts
import { defineStore } from "pinia";
import { api } from "boot/axios";
import { mapAxiosErrorToDhError } from "src/utils/httpError";
import { tGlobal } from "src/utils/i18nGlobal";
import type { CategorySlug, SubcategorySlug } from "src/domain/categories";

interface PostCreationState {
  title: string;
  description: string;
  dateDeadline: string | null;
  tokens: number;
  // New format: using slugs
  category: CategorySlug | null;
  subcategory: SubcategorySlug | null;
  images: string[];
  loading: boolean;
  error: string | null;
}

export const usePostCreationStore = defineStore("postCreation", {
  state: (): PostCreationState => ({
    title: "",
    description: "",
    dateDeadline: null,
    tokens: 0,
    category: null,
    subcategory: null,
    images: [],
    loading: false,
    error: null
  }),

  getters: {
    // Check if all required fields are filled
    isValid(): boolean {
      return !!(
        this.title.trim() &&
        this.description.trim() &&
        this.category &&
        this.subcategory
      );
    }
  },

  actions: {
    // Set category (slug)
    setCategory(category: CategorySlug | null) {
      this.category = category;
    },

    // Set subcategory (slug)
    setSubcategory(subcategory: SubcategorySlug | null) {
      this.subcategory = subcategory;
    },

    // Set title
    setTitle(title: string) {
      this.title = title;
    },

    // Set description
    setDescription(description: string) {
      this.description = description;
    },

    // Set date deadline
    setDateDeadline(dateDeadline: string | null) {
      this.dateDeadline = dateDeadline;
    },

    // Set tokens
    setTokens(tokens: number) {
      this.tokens = tokens;
    },

    // Set images
    setImages(images: string[]) {
      this.images = images;
    },

    // Add image
    addImage(image: string) {
      if (!this.images.includes(image)) {
        this.images.push(image);
      }
    },

    // Remove image
    removeImage(image: string) {
      this.images = this.images.filter((img) => img !== image);
    },

    // Reset form
    reset() {
      this.title = "";
      this.description = "";
      this.dateDeadline = null;
      this.tokens = 0;
      this.category = null;
      this.subcategory = null;
      this.images = [];
      this.error = null;
    },

    // Create post (optional imageFiles: when provided, send multipart/form-data with images[])
    async createPost(imageFiles?: File[]): Promise<{ post_id: number } | null> {
      const MIN_SUBMIT_TOKENS = 10;

      // Frontend guard (extra safety): reward must be at least 10 before hitting BE
      if ((this.tokens ?? 0) < MIN_SUBMIT_TOKENS) {
        this.error = tGlobal("common.errors.validation", "Please check your input and try again.");
        return null;
      }

      if (!this.isValid || !this.category || !this.subcategory) {
        this.error = tGlobal("common.errors.validation", "Please check your input and try again.");
        return null;
      }

      this.loading = true;
      this.error = null;

      try {
        const hasFiles = Array.isArray(imageFiles) && imageFiles.length > 0;

        if (hasFiles) {
          // Multipart: FormData (nech axios nastaví Content-Type s boundary; Authorization pridá interceptor)
          const fd = new FormData();
          fd.append("title", this.title);
          fd.append("description", this.description);
          fd.append("subcategory", this.subcategory);
          fd.append("category", this.category);
          fd.append("tokens", String(this.tokens || 0));
          if (this.dateDeadline) {
            fd.append("date_deadline", this.dateDeadline);
          }
          imageFiles!.forEach((file) => {
            fd.append("images[]", file, file.name || "image");
          });

          const { data } = await api.post("/post-create", fd);

          if (data.status === "success") {
            this.reset();
            return {
              post_id: data.post_id,
              user: data.user ? { tokens: data.user.tokens } : undefined
            };
          }
        }

        // JSON payload (bez súborov alebo s obrázkami ako URL)
        let safeImages: string[] = [];
        if (Array.isArray(this.images)) {
          safeImages = this.images
            .map((img) => {
              if (typeof img === "string") return img.trim() || null;
              if (img && typeof img === "object" && "url" in img && typeof img.url === "string") {
                return img.url.trim() || null;
              }
              return null;
            })
            .filter((img): img is string => Boolean(img) && img.length > 0);
        }

        const payload: Record<string, unknown> = {
          title: this.title,
          description: this.description,
          category: this.category,
          subcategory: this.subcategory,
          tokens: this.tokens || 0
        };
        if (this.dateDeadline) payload.date_deadline = this.dateDeadline;
        if (safeImages.length > 0) payload.images = safeImages;

        const { data } = await api.post("/post-create", payload);

        if (data.status === "success") {
          this.reset();
          return {
            post_id: data.post_id,
            user: data.user ? { tokens: data.user.tokens } : undefined
          };
        }
      } catch (error: unknown) {
        if (import.meta.env.DEV) {
          console.debug("Post creation failed:", error);
        }
        const mapped = mapAxiosErrorToDhError(error);
        this.error = tGlobal(mapped.messageKey, mapped.fallbackMessage);
        return null;
      } finally {
        this.loading = false;
      }
      return null;
    }
  }
});
