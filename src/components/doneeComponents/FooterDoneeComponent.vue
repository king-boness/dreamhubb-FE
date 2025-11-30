<template>
  <div
    class="footer row col-12"
    :class="{ 'iphoneDevice-footer': $q.platform.is.ios }"
  >
    <q-btn
      :ripple="false"
      @click="$router.push({ name: 'donee-posts' })"
      class="button-footer"
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
      class="button-footer"
      :class="{ active: $route.name === 'donee-inspirations' }"
    >
      <img
        :src="$route.name === 'donee-inspirations' ? '/footer_icons/compass_s.svg' : '/footer_icons/compass.svg'"
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
      class="button-footer red"
      :class="{ active: $route.name === 'donee-notifications' }"
    >
      <img
        :src="$route.name === 'donee-notifications' ? '/footer_icons/bell_s.svg' : '/footer_icons/bell.svg'"
        alt="Notifications"
        class="footer-marginClass"
      />
      <span class="footer-pageName">Notifications</span>
    </q-btn>

    <q-btn
      :ripple="false"
      @click="$router.push({ name: 'donee-myprofile' })"
      class="button-footer profileIcon"
      :class="{
        activeProfile:
          $route.name == 'donee-myprofile' || $route.name == 'donee-settings'
      }"
    >
      <img
        :src="($route.name == 'donee-myprofile' || $route.name == 'donee-settings') ? '/footer_icons/profile_s.svg' : '/footer_icons/profile.svg'"
        alt="Profile"
        class="footer-marginClass"
      />
      <span class="footer-pageName profileName">Profile</span>
    </q-btn>
  </div>
</template>
<script setup lang="ts">
// No props needed - footer icons are handled via route state
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
}
.footer {
  background-image: none;
  background-image: url("/icons/rectangle.svg") !important;
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
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
  padding: 0 !important;
  margin: 0 !important;

  &::before,
  &::after {
    display: none !important;
    content: none !important;
    box-shadow: none !important;
    border: none !important;
    background: none !important;
  }

  :deep(.q-btn__wrapper) {
    padding: 0 !important;
    min-height: auto !important;
    min-width: auto !important;
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
  height: 2rem !important;
  width: 2rem !important;
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

.circle {
  width: 4.1rem;
  height: 4.1rem;
  border-radius: 50%;
  background-color: $primary;
  display: flex;
  justify-content: center;
  align-items: center;
  margin-top: -1.9rem;
  img {
    height: 1.8rem;
  }
}
</style>
