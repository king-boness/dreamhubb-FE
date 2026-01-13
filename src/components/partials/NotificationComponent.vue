<template>
  <div class="notification-Component" @click="$emit('click')">
    <div
      class="notification-avatar-wrapper"
      @click.stop="goToUserProfile(notification.comment_author_id)"
    >
      <UserAvatar
        :image-url="notification.comment_author_avatar || null"
        :name="notification.comment_author_name || 'Unknown'"
        size="48px"
      />
    </div>
    <div class="nofication-Content">
      <span class="nofitication-Heading">{{ notification.title }}</span>
      <span class="nofitication-Text">{{ notification.body || "" }}</span>
      <span v-if="timeAgo" class="nofitication-Time">{{ timeAgo }}</span>
    </div>
    <a href="#" @click.prevent="$emit('click')">
      <img src="/icons/arrowRightIcon.svg" alt="" class="arrowRight-icon" />
    </a>
  </div>
</template>
<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";
import { Notification } from "src/stores/notifications";
import UserAvatar from "src/components/common/UserAvatar.vue";

interface Props {
  notification: Notification;
}

const props = defineProps<Props>();
const router = useRouter();

defineEmits<{
  click: [];
}>();

// Navigate to user profile
const goToUserProfile = (userId: number | null | undefined) => {
  // Convert to number if it's a string
  const numericUserId = typeof userId === "string" ? parseInt(userId, 10) : userId;

  if (!numericUserId || isNaN(numericUserId)) {
    if (process.env.NODE_ENV === "development") {
      console.warn("No userId to navigate", {
        userId,
        numericUserId,
        notification: props.notification,
        comment_author_id: props.notification.comment_author_id,
        type: typeof props.notification.comment_author_id
      });
    }
    return;
  }
  router.push({ name: "donor-user-profile", params: { userId: String(numericUserId) } });
};

// Calculate "time ago" from created_at
const timeAgo = computed(() => {
  if (!props.notification.created_at) return "";

  const now = new Date();
  const created = new Date(props.notification.created_at);
  const diffInSeconds = Math.floor((now.getTime() - created.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return "Just now";
  }

  const diffInMinutes = Math.floor(diffInSeconds / 60);
  if (diffInMinutes < 60) {
    return `${diffInMinutes} ${diffInMinutes === 1 ? "minute" : "minutes"} ago`;
  }

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) {
    return `${diffInHours} ${diffInHours === 1 ? "hour" : "hours"} ago`;
  }

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) {
    return `${diffInDays} ${diffInDays === 1 ? "day" : "days"} ago`;
  }

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) {
    return `${diffInWeeks} ${diffInWeeks === 1 ? "week" : "weeks"} ago`;
  }

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths} ${diffInMonths === 1 ? "month" : "months"} ago`;
});
</script>
<style scoped lang="scss">
.notification-Component {
  margin-top: 1rem;
  background-color: rgba(66, 65, 65, 0.229);
  color: white;
  display: flex;
  align-items: center;
  padding: 0.8rem;
  min-height: 6rem;
  border-radius: 0.7rem;
  cursor: pointer;
  transition: background-color 0.2s ease;
  width: 100%;
  box-sizing: border-box;

  &:hover {
    background-color: rgba(66, 65, 65, 0.35);
  }

  .notification-avatar-wrapper {
    cursor: pointer;
    flex-shrink: 0;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.05);
    }

    &:active {
      transform: scale(0.95);
    }
  }

  .nofication-Content {
    flex: 1;
    line-height: 1rem;
    display: flex;
    justify-content: center;
    align-items: start;
    flex-direction: column;
    padding-bottom: 0.5rem;
    margin-left: 1rem;

    .nofitication-Heading {
      font-family: poppinsSemiBold;
      font-size: 0.9rem;
      margin-bottom: 0.4rem;
    }

    .nofitication-Text {
      font-size: 0.8rem;
      font-family: poppins;
      margin-bottom: 0.3rem;
      opacity: 0.8;
    }

    .nofitication-Time {
      font-size: 0.75rem;
      font-family: poppins;
      opacity: 0.6;
    }
  }

  .arrowRight-icon {
    margin-top: 0.4rem;
    height: 1.5rem;
    margin-left: 0.5rem;
  }
}
</style>
