<template>
  <div class="notification-Component" @click="$emit('click')">
    <div
      class="notification-avatar-wrapper"
      @click.stop="goToUserProfile(actorId)"
    >
      <UserAvatar
        :image-url="actorAvatar || null"
        :name="actorName || 'Unknown'"
        size="48px"
      />
    </div>
    <div class="nofication-Content">
      <span class="nofitication-Heading">{{ displayTitle }}</span>
      <span v-if="displayText" class="nofitication-Text">{{ displayText }}</span>
      <span v-if="timeAgo" class="nofitication-Time">{{ timeAgo }}</span>
    </div>
    <div class="notification-actions">
      <button class="notification-moreBtn" type="button" @click.stop="isActionsOpen = true">
        <q-icon name="more_horiz" />
      </button>
    </div>

    <q-dialog v-model="isActionsOpen" position="bottom" class="notification-actionsDialog">
      <q-card
        class="notification-actionsSheet"
        :class="{ dragging: sheetIsDragging }"
        :style="{ transform: `translate3d(0, ${sheetDragOffset}px, 0)` }"
      >
        <q-card-section
          class="notification-actionsSheetHeader"
          @touchstart.capture="onSheetTouchStart"
          @touchmove.capture.prevent="onSheetTouchMove"
          @touchend.capture="onSheetTouchEnd"
        >
          <div class="notification-actionsSheetHandle"></div>
        </q-card-section>
        <q-card-section class="notification-actionsSheetContent">
          <button class="notification-actionsSheetBtn" type="button" @click="handleAction('delete')">
            Delete this notification
          </button>
          <button class="notification-actionsSheetBtn" type="button" @click="handleAction('turnOff')">
            Turn off these notifications
          </button>
          <button class="notification-actionsSheetBtn" type="button" @click="handleAction('report')">
            Report issue to notifications team
          </button>
          <button class="notification-actionsSheetBtn secondary" type="button" @click="isActionsOpen = false">
            Cancel
          </button>
        </q-card-section>
      </q-card>
    </q-dialog>
  </div>
</template>
<script setup lang="ts">
import { computed, ref } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { Notification } from "src/stores/notifications";
import UserAvatar from "src/components/common/UserAvatar.vue";
import { notifyInfo } from "src/utils/notify";

interface Props {
  notification: Notification;
}

const props = defineProps<Props>();
const router = useRouter();
const { t } = useI18n();
const isActionsOpen = ref(false);

// Bottom sheet: drag down on handle to close
const sheetDragOffset = ref(0);
const sheetIsDragging = ref(false);
const sheetStartY = ref(0);
const SHEET_CLOSE_THRESHOLD = 70;

function onSheetTouchStart(e: TouchEvent) {
  e.stopPropagation();
  sheetIsDragging.value = true;
  sheetStartY.value = e.touches[0].clientY;
}

function onSheetTouchMove(e: TouchEvent) {
  if (!sheetIsDragging.value) return;
  e.preventDefault();
  e.stopPropagation();
  const currentY = e.touches[0].clientY;
  const delta = currentY - sheetStartY.value;
  sheetDragOffset.value = Math.max(0, delta);
}

function onSheetTouchEnd() {
  if (!sheetIsDragging.value) return;
  sheetIsDragging.value = false;
  if (sheetDragOffset.value >= SHEET_CLOSE_THRESHOLD) {
    sheetDragOffset.value = 0;
    isActionsOpen.value = false;
    return;
  }
  sheetDragOffset.value = 0;
}

defineEmits<{
  click: [];
}>();

// Get actor info (for top_up) or comment author (for comments)
const actorId = computed(() => {
  if (props.notification.type === "top_up" && props.notification.actor) {
    return props.notification.actor.id;
  }
  return props.notification.comment_author_id;
});

const actorName = computed(() => {
  if (props.notification.type === "top_up" && props.notification.actor) {
    return props.notification.actor.name;
  }
  return props.notification.comment_author_name;
});

const actorAvatar = computed(() => {
  if (props.notification.type === "top_up" && props.notification.actor) {
    return props.notification.actor.avatar_url;
  }
  return props.notification.comment_author_avatar;
});

// Display title based on notification type
const displayTitle = computed(() => {
  if (props.notification.type === "top_up") {
    const actor = actorName.value || "Someone";
    const amount = props.notification.amount || 0;
    return t("notifications.topUpTitle", { name: actor, amount });
  }
  return props.notification.title || "";
});

// Display text based on notification type
const displayText = computed(() => {
  if (props.notification.type === "top_up") {
    const postTitle = props.notification.post?.title || props.notification.post_title || "your post";
    return t("notifications.topUpText", { postTitle });
  }
  return props.notification.body || "";
});

// Navigate to user profile
const goToUserProfile = (userId: number | null | undefined) => {
  // Convert to number if it's a string
  const numericUserId = typeof userId === "string" ? parseInt(userId, 10) : userId;

  if (!numericUserId || isNaN(numericUserId)) {
    if (import.meta.env.DEV) {
      console.debug("No userId to navigate", {
        userId,
        numericUserId,
        notification: props.notification
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

function handleAction(kind: "delete" | "turnOff" | "report") {
  isActionsOpen.value = false;
  notifyInfo(
    "common.info.comingSoon",
    kind === "delete"
      ? "Delete is coming soon."
      : kind === "turnOff"
        ? "Turn off notifications is coming soon."
        : "Report issue is coming soon.",
    { position: "top", timeout: 2500 }
  );
}
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

}

.notification-actions {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  margin-left: 0.5rem;
}

.notification-moreBtn {
  width: 36px;
  height: 28px;
  border-radius: 10px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.25);
  color: rgba(255, 255, 255, 0.85);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

.notification-actionsSheet {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
  border-radius: 20px 20px 0 0;
  background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
  color: #fff;
  transition: transform 0.2s ease-out;
}

.notification-actionsSheet.dragging {
  transition: none;
}

.notification-actionsDialog {
  :deep(.q-dialog.notification-actionsDialog) {
    z-index: 50000 !important;
  }
  :deep(body.q-ios-padding .q-dialog.notification-actionsDialog.fullscreen) {
    padding-bottom: 0 !important;
    padding-top: 0 !important;
  }
  :deep(.q-dialog__inner),
  :deep(.q-dialog__inner--bottom) {
    padding: 0 !important;
    margin: 0 !important;
    align-items: flex-end !important;
    justify-content: flex-end !important;
  }
  :deep(.q-dialog__inner > div) {
    margin: 0 !important;
  }
  /* Hard-anchor the sheet to bottom edge (iOS q-ios-padding can add bottom padding) */
  :deep(.q-dialog__inner--bottom > div) {
    position: fixed !important;
    left: 0 !important;
    right: 0 !important;
    bottom: 0 !important;
  }
}

.notification-actionsSheetHeader {
  padding: 0.75rem 1rem 0.25rem;
  display: flex;
  justify-content: center;
  touch-action: none;
}

.notification-actionsSheetHandle {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.25);
  touch-action: none;
}

.notification-actionsSheetContent {
  padding: 0.75rem 1rem calc(1rem + env(safe-area-inset-bottom, 0px));
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.notification-actionsSheetBtn {
  width: 100%;
  padding: 0.95rem 1rem;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  font-family: poppinsSemiBold;
  font-size: 0.95rem;
  text-align: left;
  cursor: pointer;
}

.notification-actionsSheetBtn.secondary {
  text-align: center;
  background: rgba(255, 255, 255, 0.1);
}
</style>

<style lang="scss">
/* GLOBAL (non-scoped) override for teleported QDialog */
body.q-ios-padding .q-dialog.notification-actionsDialog.fullscreen {
  padding-bottom: 0 !important;
  padding-top: 0 !important;
}

.q-dialog.notification-actionsDialog .q-dialog__inner,
.q-dialog.notification-actionsDialog .q-dialog__inner--bottom {
  padding: 0 !important;
  margin: 0 !important;
  align-items: flex-end !important;
  justify-content: flex-end !important;
}

.q-dialog.notification-actionsDialog .q-dialog__inner--bottom > div {
  position: fixed !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  margin: 0 !important;
}
</style>
