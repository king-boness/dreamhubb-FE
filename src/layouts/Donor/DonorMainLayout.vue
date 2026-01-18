<template>
  <!-- Splash screen for role switch - outside q-layout -->
  <AppSplash v-if="isSwitchingRole" class="splash-overlay" />

  <q-layout
    view="lHh Lpr lFf"
    class="donorLayout"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >

    <!-- TOP HEADER with reveal -->
    <q-header
      reveal
      elevated
      class="donorLayout-header navbar"
      :class="{ 'navbar--hidden': !shouldShowHeader }"
      v-if="!isSwitchingRole"
    >
      <div class="donorLayout-topBar row">
        <!-- Logo + switch icon OR Back button -->
        <div class="row">
          <template v-if="!isSettingsSubPage">
            <div
              class="iconContainer"
              @click="handleLogoClick"
            >
              <img
                :src="logoImage"
                alt=""
                class="logoIcon"
              />
              <img src="/header_icons/donor.svg" alt="" class="header-roleIcon" />
              <img
                :src="donorSwitchIcon"
                alt="donor"
                class="navbarIcon"
              />
            </div>
          </template>
          <template v-else>
            <q-btn class="settingsHeader-button" @click="$router.go(-1)">
              <img src="/icons/arrowIcon.svg" alt="" />
            </q-btn>
          </template>
        </div>

        <!-- Search icon + Token balance -->
        <div class="row">
          <div class="row items-center">
            <svg
              width="49"
              height="49"
              viewBox="0 0 44 44"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              @click="handleSearch"
              class="searchIcon"
            >
              <g opacity="0.8">
                <path
                  d="M31 31L26.65 26.65M29 21C29 25.4183 25.4183 29 21 29C16.5817 29 13 25.4183 13 21C13 16.5817 16.5817 13 21 13C25.4183 13 29 16.5817 29 21Z"
                  stroke="#FAFAFA"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                />
              </g>
            </svg>
          </div>
          <div class="displayKarma">
            <div class="textWrapper">
              <img
                src="/icons/KarmaIcon.png"
                alt=""
                class="navbarKarmaIcon"
              />
              <span class="karmaValue">{{ formatNumber(tokenBalance) }}</span>
              <q-btn
                class="navbarButton"
                @click="handleTokens"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="10"
                  height="10"
                  viewBox="0 0 10 10"
                  fill="none"
                  class="buttonIcon"
                >
                  <path
                    d="M9.16667 4.16667H5.83333V0.833333C5.83333 0.61232 5.74554 0.400358 5.58926 0.244078C5.43297 0.0877975 5.22101 0 5 0C4.77899 0 4.56702 0.0877975 4.41074 0.244078C4.25446 0.400358 4.16667 0.61232 4.16667 0.833333V4.16667H0.833333C0.61232 4.16667 0.400358 4.25446 0.244078 4.41074C0.0877975 4.56702 0 4.77899 0 5C0 5.22101 0.0877975 5.43297 0.244078 5.58926C0.400358 5.74554 0.61232 5.83333 0.833333 5.83333H4.16667V9.16667C4.16667 9.38768 4.25446 9.59964 4.41074 9.75592C4.56702 9.9122 4.77899 10 5 10C5.22101 10 5.43297 9.9122 5.58926 9.75592C5.74554 9.59964 5.83333 9.38768 5.83333 9.16667V5.83333H9.16667C9.38768 5.83333 9.59964 5.74554 9.75592 5.58926C9.9122 5.43297 10 5.22101 10 5C10 4.77899 9.9122 4.56702 9.75592 4.41074C9.59964 4.25446 9.38768 4.16667 9.16667 4.16667Z"
                    fill="#BD0043"
                  />
                </svg>
              </q-btn>
            </div>
          </div>
        </div>
      </div>
    </q-header>

    <!-- PAGE CONTAINER -->
    <q-page-container class="no-padding-bottom">
      <router-view />
    </q-page-container>

    <!-- BOTTOM FOOTER with reveal -->
    <div
      v-if="!$route.meta?.hideFooter"
      class="footer navbar row col-12"
      :class="{ 'footer--hidden': !shouldShowFooter, 'iphoneDevice-footer': $q.platform.is.ios }"
    >
      <q-btn
        :ripple="false"
        @click="handleNavHome"
        class="button-footer"
        :class="{ active: activeNav === 'home' }"
      >
        <img
          :src="navIconHome"
          :alt="t('home')"
          class="footer-marginClass"
        />
        <span class="footer-pageName">{{ t("home") }}</span>
      </q-btn>
      <q-btn
        :ripple="false"
        @click="handleNavInspirations"
        class="button-footer"
        :class="{ active: activeNav === 'discover' }"
      >
        <img
          :src="navIconDiscover"
          :alt="t('inspirations')"
          class="footer-marginClass"
        />
        <span class="footer-pageName">{{ t("inspirations") }}</span>
      </q-btn>
      <q-btn
        :ripple="false"
        @click="handleNavNotifications"
        class="button-footer red"
        :class="{ active: activeNav === 'notifications' }"
      >
        <img
          :src="navIconNotifications"
          :alt="t('notificationsLabel')"
          class="footer-marginClass"
        />
        <span v-if="notificationCount > 0" class="donor-footer_badge">{{ notificationCount }}</span>
        <span class="footer-pageName">{{ t("notificationsLabel") }}</span>
      </q-btn>
      <q-btn
        :ripple="false"
        @click="handleNavProfile"
        class="button-footer profileIcon"
        :class="{ activeProfile: activeNav === 'profile' }"
      >
        <UserAvatar
          :image-url="authStore.avatarUrl"
          :name="authStore.name"
          size="1.8rem"
          class="profileImg"
        />
        <span class="footer-pageName profileName">{{ t("profile") }}</span>
      </q-btn>
    </div>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useI18n } from "vue-i18n";
import { useEdgeSwipeBack } from "src/composables/useEdgeSwipeBack";
import { formatNumber } from "src/components/partials/FunctionsComponent.vue";
import AppSplash from "src/components/common/AppSplash.vue";
import { useAuthStore } from "src/stores/auth";
import { usePreferencesStore } from "src/stores/preferences";
import { useNotificationsStore } from "src/stores/notifications";
import UserAvatar from "src/components/common/UserAvatar.vue";

const { t } = useI18n();

const $q = useQuasar();
const authStore = useAuthStore();
const preferencesStore = usePreferencesStore();
const notificationsStore = useNotificationsStore();

// Enable swipe-back gesture
useEdgeSwipeBack();

// Asset imports
const donorSwitchIcon = "/header_icons/swap.svg";
const logoImageLight = new URL("../../assets/logos/dreamhubb_logo_l.svg", import.meta.url).href;
const logoImageDark = new URL("../../assets/logos/dreamhubb_logo_d.svg", import.meta.url).href;

// Computed logo based on light/dark mode
const logoImage = computed(() => {
  // Light mode: use dark logo (dreamhubb_logo_d.svg)
  // Dark mode: use light logo (dreamhubb_logo_l.svg)
  return isBodyLight.value ? logoImageDark : logoImageLight;
});

const route = useRoute();
const router = useRouter();

// Scroll-based header/footer hiding (matching donee behavior)
const lastScrollPosition = ref(0);
const showNavbar = ref(true);

const onScroll = () => {
  // Don't hide/show navbar based on scroll when badge drawer is fully open
  if (isBadgeDrawerFull.value) {
    showNavbar.value = false;
    return;
  }

  // If badge drawer is open but not fully, show navbar
  if (isBadgeDrawerOpen.value && !isBadgeDrawerFull.value) {
    showNavbar.value = true;
    return;
  }

  const currentScrollPosition =
    window.scrollY || document.documentElement.scrollTop;

  if (currentScrollPosition < 0) {
    return;
  }
  if (Math.abs(currentScrollPosition - lastScrollPosition.value) < 65) {
    return;
  }
  showNavbar.value = currentScrollPosition < lastScrollPosition.value;
  lastScrollPosition.value = currentScrollPosition;
};

// Token balance from auth store (falls back to 30 if not loaded)
const tokenBalance = computed(() => authStore.user?.tokens ?? 50);
// Notification count from notifications store
const notificationCount = computed(() => notificationsStore.unreadCount);
const isSwitchingRole = ref(false);

// Active navigation state
const activeNav = ref<"home" | "discover" | "notifications" | "profile">("home");

// Check if light mode is enabled
const isBodyLight = ref(false);
const checkBodyClass = () => {
  // Check both Quasar dark mode and body class
  isBodyLight.value = !$q.dark.isActive || document.body.classList.contains("body--light");
};

// Computed for footer icons
const navIconHome = computed(() => {
  // If selected, always use _s version
  if (activeNav.value === "home") {
    return "/footer_icons/home_s.svg";
  }
  // If not selected: light mode uses _lm, dark mode uses _ns
  return isBodyLight.value ? "/footer_icons/home_lm.svg" : "/footer_icons/home_ns.svg";
});
const navIconDiscover = computed(() => {
  // If selected, always use _s version
  if (activeNav.value === "discover") {
    return "/footer_icons/compass_s.svg";
  }
  // If not selected: light mode uses _lm, dark mode uses _ns
  return isBodyLight.value ? "/footer_icons/compass_lm.svg" : "/footer_icons/compass_ns.svg";
});
const navIconNotifications = computed(() => {
  // If selected, always use _s version
  if (activeNav.value === "notifications") {
    return "/footer_icons/bell_s.svg";
  }
  // If not selected: light mode uses _lm, dark mode uses _ns
  return isBodyLight.value ? "/footer_icons/bell_lm.svg" : "/footer_icons/bell_ns.svg";
});
const navIconProfile = computed(() => {
  // If selected, always use _s version
  if (activeNav.value === "profile") {
    return "/footer_icons/profile_s.svg";
  }
  // If not selected: light mode uses _lm, dark mode uses _ns
  return isBodyLight.value ? "/footer_icons/profile_lm.svg" : "/footer_icons/profile_ns.svg";
});

// Check if we're on a settings sub-page
const isSettingsSubPage = computed(() => {
  const routeName = route.name?.toString() || "";
  return routeName.startsWith("donor-settings") && routeName !== "donor-settings";
});

// Header/Footer visibility logic
const shouldShowHeader = computed(() => {
  const routeName = route.name?.toString() || "";
  // Hide header on detail pages, search, help page, etc.
  // Show header on all settings pages (main and sub-settings), same as donee side
  const hideOnRoute = (
    routeName === "donor-post-detail" ||
    routeName === "donor-search" ||
    routeName === "donor-help" ||
    routeName.startsWith("donor-onBoarding")
  );
  // Hide header if on specific routes, badge drawer is fully open, or scrolling down
  return !(hideOnRoute || isBadgeDrawerFull.value || !showNavbar.value);
});

const shouldShowFooter = computed(() => {
  const routeName = route.name?.toString() || "";
  // Hide footer on detail pages, search, sub-settings pages, filters, help page, etc.
  // Show footer on main settings page (donor-settings), hide on sub-settings (donor-settings-*)
  const hideOnRoute = (
    routeName === "donor-post-detail" ||
    routeName === "donor-search" ||
    routeName === "donor-filters" ||
    routeName === "donor-help" ||
    (routeName.startsWith("donor-settings") && routeName !== "donor-settings") ||
    routeName.startsWith("donor-onBoarding")
  );
  // Hide footer if on specific routes, badge drawer is open, scrolling down, or switching role
  return !(hideOnRoute || isBadgeDrawerOpen.value || !showNavbar.value || isSwitchingRole.value);
});

// Handlers
const handleSearch = () => {
  router.push({ name: "donor-search" });
};

const handleTokens = () => {
  router.push({ name: "donor-tokenshop" });
};

const handleNavHome = () => {
  activeNav.value = "home";
  router.push({ name: "donor-posts" });
};

const handleNavInspirations = () => {
  activeNav.value = "discover";
  router.push({ name: "donor-inspirations" });
};

const handleNavNotifications = async () => {
  // Mark all notifications as read when user clicks on notifications icon
  await notificationsStore.markAllAsRead();
  activeNav.value = "notifications";
  router.push({ name: "donor-notifications" });
};

const handleNavProfile = () => {
  activeNav.value = "profile";
  router.push({ name: "donor-myprofile" });
};

const handleLogoClick = async () => {
  preferencesStore.setCurrentSide("donee");
  document.body.classList.add("splash-active");
  isSwitchingRole.value = true;
  await new Promise(resolve => setTimeout(resolve, 500));
  await router.push({ name: "donee-posts" });
  setTimeout(() => {
    isSwitchingRole.value = false;
    document.body.classList.remove("splash-active");
  }, 300);
};

// Swipe back gesture
const touchStartX = ref(0);
const touchStartY = ref(0);
const isSwipeTracking = ref(false);

const SWIPE_EDGE_THRESHOLD = 40; // px from left edge
const SWIPE_MIN_DISTANCE = 80; // minimum distance to the right
const SWIPE_MAX_VERTICAL_DRIFT = 50; // to ensure horizontal gesture

const onTouchStart = (event: TouchEvent) => {
  if (event.touches.length !== 1) return;
  const touch = event.touches[0];
  touchStartX.value = touch.clientX;
  touchStartY.value = touch.clientY;
  // Track only gestures starting from the left edge
  isSwipeTracking.value = touchStartX.value <= SWIPE_EDGE_THRESHOLD;
};

const onTouchEnd = (event: TouchEvent) => {
  if (!isSwipeTracking.value || event.changedTouches.length !== 1) {
    isSwipeTracking.value = false;
    return;
  }
  const touch = event.changedTouches[0];
  const deltaX = touch.clientX - touchStartX.value;
  const deltaY = Math.abs(touch.clientY - touchStartY.value);

  if (deltaX > SWIPE_MIN_DISTANCE && deltaY < SWIPE_MAX_VERTICAL_DRIFT) {
    router.back();
  }
  isSwipeTracking.value = false;
};

// Watch for badge drawer state changes
const isBadgeDrawerOpen = ref(false);
const isBadgeDrawerFull = ref(false);
const checkBadgeDrawerState = () => {
  isBadgeDrawerOpen.value = document.body.classList.contains("badge-drawer-open");
  isBadgeDrawerFull.value = document.body.classList.contains("badge-drawer-full");
};

// Use MutationObserver to watch for body class changes
let observer: MutationObserver | null = null;

// Watch for Quasar dark mode changes
watch(() => $q.dark.isActive, () => {
  // Use nextTick to ensure body class is updated
  setTimeout(() => {
    checkBodyClass();
  }, 0);
}, { immediate: true });

onMounted(async () => {
  checkBadgeDrawerState();
  checkBodyClass();
  window.addEventListener("scroll", onScroll);
  // Watch for class changes on body element (including body--light for light mode)
  observer = new MutationObserver(() => {
    checkBadgeDrawerState();
    checkBodyClass();
  });

  // Fetch user data to get current token balance
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      await authStore.fetchUser();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to fetch user data:", error);
      }
    }
  }

  // Fetch notifications if user is authenticated
  if (authStore.isAuthenticated) {
    try {
      await notificationsStore.fetchUnreadCount();
      // Optionally fetch full notifications list (for badge)
      // await notificationsStore.fetchNotifications();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to fetch notifications:", error);
      }
    }
  }
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });
});

onBeforeUnmount(() => {
  window.removeEventListener("scroll", onScroll);
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style lang="scss">
.donorLayout {
  background-image: url("/images/Auth/bg-explain.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: top;

  // TOP HEADER (matching donee style)
  .donorLayout-header {
    background-image: none;
    background-image: url("/images/Auth/bg-explain.png") !important;
    background-repeat: no-repeat;
    background-size: auto;
    border-bottom: 0.05rem solid rgba(255, 255, 255, 0.202);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    padding: 0; // No padding on header, padding is in topBar
  }

  .donorLayout-topBar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 0.5rem;
    padding: 3rem 1rem 1rem 1rem; // Match donee header padding
    width: 100%;

    .iconContainer {
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: opacity 0.2s ease;
      gap: 0.6rem;
      flex-shrink: 0;

      &:hover {
        opacity: 0.8;
      }
    }

    .logoIcon {
      height: 1.6rem;
      width: 1.6rem;
      object-fit: contain;
    }

    .header-roleIcon {
      height: 1rem;
      width: auto;
      object-fit: contain;
    }

    .navbarIcon {
      height: 1.6rem;
      width: auto;
      object-fit: contain;
    }

    .searchIcon {
      cursor: pointer;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 0.6;
      }
    }

    .displayKarma {
      display: flex;
      justify-content: center;
      align-items: center;
      background-color: rgba(47, 47, 47, 0.6);
      border: 0.1rem solid #5a0e29b8;
      width: auto;
      height: 3rem;
      padding: 0.3rem;
      border-radius: 0.6rem;

      .textWrapper {
        display: flex;
        justify-content: center;
        align-items: center;
        gap: 0.6rem;

        .navbarKarmaIcon {
          height: 1.3rem;
        }

        .karmaValue {
          color: #f3f3f3a2;
          font-size: 1.2rem;
          font-family: poppinsBold;
          margin-right: 0.5rem;
        }
      }

      .navbarButton {
        background: rgba(189, 0, 67, 0.1);
        padding: 0.5rem;
        width: 2.25rem;
        height: 2.25rem;
        border-radius: 0.4rem;
        padding-left: 0.5rem;
        cursor: pointer;
        transition: background 0.2s ease;

        &:hover {
          background: rgba(189, 0, 67, 0.2);
        }
      }

      .buttonIcon {
        width: 1rem;
        height: 1rem;
      }
    }

    .settingsHeader-button {
      margin: 0 0.4rem;
      width: 2.8rem;
      height: 2.8rem;
      border-radius: 2rem;
      margin-right: 4.1rem;
      background: linear-gradient(
        90deg,
        rgba(44, 44, 44, 0.832) 10%,
        rgba(67, 66, 66, 0.986) 100%
      );
    }
  }

  // BOTTOM FOOTER (matching donee footer style)
  .footer {
    background-image: none;
    background-image: url("/icons/rectangle.svg") !important;
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    border-top: none !important;
    box-shadow: none !important;
    z-index: 2000; // Higher z-index to ensure footer is above content

    &::before,
    &::after {
      display: none !important;
      content: none !important;
    }

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

      // Target q-btn__wrapper specifically
      .q-btn__wrapper {
        background: transparent !important;
        background-color: transparent !important;
        box-shadow: none !important;
        border: none !important;
        border-width: 0 !important;
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
      }

      // Target q-btn__content
      .q-btn__content {
        background: transparent !important;
        background-color: transparent !important;
        box-shadow: none !important;
        border: none !important;
        border-width: 0 !important;
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
      }

      // Hide focus helper and ripple
      .q-focus-helper {
        display: none !important;
        opacity: 0 !important;
        visibility: hidden !important;
      }

      .q-ripple {
        display: none !important;
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
    padding: 0 !important;
    margin: 0 !important;
    width: auto !important;
    height: auto !important;
    color: inherit !important;
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
    }

    :deep(.q-ripple) {
      display: none !important;
    }

    img {
      transition: opacity 0.3s cubic-bezier(0.34, 1.56, 0.64, 1), transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;
      will-change: opacity, transform;
    }

    .footer-pageName {
      transition: opacity 0.25s ease, color 0.25s ease !important;
      will-change: opacity, color;
    }

    &:hover {
      background: transparent !important;
      background-color: transparent !important;
      box-shadow: none !important;
      border: none !important;
      border-width: 0 !important;
      outline: none !important;
      transform: translateY(-2px) scale(1.05);
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
        transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
    }

    &:active {
      background: transparent !important;
      background-color: transparent !important;
      box-shadow: none !important;
      border: none !important;
      border-width: 0 !important;
      outline: none !important;
      transform: translateY(0) scale(0.95);
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
        transition: transform 0.15s cubic-bezier(0.4, 0, 0.2, 1) !important;
      }
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
      }
    }

    &:focus-visible {
      outline: none !important;
      box-shadow: none !important;
      background: transparent !important;
      background-color: transparent !important;
      border: none !important;
      border-width: 0 !important;
    }
  }

  .active.button-footer,
  .activeProfile.button-footer {
    background: transparent !important;
    background-color: transparent !important;
    box-shadow: none !important;
    border: none !important;
    border-width: 0 !important;
    outline: none !important;
    width: auto !important;
    height: auto !important;
    transform: translateY(-1px) scale(1.02);
    transition: transform 0.3s cubic-bezier(0.34, 1.56, 0.64, 1) !important;

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

    :deep(.q-btn__wrapper),
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
        background: none !important;
        background-color: transparent !important;
        opacity: 0 !important;
        visibility: hidden !important;
        box-shadow: none !important;
        border: none !important;
        border-width: 0 !important;
      }
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
      outline: none !important;

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

    :deep(.q-btn__content) {
      background: transparent !important;
      box-shadow: none !important;
      border: none !important;
      outline: none !important;
      padding: 0 !important;
      margin: 0 !important;

      &::before,
      &::after {
        display: none !important;
        content: none !important;
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

    &:hover,
    &:active,
    &:focus {
      background: transparent !important;
      box-shadow: none !important;
      border: none !important;
      outline: none !important;
    }
  }

  .no-padding-bottom {
    padding-bottom: 0 !important;
  }

  // Remove padding-top for post-detail page and help page
  .q-page-container:has(.postDetail),
  .q-page-container:has(.help-page) {
    padding-top: 0 !important;
  }

  .footer-marginClass {
    height: 1.6rem;
    width: 1.6rem;
    display: block;
    transition: opacity 0.3s ease, transform 0.3s ease !important;
  }

  .profileIcon .footer-marginClass {
    height: 2.4rem !important;
    width: 2.4rem !important;
  }

  .activeProfile {
    background: transparent !important;

    .profileImg {
      // Use a "ring" that doesn't change layout (unlike border).
      // Matches donee selected Profile look more reliably across Quasar/QAvatar.
      box-shadow: 0 0 0 0.16rem #bd0043 !important;
      border-radius: 999px !important;
    }

    .profileImg img {
      border-radius: 999px !important;
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

  .button-footer.red {
    position: relative;
  }

  .donor-footer_badge {
    position: absolute;
    top: -4px;
    right: 10px;
    min-width: 16px;
    height: 16px;
    padding: 0 4px;
    border-radius: 999px;
    background: #ff2c2c;
    color: #fff;
    font-size: 10px;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
}

// Light mode overrides for footer buttons
.body--light {
  .donorLayout {
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
    }

    .active.button-footer,
    .activeProfile.button-footer {
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
}

// Quasar overrides
.q-header {
  transition: transform 0.3s ease;
}

.footer--hidden {
  box-shadow: none;
  transform: translate3d(0, 110%, 0);
}

.navbar {
  transition: transform 0.25s ease;
}

.footer.navbar {
  transition: transform 0.25s ease;
}

.navbar--hidden {
  box-shadow: none;
  transform: translate3d(0, -100%, 0);
}

.splash-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
  z-index: 99999 !important;
  overflow: hidden !important;
}

// Remove padding from q-layout when splash is active
body:has(.splash-overlay) .q-layout {
  padding: 0 !important;
  margin: 0 !important;
}

// Ensure body and html have no padding/margin when splash is active
body:has(.splash-overlay),
html:has(.splash-overlay) {
  margin: 0 !important;
  padding: 0 !important;
  overflow: hidden !important;
  width: 100vw !important;
  height: 100vh !important;
}

// Ensure splash overlay covers entire viewport
body:has(.splash-overlay) {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
}
</style>
