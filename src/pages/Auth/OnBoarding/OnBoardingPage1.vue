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
          with Tokens.</span
        >
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { onBeforeUnmount, onMounted } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

const handleBack = () => {
  router.push({ name: "donee-token" });
};

onMounted(() => {
  document.body.classList.add("onboarding-page-locked");
});

onBeforeUnmount(() => {
  document.body.classList.remove("onboarding-page-locked");
});
</script>

<style scoped lang="scss">
/* Unified app background (iosSafeArea.scss) */
.onBoarding-page1 {
  width: min(390px, 100vw);
  height: 100svh;
  padding: 24px 20px 40px;
  margin: 0 auto;
  background: transparent;
  overflow: clip;
  position: fixed;
  inset: 0;
  left: 0;
  right: 0;
  display: flex;
  flex-direction: column;
  box-sizing: border-box;

  .onBoarding-header {
    position: absolute;
    top: calc(env(safe-area-inset-top, 0px) + 8px);
    left: 20px;
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0;
    flex-shrink: 0;
    z-index: 2;

    .onBoarding-backBtn {
      border: none;
      background: rgba(255, 255, 255, 0.92);
      display: flex;
      align-items: center;
      justify-content: center;
      width: 40px;
      height: 40px;
      min-width: 40px;
      min-height: 40px;
      border-radius: 50%;
      border: 2px solid rgba(0, 0, 0, 0.22);
      box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
      cursor: pointer;
      transition: all 0.2s ease;
      flex-shrink: 0;

      &:hover {
        background: #ffffff;
        border-color: rgba(0, 0, 0, 0.28);
      }

      .q-icon {
        font-size: 24px;
        color: #111111;
      }
    }
  }

  .onBoarding-body {
    width: 100%;
    height: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding: 0 0 0;
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

:global(body.onboarding-page-locked) {
  overflow: hidden;
  touch-action: none;
}
</style>
