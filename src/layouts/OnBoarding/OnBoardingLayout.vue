<template>
  <div
    class="onBoarding-layout"
    v-touch-swipe.mouse.right="goBack"
    :class="{ 'iphoneDevice-small': $q.platform.is.ios }"
  >
    <div class="onBoarding-header">
      <q-btn
        v-if="onBoardingIndex != 1"
        @click="previousBoard"
        class="onBoarding-buttonPrevious"
      >
        <img src="/icons/arrowButton-icon.svg" alt="" />
      </q-btn>
      <q-btn v-else class="onBoarding-closeBtn" @click="nativePage('token')"
        ><img src="/icons/closeIcon.svg" alt="" class="closeIcon" />
      </q-btn>
    </div>
    <div class="onBoarding-view">
      <RouterView></RouterView>
    </div>
    <div v-if="onBoardingIndex != 4" class="onBoarding-progressContainer">
      <q-btn @click="nextBoard" class="onBoarding-buttonNext">
        <img src="/icons/arrowButton-icon.svg" alt="" />
      </q-btn>

      <q-linear-progress
        :value="progress"
        rounded
        animationSpeed="600"
        color="negative"
        class="q-mt-sm"
      />
    </div>
    <div class="onBoarding-endingContainer" v-else>
      <div class="onBoarding-progress">
        <q-linear-progress
          :value="progress"
          rounded
          animationSpeed="600"
          color="negative"
          class="q-mt-sm"
        />
      </div>
      <q-btn class="buy-btn" @click="nativePage('tokenshop')">Buy tokens</q-btn>
    </div>
  </div>
</template>
<style scoped lang="scss">
.onBoarding-layout {
  .onBoarding-header {
    padding: 0.5rem;
    padding-top: 1.6rem;
    width: 100%;
    .onBoarding-buttonPrevious {
      margin: 0 0.4rem;
      width: 2.8rem;
      height: 2.8rem;
      border-radius: 2rem;
      padding-left: 0.8rem;
      border: 0.15rem solid white;
      backdrop-filter: blur(1rem);
      img {
        padding-left: 0.15rem;
      }
    }
    .onBoarding-closeBtn {
      margin: 0 0.4rem;
      width: 2.8rem;
      height: 2.8rem;
      border-radius: 2rem;
      border: 0.15rem solid white;
      backdrop-filter: blur(1rem);
    }
  }
  .onBoarding-view {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 32rem;
  }
  .onBoarding-progressContainer {
    width: 100%;
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    margin: 0 auto;
    position: fixed;
    bottom: 2.6rem;
    padding: 0 8.2rem;
    .onBoarding-buttonNext {
      margin-bottom: 0.4rem;
      height: 3.2rem;
      width: 3.2rem;
      padding: 0.37rem;
      background-color: rgba(182, 0, 67, 1);
      border-radius: 50%;

      img {
        rotate: 180deg;
      }
    }
  }
  .onBoarding-endingContainer {
    display: flex;
    justify-content: center;
    align-items: center;
    position: fixed;
    bottom: 1.6rem;
    width: 100%;
    flex-direction: column;
    gap: 0.8rem;
    padding: 0 1rem;
    .onBoarding-progress {
      margin: 0 !important;
      width: 8rem !important;
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
      width: 22rem;
    }
  }
}
</style>

<script setup lang="ts">
import { ref, watch } from "vue";

import { useRouter, useRoute } from "vue-router";

const router = useRouter();

const currentIndex = String(router.currentRoute.value.name).substring(22);
const onBoardingIndex = ref(parseInt(currentIndex));
const progress = ref(onBoardingIndex.value * 0.25);

const nextBoard = () => {
  progress.value += 0.25;
  onBoardingIndex.value++;
  if (donee) {
    router.push({ name: `donee-onBoarding-page-${onBoardingIndex.value}` });
  } else {
    router.push({ name: `donor-onBoarding-page-${onBoardingIndex.value}` });
  }
};

const previousBoard = () => {
  progress.value -= 0.25;
  onBoardingIndex.value--;
  if (donee) {
    router.push({ name: `donee-onBoarding-page-${onBoardingIndex.value}` });
  } else {
    router.push({ name: `donor-onBoarding-page-${onBoardingIndex.value}` });
  }
};
const goBack = () => {
  router.go(-1);
  progress.value -= 0.25;
  onBoardingIndex.value--;
};

const route = useRoute();
let routesName = route.name?.toString() || "";

let donee = false;
const routeCheck = () => {
  routesName = route.name?.toString() || "";
  if (process.env.NODE_ENV === "development") {
  console.log(currentIndex);
  }
  routesName.startsWith("donee") ? (donee = true) : (donee = false);
};
const nativePage = (name: string) => {
  routesName.startsWith("donee")
    ? router.push({ name: `donee-${name}` })
    : router.push({ name: `donor-${name}` });
};
routeCheck();
watch(route, () => {
  routeCheck();
});
</script>
