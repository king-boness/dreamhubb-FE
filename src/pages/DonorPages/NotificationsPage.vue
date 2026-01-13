<template>
  <div class="notification-Page q-pa-sm">
    <div class="notifications-Header">
      <h2 class="notifications-Heading">Notifications</h2>
    </div>
    <q-pull-to-refresh @refresh="refresh">
      <div v-if="isLoading" class="notifications-loading">
        <q-spinner color="primary" size="2rem" />
      </div>
      <div v-else-if="error" class="notifications-error">
        <p>{{ error }}</p>
      </div>
      <div v-else-if="notifications.length === 0" class="notifications-empty">
        <p>No notifications yet.</p>
      </div>
      <div v-else class="notifications-list">
        <NotificationComponent
          v-for="notification in notifications"
          :key="notification.id"
          :notification="notification"
          @click="handleNotificationClick(notification)"
        />
      </div>
    </q-pull-to-refresh>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useNotificationsStore } from "src/stores/notifications";
import NotificationComponent from "src/components/partials/NotificationComponent.vue";

const router = useRouter();
const notificationsStore = useNotificationsStore();
const { items, isLoading, error } = storeToRefs(notificationsStore);

const notifications = computed(() => items.value);

const refresh = async (done: () => void) => {
  await notificationsStore.fetchNotifications(true);
  setTimeout(() => {
    done();
  }, 500);
};

const handleNotificationClick = async (notification: any) => {
  // Mark as read
  if (!notification.is_read) {
    await notificationsStore.markAsRead(notification.id);
  }

  // Navigate to post detail with comment type query param
  let commentType: string | undefined;
  if (notification.type === "comment_help") {
    commentType = "help";
  } else if (notification.type === "comment_accomplish") {
    commentType = "accomplish";
  } else if (notification.type === "comment_reply") {
    // For replies, use parent comment type if available
    commentType = notification.parent_comment_type || "help";
  }

  router.push({
    name: "donor-post-detail",
    params: { id: String(notification.post_id) },
    query: commentType ? { commentType } : {}
  });
};

onMounted(async () => {
  // Fetch notifications when page loads
  await notificationsStore.fetchNotifications(true);
});
</script>
<style scoped lang="scss">
.notification-Page {
  background-position: center;
  .notifications-Header {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    padding: 1.5rem 1.2rem 1rem 1.2rem;
  }

  .notifications-Heading {
    color: white;
    font-size: 1.7rem;
    font-family: poppinsSemiBold;
    margin: 0;
    text-align: center;
  }

  .notifications-loading,
  .notifications-error,
  .notifications-empty {
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 3rem 0;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.95rem;
  }

  .notifications-list {
    padding: 0 16px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0;
  }
}
</style>
