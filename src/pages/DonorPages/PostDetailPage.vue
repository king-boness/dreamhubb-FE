<template>
  <!-- Loading state -->
  <div v-if="loading" class="postDetail-loading">
    <AppSplash />
  </div>

  <!-- Error state -->
  <div v-else-if="error" class="postDetail-error" data-testid="dh-post-detail-error">
    <div class="postDetail-errorContent">
      <h2>Unable to load this post</h2>
      <p>{{ error }}</p>
      <div class="postDetail-errorActions">
        <button class="primaryCtaBtn" @click="handleRetry" data-testid="dh-post-detail-retry">
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
  <div v-else class="postDetail" data-testid="dh-post-detail-container">
    <!-- TOP IMAGE - Full-bleed hero (outside postDetail-inner for full width) -->
    <div class="postDetailBg">
        <PostHeader
          :images="post?.images || []"
          :cover-image="coverImage"
          :post-type="post?.type || null"
          :icon-url="categoryIcon"
          icon-placement="center"
          :auto-slide="true"
          :show-progress="true"
          :show-arrows="true"
          :show-dots="true"
          :image-wrapper-style="heroStyle"
          :image-style="{ cursor: 'pointer' }"
          :title="displayTitle"
          :date="displayDate"
          :location="displayLocation"
          :views="viewsCount"
          :category-name="categoryDisplayName"
          :category-icon="categoryIcon"
          :is-liked="isLiked"
          @close="handleClose"
          @share="handleShare"
          @like="handleLike"
          @image-click="openLightbox"
        />

        <!-- COMMENT ICON / BACK BUTTON (bottom right) -->
        <div class="postDetail-commentWrapper">
          <!-- Back button when comments are shown -->
          <transition name="comment-icon-switch" mode="out-in">
            <q-btn
              v-if="showComments"
              key="back"
              round
              flat
              dense
              class="postDetail-commentBtn postDetail-commentBtn--back"
              icon="chevron_left"
              @click="handleComments"
            />
            <!-- Comment icon when comments are hidden -->
            <div v-else key="comment" class="postDetail-commentBtn-wrapper">
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
          </transition>
        </div>
      </div>

    <!-- Rest of content inside postDetail-inner -->
    <div class="postDetail-inner">

      <!-- BODY CONTENT -->
      <div class="postDetailContent">

        <!-- CTA BUTTON -->
        <div class="postCTA">
          <button
            v-if="!isAuthor"
            class="primaryCtaBtn"
            :disabled="postsStore.donateLoading"
            @click="openContributeSheet"
          >
            <div class="primaryCtaMain">
              {{ postsStore.donateLoading ? t("processing") : t("contribute") }}
            </div>
          </button>
          <button
            v-else
            class="primaryCtaBtn"
            @click="handleEditPost"
          >
            <div class="primaryCtaMain">
              {{ t("editMyPost") }}
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

        <!-- Comments Section -->
        <template v-if="showComments">
          <PostComments
            v-if="post?.post_id"
            :post-id="post.post_id"
            :post-owner-id="postOwnerId"
            v-model="activeCommentsTab"
          />
        </template>

        <!-- Original Content (About Dream/Problem/Idea, About Author, Report) -->
        <template v-else>
          <div class="postDetailAbout">
            <!-- A) About {post type} -->
            <section class="postDetailAbout-section">
              <PageTitle :title="aboutTypeTitle" />
              <p class="postDetailAbout-text">
                {{ post.description }}
              </p>
            </section>

            <div class="postDetailAbout-separator" />

            <!-- B) About donee -->
            <section class="postDetailAbout-section postDetailAbout-section--donee">
              <PageTitle :title="t('aboutDonee')" />

              <div
                class="postDetailDoneeCard"
                role="button"
                tabindex="0"
                @click.prevent="goToAuthorProfile"
                @keyup.enter="goToAuthorProfile"
              >
                <div class="postDetailDonee-avatarWrapper" aria-hidden="true">
                  <div v-if="!displayAuthorAvatar" class="postDetailDonee-avatar">
                    <span class="postDetailDonee-avatarInitials">{{ authorInitials }}</span>
                  </div>
                  <img
                    v-else
                    :src="displayAuthorAvatar"
                    alt=""
                    class="postDetailDonee-avatarImg"
                  />
                  <!-- Badge can be added here once BE provides it -->
                </div>

                <h3 class="postDetailDonee-name">{{ displayAuthorName }}</h3>
                <p v-if="displayAuthorLocation" class="postDetailDonee-location">{{ displayAuthorLocation }}</p>
              </div>
            </section>

            <!-- C) Bio -->
            <section v-if="displayAuthorBioText" class="postDetailAbout-section">
              <p class="postDetailAbout-text">
                {{ displayAuthorBioText }}
              </p>
            </section>

            <div v-if="displayAuthorBioText" class="postDetailAbout-separator" />

            <!-- Report a post -->
            <div class="postDetail-reportSection">
              <button
                type="button"
                class="postDetail-reportCta"
                @click="handleReportDream"
              >
                <img
                  src="/other_icons/report.svg"
                  alt=""
                  class="postDetail-reportIcon"
                />
                <span>{{ t("reportPost") }}</span>
              </button>
            </div>
          </div>
        </template>

      </div>
    </div>
    <!-- Teleport to body so position:fixed is relative to viewport (layout/transform ancestors would break it on iOS) -->
    <Teleport to="body">
      <transition name="sheet-fade">
        <div
          v-if="isContributeSheetOpen"
          class="contributeSheet-backdrop contributeSheet-portal"
          @click.self="closeContributeSheet"
        >
          <div class="contributeSheet">
            <div
              class="contributeSheet-inner"
              :class="{ dragging: contributeIsDragging }"
              :style="{ transform: `translateY(${contributeDragOffset}px)` }"
              @touchstart.passive="onContributeTouchStart"
              @touchmove.passive="onContributeTouchMove"
              @touchend.passive="onContributeTouchEnd"
              @mousedown="onContributeMouseDown"
            >
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
                @click="openTopUpModal"
              >
                {{ postsStore.donateLoading ? t("processing") : t("topUpThePost") }}
              </button>
            </div>
          </div>
        </div>
      </transition>
    </Teleport>

    <!-- Image Preview Modal -->
    <ImagePreviewModal
      v-model="isLightboxOpen"
      :images="post?.images || []"
      :initial-index="lightboxInitialIndex"
    />

    <!-- Share Post Sheet -->
    <ShareProfileSheet
      v-model="isShareSheetOpen"
      :profile-url="currentPostUrl"
      :profile-title="sharePostTitle"
      :profile-text="sharePostText"
      :post-type="(normalizedPost?.category?.slug as 'dream' | 'problem' | 'idea' | null) || null"
    />

    <!-- Top Up Post Modal -->
    <transition name="sheet-fade">
      <div
        v-if="isTopUpModalOpen"
        class="contributeSheet-backdrop"
        @click.self="closeTopUpModal"
      >
        <div
          class="contributeSheet topUpModal"
          :class="{ dragging: topUpIsDragging }"
          :style="{ transform: `translateY(${topUpDragOffset}px)` }"
          @touchstart.passive="onTopUpTouchStart"
          @touchmove.passive="onTopUpTouchMove"
          @touchend.passive="onTopUpTouchEnd"
          @mousedown="onTopUpMouseDown"
        >
          <div class="contributeSheet-handle"></div>
          <h2 class="contributeSheet-title">{{ t("topUpThePost") }}</h2>

          <!-- Tokens Input + Slider -->
          <div class="topUpModal-content">
            <div class="topUpModal-inputWrapper">
              <label class="topUpModal-label">{{ t("tokensToAdd") }}</label>
              <q-input
                v-model.number="selectedTokens"
                type="number"
                :min="1"
                :max="maxTokens"
                dark
                outlined
                class="topUpModal-input"
                :error="hasTokenError"
                :error-message="tokenErrorMessage"
                @update:model-value="handleTokenInputChange"
              >
                <template #append>
                  <q-icon name="img:/icons/karma-icon.svg" />
                </template>
              </q-input>
            </div>

            <div class="topUpModal-sliderWrapper">
              <q-slider
                v-model="selectedTokens"
                :min="1"
                :max="maxTokens"
                :step="1"
                :disable="maxTokens <= 0"
                track-color="brand"
                class="topUpModal-slider"
                @update:model-value="handleSliderChange"
              />
            </div>

            <div class="topUpModal-info">
              <span class="topUpModal-balance">
                {{ t("funds") }}: {{ remainingTokens }} tokens
              </span>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="topUpModal-actions">
            <button
              class="contributeSheet-btn secondary"
              @click="closeTopUpModal"
              :disabled="postsStore.donateLoading"
            >
              {{ t("cancel") }}
            </button>
            <button
              class="contributeSheet-btn primary"
              :disabled="!canDonate || postsStore.donateLoading"
              @click="handleConfirmDonate"
            >
              {{ postsStore.donateLoading ? t("processing") : t("contribute") }}
            </button>
          </div>
        </div>
      </div>
    </transition>
  </div>

</template>

<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount, computed, nextTick, watch } from "vue";
import { useI18n } from "vue-i18n";
import { getLocationLabel } from "src/utils/cityNames";
import { usePostsStore, type PostDetail } from "src/stores/posts";
import { useAuthStore } from "src/stores/auth";
import { usePreferencesStore } from "src/stores/preferences";
import { useNotificationsStore } from "src/stores/notifications";
import { clearIdempotencyKey, getOrCreateIdempotencyKey } from "src/utils/idempotency";
import { useRoute, useRouter } from "vue-router";
import AppSplash from "src/components/common/AppSplash.vue";
import PostHeader from "src/components/post/PostHeader.vue";
import ShareProfileSheet from "src/components/profile/ShareProfileSheet.vue";
import ImagePreviewModal from "src/components/common/ImagePreviewModal.vue";
import PostComments from "src/components/post/PostComments.vue";
import { useEdgeSwipeBack } from "src/composables/useEdgeSwipeBack";
import { normalizePost } from "src/utils/normalizePost";
import { useRemainingFunds } from "src/composables/useRemainingFunds";
import { getPostTypeIcon } from "src/utils/postIcons";
import { getUserAvatarUrl, getUserInitials } from "src/utils/avatar";
import { formatSubcategoryLabel } from "src/utils/formatSubcategoryLabel";
import PageTitle from "src/components/ui/PageTitle.vue";
import { notifyError, notifySuccess } from "src/utils/notify";
import { mapAxiosErrorToDhError } from "src/utils/httpError";
import { useCommentsStore } from "src/stores/comments";
import { api } from "boot/axios";

const { t, locale } = useI18n();

// Enable swipe-back gesture
useEdgeSwipeBack();

// Helper computed properties for category display (using normalized post)
const categoryDisplayName = computed(() => {
  const norm = normalizedPost.value;
  if (!norm?.subcategory?.slug) {
    const translated = t("subcategories.other") || "Other";
    return formatSubcategoryLabel(translated);
  }
  // Use i18n key: subcategories.traveling, subcategories.health, etc.
  const i18nKey = `subcategories.${norm.subcategory.slug}`;
  const translated = t(i18nKey);
  // If translation doesn't exist, return capitalized slug, then apply formatSubcategoryLabel
  const finalText = translated !== i18nKey ? translated : norm.subcategory.slug.charAt(0).toUpperCase() + norm.subcategory.slug.slice(1);
  return formatSubcategoryLabel(finalText);
});

const categoryIcon = computed(() => {
  const norm = normalizedPost.value;
  if (!norm?.category?.slug) {
    return "/post_icons/dream_mini.svg";
  }
  return getPostTypeIcon(norm.category.slug);
});

const postsStore = usePostsStore();
const authStore = useAuthStore();
const preferencesStore = usePreferencesStore();
const notificationsStore = useNotificationsStore();
const commentsStore = useCommentsStore();
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

const isLiked = ref(false);
const likesCount = ref<number | null>(null);
const isSaved = ref(false);
const commentsCount = ref<number | null>(null);
const isContributeSheetOpen = ref(false);
const isLightboxOpen = ref(false);
const lightboxInitialIndex = ref(0);
const isShareSheetOpen = ref(false);
const isTopUpModalOpen = ref(false);
const selectedTokens = ref(10);
const showComments = ref(false);
const activeCommentsTab = ref<"help" | "accomplish">("help");
let errorTimeoutId: ReturnType<typeof setTimeout> | null = null;

// Swipe-down gesture state for contribute sheet
const contributeTouchStartY = ref<number | null>(null);
const contributeDragOffset = ref(0);
const contributeIsDragging = ref(false);

// Swipe-down gesture state for top up modal
const topUpTouchStartY = ref<number | null>(null);
const topUpDragOffset = ref(0);
const topUpIsDragging = ref(false);

/** Po návrate z feedu môže byť window scroll > 0; pred prvým vykreslením hero zarovnať hore. */
const resetHeroScrollState = () => {
  try {
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
  } catch {
    window.scrollTo(0, 0);
  }
};

const heroStyle = computed(() => ({}));

// Computed properties from store
const post = computed(() => postsStore.currentPost);

// Normalize post data to ensure category and subcategory objects exist
const normalizedPost = computed(() => {
  const p = post.value;
  if (!p) return null;
  return normalizePost(p as Parameters<typeof normalizePost>[0]);
});

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
  const p = post.value;
  if (!p) return null;
  const postData = p as PostDetail & {
    user?: { profile_picture?: string | null };
    author_picture?: string | null;
    authorAvatarUrl?: string | null;
  };
  // Use unified avatar utility function
  const avatarUrl = getUserAvatarUrl(
    postData.user || undefined,
    {
      author_picture: postData.author_picture || null,
      authorAvatarUrl: postData.authorAvatarUrl || null,
      user: postData.user || undefined
    }
  );

  // No debug logs here (avatar fields can contain PII)

  // Return avatar URL or null (we'll show initials in the template if null)
  return avatarUrl;
});

const authorId = computed(() => {
  // BE now sends user_id directly in response
  const p = post.value;
  if (!p) return null;
  const postData = p as PostDetail & { user_id?: number; author_id?: number; user?: { id?: number } };
  const id = (postData.user_id || postData.author_id || postData.user?.id || null) as number | null;
  return id;
});

// Computed property to get author location for "About Author" section
const displayAuthorLocation = computed(() => {
  const p = post.value;
  if (!p) return "Unknown";
  return getLocationLabel(p, locale.value as string) || "Unknown";
});

const authorInitials = computed(() => getUserInitials(displayAuthorName.value));

// Post owner ID for reply functionality
const postOwnerId = computed(() => {
  const p = post.value;
  if (!p) return null;
  const postData = p as PostDetail & { user_id?: number; author_id?: number; user?: { id?: number } };
  return (postData.user_id || postData.author_id || postData.user?.id || null) as number | null;
});

// Check if current user is the author of the post
const isAuthor = computed(() => {
  const p = post.value;
  if (!p || !authStore.user?.id) return false;
  const postData = p as PostDetail & { user_id?: number; author_id?: number; user?: { id?: number } };
  const ownerId = postData.user_id || postData.author_id || postData.user?.id || null;
  return ownerId === authStore.user.id;
});

// Computed property to get post category (dream/problem/idea) - using new API
const postType = computed(() => {
  const norm = normalizedPost.value;
  if (!norm) return "dream"; // Default fallback
  return norm.category?.slug || "dream";
});

const getPostTypeLowerLabel = (type: string): "dream" | "problem" | "idea" => {
  if (type === "problem") return "problem";
  if (type === "idea") return "idea";
  return "dream";
};

const aboutTypeTitle = computed(() => {
  const type = getPostTypeLowerLabel(postType.value);

  // EN: "About dream/problem/idea" (type always lowercase)
  if (!locale.value?.toString().startsWith("sk")) {
    return `About ${type}`;
  }

  // SK: keep lowercase type as well
  const skType: Record<typeof type, string> = {
    dream: "sen",
    problem: "problém",
    idea: "nápad"
  };
  return `O ${skType[type]}`;
});

type PublicUserProfile = {
  id: number;
  bio?: string | null;
};

const authorProfile = ref<PublicUserProfile | null>(null);

const displayAuthorBioText = computed(() => {
  const bio =
    authorProfile.value?.bio ||
    // fallback if BE ever embeds it in post payload
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((post.value as any)?.author_bio as string | null | undefined) ||
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    ((post.value as any)?.bio as string | null | undefined) ||
    "";

  const trimmed = typeof bio === "string" ? bio.trim() : "";
  return trimmed;
});

const loadAuthorProfile = async (id: number) => {
  try {
    const { data } = await api.get(`/user/${id}`);
    if (data?.status === "success" && data?.user) {
      authorProfile.value = data.user as PublicUserProfile;
    }
  } catch {
    // ignore (bio will be empty)
  }
};

watch(authorId, async (newId) => {
  if (!newId) {
    authorProfile.value = null;
    return;
  }
  // Avoid refetch if same author already loaded
  if (authorProfile.value?.id === newId) return;
  await loadAuthorProfile(newId);
}, { immediate: true });

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

watch(
  () => route.params.id,
  () => {
    resetHeroScrollState();
  }
);

// Sync body class so DonorMainLayout can hide footer when contribute/top-up sheet is open
watch(
  [isContributeSheetOpen, isTopUpModalOpen],
  ([contribute, topUp]) => {
    if (contribute || topUp) {
      document.body.classList.add("bottom-sheet-open");
    } else {
      document.body.classList.remove("bottom-sheet-open");
    }
  },
  { immediate: true }
);

// Lifecycle hooks
onMounted(async () => {
  // Clear any existing error when mounting
  clearDonateError();

  const id = Number(route.params.id);

  if (Number.isNaN(id)) {
    return;
  }

  await loadPost(id);

  await nextTick();

  // Check for commentType query parameter (from notification click)
  const commentType = route.query.commentType as string | undefined;
  if (commentType === "help" || commentType === "accomplish") {
    // Set active tab based on query param
    activeCommentsTab.value = commentType;
    // Open comments section if post is loaded
    if (post.value && post.value.post_id) {
      showComments.value = true;
      commentsStore.fetchComments(post.value.post_id, true);
    }
  }

  resetHeroScrollState();
});

onBeforeUnmount(() => {
  document.body.classList.remove("bottom-sheet-open");

  // Clear error message and timeout
  clearDonateError();
});

const openLightbox = (imageIndex?: number) => {
  if (post.value?.images && post.value.images.length > 0) {
    lightboxInitialIndex.value = imageIndex ?? 0;
    isLightboxOpen.value = true;
  }
};

const formattedDate = computed(() => {
  if (!post.value?.date_created) return "";
  const d = new Date(post.value.date_created);
  if (Number.isNaN(d.getTime())) return post.value.date_created;
  // Format as DD/MM/YYYY
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();
  return `${day}/${month}/${year}`;
});

const locationLabel = computed(() => {
  const p = post.value;
  if (!p) return "Unknown";
  return getLocationLabel(p, locale.value as string) || "Unknown";
});

const viewsCount = computed(() => {
  return post.value?.views ?? 0;
});

const coverImage = computed(() => {
  const images = post.value?.images || [];
  return images.length > 0 ? images[0] : null;
});

const goToAuthorProfile = () => {
  const targetId = authorId.value;

  // no logs (avoid leaking post/user data)

  if (!targetId) {
    return;
  }

  const currentSide = preferencesStore.currentSide || "donor";

  // If user clicks on their own profile, stay on current side
  if (authStore.user?.id === targetId) {
    if (currentSide === "donee") {
      router.push({ name: "donee-myprofile" });
    } else {
      router.push({ name: "donor-myprofile" });
    }
    return;
  }

  // For other users, keep existing logic on donor side and map to proper profile route on donee side
  // no logs

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

const handleEditPost = () => {
  const postId = post.value?.post_id;
  if (!postId) {
    if (import.meta.env.DEV) {
      console.debug("[PostDetail] Cannot edit: missing post id");
    }
    return;
  }
  // Navigate to edit post page
  router.push({ name: "donee-post-edit", params: { id: String(postId) } });
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
  void postId;
  void like;
  // TODO: implement endpoint when BE is ready
};

const handleLike = async () => {
  const postId = post.value?.post_id;
  if (!postId) {
    if (import.meta.env.DEV) {
      console.debug("[PostDetail] Cannot like: missing post id");
    }
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
    if (import.meta.env.DEV) {
      console.debug("[PostDetail] Failed to update like on server", error);
    }
    isLiked.value = !newValue;
    if (likesCount.value !== null) {
      likesCount.value += newValue ? -1 : 1;
    }
  }
};

const sendSaveToApi = async (postId: number | string, save: boolean) => {
  void postId;
  void save;
  // TODO: implement endpoint when BE is ready
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const handleSave = async () => {
  const postId = post.value?.post_id;
  if (!postId) {
    if (import.meta.env.DEV) {
      console.debug("[PostDetail] Cannot save: missing post id");
    }
    return;
  }

  const newValue = !isSaved.value;
  isSaved.value = newValue;

  try {
    await sendSaveToApi(postId, newValue);
  } catch (error) {
    if (import.meta.env.DEV) {
      console.debug("[PostDetail] Failed to update save on server", error);
    }
    isSaved.value = !newValue;
  }
};

const handleReportDream = () => {
  const postId = post.value?.post_id;
  if (!postId) return;

  router.push({
    name: "donor-post-report",
    params: { id: String(postId) }
  });
};

const handleComments = () => {
  const postId = post.value?.post_id;
  if (!postId) {
    if (import.meta.env.DEV) {
      console.debug("[PostDetail] Missing postId, cannot open comments thread");
    }
    return;
  }

  // Toggle comments mode
  showComments.value = !showComments.value;

  // If opening comments, fetch them (force refresh to get latest)
  if (showComments.value) {
    commentsStore.fetchComments(postId, true);
  }
};

const openContributeSheet = () => {
  // Reset error state when opening sheet
  postsStore.donateError = null;
  isContributeSheetOpen.value = true;
};

const closeContributeSheet = () => {
  isContributeSheetOpen.value = false;
  // Reset drag state
  contributeDragOffset.value = 0;
  contributeIsDragging.value = false;
  contributeTouchStartY.value = null;
};

// Top Up Modal functions
const openTopUpModal = () => {
  // BUG 3: close contribute sheet first so top-up modal is on top and visible
  closeContributeSheet();
  nextTick().then(() => {
    const userTokens = authStore.user?.tokens ?? 0;
    selectedTokens.value = Math.min(10, Math.max(1, userTokens));
    isTopUpModalOpen.value = true;
  });
};

const closeTopUpModal = () => {
  isTopUpModalOpen.value = false;
  // Reset to default when closing
  const userTokens = authStore.user?.tokens ?? 0;
  selectedTokens.value = Math.min(10, Math.max(1, userTokens));
  // Reset drag state
  topUpDragOffset.value = 0;
  topUpIsDragging.value = false;
  topUpTouchStartY.value = null;
};

// Swipe-down handlers for contribute sheet
const onContributeTouchStart = (e: TouchEvent) => {
  contributeTouchStartY.value = e.touches[0]?.clientY ?? null;
  contributeIsDragging.value = true;
};

const onContributeTouchMove = (e: TouchEvent) => {
  if (contributeTouchStartY.value === null) return;
  const currentY = e.touches[0]?.clientY ?? contributeTouchStartY.value;
  const deltaY = currentY - contributeTouchStartY.value;
  // Only allow downward dragging
  if (deltaY > 0) {
    contributeDragOffset.value = deltaY;
  }
};

const onContributeTouchEnd = () => {
  const THRESHOLD = 100; // pixels to trigger close
  if (contributeDragOffset.value > THRESHOLD) {
    closeContributeSheet();
  } else {
    // Snap back
    contributeDragOffset.value = 0;
  }
  contributeIsDragging.value = false;
  contributeTouchStartY.value = null;
};

const onContributeMouseDown = (e: MouseEvent) => {
  contributeTouchStartY.value = e.clientY;
  contributeIsDragging.value = true;

  const onMouseMove = (moveEvent: MouseEvent) => {
    if (contributeTouchStartY.value === null) return;
    const deltaY = moveEvent.clientY - contributeTouchStartY.value;
    if (deltaY > 0) {
      contributeDragOffset.value = deltaY;
    }
  };

  const onMouseUp = () => {
    const THRESHOLD = 100;
    if (contributeDragOffset.value > THRESHOLD) {
      closeContributeSheet();
    } else {
      contributeDragOffset.value = 0;
    }
    contributeIsDragging.value = false;
    contributeTouchStartY.value = null;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
};

// Swipe-down handlers for top up modal
const onTopUpTouchStart = (e: TouchEvent) => {
  topUpTouchStartY.value = e.touches[0]?.clientY ?? null;
  topUpIsDragging.value = true;
};

const onTopUpTouchMove = (e: TouchEvent) => {
  if (topUpTouchStartY.value === null) return;
  const currentY = e.touches[0]?.clientY ?? topUpTouchStartY.value;
  const deltaY = currentY - topUpTouchStartY.value;
  if (deltaY > 0) {
    topUpDragOffset.value = deltaY;
  }
};

const onTopUpTouchEnd = () => {
  const THRESHOLD = 100;
  if (topUpDragOffset.value > THRESHOLD) {
    closeTopUpModal();
  } else {
    topUpDragOffset.value = 0;
  }
  topUpIsDragging.value = false;
  topUpTouchStartY.value = null;
};

const onTopUpMouseDown = (e: MouseEvent) => {
  topUpTouchStartY.value = e.clientY;
  topUpIsDragging.value = true;

  const onMouseMove = (moveEvent: MouseEvent) => {
    if (topUpTouchStartY.value === null) return;
    const deltaY = moveEvent.clientY - topUpTouchStartY.value;
    if (deltaY > 0) {
      topUpDragOffset.value = deltaY;
    }
  };

  const onMouseUp = () => {
    const THRESHOLD = 100;
    if (topUpDragOffset.value > THRESHOLD) {
      closeTopUpModal();
    } else {
      topUpDragOffset.value = 0;
    }
    topUpIsDragging.value = false;
    topUpTouchStartY.value = null;
    document.removeEventListener("mousemove", onMouseMove);
    document.removeEventListener("mouseup", onMouseUp);
  };

  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
};

// Computed properties for Top Up Modal
const userTokensBalance = computed(() => {
  return authStore.user?.tokens ?? 0;
});

const maxTokens = computed(() => {
  return Math.max(0, userTokensBalance.value);
});

// Remaining tokens after spending (using composable)
const { remainingTokens } = useRemainingFunds(
  userTokensBalance,
  selectedTokens
);

const hasTokenError = computed(() => {
  return selectedTokens.value > maxTokens.value || selectedTokens.value < 1;
});

const tokenErrorMessage = computed(() => {
  if (selectedTokens.value > maxTokens.value) {
    return t("youDontHaveEnoughTokens");
  }
  if (selectedTokens.value < 1) {
    return t("pleaseEnterValueBetween", { min: 1, max: maxTokens.value });
  }
  return "";
});

const canDonate = computed(() => {
  return (
    selectedTokens.value >= 1 &&
    selectedTokens.value <= maxTokens.value &&
    maxTokens.value > 0
  );
});

// Handle token input change
const handleTokenInputChange = (value: number | string | null) => {
  if (value === null) return;
  const numValue = typeof value === "string" ? parseInt(value, 10) || 0 : value;
  if (numValue > maxTokens.value) {
    selectedTokens.value = maxTokens.value;
  } else if (numValue < 1) {
    selectedTokens.value = 1;
  } else {
    selectedTokens.value = numValue;
  }
};

// Handle slider change
const handleSliderChange = (value: number | null) => {
  if (value === null) return;
  selectedTokens.value = value;
};

// Handle confirm donate
const donateWithIdempotency = async (opts?: { forceNewAttempt?: boolean }) => {
  const postId = post.value?.post_id;
  if (!postId || !canDonate.value) {
    return;
  }

  const userId = authStore.user?.id || "guest";
  const keyStorage = `dh_idemp_topup_${userId}_${postId}`;

  try {
    // Reset error state before donation
    postsStore.donateError = null;
    if (opts?.forceNewAttempt) {
      clearIdempotencyKey(keyStorage);
    }
    const idempotencyKey = getOrCreateIdempotencyKey(keyStorage);

    await postsStore.donateToPost(postId, selectedTokens.value, { idempotencyKey });
    clearIdempotencyKey(keyStorage);

    // Refresh unread badge (best-effort)
    void notificationsStore.fetchUnreadCount();

    // Success notification
    notifySuccess("common.success.donationSuccessful", `Successfully donated ${selectedTokens.value} tokens!`, { position: "top", timeout: 3000 });

    // Close modal
    closeTopUpModal();
  } catch (error) {
    // Definitive fail (4xx/5xx): clear key so next attempt gets a new one.
    // Network fail (no response): keep key for safe retry/refresh, but offer "Try again" (new key) UX.
    const hasResponse = !!(error && typeof error === "object" && "response" in error);
    if (hasResponse) {
      clearIdempotencyKey(keyStorage);
    } else {
      notifyError({
        kind: "network",
        messageKey: "common.errors.network",
        fallbackMessage: "Network error. Please try again.",
        retryable: true
      }, { position: "top", timeout: 7000 });
      return;
    }

    // Error notification (error message is already set in store)
    const mapped = mapAxiosErrorToDhError(error);
    notifyError(mapped, { position: "top", timeout: 5000 });
  }
};

// Handle confirm donate
const handleConfirmDonate = async () => {
  await donateWithIdempotency();
};

const onContributeOption = async (option: ContributeOption | string) => {
  const postId = post.value?.post_id;
  if (!postId) {
    if (import.meta.env.DEV) {
      console.debug("[PostDetail] Missing postId in onContributeOption");
    }
    return;
  }

  // Support both string (legacy) and ContributeOption object
  const optionType = typeof option === "string" ? option : option.type;

  switch (optionType) {
    case "accomplish":
      // Navigate to Accomplish contribution form with contribution_type
      router.push({
        name: "donor-help",
        query: {
          postId: String(postId),
          contributionType: "accomplish"
        }
      });
      break;
    case "help":
      // Navigate to Help contribution form with contribution_type
      router.push({
        name: "donor-help",
        query: {
          postId: String(postId),
          contributionType: "help"
        }
      });
      break;
    case "topup":
      // Open Top Up modal (handled by openTopUpModal)
      openTopUpModal();
      break;
    case "tokens":
    case "share":
      handleShare();
      break;
    case "mentoring":
      emit("open-contribute-mentoring", { postId });
      break;
    default:
      if (import.meta.env.DEV) {
        console.debug("[PostDetail] Unhandled contribute option:", option);
      }
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
