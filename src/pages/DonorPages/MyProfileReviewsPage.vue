<template>
  <q-page class="profileTabPage" :padding="false">
    <div class="myProfileRewievs-page">
      <MyProfileHeaderComponent></MyProfileHeaderComponent>
      <ProfileReviewsComponent></ProfileReviewsComponent>
    </div>
  </q-page>
</template>
<script setup lang="ts">
import MyProfileHeaderComponent from "src/components/partials/MyProfileHeaderComponent.vue";
import ProfileReviewsComponent from "src/components/partials/ProfileReviewsComponent.vue";
</script>
<style lang="scss" scoped></style>
