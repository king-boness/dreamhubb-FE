<template>
  <div class="settingsSupport-page">
    <div class="settingsSupport-header">
      <span class="settingsSupport-heading">Help &amp; Support</span>
    </div>
    <div class="settingsSupport-questions">
      <p class="questionsText">
        Need help with your account, a post, or reporting inappropriate content? Contact our support team and we will respond as soon as possible.
      </p>
      <p class="questionsText">
        Email:
        <a class="settingsSupport-link" href="mailto:matej.kostun@gmail.com">matej.kostun@gmail.com</a>
      </p>
      <p class="questionsText">
        You can also review our
        <a class="settingsSupport-link" href="#" @click.prevent="openPrivacy">Privacy Policy</a>
        and
        <a class="settingsSupport-link" href="#" @click.prevent="openTerms">Terms of Use</a>.
      </p>
      <p class="questionsText">
        To report a post, open any post and tap <strong>Report a post</strong> at the bottom of the detail screen.
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const openPrivacy = () => {
  void router.push({ name: "privacy-policy" });
};

const openTerms = () => {
  void router.push({ name: "terms-of-use" });
};
</script>
<style scoped lang="scss">
.settingsSupport-page {
  padding: 0 1.2rem;
  padding-bottom: calc(2rem + env(safe-area-inset-bottom, 0px));

  .settingsSupport-header {
    display: flex;
    width: 100%;
    max-width: 36rem;
    justify-content: start;
    align-items: start;
    margin: 1.5rem 0;
    flex-direction: column;

    .settingsSupport-heading {
      font-size: 1.4rem;
      font-family: poppinsSemiBold;
      color: white;
    }
  }

  .settingsSupport-questions {
    max-width: 36rem;

    .questionsText {
      font-family: inter;
      color: #d0dcd8;
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .settingsSupport-link {
      color: #ff4db8;
      text-decoration: underline;
    }
  }
}
</style>
