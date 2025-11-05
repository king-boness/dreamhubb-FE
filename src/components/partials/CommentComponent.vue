<template>
  <div class="comment-component">
    <div class="comment-userDetailsContainer">
      <img
        :src="props.profile.comments.donationOwnerPicture"
        alt=""
        class="comment-userProfilePicture"
      />
      <span class="comment-userProfileName">{{
        props.profile.comments.donationOwnerName
      }}</span>
    </div>
    <img
      :src="props.profile.comments.donatedImage"
      alt=""
      class="comment-donationImage"
    />
    <div class="comment-descriptionContainer">
      <span class="comment-description">{{
        props.profile.comments.description
      }}</span>
    </div>
    <div
      class="comment-privateContainer"
      v-if="profile.comments.private == true"
    >
      <img
        src="/icons/privateConnect-icon.svg"
        alt=""
        class="comment-privateThreadImage"
      />
      <span class="comment-privateThreadTitle">Private Thread</span>
    </div>
    <div
      class="comment-contributedTypeContainer"
      v-if="props.profile.comments.type == 'Contribution'"
    >
      <span>Contributed by {{ props.profile.comments.typeOfHelp }} </span>
      <span class="comment-karmaValue">{{
        props.profile.comments.amountOfHelp
      }}</span>
      <img src="/icons/KarmaIcon.png" alt="" class="comment-karmaIcon" />
    </div>
    <q-separator class="comment-separator" />
    <div
      class="comment-userInputContainer"
      v-if="props.profile.comments.type == 'Help'"
    >
      <q-input
        v-model="text"
        label="Make your comment..."
        dense
        borderless
        dark
        hide-bottom-space
        class="comment-userInput"
      >
        <template v-slot:append>
          <q-btn dense text-color="primary" class="comment-userInputButton">
            <img src="/icons/send-icon.svg" alt="" />
          </q-btn>
        </template>
      </q-input>
      <q-btn
        class="comment-accomplishedButton"
        v-if="route.name === 'donee-post-details'"
        @click="$router.push({ name: 'donee-post-details-accomplished' })"
      >
        <img
          class="comment-accomplishedButtonIcon"
          src="/icons/accomplishedButton-icon.svg"
          alt=""
      /></q-btn>
    </div>
  </div>
</template>

<style scoped lang="scss">
.comment-component {
  background: linear-gradient(
    135deg,
    rgba(0, 0, 0, 0.66) 0%,
    rgba(23, 23, 23, 0.264) 100%
  );

  backdrop-filter: blur(1rem);
  border-radius: 1.125rem;
  padding: 1rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  margin-top: 1rem;
  .comment-separator {
    background-color: rgba(255, 255, 255, 0.115);
    height: 0.1rem;
  }
  .comment-userDetailsContainer {
    display: flex;
    align-items: center;
    gap: 0.6rem;
    padding-top: 0.3rem;
    padding-left: 0.2rem;
    .comment-userProfilePicture {
      height: 2.5rem;
      border-radius: 100%;
    }
    .comment-userProfileName {
      color: white;
      font-family: poppinsSemiBold;
      font-size: 1.2rem;
    }
  }
  .comment-donationImage {
    margin-top: 1rem;
    border-radius: 1.2rem 1.2rem 0.7rem 0.7rem;
    width: 100%;
    height: 23rem;
  }
  .comment-privateContainer {
    display: flex;
    align-items: center;
    gap: 0.3rem;
    padding: 0.3rem 0;
    padding-bottom: 1.2rem;
    .comment-privateThreadImage {
      height: 1.3rem;
    }
    .comment-privateThreadTitle {
      color: white;
    }
  }
  .comment-contributedTypeContainer {
    color: rgba(255, 255, 255, 0.552);
    display: flex;
    align-items: center;
    font-size: 0.8rem;
    font-family: poppins;
    padding-bottom: 0.8rem;
    .comment-karmaIcon {
      height: 1rem;
    }
    .comment-karmaValue {
      margin-left: 0.5rem;
      font-family: poppinsBold;
    }
  }
  .comment-descriptionContainer {
    padding: 1rem 0;
    .comment-description {
      color: white;
      font-size: 1rem;
      font-family: poppins;
    }
  }
  .comment-userInputContainer {
    margin: 1rem 0;
    display: flex;
    flex-direction: row;

    .comment-userInput {
      width: 100%;
      height: 3rem;
      border: 0.05rem solid $primary;
      border-radius: 0.625rem;
      padding-top: 0.2rem;
      padding-left: 0.89rem;
      padding-right: 0.8rem;
      font-family: poppins;
    }
    .comment-accomplishedButton {
      width: 2.875rem;
      height: 2.875rem;
      margin-left: 0.5rem;
      background: rgba(252, 252, 252, 0.1);
      border-radius: 0.375rem;
    }
  }
}
</style>
<style>
.q-btn::before {
  box-shadow: none;
}
</style>
<script setup lang="ts">
import { defineProps, PropType, ref } from "vue";
import { UserProfile } from "src/components/models";
import { useRoute } from "vue-router";

const text = ref("");
const route = useRoute();

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
