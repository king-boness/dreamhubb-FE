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
      :class="{
        'navbar--hidden': !showNavbar,
        'dh-use-transform-chrome-hide': isDoneeSettingsTreeRoute
      }"
      class="navbar"
    />
    <q-page-container
      :class="{
        'post-creation-flow': isPostCreationFlow,
        'post-creation-picker': isPostCreationPicker,
        'role-has-custom-header': isHeaderVisible,
        'dh-settings-scroll-root': isDoneeSettingsTreeRoute
      }"
    >
      <router-view :key="route.name?.toString() ?? route.fullPath" />
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
import { watch, ref, computed, onMounted, onBeforeUnmount, nextTick } from "vue";
import { useAuthStore } from "src/stores/auth";
import { useRouteSettlingBodyClass } from "src/composables/useRouteSettling";

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

useRouteSettlingBodyClass();

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

// Post-creation flow: goal picker, category picker, post creation page – single class for layout fixes
const isPostCreationFlow = computed(() => {
  const name = route.name?.toString() || "";
  return (
    name === "submit-postCreation" ||
    name === "donee-postCreation-goal" ||
    name === "donee-postCreation-category"
  );
});

// Picker-only screens (goal/category): fix viewport height + no page scroll / rubber-band; form page (submit-postCreation) keeps scroll
const isPostCreationPicker = computed(() => {
  const name = route.name?.toString() || "";
  return name === "donee-postCreation-goal" || name === "donee-postCreation-category";
});

// Header visible = same condition as HeaderComponent v-if; used to avoid duplicate safe-area on q-page-container (header already has iphoneDevice padding)
const isHeaderVisible = computed(() => {
  const name = route.name?.toString() || "";
  return (
    route.name !== "donee-post-detail" &&
    route.name !== "donee-search" &&
    route.name !== "donee-help" &&
    !name.startsWith("donee-onBoarding") &&
    !name.startsWith("submit") &&
    route.meta?.hideMainHeader !== true
  );
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

const isDoneeSettingsTreeRoute = computed(() => {
  const n = route.name?.toString() || "";
  return n === "donee-settings" || n.startsWith("donee-settings-");
});

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

const DONEE_MAIN_TAB_ROUTES = new Set(["donee-posts", "donee-inspirations", "donee-myprofile"]);
watch(
  () => route.name,
  (name) => {
    const n = name?.toString() || "";
    if (!DONEE_MAIN_TAB_ROUTES.has(n)) return;
    showNavbar.value = true;
    nextTick(() => {
      lastScrollPosition.value =
        window.scrollY || document.documentElement.scrollTop || 0;
    });
  }
);

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
    checkBodyClass();
  });
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });

  watch(isSwitchingRole, (active) => {
    if (active) {
      document.body.classList.add("dh-role-switching");
    } else {
      document.body.classList.remove("dh-role-switching");
    }
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
  window.removeEventListener("scroll", onScroll);
  if (isMobileDevice) {
    window.removeEventListener("resize", handleResize);
  }
  if (observer) {
    observer.disconnect();
  }
});
</script>
