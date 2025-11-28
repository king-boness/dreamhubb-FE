<template>
  <q-layout view="lHh Lpr fff" class="landingLayout">
    <q-page-container>
      <q-page
        class="justify-center items-center login"
        :class="{ iphoneDevice: $q.platform.is.ios }"
      >
        <div class="row col-12">
          <div v-if="!isInternet">
            <q-banner dense inline-actions class="text-white bg-red">
              You have lost connection to the internet. This app is offline.
              <template v-slot:action>
                <q-btn flat color="white" label="Turn ON Wifi" />
              </template>
            </q-banner>
          </div>
          <div v-if="route.name == 'login'" class="buttonDiv">
            <q-btn class="arrowButtonBack" @click="handleBack">
              <img
                class="arrowButtonBack-icon"
                src="/icons/arrowIcon.svg"
                alt=""
              />
            </q-btn>
          </div>
          <div class="landingPage-mapImage">
            <img
              src="/images/Auth/map-image.svg"
              spinner-color="white"
              class="mapImage"
            />
          </div>
        </div>
        <div class="dreamImgs">
          <!-- <q-img src="src/assets/Auth/islandImg.png" class="imgMain1 imgMain" />
          <q-img
            src="src/assets/Auth/surgeryImg.png"
            class="imgMain2 imgMain"
          />
          <q-img src="src/assets/Auth/teslaImg.png" class="imgMain3 imgMain" /> -->
        </div>
        <div class="row col-12 landingPage-contentSection">
          <h1 class="col-12 logo">dreamhubb</h1>
          <router-view />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
const isInternet = navigator.onLine;

import { useRoute, useRouter } from "vue-router";
const route = useRoute();
const router = useRouter();

const handleBack = () => {
  router.push({ name: "auth-welcome" });
};
</script>
<style lang="scss" scoped>
.landingPage-mapImage {
  padding-top: 5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  width: 100%;
}
.mapImage {
  height: 16rem;
  width: 100%;
  margin-bottom: 2rem;
}
.login {
  background-image: none;
  background-image: url("/images/Auth/bg-explain.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: top;
}
.buttonDiv {
  margin-top: 0;
  margin: 1rem;
  margin-bottom: -3.5rem !important;
}
.q-banner {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 999;
}

.arrowButtonBack {
  background-color: none;
  border: 0.1rem solid white;
  border-radius: 50%;
  height: 2.5rem;
  width: 2.5rem;
  padding-right: 1.11rem;
}
</style>
