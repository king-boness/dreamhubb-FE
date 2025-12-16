// src/stores/posts.ts
import { defineStore } from "pinia";
import { api } from "boot/axios";

// Type for post detail (matches BE response structure)
export type PostDetail = {
  post_id: number;
  title: string;
  description: string;
  date_created: string;
  date_deadline: string | null;
  tokens: number;
  views: number;
  type: string | null; // dream/problem/idea
  fe_category: string | null; // FE category name (traveling, health, etc.)
  category_name: string; // BE category name (pre kompatibilitu)
  author_name: string;
  author_bio?: string | null;
  images: string[];
};

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
    recentlyAccomplishedDreams: [] as Record<string, unknown>[],
    recentlyAccomplishedLoading: false,
    recentlyAccomplishedError: null as string | null,
    // Filters state
    filters: {
      type: null as "dream" | "problem" | "idea" | null,
      categoryId: null as number | null, // BE category_id (fallback)
      feCategory: null as string | null, // FE category name (traveling, health, etc.) - preferované
      continentId: null as number | null,
      countryId: null as number | null,
      cityId: null as number | null
    }
  }),

  actions: {
    // Nastavenie filtrov
    setFilters(partial: Partial<typeof this.filters>) {
      // Explicitne nastaviť hodnoty - ak je null, nastaviť na null (nie zachovať starú hodnotu)
      this.filters = {
        type: partial.type !== undefined ? partial.type : this.filters.type,
        categoryId: partial.categoryId !== undefined ? partial.categoryId : this.filters.categoryId,
        feCategory: partial.feCategory !== undefined ? partial.feCategory : this.filters.feCategory,
        continentId: partial.continentId !== undefined ? partial.continentId : this.filters.continentId,
        countryId: partial.countryId !== undefined ? partial.countryId : this.filters.countryId,
        cityId: partial.cityId !== undefined ? partial.cityId : this.filters.cityId
      };
    },

    // Reset filtrov
    resetFilters() {
      this.filters = {
        type: null,
        categoryId: null,
        feCategory: null,
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

        // Pridať type filter (ak je nastavený a nie je null)
        if (this.filters.type !== null && this.filters.type !== undefined) {
          queryParams.type = this.filters.type;
        }

        // Pridať fe_category filter (FE category name - traveling, health, etc.)
        // Toto je presnejšie ako category_id, pretože viacero FE kategórií sa mapuje na rovnaké BE category_id
        // fe_category sa nastaví v FiltersPage pri aplikovaní filtrov
        if (this.filters.feCategory) {
          queryParams.fe_category = this.filters.feCategory;
        } else if (this.filters.categoryId !== null && this.filters.categoryId !== undefined) {
          // Fallback: Pridať category_id filter (ak fe_category nie je nastavené)
          // Zabezpečiť, že category_id je číslo
          queryParams.category_id = Number(this.filters.categoryId);
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

        if (process.env.NODE_ENV === "development") {
          console.log("📦 Fetching posts with params:", queryParams);
          console.log("📦 Current filters in store:", this.filters);
          console.log("📦 Location filter details:", {
            cityId: this.filters.cityId,
            cityId_type: typeof this.filters.cityId,
            countryId: this.filters.countryId,
            continentId: this.filters.continentId,
            sending_city_id: queryParams.location_city_id,
            sending_city_id_type: typeof queryParams.location_city_id,
            sending_country_id: queryParams.location_country_id,
            sending_continent_id: queryParams.location_continent_id,
            all_query_params: Object.keys(queryParams)
          });
        }

        const { data } = await api.get("/posts", { params: queryParams });

        // Robustný fallback pre rôzne BE štruktúry
        this.posts = data.data || data.posts || data || [];

        if (process.env.NODE_ENV === "development") {
          console.log("📦 Posts received from BE:", this.posts.length, "posts");
          if (this.posts.length > 0) {
            const firstPost = this.posts[0];
            console.log("📦 First post details:", {
              post_id: firstPost.post_id || firstPost.id,
              title: firstPost.title,
              type: firstPost.type,
              category_id: firstPost.category_id,
              category_name: firstPost.category_name,
              author_name: firstPost.author_name,
              has_user: !!firstPost.user,
              user_profile_picture: firstPost.user?.profile_picture,
              author_picture: firstPost.author_picture,
              author_city: firstPost.author_city,
              author_country: firstPost.author_country,
              author_continent: firstPost.author_continent,
              full_user_object: firstPost.user
            });
          }
        }

        if (process.env.NODE_ENV === "development") {
          console.log("📦 Posts fetched:", this.posts.length, "posts");
        }
      } catch (error: unknown) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Failed to fetch posts:", error);
        }
        this.error = "Failed to load posts.";
      } finally {
        this.loading = false;
      }
    },

    // Nastavenie aktuálneho postu (napr. pri otvorení z feedu)
    setCurrentPost(post: PostDetail | null) {
      this.currentPost = post;
    },

    // Načítanie detailu postu podľa ID
    async fetchPostById(id: number) {
      this.detailLoading = true;
      this.detailError = null;

      try {
        // Najprv skús nájsť post v už načítanom zozname (cache)
        const cachedPost = this.posts.find(
          (p) => (p.post_id || p.id) === id
        );

        if (cachedPost) {
          // Mapovať cached post na PostDetail typ
          const mappedPost: PostDetail = {
            post_id: (cachedPost.post_id || cachedPost.id) as number,
            title: (cachedPost.title || "") as string,
            description: (cachedPost.description || "") as string,
            date_created: (cachedPost.date_created || cachedPost.created_at || "") as string,
            date_deadline: (cachedPost.date_deadline || null) as string | null,
            tokens: (cachedPost.tokens || 0) as number,
            views: (cachedPost.views || 0) as number,
            type: (cachedPost.type || "dream") as string | null,
            fe_category: (cachedPost.fe_category || null) as string | null,
            category_name: (cachedPost.category_name || "") as string,
            // BE now sends user_id directly in response - map from cache too
            author_id: (cachedPost.user_id || cachedPost.author_id || cachedPost.user?.id || null) as number | null,
            user_id: (cachedPost.user_id || null) as number | null,
            author_name: (cachedPost.author_name || "") as string,
            author_picture: (cachedPost.author_picture || cachedPost.user?.profile_picture || null) as string | null,
            user: (cachedPost.user || null) as { profile_picture?: string | null; [key: string]: unknown } | null,
            images: Array.isArray(cachedPost.images)
              ? (cachedPost.images as string[])
              : [],
            // Add author location data from cache
            author_city: (cachedPost.author_city || null) as string | null,
            author_country: (cachedPost.author_country || null) as string | null,
            author_continent: (cachedPost.author_continent || null) as string | null,
            author_bio: (cachedPost.author_bio || null) as string | null
          };
          this.currentPost = mappedPost;

          // Pridať minimálne oneskorenie, aby sa splash screen stihol zobraziť
          await new Promise((resolve) => setTimeout(resolve, 500));
          this.detailLoading = false;

          if (process.env.NODE_ENV === "development") {
            console.log("📦 Post loaded from cache:", id);
            console.log("📦 Cached post mapping:", {
              post_id: mappedPost.post_id,
              author_id: mappedPost.author_id,
              user_id: mappedPost.user_id,
              author_name: mappedPost.author_name,
              raw_cachedPost: {
                user_id: cachedPost.user_id,
                author_id: cachedPost.author_id,
                user: cachedPost.user
              }
            });
          }
          return;
        }

        // Ak nie je v cache, načítaj z BE
        if (process.env.NODE_ENV === "development") {
          console.log("📦 Fetching post detail from BE:", id);
        }

        const { data } = await api.get(`/posts/${id}`);

        // BE vracia { status: 'success', post: {...} }
        const postData = data.post || data.data || data;

        if (!postData) {
          throw new Error("Post not found");
        }

        // Normalize images field (BE môže vrátiť JSON string alebo array)
        let images: string[] = [];
        if (Array.isArray(postData.images)) {
          images = postData.images;
        } else if (typeof postData.images === "string") {
          try {
            const decoded = JSON.parse(postData.images);
            images = Array.isArray(decoded) ? decoded : [];
          } catch {
            images = [];
          }
        }

        this.currentPost = {
          post_id: postData.post_id || postData.id,
          title: postData.title || "",
          description: postData.description || "",
          date_created: postData.date_created || postData.created_at || "",
          date_deadline: postData.date_deadline || null,
          tokens: postData.tokens || 0,
          views: postData.views || 0,
          type: postData.type || "dream",
          fe_category: postData.fe_category || null,
          category_name: postData.category_name || "",
          // BE now sends user_id directly in response
          author_id: postData.user_id || postData.author_id || postData.user?.id || null,
          user_id: postData.user_id || null, // Store user_id separately for easier access
          author_name: postData.author_name || "",
          images,
          // Add user/author data for avatar - BE now sends author_picture directly
          user: postData.user || null,
          author_picture: postData.author_picture || postData.user?.profile_picture || null,
          // Add author location data
          author_city: postData.author_city || null,
          author_country: postData.author_country || null,
          author_continent: postData.author_continent || null,
          author_bio: postData.author_bio || null
        };

        if (process.env.NODE_ENV === "development") {
          console.log("📦 Post detail fetched:", {
            ...this.currentPost,
            raw_postData: {
              author_id: postData.author_id,
              user_id: postData.user_id,
              user: postData.user,
              author_name: postData.author_name,
              author_city: postData.author_city,
              author_country: postData.author_country,
              author_continent: postData.author_continent
            }
          });
        }
      } catch (error: unknown) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Failed to fetch post detail:", error);
        }

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
    async donateToPost(postId: number, tokens: number) {
      this.donateLoading = true;
      this.donateError = null;

      try {
        if (process.env.NODE_ENV === "development") {
          console.log("💰 Donating tokens:", { postId, tokens });
        }

        const { data } = await api.post(`/posts/${postId}/donate`, {
          tokens
        });

        if (process.env.NODE_ENV === "development") {
          console.log("💰 Donation successful:", data);
        }

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
        if (data.user?.tokens !== undefined) {
          const { useAuthStore } = await import("src/stores/auth");
          const authStore = useAuthStore();
          authStore.updateTokens(data.user.tokens);
        }

        return data;
      } catch (error: unknown) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Donation failed:", error);
        }

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

        // Filter by type if specified (default to 'dream' for "My Dreams")
        if (!queryParams.type) {
          queryParams.type = "dream";
        }

        if (process.env.NODE_ENV === "development") {
          console.log("📦 Fetching my dreams with params:", queryParams);
        }

        const { data } = await api.get("/my-posts", { params: queryParams });

        // Robustný fallback pre rôzne BE štruktúry
        this.myDreams = data.data || data.posts || data || [];

        if (process.env.NODE_ENV === "development") {
          console.log("📦 My dreams received from BE:", this.myDreams.length, "posts");
        }
      } catch (error: unknown) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Failed to fetch my dreams:", error);
        }
        this.myDreamsError = "Failed to load your dreams.";
      } finally {
        this.myDreamsLoading = false;
      }
    },

    // 🟣 Fetch my problems (posts of logged-in user with type=problem)
    async fetchMyProblems(params: Record<string, unknown> = {}) {
      this.myProblemsLoading = true;
      this.myProblemsError = null;

      try {
        const queryParams: Record<string, unknown> = { ...params };

        // Filter by type if specified (default to 'problem' for "My Problems")
        if (!queryParams.type) {
          queryParams.type = "problem";
        }

        if (process.env.NODE_ENV === "development") {
          console.log("📦 Fetching my problems with params:", queryParams);
        }

        const { data } = await api.get("/my-posts", { params: queryParams });

        // Robustný fallback pre rôzne BE štruktúry
        this.myProblems = data.data || data.posts || data || [];

        if (process.env.NODE_ENV === "development") {
          console.log("📦 My problems received from BE:", this.myProblems.length, "posts");
        }
      } catch (error: unknown) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Failed to fetch my problems:", error);
        }
        this.myProblemsError = "Failed to load your problems.";
      } finally {
        this.myProblemsLoading = false;
      }
    },

    // 🟣 Fetch my ideas (posts of logged-in user with type=idea)
    async fetchMyIdeas(params: Record<string, unknown> = {}) {
      this.myIdeasLoading = true;
      this.myIdeasError = null;

      try {
        const queryParams: Record<string, unknown> = { ...params };

        // Filter by type if specified (default to 'idea' for "My Ideas")
        if (!queryParams.type) {
          queryParams.type = "idea";
        }

        if (process.env.NODE_ENV === "development") {
          console.log("📦 Fetching my ideas with params:", queryParams);
        }

        const { data } = await api.get("/my-posts", { params: queryParams });

        // Robustný fallback pre rôzne BE štruktúry
        this.myIdeas = data.data || data.posts || data || [];

        if (process.env.NODE_ENV === "development") {
          console.log("📦 My ideas received from BE:", this.myIdeas.length, "posts");
        }
      } catch (error: unknown) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Failed to fetch my ideas:", error);
        }
        this.myIdeasError = "Failed to load your ideas.";
      } finally {
        this.myIdeasLoading = false;
      }
    },

    // 🟣 Fetch recently accomplished dreams
    async fetchRecentlyAccomplishedDreams() {
      this.recentlyAccomplishedLoading = true;
      this.recentlyAccomplishedError = null;

      try {
        // For now, we'll use my-posts endpoint with type=dream
        // TODO: When BE adds is_accomplished or status column, filter by that
        // For now, return empty array or filter by some criteria (e.g., tokens reached a threshold)
        const { data } = await api.get("/my-posts", {
          params: { type: "dream" }
        });

        const allDreams = data.data || data.posts || data || [];

        // TODO: Filter accomplished dreams when BE supports it
        // For now, we'll return empty array or filter by high tokens as a placeholder
        // Filter dreams with tokens >= 1000 as "accomplished" (placeholder logic)
        this.recentlyAccomplishedDreams = allDreams.filter(
          (post: Record<string, unknown>) => (post.tokens as number) >= 1000
        ).slice(0, 10); // Limit to 10 most recent

        if (process.env.NODE_ENV === "development") {
          console.log("📦 Recently accomplished dreams:", this.recentlyAccomplishedDreams.length, "posts");
        }
      } catch (error: unknown) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Failed to fetch recently accomplished dreams:", error);
        }
        this.recentlyAccomplishedError = "Failed to load accomplished dreams.";
      } finally {
        this.recentlyAccomplishedLoading = false;
      }
    }
  }
});
