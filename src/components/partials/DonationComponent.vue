<template>
  <div class="donation-component">
    <div
      class="donationComponent-header"
      :style="{
        backgroundImage: profile?.donations?.postDonatedBackground ? 'url(' + profile.donations.postDonatedBackground + ')' : 'none'
      }"
    >
      <div class="donationComponent-valueContainer">
        <span class="donationComponent-donatedTitle">Donated</span>
        <img
          src="/icons/KarmaIcon.png"
          alt=""
          class="donationComponent-valueIcon"
        />
        <span class="donationComponent-donatedValue">{{
          formatNumber(profile?.donations?.donatedValue || 0)
        }}</span>
      </div>
      <div class="donationComponent-donatedPostContainer">
        <img
          :src="profile?.donations?.postDonatedCategoryImg"
          alt=""
          class="donationComponent-postImg"
        />
        <span class="donationComponent-postTitle">{{
          profile?.donations?.postDonatedName || ""
        }}</span>
      </div>
    </div>
    <div class="donationComponent-donateContent">
      <div class="donationComponent-postOwnerContainer">
        <img
          :src="profile?.donations?.postOwnerPicture"
          alt=""
          class="donationComponent-ownerImg"
        />
        <span class="donationCompoment-postOwnerName">{{
          profile?.donations?.postOwner || ""
        }}</span>
      </div>
      <span class="donationComponent-postDescription">{{
        profile?.donations?.description || ""
      }}</span>
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineProps, PropType } from "vue";
import { UserProfile } from "src/components/models";
import { formatNumber } from "src/components/partials/FunctionsComponent.vue";

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
.donation-component {
  margin: 0 auto;
  width: 90%;
  display: flex;
  flex-direction: column;
  color: white;
  height: 21rem;
  margin-bottom: 3rem;
  margin-top: 1.5rem;
  padding: 1rem 0;
  .donationComponent-header {
    background-repeat: no-repeat;
    background-size: cover;
    background-repeat: round;
    padding: 0.8rem;
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: start;
    height: 12.1rem;
    gap: 4rem;
    .donationComponent-valueContainer {
      background: linear-gradient(
        108.46deg,
        rgba(0, 0, 0, 0.441) 1%,
        rgba(23, 23, 23, 0.599) 100%
      );
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 1rem;
      height: 3.5rem;
      width: 12.4rem;
      flex: auto;
      gap: 0.4rem;
      font-family: poppinsBold;
      font-size: 1.1rem;

      .donationComponent-donatedTitle {
      }
      .donationComponent-valueIcon {
        height: 1.3rem;
        margin-left: 0.4rem;
      }
      .donationComponent-donatedValue {
        color: $primary;
      }
    }
    .donationComponent-donatedPostContainer {
      display: flex;
      align-items: center;
      padding: 0 0.8rem;
      border-radius: 1rem;
      background: linear-gradient(
        108.46deg,
        rgba(0, 0, 0, 0.441) 1%,
        rgba(23, 23, 23, 0.599) 100%
      );
      height: 3.5rem;
      gap: 0.5rem;
      width: 13.5rem;

      .donationComponent-postImg {
        height: 1.2rem;
      }
      .donationComponent-postTitle {
        font-family: poppinsSemiBold;
        font-size: 1.1rem;
      }
    }
  }
  .donationComponent-donateContent {
    background: linear-gradient(
      108.46deg,
      rgba(53, 53, 53, 0.176) 1%,
      rgba(35, 35, 35, 0.327) 100%
    );
    padding: 1rem 0.8rem;
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
    height: 10rem;

    .donationComponent-postOwnerContainer {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin-bottom: 0.9rem;

      .donationComponent-ownerImg {
        height: 2rem;
        border-radius: 100%;
      }
      .donationCompoment-postOwnerName {
        font-family: poppinsSemiBold;
        font-size: 0.9rem;
      }
    }
    .donationComponent-postDescription {
      font-family: poppins;
      font-size: 0.9rem;
    }
  }
}
</style>
