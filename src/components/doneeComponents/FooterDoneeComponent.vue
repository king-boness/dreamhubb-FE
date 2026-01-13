<template>
  <div
    class="footer row col-12"
    :class="{ 'iphoneDevice-footer': $q.platform.is.ios }"
  >
    <q-btn
      :ripple="false"
      @click="$router.push({ name: 'donee-posts' })"
      class="button-footer footer-left"
      :class="{ active: $route.name === 'donee-posts' }"
    >
      <img
        :src="homeIcon"
        :alt="t('home')"
        class="footer-marginClass"
      />
      <span class="footer-pageName">{{ t("home") }}</span>
    </q-btn>
    <q-btn
      :ripple="false"
      @click="$router.push({ name: 'donee-inspirations' })"
      class="button-footer footer-left"
      :class="{ active: $route.name === 'donee-inspirations' }"
    >
      <img
        :src="compassIcon"
        :alt="t('inspirations')"
        class="footer-marginClass"
      />
      <span class="footer-pageName">{{ t("inspirations") }}</span>
    </q-btn>
    <q-btn class="circle" @click="handlePostCreationClick">
      <img src="/footer_icons/post.svg" :alt="t('addPost')" />
    </q-btn>
    <q-btn
      :ripple="false"
      @click="$router.push({ name: 'donee-notifications' })"
      class="button-footer red footer-right"
      :class="{ active: $route.name === 'donee-notifications' }"
    >
      <img
        :src="bellIcon"
        :alt="t('notifications')"
        class="footer-marginClass"
      />
      <span class="footer-pageName">{{ t("notifications") }}</span>
    </q-btn>

    <q-btn
      :ripple="false"
      @click="$router.push({ name: 'donee-myprofile' })"
      class="button-footer profileIcon footer-right"
      :class="{
        activeProfile:
          $route.name == 'donee-myprofile' || $route.name == 'donee-settings'
      }"
    >
      <img :src="authStore.avatarUrl" class="profileImg" alt="" />
      <span class="footer-pageName">{{ t("profile") }}</span>
    </q-btn>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { useAuthStore } from "src/stores/auth";
import { usePostCreationStore } from "src/stores/postCreation";

const { t } = useI18n();
const authStore = useAuthStore();
const router = useRouter();
const postCreationStore = usePostCreationStore();

const route = useRoute();
const isBodyLight = ref(false);

const checkBodyClass = () => {
  isBodyLight.value = document.body.classList.contains("body--light");
};

let observer: MutationObserver | null = null;

onMounted(() => {
  checkBodyClass();
  // Watch for class changes on body element
  observer = new MutationObserver(() => {
    checkBodyClass();
  });
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
  }
});

// Computed properties for icons based on light mode
const homeIcon = computed(() => {
  // If selected, always use _s version
  if (route.name === "donee-posts") {
    return "/footer_icons/home_s.svg";
  }
  // If not selected: light mode uses _lm, dark mode uses _ns
  return isBodyLight.value ? "/footer_icons/home_lm.svg" : "/footer_icons/home_ns.svg";
});

const compassIcon = computed(() => {
  // If selected, always use _s version
  if (route.name === "donee-inspirations") {
    return "/footer_icons/compass_s.svg";
  }
  // If not selected: light mode uses _lm, dark mode uses _ns
  return isBodyLight.value ? "/footer_icons/compass_lm.svg" : "/footer_icons/compass_ns.svg";
});

const bellIcon = computed(() => {
  // If selected, always use _s version
  if (route.name === "donee-notifications") {
    return "/footer_icons/bell_s.svg";
  }
  // If not selected: light mode uses _lm, dark mode uses _ns
  return isBodyLight.value ? "/footer_icons/bell_lm.svg" : "/footer_icons/bell_ns.svg";
});

// Reset post creation flow when starting a new post
const handlePostCreationClick = () => {
  // Reset store
  postCreationStore.reset();

  // Reset localStorage
  localStorage.setItem("donee_postCreation_goal", "dream");
  localStorage.removeItem("donee_postCreation_category");
  localStorage.removeItem("donee_postCreation_subcategory");

  // Navigate to goal picker
  router.push({ name: "donee-postCreation-goal" });
};
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
  background-image: none;
  background-image: url("/icons/rectangle.svg") !important;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  overflow: visible;
  display: flex;
  justify-content: space-around;
  align-items: center;
  flex-wrap: nowrap;
  height: auto;
  min-height: auto;
  position: relative; // For absolute positioning of .circle button

  // Ensure all q-btn elements in footer have transparent background
  :deep(.q-btn) {
    background: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
    border: none !important;
    border-width: 0 !important;
    outline: none !important;
    padding: 0 !important;
    margin: 0 !important;
    min-width: auto !important;
    min-height: auto !important;
    width: auto !important;
    height: auto !important;

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

  .profileImg {
    border: 0.16rem solid #bd0043 !important;
  }

  .footer-pageName {
    opacity: 1;
    color: #bd0043;
    transition: opacity 0.3s ease, color 0.3s ease !important;
  }
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

.footer-left {
  margin-left: -1.5rem !important;
  pointer-events: auto;
  position: relative;
  z-index: 1;
  transform: translateX(-5px);
}

/* Inspirations icon specific positioning - 2px more right (from -2px to 0px) and 4px down */
.footer-left:nth-child(2) {
  transform: translateX(0px) translateY(4px) !important;

  &:hover {
    transform: translateX(0px) translateY(2px) scale(1.05) !important;
  }

  &:active {
    transform: translateX(0px) translateY(4px) scale(0.95) !important;
  }

  &.active {
    transform: translateX(0px) translateY(3px) scale(1.02) !important;
  }
}

/* Home icon specific positioning - 1px more right (from -4px to -3px) and 5px down */
.footer-left:first-child {
  transform: translateX(-3px) translateY(5px) !important;

  &:hover {
    transform: translateX(-3px) translateY(3px) scale(1.05) !important;
  }

  &:active {
    transform: translateX(-3px) translateY(5px) scale(0.95) !important;
  }

  &.active {
    transform: translateX(-3px) translateY(4px) scale(1.02) !important;
  }
}

.footer-right {
  margin-right: -1.5rem !important;
  pointer-events: auto;
  position: relative;
  z-index: 1;
  // Transform is now defined per icon below
}

/* Notifications icon specific positioning - 1px more right (from 1px to 2px) and 4px down */
/* Notifications is 4th child (after Home, Inspirations, Post Creation circle) */
.footer > .q-btn.button-footer.red.footer-right:nth-child(4),
.footer > .button-footer.red.footer-right:nth-child(4),
.footer .q-btn.button-footer.red.footer-right,
.footer .button-footer.red.footer-right {
  transform: translateX(2px) translateY(4px) !important;
}

.footer > .q-btn.button-footer.red.footer-right:nth-child(4):hover,
.footer > .button-footer.red.footer-right:nth-child(4):hover,
.footer .q-btn.button-footer.red.footer-right:hover,
.footer .button-footer.red.footer-right:hover {
  transform: translateX(2px) translateY(2px) scale(1.05) !important;
}

.footer > .q-btn.button-footer.red.footer-right:nth-child(4):active,
.footer > .button-footer.red.footer-right:nth-child(4):active,
.footer .q-btn.button-footer.red.footer-right:active,
.footer .button-footer.red.footer-right:active {
  transform: translateX(2px) translateY(4px) scale(0.95) !important;
}

.footer > .q-btn.button-footer.red.footer-right:nth-child(4).active,
.footer > .button-footer.red.footer-right:nth-child(4).active,
.footer .q-btn.button-footer.red.footer-right.active,
.footer .button-footer.red.footer-right.active,
.footer .active.button-footer.red.footer-right {
  transform: translateX(2px) translateY(3px) scale(1.02) !important;
}

/* Profile icon specific positioning - 4px right and 1px up (from 5px down to 4px down) */
/* Profile is 5th child (last) */
.footer > .q-btn.button-footer.profileIcon.footer-right:nth-child(5),
.footer > .button-footer.profileIcon.footer-right:nth-child(5),
.footer .q-btn.button-footer.profileIcon.footer-right,
.footer .button-footer.profileIcon.footer-right {
  transform: translateX(4px) translateY(4px) !important;
}

.footer > .q-btn.button-footer.profileIcon.footer-right:nth-child(5):hover,
.footer > .button-footer.profileIcon.footer-right:nth-child(5):hover,
.footer .q-btn.button-footer.profileIcon.footer-right:hover,
.footer .button-footer.profileIcon.footer-right:hover {
  transform: translateX(4px) translateY(2px) scale(1.05) !important;
}

.footer > .q-btn.button-footer.profileIcon.footer-right:nth-child(5):active,
.footer > .button-footer.profileIcon.footer-right:nth-child(5):active,
.footer .q-btn.button-footer.profileIcon.footer-right:active,
.footer .button-footer.profileIcon.footer-right:active {
  transform: translateX(4px) translateY(4px) scale(0.95) !important;
}

.footer > .q-btn.button-footer.profileIcon.footer-right:nth-child(5).activeProfile,
.footer > .button-footer.profileIcon.footer-right:nth-child(5).activeProfile,
.footer .q-btn.button-footer.profileIcon.footer-right.activeProfile,
.footer .button-footer.profileIcon.footer-right.activeProfile,
.footer .activeProfile.button-footer.profileIcon.footer-right {
  transform: translateX(4px) translateY(3px) scale(1.02) !important;
}

.circle {
  // FAB overlap - 1/3 above footer, 2/3 in footer
  // Border line should align with top edge of footer
  width: auto;
  height: auto;
  border-radius: 0;
  background-color: transparent;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  padding: 0;
  min-width: auto !important;
  min-height: auto !important;
  max-width: none !important;
  max-height: none !important;
  position: absolute;
  left: 50%;
  bottom: 100%;
  overflow: visible;
  flex: 0 0 auto;
  flex-shrink: 0;
  flex-grow: 0;
  cursor: pointer;
  pointer-events: auto;
  z-index: 1000;
  // Position: 1/3 above footer (translate up by 33.33% of button height)
  // Button height is 6rem, so 1/3 = 2rem = 33.33%
  // Additional 6px down (10px + 4px - 3px - 2px - 2px - 1px adjustment)
  transform: translateX(-50%) translateY(calc(-33.33% + 6px));

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
    min-height: 6rem !important;
    min-width: 6rem !important;
    width: 6rem !important;
    height: 6rem !important;
    background: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
    border: none !important;
    border-width: 0 !important;
    outline: none !important;
    overflow: visible;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    cursor: pointer;
    z-index: 1000;

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

  :deep(.q-focus-helper) {
    display: none !important;
    opacity: 0 !important;
    visibility: hidden !important;
  }

  :deep(.q-ripple) {
    display: none !important;
  }

  img {
    height: 1.6rem;
    width: 1.6rem;
    object-fit: contain;
    transition: none !important;
    transform: scale(6);
    transform-origin: center;
    display: block;
    position: relative;
    z-index: 1;
    pointer-events: none;
  }
}
</style>
