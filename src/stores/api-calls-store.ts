import { defineStore } from "pinia";
import { api } from "boot/axios";

/* --------------------------------------------
   FE typ pre zjednodušený POST (Feed)
-------------------------------------------- */
export type Post = {
  post_id: number;
  title: string;
  description: string;
  date_created: string;
  date_deadline: string | null;
  tokens: number;
  views: number;

  category_name: string;
  category_image?: string | null;

  author_name: string;
  author_picture?: string | null;

  images: string[];
};

/* --------------------------------------------
   FE typ pre detailný POST (Post Detail Page)
-------------------------------------------- */
export type FullPost = {
  post_id: number;
  title: string;
  description: string;
  date_created: string;
  date_deadline: string | null;
  tokens: number;
  views: number;
  category_name: string;
  author_name: string;
  images: string[];
};

export const useApiCallStore = defineStore("apiCall", {
  state: () => ({
    isAuthenticated: false,

    user: null as {
      id: number;
      username: string;
      email: string;
    } | null,

    /* Feed data */
    feedPosts: [] as Post[],
    feedLoading: false,
    feedError: null as string | null
  }),

  actions: {
    /* --------------------------------------------
       Login
    -------------------------------------------- */
    async login(data: { email: string; password: string }) {
      const res = await api.post("/login", data);

      const token =
        res.data?.authorization?.token ||
        res.data?.access_token ||
        res.data?.token;

      if (token) {
        localStorage.setItem("jwtToken", token);
        this.isAuthenticated = true;

        // Synchronizovať s user-store
        const { useUserStore } = await import("src/stores/user-store");
        const userStore = useUserStore();
        userStore.isAuthenticated = true;
        userStore.token = token;

        await this.fetchUser();
      }

      return res;
    },

    /* --------------------------------------------
       Registration
    -------------------------------------------- */
    async register(data: {
      name: string;
      email: string;
      password: string;
      password_confirmation: string;
      date_of_birth?: string;
      gender?: string;
    }) {
      const res = await api.post("/register", data);
      return res;
    },

    /* --------------------------------------------
       User profile
    -------------------------------------------- */
    async fetchUser() {
      try {
        const res = await api.get("/user");
        // Handle different possible response structures
        this.user = res.data?.user || res.data?.data || res.data;
      } catch (_) {}
    },

    /* --------------------------------------------
       FEED — načítanie všetkých postov
    -------------------------------------------- */
    async loadPosts() {
      try {
        this.feedLoading = true;
        this.feedError = null;

        const res = await api.get("/posts");

        const rawPosts = Array.isArray(res.data?.posts)
          ? res.data.posts
          : [];

        this.feedPosts = rawPosts.map((post: Record<string, unknown>) => ({
          post_id: post.post_id,
          title: post.title,
          description: post.description,
          date_created: post.date_created,
          date_deadline: post.date_deadline,
          tokens: post.tokens,
          views: post.views,
          category_name: post.category_name,
          category_image: post.category_image ?? null,
          author_name: post.author_name,
          author_picture: post.author_picture ?? null,
          images: Array.isArray(post.images)
            ? post.images.filter((img: unknown) => img)
            : []
        })) as Post[];

        return this.feedPosts;
      } catch (err) {
        this.feedError = "Nepodarilo sa načítať feed.";
        throw err;
      } finally {
        this.feedLoading = false;
      }
    },

    /* --------------------------------------------
       Fetch jedného postu podľa ID (detail)
    -------------------------------------------- */
    async getPostById(id: number): Promise<FullPost | null> {
      try {
        const res = await api.get(`/posts/${id}`);
        return res.data?.post ?? null;
      } catch (err) {
        if (import.meta.env.DEV) {
          console.debug("[ApiCallsStore] getPostById failed:", err);
        }
        throw err;
      }
    },

    /* --------------------------------------------
       Logout
    -------------------------------------------- */
    async logout() {
      try {
        // Volať BE /api/logout endpoint
        await api.post("/logout");
      } catch (error: unknown) {
        // Ignorovať chyby - redirect a token handling je v user-store.ts
        if (import.meta.env.DEV) {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.debug("[ApiCallsStore] Logout API call failed:", errorMessage);
        }
      } finally {
        // Vždy vymazať token a resetovať store
        // POZNÁMKA: Redirect je v user-store.ts, nie tu
        localStorage.removeItem("jwtToken");
        this.isAuthenticated = false;
        this.user = null;
      }
    },

    /* --------------------------------------------
       Completed Dreams - pre Auth Welcome screen
    -------------------------------------------- */
    async fetchLatestCompletedDreams(limit = 3): Promise<Array<{
      id: number;
      title: string;
      authorName: string;
      avatarUrl: string;
      imageUrl: string;
      locationLabel: string;
      mapX: number;
      mapY: number;
      completedAt: string;
    }>> {
      // TODO: Napojiť na backend endpoint (napr. GET /api/dreams/completed-latest?limit=3)
      // Zatiaľ vrátime hardcoded pole s 3 položkami, ktoré zodpovedajú dizajnu
      try {
        // Keď bude BE endpoint, odkomentovať:
        // const res = await api.get("/dreams/completed-latest", { params: { limit } });
        // return res.data;

        // Zatiaľ hardcoded data - používame externé placeholder URL, aby sme nemali 404
        return [
          {
            id: 1,
            title: "Aurora Expedition",
            authorName: "Felix Dhomberg",
            avatarUrl: "https://picsum.photos/seed/felix-avatar/80/80",
            imageUrl: "https://picsum.photos/seed/aurora/400/260",
            locationLabel: "Iceland, Reykjavik",
            mapX: 50,
            mapY: 20,
            completedAt: new Date().toISOString()
          },
          {
            id: 2,
            title: "Driving Tesla",
            authorName: "Katie Horvath",
            avatarUrl: "https://picsum.photos/seed/katie-avatar/80/80",
            imageUrl: "https://picsum.photos/seed/tesla/400/260",
            locationLabel: "USA, California",
            mapX: 20,
            mapY: 40,
            completedAt: new Date().toISOString()
          },
          {
            id: 3,
            title: "Eyes Surgery",
            authorName: "Eric Doe",
            avatarUrl: "https://picsum.photos/seed/eric-avatar/80/80",
            imageUrl: "https://picsum.photos/seed/eyes/400/260",
            locationLabel: "Germany, Berlin",
            mapX: 80,
            mapY: 40,
            completedAt: new Date().toISOString()
          }
        ].slice(0, limit);
      } catch (error) {
        if (import.meta.env.DEV) {
          console.debug("Failed to fetch completed dreams:", error);
        }
        return [];
      }
    }
  }
});
