<template>
  <div class="post-comments">
    <!-- Tabs -->
    <div class="post-comments-tabs">
      <q-tabs
        v-model="localActiveTab"
        dense
        no-caps
        class="post-comments-tabs-inner"
        active-color="primary"
        indicator-color="primary"
      >
        <q-tab name="help">
          <template #default>
            <div class="post-comments-tab-content">
              <img
                :src="localActiveTab === 'help' ? '/other_icons/help_s.svg' : '/other_icons/help_ns.svg'"
                alt="help"
                class="post-comments-tab-icon"
              />
              <span>help</span>
            </div>
          </template>
        </q-tab>
        <q-tab name="accomplish">
          <template #default>
            <div class="post-comments-tab-content">
              <img
                :src="localActiveTab === 'accomplish' ? '/other_icons/accomplish_s.svg' : '/other_icons/accomplish_ns.svg'"
                alt="accomplish"
                class="post-comments-tab-icon"
              />
              <span>accomplish</span>
            </div>
          </template>
        </q-tab>
      </q-tabs>
    </div>

    <!-- Loading State -->
    <div v-if="loading" class="post-comments-loading">
      <q-spinner color="primary" size="2rem" />
    </div>

    <!-- Comments List -->
    <div v-else class="post-comments-list">
      <div v-if="filteredComments.length === 0" class="post-comments-empty">
        <p>No comments yet.</p>
      </div>
      <div v-else class="post-comments-items">
        <div
          v-for="comment in filteredComments"
          :key="comment.id"
          class="post-comments-item"
        >
          <div class="post-comments-item-header">
            <div
              class="post-comments-item-avatar-wrapper"
              @click="goToUserProfile(comment.user_id)"
            >
              <UserAvatar
                :image-url="comment.user_avatar_url || null"
                :name="comment.user_name"
                size="32px"
              />
            </div>
            <div
              class="post-comments-item-info"
              @click="goToUserProfile(comment.user_id)"
            >
              <div class="post-comments-item-name">{{ comment.user_name }}</div>
              <div class="post-comments-item-date">{{ formatDate(comment.created_at) }}</div>
            </div>
          </div>
          <div class="post-comments-item-message">
            <div v-if="comment.return_message" class="post-comments-item-help-message">
              {{ comment.message }}
            </div>
            <div v-else class="post-comments-item-single-message">
              {{ comment.message }}
            </div>
            <hr v-if="comment.return_message" class="post-comments-item-divider" />
            <div v-if="comment.return_message" class="post-comments-item-return-message">
              {{ comment.return_message }}
            </div>
          </div>

          <!-- Reply Button (only for post owner) -->
          <div v-if="isPostOwner" class="post-comments-item-reply-section">
            <div class="post-comments-reply-btn-wrapper">
              <button
                class="post-comments-reply-btn"
                @click="toggleReplyInput(comment.id)"
              >
                Reply
              </button>
            </div>

            <!-- Reply Input (inline) -->
            <div v-if="showReplyInputs[comment.id]" class="post-comments-reply-input">
              <q-input
                v-model="replyTexts[comment.id]"
                type="textarea"
                autogrow
                dense
                dark
                outlined
                placeholder="Write a reply to this donor..."
                class="post-comments-reply-input-field"
                :disable="sendingReplies[comment.id]"
              >
                <template #append>
                  <q-btn
                    flat
                    round
                    dense
                    icon="send"
                    :disable="!replyTexts[comment.id]?.trim() || sendingReplies[comment.id]"
                    :loading="sendingReplies[comment.id]"
                    @click="handleReplySubmit(comment.id)"
                  />
                </template>
              </q-input>
            </div>
          </div>

          <!-- Replies Thread -->
          <div v-if="comment.replies && comment.replies.length > 0" class="post-comments-replies">
            <div
              v-for="reply in comment.replies"
              :key="reply.id"
              class="post-comments-reply-item"
            >
              <div class="post-comments-reply-header">
                <UserAvatar
                  :image-url="reply.user_avatar_url || null"
                  :name="reply.user_name"
                  size="24px"
                />
                <div class="post-comments-reply-info">
                  <span class="post-comments-reply-name">Reply from {{ reply.user_name }}</span>
                  <span class="post-comments-reply-time">{{ timeAgo(reply.created_at) }}</span>
                </div>
              </div>
              <div class="post-comments-reply-message">{{ reply.message }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useCommentsStore, type Reply } from "src/stores/comments";
import { useAuthStore } from "src/stores/auth";
import UserAvatar from "src/components/common/UserAvatar.vue";

interface Props {
  postId: number;
  postOwnerId?: number | null;
  modelValue?: "help" | "accomplish";
}

const props = withDefaults(defineProps<Props>(), {
  postOwnerId: null,
  modelValue: "help"
});

const emit = defineEmits<{
  "update:modelValue": [value: "help" | "accomplish"];
}>();

const router = useRouter();
const commentsStore = useCommentsStore();
const authStore = useAuthStore();

// Reply state for each comment
const replyTexts = ref<Record<number, string>>({});
const showReplyInputs = ref<Record<number, boolean>>({});
const sendingReplies = ref<Record<number, boolean>>({});

// Check if current user is post owner
const isPostOwner = computed(() => {
  return props.postOwnerId !== null && authStore.user?.id === props.postOwnerId;
});

// Navigate to user profile
const goToUserProfile = (userId: number | null) => {
  if (!userId) {
    if (process.env.NODE_ENV === "development") {
      console.warn("No userId to navigate");
    }
    return;
  }
  router.push({ name: "donor-user-profile", params: { userId: String(userId) } });
};

const localActiveTab = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
});

const commentsForPost = computed(() => {
  return commentsStore.getCommentsByPostId(props.postId);
});

const filteredComments = computed(() => {
  return commentsForPost.value.filter((c) => c.type === localActiveTab.value);
});

const loading = computed(() => {
  return commentsStore.isLoading(props.postId);
});

const formatDate = (iso: string) => {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) {
    return iso;
  }
  // Format as DD/MM/YYYY
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
};

// Calculate "time ago" for replies
const timeAgo = (iso: string) => {
  if (!iso) return "";
  const now = new Date();
  const created = new Date(iso);
  const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);
  if (diffInSeconds < 60) return "Just now";
  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`;
  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
};

// Toggle reply input
const toggleReplyInput = (commentId: number) => {
  showReplyInputs.value[commentId] = !showReplyInputs.value[commentId];
  if (!showReplyInputs.value[commentId]) {
    replyTexts.value[commentId] = "";
  }
};

// Handle reply submit
const handleReplySubmit = async (commentId: number) => {
  const replyText = replyTexts.value[commentId]?.trim();
  if (!replyText || sendingReplies.value[commentId]) {
    return;
  }

  sendingReplies.value[commentId] = true;

  try {
    await commentsStore.addReply(props.postId, commentId, {
      text: replyText
    });
    replyTexts.value[commentId] = "";
    showReplyInputs.value[commentId] = false;
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Failed to send reply:", error);
    }
  } finally {
    sendingReplies.value[commentId] = false;
  }
};
</script>

<style lang="scss" scoped>
.post-comments {
  width: 100%;
  padding: 1rem 0;
}

.post-comments-tabs {
  margin-bottom: 1.5rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
}

.post-comments-tabs-inner {
  :deep(.q-tabs__content) {
    .q-tab {
      color: rgba(255, 255, 255, 0.6);
      font-weight: 600;
      text-transform: none; /* Remove uppercase */
      font-size: 0.875rem;
      padding: 0.75rem 1rem;
      min-height: 48px;

      &.q-tab--active {
        color: $primary;
      }
    }
  }
}

.post-comments-tab-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.post-comments-tab-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.post-comments-loading {
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 3rem 0;
}

.post-comments-empty {
  text-align: center;
  padding: 3rem 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;
}

.post-comments-list {
  min-height: 200px;
}

.post-comments-items {
  display: flex;
  flex-direction: column;
  gap: 1rem;
}

.post-comments-item {
  background: rgba(23, 23, 23, 0.72);
  border-radius: 0.625rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.post-comments-item-header {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  margin-bottom: 0.75rem;
}

.post-comments-item-avatar-wrapper {
  cursor: pointer;
}

.post-comments-item-info {
  cursor: pointer;
}

.post-comments-item-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.post-comments-item-name {
  font-size: 0.95rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  font-family: poppinsSemiBold;
}

.post-comments-item-date {
  font-size: 0.75rem;
  color: rgba(255, 255, 255, 0.5);
}

.post-comments-item-message {
  font-size: 0.9rem;
  line-height: 1.6;
  color: rgba(255, 255, 255, 0.8);
  white-space: pre-wrap;
}

.post-comments-item-help-message {
  margin-bottom: 0.5rem;
}

.post-comments-item-single-message {
  // Single message without divider
}

.post-comments-item-divider {
  border: none;
  border-top: 1px solid rgba(255, 255, 255, 0.2);
  margin: 0.75rem 0;
  width: 100%;
}

.post-comments-item-return-message {
  margin-top: 0.5rem;
  color: rgba(255, 255, 255, 0.8);
}

.post-comments-item-reply-section {
  margin-top: 0.75rem;
}

.post-comments-reply-btn-wrapper {
  display: flex;
  justify-content: center;
  margin-top: 8px;
}

.post-comments-reply-btn {
  background: transparent;
  border: 1px solid rgba(189, 0, 67, 0.5);
  color: $primary;
  padding: 0.5rem 1rem;
  border-radius: 0.5rem;
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(189, 0, 67, 0.1);
    border-color: $primary;
  }
}

.post-comments-reply-input {
  margin-top: 0.75rem;
}

.post-comments-reply-input-field {
  width: 100%;

  :deep(.q-field__control) {
    background: rgba(23, 23, 23, 0.72);
    border-radius: 0.5rem;
    min-height: 2.5rem;
  }

  :deep(.q-field__native) {
    color: rgba(255, 255, 255, 0.9);
    padding: 0.5rem 0.75rem;
    font-size: 0.85rem;
  }

  :deep(.q-field__append) {
    padding-right: 0.5rem;
  }

  :deep(.q-btn) {
    color: $primary;

    &:disabled {
      color: rgba(255, 255, 255, 0.3);
    }
  }
}

.post-comments-replies {
  margin-top: 1rem;
  padding-left: 1rem;
  border-left: 2px solid rgba(189, 0, 67, 0.3);
}

.post-comments-reply-item {
  background: rgba(23, 23, 23, 0.5);
  border-radius: 0.5rem;
  padding: 0.75rem;
  margin-bottom: 0.5rem;
  border: 1px solid rgba(255, 255, 255, 0.05);
}

.post-comments-reply-header {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.post-comments-reply-info {
  display: flex;
  flex-direction: column;
  gap: 0.125rem;
}

.post-comments-reply-name {
  font-size: 0.8rem;
  font-weight: 600;
  color: rgba(255, 255, 255, 0.9);
  font-family: poppinsSemiBold;
}

.post-comments-reply-time {
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
}

.post-comments-tab-content {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.post-comments-tab-icon {
  width: 16px;
  height: 16px;
  object-fit: contain;
}

.post-comments-reply-message {
  font-size: 0.85rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.8);
  white-space: pre-wrap;
}

</style>
