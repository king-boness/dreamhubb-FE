<template>
  <div class="dream-component">
    <div
      class="component-header"
      :style="{
        backgroundImage: 'url(' + props.profile.dreams.postDreamBackground + ')'
      }"
    >
      <div class="componentProfileContainer">
        <img
          :src="props.profile.dreams.postOwnerPicture"
          alt=""
          class="component-profilePicture"
        />
        <span class="component-profileName">{{
          props.profile.dreams.postOwner
        }}</span>
      </div>
      <div class="component-informationContainer">
        <div class="component-postNameContainer">
          <img
            :src="props.profile.dreams.postDreamCategoryImg"
            alt=""
            class="component-postCategoryImg"
          />
          <span class="component-postTitle">{{
            props.profile.dreams.postDreamName
          }}</span>
        </div>
        <div class="component-karmaContainer">
          <img src="/icons/KarmaIcon.png" alt="" class="component-karmaImg" />
          <span class="component-karmaValue">{{
            formatNumber(props.profile.dreams.donatedValue)
          }}</span>
        </div>
      </div>
    </div>
    <div class="component-descriptionContainer">
      <span class="component-descriptionText">{{
        props.profile.dreams.description
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
.dream-component {
  margin: 0.9rem auto;
  width: 90%;
  display: flex;
  flex-direction: column;
  color: white;
  height: 20rem;
  margin-bottom: 1rem;

  .component-header {
    background-repeat: no-repeat;
    background-size: cover;
    background-repeat: round;
    padding: 0.5rem 0.4rem;
    border-top-left-radius: 1rem;
    border-top-right-radius: 1rem;
    display: flex;
    flex-direction: column;
    justify-content: start;
    height: 12.1rem;
    gap: 4rem;
    .componentProfileContainer {
      background: linear-gradient(
        108.46deg,
        rgba(0, 0, 0, 0.441) 1%,
        rgba(23, 23, 23, 0.599) 100%
      );
      display: flex;
      align-items: center;
      justify-content: start;
      border-radius: 1.4rem;
      width: 9rem;
      gap: 0.5rem;
      padding: 0.7rem 0.8rem;
      .component-profilePicture {
        height: 2rem;
        border-radius: 100%;
        margin-left: -0.01rem;
      }
      .component-profileName {
        font-family: poppinsBold;
        font-size: 1rem;
      }
    }
    .component-informationContainer {
      display: flex;
      align-items: center;
      justify-content: space-between;
    }
    .component-postNameContainer {
      display: flex;
      align-items: center;
      justify-content: center;
      border-radius: 1rem;
      background: linear-gradient(
        108.46deg,
        rgba(0, 0, 0, 0.441) 1%,
        rgba(23, 23, 23, 0.599) 100%
      );
      gap: 0.5rem;
      width: auto;
      padding: 0 0.8rem;
      height: 3.5rem;

      .component-postCategoryImg {
        height: 1.2rem;
      }
      .component-postTitle {
        font-family: poppinsSemiBold;
        font-size: 1.1rem;
      }
    }
    .component-karmaContainer {
      background: linear-gradient(
        108.46deg,
        rgba(0, 0, 0, 0.441) 1%,
        rgba(23, 23, 23, 0.599) 100%
      );
      display: flex;
      justify-content: center;
      align-items: center;
      height: 3.5rem;
      width: auto;
      padding: 0 0.4rem;
      border-radius: 1rem;

      .component-karmaImg {
        height: 1.3rem;
        margin-right: 0.4rem;
      }
      .component-karmaValue {
        color: $primary;
        font-family: poppinsBold;
        font-size: 1.1rem;
      }
    }
  }
  .component-descriptionContainer {
    background: linear-gradient(
      108.46deg,
      rgba(53, 53, 53, 0.176) 1%,
      rgba(35, 35, 35, 0.327) 100%
    );
    padding: 1rem 0.8rem;
    border-bottom-left-radius: 1rem;
    border-bottom-right-radius: 1rem;
    height: 10rem;
    .component-descriptionText {
      font-family: poppins;
      font-size: 0.9rem;
    }
  }
}
</style>
