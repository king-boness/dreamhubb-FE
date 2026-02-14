<template>
  <div class="postCreation-page">
    <div class="postCreation-headerWrapper">
      <CloseOverlayButton @click="handleClose" />
    </div>
    <div class="postCreation-uploadedImgContainer">
      <ImageIndexSlider
        v-if="hasUploadedImages"
        :images="uploadedImages.images"
        class="postCreation-imageSlider"
        :count="uploadedImages.images.length"
        @change="handleIndex"
        key="image-slider"
      ></ImageIndexSlider>
      <UploadPostImgComponent
        v-else
        @images-updated="handleImagesFromChild"
        key="upload-component"
      />
      <div
        class="postCreation-imgOptionsContainer"
        v-if="uploadedImages.images.length != 0"
      >
        <q-btn class="postCreation-deleteImgButton" @click="deleteImg">
          <img
            class="postCreation-deleteImgIcon"
            src="/icons/deleteImg-icon.svg"
            alt=""
          />Remove Image</q-btn
        >
        <q-btn
          class="postCreation-addImgButton"
          @click="openFileInput"
          :disabled="isUploadingAdditional || uploadedImages.images.length >= 5"
        >
          <img
            src="/icons/addImg-icon.svg"
            alt=""
            class="postCreation-addImgIcon"
          />
        </q-btn>
        <input
          type="file"
          ref="fileInput"
          @change="handleFileChange"
          style="display: none"
          multiple
          accept="image/*"
          :disabled="isUploadingAdditional"
          data-testid="dh-post-creation-upload"
        />
      </div>
      <div class="postCreation-detailContainer">
        <div class="postCreation-postTypeContainer">
          <div class="postCreation-categoryContainer">
            <img
              :src="categories.goalImg"
              alt=""
              class="postCreation-goalImage postCreation-clickable"
              @click="$router.push({ name: 'donee-postCreation-goal' })"
            />
            <img
              :src="categories.specificGoalImg"
              alt=""
              class="postCreation-goalImage postCreation-clickable"
              @click="handleCategoryClick"
            />
            <!-- Subcategory picker removed - category and subcategory are the same in post creation flow -->
          </div>
          <q-btn
            class="postCreation-changeTypeButton"
            @click="$router.push({ name: 'donee-postCreation-goal' })"
            >Change Post Type</q-btn
          >
        </div>
        <q-input
          borderless
          dark
          hide-bottom-space
          bottom-slots
          label-color="grey-6"
          dense
          v-model="postTitle"
          :label="postTitleLabel"
          class="registerDatas registerSecrete postCreation-postTitleInput"
        >
        </q-input>
      </div>
    </div>
    <div class="postCreation-featuresContainer">
      <q-btn class="postCreation-addInfoButton"
        ><img
          src="/icons/date-icon.svg"
          alt=""
          class="postCreation-featureIcon"
        />
        Add Info</q-btn
      >
      <q-separator vertical inset class="postCreation-separator" />
      <q-btn class="postCreation-addInfoButton"
        ><img
          src="/icons/location-icon.svg"
          alt=""
          class="postCreation-featureIcon"
        />
        Add Info</q-btn
      >
      <q-separator vertical inset class="postCreation-separator" />
      <q-btn class="postCreation-addFeatureButton">+ Add Feature</q-btn>
    </div>
    <div class="postCreation-aboutDreamContainer">
      <span class="postCreation-dreamTitle">{{ "About " + selectedGoalLabel }}</span>
      <q-input
        borderless
        dark
        hide-bottom-space
        bottom-slots
        label-color="grey-7"
        v-model="aboutDream"
        :label="postDescriptionLabel"
        class="registerDatas registerSecrete postCreation-dreamDescription"
        type="textarea"
      >
      </q-input>
      <div class="postCreation-rewardContainer">
        <span class="postCreation-rewardTitle">Initial Reward</span>
        <div class="postCreation-tokenInputWrapper">
          <q-input
            v-model.number="rewardUi"
            type="number"
            :min="MIN_SUBMIT_TOKENS"
            :max="rewardUiMax"
            dark
            outlined
            class="postCreation-tokenInput"
            :error="hasTokenError"
            :error-message="tokenErrorMessage"
            :disable="rewardControlsDisabled"
            @update:model-value="(val: string | number | null) => handleTokenInputChange(val ?? 0)"
          >
            <template #append>
              <q-icon name="img:/icons/karma-icon.svg" />
            </template>
          </q-input>
        </div>
        <div class="postCreation-sliderWrapper">
          <q-slider
            v-model.number="rewardUi"
            :min="MIN_SUBMIT_TOKENS"
            :max="rewardUiMax"
            :step="1"
            :disable="rewardControlsDisabled"
            color="primary"
            track-size="10px"
            thumb-size="22px"
            class="tokens-slider q-mt-md"
            @update:model-value="handleSliderChange"
          />
        </div>
        <div class="postCreation-tokenBalance">
          {{ t("funds") }}: {{ remainingFunds }} tokens
        </div>
      </div>
    </div>
    <div class="postCreation-submitDreamContainer">
      <!-- Error message -->
      <div v-if="postCreationStore.error" class="postCreation-error" data-testid="dh-post-creation-error">
        {{ postCreationStore.error }}
      </div>
      <div ref="submitCtaWrapperRef" class="postCreation-submitCtaWrapper" @click.stop>
        <div v-if="showMinTokensBubble" class="postCreation-submitBubble" @click.stop>
          <HintBubble
            :title="t('minTokensPublishTitle')"
            :text="t('minTokensPublishText')"
            arrow="down"
            :show-close="true"
            @close="showMinTokensBubble = false"
          >
            <div class="postCreation-submitBubbleActions">
              <q-btn
                flat
                no-caps
                class="postCreation-submitBubbleBtn"
                @click.stop="handleGoHowToGetTokens"
              >
                {{ t("howToGetTokens") }}
              </q-btn>
              <q-btn
                flat
                no-caps
                class="postCreation-submitBubbleBtn postCreation-submitBubbleBtn--primary"
                @click.stop="handleGoBuyTokens"
              >
                {{ t("buyTokens") }}
              </q-btn>
            </div>
          </HintBubble>
        </div>

        <q-btn
          class="postCreation-submitButton"
          :class="{ 'postCreation-submitButton--minTokensBlocked': isMinTokensBlocked }"
          @click="handleSubmitPost"
          :disabled="!postCreationStore.isValid || postCreationStore.loading"
          :ripple="!isMinTokensBlocked"
          :aria-disabled="isMinTokensBlocked ? 'true' : undefined"
          data-testid="dh-post-creation-submit"
        >
          <span v-if="postCreationStore.loading">Creating post...</span>
          <span v-else>Submit Post</span>
        </q-btn>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, onActivated, computed, nextTick, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { usePostCreationStore } from "src/stores/postCreation";
import { usePostsStore } from "src/stores/posts";
import { useAuthStore } from "src/stores/auth";
import { usePreferencesStore } from "src/stores/preferences";
import { notifyError, notifySuccess } from "src/utils/notify";
import { tGlobal } from "src/utils/i18nGlobal";
import UploadPostImgComponent from "src/components/partials/UploadPostImgComponent.vue";
import { PostCategories } from "src/components/models";
import ImageIndexSlider from "src/components/partials/ImageIndexSlider.vue";
import type { UploadedImage } from "src/composables/useUpload";
import CloseOverlayButton from "src/components/common/CloseOverlayButton.vue";
import HintBubble from "src/components/ui/HintBubble.vue";
import { Capacitor } from "@capacitor/core";
import { Camera } from "@capacitor/camera";

const { t } = useI18n();

const router = useRouter();
const postCreationStore = usePostCreationStore();
const postsStore = usePostsStore();
const authStore = useAuthStore();
const preferencesStore = usePreferencesStore();

const MIN_SUBMIT_TOKENS = 10;

// Handle close button click - same behavior as PostDetailPage
const handleClose = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    router.push({ name: "donee-posts" });
  }
};
const fileInput = ref<HTMLInputElement | null>(null);
const imgIndex = ref(0);
const uploadedImages = ref<{ images: string[] }>({
  images: []
});
/** Pri post-create s obrázkami: súbory sa posielajú ako multipart images[] */
const imageFilesRef = ref<File[]>([]);
const isUploadingAdditional = ref(false);

// Computed property pre kontrolu, či sú nahraté obrázky
const hasUploadedImages = computed(() => {
  return uploadedImages.value.images && uploadedImages.value.images.length > 0;
});

// Computed properties from store - using new API
const aboutDream = computed({
  get: () => postCreationStore.description,
  set: (value) => postCreationStore.setDescription(value)
});

const postTitle = computed({
  get: () => postCreationStore.title,
  set: (value) => postCreationStore.setTitle(value)
});

const tokens = computed({
  get: () => postCreationStore.tokens,
  set: (value) => postCreationStore.setTokens(value)
});

// Token balance and validation
const userTokensBalance = computed(() => {
  return authStore.user?.tokens ?? 0;
});

const maxTokens = computed(() => {
  return Math.max(0, userTokensBalance.value);
});

// Remaining funds after choosing initial reward
const remainingFunds = computed(() => {
  const reward = rewardUi.value;
  return Math.max(userTokensBalance.value - reward, 0);
});

// UX rule: always DISPLAY min reward 10 in the reward UI.
// If user balance < 10, lock controls and still show the requirement (10) without allowing submit.
const rewardControlsDisabled = computed(() => userTokensBalance.value < MIN_SUBMIT_TOKENS);
const rewardUiMax = computed(() => (rewardControlsDisabled.value ? MIN_SUBMIT_TOKENS : maxTokens.value));

const rewardUi = computed<number>({
  get: () => (rewardControlsDisabled.value ? MIN_SUBMIT_TOKENS : (tokens.value || 0)),
  set: (v) => {
    if (rewardControlsDisabled.value) return;
    handleTokenInputChange(v);
  }
});

const hasTokenError = computed(() => {
  if (rewardControlsDisabled.value) return false;
  return tokens.value > maxTokens.value || tokens.value < MIN_SUBMIT_TOKENS;
});

const tokenErrorMessage = computed(() => {
  if (rewardControlsDisabled.value) return "";
  if (tokens.value > maxTokens.value) {
    return t("youDontHaveEnoughTokens");
  }
  if (tokens.value < MIN_SUBMIT_TOKENS) {
    return t("minTokensPublishTitle");
  }
  return "";
});

const isMinTokensBlocked = computed(() => {
  return userTokensBalance.value < MIN_SUBMIT_TOKENS || tokens.value < MIN_SUBMIT_TOKENS;
});

const ensureDefaultTokens = () => {
  // Default reward to 10 for new posts when possible
  if (maxTokens.value < MIN_SUBMIT_TOKENS) return;
  if (postCreationStore.tokens < MIN_SUBMIT_TOKENS) {
    postCreationStore.setTokens(MIN_SUBMIT_TOKENS);
  }
};

// Handle token input change - only update store, no heavy operations
const handleTokenInputChange = (value: number | string | null) => {
  if (value === null) return;
  const numValue = typeof value === "string" ? parseInt(value, 10) || 0 : value;
  // Clamp value but don't do heavy validation here - let computed properties handle it
  const clampedValue = Math.max(MIN_SUBMIT_TOKENS, Math.min(numValue, maxTokens.value));
  postCreationStore.setTokens(clampedValue);
};

// Handle slider change - direct update for immediate response
const handleSliderChange = (value: number | null) => {
  if (value === null) return;
  if (value > maxTokens.value) {
    tokens.value = maxTokens.value;
  } else {
    tokens.value = Math.max(MIN_SUBMIT_TOKENS, value);
  }
};

// Get selected goal from localStorage
const selectedGoal = ref<string | null>(null);

// Get label for selected goal
const selectedGoalLabel = computed(() => {
  if (!selectedGoal.value || typeof selectedGoal.value !== "string") return "Dream";
  const goalMap: Record<string, string> = {
    problem: "Problem",
    dream: "Dream",
    idea: "Idea"
  };
  const goalLower = selectedGoal.value.toLowerCase();
  return goalMap[goalLower] || "Dream";
});

// Computed properties for labels to avoid template literal issues
const postTitleLabel = computed(() => {
  const label = selectedGoalLabel.value || "Dream";
  return label + " Title";
});

const postDescriptionLabel = computed(() => {
  const label = selectedGoalLabel.value || "Dream";
  return label + " Description";
});

// Map goal names to icon file names (use original CategoryIcons)
const getGoalIcon = (goal: string | null): string => {
  if (!goal) return "/icons/CategoryIcons/dream.svg";
  const goalMap: Record<string, string> = {
    problem: "problem",
    dream: "dream",
    idea: "idea"
  };
  const iconName = goalMap[goal.toLowerCase()] || "dream";
  return `/icons/CategoryIcons/${iconName}.svg`;
};

// Map category names to icon file names
const getCategoryIcon = (category: string | null): string => {
  if (!category) return "/icons/CategoryIcons/traveling.svg";
  const categoryMap: Record<string, string> = {
    traveling: "traveling",
    travelling: "traveling",
    health: "health",
    learning: "learning",
    possesions: "possesions", // Súbor sa volá possesions.svg (s jedným 's')
    possessions: "possesions", // Mapovanie na správny názov súboru
    relationships: "relationships",
    events: "events",
    profession: "proffesion",
    other: "other",
    others: "other"
  };
  const iconName = categoryMap[category.toLowerCase()] || "traveling";
  return `/icons/CategoryIcons/${iconName}.svg`;
};

// Legacy ID mappings removed - we now use slugs directly

// Handle category click - navigate to category picker
const handleCategoryClick = () => {
  router.push({ name: "donee-postCreation-category" });
};

// Load selected values from postCreationStore, localStorage, with fallback to defaults
// IMPORTANT: Do NOT use preferencesStore for post creation flow - it's for onboarding only
const loadSelectedCategories = () => {
  // Priority 1: Use values from postCreationStore (post creation flow) - using new API: category and subcategory
  let goal = postCreationStore.category || null;
  let selectedSubcategory = postCreationStore.subcategory || null;

  // Priority 2: Fallback to localStorage (post creation flow) - legacy keys for backward compatibility
  if (!goal) {
    goal = localStorage.getItem("donee_postCreation_goal");
  }
  if (!selectedSubcategory) {
    selectedSubcategory = localStorage.getItem("donee_postCreation_category");
  }

  // DO NOT use preferencesStore - it's for onboarding, not post creation
  // This ensures "dream" is always the default for post creation flow

  // Priority 3: Fallback to defaults
  if (!goal) {
    goal = "dream";
  }
  if (!selectedSubcategory) {
    selectedSubcategory = "traveling";
  }

  // Never log post creation values (can be sensitive / noisy)

  selectedGoal.value = goal;

  // Nastaviť hodnoty do store - using new API
  if (goal) {
    postCreationStore.setCategory(goal as import("src/domain/categories").CategorySlug);
  }
  if (selectedSubcategory) {
    postCreationStore.setSubcategory(selectedSubcategory as import("src/domain/categories").SubcategorySlug);
  }

  // Aktualizovať ikony
  categories.value = {
    goalImg: getGoalIcon(goal),
    specificGoalImg: getCategoryIcon(selectedSubcategory)
  };

  // no logs
};

const categories = ref({
  goalImg: "/icons/CategoryIcons/dream.svg",
  specificGoalImg: "/icons/CategoryIcons/traveling.svg"
} as PostCategories);

// Load categories on mount
onMounted(() => {
  loadSelectedCategories();
  ensureDefaultTokens();
});

// Reload categories when component is activated (e.g., returning from submit-2 page or picker pages)
onActivated(() => {
  loadSelectedCategories();
  ensureDefaultTokens();
});

// Watch for changes to category and subcategory in store/localStorage
watch(() => [postCreationStore.category, postCreationStore.subcategory], () => {
  loadSelectedCategories();
}, { deep: true });

// Handle post submission - submit to BE
const handleSubmitPost = async () => {
  // Keep production console clean (no logs / no payloads)

  if (!postCreationStore.isValid || postCreationStore.loading) {
    if (import.meta.env.DEV) {
      console.debug("[PostCreation] Submit blocked");
    }
    return;
  }

  if (isMinTokensBlocked.value) {
    showMinTokensBubble.value = !showMinTokensBubble.value;
    return;
  }

  try {
    if (import.meta.env.DEV) {
      console.debug("[PostCreation] before createPost()");
    }

    // Submit post via store (ak máme súbory, pošle FormData s images[])
    const result = await postCreationStore.createPost(
      imageFilesRef.value.length > 0 ? imageFilesRef.value : undefined
    );

    if (import.meta.env.DEV) {
      console.debug("[PostCreation] createPost() result:", result);
    }

    // Update user tokens if returned from BE
    if (result?.user?.tokens !== undefined) {
      authStore.updateTokens(result.user.tokens);
      if (import.meta.env.DEV) {
        console.debug("[PostCreation] Updated user tokens from response");
      }
    } else {
      // If BE doesn't return tokens, refresh from API
      // This ensures UI always shows correct balance
      try {
        await authStore.refreshTokenBalance();
      } catch (error) {
        // Don't block UX if refresh fails
        if (import.meta.env.DEV) {
          console.debug("Failed to refresh token balance after post creation:", error);
        }
      }
    }

    // Show success message
    notifySuccess("common.success.postCreated", "Post created successfully!", { position: "top" });

    uploadedImages.value.images.forEach((url) => {
      if (url.startsWith("blob:")) URL.revokeObjectURL(url);
    });
    uploadedImages.value.images = [];
    imageFilesRef.value = [];

    // Save registration preferences to preferences store before clearing localStorage
    // This ensures they can be used when switching to donor side
    const registrationGoal = localStorage.getItem("donee_postCreation_goal");
    const registrationCategory = localStorage.getItem("donee_postCreation_category");
    if (registrationGoal && registrationCategory) {
      // Category (goal) is dream/problem/idea
      const category = registrationGoal as "dream" | "problem" | "idea";
      // Subcategory is traveling/health/etc.
      const subcategory = registrationCategory;

      // Always save to preferences store (registration preferences take priority)
      preferencesStore.setPreferredPostType(category);
      preferencesStore.setPreferredSubcategory(subcategory);
    }

    // Clear localStorage
    localStorage.removeItem("donee_postCreation_goal");
    localStorage.removeItem("donee_postCreation_category");

    // Refresh posts feed and my posts (for Donee home) - using new API
    await Promise.all([
      postsStore.fetchPosts({ sort: "help" }),
      postsStore.fetchMyDreams({ category: "dream" }),
      postsStore.fetchMyProblems({ category: "problem" }),
      postsStore.fetchMyIdeas({ category: "idea" })
    ]);

    // Navigate to donee posts page (Donee home)
    router.push({ name: "donee-posts" });
  } catch (error: unknown) {
    if (import.meta.env.DEV) {
      console.debug("[PostCreation] submitPost() threw:", error);
    }
    // Error je už nastavený v store
    if (postCreationStore.error) {
      notifyError({
        kind: "server",
        messageKey: "common.errors.server",
        fallbackMessage: postCreationStore.error,
        retryable: true
      }, { position: "top" });
    } else {
      notifyError({
        kind: "server",
        messageKey: "common.errors.server",
        fallbackMessage: "Failed to create post. Please try again.",
        retryable: true
      }, { position: "top" });
    }
  }
};

// Keep tokens in bounds if user balance changes (e.g. after top up or other actions)
watch([maxTokens], () => {
  if (postCreationStore.loading) return;
  if (maxTokens.value >= MIN_SUBMIT_TOKENS) {
    ensureDefaultTokens();
  }
  const clampedValue = Math.max(MIN_SUBMIT_TOKENS, Math.min(tokens.value, maxTokens.value));
  if (clampedValue !== tokens.value) {
    postCreationStore.setTokens(clampedValue);
  }
});

// Bubble (min tokens) UX
const showMinTokensBubble = ref(false);
const submitCtaWrapperRef = ref<HTMLElement | null>(null);

const closeMinTokensBubble = () => {
  showMinTokensBubble.value = false;
};

watch(isMinTokensBlocked, (blocked) => {
  if (!blocked) {
    closeMinTokensBubble();
  }
});

const handleGoHowToGetTokens = () => {
  closeMinTokensBubble();
  router.push({ name: "donee-token" });
};

const handleGoBuyTokens = () => {
  closeMinTokensBubble();
  router.push({ name: "donee-tokenshop" });
};

const onDocPointerDown = (event: Event) => {
  if (!showMinTokensBubble.value) return;
  const target = event.target as Node | null;
  if (submitCtaWrapperRef.value && target && submitCtaWrapperRef.value.contains(target)) return;
  closeMinTokensBubble();
};

onMounted(() => {
  document.addEventListener("pointerdown", onDocPointerDown, { capture: true });
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onDocPointerDown, { capture: true });
  uploadedImages.value.images.forEach((url) => {
    if (url.startsWith("blob:")) URL.revokeObjectURL(url);
  });
});
const deleteImg = () => {
  const idx = imgIndex.value;
  const url = uploadedImages.value.images[idx];
  if (url && imageFilesRef.value[idx] && url.startsWith("blob:")) {
    URL.revokeObjectURL(url);
  }
  uploadedImages.value.images.splice(idx, 1);
  imageFilesRef.value.splice(idx, 1);
  postCreationStore.setImages(uploadedImages.value.images);
};
const handleImagesFromChild = async (imgs: UploadedImage[]) => {
  const imageUrls = imgs.map((img) => img.secure_url);
  imageFilesRef.value = [];
  uploadedImages.value.images = [...imageUrls];
  postCreationStore.setImages(imageUrls);
  await nextTick();
};
const handleIndex = (index: number) => {
  imgIndex.value = index;
};
watch(imgIndex, () => {
  // no logs
});
const openFileInput = async () => {
  const isNative = Capacitor?.isNativePlatform?.() === true;
  if (isNative) {
    try {
      const photo = await Camera.getPhoto({
        source: "PHOTOLIBRARY",
        resultType: "Uri",
        quality: 90
      });
      await addPhotoFromWebPath(photo as unknown as { webPath?: string; path?: string; dataUrl?: string; uri?: string });
    } catch (e) {
      if (import.meta.env.DEV) console.debug("[PostCreation] Camera.getPhoto cancelled or failed:", e);
    }
  } else if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;
  if (!files || files.length === 0) return;

  const maxImages = 5;
  const currentCount = uploadedImages.value.images.length;
  const remainingSlots = maxImages - currentCount;
  if (remainingSlots <= 0) {
    notifyError({
      kind: "validation",
      messageKey: "common.errors.validation",
      fallbackMessage: `Maximum ${maxImages} images allowed.`,
      retryable: false
    }, { position: "top" });
    return;
  }

  const filesToAdd = Array.from(files).slice(0, remainingSlots);
  const useDataUrlForPreview = Capacitor?.isNativePlatform?.() === true;

  if (useDataUrlForPreview) {
    for (const file of filesToAdd) {
      const dataUrl = await new Promise<string | null>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || null);
        reader.onerror = () => resolve(null);
        reader.readAsDataURL(file);
      });
      if (dataUrl) {
        imageFilesRef.value.push(file);
        uploadedImages.value.images.push(dataUrl);
      }
    }
    postCreationStore.setImages([]);
  } else {
    filesToAdd.forEach((file) => {
      imageFilesRef.value.push(file);
      uploadedImages.value.images.push(URL.createObjectURL(file));
    });
    postCreationStore.setImages([]);
  }
  if (fileInput.value) fileInput.value.value = "";
};

/** Pre Capacitor Camera/Gallery: preview musí používať webPath (priorita) alebo base64 data URL, aby sa obrázok zobrazil v iOS WKWebView.
 * Ak path/uri vyzerá ph:// alebo file://, použije convertFileSrc. */
const addPhotoFromWebPath = async (photo: { webPath?: string; path?: string; dataUrl?: string; uri?: string }) => {
  if (uploadedImages.value.images.length >= 5) return;
  try {
    const webPath = photo.webPath ?? null;
    const path = photo.path ?? photo.uri ?? null;
    let previewSrc: string;
    const isPhOrFile = (s: string) => s.startsWith("ph://") || s.startsWith("file://");
    if (webPath && !isPhOrFile(webPath)) {
      previewSrc = webPath;
    } else if (webPath || path) {
      const raw = (webPath || path)!;
      previewSrc = (isPhOrFile(raw) && Capacitor?.convertFileSrc)
        ? Capacitor.convertFileSrc(raw)
        : raw;
    } else if (photo.dataUrl) {
      previewSrc = photo.dataUrl.startsWith("data:") ? photo.dataUrl : `data:image/jpeg;base64,${photo.dataUrl}`;
    } else {
      if (import.meta.env.DEV) console.debug("[PostCreation] addPhotoFromWebPath: no webPath/path/dataUrl");
      return;
    }
    if (import.meta.env.DEV) {
      console.debug("[PostCreation] Image preview source (dev):", {
        webPath: webPath?.slice(0, 60),
        path: path?.slice(0, 60),
        previewSrc: previewSrc.slice(0, 80) + "..."
      });
    }
    const res = await fetch(previewSrc);
    const blob = await res.blob();
    const file = new File([blob], `photo_${Date.now()}.jpg`, { type: blob.type || "image/jpeg" });
    imageFilesRef.value.push(file);
    uploadedImages.value.images.push(previewSrc);
    postCreationStore.setImages([]);
  } catch (e) {
    if (import.meta.env.DEV) console.debug("[PostCreation] addPhotoFromWebPath failed", e);
  }
};
</script>
<style lang="scss">
.postCreation-dreamDescription {
  .q-field__control {
    height: 100%;
  }
}

.postCreation-page {
  .flicking-camera {
    height: 40rem;
    * {
      transition: all 0.01s;
    }
  }
  .postDetail-img {
    width: 100%;
  }
  .postCreation-imageSlider {
    width: 100% !important;
    height: 40rem !important;
    position: absolute !important;
    top: 0 !important;
    left: 0 !important;
    z-index: 1 !important;
    display: block !important;

    :deep(.flicking-wrapper) {
      width: 100% !important;
      height: 100% !important;
      position: relative !important;
      display: block !important;
    }

    :deep(.flicking-viewport) {
      width: 100% !important;
      height: 100% !important;
      overflow: hidden !important;
    }

    :deep(.flicking-camera) {
      height: 100% !important;
      width: 100% !important;
    }

    :deep(.flicking-panel) {
      width: 100% !important;
      height: 100% !important;
      display: flex !important;
      align-items: center !important;
      justify-content: center !important;
    }

    :deep(.slider-image) {
      width: 100% !important;
      height: 100% !important;
      object-fit: cover !important;
      object-position: center !important;
      display: block !important;
    }
  }
}
</style>
<style scoped lang="scss">
.iphoneDevice-postCreation {
  padding-top: 3.3rem !important;
}
// Removed ::after gradient to prevent visual split
.postCreation-page {
  .postCreation-headerWrapper {
    position: relative;
    width: 100%;
    height: 0;
    z-index: 15;
    pointer-events: none;

    > * {
      pointer-events: auto;
    }
  }

  .postCreation-uploadedImgContainer {
    position: relative;
    width: 100%;
    height: 40rem;
    background: #161616;
    overflow: hidden;
    // Ensure consistent background color
    background-color: #161616 !important;

    .postCreation-imageSlider {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      z-index: 1;
    }

    .postCreation-imgOptionsContainer {
      z-index: 111;
      position: absolute;
      top: 27.9rem;
      display: flex;
      width: 100%;
      padding-right: 1rem;
      flex-direction: row;
      gap: 0.7rem;
      align-items: center;
      justify-content: end;

      .postCreation-deleteImgButton {
        background: rgba(84, 0, 29, 0.841);
        font-family: poppins;
        color: #ffffff;
        display: flex;
        flex-direction: column;
        width: 12rem;
        height: 2rem;
        border-radius: 5.3125rem;
        padding: 0 0.5rem;
        font-size: 1rem;
        text-transform: capitalize;
        .postCreation-deleteImgIcon {
          margin-right: 0.4rem;
          width: 1.5rem;
          filter: brightness(0) invert(1);
        }
      }

      .postCreation-addImgButton {
        width: 3rem;
        height: 3rem;
        border-radius: 2rem;
        background: rgba(84, 0, 29, 0.841);
        padding-right: 1.2rem;
        padding-bottom: 0.4rem;

        backdrop-filter: blur(0.2rem);
        .postCreation-addImgIcon {
          height: 1.6rem;
        }
      }
    }
    .postCreation-categoryContainer {
      display: flex;
      gap: 1rem;
      align-items: center;
      padding: 0.5rem 0;
    }
    .postCreation-detailContainer {
      z-index: 111;
      width: 95%;
      top: calc(31.5rem - 10px);
      margin: 0 auto;
      padding: 0 1rem;
      height: 8rem;
      left: 50%;
      transform: translate(-50%, 0);
      border-radius: 1rem;
      background: linear-gradient(
        135deg,
        rgba(0, 0, 0, 0.732) 0%,
        rgba(23, 23, 23, 0.258) 100%
      );
      backdrop-filter: blur(10px);
      position: absolute;
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: column;

      .postCreation-postTypeContainer {
        width: 100%;
        margin: 0 auto;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 1.5rem;
        padding-top: 1.5rem;

        .postCreation-categoryContainer {
          display: flex;
          gap: 1rem;
          align-items: center;
          padding: 0.5rem 0.5rem 0.5rem 0;
          margin-right: auto;
        }

        .postCreation-goalImage {
          height: 2.5rem;
          width: auto;
          margin: 0;

          &.postCreation-clickable {
            cursor: pointer;
            transition: opacity 0.2s ease, transform 0.2s ease;

            &:hover {
              opacity: 0.8;
              transform: scale(1.05);
            }

            &:active {
              transform: scale(0.95);
            }
          }
        }
        .postCreation-changeTypeButton {
          border: 0.1rem solid $primary;
          width: 9.6rem;
          font-size: 0.8rem;
          border-radius: 6.1875rem;
          color: $primary;
          text-transform: capitalize;
          padding: 0 !important;
          font-family: poppins;
        }
      }
      .postCreation-postTitleInput {
        background-color: rgba(23, 23, 23, 0.72);
        border-radius: 0.625rem;
        width: 100%;
        height: 2.875rem;
        padding: 0.1rem 1rem;
      }
    }
  }
  .postCreation-featuresContainer {
    margin: 0.1rem 0;
    padding: 0.6rem 0.3rem;
    border-top: 0.1rem solid rgba(252, 252, 252, 0.1);
    border-bottom: 0.1rem solid rgba(252, 252, 252, 0.1);
    display: flex;
    justify-content: center;
    gap: 0.5rem;

    .postCreation-addInfoButton {
      color: white;
      text-transform: capitalize;
      text-decoration: underline;
      font-family: poppins;
      display: flex;
      justify-content: center;
      align-items: center;
      width: 6rem;
      padding: 0;
      font-size: 0.9rem;

      .postCreation-featureIcon {
        margin-right: 0.4rem;
      }
    }
    .postCreation-addFeatureButton {
      margin-left: 0.5rem;
      border: 0.1rem solid $primary;
      width: 6.8rem;
      font-size: 0.8rem;
      border-radius: 6.1875rem;
      color: $primary;
      text-transform: capitalize;
      padding: 0 !important;
      font-family: poppins;
    }
    .postCreation-separator {
      background-color: rgba(255, 255, 255, 0.19);
    }
  }
  .postCreation-aboutDreamContainer {
    display: flex;
    flex-direction: column;
    justify-content: start;
    align-items: start;
    margin: 2rem auto;
    gap: 1rem;
    width: 100%;
    padding: 0 1rem;

    .postCreation-dreamTitle {
      font-family: poppinsSemiBold;
      color: white;
      font-size: 1.5rem;
    }
    .postCreation-dreamDescription {
      font-family: poppins;
      margin: 0 auto;
      border-radius: 0.625rem;
      width: 100%;
      height: 14rem;
      background-color: rgba(23, 23, 23, 0.72);
    }
  }
  .postCreation-rewardContainer {
    display: flex;
    flex-direction: column;
    width: 100%;
    gap: 1rem;

    .postCreation-rewardTitle {
      font-family: poppinsSemiBold;
      color: white;
      font-size: 1.1rem;
      margin-bottom: 0;
    }

    .postCreation-tokenInputWrapper {
      width: 100%;
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    .postCreation-tokenInput {
      width: 60%;
      max-width: 200px;
      :deep(.q-field__control) {
        background: rgba(23, 23, 23, 0.72);
        border-radius: 0.625rem;
        height: 2.875rem;
        display: flex;
        align-items: center;
      }
      :deep(.q-field__native) {
        color: $primary;
        font-size: 1rem;
        font-weight: 600;
        text-align: right;
        padding-right: 0.5rem;
        font-family: poppinsBold;
      }
      :deep(.q-field__append) {
        padding-left: 0.3rem;
        display: flex;
        align-items: center;
        justify-content: center;
      }
      :deep(.q-icon) {
        color: $primary;
        font-size: 1.2rem;
      }
    }

    .postCreation-tokenBalance {
      font-size: 0.875rem;
      color: rgba(255, 255, 255, 0.7);
      text-align: center;
      margin-top: 0.5rem;
    }

    .postCreation-sliderWrapper {
      width: 100%;
      padding: 0.5rem 0;
    }

    .tokens-slider {
      margin-top: 12px;
      user-select: none;
      -webkit-user-select: none;
      -moz-user-select: none;
      -ms-user-select: none;
      touch-action: pan-x;
      -webkit-tap-highlight-color: transparent;

      :deep(.q-slider__track-container) {
        cursor: pointer;
        touch-action: pan-x;
        will-change: transform;
        -webkit-tap-highlight-color: transparent;
      }

      :deep(.q-slider__thumb-container) {
        transform: translate(-50%, -50%);
        -webkit-transform: translate(-50%, -50%);
      }

      :deep(.q-slider__thumb) {
        cursor: grab;
        will-change: transform;
        transition: none;
        -webkit-tap-highlight-color: transparent;
        transform: translateZ(0) translateY(-5.5px) translateX(-3.5px);
        -webkit-transform: translateZ(0) translateY(-5.5px) translateX(-3.5px);
        backface-visibility: hidden;
        -webkit-backface-visibility: hidden;
        margin-top: -5.5px;
        margin-left: -3.5px;

        &:active {
          cursor: grabbing;
          transform: translateZ(0) translateY(-5.5px) translateX(-3.5px) scale(1.1);
          -webkit-transform: translateZ(0) translateY(-5.5px) translateX(-3.5px) scale(1.1);
        }

        &:hover {
          cursor: grab;
        }
      }

      :deep(.q-slider__track) {
        cursor: pointer;
        will-change: width;
        transform: translateZ(0);
        -webkit-transform: translateZ(0);
      }

      :deep(.q-slider__track-fill) {
        will-change: width;
        transition: none;
        transform: translateZ(0);
        -webkit-transform: translateZ(0);
      }

      :deep(.q-slider__track-container),
      :deep(.q-slider__thumb-container) {
        transform: translateZ(0);
        -webkit-transform: translateZ(0);
      }
    }
  }
  .postCreation-submitDreamContainer {
    width: 100%;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 0 1rem;
    gap: 0.5rem;

    .postCreation-submitCtaWrapper {
      position: relative;
      width: 100%;
    }

    .postCreation-submitBubble {
      position: absolute;
      left: 50%;
      transform: translateX(-50%);
      // Arrow tip should be 10px above the CTA. HintBubble's arrow tip sits ~4px below the bubble box,
      // so we offset by 10px + 4px = 14px.
      bottom: calc(100% + 14px);
      z-index: 10;
      width: 100%;
      display: flex;
      justify-content: center;
      pointer-events: auto;
    }

    /* Nudge the bubble title ("...publish a post.") slightly higher for this specific bubble */
    :deep(.postCreation-submitBubble .dhHintBubble-title) {
      position: relative;
      top: -5px;
    }

    .postCreation-submitBubbleActions {
      display: flex;
      gap: 0.6rem;
      width: 100%;
      justify-content: center;
      margin-top: 0.75rem;
      flex-wrap: wrap;
    }

    .postCreation-submitBubbleBtn {
      font-family: poppinsSemiBold;
      font-size: 0.85rem;
      border-radius: 0.6rem;
      padding: 0.35rem 0.8rem;
      color: rgba(255, 255, 255, 0.95);
      background: rgba(0, 0, 0, 0.18);
      border: 1px solid rgba(255, 255, 255, 0.22);
      min-height: 2.1rem;
    }

    .postCreation-submitBubbleBtn--primary {
      background: rgba(0, 0, 0, 0.28);
      border-color: rgba(255, 255, 255, 0.28);
    }

    .postCreation-error {
      font-size: 0.875rem;
      color: #ff2c8b;
      text-align: center;
      padding: 8px 12px;
      background: rgba(255, 44, 139, 0.1);
      border-radius: 8px;
      border: 1px solid rgba(255, 44, 139, 0.3);
      width: 100%;
    }

    .postCreation-submitButton {
      background-color: rgba(182, 0, 67, 1);
      color: white;
      border: none;
      font-size: 1.2rem;
      height: 3.3rem;
      border-radius: 0.5rem;
      width: 100%;
      margin: 0 auto;
      margin-top: 1rem;
      margin-bottom: 2rem;
      font-family: montseraatSemiBold;

      &.postCreation-submitButton--minTokensBlocked {
        opacity: 0.75;
      }

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}
</style>
