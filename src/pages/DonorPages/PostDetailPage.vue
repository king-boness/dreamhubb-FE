<template>
  <div class="column col-12 postDetail">
    <!-- TODO: dynamicke nacitanie bg -->
    <div class="postDetailBg">
      <ImageIndexSlider
        :images="postDetail.images"
        :count="postDetail.images.length"
      />
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
              />
            </svg>
          </q-btn>
          <q-btn
            class="PostDetail-btn"
            @click="isLiked = !isLiked"
            :class="{ liked: isLiked }"
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
      <div class="postDetailInformations">
        <div class="postGoal">
          <img :src="postDetail.goalImage" alt="" class="postGoalImg" />
          <span class="postGoalText">{{ postDetail.name }}</span>
        </div>

        <q-btn
          class="PostDetail-btn PostDetail-messageButton"
          @click="routeCheck('post-details')"
        >
          <img src="/icons/messageIcon.svg" alt="" class="PostDetailIcon" />
        </q-btn>
      </div>
    </div>

    <div class="postDetails">
      <div class="postDate postCloserInfo">
        <img src="/icons/calendarIcon.svg" alt="" />
        <span class="postDatas">{{ postDetail.date }}</span>
      </div>
      <div class="postLocation postCloserInfo">
        <img src="/icons/locationIcon.svg" alt="" />
        <span class="postDatas">{{ postDetail.location }}</span>
      </div>
      <div class="postViews postCloserInfo">
        <img src="/icons/viewIcon.svg" alt="" />
        <span class="postDatas">{{ postDetail.views }}</span>
      </div>
    </div>
    <div class="aboutPost">
      <h4 class="postDetailHeading">About Dream</h4>
      <span class="aboutPostDescription">{{ postDetail.description }}</span>
      <div class="reportProblem" v-if="!(route.name === 'donee-post-detail')">
        <img class="reportDreamImg" src="/icons/reportIcon.svg" alt="" />
        <a class="reportDreamLink" @click="$router.push('post-detail/report')"
          >Report a dream</a
        >
      </div>
      <div class="aboutDonne">
        <h3 class="aboutDoneeHeading">About Donee</h3>
        <div class="doneeProfile">
          <img
            class="doneeProfilePicture"
            src="/images/Auth/profilePicture.jpeg"
            alt=""
          />
          <span class="doneeProfileName">{{ postDetail.doneeName }}</span>
          <div
            class="postDetail-valueContainer"
            v-if="route.name === 'donee-post-detail'"
          >
            <img src="/icons/KarmaIcon.png" alt="" />
            <span>{{ postDetail.karmaValue }}</span>
          </div>
        </div>
        <span class="doneeProfileDescription"
          >{{ postDetail.aboutDonee }}
        </span>
      </div>
      <div class="row justify-center">
        <SwipeDrawerComponent
          v-if="route.name === 'donor-post-detail'"
          :amount="postDetail.karmaValue"
        />
        <div v-else class="postDetail-doneeFooter">
          <q-btn class="postDetail-editDreamButton"
            ><span>Edit my dream</span></q-btn
          >
          <q-btn
            class="postDetail-topUpDreamButton"
            @click="$router.push({ name: 'donee-post-detail-topUp' })"
            ><svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              class="topUpIcon"
            >
              <path
                d="M12 16C12.2833 16 12.521 15.9043 12.713 15.713C12.905 15.5217 13.0007 15.284 13 15V11.8L13.9 12.7C14.0833 12.8833 14.3167 12.975 14.6 12.975C14.8833 12.975 15.1167 12.8833 15.3 12.7C15.4833 12.5167 15.575 12.2833 15.575 12C15.575 11.7167 15.4833 11.4833 15.3 11.3L12.7 8.7C12.6 8.6 12.4917 8.52933 12.375 8.488C12.2583 8.44667 12.1333 8.42567 12 8.425C11.8667 8.425 11.7417 8.446 11.625 8.488C11.5083 8.53 11.4 8.60067 11.3 8.7L8.7 11.3C8.51667 11.4833 8.425 11.7167 8.425 12C8.425 12.2833 8.51667 12.5167 8.7 12.7C8.88333 12.8833 9.11667 12.975 9.4 12.975C9.68333 12.975 9.91667 12.8833 10.1 12.7L11 11.8V15C11 15.2833 11.096 15.521 11.288 15.713C11.48 15.905 11.7173 16.0007 12 16ZM12 22C10.6167 22 9.31667 21.7377 8.1 21.213C6.88333 20.6883 5.825 19.9757 4.925 19.075C4.025 18.175 3.31267 17.1167 2.788 15.9C2.26333 14.6833 2.00067 13.3833 2 12C2 10.6167 2.26267 9.31667 2.788 8.1C3.31333 6.88333 4.02567 5.825 4.925 4.925C5.825 4.025 6.88333 3.31233 8.1 2.787C9.31667 2.26167 10.6167 1.99933 12 2C13.3833 2 14.6833 2.26267 15.9 2.788C17.1167 3.31333 18.175 4.02567 19.075 4.925C19.975 5.825 20.6877 6.88333 21.213 8.1C21.7383 9.31667 22.0007 10.6167 22 12C22 13.3833 21.7373 14.6833 21.212 15.9C20.6867 17.1167 19.9743 18.175 19.075 19.075C18.175 19.975 17.1167 20.6877 15.9 21.213C14.6833 21.7383 13.3833 22.0007 12 22Z"
                fill="white"
              />
              <circle cx="20" cy="4" r="4" fill="#BD0043" /></svg
          ></q-btn>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import SwipeDrawerComponent from "src/components/partials/SwipeDrawerComponent.vue";
import ImageIndexSlider from "src/components/partials/ImageIndexSlider.vue";
import { useRouter, useRoute } from "vue-router";
import { PostDetail } from "src/components/models";
const isLiked = ref(false);
const router = useRouter();
const route = useRoute();
const routesName = route.name?.toString() || "";

const routeCheck = (name: string) => {
  if (process.env.NODE_ENV === "development") {
  console.log(routesName);
  }
  routesName.startsWith("donee")
    ? router.push({ name: `donee-${name}` })
    : router.push({ name: `donor-${name}` });
};

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
} as PostDetail);
</script>

<style scoped lang="scss">
.liked {
  * {
    fill: #bd0043;
    opacity: 1 !important;
  }
}
.postDetail-valueContainer {
  display: flex;
  align-items: center;
  padding-left: 1rem;
  gap: 0.4rem;
  img {
    height: 1.5rem;
  }
  span {
    font-family: poppinsBold;
    color: #f3f3f394;
    font-size: 1rem;
  }
}

.doneeProfile {
  margin-top: 0.5rem !important;
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
    scale: 1.3 !important;
  }
}
.PostDetail-messageButton {
  background: linear-gradient(
    135deg,
    rgba(106, 105, 105, 0.902) 0%,
    rgba(0, 0, 0, 0.68) 100%
  );
  backdrop-filter: blur(10px);
}

.postGoal {
  background: linear-gradient(
    108.46deg,
    rgba(0, 0, 0, 0.786) 1%,
    rgba(23, 23, 23, 0.789) 100%
  );
  width: auto;
  padding: 0.9rem 0.7rem;
  border-radius: 1.3rem;
}
.postDetail-doneeFooter {
  position: fixed;
  bottom: 0;
  border-top-left-radius: 1.2rem;
  border-top-right-radius: 1.2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  height: 6.5rem;
  padding: 0 1rem;
  padding-bottom: 0.5rem;
  border-top: 0.05rem solid rgba(255, 255, 255, 0.202);
  background-image: url("/images/Auth/bg-explain.png");
  background-repeat: no-repeat;
  background-position: center;
  background-size: cover;
  gap: 0.6rem;
  .postDetail-editDreamButton {
    background-color: rgba(182, 0, 67, 1) !important;
    color: white !important;
    border: none;
    font-size: 1.1rem;
    font-family: montseraatSemiBold;
    border-radius: 0.5625rem !important;
    height: 3.5rem;
  }
  .postDetail-topUpDreamButton {
    width: 4.5rem;
    height: 3.5rem;
    border-radius: 0.375rem;
    background: rgba(252, 252, 252, 0.1);
  }
}

.aboutDonne {
  margin-bottom: 8rem;
}

.postDetailInformations {
  position: absolute;
  z-index: 1;
}

.slide-fade-enter-active {
  transition: all 0.1s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.1s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
