<template>
  <div class="ProfileReview-page">
    <div class="ProfileReview-header">
      <q-btn class="reviewHeader-button"
        ><img src="/icons/arrowLeft-icon.svg" alt="" @click="$router.go(-1)"
      /></q-btn>
      <img :src="profile.categories.img" alt="" class="reviewHeader-icon" />
      <span class="reviewHeader-title"
        >{{ profile.categories.name }}
        <span class="reviewHeader-amount"
          >({{ profile.categories.amount }})</span
        ></span
      >
    </div>
    <div class="profileReviewsComponent-reviewsContainer">
      <div v-for="(profile, i) in reviews" :key="i">
        <ReviewComponent :profile="profile"></ReviewComponent>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineProps, PropType } from "vue";
import ReviewComponent from "./ReviewComponent.vue";
import { UserProfile } from "src/components/models";

defineProps({
  profile: {
    type: Object as PropType<UserProfile>,
    required: true
  },
  onGoing: {
    type: Array as PropType<UserProfile[]>,
    default: () => []
  },
  accomplished: {
    type: Array as PropType<UserProfile[]>,
    default: () => []
  }
});

// For reviews, we'll use a mock array for now
// In the future, this should come from props
const reviews = [
  {
    reviews: {
      description:
        "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim. Eu id nibh iaculis orci.",
      userReviewed: "Mackenzie Doe",
      userReviewedPicture: "/images/Auth/profilePicture.jpeg",
      dateReviewed: "09/15/2023"
    }
  },
  {
    reviews: {
      description:
        "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim. Eu id nibh iaculis orci.",
      userReviewed: "Mackenzie Doe",
      userReviewedPicture: "/images/Auth/profilePicture.jpeg",
      dateReviewed: "09/15/2023"
    }
  }
] as UserProfile[];
</script>
<style scoped lang="scss">
.ProfileReview-page {
  margin-top: 7rem;

  .ProfileReview-header {
    display: flex;
    justify-content: start;
    align-items: center;
    color: white;
    padding: 1.5rem 1.1rem;
    .reviewHeader-button {
      width: 2rem;
      margin-right: 1rem;
    }
    .reviewHeader-icon {
      height: 1.8rem;
    }
    .reviewHeader-title {
      font-family: poppinsSemiBold;
      font-size: 1.5rem;
      margin-left: 0.6rem;
      .reviewHeader-amount {
        font-family: poppins;
      }
    }
  }
}
</style>
