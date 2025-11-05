<template>
  <div class="dream-component">
    <div
      class="component-header"
      :style="{
        backgroundImage: 'url(' + props.post.image + ')'
      }"
    >
      <div class="componentProfileContainer">
        <img
          :src="props.post.user.userPicture"
          alt=""
          class="component-profilePicture"
        />
        <img
          :src="'/icons/Badges/' + props.post.user.badge + '.svg'"
          alt=""
          class="badgeImg"
        />
        <span class="component-profileName">{{
          props.post.user.userName
        }}</span>
      </div>
      <div class="component-informationContainer">
        <div class="component-postNameContainer">
          <img
            :src="props.post.goalImage"
            alt=""
            class="component-postCategoryImg"
          />
          <span class="component-postTitle">{{ props.post.goalName }}</span>
        </div>
        <div class="component-karmaContainer">
          <img src="/icons/KarmaIcon.png" alt="" class="component-karmaImg" />
          <span class="component-karmaValue">{{
            formatNumber(props.post.karma)
          }}</span>
        </div>
      </div>
    </div>
    <div class="component-descriptionContainer">
      <span class="component-descriptionText">{{
        props.post.description
      }}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { defineProps, PropType } from "vue";
import { Post } from "src/components/models";
import { formatNumber } from "src/components/partials/FunctionsComponent.vue";

interface Props {
  post: Post;
}

const props: Props = defineProps({
  post: {
    type: Object as PropType<Post>,
    required: true
  }
});
</script>

<style scoped lang="scss">
$text-max-length: 10;
.dream-component {
  width: 100%;
  display: flex;
  flex-direction: column;
  color: white;
  height: 29rem;
  margin-bottom: 0.5 rem;
  margin-top: 0.5rem;

  .component-header {
    background-size: cover;
    background-repeat: round;
    padding: 0.7rem 0.6rem;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    height: 22rem;
    gap: 4rem;
    image-rendering: smooth;
    .componentProfileContainer {
      background: linear-gradient(
        108.46deg,
        rgba(0, 0, 0, 0.441) 1%,
        rgba(23, 23, 23, 0.599) 100%
      );
      display: flex;
      align-items: center;
      justify-content: start;
      border-radius: 1.3rem;
      width: 11rem;
      gap: 0.5rem;
      padding: 0.5rem 0.7rem;
      .component-profilePicture {
        height: 2.1rem;
        border-radius: 100%;
      }
      .component-profileName {
        font-family: poppinsSemiBold;
        font-size: 1rem;
        max-width: #{$text-max-length}ch;
        white-space: nowrap; // prevent line breaks
        overflow: hidden; // hide the text that exceeds the maximum length
        text-overflow: ellipsis; // add an ellipsis to indicate truncated text
      }
      .badgeImg {
        height: 1.1rem;
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
      justify-content: start;
      border-radius: 1.3rem;
      background: linear-gradient(
        108.46deg,
        rgba(0, 0, 0, 0.441) 1%,
        rgba(23, 23, 23, 0.599) 100%
      );
      gap: 0.5rem;
      width: auto;
      justify-content: center;
      padding: 0.9rem 0.7rem;
      .component-postCategoryImg {
        height: 1rem;
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
      width: auto;
      padding: 0.9rem 0.8rem;
      border-radius: 1.3rem;

      .component-karmaImg {
        height: 1.3rem;
        margin-right: 0.3rem;
      }
      .component-karmaValue {
        color: $primary;
        font-family: poppinsBold;
        font-size: 1.1rem;
      }
    }
  }
  .component-descriptionContainer {
    background-color: rgba(2, 2, 2, 0.354);
    backdrop-filter: blur(10px);
    padding: 1.2rem 1rem;
    height: 7rem;
    .component-descriptionText {
      font-family: poppins;
      font-size: 0.9rem;
    }
  }
}
</style>
