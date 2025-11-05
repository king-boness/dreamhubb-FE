<template>
  <div class="review-component">
    <div class="reviewComponent-header">
      <img
        class="reviewComponent-profilePicture"
        :src="props.profile.reviews.userReviewedPicture"
        alt=""
      />
      <span class="reviewComponent-title">{{
        props.profile.reviews.userReviewed
      }}</span>
    </div>
    <div class="reviewComponent-content">
      <span class="reviewComponent-text">{{
        props.profile.reviews.description
      }}</span>
    </div>
    <div class="revieComponent-dateContainer">
      <span class="revieComponent-date">{{
        profile.reviews.dateReviewed
      }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineProps, PropType } from "vue";
import { UserProfile } from "src/components/models";
interface Props {
  profile: UserProfile;
}

const props: Props = defineProps({
  profile: {
    type: Object as PropType<UserProfile>,
    required: true
  }
});
</script>
<style scoped lang="scss">
.review-component {
  display: flex;
  flex-direction: column;
  color: white;
  justify-content: center;
  padding: 1.2rem;
  margin: 0.5rem 0;

  .reviewComponent-header {
    display: flex;
    align-items: center;
    gap: 0.5rem;
    padding-bottom: 1rem;
    .reviewComponent-profilePicture {
      height: 2rem;
      border-radius: 100%;
    }
  }
  .reviewComponent-title {
    font-family: poppinsSemiBold;
    font-size: 1rem;
  }
  .reviewComponent-content {
    .reviewComponent-text {
      font-family: poppins;
      color: rgba(255, 255, 255, 0.834);
    }
  }
  .revieComponent-dateContainer {
    padding-top: 1rem;
    display: flex;
    justify-content: end;
    .revieComponent-date {
      font-family: poppins;
      color: rgba(255, 255, 255, 0.539);
    }
  }
}
</style>
