<template>
  <div class="topDream-page">
    <div class="topDream-imageSwiperContainer">
      <div class="detailIconDiv" :class="{ iphoneDevice: $q.platform.is.ios }">
        <q-btn
          class="PostDetail-btn PostDetail-closeBtn"
          @click="$router.go(-1)"
          ><img src="/icons/closeIcon.svg" alt="" class="closeIcon" />
        </q-btn>
        <div class="detailIconDivRight">
          <q-btn class="PostDetail-btn TopUpDream-btn"
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M12 14.6667C11.4444 14.6667 10.9722 14.4723 10.5833 14.0834C10.1944 13.6945 10 13.2223 10 12.6667C10 12.5889 10.0056 12.5083 10.0167 12.4247C10.0278 12.3416 10.0444 12.2667 10.0667 12.2L5.36667 9.46671C5.17778 9.63337 4.96667 9.76382 4.73333 9.85804C4.5 9.95271 4.25556 10 4 10C3.44444 10 2.97222 9.8056 2.58333 9.41671C2.19444 9.02782 2 8.5556 2 8.00004C2 7.44449 2.19444 6.97226 2.58333 6.58337C2.97222 6.19449 3.44444 6.00004 4 6.00004C4.25556 6.00004 4.5 6.04715 4.73333 6.14137C4.96667 6.23604 5.17778 6.36671 5.36667 6.53337L10.0667 3.80004C10.0444 3.73337 10.0278 3.65849 10.0167 3.57537C10.0056 3.49182 10 3.41115 10 3.33337C10 2.77782 10.1944 2.3056 10.5833 1.91671C10.9722 1.52782 11.4444 1.33337 12 1.33337C12.5556 1.33337 13.0278 1.52782 13.4167 1.91671C13.8056 2.3056 14 2.77782 14 3.33337C14 3.88893 13.8056 4.36115 13.4167 4.75004C13.0278 5.13893 12.5556 5.33337 12 5.33337C11.7444 5.33337 11.5 5.28604 11.2667 5.19137C11.0333 5.09715 10.8222 4.96671 10.6333 4.80004L5.93333 7.53337C5.95556 7.60004 5.97222 7.67493 5.98333 7.75804C5.99444 7.8416 6 7.92226 6 8.00004C6 8.07782 5.99444 8.15826 5.98333 8.24137C5.97222 8.32493 5.95556 8.40004 5.93333 8.46671L10.6333 11.2C10.8222 11.0334 11.0333 10.9027 11.2667 10.808C11.5 10.7138 11.7444 10.6667 12 10.6667C12.5556 10.6667 13.0278 10.8612 13.4167 11.25C13.8056 11.6389 14 12.1112 14 12.6667C14 13.2223 13.8056 13.6945 13.4167 14.0834C13.0278 14.4723 12.5556 14.6667 12 14.6667Z"
                fill="#0F0026"
              /></svg
          ></q-btn>
          <q-btn class="PostDetail-btn TopUpDream-btn"
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
            >
              <path
                d="M7.99992 14.2333L7.03325 13.3533C3.59992 10.24 1.33325 8.18 1.33325 5.66667C1.33325 3.60667 2.94659 2 4.99992 2C6.15992 2 7.27325 2.54 7.99992 3.38667C8.72659 2.54 9.83992 2 10.9999 2C13.0533 2 14.6666 3.60667 14.6666 5.66667C14.6666 8.18 12.3999 10.24 8.96659 13.3533L7.99992 14.2333Z"
                fill="#0F0026"
              /></svg
          ></q-btn>
        </div>
      </div>
      <ImageIndexSlider
        :count="postDetail.images.length"
        :images="postDetail.images"
      ></ImageIndexSlider>
      <div class="topDream-titleContainer">
        <img
          class="topDream-postCategoryImage"
          :src="postDetail.goalImage"
          alt=""
        />
        <span class="topDream-postTitle">{{ postDetail.name }}</span>
      </div>
    </div>
    <div
      class="topDream-descriptionContainer"
      :class="{ lightModeDescription: isBodyLight }"
    >
      <img
        src="/icons/topUpDream-birdImg.png"
        alt=""
        class="topDream-birdImg"
      />
      <span class="topDream-description-title"
        >Let everyone know about your Dream</span
      >
      <div class="topDream-textContainer">
        <span class="topDream-description"
          >Any person that can give or provide anything or any service that
          someone else might be.</span
        >
      </div>
    </div>
    <div class="topDream-valuesContainer">
      <span class="topDream-valueTitle">Top up the dream</span>
      <div v-for="(card, i) in cards" :key="i" class="cardContainer">
        <div class="karmaGainedCard">
          <div class="karmaGainedTitleDiv">
            <span class="karmaGainedTitle">{{ card.overview.title }}</span>
          </div>
          <div class="overwievDonationsDiv">
            <img
              :src="card.overview.comesFromImg"
              alt=""
              class="karmaGainedImgGift"
            />
            <span class="karmaGainedDescription">{{
              card.overview.comesFrom
            }}</span>
          </div>
          <div class="karmaValue">
            <img
              src="/icons/KarmaIcon.png"
              alt=""
              class="karmaGainedImgKarma"
            />
            <span class="karmaGainedKarmaValue">{{
              formatNumber(card.overview.comesFromValue)
            }}</span>
          </div>
        </div>
      </div>
    </div>
    <div class="topDream-sliderContainer">
      <div class="topDream-sliderTitleContainer">
        <span class="topDream-sliderTitle">Tokens to Top up</span>
        <q-btn class="topDream-questiobButton"
          ><img
            class="topDream-questionImg"
            src="/icons/questionIcon.svg"
            alt=""
        /></q-btn>
      </div>
      <TokenSlider
        :user-karma="450"
        :max-value="1000"
        :review="false"
      ></TokenSlider>
    </div>
    <div class="topDream-buttonContainer">
      <q-btn class="topDream-topUpButton"
        ><img src="/icons/arrowUpWhite-icon.svg" alt="" />
        <span>Top up your dream</span>
      </q-btn>
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
.topDream-page {
  .topDream-imageSwiperContainer {
    height: 19rem;
    position: relative;

    .detailIconDiv {
      width: 100%;
      margin-top: 2.5rem;
      display: flex;
      justify-content: space-evenly;
      position: absolute;
      top: 0;
      z-index: 2;
      .detailIconDivRight {
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
      }
      * {
        fill: white;
      }
      svg {
        scale: 1.3 !important;
      }
    }
    .topDream-titleContainer {
      position: absolute;
      top: 67%;
      z-index: 11;
      left: 18%;
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
      gap: 0.5rem;
      .topDream-postCategoryImage {
        height: 1.2rem;
      }
      .topDream-postTitle {
        font-size: 1.4rem;
        font-family: poppinsSemiBold;
        color: white;
      }
    }
  }
  .topDream-descriptionContainer {
    position: relative;
    background-image: url("/icons/topUpDream-gradientBg.png");
    background-repeat: no-repeat;
    background-position: center;
    background-size: cover;
    height: 15rem;
    display: flex;
    flex-direction: column;
    padding: 1rem;
    padding-top: 2rem;
    gap: 0.8rem;
    .topDream-birdImg {
      position: absolute;
      top: 40%;
      left: 40%;
    }
    .topDream-description-title {
      color: white;
      font-family: poppinsSemiBold;
      font-size: 1.5rem;
    }
    .topDream-textContainer {
      padding-right: 5.9rem;
    }
    .topDream-description {
      color: rgba(255, 255, 255, 0.736);
      font-family: inter;
      font-size: 1rem;
    }
  }
  .topDream-valuesContainer {
    padding: 1rem 1rem;
    display: flex;
    flex-direction: column;
    justify-content: start;

    .topDream-valueTitle {
      color: white;
      font-family: poppinsSemiBold;
      font-size: 0.9rem;
      margin-bottom: 0.8rem;
    }
    .karmaGainedCard {
      background: linear-gradient(
        108.46deg,
        rgba(37, 37, 37, 0.405) 0%,
        rgba(23, 23, 23, 0.33) 100%
      );
      // background-color: pink;
      height: 3.6rem;
      width: 100%;
      display: flex;
      align-items: center;
      justify-content: space-between;
      padding: 0 1rem;
      margin-bottom: 0.5rem;
      border-radius: 0.8rem;

      .karmaGainedTitleDiv {
        width: 5rem;
        display: flex;

        .karmaGainedTitle {
          color: white;
          font-size: 0.7rem;
          font-family: poppins;
          line-height: 0.9rem;
          text-transform: Uppercase;
        }
      }

      .overwievDonationsDiv {
        display: flex;
        align-items: center;
        justify-content: center;
        margin-left: -4.5rem;

        .karmaGainedImgGift {
          height: 1.7rem;
          margin-right: 0.5rem;
          margin-bottom: 0.2rem;
        }

        .karmaGainedDescription {
          color: white;
          font-family: poppins;
          font-size: 0.9rem;
        }
      }

      .karmaValue {
        display: flex;
        align-items: center;
        background-color: rgba(189, 0, 67, 0.1);
        height: 2.5rem;
        width: auto;
        border-radius: 0.6rem;
        padding: 0.3rem 0.6rem;

        .karmaGainedImgKarma {
          height: 1.2rem;
        }

        .karmaGainedKarmaValue {
          color: $primary;
          font-family: poppinsBold;
          margin-left: 0.1rem;
          font-size: 1rem;
        }
      }
    }
  }
  .topDream-sliderContainer {
    padding: 0 1.8rem;
    .topDream-sliderTitleContainer {
      margin-bottom: -2.9rem;
      .topDream-sliderTitle {
        color: white;
        font-family: poppinsSemiBold;
        font-size: 1.1rem;
      }
      .topDream-questiobButton {
        width: 1.5rem;
        border-radius: 100%;
        padding: 0;
        margin-left: 0.5rem;
      }
      .topDream-questionImg {
        height: 1.5em;
      }
    }
  }
  .topDream-buttonContainer {
    display: flex;
    justify-content: center;
    padding-top: 1rem;
  }
  .topDream-topUpButton {
    background-color: rgba(182, 0, 67, 1);
    color: white;
    border: none;
    font-size: 1.2rem;
    height: 3.2rem;
    width: 22rem;
    font-family: montseraatSemiBold;
    border-radius: 0.5rem !important;
    margin-bottom: 0.8rem !important;

    img {
      margin-right: 0.5rem;
    }
  }
}
</style>
<script setup lang="ts">
import ImageIndexSlider from "src/components/partials/ImageIndexSlider.vue";
import TokenSlider from "../../components/partials/CustomThumb.vue";
import { Stats } from "src/components/models";
import { formatNumber } from "src/components/partials/FunctionsComponent.vue";
import { ref, onMounted } from "vue";

const isBodyLight = ref(false);

const checkBodyClass = () => {
  isBodyLight.value = document.body.classList.contains("body--light");
};

onMounted(() => {
  checkBodyClass();
});

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

const cards = ref([
  {
    overview: {
      title: "Available from",
      comesFrom: "Donations",
      comesFromImg: "/icons/giftIcon-red.svg",
      comesFromValue: 1450
    }
  },
  {
    overview: {
      title: "your full balance",
      comesFromValue: 145
    }
  }
] as Stats[]);
</script>
