import { defineStore } from "pinia";
import type { Inspiration } from "src/components/models";
import {
  loadInspirationsFeedPayload,
  readLocalInspirationsFromStorage,
  writeLocalInspirationsToStorage,
  type InspirationStory
} from "src/services/inspirationsFeedSource";
import { useAuthStore } from "src/stores/auth";
import { mapAxiosErrorToDhError } from "src/utils/httpError";

let lastViewerStoryLabel = "Your Story";

export const useInspirationsFeedStore = defineStore("inspirationsFeed", {
  state: () => ({
    items: [] as Inspiration[],
    myStory: [] as InspirationStory[],
    stories: [] as InspirationStory[],
    loading: false,
    error: null as string | null,
    dataSource: null as "api" | "mock" | null
  }),

  actions: {
    async fetchFeed(storyRingLabel?: string, force = false) {
      if (storyRingLabel) lastViewerStoryLabel = storyRingLabel;
      if (this.loading && !force) return;

      this.loading = true;
      this.error = null;
      try {
        const auth = useAuthStore();
        const avatar = auth.avatarUrl || "/images/Auth/profilePicture.jpeg";
        const payload = await loadInspirationsFeedPayload(avatar, lastViewerStoryLabel);
        this.items = payload.inspirations;
        this.myStory = payload.myStory;
        this.stories = payload.stories;
        this.dataSource = payload.source;
      } catch (e) {
        this.error = mapAxiosErrorToDhError(e).fallbackMessage || "Failed to load inspirations.";
      } finally {
        this.loading = false;
      }
    },

    /**
     * Launch-safe: persist to device and refresh feed. Replace with POST /inspirations when API exists.
     */
    async addLocalInspiration(description: string, imageUrl: string) {
      const auth = useAuthStore();
      const item: Inspiration = {
        id: `local-${Date.now()}`,
        user: {
          userName: auth.name || "You",
          userPicture: auth.avatarUrl || "/images/Auth/profilePicture.jpeg",
          userId: auth.user?.id
        },
        description: description.trim() || " ",
        inspirationInfo: {
          dateCreated: new Date().toLocaleDateString(undefined, {
            month: "2-digit",
            day: "2-digit",
            year: "numeric"
          }),
          likes: 0,
          inspirationImage: imageUrl
        },
        linkedPostId: null
      };
      const prev = readLocalInspirationsFromStorage();
      writeLocalInspirationsToStorage([item, ...prev]);
      await this.fetchFeed(undefined, true);
    },

    clearError() {
      this.error = null;
    },

    /** Stories slider "seen" ring — mutate in store to satisfy Pinia semantics */
    markStorySeen(index: number) {
      if (index) {
        const i = index - 1;
        if (this.stories[i]) this.stories[i].seen = true;
      } else if (this.stories.length) {
        this.stories[this.stories.length - 1].seen = true;
      }
    }
  }
});
