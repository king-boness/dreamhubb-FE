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
        :src="$route.name === 'donee-posts' ? '/footer_icons/home_s.svg' : '/footer_icons/home.svg'"
        alt="Home"
        class="footer-marginClass"
      />
      <span class="footer-pageName">Home</span>
    </q-btn>
    <q-btn
      :ripple="false"
      @click="$router.push({ name: 'donee-inspirations' })"
      class="button-footer footer-left"
      :class="{ active: $route.name === 'donee-inspirations' }"
    >
      <img
        :src="compassIcon"
        alt="Inspirations"
        class="footer-marginClass"
      />
      <span class="footer-pageName">Inspirations</span>
    </q-btn>
    <q-btn class="circle" @click="$router.push('submit/1')">
      <img src="/footer_icons/post.svg" alt="Add Post" />
    </q-btn>
    <q-btn
      :ripple="false"
      @click="$router.push({ name: 'donee-notifications' })"
      class="button-footer red footer-right"
      :class="{ active: $route.name === 'donee-notifications' }"
    >
      <img
        :src="bellIcon"
        alt="Notifications"
        class="footer-marginClass"
      />
      <span class="footer-pageName">Notifications</span>
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
      <img
        :src="profileIcon"
        alt="Profile"
        class="footer-marginClass"
      />
      <span class="footer-pageName profileName">Profile</span>
    </q-btn>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRoute } from "vue-router";

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
const compassIcon = computed(() => {
  // If selected, always use _s version
  if (route.name === "donee-inspirations") {
    return "/footer_icons/compass_s.svg";
  }
  // If not selected: light mode uses _lm, dark mode uses normal
  return isBodyLight.value ? "/footer_icons/compass_lm.svg" : "/footer_icons/compass.svg";
});

const bellIcon = computed(() => {
  // If selected, always use _s version
  if (route.name === "donee-notifications") {
    return "/footer_icons/bell_s.svg";
  }
  // If not selected: light mode uses _lm, dark mode uses normal
  return isBodyLight.value ? "/footer_icons/bell_lm.svg" : "/footer_icons/bell.svg";
});

const profileIcon = computed(() => {
  // If selected, always use _s version
  if (route.name === "donee-myprofile" || route.name === "donee-settings") {
    return "/footer_icons/profile_s.svg";
  }
  // If not selected: light mode uses _lm, dark mode uses normal
  return isBodyLight.value ? "/footer_icons/profile_lm.svg" : "/footer_icons/profile.svg";
});
</script>
<style lang="scss" scoped>
.body--light {
  .wheelIcon {
    * {
      z-index: 111;
    }
  }
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

  // Ensure all q-btn elements in footer have transparent background
  :deep(.q-btn) {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;

    &::before,
    &::after {
      display: none !important;
      content: none !important;
      background: none !important;
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
  box-shadow: none !important;
  border: none !important;
  transition: transform 0.2s ease !important;
  outline: none !important;
  min-width: auto !important;
  min-height: auto !important;
  width: auto !important;
  height: auto !important;
  padding: 0 !important;
  margin: 0 !important;
  flex: 0 0 auto;
  flex-shrink: 0;
  flex-grow: 0;
  align-self: center;
  position: relative;
  z-index: 1;

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

  &:hover {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    outline: none !important;
    transform: scale(1.1);
  }

  &:active {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    outline: none !important;
    transform: scale(0.95);
  }

  &:focus {
    background: transparent !important;
    box-shadow: none !important;
    border: none !important;
    outline: none !important;
  }

  &:focus-visible {
    outline: none !important;
    box-shadow: none !important;
  }
}

.active.button-footer {
  background: transparent !important;
  box-shadow: none !important;
  border: none !important;
  outline: none !important;

  &::before,
  &::after {
    display: none !important;
    content: none !important;
    box-shadow: none !important;
    border: none !important;
    background: none !important;
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

.profileIcon .footer-marginClass {
  height: 2.4rem !important;
  width: 2.4rem !important;
}

.activeProfile {
  background: transparent !important;

  .profileImg {
    border: 0.16rem solid #bd0043 !important;
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
.profileName {
  margin-bottom: 0rem !important;
}

.footer-left {
  margin-left: -1.5rem !important;
  pointer-events: auto;
  position: relative;
  z-index: 1;
}

.footer-right {
  margin-right: -1.5rem !important;
  pointer-events: auto;
  position: relative;
  z-index: 1;
}

.circle {
  width: auto;
  height: auto;
  border-radius: 0;
  background-color: transparent;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  margin-top: -1rem;
  padding: 0;
  min-width: auto !important;
  min-height: auto !important;
  max-width: none !important;
  max-height: none !important;
  position: relative;
  overflow: visible;
  flex: 0 0 auto;
  flex-shrink: 0;
  flex-grow: 0;
  align-self: flex-start;
  cursor: pointer;
  pointer-events: auto;
  z-index: 1000;

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
    box-shadow: none !important;
    border: none !important;
    overflow: visible;
    position: relative;
    display: inline-flex;
    align-items: center;
    justify-content: center;
    pointer-events: auto;
    cursor: pointer;
    z-index: 1000;
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
