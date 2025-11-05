<template>
  <div
    class="userProfile-header"
    :style="{
      backgroundImage: 'url(' + profile.user.userBackground + ')'
    }"
  >
    <div class="userProfile-btnDiv">
      <div class="userProfile-btnDivLeft">
        <q-btn class="userProfile-headerBtn" @click="$router.go(-1)"
          ><img src="/icons/closeIcon.svg" alt=""
        /></q-btn>
      </div>
      <div class="userProfile-btnDivRight">
        <q-btn class="userProfile-headerBtn"
          ><img src="/icons/shareIcon.svg" alt=""
        /></q-btn>
        <q-btn class="userProfile-headerBtn"
          ><img src="/icons/favouriteIcon.svg" alt=""
        /></q-btn>
      </div>
    </div>
    <div class="userProfile-userDetail">
      <div class="userProfile-preview">
        <div class="userProfile-progressContainer">
          <span class="userProfile-progressValue"
            >{{ progressLabel1 }} Rating
            <img
              class="userProfile-progressImg"
              src="/icons/redStart-icon.svg"
              alt=""
            />
          </span>
          <q-linear-progress
            :value="progress1"
            color="primary"
            track-color="primary"
            class="userProfile-progress"
          >
          </q-linear-progress>
        </div>
        <img :src="profile.user.userPicture" alt="" />
        <h3>{{ profile.user.userName }}</h3>
      </div>
      <div class="userProfile-closerDetails">
        <div class="userDate user-closerDetail">
          <img src="/icons/calendarIcon.svg" alt="" />
          <span class="postDatas">{{ profile.user.dateCreated }}</span>
        </div>
        <div class="userLocation user-closerDetail">
          <img src="/icons/locationIcon.svg" alt="" />
          <span class="postDatas">{{ profile.user.location }}</span>
        </div>
        <div class="userViews user-closerDetail">
          <img src="/icons/viewIcon.svg" alt="" />
          <span class="postDatas">{{ profile.user.views }}</span>
        </div>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed } from "vue";

import { UserProfile } from "src/components/models";
import { useUserStore } from "src/stores/user-store";
const progress1 = ref(0.8);
const userStore = useUserStore();
const progressLabel1 = computed(() => progress1.value * 100 + "%");

const profile = ref({
  user: {
    userName: "User",
    userPicture: "/images/Auth/profilePicture.jpeg",
    userBackground: "/images/Auth/postBackground.png",
    dateCreated: "09/15/2023",
    location: "Island, Reykjavik",
    views: 156
  }
} as UserProfile);
</script>
<style lang="scss">
.q-linear-progress__model {
  border-top-right-radius: 2rem;
  border-bottom-right-radius: 2rem;
}
.userProfile-progressValue {
  color: $primary;
  margin-left: 68% !important;
  font-family: montseraatBold;
  margin: 0.1rem 0;
  display: flex;
  align-items: center;
  gap: 0.25rem;
  background-color: transparent !important;
}
</style>
<style scoped lang="scss">
.userProfile-header {
  height: 9.5rem;
  background-repeat: round;
  background-size: cover;

  box-shadow: inset 0rem 1rem 3rem -3rem rgba(0, 0, 0, 0.75),
    inset 0px -1rem 4rem -2rem rgba(0, 0, 0, 0.75);

  .userProfile-btnDiv {
    display: flex;
    justify-content: space-between;
    padding: 0.5rem 0.4rem;

    .userProfile-headerBtn {
      margin: 0 0.4rem;
      width: 2.8rem;
      height: 2.8rem;
      border-radius: 2rem;
      background: linear-gradient(
        108.46deg,
        rgba(0, 0, 0, 0.33) 0%,
        rgba(23, 23, 23, 0.33) 100%
      );
      backdrop-filter: blur(1rem);
    }
  }
}

.userProfile-userDetail {
  margin-top: 6rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 8rem;

  .userProfile-preview {
    display: flex;
    flex-direction: row;
    align-items: end;
    margin-top: -4.9rem;
    margin-bottom: 2rem;
    position: relative;
    gap: 0.4rem;
    width: 100%;
    .userProfile-progressContainer {
      position: absolute;
      top: 1.7rem;
      z-index: 1;
      width: 100%;

      .userProfile-progress {
        z-index: 1;
        height: 0.5rem;
      }
      .userProfile-progressImg {
        height: 1rem;
        margin: 0;
      }
    }

    img {
      border-radius: 5rem;
      height: 7rem;
      z-index: 2;
      margin-left: 1rem;
    }

    h3 {
      margin: 0;
      color: white;
      font-size: 1.5rem;
      font-family: poppinsSemiBold;
    }
  }

  .userProfile-closerDetails {
    color: white;
    display: flex;
    justify-content: space-around;
    align-items: center;

    .user-closerDetail {
      display: flex;
      align-items: center;

      span {
        margin-left: 0.3rem;
      }

      img {
        margin-bottom: 0.1rem;
      }
    }
  }
}
</style>
