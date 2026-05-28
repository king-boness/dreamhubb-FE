<template>
  <div class="header row" :class="{ 'iphoneDevice-large': $q.platform.is.ios }">
    <!-- Splash screen for role switch -->
    <AppSplash v-if="isSwitchingRole" class="splash-overlay" />

    <div class="row" style="">
      <template v-if="!shouldShowBack">
        <div
          class="iconContainer"
          @click="handleLogoClick"
        >
          <DreamhubbHeaderMark :is-body-light="props.isBodyLight" class="logoIcon" />
          <img src="/header_icons/donee.svg" alt="" class="header-roleIcon" />
          <img src="/header_icons/swap.svg" alt="" class="navbarIcon" />
        </div>
      </template>
      <template v-else>
        <q-btn class="settingsHeader-button" @click="handleHeaderBack"
          ><img src="/icons/arrowIcon.svg" alt=""
        /></q-btn>
      </template>
    </div>
    <div class="row">
      <div class="row items-center">
        <svg
          width="49"
          height="49"
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          @click="$router.push({ name: 'donee-search' })"
          class="searchIcon"
        >
          <g opacity="0.8">
            <path
              d="M31 31L26.65 26.65M29 21C29 25.4183 25.4183 29 21 29C16.5817 29 13 25.4183 13 21C13 16.5817 16.5817 13 21 13C25.4183 13 29 16.5817 29 21Z"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
        </svg>
      </div>
      <div class="displayKarma">
        <div class="textWrapper">
          <img src="/icons/KarmaIcon.png" alt="" class="navbarKarmaIcon" />
          <span class="karmaValue">{{ formatNumber(props.karma) }}</span>
          <q-btn
            class="navbarButton"
            @click="$router.push({ name: 'donee-token' })"
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
        <!-- TODO: zmensenie velkosti pisma ked je vacsia dlzka -->
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
/* Background from global app (iosSafeArea.scss) */
.header {
  background-image: none !important;
  background-color: transparent !important;
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.3rem var(--dh-header-pad-x, 1rem) 1rem;
  border-bottom: 0.05rem solid rgba(255, 255, 255, 0.202);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.1);
  z-index: 2000; // Higher z-index to ensure header is above content
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
.iconContainer {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
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
  color: rgba(255, 255, 255, 0.82);
  cursor: pointer;
}

.buttonIcon {
  width: 1rem;
  height: 1rem;
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
      color: rgba(255, 255, 255, 0.64);
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
  }
}
</style>

<script setup lang="ts">
import { defineProps, ref, computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import { usePreferencesStore } from "src/stores/preferences";
import { usePostsStore } from "src/stores/posts";
import { formatNumber } from "src/components/partials/FunctionsComponent.vue";
import AppSplash from "src/components/common/AppSplash.vue";
import DreamhubbHeaderMark from "src/components/common/DreamhubbHeaderMark.vue";
import { goBackOrFallback, resolveBackFallback } from "src/utils/navigation";
import { refreshTokenIfNeeded } from "boot/axios";

interface Props {
  karma: number;
  showBack: boolean;
  /** Optional: logo reads theme from DOM; kept for API compatibility. */
  isBodyLight?: boolean;
}

const props: Props = defineProps({
  karma: {
    type: Number,
    required: true
  },
  showBack: {
    type: Boolean,
    required: false
  },
  isBodyLight: {
    type: Boolean,
    required: false,
    default: false
  }
});

const router = useRouter();
const route = useRoute();
const isSwitchingRole = ref(false);
const preferencesStore = usePreferencesStore();
const postsStore = usePostsStore();

const shouldShowBack = computed(() => {
  return Boolean(props.showBack || route.meta?.showHeaderBack);
});

const handleHeaderBack = () => {
  const defaultFallback = { name: "donee-posts" };
  const fallback = resolveBackFallback(route.meta?.headerBackFallback, route, defaultFallback);
  goBackOrFallback(router, fallback);
};

const handleLogoClick = async () => {
  // Refresh token before switch so donor fetches use new token (jwt-auth invalidates old on refresh)
  await refreshTokenIfNeeded();
  preferencesStore.setCurrentSide("donor");
  applyFiltersFromPreferences();
  document.body.classList.add("splash-active", "dh-role-switching");
  isSwitchingRole.value = true;
  await new Promise(resolve => setTimeout(resolve, 500));
  await router.push({ name: "donor-posts" });
  setTimeout(() => {
    isSwitchingRole.value = false;
    document.body.classList.remove("splash-active", "dh-role-switching");
  }, 300);
};

const applyFiltersFromPreferences = () => {
  // Seed donor filters once from donee onboarding (idempotent + won't overwrite user-changed donor filters)
  preferencesStore.seedDonorFiltersFromDoneeOnboardingIfNeeded();
  // Always prefer user’s saved donor filters when switching to donor
  preferencesStore.loadDonorFiltersFromStorage();
  const storedDonor = preferencesStore.lastUsedFeedFilters;
  if (storedDonor) {
    postsStore.setFilters({
      type: storedDonor.postType,
      feCategory: storedDonor.subcategory,
      continentId: storedDonor.location.continentId,
      countryId: storedDonor.location.countryId,
      cityId: storedDonor.location.cityId
    });
    return;
  }

  // Priority 1: Use stored preferences from registration (they are saved in preferences store during onboarding)
  // These include postType, subcategory, and location preferences
  const storedPostType = preferencesStore.preferredPostType;
  const storedSubcategory = preferencesStore.preferredSubcategory;
  const location = preferencesStore.preferredFeedLocation;

  // If we have stored preferences from registration, use them
  if (storedPostType && storedSubcategory) {
    // Determine location filters: if city is selected, use city; otherwise use country; otherwise use continent
    let locationFilters: {
      continentId: number | null;
      countryId: number | null;
      cityId: number | null;
    };

    if (location.cityId) {
      // City is selected - filter by city
      locationFilters = {
        continentId: null,
        countryId: null,
        cityId: location.cityId
      };
    } else if (location.countryId) {
      // Country is selected but no city - filter by country
      locationFilters = {
        continentId: null,
        countryId: location.countryId,
        cityId: null
      };
    } else if (location.continentId) {
      // Only continent is selected - filter by continent
      locationFilters = {
        continentId: location.continentId,
        countryId: null,
        cityId: null
      };
    } else {
      // No location filters
      locationFilters = {
        continentId: null,
        countryId: null,
        cityId: null
      };
    }

    // Apply filters
    postsStore.setFilters({
      type: storedPostType,
      feCategory: storedSubcategory,
      ...locationFilters
    });

    return;
  }

  // Priority 2: Check if we have preferences from registration in localStorage (fallback)
  // These are set during registration and should be used when switching from donee to donor
  const registrationGoal = localStorage.getItem("postCreation_goal");
  const registrationCategory = localStorage.getItem("postCreation_category");

  // If we have registration preferences in localStorage, use them
  if (registrationGoal && registrationCategory) {
    // Map goal to postType (dream, problem, idea)
    const postType = registrationGoal as "dream" | "problem" | "idea";
    // Category is already the subcategory name (traveling, health, etc.)
    const subcategory = registrationCategory;

    // Save to preferences store for future use
    preferencesStore.setPreferredPostType(postType);
    preferencesStore.setPreferredSubcategory(subcategory);

    // Apply filters using registration preferences with location
    // Apply location filters: if city is selected, use city; otherwise use country; otherwise use continent
    if (location.cityId) {
      // City is selected - filter by city
      postsStore.setFilters({
        type: postType,
        feCategory: subcategory,
        continentId: null,
        countryId: null,
        cityId: location.cityId
      });
    } else if (location.countryId) {
      // Country is selected but no city - filter by country
      postsStore.setFilters({
        type: postType,
        feCategory: subcategory,
        continentId: null,
        countryId: location.countryId,
        cityId: null
      });
    } else if (location.continentId) {
      // Only continent is selected - filter by continent
      postsStore.setFilters({
        type: postType,
        feCategory: subcategory,
        continentId: location.continentId,
        countryId: null,
        cityId: null
      });
    } else {
      // No location filters
      postsStore.setFilters({
        type: postType,
        feCategory: subcategory,
        continentId: null,
        countryId: null,
        cityId: null
      });
    }
    return;
  }

  // Priority 2: Use last used feed filters if available
  const lastUsed = preferencesStore.lastUsedFeedFilters;
  if (lastUsed) {
    postsStore.setFilters({
      type: lastUsed.postType,
      feCategory: lastUsed.subcategory,
      continentId: lastUsed.location.continentId,
      countryId: lastUsed.location.countryId,
      cityId: lastUsed.location.cityId
    });
    return;
  }

  // Priority 3: Use stored preferences (or defaults)
  // Apply location filters: if city is selected, use city; otherwise use country; otherwise use continent
  if (location.cityId) {
    postsStore.setFilters({
      type: preferencesStore.preferredPostType,
      feCategory: preferencesStore.preferredSubcategory,
      continentId: null,
      countryId: null,
      cityId: location.cityId
    });
  } else if (location.countryId) {
    postsStore.setFilters({
      type: preferencesStore.preferredPostType,
      feCategory: preferencesStore.preferredSubcategory,
      continentId: null,
      countryId: location.countryId,
      cityId: null
    });
  } else if (location.continentId) {
    postsStore.setFilters({
      type: preferencesStore.preferredPostType,
      feCategory: preferencesStore.preferredSubcategory,
      continentId: location.continentId,
      countryId: null,
      cityId: null
    });
  } else {
    postsStore.setFilters({
      type: preferencesStore.preferredPostType,
      feCategory: preferencesStore.preferredSubcategory,
      continentId: null,
      countryId: null,
      cityId: null
    });
  }
};
</script>
