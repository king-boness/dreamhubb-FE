<template>
  <div class="userProfile">
    <UserProfileHeaderComponent></UserProfileHeaderComponent>
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
import UserProfileHeaderComponent from "src/components/partials/UserProfileHeaderComponent.vue";
import UserProfileDetailsComponent from "src/components/partials/UserProfileDetailsComponent.vue";
import { UserProfile } from "src/components/models";
const profiles = ref([
  {
    categories: {
      name: "Reviews",
      amount: 34,
      img: "/icons/starIcon.svg",
      destination: "userprofile-reviews"
    }
  },
  {
    categories: {
      name: "Donations",
      amount: 34,
      img: "/icons/redGiftIcon.svg",
      destination: "userprofile-donations"
    }
  },
  {
    categories: {
      name: "Dreams",
      amount: 34,
      img: "/icons/redCloudIcon.svg",
      destination: "userprofile-dreams"
    }
  },
  {
    categories: {
      name: "Problems",
      amount: 34,
      img: "/icons/problemIcon.svg",
      destination: "userprofile-problems"
    }
  },
  {
    categories: {
      name: "Ideas",
      amount: 34,
      img: "/icons/ideaIcon.svg",
      destination: "userprofile-ideas"
    }
  }
] as UserProfile[]);
</script>
<style scoped lang="scss">
.userProfile-detailsContainer {
  margin-top: 8rem;
  margin-bottom: 3rem;
}
.userProfile-detail {
  border: 0.1rem solid white;
}
</style>
