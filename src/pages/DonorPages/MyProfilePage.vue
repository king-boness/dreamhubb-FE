<template>
  <div class="myProfile overflow-hidden">
    <MyProfileHeaderComponent></MyProfileHeaderComponent>
    <div class="userProfile-detailsContainer">
      <div v-for="(profile, i) in profiles" :key="i">
        <UserProfileDetailsComponent
          :profile="profile"
        ></UserProfileDetailsComponent>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import UserProfileDetailsComponent from "src/components/partials/UserProfileDetailsComponent.vue";
import MyProfileHeaderComponent from "src/components/partials/MyProfileHeaderComponent.vue";
import { UserProfile } from "src/components/models";
const profiles = ref([
  {
    categories: {
      name: "Reviews",
      amount: 34,
      img: "/icons/starIcon.svg",
      destination: "myprofile-reviews"
    }
  },
  {
    categories: {
      name: "Donations",
      amount: 34,
      img: "/icons/redGiftIcon.svg",
      destination: "myprofile-donations"
    }
  },
  {
    categories: {
      name: "Dreams",
      amount: 34,
      img: "/icons/redCloudIcon.svg",
      destination: "myprofile-dreams"
    }
  },
  {
    categories: {
      name: "Problems",
      amount: 34,
      img: "/icons/problemIcon.svg",
      destination: "myprofile-problems"
    }
  },
  {
    categories: {
      name: "Ideas",
      amount: 34,
      img: "/icons/ideaIcon.svg",
      destination: "myprofile-ideas"
    }
  }
] as UserProfile[]);
</script>
<style scoped lang="scss">
.userProfile-detailsContainer {
  margin-top: 6rem;
  margin-bottom: 4rem;
}
</style>
