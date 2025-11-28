<template>
  <q-layout
    view="lHh Lpr lFf"
    class="donorLayout"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <!-- Splash screen for role switch -->
    <AppSplash v-if="isSwitchingRole" class="splash-overlay" />

    <!-- TOP HEADER with reveal -->
    <q-header
      reveal
      elevated
      class="donorLayout-header"
      v-if="shouldShowHeader && !isSwitchingRole"
    >
      <div class="donorLayout-topBar">
        <!-- Logo + switch icon -->
        <div class="topBar-left">
          <div
            class="iconContainer"
            @click="handleLogoClick"
          >
            <img
              src="/icons/logo.svg"
              alt=""
              class="logoIcon"
            />
            <img
              :src="donorSwitchIcon"
              alt="donor"
              class="navbarIcon"
            />
          </div>
        </div>

        <!-- Search icon -->
        <div class="topBar-center">
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

        <!-- Token balance + add -->
        <div class="topBar-right">
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
    <q-page-container>
      <router-view />
    </q-page-container>

    <!-- BOTTOM FOOTER with reveal -->
    <q-footer
      reveal
      elevated
      class="donor-footer"
      v-if="shouldShowFooter"
    >
      <div class="donor-footer_bg">
          <!-- HOME -->
          <button
            class="donor-footer_item"
            :class="{ 'donor-footer_item--active': activeNav === 'home' }"
            type="button"
            @click="handleNavHome"
          >
            <img
              :src="navIcons.home.value"
              alt="Home"
              class="donor-footer_icon"
            />
            <span class="donor-footer_label">Home</span>
          </button>

          <!-- DISCOVER / INSPIRATIONS -->
          <button
            class="donor-footer_item"
            :class="{ 'donor-footer_item--active': activeNav === 'discover' }"
            type="button"
            @click="handleNavInspirations"
          >
            <img
              :src="navIcons.discover.value"
              alt="Discover"
              class="donor-footer_icon"
            />
            <span class="donor-footer_label">Inspirations</span>
          </button>

          <!-- NOTIFICATIONS -->
          <button
            class="donor-footer_item"
            :class="{ 'donor-footer_item--active': activeNav === 'notifications' }"
            type="button"
            @click="handleNavNotifications"
          >
            <q-icon
              name="notifications"
              class="donor-footer_icon"
            />
            <span v-if="notificationCount > 0" class="donor-footer_badge">{{ notificationCount }}</span>
            <span class="donor-footer_label">Notifications</span>
          </button>

          <!-- PROFILE -->
          <button
            class="donor-footer_item"
            :class="{ 'donor-footer_item--active': activeNav === 'profile' }"
            type="button"
            @click="handleNavProfile"
          >
            <q-icon
              name="person"
              class="donor-footer_icon"
            />
            <span class="donor-footer_label">Profile</span>
          </button>
      </div>
    </q-footer>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useEdgeSwipeBack } from "src/composables/useEdgeSwipeBack";
import { formatNumber } from "src/components/partials/FunctionsComponent.vue";
import AppSplash from "src/components/common/AppSplash.vue";

// Enable swipe-back gesture
useEdgeSwipeBack();

// Asset imports
const donorSwitchIcon = new URL("../../assets/icons/DonorSwitchIcon.svg", import.meta.url).href;
const homeIconActive = new URL("../../assets/icons/homeIcon.svg", import.meta.url).href;
const homeIconInactive = new URL("../../assets/icons/homeIcon.svg", import.meta.url).href;
const discoverIconActive = new URL("../../assets/icons/ExploreIcon.svg", import.meta.url).href;
const discoverIconInactive = new URL("../../assets/icons/ExploreIcon.svg", import.meta.url).href;

const route = useRoute();
const router = useRouter();

// Mock data
const tokenBalance = ref(268);
const notificationCount = ref(1);
const isSwitchingRole = ref(false);

// Active navigation state
const activeNav = ref<"home" | "discover" | "notifications" | "profile">("home");

// Computed for icons
const navIcons = {
  home: computed(() => activeNav.value === "home" ? homeIconActive : homeIconInactive),
  discover: computed(() => activeNav.value === "discover" ? discoverIconActive : discoverIconInactive)
};

// Header/Footer visibility logic
const shouldShowHeader = computed(() => {
  const routeName = route.name?.toString() || "";
  // Hide header on detail pages, search, settings, etc.
  return !(
    routeName === "donor-post-detail" ||
    routeName === "donor-search" ||
    routeName.startsWith("donor-settings") ||
    routeName.startsWith("donor-onBoarding")
  );
});

const shouldShowFooter = computed(() => {
  const routeName = route.name?.toString() || "";
  // Hide footer on detail pages, search, settings, filters, etc.
  return !(
    routeName === "donor-post-detail" ||
    routeName === "donor-search" ||
    routeName === "donor-filters" ||
    routeName.startsWith("donor-settings") ||
    routeName.startsWith("donor-onBoarding")
  );
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

const handleNavNotifications = () => {
  activeNav.value = "notifications";
  router.push({ name: "donor-notifications" });
};

const handleNavProfile = () => {
  activeNav.value = "profile";
  router.push({ name: "donor-myprofile" });
};

const handleLogoClick = async () => {
  console.log("Donor logo clicked! Switching to Donee mode...");
  // Show splash screen
  isSwitchingRole.value = true;
  // Wait a bit for splash to show, then navigate
  await new Promise(resolve => setTimeout(resolve, 500));
  // Switch to Donee interface (role switch)
  await router.push({ name: "donee-posts" });
  // Hide splash after navigation
  setTimeout(() => {
    isSwitchingRole.value = false;
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
    padding: 1.3rem 0 1rem 0; // Match donee header padding (top and bottom)
  }

  .donorLayout-topBar {
    display: flex;
    align-items: center;
    justify-content: space-around;
    gap: 0.5rem;
    padding: 0; // Remove padding from topBar, it's now in header
    width: 100%;

    .topBar-left,
    .topBar-center,
    .topBar-right {
      display: flex;
      align-items: center;
    }

    .topBar-left {
      flex: 0;
      justify-content: flex-start;
    }

    .iconContainer {
      display: flex;
      align-items: center;
      cursor: pointer;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 0.8;
      }
    }

    .logoIcon {
      height: 1.6rem;
      width: 1.6rem;
      margin-right: 0.5rem;
    }

    .navbarIcon {
      height: auto;
      width: auto;
    }

    .topBar-center {
      flex: 0;
      justify-content: center;
    }

    .searchIcon {
      cursor: pointer;
      transition: opacity 0.2s ease;

      &:hover {
        opacity: 0.6;
      }
    }

    .topBar-right {
      flex: 0;
      justify-content: flex-end;
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
  }

  // BOTTOM FOOTER
  .donor-footer {
    background: transparent;
    padding-bottom: env(safe-area-inset-bottom);
    display: flex;
    justify-content: center;
    align-items: center;
  }

  .donor-footer_bg {
    width: 100%;
    max-width: 390px; // šírka Figma layoutu
    height: 80px; // podľa PNG baru
    margin: 0 auto;
    background: linear-gradient(180deg, rgba(23, 21, 31, 0.95) 0%, rgba(13, 11, 19, 0.9) 100%);
    border-radius: 40px 40px 0 0;
    display: flex;
    justify-content: space-around;
    align-items: center;
  }

  .donor-footer_item {
    position: relative;
    border: none;
    background: transparent;
    padding: 8px 0;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    cursor: pointer;
    transition: transform 0.2s ease;

    &:hover {
      transform: scale(1.05);
    }
  }

  .donor-footer_label {
    font-size: 0.65rem;
    font-weight: 500;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 2px;
    transition: color 0.2s ease;
  }

  .donor-footer_item--active .donor-footer_label {
    color: #ff2c8b;
  }

  .donor-footer_icon {
    width: 24px;
    height: 24px;
    display: block;
    filter: brightness(0) invert(1); // White color for inactive
    opacity: 0.6;
  }

  .donor-footer_item--active .donor-footer_icon {
    opacity: 1;
  }

  .donor-footer_item--active img.donor-footer_icon {
    filter: brightness(0) saturate(100%) invert(35%) sepia(95%) saturate(7500%) hue-rotate(325deg) brightness(110%) contrast(105%); // Brighter pink for active
  }

  .donor-footer_badge {
    position: absolute;
    top: -4px;
    right: -8px;
    min-width: 18px;
    height: 18px;
    padding: 0 4px;
    border-radius: 9px;
    background: #ff2c2c;
    color: #fff;
    font-size: 0.7rem;
    font-weight: 700;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }
}

// Quasar overrides
.q-header,
.q-footer {
  transition: transform 0.3s ease;
}

.splash-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  z-index: 9999;
}
</style>
