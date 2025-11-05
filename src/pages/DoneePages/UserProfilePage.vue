<template>
  <div class="userProfile-page">
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
<style scoped lang="scss">
.userProfile-detailsContainer {
  margin-top: 8rem;
  margin-bottom: 3rem;
}
</style>
<script setup lang="ts">
import { ref } from "vue";
import { UserProfile } from "src/components/models";
import UserProfileDetailsComponent from "src/components/partials/UserProfileDetailsComponent.vue";
import UserProfileHeaderComponent from "src/components/doneeComponents/UserProfileHeaderComponent.vue";

const profiles = ref([
  {
    categories: {
      name: "Reviews",
      amount: 32,
      img: "/icons/starIcon.svg",
      destination: "userProfile-reviews"
    }
  },
  {
    categories: {
      name: "Donations",
      amount: 34,
      img: "/icons/redGiftIcon.svg",
      destination: "userProfile-donations"
    }
  },
  {
    categories: {
      name: "Dreams",
      amount: 34,
      img: "/icons/redCloudIcon.svg",
      destination: "userProfile-dreams"
    }
  },
  {
    categories: {
      name: "Problems",
      amount: 34,
      img: "/icons/problemIcon.svg",
      destination: "userProfile-problems"
    }
  },
  {
    categories: {
      name: "Ideas",
      amount: 34,
      img: "/icons/ideaIcon.svg",
      destination: "userProfile-ideas"
    }
  }
] as UserProfile[]);
</script>
