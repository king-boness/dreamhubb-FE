<template>
  <q-layout
    view="lHh Lpr fff "
    class="LayoutBackground"
    :class="{ 'iphoneDevice-small': $q.platform.is.ios }"
  >
    <div class="row bgExplain explainerBody">
      <div class="row col-12 justify-center">
        <div class="row col-12 justify-between">
          <q-btn class="arrowButtonBack" @click="previousExplainer">
            <img
              class="arrowButtonBack-icon"
              src="/icons/arrowIcon.svg"
              alt=""
            />
          </q-btn>
        </div>
        <div class="col-12 row justify-center explainBody routeContent">
          <RouterView></RouterView>
        </div>
        <div
          v-if="explainerIndex != 5"
          class="col-5 row self-end q-pa-lg justify-center linearProgressContainer"
        >
          <q-btn class="arrowButton" @click="nextExplainer">
            <img class="arrowButton-icon" src="/icons/arrowIcon.svg" alt="" />
          </q-btn>
          <q-linear-progress
            :value="progress"
            rounded
            animationSpeed="600"
            color="negative"
            class="q-mt-sm"
          />
        </div>
        <div v-else class="joinButtonContainer" style="width: 100%">
          <q-btn
            label="Join the movement"
            color="primary"
            class="button"
            @click="$router.push('/register/form')"
          />
        </div>
      </div>
    </div>
  </q-layout>
</template>
<script lang="ts" setup>
import { ref } from "vue";
import { useRouter } from "vue-router";
const router = useRouter();
const currentIndex = String(router.currentRoute.value.name).substring(16);
const explainerIndex = ref(parseInt(currentIndex));
const progress = ref(explainerIndex.value * 0.2);

const nextExplainer = () => {
  progress.value += 0.2;
  explainerIndex.value++;
  router.push({ name: `explainers-page-${explainerIndex.value}` });
};

const previousExplainer = () => {
  if (explainerIndex.value - 1 < 1) {
    router.push({ name: "landing" });
  } else {
    progress.value -= 0.2;
    explainerIndex.value--;
    router.push({ name: `explainers-page-${explainerIndex.value}` });
  }
};
</script>

<style lang="scss">
.q-btn::before {
  box-shadow: none;
}
.LayoutBackground {
  background-image: url("/images/Auth/bg-explain.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: top;
}
</style>
<style scoped lang="scss">
.linearProgressContainer {
  padding-top: 3rem;
  display: flex;
  justify-content: center;
  flex-direction: row;
}
.joinButtonContainer {
  display: flex;
  width: 100%;
  justify-content: center;
  align-items: center;
  padding-top: 2rem;
}
.routeContent {
  height: 37rem;
  display: flex;
  justify-content: center;
}
.explainerBody {
  display: flex;
  justify-content: space-between;
  height: 100%;
  width: 100%;
}
.arrowButton {
  background-color: $primary;
  border-radius: 50%;
  height: 3rem;
  width: 3rem;
  margin-bottom: 0.2rem;
  .arrowButton-icon {
    transform: rotate(180deg);
  }
}
.arrowButtonBack {
  background-color: none;
  border: 0.1rem solid white;
  border-radius: 50%;
  height: 2.5rem;
  width: 2.5rem;
  padding-right: 1.11rem;
  margin-top: 2rem;
}
.button {
  background-color: rgba(182, 0, 67, 1);
  color: white;
  border: none;
  font-size: 1.2rem;
  height: 3.2rem;
  width: 21.4rem;
  font-family: montseraatSemiBold;
  border-radius: 0.5rem !important;
  margin-top: 1rem;
}
</style>
