<template>
  <div
    class="userProfile-header"
    :style="{
      backgroundImage: 'url(' + profile.user.userBackground + ')'
    }"
  >
    <div class="myProfile-headerBlur"></div>
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
import { ref } from "vue";

import { UserProfile } from "src/components/models";
import { useUserStore } from "src/stores/user-store";

const userStore = useUserStore();

const profile = ref({
  user: {
    userName: userStore.name,
    userPicture: "/images/Auth/profilePicture.jpeg",
    userBackground: "/images/Auth/postBackground.png",
    dateCreated: "09/15/2023",
    location: "Island, Reykjavik",
    views: 156
  }
} as UserProfile);
</script>
<style scoped lang="scss">
.userProfile-header {
  height: 10rem;
  background-repeat: round;
  background-size: cover;
  position: relative;
  width: 100%;
  box-shadow: inset 0rem 1rem 3rem -3rem rgba(0, 0, 0, 0.75),
    inset 0px -1rem 4rem -2rem rgba(0, 0, 0, 0.75);
  .userProfile-btnDiv {
    position: relative;
    z-index: 1;
    display: flex;
    justify-content: space-between;
    padding: 0rem 0.4rem;
    padding-top: 0.8rem;
    padding-bottom: 0;
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
  position: relative;
  z-index: 111;
  margin-top: 6rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  height: 6rem;
  margin-bottom: 1.8rem;

  .userProfile-preview {
    display: flex;
    flex-direction: column;
    align-items: center;
    margin-top: -4.8rem;
    margin-bottom: 1rem;

    img {
      border-radius: 5rem;
      height: 7rem;
    }

    h3 {
      margin: 0.5rem 0;
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
.userProfile-header::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rem;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 0.671)
  );
  pointer-events: none;
}

.myProfile-headerBlur {
  position: absolute;
  top: 0rem;
  backdrop-filter: blur(1px);
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 0.265)
  );
  height: 10rem;
  width: 100%;
  pointer-events: none;
}
</style>
