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

    // Create post - vždy používa FormData (multipart/form-data) pre jednotnú logiku
    // imageFiles: voliteľné File[] - ak sú prítomné, prvý sa posiela ako 'file', ostatné ako 'images[]'
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
        // Vždy používaj FormData (aj bez fotky) pre jednotnú logiku
        const fd = new FormData();
        fd.append("title", this.title);
        fd.append("description", this.description);
        fd.append("subcategory", this.subcategory);
        fd.append("category", this.category);
        fd.append("tokens", String(this.tokens || 0));
        if (this.dateDeadline) {
          fd.append("date_deadline", this.dateDeadline);
        }

        // Ak sú súbory, pridaj prvý ako 'file', ostatné ako 'images[]'
        if (Array.isArray(imageFiles) && imageFiles.length > 0) {
          imageFiles.forEach((file, i) => {
            if (i === 0) {
              fd.append("file", file, file.name || "image");
            } else {
              fd.append("images[]", file, file.name || "image");
            }
          });
        }

        // Ak sú obrázky ako URL (Cloudinary), pridaj ako pole URL-ov
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
        if (safeImages.length > 0) {
          safeImages.forEach((url) => {
            fd.append("images[]", url);
          });
        }

        // Axios automaticky nastaví Content-Type: multipart/form-data s boundary
        // Authorization header pridá interceptor
        const { data } = await api.post("/post-create", fd);

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
