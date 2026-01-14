import { defineStore } from "pinia";
import { api } from "boot/axios";

export interface Notification {
  id: number;
  user_id: number;
  post_id: number;
  contribution_id: number | null;
  type: "comment_help" | "comment_accomplish" | "comment_reply" | "top_up";
  amount?: number | null; // For top_up notifications
  title?: string;
  body?: string | null;
  is_read: boolean;
  created_at: string;
  comment_author_id?: number | null;
  comment_author_name?: string;
  comment_author_avatar?: string | null;
  post_title?: string | null;
  parent_comment_type?: "help" | "accomplish"; // For reply notifications
  actor?: {
    id: number;
    name: string;
    avatar_url: string | null;
  } | null;
  post?: {
    id: number;
    title: string | null;
  } | null;
}

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  isLoading: boolean;
  error: string | null;
}

export const useNotificationsStore = defineStore("notifications", {
  state: (): NotificationsState => ({
    items: [],
    unreadCount: 0,
    isLoading: false,
    error: null
  }),

  getters: {
    unreadNotifications: (state) => {
      return state.items.filter((n) => !n.is_read);
    }
  },

  actions: {
    async fetchNotifications(forceRefresh = false) {
      // Skip if already loading and not forcing refresh
      if (this.isLoading && !forceRefresh) {
        return;
      }

      this.isLoading = true;
      this.error = null;

      try {
        const { data } = await api.get("/notifications", {
          params: {
            per_page: 50, // Fetch enough for initial display
            page: 1
          }
        });

        if (data.status === "success") {
          this.items = data.notifications || [];
          // Calculate unread count from items
          this.unreadCount = this.items.filter((n) => !n.is_read).length;
        }
      } catch (error: unknown) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Failed to fetch notifications:", error);
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
            this.error = axiosError.response.data.message;
          } else {
            this.error = "Failed to load notifications.";
          }
        } else {
          this.error = "Network error. Please check your connection.";
        }
      } finally {
        this.isLoading = false;
      }
    },

    async fetchUnreadCount() {
      try {
        const { data } = await api.get("/notifications/unread-count");

        if (data.status === "success") {
          this.unreadCount = data.unread_count || 0;
        }
      } catch (error: unknown) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Failed to fetch unread count:", error);
        }
        // Don't set error state for unread count failures
      }
    },

    async markAsRead(notificationId: number) {
      try {
        const { data } = await api.patch(`/notifications/${notificationId}/read`);

        if (data.status === "success") {
          // Update local state
          const notification = this.items.find((n) => n.id === notificationId);
          if (notification && !notification.is_read) {
            notification.is_read = true;
            this.unreadCount = Math.max(0, this.unreadCount - 1);
          }
        }
      } catch (error: unknown) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Failed to mark notification as read:", error);
        }
        throw error;
      }
    },

    async markAllAsRead() {
      try {
        const { data } = await api.patch("/notifications/read-all");

        if (data.status === "success") {
          // Update local state
          this.items.forEach((n) => {
            n.is_read = true;
          });
          this.unreadCount = 0;
        }
      } catch (error: unknown) {
        if (process.env.NODE_ENV === "development") {
          console.error("❌ Failed to mark all notifications as read:", error);
        }
        throw error;
      }
    }
  }
});
