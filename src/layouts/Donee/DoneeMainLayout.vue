<template>
  <!-- Splash screen for role switch - outside q-layout -->
  <AppSplash v-if="isSwitchingRole" class="splash-overlay" />

  <q-layout view="lHh Lpr lFf" class="LayoutBackground">

    <HeaderComponent
      :karma="tokenBalance"
      :showBack="settingsPage"
      :is-body-light="isBodyLight"
      v-if="
        !(route.name === 'donee-post-detail') &&
        !(route.name === 'donee-search') &&
        !(route.name === 'donee-help') &&
        !onBoarding &&
        !submit &&
        !postDetail &&
        !(route.meta?.hideMainHeader === true)
      "
      :class="{ 'navbar--hidden': !showNavbar }"
      class="navbar"
    />
    <q-page-container>
      <RouterView />
    </q-page-container>
    <FooterDoneeComponent
      v-if="
        !(route.name === 'donor-post-detail') &&
        !(route.name === 'donor-search') &&
        !(route.name === 'donor-help') &&
        !onBoarding &&
        !submit &&
        !postDetail &&
        !settings &&
        !isDonorRoute &&
        !(route.name === 'donee-postCreation-goal') &&
        !(route.name === 'donee-postCreation-category') &&
        !(route.meta?.hideFooter === true)
      "
      :class="{ 'footer--hidden': !showNavbar || isSwitchingRole || isDonorRoute || isBadgeDrawerOpen }"
      class="navbar"
    />
  </q-layout>
</template>

<script setup lang="ts">
import HeaderComponent from "src/components/doneeComponents/HeaderDoneeComponent.vue";
import FooterDoneeComponent from "src/components/doneeComponents/FooterDoneeComponent.vue";
import AppSplash from "src/components/common/AppSplash.vue";
import { useRoute } from "vue-router";
import { watch, ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useAuthStore } from "src/stores/auth";

// Use MutationObserver to watch for body class changes
let observer: MutationObserver | null = null;

let settingsPage = false;
let onBoarding = false;
let submit = false;
let postDetail = false;
let settings = false;
const route = useRoute();
let routesName = route.name?.toString() || "";

const routeCheck = () => {
  routesName = route.name?.toString() || "";
  // No noisy logs in production
  // If needed, add temporary dev-only debug here.
  // Show back button only on settings sub-pages, not on main settings page
  routesName.startsWith("donee-settings") && routesName !== "donee-settings"
    ? (settingsPage = true)
    : (settingsPage = false);
  routesName.startsWith("donee-onBoarding")
    ? (onBoarding = true)
    : (onBoarding = false);
  routesName.includes("donee-settings-")
    ? (settings = true)
    : (settings = false);
  routesName.startsWith("submit") ? (submit = true) : (submit = false);
  routesName.startsWith("donee-post-detail")
    ? (postDetail = true)
    : (postDetail = false);
};

routeCheck();
watch(route, () => {
  routeCheck();
  checkBodyClass();
});

const authStore = useAuthStore();

// Token balance - must match DonorMainLayout (fallback to 50 after migration)
const tokenBalance = computed(() => authStore.user?.tokens ?? 50);

const lastScrollPosition = ref(0);
const showNavbar = ref(true);
const isBadgeDrawerOpen = ref(false);
const isBadgeDrawerFull = ref(false);
const isSwitchingRole = ref(false);

// Check if current route is donor route
const isDonorRoute = computed(() => {
  const routeName = route.name?.toString() || "";
  return routeName.startsWith("donor-");
});

// Check badge drawer state
const checkBadgeDrawerState = () => {
  isBadgeDrawerOpen.value = document.body.classList.contains("badge-drawer-open");
  isBadgeDrawerFull.value = document.body.classList.contains("badge-drawer-full");
  // Hide header only when drawer is fully open
  if (isBadgeDrawerFull.value) {
    showNavbar.value = false;
  } else if (isBadgeDrawerOpen.value && !isBadgeDrawerFull.value) {
    // If drawer is open but not fully, show navbar
    showNavbar.value = true;
  }
  // Footer is hidden via CSS class when badge-drawer-open is present
};

onMounted(() => {
  window.addEventListener("scroll", onScroll);
});

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
const isMobileDevice =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
const sumEdges = window.innerWidth + window.innerHeight;

const handleResize = () => {
  if (window.innerWidth + window.innerHeight < sumEdges) {
    const footerArr = document.getElementsByClassName("footer");
    for (let i = 0; i < footerArr.length; i++) {
      const footer = footerArr[i] as HTMLElement;
      footer.style.bottom = "auto";
    }
  } else {
    const footerArr = document.getElementsByClassName("footer");
    for (let i = 0; i < footerArr.length; i++) {
      const footer = footerArr[i] as HTMLElement;
      footer.style.bottom = "0";
    }
  }
};
const isBodyLight = ref(false);

const checkBodyClass = () => {
  isBodyLight.value = document.body.classList.contains("body--light");
};

onMounted(async () => {
  // Fetch user data to ensure tokens are loaded
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      await authStore.fetchUser();
    } catch (error) {
      // Silent during boot (weak net / offline is normal). Dev-only debug is enough.
      if (import.meta.env.DEV) {
        console.debug("[DoneeMainLayout] Failed to fetch user data:", error);
      }
    }
  }

  if (isMobileDevice) {
    window.addEventListener("resize", handleResize);
  }
  checkBodyClass();
  checkBadgeDrawerState();
  // Watch for class changes on body element
  observer = new MutationObserver(() => {
    checkBadgeDrawerState();
  });
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });
  // Watch for route changes to detect role switching
  watch(route, (newRoute, oldRoute) => {
    const newRouteName = newRoute.name?.toString() || "";
    const oldRouteName = oldRoute?.name?.toString() || "";
    // If switching from donee to donor route, hide footer immediately
    if (newRouteName.startsWith("donor-") && oldRouteName.startsWith("donee-")) {
      isSwitchingRole.value = true;
      setTimeout(() => {
        isSwitchingRole.value = false;
      }, 800);
    }
  }, { immediate: true });
});

onBeforeUnmount(() => {
  if (isMobileDevice) {
    window.removeEventListener("resize", handleResize);
  }
  checkBodyClass();
  if (observer) {
    observer.disconnect();
  }
});
</script>

<style lang="scss">
.navbar--hidden {
  box-shadow: none;
  transform: translate3d(0, -100%, 0);
}
.footer--hidden {
  box-shadow: none;
  // Move the entire footer (including FAB) fully outside the viewport when hidden
  transform: translate3d(0, 160%, 0);
}

// Hide footer when splash screen is active
body.splash-active .footer {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
  pointer-events: none !important;
}

.splash-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100% !important; max-width: 100%;
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
  width: 100% !important; max-width: 100%;
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
.navbar {
  transition: transform 0.25s ease;
}

.footer.navbar {
  transition: transform 0.25s ease;
}

// Quasar overrides
.q-header {
  transition: transform 0.3s ease;
}

:deep(.q-page-container) {
  padding-bottom: 0 !important;
}

.LayoutBackground {
  background-image: url("/images/Auth/bg-explain.png") !important;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: top;
}

// Aggressive footer button styling to remove white squares
.footer {
  position: fixed !important;
  bottom: -4px !important;
  left: 0 !important;
  right: 0 !important;
  z-index: 2000 !important; // Higher z-index to ensure footer is above content

  :deep(.button-footer) {
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
</style>
