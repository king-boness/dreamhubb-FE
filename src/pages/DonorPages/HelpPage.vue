<template>
  <!-- Loading state -->
  <div v-if="loading" class="help-page-loading">
    <AppSplash />
  </div>

  <!-- Error state -->
  <div v-else-if="error" class="help-page-error">
    <div class="help-page-errorContent">
      <h2>Unable to load post</h2>
      <RetryPanel
        :message="error"
        :on-retry="handleRetry"
        :loading="loading"
        variant="card"
      />
      <button class="primaryCtaBtn" @click="router.go(-1)" style="margin-top: 1rem;">Go Back</button>
    </div>
  </div>

  <!-- Main content -->
  <div v-else-if="post" class="help-page">
    <!-- Header with post image and title - Using shared PostHeader component -->
    <div class="help-page-headerWrapper" style="margin-top: 0; padding-top: 0;">
      <PostHeader
        :images="post.images || []"
        :cover-image="coverImage"
        :auto-slide="true"
        :show-progress="true"
        :show-arrows="false"
        :show-dots="false"
        :title="post.title"
        :date="formattedDate"
        :location="locationLabel"
        :views="viewsCount"
        :category-name="categoryName"
        :category-icon="postTypeIcon"
        :is-liked="isLiked"
        @close="router.go(-1)"
        @share="handleShare"
        @like="handleLike"
      />
    </div>
    <!-- Private Contribution Toggle -->
    <div class="helpPage-privateDiv">
      <div class="helpPage-privateButtonDiv">
        <q-toggle size="md" v-model="privacy" class="tracking-toggle toggle" />
        <img src="/icons/privateConnect-icon.svg" alt="" />
        <span>{{ t("privateContribution") }}</span>
      </div>
      <div class="helpPage-privateQuestionDiv">
        <q-btn class="questionButton">
          <img src="/icons/questionIcon.svg" alt="" />
        </q-btn>
      </div>
    </div>

    <!-- Conditional layouts based on contributionType -->
    <div v-if="contributionType === 'accomplish'" class="helpPage-content">
      <!-- Accomplish Dream Layout -->
      <div class="helpPage-donorInputsDiv">
        <q-input
          v-model="message"
          borderless
          dark
          hide-bottom-space
          bottom-slots
          placeholder="Type your message for a donee..."
          class="registerDatas registerSecrete donorHelpMessage messageInput"
          type="textarea"
        >
        </q-input>
      </div>
      <div class="helpPage-imageUploadDiv">
        <ImageUploader
          ref="imageUploaderRef"
          class="helpPage-imageUploadComponent"
          :max="5"
          upload-msg="add image"
          @imagesUpdated="handleImagesUpdated"
        ></ImageUploader>
      </div>

      <!-- Sticky Footer CTA - placed immediately after "add image" -->
      <BottomCtaButton
        :label="t('helpAccomplish')"
        icon-src="/icons/giftIcon.svg"
        :loading="submitting"
        :disabled="submitting || !message.trim()"
        @click="handleSubmit"
      />
    </div>

    <div v-else-if="contributionType === 'help'" class="helpPage-content">
      <!-- Help to Fulfill Layout -->
      <!-- Heading: "How you can help and what you want in return." -->
      <div class="helpPage-helpHeading">
        <h2>{{ t("howYouCanHelp") }}</h2>
      </div>

      <!-- Segmented Toggle: "I'll help with" / "In return, I want" -->
      <div class="helpPage-switcherContainer">
        <SegmentedToggle
          v-model="helpMode"
          :options="[t('illHelpWith'), t('inReturnIWant')]"
        />
      </div>

      <!-- Single text field (switched by switcher) -->
      <div class="helpPage-donorInputsDiv">
        <q-input
          v-model="activeText"
          borderless
          dark
          hide-bottom-space
          bottom-slots
          :placeholder="currentPlaceholder"
          class="registerDatas registerSecrete donorHelpMessage messageInput"
          type="textarea"
        >
        </q-input>
      </div>
      <div class="helpPage-imageUploadDiv">
        <ImageUploader
          ref="imageUploaderRef"
          class="helpPage-imageUploadComponent"
          :max="5"
          upload-msg="add image"
          @imagesUpdated="handleImagesUpdated"
        ></ImageUploader>
      </div>

      <!-- Sticky Footer CTA - placed immediately after "add image" -->
      <BottomCtaButton
        :label="contributionType === 'accomplish' ? t('helpAccomplish') : t('helpToFulfill')"
        icon-src="/icons/giftIcon.svg"
        :loading="submitting"
        :disabled="submitting || (contributionType === 'accomplish' ? !message.trim() : !helpWithText.trim())"
        @click="handleSubmit"
      />
    </div>

    <!-- Share Sheet -->
    <ShareProfileSheet
      v-if="post"
      v-model="isShareSheetOpen"
      :profile-url="sharePostUrl"
      :profile-title="sharePostTitle"
      :profile-text="sharePostText"
      :post-type="(post?.type as 'dream' | 'problem' | 'idea' | null) || null"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { usePostsStore } from "src/stores/posts";
import { useCommentsStore } from "src/stores/comments";
import { useAuthStore } from "src/stores/auth";
import { useNotificationsStore } from "src/stores/notifications";
import ImageUploader from "../../components/partials/UploadImgComponent.vue";
import PostHeader from "src/components/post/PostHeader.vue";
import { getPostTypeIcon } from "src/utils/postIcons";
import { getLocationLabel } from "src/utils/cityNames";
import { normalizePost } from "src/utils/normalizePost";
import { formatSubcategoryLabel } from "src/utils/formatSubcategoryLabel";
import { clearIdempotencyKey, getOrCreateIdempotencyKey } from "src/utils/idempotency";
import { notifyError, notifySuccess } from "src/utils/notify";
import AppSplash from "src/components/common/AppSplash.vue";
import ShareProfileSheet from "src/components/profile/ShareProfileSheet.vue";
import SegmentedToggle from "src/components/common/SegmentedToggle.vue";
import BottomCtaButton from "src/components/ui/BottomCtaButton.vue";
import RetryPanel from "src/components/common/RetryPanel.vue";
import type { UploadedImage } from "src/composables/useUpload";
import { mapAxiosErrorToDhError } from "src/utils/httpError";

const { t, locale } = useI18n();
const route = useRoute();
const router = useRouter();
const postsStore = usePostsStore();
const commentsStore = useCommentsStore();
const authStore = useAuthStore();
const notificationsStore = useNotificationsStore();

// State for active mode in Help to Fulfill
const activeMode = ref<"help" | "return">("help"); // Default to "I'll help with"

// Two reactive variables for content
const helpWithText = ref(""); // Text for "I'll help with"
const returnText = ref(""); // Text for "In return, I want"

// Computed property for v-model of single text field
const activeText = computed({
  get: () => (activeMode.value === "help" ? helpWithText.value : returnText.value),
  set: (val: string) => {
    if (activeMode.value === "help") {
      helpWithText.value = val;
    } else {
      returnText.value = val;
    }
  }
});

// Map activeMode to translated string for SegmentedToggle
// FIX: SegmentedToggle has reversed logic - when modelValue === options[0], the circle moves right (second option is active)
// When activeMode is "help" → "I'll help with" should be active (but SegmentedToggle shows second option when modelValue === options[0])
// When activeMode is "return" → "In return, I want" should be active (but SegmentedToggle shows first option when modelValue === options[1])
// So we need to reverse the mapping:
// When activeMode is "help" → return options[1] ("In return, I want") so that SegmentedToggle shows first option as active
// When activeMode is "return" → return options[0] ("I'll help with") so that SegmentedToggle shows second option as active
const helpMode = computed({
  get: () => {
    // FIX: Reverse the mapping because SegmentedToggle has reversed logic
    // When activeMode is "help" (we want "I'll help with" active), return "In return, I want" (options[1])
    // When activeMode is "return" (we want "In return, I want" active), return "I'll help with" (options[0])
    return activeMode.value === "help" ? t("inReturnIWant") : t("illHelpWith");
  },
  set: (val: string) => {
    // Map translated string back to activeMode
    // FIX: Reverse the mapping because SegmentedToggle has reversed logic
    // When "In return, I want" is clicked (val === t("inReturnIWant"), which is options[1]) → set activeMode to "help" (we want "I'll help with" active)
    // When "I'll help with" is clicked (val === t("illHelpWith"), which is options[0]) → set activeMode to "return" (we want "In return, I want" active)
    if (val === t("inReturnIWant")) {
      activeMode.value = "help";
    } else if (val === t("illHelpWith")) {
      activeMode.value = "return";
    }
  }
});

// Computed property for placeholder text
// When "I'll help with" is active (activeMode === "help") → "Type your message for a donee..."
// When "In return, I want" is active (activeMode === "return") → "Describe what you want in return..."
const currentPlaceholder = computed(() => {
  // Use activeMode directly as the source of truth
  // activeMode === "help" means "I'll help with" is active
  // activeMode === "return" means "In return, I want" is active
  if (activeMode.value === "help") {
    // "I'll help with" is active → show "Type your message for a donee..."
    return t("typeYourMessageForDonee");
  }
  // "In return, I want" is active → show "Describe what you want in return..."
  return t("describeWhatYouWantInReturn");
});

// Get postId and contributionType from route query
const postId = computed(() => {
  const id = route.query.postId;
  if (typeof id === "string") {
    return Number(id);
  }
  return null;
});

const contributionType = computed(() => {
  const type = route.query.contributionType;
  if (type === "accomplish" || type === "help") {
    return type;
  }
  return "help"; // Default to help
});

// Post data - check if current post matches the requested postId
const post = computed(() => {
  const current = postsStore.currentPost;
  if (!current || !postId.value) return null;
  // Ensure we have the correct post
  if (current.post_id === postId.value) {
    return current;
  }
  return null;
});
const loading = computed(() => postsStore.detailLoading);
const error = computed(() => postsStore.detailError);

// Form state
const privacy = ref(false);
const isLiked = ref(false);
const message = ref("");
const submitting = ref(false);

const imageUploaderRef = ref<InstanceType<typeof ImageUploader> | null>(null);
const contributionImages = ref<string[]>([]);

const handleImagesUpdated = (imgs: UploadedImage[]) => {
  contributionImages.value = (imgs || [])
    .map((img) => img?.secure_url)
    .filter((u): u is string => typeof u === "string" && u.trim().length > 0);
};

// Computed properties for post display
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
  // Use getLocationLabel helper for consistent formatting
  return getLocationLabel(p, locale.value as string) || "Unknown";
});

const viewsCount = computed(() => {
  return post.value?.views ?? 0;
});

const coverImage = computed(() => {
  const images = post.value?.images || [];
  return images.length > 0 ? images[0] : null;
});

// Normalize post data to ensure category and subcategory objects exist
const normalizedPost = computed(() => {
  if (!post.value) return null;
  return normalizePost(post.value as Parameters<typeof normalizePost>[0]);
});

const postTypeIcon = computed(() => {
  return getPostTypeIcon(post.value?.type || null);
});

const categoryName = computed(() => {
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

// Note: Placeholders are now explicitly set in template for both textarea fields
// Note: currentMessage computed property removed - using helpMessage and returnMessage directly

// Load post data
const loadPost = async (id: number) => {
  postsStore.detailLoading = true;
  await postsStore.fetchPostById(id);
};

const handleRetry = async () => {
  const id = postId.value;
  if (!id || Number.isNaN(id)) return;
  await loadPost(id);
};

// Submit contribution
const submitWithIdempotency = async (opts?: { forceNewAttempt?: boolean }) => {
  if (!postId.value || !post.value) {
    notifyError({
      kind: "not_found",
      messageKey: "common.errors.notFound",
      fallbackMessage: "Content not found.",
      retryable: false
    }, { position: "top" });
    return;
  }

  // Validate message based on contribution type
  if (contributionType.value === "accomplish") {
    if (!message.value.trim()) {
      notifyError({
        kind: "validation",
        messageKey: "common.errors.validation",
        fallbackMessage: "Please check your input and try again.",
        retryable: false
      }, { position: "top" });
      return;
    }
  } else {
    // For "help" type, validate helpWithText (required)
    if (!helpWithText.value.trim()) {
      notifyError({
        kind: "validation",
        messageKey: "common.errors.validation",
        fallbackMessage: "Please check your input and try again.",
        retryable: false
      }, { position: "top" });
      return;
    }
    // returnText is optional for "help" type
  }

  submitting.value = true;

  const userId = authStore.user?.id || "guest";
  const keyStorage = `dh_idemp_contribution_${userId}_${postId.value}_${contributionType.value}`;

  try {
    if (opts?.forceNewAttempt) {
      clearIdempotencyKey(keyStorage);
    }
    const idempotencyKey = getOrCreateIdempotencyKey(keyStorage);

    await commentsStore.addComment(
      postId.value,
      {
        type: contributionType.value,
        message: contributionType.value === "accomplish" ? message.value : helpWithText.value, // help part from helpWithText
        return_message: contributionType.value === "help" ? returnText.value : null, // return part from returnText
        is_private: privacy.value,
        images: contributionImages.value
      },
      { idempotencyKey }
    );
    clearIdempotencyKey(keyStorage);

    notifySuccess("common.success.contributionSubmitted", "Contribution submitted successfully", { position: "top" });

    // Refresh unread badge (best-effort)
    void notificationsStore.fetchUnreadCount();

    // Reset uploader + images state
    contributionImages.value = [];
    imageUploaderRef.value?.reset?.();

    // Redirect back to post detail
    router.push({
      name: "donor-post-detail",
      params: { id: String(postId.value) }
    });
  } catch (error: unknown) {
    const hasResponse = !!(error && typeof error === "object" && "response" in error);
    if (hasResponse) {
      clearIdempotencyKey(keyStorage);
    } else {
      // Network/timeout errors: keep it safe + actionable (retry/new attempt)
      notifyError(mapAxiosErrorToDhError(error), { position: "top", timeout: 7000 });
      return;
    }

    if (import.meta.env.DEV) {
      console.debug("Failed to submit contribution:", error);
    }
    notifyError({
      kind: "server",
      messageKey: "common.errors.server",
      fallbackMessage: "Something went wrong. Please try again.",
      retryable: true
    }, { position: "top" });
  } finally {
    submitting.value = false;
  }
};

const handleSubmit = async () => {
  await submitWithIdempotency();
};

// Share functionality
const isShareSheetOpen = ref(false);
const sharePostUrl = computed(() => {
  if (!post.value || !postId.value) {
    const base = window.location.origin || "https://app.dreamhubb.com";
    return base;
  }
  return `${window.location.origin || "https://app.dreamhubb.com"}/donor/post-detail/${postId.value}`;
});

const sharePostText = computed(() => {
  return post.value?.description || "Check out this post on dreamhubb";
});

const sharePostTitle = computed(() => {
  return post.value?.title || "Check out this post on dreamhubb";
});

const handleShare = () => {
  isShareSheetOpen.value = true;
};

// Like functionality
const handleLike = async () => {
  isLiked.value = !isLiked.value;
  // TODO: Implement actual like API call if needed
};

// Load post on mount
onMounted(async () => {
  const id = postId.value;
  if (id && !Number.isNaN(id)) {
    await loadPost(id);
  } else {
    notifyError({
      kind: "not_found",
      messageKey: "common.errors.notFound",
      fallbackMessage: "Content not found.",
      retryable: false
    }, { position: "top" });
    router.push({ name: "donor-posts" });
  }

  // Ensure activeMode is set to "help" when component mounts (for Help to Fulfill)
  // This ensures "I'll help with" is selected by default
  if (contributionType.value === "help") {
    // Reset to "help" mode to ensure "I'll help with" is selected
    activeMode.value = "help";
    // Wait for next tick to ensure DOM is updated and SegmentedToggle receives the correct value
    await nextTick();
    // Force update by accessing helpMode to trigger computed property
    // This ensures SegmentedToggle shows "I'll help with" (first option) as active
    void helpMode.value; // Trigger computed getter to ensure proper initialization
  }
});
</script>
<style lang="scss">
.help-page-errorActions {
  display: flex;
  gap: 10px;
  justify-content: center;
  margin-top: 12px;
}

.primaryCtaBtn--secondary {
  background: rgba(255, 255, 255, 0.08);
  color: rgba(255, 255, 255, 0.9);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.postDetail-img {
  width: 100%;
  height: 100%;
}
.donorHelpMessage {
  .q-field__label {
    color: rgba(255, 255, 255, 0.297) !important;
  }
}
</style>
<style lang="scss" scoped>
.liked {
  * {
    fill: #bd0043;
    opacity: 1 !important;
  }
}
.help-page-loading,
.help-page-error {
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
}

.help-page-errorContent {
  text-align: center;
  color: white;
  padding: 2rem;

  h2 {
    margin-bottom: 1rem;
  }

  p {
    margin-bottom: 1.5rem;
    opacity: 0.8;
  }
}

.help-page {
  min-height: 100vh;
  padding-bottom: 6rem !important; // Space for sticky footer (increased to ensure content is not hidden)
  background: radial-gradient(ellipse at top, #12192f 0, #050710 60%, #020307 100%);
  display: flex;
  flex-direction: column;
  margin-top: 0 !important; // Start from top of screen - override any layout padding
  padding-top: 0 !important; // No top padding - override any layout padding
  position: relative;

  // Header wrapper - scoped to help-page to prevent affecting PostDetail
  .help-page-headerWrapper {
    width: 100%;
    margin-top: 0 !important; // Start from top of screen
    margin-bottom: 0;
    padding-top: 0 !important;
    position: relative;
    top: 0;

    // PostHeader component has its own scoped styles
    :deep(.post-header) {
      width: 100%;
      height: 100%;

      .post-header-bg {
        border-radius: 0; // Remove border radius on help page - start from top
        margin-top: 0 !important;
        padding-top: 0 !important;
        position: relative;
        top: 0;
      }

      .post-header-imageWrapper {
        top: 0;
        margin-top: 0;
        padding-top: 0;
      }

      // Ensure title has exact same positioning as feed card
      .post-header-infoOverlay {
        padding-left: 16px; // Match .postCard-body padding-left exactly
        padding-right: 16px; // Match .postCard-body padding-right exactly
        padding-bottom: 20px; // Keep bottom padding for overlay
        padding-top: 0; // No top padding
      }

      .post-header-title {
        // All styles already match .postCard-title exactly
        // No additional overrides needed - using same values as feed card
      }
    }
  }
  // postDetailBg, postDetail-infoOverlay, postDetail-metaRow are global styles

  .helpPage-privateDiv {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 1rem 20px; // Consistent padding with content sections
    margin-bottom: 0.5rem; // Reduced spacing (was 1rem)

    .helpPage-privateButtonDiv {
      display: flex;
      color: white;
      align-items: center;
      gap: 0.5rem;
      img {
        height: 1.3rem;
      }
      span {
        font-family: poppins;
        font-size: 0.9rem;
      }
    }

    .helpPage-privateQuestionDiv {
      .questionButton {
        img {
          height: 1.5rem;
        }
      }
    }
  }

  // Content wrapper with consistent padding (20-24px as per spec)
  .helpPage-content {
    padding: 0 20px; // Consistent horizontal padding (20-24px range)
    padding-bottom: 1rem; // Space for sticky footer
    max-width: 390px;
    margin: 0 auto;
    width: 100%;
  }

  // Heading: "How you can help and what you want in return."
  .helpPage-helpHeading {
    margin-top: -4px; // Moved up by 3px (was -1px, now -4px to move text 3px higher)
    margin-bottom: 28px; // Compensated spacing to keep other elements in place (was 25px, now 28px)
    padding: 0;
    width: 100%; // Full width of parent container
    max-width: 100%; // Prevent text from going to edges
    margin-left: auto;
    margin-right: auto;

    h2 {
      color: #ffffff; // White text (same as other primary texts)
      font-family: poppinsSemiBold;
      font-size: 1rem; // H5/H6 size
      font-weight: 600;
      line-height: 1.4;
      text-align: center; // Centered text
      margin: 0;
      padding: 0 20px; // Horizontal padding to prevent text from going to edges
      box-sizing: border-box;
    }
  }

  // Switcher container - wider container with proper spacing
  .helpPage-switcherContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    margin-top: 8px; // 8-12px spacing from heading (reduced for compact layout)
    margin-bottom: 12px; // Reduced spacing before textarea (was 16px)
    padding: 0;
    width: 100%; // Full width to allow wider switcher

    // Make the switcher wider (80-90% of available space)
    :deep(.segmented-toggle-container) {
      width: 90% !important;
      max-width: 320px; // Reasonable max width
    }
  }

  // Textarea - full width with consistent padding
  .helpPage-donorInputsDiv {
    width: 100%;
    margin-top: 12px; // Reduced spacing from switcher (was 16px, now 12px for compact layout)
    margin-bottom: 1rem;

    .donorHelpMessage {
      width: 100%;
      min-height: 9.2rem;
      padding: 0.4rem 1rem; // Further reduced padding-top to move placeholder higher (was 0.5rem)
      border: 0.08rem solid rgba(255, 255, 255, 0.118);
      background-color: rgba(23, 23, 23, 0.72);
      border-radius: 0.5rem;

      // Move placeholder text higher
      :deep(.q-field__native) {
        padding-top: 0.4rem; // Further reduced padding-top for placeholder alignment
        line-height: 1.5; // Adjust line-height for better visual alignment
      }

      :deep(.q-field__label) {
        top: 0.4rem; // Align label/placeholder with reduced padding
        padding-top: 0.4rem; // Additional padding-top for better visual alignment
      }
    }
  }

  // Image upload - full width with consistent padding
  .helpPage-imageUploadDiv {
    width: 100%;
    margin-bottom: 0.5rem; // Reduced spacing before footer (was 1rem)

    .helpPage-imageUploadComponent {
      width: 100%;
    }
  }
}
</style>
