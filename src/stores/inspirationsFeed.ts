import { defineStore } from "pinia";
import type { Inspiration } from "src/components/models";
import {
  createInspirationOnApi,
  deleteInspirationOnApi,
  loadInspirationsFeedPayload,
  type InspirationStory
} from "src/services/inspirationsFeedSource";
import { useAuthStore } from "src/stores/auth";
import { mapAxiosErrorToDhError } from "src/utils/httpError";
import { tGlobal } from "src/utils/i18nGlobal";

const DEFAULT_AVATAR = "/images/Auth/profilePicture.jpeg";

let lastViewerStoryLabel = "You";

export const useInspirationsFeedStore = defineStore("inspirationsFeed", {
  state: () => ({
    items: [] as Inspiration[],
    myStory: [] as InspirationStory[],
    stories: [] as InspirationStory[],
    loading: false,
    error: null as string | null
  }),

  actions: {
    async fetchFeed(storyRingLabel?: string, force = false) {
      if (storyRingLabel) lastViewerStoryLabel = storyRingLabel;
      if (this.loading && !force) return;

      this.loading = true;
      this.error = null;
      try {
        const auth = useAuthStore();
        const avatar = auth.avatarUrl || DEFAULT_AVATAR;
        const viewerId = auth.user?.id != null ? Number(auth.user.id) : null;
        const label =
          lastViewerStoryLabel ||
          auth.user?.username ||
          "You";
        const payload = await loadInspirationsFeedPayload(avatar, label, viewerId);
        this.items = payload.inspirations;
        this.myStory = payload.myStory;
        this.stories = payload.stories;
      } catch (e) {
        this.error =
          mapAxiosErrorToDhError(e).fallbackMessage ||
          tGlobal("feed.failedLoadInspirations", "Failed to load inspirations.");
      } finally {
        this.loading = false;
      }
    },

    async createInspiration(
      description: string,
      imageUrl: string,
      imagePublicId?: string | null
    ) {
      const created = await createInspirationOnApi(description, imageUrl, imagePublicId);
      this.items = [created, ...this.items.filter((x) => x.id !== created.id)];
      await this.fetchFeed(undefined, true);
    },

    async deleteInspiration(id: string) {
      await deleteInspirationOnApi(id);
      this.items = this.items.filter((x) => x.id !== id);
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
