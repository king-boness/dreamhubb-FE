<template>
  <div class="dreamDetail-page">
    <div class="dreamDetail-swiperContainer">
      <ImageIndexSlider
        :count="postDetail.images.length"
        :images="postDetail.images"
      ></ImageIndexSlider>
      <div class="postDetail-blurContainer"></div>
      <div class="detailIconDiv" :class="{ iphoneDevice: $q.platform.is.ios }">
        <q-btn
          class="PostDetail-btn PostDetail-closeBtn"
          @click="$router.go(-1)"
          ><img src="/icons/closeIcon.svg" alt="" class="closeIcon" />
        </q-btn>

        <div class="detailIconDivRight">
          <q-btn class="PostDetail-btn"
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M12 14.6667C11.4444 14.6667 10.9722 14.4723 10.5833 14.0834C10.1944 13.6945 10 13.2223 10 12.6667C10 12.5889 10.0056 12.5083 10.0167 12.4247C10.0278 12.3416 10.0444 12.2667 10.0667 12.2L5.36667 9.46671C5.17778 9.63337 4.96667 9.76382 4.73333 9.85804C4.5 9.95271 4.25556 10 4 10C3.44444 10 2.97222 9.8056 2.58333 9.41671C2.19444 9.02782 2 8.5556 2 8.00004C2 7.44449 2.19444 6.97226 2.58333 6.58337C2.97222 6.19449 3.44444 6.00004 4 6.00004C4.25556 6.00004 4.5 6.04715 4.73333 6.14137C4.96667 6.23604 5.17778 6.36671 5.36667 6.53337L10.0667 3.80004C10.0444 3.73337 10.0278 3.65849 10.0167 3.57537C10.0056 3.49182 10 3.41115 10 3.33337C10 2.77782 10.1944 2.3056 10.5833 1.91671C10.9722 1.52782 11.4444 1.33337 12 1.33337C12.5556 1.33337 13.0278 1.52782 13.4167 1.91671C13.8056 2.3056 14 2.77782 14 3.33337C14 3.88893 13.8056 4.36115 13.4167 4.75004C13.0278 5.13893 12.5556 5.33337 12 5.33337C11.7444 5.33337 11.5 5.28604 11.2667 5.19137C11.0333 5.09715 10.8222 4.96671 10.6333 4.80004L5.93333 7.53337C5.95556 7.60004 5.97222 7.67493 5.98333 7.75804C5.99444 7.8416 6 7.92226 6 8.00004C6 8.07782 5.99444 8.15826 5.98333 8.24137C5.97222 8.32493 5.95556 8.40004 5.93333 8.46671L10.6333 11.2C10.8222 11.0334 11.0333 10.9027 11.2667 10.808C11.5 10.7138 11.7444 10.6667 12 10.6667C12.5556 10.6667 13.0278 10.8612 13.4167 11.25C13.8056 11.6389 14 12.1112 14 12.6667C14 13.2223 13.8056 13.6945 13.4167 14.0834C13.0278 14.4723 12.5556 14.6667 12 14.6667Z"
                fill="#FCFCFC"
              /></svg
          ></q-btn>
          <q-btn class="PostDetail-btn"
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M7.99992 14.2333L7.03325 13.3533C3.59992 10.24 1.33325 8.18 1.33325 5.66667C1.33325 3.60667 2.94659 2 4.99992 2C6.15992 2 7.27325 2.54 7.99992 3.38667C8.72659 2.54 9.83992 2 10.9999 2C13.0533 2 14.6666 3.60667 14.6666 5.66667C14.6666 8.18 12.3999 10.24 8.96659 13.3533L7.99992 14.2333Z"
                fill="#FCFCFC"
              /></svg
          ></q-btn>
        </div>
      </div>
      <div class="dreamDetail-postInformation">
        <div class="dreamDetail-titleContainer">
          <img
            class="dreamDetail-categoryImg"
            :src="postDetail.goalImage"
            alt=""
          />
          <span class="dreamDetail-title">{{ postDetail.name }}</span>
        </div>
        <q-btn class="dreamDetail-buttonBack" @click="$router.go(-1)">
          <img src="/icons/arrowButton-icon.svg" alt="" />
        </q-btn>
      </div>
    </div>
    <div class="dreamDetail-commentsSection">
      <CommentsFilterCcomponent
        :Help="Help"
        :Contribution="Contribution"
        :profile="profile"
      ></CommentsFilterCcomponent>
    </div>
  </div>
</template>
<style lang="scss">
.postDetail-img {
  width: 100%;
  height: 100%;
}
</style>
<style scoped lang="scss">
.dreamDetail-page {
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.425) 0%,
    rgba(23, 23, 23, 0.092) 100%
  );

  .dreamDetail-swiperContainer {
    position: relative;
    height: 37rem;
  }
  .detailIconDiv {
    position: absolute;
    top: 2.5rem;
    width: 100%;
    z-index: 1;
    display: flex;
    flex-direction: row;
    justify-content: space-evenly;

    .detailIconDivRight {
      display: flex;
      margin-left: 12rem;
    }
    .PostDetail-btn {
      margin: 0 0.4rem;
      width: 2.8rem;
      height: 2.8rem;
      border-radius: 6.1875rem;
      background: linear-gradient(
        135deg,
        rgba(106, 105, 105, 0.656) 0%,
        rgba(0, 0, 0, 0.483) 100%
      );
      backdrop-filter: blur(1rem);
      svg {
        scale: 1.3;
      }
    }
  }
  .dreamDetail-postInformation {
    position: absolute;
    top: 85.5%;
    z-index: 11;
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    align-items: center;
    width: 100%;
    padding: 0 1.2rem;
    .dreamDetail-titleContainer {
      background: linear-gradient(
        108.46deg,
        rgba(0, 0, 0, 0.786) 1%,
        rgba(23, 23, 23, 0.789) 100%
      );
      width: auto;
      padding: 0.9rem 0.7rem;
      border-radius: 1.3rem;
      display: flex;
      align-items: center;

      .dreamDetail-categoryImg {
        height: 1.2rem;
      }
      .dreamDetail-title {
        font-size: 1.4rem;
        font-family: poppinsSemiBold;
        color: white;
        margin-left: 0.8rem;
      }
    }
    .dreamDetail-buttonBack {
      margin: 0 0.4rem;
      width: 2.8rem;
      height: 2.8rem;
      border-radius: 6.1875rem;
      background: linear-gradient(
        135deg,
        rgba(106, 105, 105, 0.902) 0%,
        rgba(0, 0, 0, 0.68) 100%
      );
      backdrop-filter: blur(10px);
    }
  }
}
</style>
<script setup lang="ts">
import ImageIndexSlider from "src/components/partials/ImageIndexSlider.vue";
import CommentsFilterCcomponent from "src/components/partials/CommentsFilterCcomponent.vue";
import { UserProfile } from "src/components/models";

import { ref } from "vue";

const profile = ref({
  categories: {
    name: "Problems",
    amount: 34,
    img: "/icons/problemIcon.svg"
  }
} as UserProfile);
const postDetail = ref({
  name: "Aurora Expedition",
  goalImage: "/images/Auth/goalPicture.png",
  images: [
    "https://images.unsplash.com/photo-1528155124528-06c125d81e89?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=689&q=80",
    "https://images.unsplash.com/photo-1568607689150-17e625c1586e?ixlib=rb-4.0.3&ixid=MnwxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8&auto=format&fit=crop&w=1170&q=80",
    "https://i.etsystatic.com/32050623/r/il/76af79/4305610002/il_fullxfull.4305610002_2o9t.jpg",
    "https://images.unsplash.com/photo-1686890121573-5feec595490e?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1287&q=80"
  ],
  date: "09/15/2023",
  location: "Island, Reykjavik",
  views: 156,
  description:
    "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim. Eu id nibh iaculis orci bibendum aenean morbi id. Bibendum semper viverra aenean turpis risus libero amet aliquam. ",
  aboutDonee:
    "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim. Eu id nibh iaculis orci bibendum aenean morbi id. Bibendum semper viverra aenean turpis risus libero amet aliquam. ",
  doneeName: "John Doe",
  karmaValue: 1584
});

const Contribution = ref([
  {
    comments: {
      donatedValue: 3000,
      donatedImage: "/images/Auth/postBackground.png",
      donationOwnerName: "John Doe",
      donationOwnerPicture: "/images/Auth/profilePicture.jpeg",
      description:
        "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim. Eu id nibh iaculis orci.",
      private: true,
      type: "Contribution",
      typeOfHelp: "Small Donation",
      amountOfHelp: 25
    }
  },
  {
    comments: {
      donatedValue: 3000,
      donatedImage: "/images/Auth/postBackground.png",
      donationOwnerName: "John Doe",
      donationOwnerPicture: "/images/Auth/profilePicture.jpeg",
      description:
        "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim. Eu id nibh iaculis orci.",
      private: false,
      type: "Contribution",
      typeOfHelp: "Top up",
      amountOfHelp: 400
    }
  }
] as UserProfile[]);

const Help = ref([
  {
    comments: {
      donatedValue: 3000,
      donatedImage: "/images/Auth/postBackground.png",
      donationOwnerName: "Mackenzie Doe",
      donationOwnerPicture: "/images/Auth/profilePicture.jpeg",
      description:
        "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim. Eu id nibh iaculis orci.",
      private: false,
      type: "Help"
    }
  },
  {
    comments: {
      donatedValue: 3000,
      donatedImage: "/images/Auth/postBackground.png",
      donationOwnerName: "John Doe",
      donationOwnerPicture: "/images/Auth/profilePicture.jpeg",
      description:
        "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim. Eu id nibh iaculis orci.",
      private: true,
      type: "Help"
    }
  }
] as UserProfile[]);
</script>
