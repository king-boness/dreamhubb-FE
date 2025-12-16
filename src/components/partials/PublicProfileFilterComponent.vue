<template>
  <div class="stats-filter">
    <q-tabs
      class="text-white filterTabs"
      active-color="primary"
      indicator-color="primary"
      align="justify"
      inline-label
      v-model="tab"
      active-class="activeStatsTab"
    >
      <q-tab name="Profile" :label="profileLabel" class="profileTab">
        <div class="profileTab-avatarWrapper">
          <UserAvatar
            :image-url="props.userData?.profile_picture || null"
            :name="displayName"
            size="22px"
          />
        </div>
      </q-tab>

      <q-tab name="stats" :label="statsLabel" style="" class="statsTab"
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
    </q-tabs>

    <q-tab-panels v-model="tab" animated class="panel" swipeable>
      <q-tab-panel class="tabPanel" name="Profile">
        <PublicProfileContent :user-data="props.userData" />
      </q-tab-panel>
      <q-tab-panel class="tabPanel" name="stats">
        <StatsPage />
      </q-tab-panel>
    </q-tab-panels>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useI18n } from "vue-i18n";
import UserAvatar from "src/components/common/UserAvatar.vue";
import PublicProfileContent from "src/components/partials/PublicProfileContent.vue";
import StatsPage from "src/pages/DonorPages/StatsPage.vue";

interface PublicUser {
  id: number;
  username?: string;
  name?: string;
  email?: string;
  bio?: string | null;
  profile_picture?: string | null;
  tokens?: number;
  posts_count?: number;
  followers_count?: number;
  following_count?: number;
  selected_badge?: string | null;
  role?: string;
  location_city?: string | null;
  location_country?: string | null;
  location_continent?: string | null;
}

interface Props {
  userData: PublicUser | null;
}

const props = defineProps<Props>();

const { t } = useI18n();
const tab = ref("Profile");

const displayName = computed(() => {
  return props.userData?.name || props.userData?.username || "User";
});

const profileLabel = computed(() => {
  return (t("profile") || "").toLowerCase();
});

const statsLabel = computed(() => {
  return (t("stats") || "").toLowerCase();
});
</script>

<style scoped lang="scss"></style>
<style lang="scss">
.statsTab {
  svg {
    fill: white;
  }
}
.stats-filter {
  .scroll {
    -webkit-overflow-scrolling: auto !important;
    will-change: auto;
  }
}
.q-tab__content {
  display: flex;
  flex-direction: row-reverse !important; /* Reverses the order of label and icon */
  align-items: center; /* Vertically aligns label and icon */
  svg {
    margin-right: 0.5rem;
  }
}
.filterTabs {
  margin: 0 auto;
  margin-top: 0.1rem;
  padding: 0 0.6rem;
  .q-tab__label {
    font-size: 0.8rem;
    text-transform: lowercase !important;
    font-family: poppinsMedium;
  }
  .q-tab {
    padding: 0.5rem 0.7rem !important;
  }
}
.q-tab-panel {
  padding: 0 !important;
}

.profileTab {
  .profileTab-avatarWrapper {
    margin-right: 0.5rem !important;
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
  .q-tab__label {
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
  .q-ripple {
    display: none;
  }
}
</style>
