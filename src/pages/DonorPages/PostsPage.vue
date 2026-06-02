<template>
  <!-- Jeden scroll na q-page-container; zoznam je natívny v-for (bez QVirtualScroll — ten programovo nastavuje scrollTop a robí „snap“). -->
  <q-page class="donorPostsPage donorPostsPage--unifiedScroll">
    <div class="donorPosts-feed" data-testid="dh-feed-container">
      <!-- Loading state -->
      <div v-if="loading" class="donorPosts-state">
        <p>{{ t("loadingPosts") }}</p>
      </div>

      <!-- Error state (safe, with Retry) -->
      <div v-else-if="feedError" class="donorPosts-state" data-testid="dh-feed-error">
        <RetryPanel
          :message="feedError"
          :on-retry="retryFetch"
          variant="inline"
          button-class="donorPosts-retryBtn"
          data-testid="dh-feed-retry"
        />
      </div>

      <!-- Empty state -->
      <!-- NOTE: We intentionally show the empty-state bubble even if the feed request failed.
           In practice, the common "error" here is a transient fetch failure or an empty DB;
           showing "Failed..." is poor UX for the donor feed. -->
      <div v-else-if="!loading && sortedPosts.length === 0" class="donorPosts-state">
        <div
          v-if="$route.name === 'donor-posts' && emptyFiltersHintVisible"
          class="donorPosts-emptyHint"
        >
          <HintBubble
            class="donorPosts-emptyHintBubble"
            :title="emptyStateTitle"
            :text="emptyStateText"
            arrow="up"
            :clickable="true"
            :show-close="true"
            @click="handleOpenFilters"
            @close="dismissEmptyFiltersHint"
          />
        </div>
        <p v-else>{{ t("noPosts") }}</p>
      </div>

      <!-- Natívny zoznam: rovnaké karty ako predtým; žiadna programatická korekcia scrollu (Quasar QVirtualScroll). -->
      <template v-else>
        <div class="donorPosts-feed--nativeList" role="list">
          <div
            v-for="post in sortedPosts"
            :key="post.id"
            class="postCard"
            role="listitem"
            tabindex="0"
            @click="emitOpenPost(post)"
            @keyup.enter.space="emitOpenPost(post)"
          >
          <!-- Hero image with overlay -->
          <div class="postCard-imageWrapper">
            <PostCover
              :images="post.images"
              :post-type="post.type"
              :icon-url="getPostTypeIcon(post.type)"
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
        </div>
      </template>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed, onMounted, nextTick, onActivated, watch } from "vue";
import { useDeferredOverlay } from "src/composables/useDeferredOverlay";
import { useI18n } from "vue-i18n";
import { getLocationLabel } from "src/utils/cityNames";
import { useRoute, useRouter } from "vue-router";
import { usePostsStore } from "src/stores/posts";
import { usePreferencesStore } from "src/stores/preferences";
import { useAuthStore } from "src/stores/auth";
import PostCover from "src/components/post/PostCover.vue";
import { getPostTypeIcon } from "src/utils/postIcons";
import { getUserAvatarUrl } from "src/utils/avatar";
import { normalizePost } from "src/utils/normalizePost";
import { formatSubcategoryLabel } from "src/utils/formatSubcategoryLabel";
import UserAvatar from "src/components/common/UserAvatar.vue";
import HintBubble from "src/components/ui/HintBubble.vue";
import RetryPanel from "src/components/common/RetryPanel.vue";
import { useDonorPostsUiStore } from "src/stores/donorPostsUi";

const { t, locale } = useI18n();

const router = useRouter();
const postsStore = usePostsStore();
const preferencesStore = usePreferencesStore();
const authStore = useAuthStore();

const isEmptyFiltersHintDismissed = ref(false);

const dismissEmptyFiltersHint = () => {
  isEmptyFiltersHintDismissed.value = true;
};

const donorPostsUiStore = useDonorPostsUiStore();

const feedError = computed(() => postsStore.error);

const retryFetch = async () => {
  await postsStore.fetchPosts({ sort: donorPostsUiStore.activeTab });
};

// Function to apply initial filters from preferences (must be defined before watcher)
const applyInitialFiltersFromPreferences = () => {
  // Ensure filters are loaded from storage first
  preferencesStore.loadDonorFiltersFromStorage();
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

// Watch for user changes and reload filters
watch(
  () => authStore.user?.id,
  (newId, oldId) => {
    if (!newId) return;

    // Pri zmene usera vždy resetni store a načítaj jeho uložené filtre
    // (on user change, always reset the store and load its saved filters)
    // immediate: true zabezpečí, že pri prvom mountnutí (už prihlásený user) sa filtre hneď načítajú z jeho kľúča
    if (newId !== oldId) {
      // Reset to defaults first (only on user change, not on first mount)
      // NOTE: resetToDefaults() only resets in memory, NOT in localStorage
      preferencesStore.resetDonorFiltersToDefaults();
    }
    // Migrate legacy filters if needed (always check)
    preferencesStore.migrateLegacyDonorFiltersIfNeeded();
    // Load user-specific filters (always load)
    preferencesStore.loadDonorFiltersFromStorage();

    // Aplikovať načítané filtre
    applyInitialFiltersFromPreferences();
    // Načítať posty s novými filtrami (len ak už máme user ID a došlo k zmene)
    if (newId && newId !== oldId) {
      postsStore.fetchPosts({ sort: donorPostsUiStore.activeTab });
    }
  },
  { immediate: true }
);

// Update indicator position on mount and fetch initial posts
onMounted(() => {
  // Always show the empty-state bubble when there are no posts.
  // (We intentionally do not persist dismissal in localStorage.)
  isEmptyFiltersHintDismissed.value = false;

  nextTick(() => {
    // Indicator position updates via computed + DOM refs
  });

  // Load filters from storage first, then apply them
  preferencesStore.loadDonorFiltersFromStorage();

  applyInitialFiltersFromPreferences();

  // Fetch initial posts with default "help" sort (filters sa automaticky použijú z store)
  postsStore.fetchPosts({ sort: donorPostsUiStore.activeTab });
});

// Reload posts when returning from filters page (kept-alive component)
onActivated(() => {
  // Kept-alive component: reset dismissal so bubble can show again when feed is empty.
  isEmptyFiltersHintDismissed.value = false;
  // Načítať filtre z localStorage a aplikovať ich
  preferencesStore.loadDonorFiltersFromStorage();
  applyInitialFiltersFromPreferences();

  // Načítať posty s aktuálnymi filtrami pri návrate na stránku
  postsStore.fetchPosts({ sort: donorPostsUiStore.activeTab });
});

// Computed properties from store
const posts = computed(() => postsStore.posts);
const loading = computed(() => postsStore.loading);

// Check if any filters are active - using new API
const hasActiveFilters = computed(() => {
  return !!(
    postsStore.filters.categorySlug ||
    postsStore.filters.subcategorySlug ||
    postsStore.filters.continentId ||
    postsStore.filters.countryId ||
    postsStore.filters.cityId
  );
});

const emptyStateTitle = computed(() => {
  return hasActiveFilters.value ? "No posts with these filters." : t("noPosts");
});

const emptyStateText = computed(() => {
  return "Be the first or change the filters.";
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

// Map BE data to FE format - using normalized post data
const mapPostData = (post: Record<string, unknown>): DonorPost => {
  // Normalize post to ensure category and subcategory objects exist
  const normalized = normalizePost(post as Parameters<typeof normalizePost>[0]);

  const authorName = normalized.author_name || "Unknown";
  // Use unified avatar utility function - check multiple possible fields from BE
  const authorPicture = getUserAvatarUrl(
    normalized.user,
    {
      author_picture: normalized.author_picture,
      authorAvatarUrl: null,
      user: normalized.user
    }
  ) || "";

  // Get authorId for navigation
  const authorId = normalized.author_id || normalized.user_id || null;

  const images = normalized.images || [];
  const firstImage = images.length > 0 ? images[0] : null;

  // Get category slug for type icon
  const categorySlug = normalized.category?.slug || "dream";

  // Get subcategory label using i18n
  const subcategorySlug = normalized.subcategory?.slug;
  let categoryLabel = t("common.unknown") || "Unknown";
  if (subcategorySlug) {
    const i18nKey = `subcategories.${subcategorySlug}`;
    const translated = t(i18nKey);
    const finalText = translated !== i18nKey ? translated : subcategorySlug.charAt(0).toUpperCase() + subcategorySlug.slice(1);
    categoryLabel = formatSubcategoryLabel(finalText);
  } else {
    categoryLabel = formatSubcategoryLabel(categoryLabel);
  }

  return {
    id: normalized.post_id,
    backendPostId: normalized.post_id,
    tab: donorPostsUiStore.activeTab, // Use current active tab
    type: categorySlug as "dream" | "problem" | "idea", // Category slug for icon
    authorId,
    authorName,
    // Use real avatar URL if available, otherwise empty string (template will show initials)
    authorAvatarUrl: authorPicture || "",
    authorBadgeLabel: "User", // TODO: Get from normalized post if available
    dreamTitle: normalized.title || "Untitled",
    categoryLabel,
    tokenReward: normalized.tokens || 0,
    previewText: normalized.description || "",
    location: getLocationLabel(normalized, locale.value as string) || "Unknown",
    createdAt: normalized.date_created || new Date().toISOString(),
    // Use real cover image from BE, fallback to default if not available
    imageUrl: firstImage || "/images/Auth/postBackground.png",
    // Pass images array for carousel
    images: images.length > 0 ? images : null
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

const route = useRoute();

const shouldShowEmptyFiltersHint = computed(
  () =>
    route.name === "donor-posts" &&
    !loading.value &&
    sortedPosts.value.length === 0 &&
    !isEmptyFiltersHintDismissed.value
);

const { visible: emptyFiltersHintVisible } = useDeferredOverlay(shouldShowEmptyFiltersHint, {
  routeName: "donor-posts",
  requiredSide: "donor",
  minDelayMs: 380
});

// Dev: performance mark when feed renders (before/after meranie v console)
watch(
  () => ({ loading: loading.value, count: sortedPosts.value.length }),
  ({ loading: l, count }) => {
    if (import.meta.env.DEV && !l && count > 0) {
      performance.mark("dh-feed-ready");
      performance.measure("dh-feed-load", "navigationStart", "dh-feed-ready");
      console.debug("[PostsPage] feed ready, posts:", count, "measure: dh-feed-load");
    }
  },
  { immediate: true }
);

// Mock posts data removed - now using data from BE via posts store

const handleOpenFilters = () => {
  router.push({ name: "donor-filters" });
};

// Format date as DD/MM/YYYY
const formatDate = (dateString: string): string => {
  const d = new Date(dateString);
  if (Number.isNaN(d.getTime())) {
    // Fallback: if it's already in MM/DD/YYYY format, convert to DD/MM/YYYY
    const dateParts = dateString.split("/");
    if (dateParts.length === 3) {
      const [month, day, year] = dateParts;
      return `${day}/${month}/${year}`;
    }
    return dateString;
  }
  // Format as DD/MM/YYYY
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
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
    return;
  }
  router.push({ name: "donor-user-profile", params: { userId } });
};

const emitOpenAuthor = (post: DonorPost) => {
  goToUserProfile(post.authorId);
};
</script>

<style lang="scss" scoped>
/* Padding unified-scroll q-page: globálne v _roleMainChrome.scss (.donorPostsPage--unifiedScroll). */

.donorPosts-feed {
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding-top: 16px;
  padding-bottom: 20px;
}

.donorPosts-feed--nativeList {
  display: flex;
  flex-direction: column;
  gap: 18px;
}

.donorPosts-state {
  text-align: center;
  padding: 2rem;
  color: #bbbbbb;
  font-size: 0.9rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;

  &--error {
    color: rgba(255, 68, 68, 0.8);
  }
}

.donorPosts-retryBtn {
  color: #ff4db8;
  font-family: poppinsSemiBold;
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

.donorPosts-emptyHint {
  /* Break out of .donorPosts-state horizontal padding (2rem) so bubble matches donee sizing */
  position: relative;
  z-index: 11;
  width: calc(100% + 4rem);
  margin-left: -2rem;
  margin-right: -2rem;
  display: flex;
  justify-content: center;
  transform: translateY(-32px);
}

/* Keep the first sentence on one line (match donee bubble sizing/typography otherwise) */
:deep(.donorPosts-emptyHintBubble .dhHintBubble-title) {
  white-space: nowrap;
}

// POST CARD — surface + body text tokens from global _darkMode.scss (.postCard / .body--light .postCard)
.postCard {
  border-radius: 24px;
  overflow: hidden;
  background: var(--pc-surface);
  border: var(--pc-border);
  box-shadow: var(--pc-shadow);
  box-sizing: border-box;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    box-shadow: var(--pc-shadow-hover);
  }
}

.postCard-imageWrapper {
  position: relative;
  height: 240px;
  overflow: hidden;
  /* Clip to card top corners only via parent .postCard overflow + radius (no inner radius mismatch / black seam) */
  border-radius: 0;
}

.postCard-authorBadge {
  position: absolute;
  top: 27px; /* Posun nadol o ďalších 7px (z 20px na 27px) */
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
  bottom: 12px;
  left: 12px;
  right: 10px; // Reward pill closer to right edge
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
  z-index: 2;
  overflow: visible;
  min-height: 0;
  padding-top: 6px;
  box-sizing: border-box;
}

.postCard-categoryPill {
  display: inline-flex;
  align-items: center;
  gap: 5px;
  min-height: 28px;
  box-sizing: border-box;
  padding: 5px 10px;
  line-height: 1.25;
  border-radius: 18px;
  background: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(8px);
  color: #fff;
  font-size: 0.7rem;
  font-weight: 600;
  overflow: visible;
  flex-wrap: nowrap;
}

.postCard-categoryIcon {
  width: 14px;
  height: 14px;
  flex-shrink: 0;
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

  span {
    color: inherit;
  }
}

.postCard-body {
  padding: 16px;
  padding-bottom: 18px;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  background: transparent;
  box-sizing: border-box;
}

.postCard-title {
  margin: 0;
  margin-bottom: 8px;
  padding: 0;
  font-size: 1.15rem; // Slightly larger, bold
  font-weight: 700;
  color: var(--pc-body-title);
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
  color: var(--pc-body-meta);
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
  color: inherit;

  i {
    font-size: 11px;
    margin: 0;
    padding: 0;
    flex-shrink: 0;
    display: inline-block;
    width: auto;
    color: inherit;
  }
}

.postCard-preview {
  margin: 0;
  padding: 0;
  font-size: 0.82rem;
  color: var(--pc-body-preview);
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
