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
        v-if="uploadedImages.images.length != 0"
        :images="uploadedImages.images"
        class="postCreation-imageSlider"
        :count="uploadedImages.images.length"
        @change="handleIndex"
      ></ImageIndexSlider>
      <UploadPostImgComponent @images-updated="handleImagesFromChild" v-else />
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
        <q-btn class="postCreation-addImgButton" @click="openFileInput">
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
          label="Dream Title"
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
      <span class="postCreation-dreamTitle">About Dream</span>
      <q-input
        borderless
        dark
        hide-bottom-space
        bottom-slots
        label-color="grey-7"
        v-model="aboutDream"
        label="Dream Description"
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
        ></TokenSlider>
      </div>
    </div>
    <div class="postCreation-submitDreamContainer">
      <q-btn
        class="postCreation-submitButton"
        @click="$router.push({ name: 'donee-posts' })"
        >Submit Post</q-btn
      >
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, watch } from "vue";
import UploadPostImgComponent from "src/components/partials/UploadPostImgComponent.vue";
import { PostCategories } from "src/components/models";
import TokenSlider from "../../components/partials/CustomThumb.vue";
import ImageIndexSlider from "src/components/partials/ImageIndexSlider.vue";

const aboutDream = ref("");
const postTitle = ref("");
const fileInput = ref<HTMLInputElement | null>(null);
const imgIndex = ref(0);
const uploadedImages = ref({
  images: ref<string[]>([])
});
const categories = ref({
  goalImg: "/icons/dreamPost-icon.svg",
  specificGoalImg: "/icons/travellingPost-icon.svg"
} as PostCategories);
const deleteImg = () => {
  let slicedImageArray = uploadedImages.value.images.splice(imgIndex.value, 1);
  slicedImageArray = uploadedImages.value.images;
};
const handleImagesFromChild = (imgs: any) => {
  uploadedImages.value.images = imgs;
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

const handleFileChange = (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = () => {
        uploadedImages.value.images.push(reader.result as string);
        if (process.env.NODE_ENV === "development") {
        console.log(uploadedImages.value.images.length);
        }
      };

      reader.readAsDataURL(file);
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
      transition: all 0.2s;
    }
  }
  .postDetail-img {
    width: 100%;
  }
}
</style>
<style scoped lang="scss">
.iphoneDevice-postCreation {
  padding-top: 3.3rem !important;
}
.postCreation-uploadedImgContainer::after {
  content: "";
  position: absolute;
  top: 21px;
  left: 0;
  right: 0;
  height: 50%;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 0.712)
  );
  pointer-events: none;
}
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
        color: $primary;
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
        }
      }

      .postCreation-addImgButton {
        width: 3rem;
        height: 3rem;
        border-radius: 2rem;
        background: linear-gradient(
          135deg,
          rgba(255, 255, 255, 0.175) 0%,
          rgba(255, 255, 255, 0.07) 100%
        );
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
      gap: 0.5rem;
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
        gap: 0.5rem;
        padding-top: 1.5rem;

        .postCreation-goalImage {
          height: 1.4rem;
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
    justify-content: center;
    padding: 0 1rem;
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
    }
  }
}
</style>
