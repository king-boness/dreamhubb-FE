<template>
  <div class="TokensOnboarding-page" v-touch-swipe.mouse.right="goBack">
    <img src="/images/Auth/WhiteHands-Show.svg" alt="" />
    <div class="onboarding-text">
      <h5>Introducing Currency Tokens</h5>
      <div>
        <span class="onBoarding-description">
          We connect dreamers with those who are willing to support their goals,
          creating a community of support and motivation. Start fulfilling your
          own dreams or help someone else fulfill theirs today with Karma
          tokens.</span
        >
      </div>
    </div>
    <div class="onboarding-buttons">
      <q-btn class="buy-btn" @click="$router.push('tokenshop')"
        >Buy tokens</q-btn
      >
      <q-btn class="tutorial-btn" @click="$router.push('onBoarding/1')"
        >How DOES IT work?</q-btn
      >
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import { goBackOrFallback, resolveBackFallback } from "src/utils/navigation";
const router = useRouter();
const route = useRoute();

const goBack = () => {
  const defaultFallback = route.path.startsWith("/donee") ? { name: "donee-posts" } : { name: "donor-posts" };
  const fallback = resolveBackFallback(route.meta?.headerBackFallback, route, defaultFallback);
  goBackOrFallback(router, fallback);
};
</script>
<style scoped lang="scss">
.TokensOnboarding-page {
  padding-top: 0.6rem;
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-height: 75vh;
  align-items: center;

  img {
    height: 18rem;
    width: 12rem;
  }

  .onboarding-text {
    padding: 0 2.1rem;
    text-align: center;
    margin-top: 0.6rem;

    h5 {
      margin: 0;
      font-family: poppinsSemiBold;
      margin-bottom: 1rem;
      font-size: 1.3rem;
    }

    div {
      padding: 0 1rem;

      span {
        font-size: 1rem;
        font-family: inter;
        color: #d0dcd8;
      }
    }
  }

  .onboarding-buttons {
    width: 20rem;
    padding-top: 1rem;
    .tutorial-btn {
      background-color: rgba(221, 31, 97, 0.2) !important;
      color: rgb(218, 3, 82) !important;
      font-family: montseraatSemiBold;
      font-size: 1.1rem !important;
      border-radius: 0.5rem !important;
      height: 3rem;
      margin-bottom: 1rem;
    }

    .buy-btn {
      background-color: rgba(182, 0, 67, 1);
      color: white;
      border: none;
      font-size: 1.1rem;
      height: 3rem;
      font-family: montseraatSemiBold;
      border-radius: 0.5rem !important;
      margin-bottom: 0.8rem !important;
    }
  }
}
</style>
