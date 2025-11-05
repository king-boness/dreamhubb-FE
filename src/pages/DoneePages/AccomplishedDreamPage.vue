<template>
  <div class="accomplishedDream-page">
    <span class="accomplishedDream-title">Congratulations!</span>
    <img
      src="/icons/accomplishedDream-image.png"
      alt=""
      class="accomplishedDream-mainImage"
    />
    <span class="accomplishedDream-description"
      >Your dream was accomplished by</span
    >
    <div class="accomplishedDReam-donatorContainer">
      <img
        :src="profile.user.userPicture"
        alt=""
        class="accomplishedDream-donatorPicture"
      />
      <span class="accomplishedDream-donatorName">{{
        profile.user.userName
      }}</span>
    </div>
    <q-btn
      class="accomplishedDream-reviewButton"
      @click="$router.push({ name: 'donee-post-details-review' })"
      >Say thanks in review!</q-btn
    >
  </div>
</template>
<style scoped lang="scss">
.accomplishedDream-page {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  text-align: center;
  padding: 1.5rem;
  .accomplishedDream-title {
    font-family: xillian;
    color: $primary;
    font-size: 2.7rem;
  }
  .accomplishedDream-mainImage {
    margin-top: 2.5rem;
    width: 15rem;
    height: 26rem;
  }
  .accomplishedDream-description {
    margin-top: 3.5rem;
    color: white;
    font-family: poppins;
    font-size: 1.3rem;
  }
  .accomplishedDReam-donatorContainer {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 0.5rem;
    padding-top: 1rem;
    padding-right: 1.2rem;
    .accomplishedDream-donatorPicture {
      height: 2.6rem;
      border-radius: 50%;
    }
    .accomplishedDream-donatorName {
      color: white;
      font-family: poppins;
      font-weight: 700;
      font-size: 1.1rem;
    }
  }
  .accomplishedDream-reviewButton {
    background-color: rgba(182, 0, 67, 1);
    color: white;
    border: none;
    font-size: 1.2rem;
    height: 3.3rem;
    font-family: montseraatSemiBold;
    border-radius: 0.5rem !important;
    margin-top: 2.8rem;
  }
}
</style>
<script setup lang="ts">
import { ref } from "vue";
import { UserProfile } from "src/components/models";

const profile = ref({
  user: {
    userName: "John Doe",
    userPicture: "/images/Auth/profilePicture.jpeg"
  }
} as UserProfile);
</script>
