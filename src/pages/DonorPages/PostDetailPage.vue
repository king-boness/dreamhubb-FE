<template>
  <!-- Loading state -->
  <div v-if="loading" class="postDetail-loading">
    <AppSplash />
  </div>

  <!-- Error state -->
  <div v-else-if="error" class="postDetail-error">
    <div class="postDetail-errorContent">
      <h2>Unable to load this post</h2>
      <p>{{ error }}</p>
      <div class="postDetail-errorActions">
        <button class="primaryCtaBtn" @click="handleRetry">
          Try Again
        </button>
        <button class="secondaryBtn" @click="handleClose">
          Back to Feed
        </button>
      </div>
    </div>
  </div>

  <!-- Empty state (post not found) -->
  <div v-else-if="!post" class="postDetail-empty">
    <div class="postDetail-errorContent">
      <h2>Post not found</h2>
      <p>This post may have been deleted or doesn't exist.</p>
      <button class="primaryCtaBtn" @click="handleClose">
        Back to Feed
      </button>
    </div>
  </div>

  <!-- Post content -->
  <div v-else class="postDetail">
    <div class="postDetail-inner">

      <!-- TOP IMAGE -->
      <div class="postDetailBg">
        <div class="postDetail-imageWrapper" :style="heroStyle">
          <PostImagesCarousel
            :images="post?.images"
            :auto-slide="true"
            :show-progress="true"
            :show-arrows="true"
            :show-dots="true"
            alt="Post image"
            :image-style="{ cursor: 'pointer' }"
            @image-click="openLightbox"
          />
        </div>

        <!-- GRADIENT -->
        <div class="postDetail-blurContainer"></div>

      <!-- TOP ICONS -->
        <div class="postDetail-topIcons">
          <q-btn
            round
            flat
            dense
            class="iconBtn iconBtn-left"
            :icon="'img:/assets/icons/post/icon-close.svg'"
            @click="handleClose"
          />

          <div class="postDetail-topIconsRight">
            <q-btn
              round
              flat
              dense
              class="iconBtn"
              :icon="'img:/assets/icons/post/icon-share.svg'"
              @click="handleShare"
            />
            <button
              class="postDetail-heartBtn"
              :class="{ 'postDetail-heartBtn--liked': isLiked }"
              @click.stop="handleLike"
            >
              <img
                :src="isLiked ? '/post_icons/hearth_s.svg' : '/header_icons/hearth_ns.svg'"
                alt="Like"
                class="postDetail-heartIcon"
              />
            </button>
          </div>
        </div>

        <!-- CATEGORY CHIP -->
        <div class="postDetail-chipRow">
          <div class="postDetail-categoryPill">
            <img
              :src="getPostTypeIcon(post.type)"
              class="postDetail-categoryIcon"
              alt=""
            />
            <span class="postDetail-categoryText">
              {{ post.fe_category ? getCategoryDisplayName(post.fe_category) : (post.category_name || "General") }}
            </span>
          </div>
        </div>

        <!-- COMMENT ICON (bottom right) -->
        <div class="postDetail-commentWrapper">
          <q-btn
            round
            flat
            dense
            class="postDetail-commentBtn"
            :icon="'img:/assets/icons/post/icon-comment.svg'"
            @click="handleComments"
          />
          <span v-if="commentsCount !== null && commentsCount > 0" class="postDetail-commentCount">
            {{ commentsCount }}
          </span>
        </div>

        <!-- TITLE + META OVERLAY -->
        <div class="postDetail-infoOverlay">
          <h1 class="postTitleOnImage">{{ displayTitle }}</h1>
          <div class="postDetail-metaRow">
            <div class="postDetail-metaItem">
              <q-icon
                class="postDetail-metaIcon"
                :name="'img:/assets/icons/ui/icon-date.svg'"
              />
              <span>{{ displayDate }}</span>
            </div>
            <div class="postDetail-metaItem">
              <q-icon
                class="postDetail-metaIcon"
                :name="'img:/assets/icons/ui/icon-location.svg'"
              />
              <span>{{ displayLocation }}</span>
            </div>
            <div class="postDetail-metaItem">
              <q-icon
                class="postDetail-metaIcon"
                :name="'img:/assets/icons/ui/icon-views.svg'"
              />
              <span>{{ viewsCount }}</span>
            </div>
          </div>
        </div>
      </div>

      <!-- BODY CONTENT -->
      <div class="postDetailContent">

        <!-- CTA BUTTON -->
        <div class="postCTA">
          <button
            class="primaryCtaBtn"
            :disabled="postsStore.donateLoading"
            @click="openContributeSheet"
          >
            <div class="primaryCtaMain">
              {{ postsStore.donateLoading ? t("processing") : t("contribute") }}
            </div>
          </button>
          <!-- Error message display -->
          <div v-if="postsStore.donateError" class="postDetail-donateError">
            {{ postsStore.donateError }}
          </div>
        </div>
        <div class="postDetail-rewardRow">
          <img
            src="/post_icons/stars.svg"
            alt="Reward"
            class="postDetail-rewardIcon"
          />
          <span class="postDetail-rewardLabel">REWARD: {{ displayTokens }} tokens</span>
        </div>

      <!-- ABOUT DREAM/PROBLEM/IDEA -->
      <div class="aboutPost">
        <h2>{{ aboutSectionTitle }}</h2>
          <p>{{ post.description }}</p>
      </div>

        <!-- ABOUT AUTHOR -->
        <div class="aboutAuthor">
        <h2>{{ t("aboutAuthor") }}</h2>

          <div
            class="authorCard"
            role="button"
            tabindex="0"
            @click.prevent="goToAuthorProfile"
            @keyup.enter="goToAuthorProfile"
          >
            <div class="authorCard-avatarWrapper" @click.prevent="goToAuthorProfile">
              <UserAvatar
                :image-url="displayAuthorAvatar"
                :name="displayAuthorName"
                size="32px"
              />
            </div>
            <div class="authorInfo" @click.prevent="goToAuthorProfile">
              <p class="authorName">{{ displayAuthorName }}</p>
              <p class="authorRole">{{ displayAuthorLocation }}</p>
            </div>
          </div>

          <!-- TODO: Replace with API data from author.bio when BE endpoint is ready -->
          <p v-if="authorBio" class="authorStory">{{ authorBio }}</p>
          <p v-else class="authorStory">{{ t("noBioYet") }}</p>
        </div>

        <!-- REPORT POST BUTTON (moved to bottom) -->
        <div class="postDetail-reportSection">
          <button
            type="button"
            class="postDetail-reportBtn"
            @click="handleReportDream"
          >
            <q-icon
              class="postDetail-reportIcon"
              :name="'img:/assets/icons/ui/icon-report.svg'"
            />
            <span>REPORT A POST</span>
          </button>
        </div>

      </div>
    </div>
    <transition name="sheet-fade">
      <div
        v-if="isContributeSheetOpen"
        class="contributeSheet-backdrop"
        @click.self="closeContributeSheet"
      >
        <div class="contributeSheet">
          <div class="contributeSheet-handle"></div>
          <h2 class="contributeSheet-title">How do you want to contribute?</h2>

          <button class="contributeSheet-btn primary" @click="onContributeOption('accomplish')">
            ACCOMPLISH DREAM
          </button>
          <button class="contributeSheet-btn secondary" @click="onContributeOption('help')">
            HELP TO FULFILL
          </button>
          <button
            class="contributeSheet-btn tertiary"
            :disabled="postsStore.donateLoading"
            @click="onContributeOption('topup')"
          >
            {{ postsStore.donateLoading ? t("processing") : t("topUpTheDream") }}
          </button>
        </div>
      </div>
    </transition>

    <!-- Lightbox Modal -->
    <q-dialog v-model="isLightboxOpen" maximized class="lightbox-dialog">
      <q-card class="lightbox-card">
        <q-btn
          flat
          round
          dense
          icon="close"
          class="lightbox-close"
          @click="isLightboxOpen = false"
        />
        <div class="lightbox-content">
          <img
            v-if="post?.images && post.images.length > 0"
            :src="post.images[0]"
            :alt="`Post image`"
            class="lightbox-image"
          />
        </div>
      </q-card>
    </q-dialog>

    <!-- Share Post Sheet -->
    <ShareProfileSheet
      v-model="isShareSheetOpen"
      :profile-url="currentPostUrl"
      :profile-title="sharePostTitle"
      :profile-text="sharePostText"
      :post-type="post?.type || null"
    />
  </div>

</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch } from "vue";
import { useI18n } from "vue-i18n";
import { translateCityName, translateCountryName } from "src/utils/cityNames";
import { usePostsStore } from "src/stores/posts";
import { useAuthStore } from "src/stores/auth";
import { usePreferencesStore } from "src/stores/preferences";
import { useRoute, useRouter } from "vue-router";
import AppSplash from "src/components/common/AppSplash.vue";
import PostImagesCarousel from "src/components/post/PostImagesCarousel.vue";
import ShareProfileSheet from "src/components/profile/ShareProfileSheet.vue";
import { useEdgeSwipeBack } from "src/composables/useEdgeSwipeBack";
import { getCategoryDisplayName } from "src/data/categoryNames";
import { getPostTypeIcon } from "src/utils/postIcons";
import { getUserAvatarUrl } from "src/utils/avatar";
import UserAvatar from "src/components/common/UserAvatar.vue";
import { Notify } from "quasar";

const { t, locale } = useI18n();

// Post type icon function is now imported from utils/postIcons.ts

// Enable swipe-back gesture
useEdgeSwipeBack();

const postsStore = usePostsStore();
const authStore = useAuthStore();
const preferencesStore = usePreferencesStore();
const route = useRoute();
const router = useRouter();

type ContributeOptionType = "tokens" | "share" | "mentoring" | "other";

interface ContributeOption {
  id: string | number;
  type: ContributeOptionType;
  label: string;
}

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: "open-contribute-tokens", payload: { postId: number | string }): void;
  (e: "open-contribute-mentoring", payload: { postId: number | string }): void;
  (e: "open-comments-thread", payload: { postId: number | string }): void;
}>();

type ScrollEventTarget = Window | HTMLElement;

const isLiked = ref(false);
const likesCount = ref<number | null>(null);
const isSaved = ref(false);
const commentsCount = ref<number | null>(null);
const scrollY = ref(0);
const scrollTarget = ref<ScrollEventTarget | null>(null);
const cleanupFns: Array<() => void> = [];
const isContributeSheetOpen = ref(false);
const isLightboxOpen = ref(false);
const isShareSheetOpen = ref(false);
let errorTimeoutId: ReturnType<typeof setTimeout> | null = null;

const readScrollPosition = () => {
  // Always use window.scrollY for consistency with Quasar QLayout
  return window.scrollY || document.documentElement?.scrollTop || document.body?.scrollTop || 0;
};

const handleScroll = () => {
  const newScrollY = readScrollPosition();
  scrollY.value = newScrollY;
  // Debug: log scroll position to verify it's working
  if (newScrollY > 0 && newScrollY % 50 === 0) {
    console.log("📜 Scroll position:", newScrollY, "| Blur progress:", Math.min(newScrollY / 220, 1).toFixed(2));
  }
};

const attachScrollListener = (target: ScrollEventTarget) => {
  target.addEventListener("scroll", handleScroll, { passive: true });
  cleanupFns.push(() => target.removeEventListener("scroll", handleScroll));
};

const heroStyle = computed(() => {
  const maxBlur = 14;
  const maxTranslate = 40;
  const maxScroll = 400; // Increased for smoother, more gradual blur
  const progress = Math.min(scrollY.value / maxScroll, 1);

  const styles = {
    filter: `blur(${progress * maxBlur}px)`,
    transform: `translateY(${-progress * maxTranslate}px)`
  };

  // Debug: log computed style when scroll changes significantly
  if (progress > 0 && scrollY.value % 100 === 0) {
    console.log("🎨 heroStyle computed:", styles, "| progress:", progress.toFixed(2));
  }

  return styles;
});

// Computed properties from store
const post = computed(() => postsStore.currentPost);
const loading = computed(() => postsStore.detailLoading);
const error = computed(() => postsStore.detailError);

// Computed property to get token value from post
const displayTokens = computed(() => {
  return post.value?.tokens ?? 0;
});

// Computed property to get title from post
const displayTitle = computed(() => {
  return post.value?.title ?? "";
});

// Computed property to get formatted date from post
const displayDate = computed(() => {
  return formattedDate.value;
});

// Computed property to get location from post
const displayLocation = computed(() => {
  return locationLabel.value;
});

// Computed property to get author name from post
const displayAuthorName = computed(() => {
  return post.value?.author_name ?? "";
});

// Computed property to get author avatar (fallback to default)
const displayAuthorAvatar = computed(() => {
  // Use unified avatar utility function
  const avatarUrl = getUserAvatarUrl(
    post.value?.user as { profile_picture?: string | null } | null,
    post.value as { author_picture?: string | null; authorAvatarUrl?: string | null; user?: { profile_picture?: string | null } } | null
  );

  // Debug logging in development
  if (process.env.NODE_ENV === "development" && !avatarUrl && post.value) {
    console.log("🔍 No avatar found for post detail:", {
      post_id: post.value.post_id,
      author_name: post.value.author_name,
      has_user: !!post.value.user,
      user_profile_picture: post.value.user?.profile_picture,
      author_picture: post.value.author_picture
    });
  }

  // Return avatar URL or null (UserAvatar component will show initials)
  return avatarUrl;
});

const authorId = computed(() => {
  // BE now sends user_id directly in response
  const id = (post.value?.user_id || post.value?.author_id || post.value?.user?.id || null) as number | null;
  if (process.env.NODE_ENV === "development" && !id && post.value) {
    console.warn("⚠️ No authorId found in post:", {
      post_id: post.value.post_id,
      author_name: post.value.author_name,
      has_author_id: !!post.value.author_id,
      has_user_id: !!post.value.user_id,
      has_user: !!post.value.user,
      user_id: post.value.user?.id
    });
  }
  return id;
});

// Computed property to get author location for "About Author" section
const displayAuthorLocation = computed(() => {
  const p = post.value;
  if (!p) return "Unknown";

  // Build location string from author's location (city, country, continent)
  const parts = [];
  if (p.author_city) parts.push(p.author_city);
  if (p.author_country) parts.push(p.author_country);
  if (p.author_continent && !parts.length) parts.push(p.author_continent);

  return parts.length > 0 ? parts.join(", ") : "Unknown";
});

const authorBio = computed(() => {
  const p = post.value;
  if (!p) return null;
  // Prefer explicit author_bio from BE, fallback to nested user.bio if present
  return (p as any).author_bio || (p as any).user?.bio || null;
});

// Computed property to get post type (dream/problem/idea)
const postType = computed(() => {
  const p = post.value;
  if (!p) return "dream"; // Default fallback

  // BE posiela type pole
  const type = p.type || "dream";

  if (["dream", "problem", "idea"].includes(type)) {
    return type;
  }

  // Default to "dream" if type is not valid
  return "dream";
});

// Computed property for "About" section title
const aboutSectionTitle = computed(() => {
  const type = postType.value;
  const titles: Record<string, string> = {
    dream: t("aboutTheDream"),
    problem: t("aboutTheProblem"),
    idea: t("aboutTheIdea")
  };
  return titles[type] || t("aboutTheDream");
});

// Load post by ID
const loadPost = async (id: number) => {
  // Nastaviť loading na true okamžite, aby sa splash screen zobrazil
  postsStore.detailLoading = true;
  await postsStore.fetchPostById(id);
};

// Watch for route param changes (e.g., when navigating between posts)
watch(
  () => route.params.id,
  async (newId) => {
    // Clear error when navigating to a different post
    clearDonateError();
    if (newId) {
      const id = Number(newId);
      if (!Number.isNaN(id)) {
        await loadPost(id);
      }
    }
  },
  { immediate: false }
);

// Clear error message helper
const clearDonateError = () => {
  if (errorTimeoutId) {
    clearTimeout(errorTimeoutId);
    errorTimeoutId = null;
  }
  postsStore.donateError = null;
};

// Watch for donateError changes to auto-clear after 5 seconds
watch(
  () => postsStore.donateError,
  (newError) => {
    if (newError) {
      // Clear any existing timeout
      if (errorTimeoutId) {
        clearTimeout(errorTimeoutId);
      }
      // Set new timeout to clear error after 5 seconds
      errorTimeoutId = setTimeout(() => {
        clearDonateError();
      }, 5000);
    } else {
      // Clear timeout if error is already cleared
      if (errorTimeoutId) {
        clearTimeout(errorTimeoutId);
        errorTimeoutId = null;
      }
    }
  }
);

// Lifecycle hooks
onMounted(async () => {
  if (process.env.NODE_ENV === "development") {
    console.log("🟢 [PostDetailPage] onMounted called");
  }

  // Clear any existing error when mounting
  clearDonateError();

  const id = Number(route.params.id);

  if (Number.isNaN(id)) {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ Invalid post ID:", route.params.id);
    }
    return;
  }

  await loadPost(id);

  await nextTick();

  // Always use window as scroll target for Quasar QLayout compatibility
  scrollTarget.value = window;
  if (process.env.NODE_ENV === "development") {
    console.log("🎯 PostDetail mounted - using window as scroll target");
    console.log("📍 Initial scroll position:", readScrollPosition());
  }

  attachScrollListener(window);
  handleScroll();
});

onBeforeUnmount(() => {
  if (process.env.NODE_ENV === "development") {
    console.log("🔴 [PostDetailPage] onBeforeUnmount called");
  }

  // Clear error message and timeout
  clearDonateError();

  // Run cleanup functions
  cleanupFns.forEach((fn) => {
    try {
      fn();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Error in cleanup function:", error);
      }
    }
  });
});

const openLightbox = () => {
  if (post.value?.images && post.value.images.length > 0) {
    isLightboxOpen.value = true;
  }
};

const formattedDate = computed(() => {
  if (!post.value?.date_created) return "";
  const d = new Date(post.value.date_created);
  if (Number.isNaN(d.getTime())) return post.value.date_created;
  return d.toLocaleDateString("sk-SK", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric"
  });
});

const locationLabel = computed(() => {
  const p = post.value;
  if (!p) return "Unknown";

  if (process.env.NODE_ENV === "development") {
    console.log("📍 PostDetailPage locationLabel:", {
      post_id: p.post_id,
      author_city: p.author_city,
      author_country: p.author_country,
      author_continent: p.author_continent,
      full_post: p
    });
  }

  // Build location string from author's location (city, country, continent)
  const parts = [];
  if (p.author_city) {
    const translatedCity = translateCityName(p.author_city, locale.value as string);
    parts.push(translatedCity);
  }
  if (p.author_country) {
    const translatedCountry = translateCountryName(p.author_country, locale.value as string);
    parts.push(translatedCountry);
  }
  if (p.author_continent && !parts.length) parts.push(p.author_continent);

  return parts.length > 0 ? parts.join(", ") : "Unknown";
});

const viewsCount = computed(() => {
  return post.value?.views ?? 0;
});

const goToAuthorProfile = () => {
  const targetId = authorId.value;

  if (process.env.NODE_ENV === "development") {
    console.log("🔍 goToAuthorProfile called:", {
      targetId,
      currentUserId: authStore.user?.id,
      currentSide: preferencesStore.currentSide,
      post: post.value
    });
  }

  if (!targetId) {
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ No authorId available for navigation");
    }
    return;
  }

  const currentSide = preferencesStore.currentSide || "donor";

  // If user clicks on their own profile, stay on current side
  if (authStore.user?.id === targetId) {
    if (process.env.NODE_ENV === "development") {
      console.log("✅ Navigating to own profile on side:", currentSide);
    }
    if (currentSide === "donee") {
      router.push({ name: "donee-myprofile" });
    } else {
      router.push({ name: "donor-myprofile" });
    }
    return;
  }

  // For other users, keep existing logic on donor side and map to proper profile route on donee side
  if (process.env.NODE_ENV === "development") {
    console.log("✅ Navigating to user profile:", { targetId, currentSide });
  }

  if (currentSide === "donee") {
    router.push({ name: "donee-user-profile", params: { userId: String(targetId) } });
  } else {
    router.push({ name: "donor-user-profile", params: { userId: String(targetId) } });
  }
};

const handleClose = () => {
  if (window.history.length > 1) {
    router.back();
    return;
  }
  router.push({ name: "donor-posts" });
};

const handleRetry = async () => {
  const id = Number(route.params.id);
  if (!Number.isNaN(id)) {
    await loadPost(id);
  }
};

const currentPostUrl = computed(() => {
  const id = post.value?.post_id ?? Number(route.params.id ?? NaN);
  const base = window.location.origin || "https://app.dreamhubb.com";
  if (!id || Number.isNaN(id)) {
    return base;
  }
  return `${base}/donor/post-detail/${id}`;
});

// Share post computed properties
const sharePostTitle = computed(() => {
  return post.value?.title || "Check out this post on dreamhubb";
});

const sharePostText = computed(() => {
  return post.value?.description || "Check out this post on dreamhubb";
});

const handleShare = () => {
  // Open share bottom-sheet (same as share profile)
  isShareSheetOpen.value = true;
};

const sendLikeToApi = async (postId: number | string, like: boolean) => {
  console.log("sendLikeToApi placeholder", { postId, like });
};

const handleLike = async () => {
  const postId = post.value?.post_id;
  if (!postId) {
    console.warn("Cannot like: missing post id");
    return;
  }

  const newValue = !isLiked.value;
  isLiked.value = newValue;
  if (likesCount.value !== null) {
    likesCount.value += newValue ? 1 : -1;
  }

  try {
    await sendLikeToApi(postId, newValue);
  } catch (error) {
    console.error("Failed to update like on server", error);
    isLiked.value = !newValue;
    if (likesCount.value !== null) {
      likesCount.value += newValue ? -1 : 1;
    }
  }
};

const sendSaveToApi = async (postId: number | string, save: boolean) => {
  console.log("sendSaveToApi placeholder", { postId, save });
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleSave = async () => {
  const postId = post.value?.post_id;
  if (!postId) {
    console.warn("Cannot save: missing post id");
    return;
  }

  const newValue = !isSaved.value;
  isSaved.value = newValue;

  try {
    await sendSaveToApi(postId, newValue);
  } catch (error) {
    console.error("Failed to update save on server", error);
    isSaved.value = !newValue;
  }
};

const handleReportDream = () => {
  const postId = post.value?.post_id;
  if (!postId) return;

  console.log("TODO: open report dream flow for post", postId);
  // TODO: neskôr nahradiť reálnym modalom / route
};

const handleComments = () => {
  const postId = post.value?.post_id ?? (Array.isArray(route.params.id) ? route.params.id[0] : route.params.id);
  if (!postId) {
    console.warn("Chýba postId, nedá sa otvoriť komentárový thread");
    return;
  }

  const postIdValue: number | string = typeof postId === "string" ? (Number(postId) || postId) : postId;

  // 1. emit event pre parent (do budúcna, ak budeme riešiť modaly):
  emit("open-comments-thread", { postId: postIdValue });

  // 2. zároveň pripravíme skeleton pre route na screen
  // "Dream Detail - Thread - Contribution" (TODO - route sa doplní neskôr)
  try {
    router.push({
      name: "donor-post-comments", // TODO: prispôsobiť skutočnému názvu route, keď bude vytvorená
      params: { id: String(postIdValue) }
    });
  } catch (error) {
    console.log("Route na komentáre zatiaľ neexistuje - TODO", error);
  }
  // Do implementácie komentárov budú tieto kroky slúžiť ako pripravený skeleton
};

const openContributeSheet = () => {
  // Reset error state when opening sheet
  postsStore.donateError = null;
  isContributeSheetOpen.value = true;
};

const closeContributeSheet = () => {
  isContributeSheetOpen.value = false;
};

const onContributeOption = async (option: ContributeOption | string) => {
  const postId = post.value?.post_id;
  if (!postId) {
    console.warn("Chýba postId v onContributeOption");
    return;
  }

  // Support both string (legacy) and ContributeOption object
  const optionType = typeof option === "string" ? option : option.type;

  switch (optionType) {
    case "tokens":
    case "accomplish":
      emit("open-contribute-tokens", { postId });
      break;
    case "share":
      handleShare();
      break;
    case "mentoring":
    case "help":
      emit("open-contribute-mentoring", { postId });
      break;
    case "topup":
      // Handle token donation
      await handleDonateTokens(postId);
      break;
    default:
      console.log("TODO: ďalšie typy contribute option", option);
      break;
  }

  closeContributeSheet();
};

// Handle token donation
const handleDonateTokens = async (postId: number) => {
  if (!post.value) {
    return;
  }

  // For now, use a simple fixed amount (e.g., 10 tokens)
  // TODO: In the future, this could open a modal to select amount
  const tokensToDonate = 10;

  try {
    // Reset error state before donation
    postsStore.donateError = null;
    await postsStore.donateToPost(postId, tokensToDonate);

    // Success notification
    Notify.create({
      type: "positive",
      message: `Successfully donated ${tokensToDonate} tokens!`,
      position: "top",
      timeout: 3000
    });
  } catch (error) {
    // Error notification (error message is already set in store)
    const errorMessage = postsStore.donateError || "Failed to process donation. Please try again.";
    Notify.create({
      type: "negative",
      message: errorMessage,
      position: "top",
      timeout: 5000
    });
  }
};

watch(
  () => post.value,
  (newPost) => {
    if (newPost) {
      // TODO: BE ešte neposiela likes/comments - keď bude, pridať:
      // likesCount.value = newPost.likes_count ?? null;
      // isLiked.value = newPost.is_liked ?? false;
      // commentsCount.value = newPost.comments_count ?? null;
      likesCount.value = null;
      isLiked.value = false;
      commentsCount.value = null;
    } else {
      likesCount.value = null;
      isLiked.value = false;
      commentsCount.value = null;
    }
    isSaved.value = false;
  },
  { immediate: true }
);
</script>

<style lang="scss">
/* styles for this page are v _postDetail.scss imported cez main.scss */
</style>
