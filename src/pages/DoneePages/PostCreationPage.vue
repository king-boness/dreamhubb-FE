<template>
  <div class="postCreation-page">
    <div
      class="postCreation-header"
      :class="{ 'iphoneDevice-postCreation': $q.platform.is.ios }"
    >
      <q-btn
        class="postCreation-btn"
        @click="$router.go(-1)"
        :class="[
          uploadedImages.images.length != 0 ? 'postCreation-swiperButton' : ''
        ]"
        ><img src="/icons/closeIcon.svg" alt="" class="closeIcon" />
      </q-btn>
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
        />
      </div>
      <div class="postCreation-detailContainer">
        <div class="postCreation-postTypeContainer">
          <div class="postCreation-categoryContainer">
            <img
              :src="categories.goalImg"
              alt=""
              class="postCreation-goalImage"
            />
            <img
              :src="categories.specificGoalImg"
              alt=""
              class="postCreation-goalImage"
            />
          </div>
          <q-btn
            class="postCreation-changeTypeButton"
            @click="$router.push({ name: 'submit-2' })"
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
          :label="`${selectedGoalLabel} Title`"
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
      <span class="postCreation-dreamTitle">About {{ selectedGoalLabel }}</span>
      <q-input
        borderless
        dark
        hide-bottom-space
        bottom-slots
        label-color="grey-7"
        v-model="aboutDream"
        :label="`${selectedGoalLabel} Description`"
        class="registerDatas registerSecrete postCreation-dreamDescription"
        type="textarea"
      >
      </q-input>
      <div class="postCreation-rewardContainer">
        <span class="postCreation-rewardTitle">Initial Reward</span>
        <TokenSlider
          :user-karma="1001"
          :max-value="100000000"
          :review="false"
          v-model="tokens"
        ></TokenSlider>
      </div>
    </div>
    <div class="postCreation-submitDreamContainer">
      <!-- Error message -->
      <div v-if="postCreationStore.error" class="postCreation-error">
        {{ postCreationStore.error }}
      </div>
      <q-btn
        class="postCreation-submitButton"
        @click="handleSubmitPost"
        :disabled="!postCreationStore.isValid || postCreationStore.loading"
      >
        <span v-if="postCreationStore.loading">Creating post...</span>
        <span v-else>Submit Post</span>
      </q-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch, onMounted, onActivated, computed, nextTick } from "vue";
import { useRouter } from "vue-router";
import { usePostCreationStore } from "src/stores/postCreation";
import { usePostsStore } from "src/stores/posts";
import { useAuthStore } from "src/stores/auth";
import { Notify } from "quasar";
import UploadPostImgComponent from "src/components/partials/UploadPostImgComponent.vue";
import { PostCategories } from "src/components/models";
import TokenSlider from "../../components/partials/CustomThumb.vue";
import ImageIndexSlider from "src/components/partials/ImageIndexSlider.vue";
import type { UploadedImage } from "src/composables/useUpload";
import { useUpload } from "src/composables/useUpload";

const router = useRouter();
const postCreationStore = usePostCreationStore();
const postsStore = usePostsStore();
const authStore = useAuthStore();
const { uploadMultipleImages } = useUpload();

const fileInput = ref<HTMLInputElement | null>(null);
const imgIndex = ref(0);
const uploadedImages = ref<{ images: string[] }>({
  images: []
});
const isUploadingAdditional = ref(false);

// Computed property pre kontrolu, či sú nahraté obrázky
const hasUploadedImages = computed(() => {
  return uploadedImages.value.images && uploadedImages.value.images.length > 0;
});

// Computed properties from store
const aboutDream = computed({
  get: () => postCreationStore.description,
  set: (value) => postCreationStore.setField("description", value)
});

const postTitle = computed({
  get: () => postCreationStore.title,
  set: (value) => postCreationStore.setField("title", value)
});

const tokens = computed({
  get: () => postCreationStore.tokens,
  set: (value) => postCreationStore.setField("tokens", value)
});

// Get selected goal from localStorage
const selectedGoal = ref<string | null>(null);

// Get label for selected goal
const selectedGoalLabel = computed(() => {
  if (!selectedGoal.value) return "Dream";
  const goalMap: Record<string, string> = {
    problem: "Problem",
    dream: "Dream",
    idea: "Idea"
  };
  return goalMap[selectedGoal.value.toLowerCase()] || "Dream";
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

// Map numeric IDs to category names (for backward compatibility with old localStorage values)
const goalIdToName: Record<string, string> = {
  1: "problem",
  2: "dream",
  3: "idea"
};

const categoryIdToName: Record<string, string> = {
  1: "learning",
  2: "health",
  3: "traveling",
  4: "possessions",
  5: "relationships",
  6: "profession",
  7: "events",
  8: "other"
};

// Load selected values from localStorage and set icons
const loadSelectedCategories = () => {
  let goal = localStorage.getItem("postCreation_goal");
  let selectedCategory = localStorage.getItem("postCreation_category");

  if (process.env.NODE_ENV === "development") {
    console.log("📝 Raw values from localStorage:", {
      goal,
      selectedCategory
    });
  }

  // Konvertovať číselné ID na názvy (pre kompatibilitu so starými hodnotami v localStorage)
  // localStorage vracia stringy, takže musíme porovnať so stringmi
  if (goal && goalIdToName[String(goal)]) {
    goal = goalIdToName[String(goal)];
  }
  if (selectedCategory && categoryIdToName[String(selectedCategory)]) {
    selectedCategory = categoryIdToName[String(selectedCategory)];
  }

  if (process.env.NODE_ENV === "development") {
    console.log("📝 After conversion:", {
      goal,
      selectedCategory
    });
  }

  selectedGoal.value = goal;

  // Nastaviť hodnoty do store
  if (goal) {
    postCreationStore.setField("type", goal as "dream" | "problem" | "idea");
  }
  if (selectedCategory) {
    postCreationStore.setField("category", selectedCategory);
  }

  // Aktualizovať ikony
  categories.value = {
    goalImg: getGoalIcon(goal),
    specificGoalImg: getCategoryIcon(selectedCategory)
  };

  if (process.env.NODE_ENV === "development") {
    console.log("📝 Categories loaded:", {
      goalImg: categories.value.goalImg,
      specificGoalImg: categories.value.specificGoalImg
    });
  }
};

const categories = ref({
  goalImg: "/icons/CategoryIcons/dream.svg",
  specificGoalImg: "/icons/CategoryIcons/traveling.svg"
} as PostCategories);

// Load categories on mount
onMounted(() => {
  loadSelectedCategories();
});

// Reload categories when component is activated (e.g., returning from submit-2 page)
onActivated(() => {
  loadSelectedCategories();
});

// Handle post submission - submit to BE
const handleSubmitPost = async () => {
  if (process.env.NODE_ENV === "development") {
    console.log("🔵 handleSubmitPost called", {
      isValid: postCreationStore.isValid,
      loading: postCreationStore.loading,
      type: postCreationStore.type,
      category: postCreationStore.category,
      title: postCreationStore.title,
      description: postCreationStore.description
    });
  }

  if (!postCreationStore.isValid || postCreationStore.loading) {
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ Submit blocked:", {
        isValid: postCreationStore.isValid,
        loading: postCreationStore.loading
      });
    }
    return;
  }

  try {
    // Submit post via store
    const result = await postCreationStore.submit();

    if (process.env.NODE_ENV === "development") {
      console.log("✅ Submit result:", result);
    }

    // Update user tokens if returned from BE
    if (result?.user?.tokens !== undefined) {
      authStore.updateTokens(result.user.tokens);
      if (process.env.NODE_ENV === "development") {
        console.log("💰 Updated user tokens:", result.user.tokens);
      }
    }

    // Show success message
    Notify.create({
      type: "positive",
      message: "Post created successfully!",
      position: "top"
    });

    // Clear localStorage
    localStorage.removeItem("postCreation_goal");
    localStorage.removeItem("postCreation_category");

    // Refresh posts feed and my posts (for Donee home)
    await Promise.all([
      postsStore.fetchPosts({ sort: "help" }),
      postsStore.fetchMyDreams({ type: "dream" }),
      postsStore.fetchMyProblems({ type: "problem" }),
      postsStore.fetchMyIdeas({ type: "idea" })
    ]);

    // Navigate to donee posts page (Donee home)
    router.push({ name: "donee-posts" });
  } catch (error: unknown) {
    // Error je už nastavený v store
    if (postCreationStore.error) {
      Notify.create({
        type: "negative",
        message: postCreationStore.error,
        position: "top"
      });
    } else {
      Notify.create({
        type: "negative",
        message: "Failed to create post. Please try again.",
        position: "top"
      });
    }
  }
};
const deleteImg = () => {
  uploadedImages.value.images.splice(imgIndex.value, 1);
  // Aktualizovať store
  postCreationStore.setField("images", uploadedImages.value.images);
};
const handleImagesFromChild = async (imgs: UploadedImage[]) => {
  // Konvertovať UploadedImage[] na string[] (použiť secure_url)
  const imageUrls = imgs.map((img) => img.secure_url);

  if (process.env.NODE_ENV === "development") {
    console.log("📸 handleImagesFromChild called with:", imgs);
    console.log("📸 Extracted URLs:", imageUrls);
  }

  // Nastaviť obrázky reaktívne - použiť nový array pre lepšiu reaktivitu
  uploadedImages.value.images = [...imageUrls];

  // Aktualizovať store
  postCreationStore.setField("images", imageUrls);

  // Počkať na DOM update
  await nextTick();
};
const handleIndex = (index: number) => {
  imgIndex.value = index;
};
watch(imgIndex, () => {
  if (process.env.NODE_ENV === "development") {
    console.log(imgIndex.value);
  }
});
const openFileInput = () => {
  if (fileInput.value) {
    fileInput.value.click();
  }
};

const handleFileChange = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (!files || files.length === 0) {
    return;
  }

  // Limit na max 5 obrázkov celkovo
  const maxImages = 5;
  const currentCount = uploadedImages.value.images.length;
  const remainingSlots = maxImages - currentCount;

  if (remainingSlots <= 0) {
    Notify.create({
      type: "negative",
      message: `Maximum ${maxImages} images allowed.`,
      position: "top"
    });
    return;
  }

  const filesToUpload = Array.from(files).slice(0, remainingSlots);
  isUploadingAdditional.value = true;

  try {
    const folder = "uploads";
    const uploaded = await uploadMultipleImages(filesToUpload, folder);

    // Pridať nové Cloudinary URL-y do zoznamu
    const newImageUrls = uploaded.map((img) => img.secure_url);
    uploadedImages.value.images = [...uploadedImages.value.images, ...newImageUrls];

    // Aktualizovať store
    postCreationStore.setField("images", uploadedImages.value.images);

    if (process.env.NODE_ENV === "development") {
      console.log("📸 Additional images uploaded:", newImageUrls.length);
      console.log("📸 Total images:", uploadedImages.value.images.length);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ Failed to upload additional images:", error);
    }
    Notify.create({
      type: "negative",
      message: "Failed to upload images. Please try again.",
      position: "top"
    });
  } finally {
    isUploadingAdditional.value = false;
    if (fileInput.value) {
      fileInput.value.value = "";
    }
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
  .postCreation-swiperButton {
    margin-top: 1rem !important;
  }
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
  .postCreation-header {
    position: absolute;
    width: 100%;
    z-index: 111;
    padding: 0.6rem;

    .postCreation-btn {
      position: fixed;
      margin: 0 0.4rem;
      width: 2.8rem;
      height: 2.8rem;
      border-radius: 2rem;
      background: linear-gradient(
        135deg,
        rgba(255, 255, 255, 0.248) 0%,
        rgba(0, 0, 0, 0.126) 100%
      );

      backdrop-filter: blur(1rem);
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
      top: 31.5rem;
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

    .postCreation-rewardTitle {
      font-family: poppinsSemiBold;
      color: white;
      margin-bottom: -1.6rem;
      font-size: 1.1rem;
      width: 40%;
      margin-bottom: -2.6rem;
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

      &:disabled {
        opacity: 0.5;
        cursor: not-allowed;
      }
    }
  }
}
</style>
