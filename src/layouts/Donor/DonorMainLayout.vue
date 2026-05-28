<template>
  <AppSplash v-if="isSwitchingRole" class="splash-overlay" />

  <q-layout
    view="lHh Lpr lFf"
    class="LayoutBackground"
    @touchstart.passive="onTouchStart"
    @touchend.passive="onTouchEnd"
  >
    <div
      v-if="isDonorTopChromeInLayout"
      class="roleChrome-topStack navbar"
      :class="{
        'navbar--hidden': !showNavbar,
        'dh-use-transform-chrome-hide': isDonorSettingsTreeRoute
      }"
    >
      <HeaderDonorComponent
        :karma="tokenBalance"
        :show-back="shouldShowHeaderBack"
        :is-body-light="isBodyLight"
        @role-switch-start="isSwitchingRole = true"
        @role-switch-end="isSwitchingRole = false"
      />
    </div>

    <!-- Single header for feed tabs — avoids duplicate mount when router-view swaps pages -->
    <div
      v-if="isDonorUnifiedScrollRoute && isDonorHeaderChromeVisible"
      class="roleChrome-topStack navbar donorPosts-integratedChrome"
      :class="{ 'navbar--hidden': !showNavbar }"
    >
      <HeaderDonorComponent
        :karma="tokenBalance"
        :show-back="shouldShowHeaderBack"
        :is-body-light="isBodyLight"
        @role-switch-start="isSwitchingRole = true"
        @role-switch-end="isSwitchingRole = false"
      />
      <DonorPostsTopPanel v-if="route.name === 'donor-posts'" />
    </div>

    <q-page-container
      :class="{
        'donor-no-header': $route.meta?.hideMainHeader === true,
        'role-has-custom-header': isDonorHeaderChromeVisible && !isDonorUnifiedScrollRoute,
        'donor-feed-unified-scroll': isDonorUnifiedScrollRoute,
        'dh-settings-scroll-root': isDonorSettingsTreeRoute,
        'dh-donor-post-detail': isDonorPostDetailRoute
      }"
    >
      <router-view :key="route.name?.toString() ?? route.fullPath" />
    </q-page-container>

    <FooterDonorComponent
      v-if="shouldShowDonorFooterShell"
      class="navbar"
      :class="{
        'footer--hidden': !showFooterChrome || isSwitchingRole || isBadgeDrawerOpen
      }"
    />
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch, provide, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useQuasar } from "quasar";
import { useEdgeSwipeBack } from "src/composables/useEdgeSwipeBack";
import AppSplash from "src/components/common/AppSplash.vue";
import { useAuthStore } from "src/stores/auth";
import { useNotificationsStore } from "src/stores/notifications";
import HeaderDonorComponent from "src/components/donor/HeaderDonorComponent.vue";
import DonorPostsTopPanel from "src/components/donor/DonorPostsTopPanel.vue";
import FooterDonorComponent from "src/components/donor/FooterDonorComponent.vue";
import { donorMainChromeKey } from "src/composables/donorMainChromeInjection";
import { useRouteSettlingBodyClass } from "src/composables/useRouteSettling";

const $q = useQuasar();
const authStore = useAuthStore();
const notificationsStore = useNotificationsStore();
const route = useRoute();
const router = useRouter();

useEdgeSwipeBack();
useRouteSettlingBodyClass();

const tokenBalance = computed(() => authStore.user?.tokens ?? 50);
const isSwitchingRole = ref(false);
const lastScrollPosition = ref(0);
const showNavbar = ref(true);
/** Footer hide-on-scroll is separate from layout header (token shop keeps header fixed, footer still hides). */
const showFooterChrome = ref(true);
const isBadgeDrawerOpen = ref(false);
const isBadgeDrawerFull = ref(false);

const isBodyLight = ref(false);
const checkBodyClass = () => {
  isBodyLight.value = document.body.classList.contains("body--light");
};

const checkBadgeDrawerState = () => {
  isBadgeDrawerOpen.value = document.body.classList.contains("badge-drawer-open");
  isBadgeDrawerFull.value = document.body.classList.contains("badge-drawer-full");
  if (isBadgeDrawerFull.value) {
    showNavbar.value = false;
    showFooterChrome.value = false;
  } else if (isBadgeDrawerOpen.value && !isBadgeDrawerFull.value) {
    showNavbar.value = true;
    showFooterChrome.value = true;
  }
};

const isSettingsSubPage = computed(() => {
  const routeName = route.name?.toString() || "";
  return routeName.startsWith("donor-settings") && routeName !== "donor-settings";
});

const shouldShowHeaderBack = computed(() => {
  return Boolean(isSettingsSubPage.value || route.meta?.showHeaderBack);
});

const hideDonorChromeByRoute = computed(() => {
  const routeName = route.name?.toString() || "";
  return (
    routeName === "donor-post-detail" ||
    routeName === "donor-search" ||
    routeName === "donor-help" ||
    routeName.startsWith("donor-onBoarding")
  );
});

/** Rovnaký model ako donor-posts: chrome vnútri q-page + donor-feed-unified-scroll na kontajneri (žiadny max-height collapse na layout stacku). */
const isDonorUnifiedScrollRoute = computed(() => {
  const n = route.name?.toString() || "";
  return n === "donor-posts" || n === "donor-inspirations" || n === "donor-myprofile";
});

/** Mirrors DoneeMainLayout isHeaderVisible — drives safe-area on q-page-container (layout chrome only) */
const isDonorHeaderChromeVisible = computed(() => {
  if (isSwitchingRole.value || route.meta?.hideMainHeader === true) return false;
  if (hideDonorChromeByRoute.value) return false;
  return true;
});

/** Unified-scroll routes: header je v stránke (.donorPosts-integratedChrome), nie v layoute. */
const isDonorTopChromeInLayout = computed(
  () => isDonorHeaderChromeVisible.value && !isDonorUnifiedScrollRoute.value
);

provide(donorMainChromeKey, {
  showNavbar,
  isBodyLight,
  tokenBalance,
  onRoleSwitchStart: () => {
    isSwitchingRole.value = true;
  },
  onRoleSwitchEnd: () => {
    isSwitchingRole.value = false;
  }
});

const shouldShowDonorFooterShell = computed(() => {
  if (route.meta?.hideFooter === true) return false;
  const routeName = route.name?.toString() || "";
  if (
    routeName === "donor-post-detail" ||
    routeName === "donor-search" ||
    routeName === "donor-filters" ||
    routeName === "donor-help" ||
    routeName.startsWith("donor-onBoarding")
  ) {
    return false;
  }
  return true;
});

const SCROLL_THRESHOLD = 65;
let scrollRafId: number | null = null;
let pageContainerScrollEl: HTMLElement | null = null;
const STABLE_CHROME_ROUTES = new Set(["donor-tokenshop"]);

const pickPageContainer = (): HTMLElement | null => {
  return document.querySelector(".LayoutBackground.q-layout > .q-page-container") as HTMLElement | null;
};

/**
 * Donee počúva window scroll; donor-posts scrolluje .q-page-container.
 * Kombinácia oboch listenerov + výber offsetu zodpovedá skutočnému scrolleru → footer sa schová ako na donee.
 */
const getScrollPosition = (): number => {
  const pc = pageContainerScrollEl ?? pickPageContainer();
  if (pc && pc.scrollHeight > pc.clientHeight + 1) {
    return pc.scrollTop;
  }
  return window.scrollY || document.documentElement.scrollTop || 0;
};

const detachScrollListeners = () => {
  window.removeEventListener("scroll", onScroll);
  if (pageContainerScrollEl) {
    pageContainerScrollEl.removeEventListener("scroll", onScroll);
    pageContainerScrollEl = null;
  }
};

const attachScrollListeners = () => {
  detachScrollListeners();
  window.addEventListener("scroll", onScroll, { passive: true });
  const el = pickPageContainer();
  if (el) {
    pageContainerScrollEl = el;
    pageContainerScrollEl.addEventListener("scroll", onScroll, { passive: true });
  }
  lastScrollPosition.value = getScrollPosition();
};

/**
 * Rovnaký model ako DoneeMainLayout: okamžitá zmena showNavbar podľa smeru (window alebo .q-page-container).
 * Footer skrýva len transform (.footer--hidden), nie výška layoutu.
 */
const isDonorSettingsTreeRoute = computed(() => {
  const n = route.name?.toString() || "";
  return n === "donor-settings" || n.startsWith("donor-settings-");
});

/** Post detail bez layout headera — horný safe-area inset na kontajneri (žiadny obsah pod notch). */
const isDonorPostDetailRoute = computed(() => route.name === "donor-post-detail");

const onScroll = () => {
  if (scrollRafId !== null) return;
  scrollRafId = requestAnimationFrame(() => {
    scrollRafId = null;
    const routeName = route.name?.toString() || "";

    if (isBadgeDrawerFull.value) {
      showNavbar.value = false;
      showFooterChrome.value = false;
      return;
    }
    if (isBadgeDrawerOpen.value && !isBadgeDrawerFull.value) {
      showNavbar.value = true;
      showFooterChrome.value = true;
      return;
    }

    const currentScrollPosition = getScrollPosition();
    if (currentScrollPosition < 0) return;
    if (Math.abs(currentScrollPosition - lastScrollPosition.value) < SCROLL_THRESHOLD) return;

    const scrollingUp = currentScrollPosition < lastScrollPosition.value;
    lastScrollPosition.value = currentScrollPosition;

    // Token shop: keep top chrome from collapsing (layout height jump), but footer still follows scroll.
    if (STABLE_CHROME_ROUTES.has(routeName)) {
      showNavbar.value = true;
      showFooterChrome.value = scrollingUp;
      return;
    }

    showNavbar.value = scrollingUp;
    showFooterChrome.value = scrollingUp;
  });
};

const isMobileDevice =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
  $q.platform.is.mobile === true;

let initialViewportSum = 0;
const handleResize = () => {
  const sum = window.innerWidth + window.innerHeight;
  const footers = document.getElementsByClassName("footer");
  for (let i = 0; i < footers.length; i++) {
    const footer = footers[i] as HTMLElement;
    footer.style.bottom = sum < initialViewportSum ? "auto" : "0";
  }
};

const touchStartX = ref(0);
const touchStartY = ref(0);
const isSwipeTracking = ref(false);
const SWIPE_EDGE_THRESHOLD = 40;
const SWIPE_MIN_DISTANCE = 80;
const SWIPE_MAX_VERTICAL_DRIFT = 50;

const onTouchStart = (event: TouchEvent) => {
  if (event.touches.length !== 1) return;
  const touch = event.touches[0];
  touchStartX.value = touch.clientX;
  touchStartY.value = touch.clientY;
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

let observer: MutationObserver | null = null;

watch(
  () => $q.dark.isActive,
  () => {
    setTimeout(() => checkBodyClass(), 0);
  },
  { immediate: true }
);

watch(
  () => route.fullPath,
  () => {
    nextTick(() => {
      attachScrollListeners();
    });
  }
);

/** Fast nav can leave `showNavbar` false from scroll-hide on a previous screen; main tabs must always show chrome. */
const DONOR_MAIN_TAB_ROUTES = new Set(["donor-posts", "donor-inspirations", "donor-myprofile"]);
watch(
  () => route.name,
  (name) => {
    const n = name?.toString() || "";
    if (!DONOR_MAIN_TAB_ROUTES.has(n)) return;
    showNavbar.value = true;
    showFooterChrome.value = true;
    nextTick(() => {
      lastScrollPosition.value = getScrollPosition();
    });
  }
);

watch(isSwitchingRole, (active) => {
  if (active) {
    document.body.classList.add("dh-role-switching");
  } else {
    document.body.classList.remove("dh-role-switching");
  }
});

watch(
  route,
  (newRoute, oldRoute) => {
    const newRouteName = newRoute.name?.toString() || "";
    const oldRouteName = oldRoute?.name?.toString() || "";
    if (newRouteName.startsWith("donor-") && oldRouteName.startsWith("donee-")) {
      isSwitchingRole.value = true;
      setTimeout(() => {
        isSwitchingRole.value = false;
      }, 800);
    }
  },
  { immediate: true }
);

onMounted(async () => {
  initialViewportSum = window.innerWidth + window.innerHeight;
  checkBadgeDrawerState();
  checkBodyClass();

  await nextTick();
  attachScrollListeners();

  if (isMobileDevice) {
    window.addEventListener("resize", handleResize);
  }

  observer = new MutationObserver(() => {
    checkBadgeDrawerState();
    checkBodyClass();
  });
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });

  if (authStore.isAuthenticated && !authStore.user) {
    try {
      await authStore.fetchUser();
    } catch (e) {
      if (import.meta.env.DEV) console.debug("[DonorMainLayout] fetchUser:", e);
    }
  }
  if (authStore.isAuthenticated) {
    try {
      await notificationsStore.fetchUnreadCount();
    } catch (e) {
      if (import.meta.env.DEV) console.debug("[DonorMainLayout] fetchUnreadCount:", e);
    }
  }
});

onBeforeUnmount(() => {
  detachScrollListeners();
  if (isMobileDevice) {
    window.removeEventListener("resize", handleResize);
  }
  if (scrollRafId !== null) {
    cancelAnimationFrame(scrollRafId);
    scrollRafId = null;
  }
  observer?.disconnect();
});
</script>
