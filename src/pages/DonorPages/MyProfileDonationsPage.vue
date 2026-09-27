<template>
  <q-page class="profileTabPage" :padding="false">
    <div class="myProfileRewievs-page">
      <MyProfileHeaderComponent></MyProfileHeaderComponent>
      <ProfileDonationsComponent></ProfileDonationsComponent>
    </div>
  </q-page>
</template>
<script setup lang="ts">
import MyProfileHeaderComponent from "src/components/partials/MyProfileHeaderComponent.vue";
import ProfileDonationsComponent from "src/components/partials/ProfileDonationsComponent.vue";
</script>
<style lang="scss" scoped></style>
