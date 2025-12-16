<template>
  <q-page class="donorPostsPage">
    <!-- Tabs: by help / by pay / by top -->
    <div class="donor-tabs">
      <div class="donor-tabs_indicator" :style="indicatorStyle"></div>
      <button
        v-for="(tab, index) in tabs"
        :key="tab.value"
        :ref="el => { if (el) tabRefs[index] = el as HTMLElement }"
        class="donor-tabs_button"
        :class="{ 'donor-tabs_button--active': activeTab === tab.value }"
        type="button"
        @click="setTab(tab.value)"
      >
        <img
          :src="getTabIcon(tab.value)"
          :alt="tab.label"
          class="donor-tabs_icon"
        />
        <span class="donor-tabs_label">{{ tab.label }}</span>
      </button>
    </div>

    <!-- Filters button -->
    <div class="donorPosts-filtersWrapper">
      <button
        class="donor-filters_button"
        type="button"
        @click="handleOpenFilters"
      >
        <img
          :src="filtersIcon"
          alt=""
          class="donor-filters_icon"
        />
        <span>{{ t("filters") }}</span>
      </button>
    </div>

    <!-- Feed of posts -->
    <div class="donorPosts-feed">
      <!-- Loading state -->
      <div v-if="loading" class="donorPosts-state">
        <p>{{ t("loadingPosts") }}</p>
      </div>

      <!-- Error state -->
      <div v-else-if="error" class="donorPosts-state donorPosts-state--error">
        <p>{{ error }}</p>
      </div>

      <!-- Empty state -->
      <div v-else-if="!loading && !error && sortedPosts.length === 0" class="donorPosts-state">
        <p v-if="hasActiveFilters">{{ t("noPostsMatchFilters") }}</p>
        <p v-else>{{ t("noPosts") }}</p>
        <q-btn
          v-if="hasActiveFilters"
          class="donorPosts-resetFiltersBtn"
          @click="handleResetFilters"
        >
          {{ t("resetFilters") }}
        </q-btn>
      </div>

      <!-- Posts list -->
      <template v-else>
        <div
          v-for="post in sortedPosts"
          :key="post.id"
          class="postCard"
          role="button"
          tabindex="0"
          @click="emitOpenPost(post)"
          @keyup.enter.space="emitOpenPost(post)"
        >
          <!-- Hero image with overlay -->
          <div class="postCard-imageWrapper">
            <PostImagesCarousel
              :images="post.images"
              :auto-slide="true"
              :show-progress="true"
              :show-arrows="false"
              :show-dots="false"
              :alt="post.dreamTitle"
            />

          <!-- Author badge (top left) -->
          <div class="postCard-authorBadge" @click.stop="emitOpenAuthor(post)">
        <UserAvatar
          :image-url="post.authorAvatarUrl"
          :name="post.authorName"
          size="32px"
          @click.stop="goToUserProfile(post.authorId)"
        />
            <div class="postCard-authorText">
              <div class="postCard-authorName">{{ post.authorName }}</div>
              <div class="postCard-authorBadgeLabel">{{ post.authorBadgeLabel }}</div>
            </div>
          </div>

          <!-- Category + Reward pills (bottom) -->
          <div class="postCard-titleRow">
            <div class="postCard-categoryPill">
              <img
                :src="getPostTypeIcon(post.type)"
                class="postCard-categoryIcon"
                alt=""
              />
              <span>{{ post.categoryLabel }}</span>
            </div>
            <div class="postCard-rewardPill">
              <q-icon
                name="img:/assets/icons/ui/icon-reward.svg"
                class="postCard-rewardIcon"
                size="14px"
              />
              <span>{{ post.tokenReward }}</span>
            </div>
          </div>
          </div>

          <!-- Text content -->
          <div class="postCard-body">
          <h3 class="postCard-title">{{ post.dreamTitle }}</h3>
          <div class="postCard-meta">
            <span class="postCard-location">
              <i class="fa-solid fa-location-dot"></i>
              {{ post.location }}
            </span>
            <span class="postCard-date">{{ formatDate(post.createdAt) }}</span>
          </div>
          <p class="postCard-preview">{{ post.previewText }}</p>
          </div>
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onActivated } from "vue";
import { useI18n } from "vue-i18n";
import { translateCityName, translateCountryName } from "src/utils/cityNames";
import { useRouter, useRoute } from "vue-router";
import { usePostsStore } from "src/stores/posts";
import { usePreferencesStore } from "src/stores/preferences";
import { getCategoryDisplayName } from "src/data/categoryNames";
import PostImagesCarousel from "src/components/post/PostImagesCarousel.vue";
import { getPostTypeIcon } from "src/utils/postIcons";
import { getUserAvatarUrl } from "src/utils/avatar";
import UserAvatar from "src/components/common/UserAvatar.vue";

const { t, locale } = useI18n();

const router = useRouter();
const route = useRoute();
const postsStore = usePostsStore();
const preferencesStore = usePreferencesStore();

// Tab interface
interface DonorTab {
  value: "help" | "pay" | "top";
  label: string;
  icon: string;
}

// Tab icons - using header_icons with _ns.svg (non-selected) and _s.svg (selected) variants
const getTabIcon = (tabValue: "help" | "pay" | "top") => {
  const isActive = activeTab.value === tabValue;
  const iconMap: Record<string, { selected: string; nonSelected: string }> = {
    help: {
      selected: "/header_icons/hearth_s.svg",
      nonSelected: "/header_icons/hearth_ns.svg"
    },
    pay: {
      selected: "/header_icons/star_s.svg",
      nonSelected: "/header_icons/star_ns.svg"
    },
    top: {
      selected: "/header_icons/top_s.svg",
      nonSelected: "/header_icons/top_ns.svg"
    }
  };
  const icons = iconMap[tabValue];
  return icons ? (isActive ? icons.selected : icons.nonSelected) : "/header_icons/hearth_ns.svg";
};

// Filters icon - use _s.svg when on filters page, _ns.svg otherwise
const filtersIcon = computed(() => {
  const isOnFiltersPage = route.name === "donor-filters";
  return isOnFiltersPage ? "/header_icons/filters_s.svg" : "/header_icons/filters_ns.svg";
});

// Tabs definition
const tabs = computed<DonorTab[]>(() => [
  { value: "help", label: t("byHelp"), icon: getTabIcon("help") },
  { value: "pay", label: t("byPay"), icon: getTabIcon("pay") },
  { value: "top", label: t("byTop"), icon: getTabIcon("top") }
]);

// Active tab
const activeTab = ref<"help" | "pay" | "top">("help");

// Tab refs for indicator positioning
const tabRefs = ref<(HTMLElement | null)[]>([]);

// Indicator style computed
const indicatorStyle = computed(() => {
  const activeIndex = tabs.value.findIndex(tab => tab.value === activeTab.value);
  if (activeIndex === -1 || !tabRefs.value[activeIndex]) {
    return { width: "0", left: "0", opacity: "0" };
  }
  const activeButton = tabRefs.value[activeIndex];
  if (!activeButton) {
    return { width: "0", left: "0", opacity: "0" };
  }
  const tabsContainer = activeButton.parentElement;
  if (!tabsContainer) {
    return { width: "0", left: "0", opacity: "0" };
  }
  const containerRect = tabsContainer.getBoundingClientRect();
  const buttonRect = activeButton.getBoundingClientRect();
  const left = buttonRect.left - containerRect.left;
  const width = buttonRect.width;
  return {
    left: `${left}px`,
    width: `${width}px`,
    opacity: "1"
  };
});

// Set tab handler
const setTab = (value: "help" | "pay" | "top") => {
  activeTab.value = value;
  // Fetch posts with sort parameter
  postsStore.fetchPosts({ sort: value });
};

// Update indicator position on mount and fetch initial posts
onMounted(() => {
  nextTick(() => {
    // Indicator position will be computed automatically via computed property
  });
  applyInitialFiltersFromPreferences();
  // Fetch initial posts with default "help" sort (filters sa automaticky použijú z store)
  postsStore.fetchPosts({ sort: activeTab.value });
});

// Reload posts when returning from filters page (kept-alive component)
onActivated(() => {
  // Načítať posty s aktuálnymi filtrami pri návrate na stránku
  postsStore.fetchPosts({ sort: activeTab.value });
});

// Computed properties from store
const posts = computed(() => postsStore.posts);
const loading = computed(() => postsStore.loading);
const error = computed(() => postsStore.error);

// Check if any filters are active
const hasActiveFilters = computed(() => {
  return !!(
    postsStore.filters.type ||
    postsStore.filters.categoryId
    // TODO: Keď BE podporí location filtre, pridať:
    // postsStore.filters.continentId ||
    // postsStore.filters.countryId ||
    // postsStore.filters.cityId
  );
});

// Post interface
interface DonorPost {
  id: number;
  backendPostId: number; // ID that exists in BE (e.g., 3)
  tab: "help" | "pay" | "top";
  type: "dream" | "problem" | "idea"; // Post type for icon
  authorId: number | null;
  authorName: string;
  authorAvatarUrl: string;
  authorBadgeLabel: string;
  dreamTitle: string;
  categoryLabel: string;
  tokenReward: number;
  previewText: string;
  location: string;
  createdAt: string;
  imageUrl: string;
}

// Post type icon function is now imported from utils/postIcons.ts

// Helper function to get initials from name
const getInitials = (name: string): string => {
  if (!name || name.trim().length === 0) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};

// Map BE data to FE format
const mapPostData = (post: Record<string, unknown>): DonorPost => {
  const authorName = (post.author_name || post.user?.name || post.authorName || "Unknown") as string;
  // Use unified avatar utility function - check multiple possible fields from BE
  const authorPicture = getUserAvatarUrl(
    post.user as { profile_picture?: string | null; [key: string]: unknown } | null,
    {
      author_picture: (post.author_picture || post.user?.profile_picture || null) as string | null,
      authorAvatarUrl: (post.authorAvatarUrl || null) as string | null,
      user: post.user as { profile_picture?: string | null; [key: string]: unknown } | null
    }
  ) || "";

  // Get authorId for navigation - BE now sends user_id directly
  const authorId = (post.user_id || post.author_id || post.user?.id || null) as number | null;

  // Debug logging in development
  if (process.env.NODE_ENV === "development") {
    if (!authorPicture) {
      console.log("🔍 No avatar found for post:", {
        post_id: post.id || post.post_id,
        author_name: authorName,
        has_user: !!post.user,
        user_profile_picture: (post.user as { profile_picture?: string | null } | null)?.profile_picture,
        author_picture: post.author_picture
      });
    }
    if (!authorId) {
      console.warn("⚠️ No authorId found in feed post:", {
        post_id: post.id || post.post_id,
        author_name: authorName,
        has_author_id: !!post.author_id,
        has_user_id: !!post.user_id,
        has_user: !!post.user,
        user_id: post.user?.id,
        full_post: post
      });
    }
  }

  const images = post.images as string[] | undefined;
  const firstImage = images && Array.isArray(images) && images.length > 0 ? images[0] : null;

  return {
    id: post.id || post.post_id || 0,
    backendPostId: post.id || post.post_id || 0,
    tab: activeTab.value, // Use current active tab
    type: (post.type || "dream") as "dream" | "problem" | "idea", // Post type for icon
    authorId,
    authorName,
    // Use real avatar URL if available, otherwise empty string (template will show initials)
    authorAvatarUrl: authorPicture || "",
    authorBadgeLabel: post.author_badge_label || post.authorBadgeLabel || "User",
    dreamTitle: post.title || post.dreamTitle || "Untitled",
    categoryLabel: post.fe_category ? getCategoryDisplayName(post.fe_category) : (post.category_name || post.categoryLabel || "General"),
    tokenReward: post.tokens || post.tokenReward || 0,
    previewText: post.description || post.previewText || "",
    location: (() => {
      // Build location string from author's location (city, country, continent)
      const parts = [];
      if (post.author_city) {
        const translatedCity = translateCityName(post.author_city, locale.value as string);
        parts.push(translatedCity);
      }
      if (post.author_country) {
        const translatedCountry = translateCountryName(post.author_country, locale.value as string);
        parts.push(translatedCountry);
      }
      if (post.author_continent && !parts.length) parts.push(post.author_continent);
      const locationStr = parts.length > 0 ? parts.join(", ") : (post.location || "Unknown");
      if (process.env.NODE_ENV === "development" && parts.length === 0) {
        console.log("⚠️ PostsPage: No location data for post:", {
          post_id: post.post_id || post.id,
          author_city: post.author_city,
          author_country: post.author_country,
          author_continent: post.author_continent,
          full_post: post
        });
      }
      return locationStr;
    })(),
    createdAt: post.date_created || post.created_at || post.createdAt || new Date().toISOString(),
    // Use real cover image from BE, fallback to default if not available
    imageUrl: firstImage || post.image_url || post.imageUrl || "/images/Auth/postBackground.png",
    // Pass images array for carousel
    images: images && Array.isArray(images) ? images : (firstImage ? [firstImage] : null)
  };
};

// Sorted posts - mapped from BE data, sorted by tokenReward (descending)
const sortedPosts = computed(() => {
  if (!posts.value || posts.value.length === 0) {
    return [];
  }
  const mappedPosts = posts.value.map(mapPostData);
  return mappedPosts.sort((a, b) => {
    const aTokens = a.tokenReward ?? 0;
    const bTokens = b.tokenReward ?? 0;
    return bTokens - aTokens;
  });
});

// Mock posts data removed - now using data from BE via posts store

const handleOpenFilters = () => {
  console.log("🔍 Filters button clicked! Navigating to filters page...");
  router.push({ name: "donor-filters" });
};

// Reset filters handler
const handleResetFilters = async () => {
  postsStore.resetFilters();
  preferencesStore.clearLastUsedFeedFilters();
  await postsStore.fetchPosts({ sort: activeTab.value });
};

const applyInitialFiltersFromPreferences = () => {
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
  postsStore.setFilters({
    type: preferencesStore.preferredPostType,
    feCategory: preferencesStore.preferredSubcategory,
    continentId: preferencesStore.preferredFeedLocation.continentId,
    countryId: preferencesStore.preferredFeedLocation.countryId,
    cityId: preferencesStore.preferredFeedLocation.cityId
  });
};

// Format date from MM/DD/YYYY to DD/MM/YYYY
const formatDate = (dateString: string): string => {
  const dateParts = dateString.split("/");
  if (dateParts.length === 3) {
    const [month, day, year] = dateParts;
    return `${day}/${month}/${year}`;
  }
  return dateString;
};

const emitOpenPost = (post: DonorPost) => {
  // Use backendPostId to navigate to existing BE post
  const targetId = post.backendPostId ?? post.id;
  // Navigate to detail page - data will be loaded from API
  router.push({
    name: "donor-post-detail",
    params: { id: targetId }
  });
};

const goToUserProfile = (userId: number | null) => {
  if (!userId) {
    if (process.env.NODE_ENV === "development") {
      console.warn("No authorId to navigate");
    }
    return;
  }
  router.push({ name: "donor-user-profile", params: { userId } });
};

const emitOpenAuthor = (post: DonorPost) => {
  goToUserProfile(post.authorId);
};
</script>

<style lang="scss" scoped>
.donorPostsPage {
  padding: 0 16px 80px;
  min-height: 100vh;
}

// TABS
.donor-tabs {
  display: flex;
  gap: 12px;
  margin: 8px 0 10px;
  border-bottom: 1px solid rgba(255, 255, 255, 0.08);
  position: relative;
}

.donor-tabs_indicator {
  position: absolute;
  bottom: -1px;
  height: 2px;
  background: #ff2c8b;
  transition: left 0.3s ease, width 0.3s ease, opacity 0.3s ease;
  opacity: 0;
}

.donor-tabs_button {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  padding: 10px 12px;
  background: transparent;
  border: none;
  color: rgba(255, 255, 255, 0.5);
  font-size: 0.8rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  position: relative;

  &.donor-tabs_button--active {
    color: #ff2c8b;

    .donor-tabs_icon {
      transform: scale(1.1);
    }
  }

  &:hover:not(.donor-tabs_button--active) {
    color: rgba(255, 255, 255, 0.8);

    .donor-tabs_icon {
      transform: scale(1.1);
    }
  }

  &:active {
    .donor-tabs_icon {
      transform: scale(0.95);
    }
  }
}

.donor-tabs_icon {
  width: 16px;
  height: 16px;
  display: block;
  transition: transform 0.2s ease;
}

.donor-tabs_label {
  font-size: 0.8rem;
  font-weight: 600;
  text-transform: lowercase;
}

// FILTERS
.donorPosts-filtersWrapper {
    display: flex;
    justify-content: center;
  margin: 18px 0;
}

.donor-filters_button {
  display: flex;
    align-items: center;
  justify-content: center;
  gap: 6px;
  background: rgba(255, 255, 255, 0.08);
  border: none;
  border-radius: 999px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.9rem;
  font-weight: 600;
  padding: 10px 32px;
  width: 85%;
  max-width: 300px;
  cursor: pointer;
  transition: background 0.2s ease;
  text-transform: lowercase;

  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
}

.donor-filters_icon {
  width: 14px;
  height: 14px;
  display: block;
  flex-shrink: 0;
  filter: brightness(0) invert(1); // White color
  opacity: 0.8;
  }

// FEED
.donorPosts-feed {
  display: flex;
  flex-direction: column;
  gap: 18px; // Slightly tighter gap between cards
  padding-bottom: 20px;
}

.donorPosts-state {
  text-align: center;
  padding: 2rem;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  &--error {
    color: rgba(255, 68, 68, 0.8);
  }
}

.donorPosts-resetFiltersBtn {
  margin-top: 1rem;
  padding: 0.75rem 1.5rem;
  background: rgba(255, 255, 255, 0.1);
  color: white;
  border: 1px solid rgba(255, 255, 255, 0.2);
  border-radius: 0.5rem;
  font-size: 0.9rem;
  font-weight: 600;
  font-family: poppins;
  cursor: pointer;
  transition: background 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
  }
}

// POST CARD
.postCard {
  border-radius: 24px; // Matching detail screen radius
  overflow: hidden;
  background: linear-gradient(180deg, #17151f 0%, #0d0b13 100%);
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.6);
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 16px 48px rgba(0, 0, 0, 0.7);
  }
}

.postCard-imageWrapper {
  position: relative;
  height: 240px;
  overflow: hidden;
  border-radius: 1.25rem; // podľa existujúceho dizajnu
}

.postCard-authorBadge {
  position: absolute;
  top: 12px;
  left: 12px;
  display: flex;
  align-items: center;
  gap: 6px; // Smaller gap
  padding: 4px 10px 4px 4px; // Smaller padding to avoid "chunky" look
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  cursor: pointer;
  transition: background 0.2s ease;
  z-index: 2;

  &:hover {
    background: rgba(0, 0, 0, 0.75);
  }
}

.postCard-authorText {
  display: flex;
  flex-direction: column;
  gap: 1px;
}

.postCard-authorName {
  font-size: 0.8rem; // Slightly smaller text
  font-weight: 600;
  color: #fff;
  line-height: 1.2;
}

.postCard-authorBadgeLabel {
  font-size: 0.65rem; // Smaller badge label
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.2;
}

.postCard-avatarInitials {
  font-size: 0.75rem;
  font-weight: 600;
  color: white;
}

.postCard-titleRow {
  position: absolute;
  bottom: 10px; // Smaller offset from bottom
  left: 12px;
  right: 10px; // Reward pill closer to right edge
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  z-index: 2;
}

.postCard-categoryPill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 10px;
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
  line-height: 1.2;
}

.postCard-categoryIcon {
  width: 14px;
  height: 14px;
  object-fit: contain;
}

.postCard-rewardPill {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 11px;
  border-radius: 18px;
  background: rgba(255, 44, 139, 0.2); // More pink background
  backdrop-filter: blur(8px);
  color: #ff2c8b;
  font-size: 0.8rem;
  font-weight: 700;
  line-height: 1.2;
  border: 1px solid rgba(255, 44, 139, 0.4); // Stronger border
}

.postCard-body {
  padding: 16px;
  padding-bottom: 18px; // Bottom padding 16-20px
  cursor: pointer;
  display: flex;
  flex-direction: column;
}

.postCard-title {
  margin: 0;
  margin-bottom: 8px;
  padding: 0;
  font-size: 1.15rem; // Slightly larger, bold
  font-weight: 700;
  color: #fff;
  line-height: 1.3;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
}

.postCard-meta {
  display: flex;
  align-items: flex-start;
  gap: 10px;
  margin: 0;
  margin-bottom: 8px;
  margin-left: -4px;
  padding: 0;
  padding-left: 0;
  font-size: 0.72rem; // Fine-tuned font size
  color: rgba(255, 255, 255, 0.55); // Fine-tuned color
  text-align: left;
  width: 100%;
  box-sizing: border-box;
}

.postCard-location,
.postCard-date {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  margin: 0;
  margin-left: 0;
  padding: 0;
  padding-left: 0;
  vertical-align: baseline;

  i {
    font-size: 11px;
    margin: 0;
    padding: 0;
    flex-shrink: 0;
    display: inline-block;
    width: auto;
  }
}

.postCard-preview {
  margin: 0;
  padding: 0;
  font-size: 0.82rem;
  color: rgba(255, 255, 255, 0.7);
  line-height: 1.5;
  text-align: left;
  width: 100%;
  box-sizing: border-box;
  display: -webkit-box;
  -webkit-line-clamp: 3; // Max 3 lines
  line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
  text-overflow: ellipsis;
}
</style>
