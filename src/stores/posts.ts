// src/stores/posts.ts
import { defineStore } from "pinia";
import { api } from "boot/axios";
import { normalizePost, type NormalizedPost } from "src/utils/normalizePost";
import type { CategorySlug, SubcategorySlug } from "src/domain/categories";

// Type for post detail - using normalized format
export type PostDetail = NormalizedPost;

export const usePostsStore = defineStore("posts", {
  state: () => ({
    posts: [] as Record<string, unknown>[],
    loading: false,
    error: null as string | null,
    // Post detail state
    currentPost: null as PostDetail | null,
    detailLoading: false,
    detailError: null as string | null,
    // Donate state
    donateLoading: false,
    donateError: null as string | null,
    // My Dreams state
    myDreams: [] as Record<string, unknown>[],
    myDreamsLoading: false,
    myDreamsError: null as string | null,
    // My Problems state
    myProblems: [] as Record<string, unknown>[],
    myProblemsLoading: false,
    myProblemsError: null as string | null,
    // My Ideas state
    myIdeas: [] as Record<string, unknown>[],
    myIdeasLoading: false,
    myIdeasError: null as string | null,
    // Recently Accomplished Dreams state
    // Filters state - using new API (category/subcategory slugs)
    filters: {
      categorySlug: null as CategorySlug | null,
      subcategorySlug: null as SubcategorySlug | null,
      continentId: null as number | null,
      countryId: null as number | null,
      cityId: null as number | null
    }
  }),

  actions: {
    // Nastavenie filtrov - using new API (category/subcategory slugs)
    setFilters(partial: Partial<typeof this.filters>) {
      // Explicitne nastaviť hodnoty - ak je null, nastaviť na null (nie zachovať starú hodnotu)
      // If categorySlug changes, reset subcategorySlug
      if (partial.categorySlug !== undefined && partial.categorySlug !== this.filters.categorySlug) {
        this.filters = {
          categorySlug: partial.categorySlug,
          subcategorySlug: null, // Reset subcategory when category changes
          continentId: partial.continentId !== undefined ? partial.continentId : this.filters.continentId,
          countryId: partial.countryId !== undefined ? partial.countryId : this.filters.countryId,
          cityId: partial.cityId !== undefined ? partial.cityId : this.filters.cityId
        };
      } else {
        this.filters = {
          categorySlug: partial.categorySlug !== undefined ? partial.categorySlug : this.filters.categorySlug,
          subcategorySlug: partial.subcategorySlug !== undefined ? partial.subcategorySlug : this.filters.subcategorySlug,
          continentId: partial.continentId !== undefined ? partial.continentId : this.filters.continentId,
          countryId: partial.countryId !== undefined ? partial.countryId : this.filters.countryId,
          cityId: partial.cityId !== undefined ? partial.cityId : this.filters.cityId
        };
      }
    },

    // Reset filtrov
    resetFilters() {
      this.filters = {
        categorySlug: null,
        subcategorySlug: null,
        continentId: null,
        countryId: null,
        cityId: null
      };
    },

    async fetchPosts(params: Record<string, unknown> = {}) {
      // Clear feed before fetching new posts (to prevent mixing old and new results)
      this.posts = [];
      this.loading = true;
      this.error = null;

      try {
        // Zostaviť query parametre z params a filters
        const queryParams: Record<string, unknown> = { ...params };

        // Pridať sort parameter (ak je v params)
        // sort už funguje v FE, BE ho zatiaľ ignoruje, ale FE logika je pripravená

        // Pridať category filter (ak je nastavený a nie je null) - using new API
        if (this.filters.categorySlug !== null && this.filters.categorySlug !== undefined) {
          queryParams.category = this.filters.categorySlug;
        }

        // Pridať subcategory filter (ak je nastavený a nie je null) - using new API
        if (this.filters.subcategorySlug !== null && this.filters.subcategorySlug !== undefined) {
          queryParams.subcategory = this.filters.subcategorySlug;
        }

        // Location filtre (ids) - priority: city > country > continent
        // Send only the most specific location filter to BE
        // If city is set, send only city (BE will filter strictly by city)
        // If city is not set but country is set, send only country (BE will filter strictly by country)
        // If only continent is set, send only continent
        if (this.filters.cityId && this.filters.cityId > 0) {
          queryParams.location_city_id = Number(this.filters.cityId);
          // Explicitly remove country/continent params when city is selected (strict filtering)
          delete queryParams.location_country_id;
          delete queryParams.location_continent_id;
        } else if (this.filters.countryId && this.filters.countryId > 0) {
          queryParams.location_country_id = Number(this.filters.countryId);
          // Explicitly remove city/continent params when country is selected (strict filtering)
          delete queryParams.location_city_id;
          delete queryParams.location_continent_id;
        } else if (this.filters.continentId && this.filters.continentId > 0) {
          queryParams.location_continent_id = Number(this.filters.continentId);
          // Explicitly remove city/country params when continent is selected
          delete queryParams.location_city_id;
          delete queryParams.location_country_id;
        } else {
          // No location filters - explicitly remove all location params
          delete queryParams.location_city_id;
          delete queryParams.location_country_id;
          delete queryParams.location_continent_id;
        }

        const { data } = await api.get("/posts", { params: queryParams });

        // Robustný fallback pre rôzne BE štruktúry
        this.posts = data.data || data.posts || data || [];
      } catch (error: unknown) {
        this.error = "Failed to load posts.";
      } finally {
        this.loading = false;
      }
    },

    // Nastavenie aktuálneho postu (napr. pri otvorení z feedu)
    setCurrentPost(post: PostDetail | null) {
      this.currentPost = post;
    },

    // Helper: Update post in all relevant cache arrays
    // This ensures that after an update, the post is updated everywhere (detail, feed lists, my-posts, etc.)
    upsertPostEverywhere(normalizedPost: NormalizedPost) {
      const postId = normalizedPost.post_id;

      // Update in main posts array (feed)
      const postIndex = this.posts.findIndex(
        (p) => (p.post_id || p.id) === postId
      );
      if (postIndex !== -1) {
        this.posts[postIndex] = normalizedPost;
      } else {
        this.posts.push(normalizedPost);
      }

      // Update in myDreams if exists
      const myDreamsIndex = this.myDreams.findIndex(
        (p) => (p.post_id || p.id) === postId
      );
      if (myDreamsIndex !== -1) {
        this.myDreams[myDreamsIndex] = normalizedPost;
      }

      // Update in myProblems if exists
      const myProblemsIndex = this.myProblems.findIndex(
        (p) => (p.post_id || p.id) === postId
      );
      if (myProblemsIndex !== -1) {
        this.myProblems[myProblemsIndex] = normalizedPost;
      }

      // Update in myIdeas if exists
      const myIdeasIndex = this.myIdeas.findIndex(
        (p) => (p.post_id || p.id) === postId
      );
      if (myIdeasIndex !== -1) {
        this.myIdeas[myIdeasIndex] = normalizedPost;
      }

      // Update currentPost if it's the same post
      if (this.currentPost && (this.currentPost.post_id || this.currentPost.id) === postId) {
        this.currentPost = normalizedPost;
      }
    },

    // Načítanie detailu postu podľa ID
    async fetchPostById(id: number, options?: { force?: boolean }) {
      this.detailLoading = true;
      this.detailError = null;

      try {
        // Ak force=true, vždy refetch z BE (napr. po update)
        const forceRefetch = options?.force === true;

        if (!forceRefetch) {
          // Najprv skús nájsť post v už načítanom zozname (cache)
          const cachedPost = this.posts.find(
            (p) => (p.post_id || p.id) === id
          );

          if (cachedPost) {
            // Normalize cached post using normalizePost() - handles legacy and new formats
            this.currentPost = normalizePost(cachedPost);

            // Pridať minimálne oneskorenie, aby sa splash screen stihol zobraziť
            await new Promise((resolve) => setTimeout(resolve, 500));
            this.detailLoading = false;

            return;
          }
        }

        // Ak nie je v cache alebo force=true, načítaj z BE
        const { data } = await api.get(`/posts/${id}`);

        // BE vracia { status: 'success', post: {...} }
        const postData = data.post || data.data || data;

        if (!postData) {
          throw new Error("Post not found");
        }

        // Normalize post data using normalizePost() - handles legacy and new formats
        const normalizedPost = normalizePost(postData);
        this.currentPost = normalizedPost;

        // IMPORTANT: Update cache (posts array) with fresh data
        // This ensures that subsequent calls to fetchPostById will return updated data
        const postIndex = this.posts.findIndex(
          (p) => (p.post_id || p.id) === id
        );
        if (postIndex !== -1) {
          // Update existing post in cache
          this.posts[postIndex] = normalizedPost;
        } else {
          // Add to cache if not present
          this.posts.push(normalizedPost);
        }
      } catch (error: unknown) {
        // Handle 404 specifically
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as { response?: { status?: number } };
          if (axiosError.response?.status === 404) {
            this.detailError = "Post not found";
          } else {
            this.detailError = "Failed to load post.";
          }
        } else {
          this.detailError = "Failed to load post.";
        }

        this.currentPost = null;
      } finally {
        this.detailLoading = false;
      }
    },

    // 💰 Donate tokens to a post
    async donateToPost(
      postId: number,
      tokens: number,
      opts?: { idempotencyKey?: string }
    ) {
      this.donateLoading = true;
      this.donateError = null;

      try {
        const { data } = await api.post(
          `/posts/${postId}/donate`,
          {
            tokens,
            idempotency_key: opts?.idempotencyKey || undefined
          },
          opts?.idempotencyKey
            ? {
                headers: {
                  "Idempotency-Key": opts.idempotencyKey
                }
              }
            : undefined
        );

        // ✅ On success: Re-fetch post detail to get updated data
        if (data.post) {
          // Update currentPost if it's the same post
          if (this.currentPost && this.currentPost.post_id === postId) {
            this.currentPost.tokens = data.post.tokens;
          }
          // Re-fetch full post detail to ensure all data is up to date
          await this.fetchPostById(postId);
        }

        // ✅ Update user tokens in auth store if BE returns updated user tokens
        const { useAuthStore } = await import("src/stores/auth");
        const authStore = useAuthStore();

        if (data.user?.tokens !== undefined) {
          authStore.updateTokens(data.user.tokens);
        } else {
          // If BE doesn't return tokens, refresh from API
          // This ensures UI always shows correct balance
          try {
            await authStore.refreshTokenBalance();
          } catch (error) {
            // Don't block UX if refresh fails
          }
        }

        return data;
      } catch (error: unknown) {
        // Handle different error types
        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: {
              status?: number;
              data?: {
                message?: string;
                errors?: Record<string, string[]>;
              };
            };
          };

          if (axiosError.response?.data?.message) {
            this.donateError = axiosError.response.data.message;
          } else if (axiosError.response?.status === 400) {
            this.donateError = "Insufficient tokens or invalid request.";
          } else if (axiosError.response?.status === 401) {
            this.donateError = "Please log in to donate.";
          } else if (axiosError.response?.status === 403) {
            this.donateError = "You cannot donate to your own post.";
          } else if (axiosError.response?.status === 404) {
            this.donateError = "Post not found.";
          } else if (axiosError.response?.status === 422) {
            this.donateError = "Invalid donation amount.";
          } else {
            this.donateError = "Failed to process donation. Please try again.";
          }
        } else {
          this.donateError = "Network error. Please check your connection.";
        }

        throw error;
      } finally {
        this.donateLoading = false;
      }
    },

    // 🟣 Fetch my dreams (posts of logged-in user)
    async fetchMyDreams(params: Record<string, unknown> = {}) {
      this.myDreamsLoading = true;
      this.myDreamsError = null;

      try {
        const queryParams: Record<string, unknown> = { ...params };

        // Filter by category if specified (default to 'dream' for "My Dreams") - using new API
        if (!queryParams.category) {
          queryParams.category = "dream";
        }

        const { data } = await api.get("/my-posts", { params: queryParams });

        // Normalize posts from API - using new API format
        const rawPosts = data.data || data.posts || data || [];
        this.myDreams = Array.isArray(rawPosts)
          ? rawPosts.map((raw: unknown) => normalizePost(raw as Parameters<typeof normalizePost>[0]))
          : [];
      } catch (error: unknown) {
        this.myDreamsError = "Failed to load your dreams.";
      } finally {
        this.myDreamsLoading = false;
      }
    },

    // 🟣 Fetch my problems (posts of logged-in user with category=problem)
    async fetchMyProblems(params: Record<string, unknown> = {}) {
      this.myProblemsLoading = true;
      this.myProblemsError = null;

      try {
        const queryParams: Record<string, unknown> = { ...params };

        // Filter by category slug (default to 'problem' for "My Problems") - using new API
        if (!queryParams.category) {
          queryParams.category = "problem";
        }

        const { data } = await api.get("/my-posts", { params: queryParams });

        // Normalize posts from API
        const rawPosts = data.data || data.posts || data || [];
        this.myProblems = Array.isArray(rawPosts)
          ? rawPosts.map((raw: unknown) => normalizePost(raw as Parameters<typeof normalizePost>[0]))
          : [];
      } catch (error: unknown) {
        this.myProblemsError = "Failed to load your problems.";
      } finally {
        this.myProblemsLoading = false;
      }
    },

    // 🟣 Fetch my ideas (posts of logged-in user with category=idea)
    async fetchMyIdeas(params: Record<string, unknown> = {}) {
      this.myIdeasLoading = true;
      this.myIdeasError = null;

      try {
        const queryParams: Record<string, unknown> = { ...params };

        // Filter by category slug (default to 'idea' for "My Ideas") - using new API
        if (!queryParams.category) {
          queryParams.category = "idea";
        }

        const { data } = await api.get("/my-posts", { params: queryParams });

        // Normalize posts from API
        const rawPosts = data.data || data.posts || data || [];
        this.myIdeas = Array.isArray(rawPosts)
          ? rawPosts.map((raw: unknown) => normalizePost(raw as Parameters<typeof normalizePost>[0]))
          : [];
      } catch (error: unknown) {
        this.myIdeasError = "Failed to load your ideas.";
      } finally {
        this.myIdeasLoading = false;
      }
    }

  }
});
