<template>
  <div
    class="footer footer--donor4"
    :class="{ 'iphoneDevice-footer': $q.platform.is.ios }"
  >
    <q-btn
      :ripple="false"
      @click="router.push({ name: 'donor-posts' })"
      class="button-footer footer-left"
      :class="{ active: route.name === 'donor-posts' }"
    >
      <img :src="homeIcon" :alt="t('home')" class="footer-marginClass" />
      <span class="footer-pageName">{{ t("home") }}</span>
    </q-btn>
    <q-btn
      :ripple="false"
      @click="router.push({ name: 'donor-inspirations' })"
      class="button-footer footer-left"
      :class="{ active: route.name === 'donor-inspirations' }"
    >
      <img :src="compassIcon" :alt="t('inspirations')" class="footer-marginClass" />
      <span class="footer-pageName">{{ t("inspirations") }}</span>
    </q-btn>
    <q-btn
      :ripple="false"
      class="button-footer red footer-right"
      :class="{ active: route.name === 'donor-notifications' }"
      @click="onNotifications"
    >
      <img :src="bellIcon" :alt="t('notificationsLabel')" class="footer-marginClass" />
      <span v-if="notificationCount > 0" class="donorFooter-badge">{{ notificationCount }}</span>
      <span class="footer-pageName">{{ t("notificationsLabel") }}</span>
    </q-btn>

    <q-btn
      :ripple="false"
      @click="router.push({ name: 'donor-myprofile' })"
      class="button-footer profileIcon footer-right"
      :class="{
        activeProfile:
          route.name === 'donor-myprofile' || String(route.name || '').startsWith('donor-settings')
      }"
    >
      <div class="donorFooter-profileAvatarWrap" aria-hidden="true">
        <UserAvatar :image-url="authStore.avatarUrl" :name="authStore.name" size="1.8rem" />
      </div>
      <span class="footer-pageName">{{ t("profile") }}</span>
    </q-btn>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "src/stores/auth";
import { useNotificationsStore } from "src/stores/notifications";
import UserAvatar from "src/components/common/UserAvatar.vue";

const { t } = useI18n();
const authStore = useAuthStore();
const notificationsStore = useNotificationsStore();
const router = useRouter();
const route = useRoute();
const isBodyLight = ref(false);

const notificationCount = computed(() => notificationsStore.unreadCount);

const checkBodyClass = () => {
  isBodyLight.value = document.body.classList.contains("body--light");
};

let observer: MutationObserver | null = null;

onMounted(() => {
  checkBodyClass();
  observer = new MutationObserver(() => {
    checkBodyClass();
  });
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });
});

onBeforeUnmount(() => {
  observer?.disconnect();
});

const onNotifications = async () => {
  await notificationsStore.markAllAsRead();
  await router.push({ name: "donor-notifications" });
};

const homeIcon = computed(() => {
  if (route.name === "donor-posts") {
    return "/footer_icons/home_s.svg";
  }
  return isBodyLight.value ? "/footer_icons/home_lm.svg" : "/footer_icons/home_ns.svg";
});

const compassIcon = computed(() => {
  if (route.name === "donor-inspirations") {
    return "/footer_icons/compass_s.svg";
  }
  return isBodyLight.value ? "/footer_icons/compass_lm.svg" : "/footer_icons/compass_ns.svg";
});

const bellIcon = computed(() => {
  if (route.name === "donor-notifications") {
    return "/footer_icons/bell_s.svg";
  }
  return isBodyLight.value ? "/footer_icons/bell_lm.svg" : "/footer_icons/bell_ns.svg";
});
</script>
<style lang="scss" scoped>
.body--light {
  .active {
    transition: none !important;
    * {
      fill: #bd0043 !important;
      opacity: 1 !important;
    }
  }

  .footer-marginClass *:not(.newNotification) {
    fill: black;
  }

  .button-footer {
    img {
      transition: none !important;
    }
  }

  .button-footer {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;

    &::before,
    &::after {
      display: none !important;
      content: none !important;
      box-shadow: none !important;
      border: none !important;
      background: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
    }

    :deep(.q-btn__wrapper) {
      background: transparent !important;
      box-shadow: none !important;
      border: none !important;

      &::before,
      &::after {
        display: none !important;
        content: none !important;
        box-shadow: none !important;
        border: none !important;
        background: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
      }
    }

    :deep(.q-focus-helper) {
      display: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
    }

  :deep(.q-ripple) {
    display: none !important;
  }

  img {
    transition: none !important;
  }
}

.active.button-footer {
    background: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
    border: none !important;
    border-width: 0 !important;
    outline: none !important;

    &::before,
    &::after {
      display: none !important;
      content: none !important;
      box-shadow: none !important;
      border: none !important;
      border-width: 0 !important;
      background: none !important;
      background-color: transparent !important;
      opacity: 0 !important;
      visibility: hidden !important;
    }

    :deep(.q-btn__wrapper) {
      background: transparent !important;
      background-color: transparent !important;
      box-shadow: none !important;
      border: none !important;
      border-width: 0 !important;
      outline: none !important;

      &::before,
      &::after {
        display: none !important;
        content: none !important;
        box-shadow: none !important;
        border: none !important;
        border-width: 0 !important;
        background: none !important;
        background-color: transparent !important;
        opacity: 0 !important;
        visibility: hidden !important;
      }
    }

    :deep(.q-btn__content) {
      background: transparent !important;
      background-color: transparent !important;
      box-shadow: none !important;
      border: none !important;
      border-width: 0 !important;
      outline: none !important;

      &::before,
      &::after {
        display: none !important;
        content: none !important;
        box-shadow: none !important;
        border: none !important;
        border-width: 0 !important;
        background: none !important;
        background-color: transparent !important;
        opacity: 0 !important;
        visibility: hidden !important;
      }
    }
  }
}
.footer {
  /* Musí byť viewport fixed: scoped štýly inak prepíšu globál .footer { fixed } vyššou špecifitou (relative) → futro v toku pod scrollom. */
  position: fixed !important;
  bottom: 0 !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 2000 !important;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  background-image: none;
  background-image: url("/icons/rectangle.svg") !important;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  overflow: visible;
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: space-evenly;
  height: auto;
  min-height: auto;
  padding-top: 0.4rem;
  padding-bottom: max(0.45rem, env(safe-area-inset-bottom, 0px));
  padding-left: 1.25rem;
  padding-right: 1.25rem;

  // Ensure all q-btn elements in footer have transparent background
  :deep(.q-btn:not(.circle)) {
    background: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
    border: none !important;
    border-width: 0 !important;
    outline: none !important;
    padding: 0 !important;
    margin: 0 !important;
    // Dimensions are reset for standard footer buttons; .circle uses its own explicit sizing

    &::before,
    &::after {
      display: none !important;
      content: none !important;
      background: none !important;
      background-color: transparent !important;
      opacity: 0 !important;
      visibility: hidden !important;
      box-shadow: none !important;
      border: none !important;
      border-width: 0 !important;
    }

    .q-btn__wrapper {
      background: transparent !important;
      background-color: transparent !important;
      box-shadow: none !important;
      border: none !important;
      border-width: 0 !important;
      outline: none !important;
      padding: 0 !important;
      margin: 0 !important;

      &::before,
      &::after {
        display: none !important;
        content: none !important;
        background: none !important;
        background-color: transparent !important;
        opacity: 0 !important;
        visibility: hidden !important;
        box-shadow: none !important;
        border: none !important;
        border-width: 0 !important;
      }
    }

    .q-btn__content {
      display: flex !important;
      flex-direction: column !important;
      align-items: center !important;
      justify-content: center !important;
      gap: 0.12rem !important;
      background: transparent !important;
      background-color: transparent !important;
      box-shadow: none !important;
      border: none !important;
      border-width: 0 !important;
      outline: none !important;
      padding: 0 !important;
      margin: 0 !important;

      &::before,
      &::after {
        display: none !important;
        content: none !important;
        background: none !important;
        background-color: transparent !important;
        opacity: 0 !important;
        visibility: hidden !important;
        box-shadow: none !important;
        border: none !important;
        border-width: 0 !important;
      }
    }

    .q-focus-helper {
      display: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
      background: transparent !important;
      background-color: transparent !important;
    }

    .q-ripple {
      display: none !important;
      opacity: 0 !important;
      visibility: hidden !important;
    }
  }

  // Reset dimensions only for non-circle footer buttons
  :deep(.q-btn):not(.circle) {
    min-width: auto !important;
    min-height: auto !important;
    width: auto !important;
    height: auto !important;
  }
}

.active {
  transition: none !important;
  background: transparent !important;

  * {
    fill: #bd0043;
    opacity: 1 !important;
  }
}

.button-footer {
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
  border: none !important;
  border-width: 0 !important;
  transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.25s ease !important;
  outline: none !important;
  min-width: auto !important;
  min-height: auto !important;
  width: auto !important;
  height: auto !important;
  padding: 0 !important;
  margin: 0 !important;
  color: inherit !important;
  flex: 0 0 auto;
  flex-shrink: 0;
  flex-grow: 0;
  align-self: center;
  position: relative;
  z-index: 1;
  cursor: pointer;
  will-change: transform, opacity;

  &::before,
  &::after {
    display: none !important;
    content: none !important;
    box-shadow: none !important;
    border: none !important;
    background: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
  }

  :deep(.q-btn__wrapper) {
    padding: 0 !important;
    min-height: auto !important;
    min-width: auto !important;
    width: auto !important;
    height: auto !important;
    background: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
    border: none !important;
    border-width: 0 !important;
    outline: none !important;

    &::before,
    &::after {
      display: none !important;
      content: none !important;
      box-shadow: none !important;
      border: none !important;
      border-width: 0 !important;
      background: none !important;
      background-color: transparent !important;
      opacity: 0 !important;
      visibility: hidden !important;
    }
  }

  :deep(.q-btn__content) {
    display: flex !important;
    flex-direction: column !important;
    align-items: center !important;
    justify-content: center !important;
    gap: 0.12rem !important;
    background: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
    border: none !important;
    border-width: 0 !important;
    outline: none !important;

    &::before,
    &::after {
      display: none !important;
      content: none !important;
      box-shadow: none !important;
      border: none !important;
      border-width: 0 !important;
      background: none !important;
      background-color: transparent !important;
      opacity: 0 !important;
      visibility: hidden !important;
    }
  }

  :deep(*) {
    &::selection {
      background: transparent !important;
    }
  }

  :deep(.q-focus-helper) {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
    background: transparent !important;
    background-color: transparent !important;
  }

  :deep(.q-ripple) {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
  }

  img {
    transition: opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
    will-change: opacity, transform;
  }

  .footer-pageName {
    transition: opacity 0.25s ease, color 0.25s ease !important;
    will-change: opacity, color;
  }

  // Hover and active states are now defined per icon for better control
  // Individual icon transforms are defined below
  // Only apply default hover/active for left-side icons (Home, Inspirations)
  &:hover:not(.red):not(.profileIcon).footer-left {
    background: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
    border: none !important;
    border-width: 0 !important;
    outline: none !important;
    transition: transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1) !important;

    img {
      transform: scale(1.1);
      opacity: 0.9;
    }

    .footer-pageName {
      opacity: 0.8;
    }

    :deep(.q-btn__wrapper),
    :deep(.q-btn__content) {
      background: transparent !important;
      background-color: transparent !important;
      box-shadow: none !important;
      border: none !important;
      border-width: 0 !important;
      outline: none !important;
      transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
  }

  &:active:not(.red):not(.profileIcon).footer-left {
    background: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
    border: none !important;
    border-width: 0 !important;
    outline: none !important;
    transition: transform 0.15s cubic-bezier(0.34, 1.56, 0.64, 1) !important;

    img {
      transform: scale(0.95);
    }

    :deep(.q-btn__wrapper),
    :deep(.q-btn__content) {
      background: transparent !important;
      background-color: transparent !important;
      box-shadow: none !important;
      border: none !important;
      border-width: 0 !important;
      outline: none !important;
      transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1) !important;
    }
  }

  // Disable default hover/active transforms for right-side icons (Notifications, Profile)
  &.red.footer-right:hover,
  &.profileIcon.footer-right:hover {
    transform: none !important;
  }

  &.red.footer-right:active,
  &.profileIcon.footer-right:active {
    transform: none !important;
  }

  &:focus {
    background: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
    border: none !important;
    border-width: 0 !important;
    outline: none !important;

    :deep(.q-btn__wrapper),
    :deep(.q-btn__content) {
      background: transparent !important;
      background-color: transparent !important;
      box-shadow: none !important;
      border: none !important;
      border-width: 0 !important;
      outline: none !important;
    }
  }

  &:focus-visible {
    outline: none !important;
    box-shadow: none !important;
    background: transparent !important;
    background-color: transparent !important;
    border: none !important;
    border-width: 0 !important;

    :deep(.q-btn__wrapper),
    :deep(.q-btn__content) {
      background: transparent !important;
      background-color: transparent !important;
      box-shadow: none !important;
      border: none !important;
      border-width: 0 !important;
      outline: none !important;
    }
  }
}

.active.button-footer {
  background: transparent !important;
  background-color: transparent !important;
  box-shadow: none !important;
  border: none !important;
  border-width: 0 !important;
  outline: none !important;
  transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;

  // Only apply default transform for left-side icons (Home, Inspirations) that don't have specific transforms
  &:not(.red):not(.profileIcon):not(.footer-right) {
    transform: translateY(-1px) scale(1.02);
  }

  img {
    transform: scale(1.05);
    opacity: 1;
    transition: opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
  }

  .footer-pageName {
    opacity: 1;
    color: #bd0043;
    transition: opacity 0.3s ease, color 0.3s ease !important;
  }

  &::before,
  &::after {
    display: none !important;
    content: none !important;
    box-shadow: none !important;
    border: none !important;
    border-width: 0 !important;
    background: none !important;
    background-color: transparent !important;
    opacity: 0 !important;
    visibility: hidden !important;
  }

  :deep(.q-btn__wrapper) {
    background: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
    border: none !important;
    border-width: 0 !important;
    outline: none !important;

    &::before,
    &::after {
      display: none !important;
      content: none !important;
      box-shadow: none !important;
      border: none !important;
      border-width: 0 !important;
      background: none !important;
      background-color: transparent !important;
      opacity: 0 !important;
      visibility: hidden !important;
    }
  }

  :deep(.q-btn__content) {
    background: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
    border: none !important;
    border-width: 0 !important;
    outline: none !important;

    &::before,
    &::after {
      display: none !important;
      content: none !important;
      box-shadow: none !important;
      border: none !important;
      border-width: 0 !important;
      background: none !important;
      background-color: transparent !important;
      opacity: 0 !important;
      visibility: hidden !important;
    }
  }

  &:hover,
  &:active,
  &:focus {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    outline: none !important;
  }
}

.footer-marginClass {
  height: 1.6rem;
  width: 1.6rem;
  display: block;
}

.profileIcon {
  position: relative;

  .footer-marginClass {
    height: 2.4rem !important;
    width: 2.4rem !important;
  }

  .profileImg {
    height: 1.8rem;
    width: 1.8rem;
    border-radius: 100%;
    border: 0.1rem solid transparent;
    padding: 0.1rem;
    margin-bottom: 0.02rem;
    object-fit: cover;
    display: block;
  }
}

.activeProfile {
  background: transparent !important;

  .donorFooter-profileAvatarWrap {
    border-radius: 50%;
    box-shadow: 0 0 0 0.16rem #bd0043;
  }

  .footer-pageName {
    opacity: 1;
    color: #bd0043;
    transition: opacity 0.3s ease, color 0.3s ease !important;
  }
}

.donorFooter-profileAvatarWrap {
  display: flex;
  align-items: center;
  justify-content: center;
}

.donorFooter-badge {
  position: absolute;
  top: 0;
  right: 0.35rem;
  min-width: 1rem;
  height: 1rem;
  padding: 0 0.25rem;
  border-radius: 999px;
  background: #bd0043;
  color: #fff;
  font-size: 0.6rem;
  font-family: poppinsSemiBold, sans-serif;
  line-height: 1rem;
  text-align: center;
  pointer-events: none;
}
.footer-pageName {
  color: white;
  font-size: 0.7rem;
  font-family: poppins;
  margin-bottom: -0.4rem;
  margin-top: 0.2rem;
  text-transform: capitalize;
  text-align: center;
  width: 100%;
}

.footer--donor4 .footer-left,
.footer--donor4 .footer-right {
  margin-left: 0 !important;
  margin-right: 0 !important;
  pointer-events: auto;
  position: relative;
  z-index: 1;
}

/* Jednotný vertikálny offset pre 4 ikony (flex space-evenly); !important aby prepísalo globálne transform: none na red/profile. */
.footer--donor4 > .button-footer {
  transform: translateY(4px) !important;
}

.footer--donor4 > .button-footer:hover:not(.red):not(.profileIcon).footer-left {
  transform: translateY(2px) scale(1.05) !important;
}

.footer--donor4 > .button-footer:active:not(.red):not(.profileIcon).footer-left {
  transform: translateY(4px) scale(0.95) !important;
}

.footer--donor4 > .button-footer.footer-left.active {
  transform: translateY(3px) scale(1.02) !important;
}

.footer--donor4 > .button-footer.red.footer-right:hover,
.footer--donor4 > .button-footer.profileIcon.footer-right:hover {
  transform: translateY(2px) scale(1.05) !important;
}

.footer--donor4 > .button-footer.red.footer-right:active,
.footer--donor4 > .button-footer.profileIcon.footer-right:active {
  transform: translateY(4px) scale(0.95) !important;
}

.footer--donor4 > .button-footer.red.footer-right.active,
.footer--donor4 > .button-footer.profileIcon.footer-right.activeProfile {
  transform: translateY(3px) scale(1.02) !important;
}

</style>
