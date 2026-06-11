<template>
  <q-layout view="lHh Lpr fff" class="landingLayout">
    <q-page-container>
      <q-page
        class="justify-center items-center login"
        :class="{
          iphoneDevice: $q.platform.is.ios,
          'login--reset': isResetFlow,
          'login--auth-form': route.name === 'login'
        }"
      >
        <div class="row col-12" :class="{ 'landingLayout-topRow--overlay': isResetFlow }">
          <div v-if="route.name == 'login'" class="buttonDiv">
            <q-btn class="arrowButtonBack" @click="handleBack">
              <img
                class="arrowButtonBack-icon"
                src="/icons/arrowIcon.svg"
                alt=""
              />
            </q-btn>
          </div>
          <div
            v-if="!isResetFlow"
            class="landingPage-mapImage"
            :class="{ 'login-welcome-map': route.name === 'login' }"
          >
            <img
              src="/images/Auth/map-image.svg"
              spinner-color="white"
              class="mapImage"
              :class="{ 'login-welcome-map__img': route.name === 'login' }"
              alt=""
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
        <div
          class="row col-12 landingPage-contentSection"
          :class="{
            'landingPage-contentSection--reset': isResetFlow,
            'login-welcome-stack': route.name === 'login'
          }"
        >
          <div v-if="!isResetFlow && route.name === 'login'" class="login-welcome-brand">
            <img :src="logoImage" alt="dreamhubb" class="login-welcome-logo" />
          </div>
          <h1 v-else-if="!isResetFlow" class="col-12 logo">dreamhubb</h1>
          <router-view />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRoute, useRouter } from "vue-router";
import logoImage from "src/assets/logos/dreamhubb.svg";

const route = useRoute();
const router = useRouter();

const isResetFlow = computed(() => route.name === "forgot-password" || route.name === "reset-password");

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
/* Background from global app (iosSafeArea.scss) */
.login {
  background-image: none !important;
  background-color: transparent !important;
}

.login--reset {
  position: relative;
  height: 100dvh;
  min-height: 100dvh;
  overflow: hidden;
}

.landingLayout-topRow--overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 0;
  margin: 0;
  padding: 0;
}

.landingPage-contentSection--reset {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100dvh;
  min-height: 100dvh;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  // Quasar `.row` applies negative margins for gutters -> it can visually shift centering.
  margin-left: 0 !important;
  margin-right: 0 !important;
  padding: 0 16px;
  box-sizing: border-box;
}
.buttonDiv {
  margin-top: 0;
  margin: 1rem;
  margin-bottom: -3.5rem !important;
}

.offlineDialog-header {
  text-align: center;
  padding: 2rem 1.5rem 1.5rem;
}

.offlineDialog-icon {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.offlineDialog-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.75rem;
  font-family: poppinsSemiBold;
}

.offlineDialog-message {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  font-family: poppins;
}

.offlineDialog-actions {
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.offlineDialog-btn {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: montseraatSemiBold;

  &--close {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  }

  &--settings {
    background: linear-gradient(95deg, #ff007a, #ff8a00);
    color: white;

    &:hover {
      background: linear-gradient(95deg, #ff007a, #ff8a00);
      opacity: 0.9;
    }
  }
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
