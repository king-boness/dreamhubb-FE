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
    // Filters state
    filters: {
      type: null as "dream" | "problem" | "idea" | null,
      categoryId: null as number | null, // BE category_id (fallback)
      feCategory: null as string | null // FE category name (traveling, health, etc.) - preferované
      // TODO: Location IDs - BE ešte nepodporuje location filtre
      // Keď BE implementuje podporu, odkomentovať:
      // continentId: null as number | null,
      // countryId: null as number | null,
      // cityId: null as number | null
    }
  }),

  actions: {
    // Nastavenie filtrov
    setFilters(partial: Partial<typeof this.filters>) {
      // Explicitne nastaviť hodnoty - ak je null, nastaviť na null (nie zachovať starú hodnotu)
      this.filters = {
        type: partial.type !== undefined ? partial.type : this.filters.type,
        categoryId: partial.categoryId !== undefined ? partial.categoryId : this.filters.categoryId,
        feCategory: partial.feCategory !== undefined ? partial.feCategory : this.filters.feCategory
      };
    },

    // Reset filtrov
    resetFilters() {
      this.filters = {
        type: null,
        categoryId: null,
        feCategory: null
        // TODO: Keď BE podporí location filtre, pridať:
        // continentId: null,
        // countryId: null,
        // cityId: null
      };
    },

    async fetchPosts(params: Record<string, unknown> = {}) {
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

        // TODO: Location filtre - BE ešte nepodporuje
        // Keď BE implementuje podporu, pridať:
        // if (this.filters.continentId) {
        //   queryParams.location_continent_id = this.filters.continentId;
        // }
        // if (this.filters.countryId) {
        //   queryParams.location_country_id = this.filters.countryId;
        // }
        // if (this.filters.cityId) {
        //   queryParams.location_city_id = this.filters.cityId;
        // }

        if (process.env.NODE_ENV === "development") {
          console.log("📦 Fetching posts with params:", queryParams);
          console.log("📦 Current filters in store:", this.filters);
        }

        const { data } = await api.get("/posts", { params: queryParams });

        // Robustný fallback pre rôzne BE štruktúry
        this.posts = data.data || data.posts || data || [];

        if (process.env.NODE_ENV === "development") {
          console.log("📦 Posts received from BE:", this.posts.length, "posts");
          console.log("📦 First post details:", this.posts[0] ? {
            post_id: this.posts[0].post_id || this.posts[0].id,
            title: this.posts[0].title,
            type: this.posts[0].type,
            category_id: this.posts[0].category_id,
            category_name: this.posts[0].category_name
          } : "No posts");
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
            author_name: (cachedPost.author_name || "") as string,
            images: Array.isArray(cachedPost.images)
              ? (cachedPost.images as string[])
              : []
          };
          this.currentPost = mappedPost;

          // Pridať minimálne oneskorenie, aby sa splash screen stihol zobraziť
          await new Promise((resolve) => setTimeout(resolve, 500));
          this.detailLoading = false;

          if (process.env.NODE_ENV === "development") {
            console.log("📦 Post loaded from cache:", id);
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
          author_name: postData.author_name || "",
          images
        };

        if (process.env.NODE_ENV === "development") {
          console.log("📦 Post detail fetched:", this.currentPost);
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
    }
  }
});
