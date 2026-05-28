<template>
  <div class="notification-Page">
    <PageTitle title="Notifications" />
    <!-- Iba do konca prvého fetchu; potom PTR (vlastný indikátor pri ťahu). -->
    <div v-if="!initialFetchDone" class="notifications-loading">
      <q-spinner color="primary" size="2rem" />
    </div>
    <q-pull-to-refresh v-else @refresh="refresh">
      <div v-if="error" class="notifications-error" data-testid="dh-notifications-error">
        <RetryPanel
          :message="error"
          :on-retry="retry"
          variant="inline"
          button-class="notifications-retryBtn"
          data-testid="dh-notifications-retry"
        />
      </div>
      <div v-else-if="notifications.length === 0" class="notifications-empty" data-testid="dh-notifications-empty">
        <p>No notifications yet.</p>
      </div>
      <div v-else class="notifications-list" data-testid="dh-notifications-list">
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
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { storeToRefs } from "pinia";
import { useNotificationsStore, type Notification } from "src/stores/notifications";
import NotificationComponent from "src/components/partials/NotificationComponent.vue";
import PageTitle from "src/components/ui/PageTitle.vue";
import RetryPanel from "src/components/common/RetryPanel.vue";
import { useI18n } from "vue-i18n";

const router = useRouter();
const notificationsStore = useNotificationsStore();
const { items, error } = storeToRefs(notificationsStore);
useI18n();

const notifications = computed(() => items.value);

const initialFetchDone = ref(false);

const refresh = async (done: () => void) => {
  await notificationsStore.fetchNotifications(true);
  setTimeout(() => {
    done();
  }, 500);
};

const retry = async () => {
  await notificationsStore.fetchNotifications(true);
};

const handleNotificationClick = async (notification: Notification) => {
  // Mark as read
  if (!notification.is_read) {
    await notificationsStore.markAsRead(notification.id);
  }

  // For top_up, navigate to post detail without comment type
  if (notification.type === "top_up") {
    router.push({
      name: "donor-post-detail",
      params: { id: String(notification.post_id) }
    });
    return;
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
  try {
    await notificationsStore.fetchNotifications(true);
  } finally {
    initialFetchDone.value = true;
  }
});
</script>
<style scoped lang="scss">
.notification-Page {
  background-position: center;
  padding: 0.05rem 0.2rem 0.75rem;

  .notifications-loading,
  .notifications-error,
  .notifications-empty {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 12px;
    padding: 3rem 0;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.95rem;
  }

  .notifications-retryBtn {
    color: #ff4db8;
    font-family: poppinsSemiBold;
  }

  .notifications-list {
    padding: 0 4px;
    width: 100%;
    display: flex;
    flex-direction: column;
    gap: 0;
    margin-top: -10px;
  }
}
</style>
