<template>
  <div class="ProfileReview-page">
    <div class="ProfileReview-header">
      <q-btn class="reviewHeader-button"
        ><img src="/icons/arrowLeft-icon.svg" alt="" @click="$router.go(-1)"
      /></q-btn>
      <img :src="profile.categories.img" alt="" class="reviewHeader-icon" />
      <span class="reviewHeader-title">
        {{ profile.categories.name }}
        <span class="reviewHeader-amount">{{ profile.categories.amount }}</span>
      </span>
    </div>
    <div class="profileReviewsComponent-reviewsContainer">
      <PostFilterComponent :on-going="onGoing" :accomplished="accomplished" />
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineProps, PropType } from "vue";
import { UserProfile } from "src/components/models";
import PostFilterComponent from "./PostFilterComponent.vue";

defineProps({
  onGoing: {
    type: Array as PropType<UserProfile[]>,
    required: true
  },
  accomplished: {
    type: Array as PropType<UserProfile[]>,
    required: true
  },
  profile: {
    type: Object as PropType<UserProfile>,
    required: true
  }
});
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
