<template>
  <q-page class="doneeMyProfilePage" :padding="false">
    <MyProfileFilterComponent :post="post"></MyProfileFilterComponent>
  </q-page>
</template>
<script setup lang="ts">
import MyProfileFilterComponent from "src/components/doneeComponents/MyProfileFilterComponent.vue";

import { ref } from "vue";
import { Post } from "src/components/models";

const post = ref({
  description: "lorem ipsum dolor sit amet",
  goalName: "goalName",
  goalImage: "/images/Auth/goalPicture.png",
  karma: 230000000,
  image: "/images/Auth/postBackground.png",
  user: {
    badge: "verified",
    userName: "Jakub Perdoch",
    userPicture: "/images/Auth/profilePicture.jpeg"
  }
} as Post);
</script>
<style scoped lang="scss">
.doneeMyProfilePage {
  width: 100%;
  max-width: 100%;
  min-width: 0;
  box-sizing: border-box;
}
</style>
