import { useRouter } from "vue-router";
import { useBlocksStore } from "src/stores/blocks";
import { usePostsStore } from "src/stores/posts";
import { notifySuccess, notifyError } from "src/utils/notify";
import { mapAxiosErrorToDhError } from "src/utils/httpError";

export function useBlockUser() {
  const blocksStore = useBlocksStore();
  const postsStore = usePostsStore();
  const router = useRouter();

  async function blockUserById(userId: number, options?: { navigateBack?: boolean }) {
    if (!userId) {
      return;
    }

    try {
      await blocksStore.blockUser(userId);
      await blocksStore.removePostsByUserFromFeed(userId);
      postsStore.posts = postsStore.posts.filter(
        (post) => Number((post as { user_id?: number }).user_id) !== userId
      );

      notifySuccess(
        "common.success.userBlocked",
        "User blocked. Their posts were removed from your feed.",
        { timeout: 3000 }
      );

      if (options?.navigateBack) {
        if (window.history.length > 1) {
          router.back();
        } else {
          void router.push({ name: "donor-posts" });
        }
      }
    } catch (error) {
      notifyError(mapAxiosErrorToDhError(error), { timeout: 4000 });
    }
  }

  return { blockUserById, blocksStore };
}
