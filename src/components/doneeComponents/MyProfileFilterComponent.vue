<template>
  <div
    class="stats-filter stats-filter--profile"
    :class="{ 'stats-filter--profileStatsActive': tab === 'stats' }"
  >
    <q-tabs
      class="text-white filterTabs"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      inline-label
      v-model="tab"
      active-class="activeStatsTab"
    >
      <q-tab name="Profile" :label="t('profile')" class="profileTab">
        <div class="profileTab-avatarWrapper">
          <UserAvatar
            :image-url="authStore.avatarUrl"
            :name="authStore.name"
            size="22px"
          />
        </div>
      </q-tab>
      <q-tab name="funds" :label="t('funds')" style="" class="statsTab"
        ><svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M21.1698 10.4389C15.9603 12.1368 12.3007 15.5696 10.7284 20.9797C9.00724 15.615 5.25418 12.2847 -3.98702e-06 10.7311C5.20946 9.03439 8.86892 5.60025 10.4415 0.189569C12.1625 5.55477 15.9155 8.88644 21.17 10.4389L21.1698 10.4389Z"
            fill="#FCFCFC"
          />
        </svg>
      </q-tab>

      <q-tab name="stats" :label="t('stats')" style="" class="statsTab"
        ><svg
          xmlns="http://www.w3.org/2000/svg"
          width="15"
          height="15"
          viewBox="0 0 15 15"
          fill="none"
        >
          <path
            d="M2.29249 14.6417C3.26278 14.6417 4.05665 13.8478 4.05665 12.8775V6.7029C4.05665 5.73261 3.26278 4.93874 2.29249 4.93874C1.3222 4.93874 0.52832 5.73261 0.52832 6.7029V12.8775C0.52832 13.8478 1.3222 14.6417 2.29249 14.6417ZM11.1133 10.2312V12.8775C11.1133 13.8478 11.9072 14.6417 12.8775 14.6417C13.8478 14.6417 14.6417 13.8478 14.6417 12.8775V10.2312C14.6417 9.26095 13.8478 8.46707 12.8775 8.46707C11.9072 8.46707 11.1133 9.26095 11.1133 10.2312ZM7.58499 14.6417C8.55528 14.6417 9.34915 13.8478 9.34915 12.8775V2.29249C9.34915 1.3222 8.55528 0.52832 7.58499 0.52832C6.6147 0.52832 5.82082 1.3222 5.82082 2.29249V12.8775C5.82082 13.8478 6.6147 14.6417 7.58499 14.6417Z"
            fill="#FCFCFC"
          />
        </svg>
      </q-tab>

      <q-tab name="earn" :label="t('earn')" style="" class="statsTab"
        ><svg
          width="22"
          height="22"
          viewBox="0 0 22 22"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            d="M17.2857 13.8182C17.8 13.8182 18.2286 13.9455 18.5714 14.2C18.8286 14.4545 19 14.7727 19 15.0909L12.1429 17L6.14286 15.7273V10H7.77143L14.0286 11.7182C14.4571 11.8455 14.7143 12.1 14.7143 12.4182C14.7143 12.6091 14.6286 12.8 14.4571 12.9273C14.2857 13.0545 13.9429 13.1818 13.6857 13.1818H11.2857L9.74286 12.7364L9.48571 13.3091L11.2857 13.8182H17.2857ZM1 10H4.42857V17H1V10Z"
            fill="#FCFCFC"
          />
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M17.7395 5.30937C15.5889 6.01032 14.0782 7.42742 13.4291 9.66083C12.7186 7.44615 11.1692 6.07136 9.0002 5.43C11.1508 4.72957 12.6615 3.31189 13.3107 1.07826C14.0211 3.29311 15.5704 4.66849 17.7396 5.30937L17.7395 5.30937Z"
            fill="#FCFCFC"
          />
        </svg>
      </q-tab>
    </q-tabs>

    <q-tab-panels v-model="tab" class="panel">
      <q-tab-panel class="tabPanel" name="Profile">
        <ProfileContent v-if="tab === 'Profile'" />
      </q-tab-panel>
      <q-tab-panel class="tabPanel" name="funds">
        <TokenShopPage v-if="tab === 'funds'" />
      </q-tab-panel>
      <q-tab-panel class="tabPanel tabPanel--profileStats" name="stats">
        <StatsPage v-if="tab === 'stats'" ref="statsPageRef" />
      </q-tab-panel>
      <q-tab-panel class="tabPanel" name="earn">
        <EarnPage v-if="tab === 'earn'" />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>
<script setup lang="ts">
import {
  ref,
  watch,
  nextTick,
  onMounted,
  onBeforeUnmount,
  defineProps,
  PropType
} from "vue";
import { useI18n } from "vue-i18n";
import { Post } from "src/components/models";

import ProfileContent from "src/components/partials/ProfileContent.vue";
import StatsPage from "src/pages/DonorPages/StatsPage.vue";
import EarnPage from "src/pages/DonorPages/EarnPage.vue";
import TokenShopPage from "src/pages/DonorPages/TokenShopPage.vue";
import { useAuthStore } from "src/stores/auth";
import UserAvatar from "src/components/common/UserAvatar.vue";

const { t } = useI18n();
const authStore = useAuthStore();
const tab = ref("Profile");
const statsPageRef = ref<InstanceType<typeof StatsPage> | null>(null);

const PROFILE_STATS_BODY_CLASS = "dh-profile-stats-active";
const MY_PROFILE_TABS_BODY_CLASS = "dh-myprofile-tabs";

const setProfileStatsScrollMode = (active: boolean) => {
  if (active) {
    document.body.classList.add(PROFILE_STATS_BODY_CLASS);
  } else {
    document.body.classList.remove(PROFILE_STATS_BODY_CLASS);
  }
};

const waitFrame = () =>
  new Promise<void>((resolve) => {
    requestAnimationFrame(() => resolve());
  });

const resetUnifiedScrollTop = async () => {
  await nextTick();
  await waitFrame();
  await waitFrame();

  const scrollRoot = document.querySelector(
    ".q-page-container.donor-feed-unified-scroll"
  ) as HTMLElement | null;

  if (scrollRoot) {
    scrollRoot.scrollTop = 0;
    void scrollRoot.offsetHeight;
    scrollRoot.scrollTop = 0;
  }
};

watch(tab, async (value, oldValue) => {
  const isStats = value === "stats";

  setProfileStatsScrollMode(isStats);

  if (isStats) {
    await resetUnifiedScrollTop();
    await nextTick();
    void statsPageRef.value?.refresh?.();
    return;
  }

  if (oldValue === "stats") {
    await nextTick();
    await waitFrame();
  }
});

onMounted(() => {
  document.body.classList.add(MY_PROFILE_TABS_BODY_CLASS);
});

onBeforeUnmount(() => {
  document.body.classList.remove(PROFILE_STATS_BODY_CLASS);
  document.body.classList.remove(MY_PROFILE_TABS_BODY_CLASS);
});

defineProps({
  post: {
    type: Object as PropType<Post>,
    required: true
  }
});
</script>
<style scoped lang="scss">
.statsTab {
  svg {
    fill: white;
  }
}
.stats-filter--profile.stats-filter--profileStatsActive {
  overflow-anchor: none !important;
  scroll-snap-type: none !important;
}

.stats-filter--profile .filterTabs {
  width: 100%;
  max-width: 100%;
  margin: 0.1rem auto 0;
  padding: 0 0.85rem;
  box-sizing: border-box;
  overflow: hidden;
}

.stats-filter--profile :deep(.q-tabs) {
  width: 100%;
  max-width: 100%;
  overflow: hidden !important;
}

.stats-filter--profile :deep(.q-tabs__content),
.stats-filter--profile :deep(.q-tabs__content--align-center),
.stats-filter--profile :deep(.q-tabs__content--align-justify) {
  display: flex !important;
  justify-content: space-evenly !important;
  align-items: center;
  width: 100%;
  min-width: 0;
  gap: 0;
  transform: none !important;
  overflow-x: hidden !important;
}

.stats-filter--profile :deep(.q-tab) {
  flex: 0 0 auto;
  width: auto;
  min-width: 0 !important;
  max-width: none;
  padding: 0.65rem 0.75rem !important;
  justify-content: center;
}

.stats-filter--profile :deep(.q-tab__content) {
  display: flex;
  flex-direction: row-reverse !important;
  align-items: center;
  justify-content: center;
  min-width: 0;

  svg {
    margin-right: 0.4rem;
    flex-shrink: 0;
  }
}

.stats-filter--profile :deep(.q-tab__label) {
  font-size: 0.75rem;
  text-transform: lowercase !important;
  font-family: poppinsMedium;
  white-space: nowrap;
}

.stats-filter--profile :deep(.q-tabs__arrow),
.stats-filter--profile :deep(.q-tabs__arrow--left),
.stats-filter--profile :deep(.q-tabs__arrow--right) {
  display: none !important;
}

:global(.q-tab-panel) {
  padding: 0 !important;
  overflow-anchor: none !important;
}

.stats-filter--profile.stats-filter--profileStatsActive :deep(.panel),
.stats-filter--profile.stats-filter--profileStatsActive :deep(.tabPanel),
.stats-filter--profile.stats-filter--profileStatsActive .tabPanel--profileStats {
  overflow-anchor: none !important;
  scroll-snap-type: none !important;
}

/* Profile variant: panel height follows active tab only (no ProfileContent ghost height) */
.stats-filter--profile :deep(.panel),
.stats-filter--profile :deep(.q-tab-panels) {
  min-height: 0;
  height: auto;
}

.stats-filter--profile .tabPanel--profileStats {
  min-height: auto;
  height: auto;
  overflow: visible;
  overscroll-behavior: contain;
  scroll-snap-type: none !important;
  padding-bottom: max(0.75rem, env(safe-area-inset-bottom, 0px));
}

.stats-filter--profile .tabPanel--profileStats .statsPage {
  min-height: auto;
  height: auto;
  padding-bottom: 0;
  overscroll-behavior: contain;
  scroll-snap-type: none !important;
}

.stats-filter--profile .tabPanel--profileStats .statsPage-loading {
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 50vh;
  padding: 2rem 0;
}

.stats-filter--profile .tabPanel--profileStats .detailed-stats {
  padding-bottom: 0;
  margin-bottom: 0;
}

/*
 * My Profile tabs: pri hide-on-scroll headera nesmie q-page-container dostať padding-top
 * (iosSafeArea rule), inak skáče obsah pri scrollovaní Profile tabu.
 */
:global(body.dh-myprofile-tabs
    .LayoutBackground.q-layout
    > .roleChrome-topStack.donorPosts-integratedChrome.navbar--hidden:not(.dh-use-transform-chrome-hide)
    ~ .q-page-container.donor-feed-unified-scroll) {
  padding-top: 0 !important;
}

/*
 * Profile → stats: scroll root is .q-page-container.donor-feed-unified-scroll (donor-myprofile).
 * :global() required — body / page-container live outside this SFC scoped tree.
 */
:global(body.dh-profile-stats-active .q-page-container.donor-feed-unified-scroll) {
  overflow-y: auto !important;
  overscroll-behavior-y: none !important;
  min-height: auto !important;
  max-height: 100dvh;
}

:global(body.dh-profile-stats-active .q-page-container.donor-feed-unified-scroll .q-page) {
  min-height: auto !important;
  height: auto !important;
}

:global(body.dh-profile-stats-active .stats-filter--profileStatsActive),
:global(body.dh-profile-stats-active .stats-filter--profileStatsActive .panel),
:global(body.dh-profile-stats-active .stats-filter--profileStatsActive .q-tab-panels),
:global(body.dh-profile-stats-active .stats-filter--profileStatsActive .q-panel),
:global(body.dh-profile-stats-active .stats-filter--profileStatsActive .q-tab-panel),
:global(body.dh-profile-stats-active .stats-filter--profileStatsActive .q-tab-panels__content) {
  min-height: auto !important;
  height: auto !important;
  overflow: visible !important;
}

:global(body.dh-profile-stats-active .stats-filter--profileStatsActive .tabPanel--profileStats) {
  padding-bottom: max(0.5rem, env(safe-area-inset-bottom, 0px)) !important;
}

:global(body.dh-profile-stats-active .stats-filter--profileStatsActive .statsPage) {
  padding-bottom: 0 !important;
  margin-bottom: 0 !important;
}

.profileTab {
  .profileTab-avatarWrapper {
    margin-right: 0.5rem !important;
    flex-shrink: 0;
  }
  .profilePicture {
    border-radius: 50% !important;
    height: 1.5rem;
    margin-right: 0.5rem;
  }
}
.activeStatsTab.profileTab {
  .profilePicture {
    border: 0.1rem solid $primary;
  }
  :deep(.q-tab__label) {
    color: $primary;
  }
}
.activeStatsTab.statsTab {
  * {
    fill: $primary;
  }
  * {
    color: $primary !important;
  }
  :deep(.q-ripple) {
    display: none;
  }
}
</style>
