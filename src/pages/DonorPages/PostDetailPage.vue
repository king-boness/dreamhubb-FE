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

      <!-- TOP IMAGE / SLIDER -->
      <div class="postDetailBg">
        <div class="postDetail-imageWrapper" :style="heroStyle">
          <img
            v-if="safeImages.length === 1"
            class="postDetail-img"
            :src="safeImages[0]"
            alt="Post image"
            @click="openLightbox(0)"
            style="cursor: pointer;"
          />

          <ImageIndexSlider
            v-else
            :images="safeImages"
            :current-index="currentImageIndex"
            @image-click="openLightbox"
            @index-change="handleImageIndexChange"
          />
        </div>

        <!-- TOP PROGRESS BAR -->
        <div class="postDetail-progressBar" v-if="safeImages.length >= 1">
          <span
            v-for="(img, index) in safeImages"
            :key="`progress-${index}`"
            class="progress-segment"
            :class="{ 'is-active': currentImageIndex === index }"
            :style="{ width: progressBarWidth + 'px' }"
          >
            <span
              class="progress-segment-fill"
              :style="{ width: index === currentImageIndex ? progressBarFill + '%' : '0%' }"
            ></span>
          </span>
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
            <q-btn
              round
              flat
              dense
              class="iconBtn"
              :icon="'img:/assets/icons/post/icon-heart.svg'"
              @click="handleLike"
            />
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
          <button class="primaryCtaBtn" @click="openContributeSheet">
            <div class="primaryCtaMain">CONTRIBUTE</div>
          </button>
        </div>
        <div class="postDetail-rewardRow">
          <q-icon
            class="postDetail-rewardIcon"
            :name="'img:/assets/icons/ui/icon-reward.svg'"
          />
          <span class="postDetail-rewardLabel">Reward:</span>
          <span class="postDetail-rewardValue">
            {{ displayTokens }} tokens
          </span>
    </div>

      <!-- ABOUT DREAM/PROBLEM/IDEA -->
      <div class="aboutPost">
        <h2>{{ aboutSectionTitle }}</h2>
          <p>{{ post.description }}</p>
      </div>

        <!-- ABOUT AUTHOR -->
        <div class="aboutAuthor">
        <h2>About Author</h2>

          <div
            class="authorCard"
            role="button"
            tabindex="0"
            @click="goToAuthorProfile"
            @keyup.enter="goToAuthorProfile"
          >
          <img
              :src="displayAuthorAvatar"
            class="authorAvatar"
              alt="Author avatar"
          />
          <div class="authorInfo">
              <p class="authorName">{{ displayAuthorName }}</p>
              <p class="authorRole">{{ displayAuthorLocation }}</p>
            </div>
          </div>

          <p v-for="(paragraph, idx) in doneeInfo.description" :key="`author-story-${idx}`" class="authorStory">
            {{ paragraph }}
          </p>
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
          <button class="contributeSheet-btn tertiary" @click="onContributeOption('topup')">
            TOP UP THE DREAM
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
            :src="safeImages[lightboxImageIndex]"
            :alt="`Image ${lightboxImageIndex + 1}`"
            class="lightbox-image"
          />
          <div class="lightbox-nav">
            <q-btn
              v-if="safeImages.length > 1"
              flat
              round
              dense
              icon="chevron_left"
              class="lightbox-nav-btn"
              @click="previousLightboxImage"
            />
            <q-btn
              v-if="safeImages.length > 1"
              flat
              round
              dense
              icon="chevron_right"
              class="lightbox-nav-btn"
              @click="nextLightboxImage"
            />
          </div>
          <div class="lightbox-indicator" v-if="safeImages.length > 1">
            {{ lightboxImageIndex + 1 }} / {{ safeImages.length }}
          </div>
        </div>
      </q-card>
    </q-dialog>
  </div>

</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch } from "vue";
import { usePostsStore } from "src/stores/posts";
import { useRoute, useRouter } from "vue-router";
import ImageIndexSlider from "src/components/partials/ImageIndexSlider.vue";
import AppSplash from "src/components/common/AppSplash.vue";
import { useEdgeSwipeBack } from "src/composables/useEdgeSwipeBack";
import { getCategoryDisplayName } from "src/data/categoryNames";

// Get post type icon (dream_mini.svg, problem_mini.svg, idea_mini.svg)
const getPostTypeIcon = (type: string | null | undefined): string => {
  const typeMap: Record<string, string> = {
    dream: "/post_icons/dream_mini.svg",
    problem: "/post_icons/problem_mini.svg",
    idea: "/post_icons/idea_mini.svg"
  };
  return typeMap[type?.toLowerCase() || ""] || "/post_icons/dream_mini.svg";
};

// Enable swipe-back gesture
useEdgeSwipeBack();

const postsStore = usePostsStore();
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
const currentImageIndex = ref(0);
const progressBarFill = ref(0);
const autoSlideInterval = ref<number | null>(null);
const progressIntervalId = ref<number | null>(null);
const isLightboxOpen = ref(false);
const lightboxImageIndex = ref(0);
const isMounted = ref(false);

const doneeInfo = {
  name: "Mackenzie Doe",
  role: "Reykjavík",
  avatar: "/images/Auth/profilePicture.jpeg",
  description: [
    "Mackenzie leads local teens on their first northern lights adventures, mixing science, art, and community storytelling to spark curiosity.",
    "Your support keeps the campfires bright, the cocoa warm, and every night under the aurora full of wonder."
  ]
};

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
  // TODO: BE ešte neposiela author_picture/avatar - keď bude, pridať:
  // return post.value?.author_picture || post.value?.author_avatar_url || doneeInfo.avatar;
  return doneeInfo.avatar;
});

// Computed property to get author location for "About Author" section
const displayAuthorLocation = computed(() => {
  // TODO: BE ešte neposiela location - keď bude, pridať:
  // return post.value?.location || post.value?.author_location || "Unknown";
  const roleParts = doneeInfo.role.split("•");
  if (roleParts.length > 1) {
    return roleParts[1].trim();
  }
  return "Reykjavík";
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
    dream: "About Dream",
    problem: "About Problem",
    idea: "About Idea"
  };
  return titles[type] || "About Dream";
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
    if (newId) {
      const id = Number(newId);
      if (!Number.isNaN(id)) {
        // Reset image index when loading new post
        currentImageIndex.value = 0;
        progressBarFill.value = 0;
        pauseAutoSlide();
        await loadPost(id);
      }
    }
  },
  { immediate: false }
);

onMounted(async () => {
  isMounted.value = true;
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
  console.log("🎯 PostDetail mounted - using window as scroll target");
  console.log("📍 Initial scroll position:", readScrollPosition());

  attachScrollListener(window);
  handleScroll();

  // Reset image index when post loads
  currentImageIndex.value = 0;
  progressBarFill.value = 0;

  // Start auto-slide for images if we have multiple images
  await nextTick();
  console.log("🖼️ Safe images:", safeImages.value);
  console.log("🖼️ Safe images length:", safeImages.value.length);
  if (safeImages.value.length > 1 && isMounted.value) {
    startAutoSlide();
  }
});

onBeforeUnmount(() => {
  isMounted.value = false;
  pauseAutoSlide();
  cleanupFns.forEach((fn) => fn());
});

const safeImages = computed(() => {
  const p = post.value;
  if (!p) return ["/images/Auth/postBackground.png"];

  const images = p.images || [];

  // Filter out invalid images
  const validImages = images.filter(
    (img) =>
      img &&
      typeof img === "string" &&
      !["NULL", "{NULL}"].includes(img.trim())
  );

  // If we have valid images, use them
  if (validImages.length > 0) {
    return validImages;
  }

  // Fallback: If no images found, use default
  return ["/images/Auth/postBackground.png"];
});

const progressBarWidth = computed(() => {
  const count = safeImages.value.length;
  if (count === 0) return 0;
  const totalGap = (count - 1) * 6; // 6px gap between segments
  const totalPadding = 24; // 12px left + 12px right
  return (window.innerWidth - totalPadding - totalGap) / count;
});

const handleImageIndexChange = (index: number) => {
  currentImageIndex.value = index;
  progressBarFill.value = 0;
  resetAutoSlide();
};

const openLightbox = (index: number) => {
  lightboxImageIndex.value = index;
  isLightboxOpen.value = true;
  pauseAutoSlide();
};

const previousLightboxImage = () => {
  if (lightboxImageIndex.value > 0) {
    lightboxImageIndex.value--;
  } else {
    lightboxImageIndex.value = safeImages.value.length - 1;
  }
};

const nextLightboxImage = () => {
  if (lightboxImageIndex.value < safeImages.value.length - 1) {
    lightboxImageIndex.value++;
  } else {
    lightboxImageIndex.value = 0;
  }
};

const startAutoSlide = () => {
  if (safeImages.value.length <= 1 || !isMounted.value) return;

  pauseAutoSlide();

  // Reset progress bar
  progressBarFill.value = 0;
  const progressDuration = 5000; // 5 seconds
  const progressInterval = 50; // Update every 50ms
  const progressStep = (100 / progressDuration) * progressInterval;

  progressIntervalId.value = window.setInterval(() => {
    if (!isMounted.value) {
      pauseAutoSlide();
      return;
    }
    try {
      if (progressBarFill.value < 100) {
        progressBarFill.value = Math.min(progressBarFill.value + progressStep, 100);
      }
    } catch (error) {
      // Component might be unmounting, stop the interval
      pauseAutoSlide();
    }
  }, progressInterval);

  autoSlideInterval.value = window.setInterval(() => {
    if (!isMounted.value) {
      pauseAutoSlide();
      return;
    }
    try {
      if (safeImages.value.length > 1) {
        if (currentImageIndex.value < safeImages.value.length - 1) {
          currentImageIndex.value++;
        } else {
          currentImageIndex.value = 0;
        }
        progressBarFill.value = 0;
      }
    } catch (error) {
      // Component might be unmounting, stop the interval
      pauseAutoSlide();
    }
  }, progressDuration);
};

const pauseAutoSlide = () => {
  if (autoSlideInterval.value) {
    clearInterval(autoSlideInterval.value);
    autoSlideInterval.value = null;
  }
  if (progressIntervalId.value) {
    clearInterval(progressIntervalId.value);
    progressIntervalId.value = null;
  }
};

const resetAutoSlide = () => {
  pauseAutoSlide();
  startAutoSlide();
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
  // TODO: BE ešte neposiela location údaje - keď bude, pridať:
  // return p.location || p.location_city || p.location_country || "Unknown";
  return "Iceland, Reykjavík"; // Placeholder until BE provides location data
});

const viewsCount = computed(() => {
  return post.value?.views ?? 0;
});

const goToAuthorProfile = () => {
  // TODO: BE ešte neposiela author_id/user_id - keď bude, pridať:
  // const authorId = post.value?.author_id || post.value?.user_id;
  // if (authorId) {
  //   router.push({
  //     name: "author-profile",
  //     params: { authorId }
  //   });
  // }
  console.warn("TODO: Navigate to author profile when BE provides author_id");
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

const handleShare = async () => {
  const shareData = {
    title: post.value?.title ?? "dreamhubb",
    text: post.value?.description ?? "",
    url: currentPostUrl.value
  };

  try {
    if (navigator.share) {
      await navigator.share(shareData);
    } else if (navigator.clipboard?.writeText) {
      await navigator.clipboard.writeText(currentPostUrl.value);
      console.log("Post link copied to clipboard:", currentPostUrl.value);
    } else {
      console.log("Share:", shareData);
    }
  } catch (error) {
    console.error("Share failed", error);
  }
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
  isContributeSheetOpen.value = true;
};

const closeContributeSheet = () => {
  isContributeSheetOpen.value = false;
};

const onContributeOption = (option: ContributeOption | string) => {
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
    default:
      console.log("TODO: ďalšie typy contribute option", option);
      break;
  }

  closeContributeSheet();
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
