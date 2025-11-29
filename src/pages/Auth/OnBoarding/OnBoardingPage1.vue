<template>
  <div class="onBoarding-page1">
    <!-- Back button -->
    <div class="onBoarding-header">
      <button class="onBoarding-backBtn" @click="handleBack">
        <q-icon name="chevron_left" />
      </button>
    </div>

    <div class="onBoarding-body">
      <img src="/icons/KarmaIcon.svg" alt="" class="onBoarding-icon" />
      <div class="onBoarding-textContainer">
        <span class="onBoarding-title">Headline of how it works</span>
        <span class="onBoarding-text"
          >We connect dreamers with those who are willing to support their
          goals, creating a community of support and motivation. Start
          fulfilling your own dreams or help someone else fulfill theirs today
          with Karma tokens.</span
        >
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router";

const router = useRouter();

const handleBack = () => {
  router.push({ name: "donee-token" });
};
</script>

<style scoped lang="scss">
.onBoarding-page1 {
  max-width: 390px;
  height: 100vh;
  padding: 24px 20px 40px;
  margin: 0 auto;
  background: radial-gradient(circle at top, #0b001c 0%, #05000e 40%, #010006 100%);
  overflow: hidden;
  position: relative;
  display: flex;
  flex-direction: column;

  .onBoarding-header {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0 0 1rem 0;
    flex-shrink: 0;

    .onBoarding-backBtn {
      border: none;
      background: transparent;
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      min-width: 40px;
      min-height: 40px;
      border-radius: 50%;
      border: 2px solid rgba(255, 255, 255, 0.3);
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;

      &:hover {
        border-color: rgba(255, 255, 255, 0.6);
      }

      .q-icon {
        font-size: 24px;
        color: #ffffff;
      }
    }
  }

  .onBoarding-body {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 0;
    min-height: 0;
    overflow: hidden;
    position: relative;

    .onBoarding-icon {
      height: 9rem;
      margin-bottom: 2rem;
      flex-shrink: 0;
    }
  }

  .onBoarding-textContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    color: white;
    flex-direction: column;
    padding: 0 1.5rem;
    text-align: center;
    flex-shrink: 0;

    .onBoarding-title {
      margin-bottom: 1rem;
      font-size: 1.5rem;
      font-weight: 700;
      font-family: poppinsSemiBold;
      line-height: 1.2;
    }

    .onBoarding-text {
      color: #d0dcd8ba;
      font-size: 1rem;
      font-family: inter;
      line-height: 1.5;
    }
  }
}
</style>
