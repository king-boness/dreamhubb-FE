<template>
  <div class="donatorReview-page">
    <div
      class="donatorReview-headerImage"
      :style="{
        backgroundImage: 'url(' + profile.user.userBackground + ')'
      }"
    >
      <div class="detailIconDiv">
        <q-btn class="PostDetail-btn PostDetail-closeBtn"
          ><img
            src="/icons/closeIcon.svg"
            alt=""
            class="closeIcon"
            @click="$router.go(-1)"
          />
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
    </div>
    <div class="donatorReview-userDetails">
      <img
        :src="profile.user.userPicture"
        alt=""
        class="donatorReview-profilePicture"
      />
      <span class="donatorReview-profileName">{{ profile.user.userName }}</span>
    </div>
    <div class="donatorReview-userInputSection">
      <span class="donatorReview-inputSectionTitle">Leave a Review!</span>

      <q-input
        borderless
        dark
        hide-bottom-space
        bottom-slots
        v-model="reviewMessage"
        label="Type your message for a Donor..."
        class="registerDatas registerSecrete reviewInput"
        type="textarea"
      >
      </q-input>
      <div class="donatorReview-imageUploadDiv">
        <UploadImgComponent
          class="donatorReview-uploadImageComponent"
          :max="2"
        ></UploadImgComponent>
      </div>
      <div class="donatorReview-donorRating">
        <span class="donatorReview-ratingTitle">Rate your Donor</span>
        <CustomThumb
          :user-karma="100"
          :max-value="100"
          :review="true"
        ></CustomThumb>
      </div>
      <q-btn
        class="donatorReview-reviewButton"
        @click="$router.push({ name: 'donee-posts' })"
        >Leave a review</q-btn
      >
    </div>
  </div>
</template>
<style lang="scss">
.reviewInput {
  .q-field__label {
    color: rgba(255, 255, 255, 0.297) !important;
  }
}
</style>
<style scoped lang="scss">
.donatorReview-page {
  .donatorReview-headerImage {
    height: 15rem;
    width: 100%;
    background-repeat: round;
    background-size: cover;
    box-shadow: inset 0rem 1rem 8rem 0rem rgba(0, 0, 0, 0.75),
      inset -1rem 0rem 7rem -2rem rgba(0, 0, 0, 0.75);
    .detailIconDiv {
      position: absolute;
      top: 1.5rem;
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
  }
  .donatorReview-userDetails {
    display: flex;
    align-items: center;
    justify-content: start;
    gap: 0.7rem;
    border-radius: 1rem;
    background: linear-gradient(
      135deg,
      rgba(0, 0, 0, 0.33) 0%,
      rgba(23, 23, 23, 0.33) 100%
    );
    backdrop-filter: blur(10px);
    padding: 0 1rem;
    width: 11.8rem;
    height: 4rem;
    margin-top: -3rem;
    margin-left: 1rem;
    .donatorReview-profilePicture {
      border-radius: 50%;
      height: 3rem;
    }
    .donatorReview-profileName {
      color: white;
      font-family: poppinsSemiBold;
      font-size: 1.2rem;
    }
  }
  .donatorReview-userInputSection {
    margin-top: 1.5rem;
    padding: 0 1rem;
    .donatorReview-inputSectionTitle {
      color: white;
      font-family: poppinsSemiBold;
      font-size: 1.5rem;
    }
    .reviewInput {
      width: 100%;
      height: 10rem;
      padding-bottom: 1rem;
      border: 0.08rem solid rgba(255, 255, 255, 0.118);
      margin-top: 2rem;
      margin-bottom: 0.7rem;
      background: linear-gradient(
        135deg,
        rgba(0, 0, 0, 0.66) 0%,
        rgba(23, 23, 23, 0.66) 100%
      );
    }
    .donatorReview-uploadImageComponent {
      width: 100%;
    }

    .donatorReview-donorRating {
      margin-top: 2.5rem;
      display: flex;
      flex-direction: column;
      .donatorReview-ratingTitle {
        color: white;
        margin-bottom: -1.4rem;
        font-family: poppinsSemiBold;
        font-size: 0.9rem;
      }
    }
    .donatorReview-reviewButton {
      background-color: rgba(182, 0, 67, 1);
      color: white;
      border: none;
      font-size: 1.2rem;
      height: 3.3rem;
      font-family: montseraatSemiBold;
      border-radius: 0.5rem !important;
      margin-top: 0.8rem;
      margin-bottom: 1.4rem;
    }
  }
}
</style>
<script setup lang="ts">
import { ref } from "vue";
import { UserProfile } from "src/components/models";
import UploadImgComponent from "src/components/partials/UploadImgComponent.vue";
import CustomThumb from "src/components/partials/CustomThumb.vue";

const reviewMessage = ref("");
const profile = ref({
  user: {
    userName: "John Doe",
    userPicture: "/images/Auth/profilePicture.jpeg",
    userBackground: "/images/Auth/postBackground.png"
  }
} as UserProfile);
</script>
