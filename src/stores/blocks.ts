import { defineStore } from "pinia";
import {
  blockUser,
  fetchBlockedUsers,
  unblockUser,
  type BlockedUserSummary
} from "src/services/blockService";

export const useBlocksStore = defineStore("blocks", {
  state: () => ({
    blockedUserIds: [] as number[],
    blockedUsers: [] as BlockedUserSummary[],
    loaded: false
  }),

  getters: {
    isBlocked: (state) => (userId: number | string | null | undefined) => {
      if (userId === null || userId === undefined || userId === "") {
        return false;
      }

      return state.blockedUserIds.includes(Number(userId));
    }
  },

  actions: {
    async loadBlockedUsers(force = false) {
      if (this.loaded && !force) {
        return;
      }

      const users = await fetchBlockedUsers();
      this.blockedUsers = users;
      this.blockedUserIds = users.map((u) => Number(u.id));
      this.loaded = true;
    },

    async blockUser(userId: number) {
      await blockUser(userId);
      if (!this.blockedUserIds.includes(userId)) {
        this.blockedUserIds.push(userId);
      }
      if (!this.blockedUsers.some((u) => Number(u.id) === userId)) {
        this.blockedUsers.push({ id: userId });
      }
    },

    async unblockUser(userId: number) {
      await unblockUser(userId);
      this.blockedUserIds = this.blockedUserIds.filter((id) => id !== userId);
      this.blockedUsers = this.blockedUsers.filter((u) => Number(u.id) !== userId);
    },

    async removePostsByUserFromFeed(userId: number) {
      const { usePostsStore } = await import("src/stores/posts");
      const postsStore = usePostsStore();
      postsStore.posts = postsStore.posts.filter(
        (post) => Number((post as { user_id?: number }).user_id) !== userId
      );
    }
  }
});
