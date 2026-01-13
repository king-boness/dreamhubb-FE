// src/stores/comments.ts
import { defineStore } from "pinia";
import { api } from "boot/axios";

export interface Reply {
  id: number;
  post_id: number;
  parent_id: number;
  user_id: number;
  user_name: string;
  user_avatar_url?: string | null;
  type: "help" | "accomplish";
  message: string;
  is_owner_reply: boolean;
  created_at: string;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  user_name: string;
  user_avatar_url?: string | null;
  type: "help" | "accomplish";
  message: string;
  return_message?: string | null;
  is_private?: boolean;
  created_at: string;
  replies?: Reply[];
}

interface CommentsState {
  itemsByPostId: Record<number, Comment[]>;
  loadingByPostId: Record<number, boolean>;
  errorByPostId: Record<number, string | null>;
}

export const useCommentsStore = defineStore("comments", {
  state: (): CommentsState => ({
    itemsByPostId: {},
    loadingByPostId: {},
    errorByPostId: {}
  }),

  getters: {
    getCommentsByPostId: (state) => (postId: number) => {
      return state.itemsByPostId[postId] || [];
    },
    isLoading: (state) => (postId: number) => {
      return state.loadingByPostId[postId] || false;
    },
    getError: (state) => (postId: number) => {
      return state.errorByPostId[postId] || null;
    }
  },

  actions: {
    async fetchComments(postId: number, forceRefresh = false) {
      // Skip if already loading or already loaded (unless force refresh)
      if (!forceRefresh && (this.loadingByPostId[postId] || this.itemsByPostId[postId])) {
        return;
      }

      this.loadingByPostId[postId] = true;
      this.errorByPostId[postId] = null;

      try {
        const { data } = await api.get(`/posts/${postId}/contributions`);

        if (data.status === "success") {
          // Map contributions to comments format with replies
          this.itemsByPostId[postId] = (data.contributions || []).map((contrib: any) => ({
            id: contrib.id,
            post_id: contrib.post_id,
            user_id: contrib.user_id,
            user_name: contrib.user_name,
            user_avatar_url: contrib.user_avatar_url,
            type: contrib.type, // 'help' or 'accomplish'
            message: contrib.message,
            return_message: contrib.return_message,
            is_private: contrib.is_private,
            created_at: contrib.created_at,
            replies: (contrib.replies || []).map((reply: any) => ({
              id: reply.id,
              post_id: reply.post_id,
              parent_id: reply.parent_id,
              user_id: reply.user_id,
              user_name: reply.user_name,
              user_avatar_url: reply.user_avatar_url,
              type: reply.type,
              message: reply.message,
              is_owner_reply: reply.is_owner_reply,
              created_at: reply.created_at
            }))
          }));
        }
      } catch (error: unknown) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Failed to fetch comments:", error);
        }

        if (error && typeof error === "object" && "response" in error) {
          const axiosError = error as {
            response?: {
              status?: number;
              data?: {
                message?: string;
              };
            };
          };

          if (axiosError.response?.data?.message) {
            this.errorByPostId[postId] = axiosError.response.data.message;
          } else {
            this.errorByPostId[postId] = "Failed to load comments.";
          }
        } else {
          this.errorByPostId[postId] = "Network error. Please check your connection.";
        }
      } finally {
        this.loadingByPostId[postId] = false;
      }
    },

    async addComment(
      postId: number,
      payload: {
        type: "help" | "accomplish";
        message: string;
        return_message?: string | null;
        is_private?: boolean;
      }
    ) {
      try {
        const { data } = await api.post(`/posts/${postId}/contributions`, {
          contribution_type: payload.type,
          message: payload.message,
          return_message: payload.return_message || null,
          is_private: payload.is_private || false
        });

        if (data.status === "success" && data.contribution) {
          const newComment: Comment = {
            id: data.contribution.id,
            post_id: data.contribution.post_id,
            user_id: data.contribution.user_id,
            user_name: data.contribution.user_name,
            user_avatar_url: data.contribution.user_avatar_url,
            type: data.contribution.type,
            message: data.contribution.message,
            return_message: data.contribution.return_message,
            is_private: data.contribution.is_private,
            created_at: data.contribution.created_at
          };

          // Add to state
          if (!this.itemsByPostId[postId]) {
            this.itemsByPostId[postId] = [];
          }
          this.itemsByPostId[postId] = [newComment, ...this.itemsByPostId[postId]];

          return newComment;
        }

        throw new Error("Invalid response from server");
      } catch (error: unknown) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Failed to add comment:", error);
        }
        throw error;
      }
    },

    async addReply(
      postId: number,
      commentId: number,
      payload: {
        text: string;
      }
    ) {
      try {
        const { data } = await api.post(`/posts/${postId}/contributions/${commentId}/reply`, {
          text: payload.text
        });

        if (data.status === "success" && data.reply) {
          const newReply: Reply = {
            id: data.reply.id,
            post_id: data.reply.post_id,
            parent_id: data.reply.parent_id,
            user_id: data.reply.user_id,
            user_name: data.reply.user_name,
            user_avatar_url: data.reply.user_avatar_url,
            type: data.reply.type,
            message: data.reply.message,
            is_owner_reply: data.reply.is_owner_reply,
            created_at: data.reply.created_at
          };

          // Add reply to the parent comment in state
          if (this.itemsByPostId[postId]) {
            const comment = this.itemsByPostId[postId].find((c) => c.id === commentId);
            if (comment) {
              if (!comment.replies) {
                comment.replies = [];
              }
              comment.replies.push(newReply);
            }
          }

          return newReply;
        }

        throw new Error("Invalid response from server");
      } catch (error: unknown) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Failed to add reply:", error);
        }
        throw error;
      }
    }
  }
});
