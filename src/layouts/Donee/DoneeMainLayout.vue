<template>
  <q-layout view="lHh Lpr lFf" class="q-pb-md LayoutBackground">
    <HeaderComponent
      :karma="200000"
      :showBack="settingsPage"
      :is-body-light="isBodyLight"
      v-if="
        !(route.name === 'donee-post-detail') &&
        !(route.name === 'donee-search') &&
        !(route.name === 'donee-help') &&
        !onBoarding &&
        !submit &&
        !postDetail
      "
      :class="{ 'navbar--hidden': !showNavbar }"
      class="navbar"
    />
    <RouterView />
    <FooterDoneeComponent
      userPicture="/images/Auth/profilePicture.jpeg"
      v-if="
        !(route.name === 'donor-post-detail') &&
        !(route.name === 'donor-search') &&
        !(route.name === 'donor-help') &&
        !onBoarding &&
        !submit &&
        !postDetail &&
        !settings
      "
      :class="{ 'footer--hidden': !showNavbar }"
      class="navbar"
    />
  </q-layout>
</template>

<script setup lang="ts">
import HeaderComponent from "src/components/doneeComponents/HeaderDoneeComponent.vue";
import FooterDoneeComponent from "src/components/doneeComponents/FooterDoneeComponent.vue";
import { useRoute } from "vue-router";
import { watch, ref, onMounted, onBeforeUnmount, watchEffect } from "vue";

let settingsPage = false;
let onBoarding = false;
let submit = false;
let postDetail = false;
let settings = false;
const route = useRoute();
let routesName = route.name?.toString() || "";

const routeCheck = () => {
  routesName = route.name?.toString() || "";
  if (process.env.NODE_ENV === "development") {
    console.log(routesName);
  }
  routesName.startsWith("donee-settings")
    ? (settingsPage = true)
    : (settingsPage = false);
  routesName.startsWith("donee-onBoarding")
    ? (onBoarding = true)
    : (onBoarding = false);
  routesName.includes("donee-settings-")
    ? (settings = true)
    : (settings = false);
  routesName.startsWith("submit") ? (submit = true) : (submit = false);
  routesName.startsWith("donee-post-detail")
    ? (postDetail = true)
    : (postDetail = false);
};

routeCheck();
watch(route, () => {
  routeCheck();
  checkBodyClass();
});

const lastScrollPosition = ref(0);
const showNavbar = ref(true);

onMounted(() => {
  window.addEventListener("scroll", onScroll);
});

const onScroll = () => {
  const currentScrollPosition =
    window.scrollY || document.documentElement.scrollTop;

  if (currentScrollPosition < 0) {
    return;
  }
  if (Math.abs(currentScrollPosition - lastScrollPosition.value) < 65) {
    return;
  }
  showNavbar.value = currentScrollPosition < lastScrollPosition.value;
  lastScrollPosition.value = currentScrollPosition;
};
const isMobileDevice =
  /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
const sumEdges = window.innerWidth + window.innerHeight;

const handleResize = () => {
  if (window.innerWidth + window.innerHeight < sumEdges) {
    const footerArr = document.getElementsByClassName("footer");
    for (let i = 0; i < footerArr.length; i++) {
      const footer = footerArr[i] as HTMLElement;
      footer.style.bottom = "auto";
    }
  } else {
    const footerArr = document.getElementsByClassName("footer");
    for (let i = 0; i < footerArr.length; i++) {
      const footer = footerArr[i] as HTMLElement;
      footer.style.bottom = "0";
    }
  }
};
const isBodyLight = ref(false);

const checkBodyClass = () => {
  isBodyLight.value = document.body.classList.contains("body--light");
};

onMounted(() => {
  if (isMobileDevice) {
    window.addEventListener("resize", handleResize);
  }
  checkBodyClass();
});

onBeforeUnmount(() => {
  if (isMobileDevice) {
    window.removeEventListener("resize", handleResize);
  }
  checkBodyClass();
});
</script>

<style lang="scss">
.navbar--hidden {
  box-shadow: none;
  transform: translate3d(0, -100%, 0);
}
.footer--hidden {
  box-shadow: none;
  transform: translate3d(0, 110%, 0);
}
.navbar {
  transition: transform 0.25s;
}
.LayoutBackground {
  background-image: url("/images/Auth/bg-explain.png") !important;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: top;
}
</style>
