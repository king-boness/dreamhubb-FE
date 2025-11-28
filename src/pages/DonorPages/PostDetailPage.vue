<template>
  <div class="postDetail" v-if="post">
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
            <q-icon
              class="postDetail-categoryIcon"
              :name="'img:/assets/icons/ui/icon-category-general.svg'"
            />
            <span class="postDetail-categoryText">
              {{ post.category_name || "Aurora Expedition" }}
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

      <!-- ABOUT DREAM -->
      <div class="aboutPost">
        <h2>About Dream</h2>
          <p>{{ post.description }}</p>
          <p v-for="(paragraph, idx) in aboutDreamParagraphs" :key="`dream-${idx}`">
            {{ paragraph }}
          </p>

          <button
            type="button"
            class="postDetail-reportBtn"
            @click="handleReportDream"
          >
            <q-icon
              class="postDetail-reportIcon"
              :name="'img:/assets/icons/ui/icon-report.svg'"
            />
            <span>REPORT A DREAM</span>
          </button>
      </div>

        <!-- ABOUT AUTHOR / DREAMER -->
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

          <p class="authorLead">
            Dreamer · Reykjavík — obsessed with northern lights and community joy.
          </p>
          <p v-for="(paragraph, idx) in doneeInfo.description" :key="`author-story-${idx}`" class="authorStory">
            {{ paragraph }}
          </p>
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

  <!-- LOADER (fallback) -->
  <template v-else>
    <AppSplash />
  </template>
</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch } from "vue";
import { useApiCallStore, type FullPost } from "src/stores/api-calls-store";
import { useRoute, useRouter } from "vue-router";
import ImageIndexSlider from "src/components/partials/ImageIndexSlider.vue";
import AppSplash from "src/components/common/AppSplash.vue";
import { useEdgeSwipeBack } from "src/composables/useEdgeSwipeBack";

// Enable swipe-back gesture
useEdgeSwipeBack();

const api = useApiCallStore();
const route = useRoute();
const router = useRouter();

type ContributeOptionType = "tokens" | "share" | "mentoring" | "other";

interface ContributeOption {
  id: string | number;
  type: ContributeOptionType;
  label: string;
}

interface PostDetail extends FullPost {
  commentsCount?: number;
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
const post = ref<PostDetail | null>(null);
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
const additionalImages = ref<string[]>([]);
const isMounted = ref(false);

const aboutDreamParagraphs = [
  "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim.",
  "Aliquam posuere purus pellentesque ipsum imperdiet ut sociis eget egestas pharetra. At nisl nisl lectus enim egestas diam elementum euismod dui.",
  "Cursus quis et proin quis ut a sit. Nisi massa aenean turpis risus libero amet aliquam."
];

const doneeInfo = {
  name: "Mackenzie Doe",
  role: "Dreamer • Reykjavík",
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

// Computed property to get token value - prioritize tokenReward from query params (from feed) over API value
const displayTokens = computed(() => {
  // Priority 1: Get tokenReward from query params (passed from PostsPage)
  const tokenRewardFromQuery = route.query.tokenReward;
  if (tokenRewardFromQuery && typeof tokenRewardFromQuery === "string") {
    const parsed = Number.parseInt(tokenRewardFromQuery, 10);
    if (!Number.isNaN(parsed)) {
      return parsed;
    }
  }

  // Priority 2: Get tokens from post (API value)
  if (post.value?.tokens !== undefined && post.value.tokens !== null) {
    return post.value.tokens;
  }

  // Fallback
  return 0;
});

// Computed property to get title - prioritize dreamTitle from query params (from feed) over API value
const displayTitle = computed(() => {
  // Priority 1: Get dreamTitle from query params (passed from PostsPage)
  const dreamTitleFromQuery = route.query.dreamTitle;
  if (typeof dreamTitleFromQuery === "string" && dreamTitleFromQuery.trim() !== "") {
    return dreamTitleFromQuery;
  }

  // Priority 2: Get title from post (API value)
  return post.value?.title ?? "";
});

// Computed property to get date - prioritize createdAt from query params (from feed) over API value
const displayDate = computed(() => {
  // Priority 1: Get createdAt from query params (passed from PostsPage)
  const createdAtFromQuery = route.query.createdAt;
  if (typeof createdAtFromQuery === "string" && createdAtFromQuery.trim() !== "") {
    // Format date from MM/DD/YYYY (from feed) to DD.MM.YYYY (Slovak format for detail page)
    const dateParts = createdAtFromQuery.split("/");
    if (dateParts.length === 3) {
      const [month, day, year] = dateParts;
      return `${day}.${month}.${year}`;
    }
    return createdAtFromQuery;
  }

  // Priority 2: Get formatted date from post (API value)
  return formattedDate.value;
});

// Computed property to get location - prioritize location from query params (from feed) over API value
const displayLocation = computed(() => {
  // Priority 1: Get location from query params (passed from PostsPage)
  const locationFromQuery = route.query.location;
  if (typeof locationFromQuery === "string" && locationFromQuery.trim() !== "") {
    return locationFromQuery;
  }

  // Priority 2: Get location from post (API value)
  return locationLabel.value;
});

// Computed property to get author name - prioritize authorName from query params (from feed) over API value
const displayAuthorName = computed(() => {
  // Priority 1: Get authorName from query params (passed from PostsPage)
  const authorNameFromQuery = route.query.authorName;
  if (typeof authorNameFromQuery === "string" && authorNameFromQuery.trim() !== "") {
    return authorNameFromQuery;
  }

  // Priority 2: Get author_name from post (API value)
  return post.value?.author_name ?? "";
});

// Computed property to get author avatar - prioritize authorAvatarUrl from query params (from feed) over API value
const displayAuthorAvatar = computed(() => {
  // Priority 1: Get authorAvatarUrl from query params (passed from PostsPage)
  const authorAvatarUrlFromQuery = route.query.authorAvatarUrl;
  if (typeof authorAvatarUrlFromQuery === "string" && authorAvatarUrlFromQuery.trim() !== "") {
    return authorAvatarUrlFromQuery;
  }

  // Priority 2: Get avatar from doneeInfo (fallback)
  return doneeInfo.avatar;
});

// Computed property to get author location for "About Author" section - prioritize location from query params
const displayAuthorLocation = computed(() => {
  // Priority 1: Get location from query params (passed from PostsPage)
  const locationFromQuery = route.query.location;
  if (typeof locationFromQuery === "string" && locationFromQuery.trim() !== "") {
    return locationFromQuery;
  }

  // Priority 2: Extract location from doneeInfo.role or use default
  const roleParts = doneeInfo.role.split("•");
  if (roleParts.length > 1) {
    return roleParts[1].trim();
  }
  return "Reykjavík";
});

onMounted(async () => {
  isMounted.value = true;
  const id = Number(route.params.id);
  post.value = await api.getPostById(id);

  // Debug: log post data to see what we're getting
  if (process.env.NODE_ENV === "development") {
    console.log("📦 Post data:", post.value);
    console.log("🖼️ Images array:", post.value?.images);
    const postAny = post.value as unknown as Record<string, unknown>;
    console.log("🖼️ ImageUrl:", typeof postAny?.imageUrl === "string" ? postAny.imageUrl : null);
  }

  // Generate additional images if needed
  const imageUrlFromQuery = route.query.imageUrl as string;
  const postAny = post.value as unknown as Record<string, unknown>;
  const imageUrlFromPost = (typeof postAny?.imageUrl === "string" ? postAny.imageUrl : null) ||
    (typeof postAny?.image_url === "string" ? postAny.image_url : null) ||
    (typeof postAny?.main_image === "string" ? postAny.main_image : null);
  const imageUrl = imageUrlFromQuery || imageUrlFromPost;

  if (imageUrl && typeof imageUrl === "string") {
    try {
      const urlParts = imageUrl.split("/seed/");
      if (urlParts.length > 1) {
        const baseUrl = urlParts[0] || "https://picsum.photos";
        const seedMatch = imageUrl.match(/\/seed\/([^/]+)/);
        if (seedMatch) {
          const baseSeed = seedMatch[1].split("/")[0];
          const additionalSeeds = ["mountain", "ocean", "forest", "desert", "city", "nature"];
          const generated: string[] = [];
          for (let i = 0; i < additionalSeeds.length; i++) {
            const newSeed = additionalSeeds[i];
            const newImageUrl = `${baseUrl}/seed/${baseSeed}-${newSeed}/800/600`;
            if (newImageUrl !== imageUrl && !generated.includes(newImageUrl)) {
              generated.push(newImageUrl);
            }
          }
          additionalImages.value = generated;
        }
      }
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Error generating additional images:", error);
      }
    }
  }

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

  // Priority 1: Get imageUrl from route query (passed from PostsPage) - this ensures same image as on feed
  const imageUrlFromQuery = route.query.imageUrl as string;

  // Priority 2: Get imageUrl from post (used on PostsPage) - check multiple possible fields
  const postAny = p as unknown as Record<string, unknown>;
  const imageUrlFromPost = (typeof postAny?.imageUrl === "string" ? postAny.imageUrl : null) ||
    (typeof postAny?.image_url === "string" ? postAny.image_url : null) ||
    (typeof postAny?.main_image === "string" ? postAny.main_image : null);

  // Use query param first (most reliable), then post field
  const imageUrl = imageUrlFromQuery || imageUrlFromPost;
  const images = p.images || [];

  // Debug: log what we're getting
  if (process.env.NODE_ENV === "development") {
    console.log("🖼️ Computing safeImages - imageUrlFromQuery:", imageUrlFromQuery, "imageUrlFromPost:", imageUrlFromPost, "final imageUrl:", imageUrl, "images:", images);
  }

  let result: string[] = [];

  // Priority 1: If imageUrl exists (from query or post), use it as first image (this matches PostsPage)
  if (imageUrl && typeof imageUrl === "string" && !["NULL", "{NULL}"].includes(imageUrl.trim())) {
    result.push(imageUrl);
  }

  // Priority 2: If no imageUrl, use first image from images array
  if (result.length === 0 && Array.isArray(images) && images.length > 0) {
    const firstValidImage = images[0];
    if (firstValidImage && typeof firstValidImage === "string" && !["NULL", "{NULL}"].includes(firstValidImage.trim())) {
      result.push(firstValidImage);
    }
  }

  // Priority 3: Add remaining images from images array (avoid duplicates)
  if (Array.isArray(images) && images.length > 0) {
    const filteredImages = images.filter(
      (img, idx) => {
        // Skip first image if we already added it
        if (result.length > 0 && idx === 0 && img === result[0]) {
          return false;
        }
        // Skip if it's the same as imageUrl
        if (imageUrl && img === imageUrl) {
          return false;
        }
        return img &&
          typeof img === "string" &&
          !["NULL", "{NULL}"].includes(img.trim());
      }
    );
    result = [...result, ...filteredImages];
  }

  // Priority 4: Add additional images if we have less than 4
  if (result.length > 0 && result.length < 4 && additionalImages.value.length > 0) {
    const needed = 4 - result.length;
    const toAdd = additionalImages.value.slice(0, needed).filter(img => !result.includes(img));
    result = [...result, ...toAdd];
  }

  // Fallback: If still no images found, use fallback
  if (result.length === 0) {
    return ["/images/Auth/postBackground.png"];
  }

  if (process.env.NODE_ENV === "development") {
    console.log("🖼️ Final safeImages:", result);
  }

  return result;
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
  if (!p) return "";
  // TODO: typovať podľa API
  const postAny = p as unknown as Record<string, unknown>;
  const country = typeof postAny.country === "string" ? postAny.country : null;
  const city = typeof postAny.city === "string" ? postAny.city : null;
  const locationLabel = typeof postAny.locationLabel === "string" ? postAny.locationLabel : null;
  return locationLabel ?? ([country, city].filter(Boolean).join(", ") || "Iceland, Reykjavík");
});

const viewsCount = computed(() => {
  const p = post.value;
  if (!p) return 0;
  // TODO: typovať podľa API
  const postAny = p as unknown as Record<string, unknown>;
  const views = typeof postAny.views === "number" ? postAny.views : null;
  const viewCount = typeof postAny.viewCount === "number" ? postAny.viewCount : null;
  return views ?? viewCount ?? p.views ?? 0;
});

const goToAuthorProfile = () => {
  // TODO: Get authorId from post data when available
  // Currently FullPost only has author_name, not author.id
  const postAny = post.value as unknown as Record<string, unknown>;
  const author = postAny?.author as unknown as Record<string, unknown> | undefined;
  const authorIdFromAuthor = author && typeof author.id === "number" ? author.id : null;
  const authorIdFromPost = typeof postAny?.author_id === "number" ? postAny.author_id : null;
  const authorId = authorIdFromAuthor || authorIdFromPost;
  if (!authorId) {
    console.warn("Chýba authorId, nedá sa otvoriť profil autora");
    // TODO: navigate to author profile when authorId is available in API response
    return;
  }
  router.push({
    name: "author-profile", // TODO: predpokladaná budúca route
    params: { authorId }
  });
};

const handleClose = () => {
  if (window.history.length > 1) {
    router.back();
    return;
  }
  router.push({ name: "donor-posts" });
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
  (post) => {
    if (post) {
      const postAny = post as unknown as Record<string, unknown>;
      const likesCountValue = typeof postAny.likesCount === "number" ? postAny.likesCount : null;
      const likesValue = typeof postAny.likes === "number" ? postAny.likes : null;
      likesCount.value = likesCountValue ?? likesValue ?? null;
      isLiked.value = typeof postAny.isLiked === "boolean" ? postAny.isLiked : false;
      commentsCount.value = typeof postAny.commentsCount === "number" ? postAny.commentsCount : null;
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
