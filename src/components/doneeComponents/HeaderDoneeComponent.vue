<template>
  <div class="header row" :class="{ 'iphoneDevice-large': $q.platform.is.ios }">
    <!-- Splash screen for role switch -->
    <AppSplash v-if="isSwitchingRole" class="splash-overlay" />

    <div class="row" style="">
      <template v-if="!props.showBack">
        <div
          class="iconContainer"
          @click="handleLogoClick"
        >
          <img
            :src="logoImage"
            alt=""
            class="logoIcon"
          />
          <img src="/header_icons/donee.svg" alt="" class="header-roleIcon" />
          <img src="/header_icons/swap.svg" alt="" class="navbarIcon" />
        </div>
      </template>
      <template v-else>
        <q-btn class="settingsHeader-button" @click="$router.go(-1)"
          ><img src="/icons/arrowIcon.svg" alt=""
        /></q-btn>
      </template>
    </div>
    <div class="row">
      <div class="row items-center">
        <svg
          width="49"
          height="49"
          viewBox="0 0 44 44"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
          @click="$router.push({ name: 'donee-search' })"
          class="searchIcon"
        >
          <g opacity="0.8">
            <path
              d="M31 31L26.65 26.65M29 21C29 25.4183 25.4183 29 21 29C16.5817 29 13 25.4183 13 21C13 16.5817 16.5817 13 21 13C25.4183 13 29 16.5817 29 21Z"
              stroke="#FAFAFA"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
          </g>
        </svg>
      </div>
      <div class="displayKarma">
        <div class="textWrapper">
          <img src="/icons/KarmaIcon.png" alt="" class="navbarKarmaIcon" />
          <span class="karmaValue">{{ formatNumber(props.karma) }}</span>
          <q-btn
            class="navbarButton"
            @click="$router.push({ name: 'donee-token' })"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="10"
              height="10"
              viewBox="0 0 10 10"
              fill="none"
              class="buttonIcon"
            >
              <path
                d="M9.16667 4.16667H5.83333V0.833333C5.83333 0.61232 5.74554 0.400358 5.58926 0.244078C5.43297 0.0877975 5.22101 0 5 0C4.77899 0 4.56702 0.0877975 4.41074 0.244078C4.25446 0.400358 4.16667 0.61232 4.16667 0.833333V4.16667H0.833333C0.61232 4.16667 0.400358 4.25446 0.244078 4.41074C0.0877975 4.56702 0 4.77899 0 5C0 5.22101 0.0877975 5.43297 0.244078 5.58926C0.400358 5.74554 0.61232 5.83333 0.833333 5.83333H4.16667V9.16667C4.16667 9.38768 4.25446 9.59964 4.41074 9.75592C4.56702 9.9122 4.77899 10 5 10C5.22101 10 5.43297 9.9122 5.58926 9.75592C5.74554 9.59964 5.83333 9.38768 5.83333 9.16667V5.83333H9.16667C9.38768 5.83333 9.59964 5.74554 9.75592 5.58926C9.9122 5.43297 10 5.22101 10 5C10 4.77899 9.9122 4.56702 9.75592 4.41074C9.59964 4.25446 9.38768 4.16667 9.16667 4.16667Z"
                fill="#BD0043"
              />
            </svg>
          </q-btn>
        </div>
        <!-- TODO: zmensenie velkosti pisma ked je vacsia dlzka -->
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.header {
  background-image: none;
  background-image: url("/images/Auth/bg-explain.png") !important;
  background-repeat: no-repeat;
  background-size: auto;
  position: sticky;
  top: 0;
  left: 0;
  width: 100%;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1.3rem 1rem 1rem 1rem;
  border-bottom: 0.05rem solid rgba(255, 255, 255, 0.202);
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3), 0 0 20px rgba(255, 255, 255, 0.1);
  z-index: 2000; // Higher z-index to ensure header is above content
}

.splash-overlay {
  position: fixed !important;
  top: 0 !important;
  left: 0 !important;
  right: 0 !important;
  bottom: 0 !important;
  width: 100vw !important;
  height: 100vh !important;
  margin: 0 !important;
  padding: 0 !important;
  z-index: 99999 !important;
  overflow: hidden !important;
}

.settingsHeader-button {
  margin: 0 0.4rem;
  width: 2.8rem;
  height: 2.8rem;
  border-radius: 2rem;
  margin-right: 4.1rem;
  background: linear-gradient(
    90deg,
    rgba(44, 44, 44, 0.832) 10%,
    rgba(67, 66, 66, 0.986) 100%
  );
}
.iconContainer {
  display: flex;
  align-items: center;
  gap: 0.6rem;
  flex-shrink: 0;
}

.logoIcon {
  height: 1.6rem;
  width: 1.6rem;
  object-fit: contain;
}

.header-roleIcon {
  height: 1rem;
  width: auto;
  object-fit: contain;
}

.navbarIcon {
  height: 1.6rem;
  width: auto;
  object-fit: contain;
}
.buttonIcon {
  width: 1rem;
  height: 1rem;
}
.displayKarma {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: rgba(47, 47, 47, 0.6);
  border: 0.1rem solid #5a0e29b8;
  width: auto;
  height: 3rem;
  padding: 0.3rem;
  border-radius: 0.6rem;
  .textWrapper {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 0.6rem;
    .navbarKarmaIcon {
      height: 1.3rem;
    }
    .karmaValue {
      color: #f3f3f3a2;
      font-size: 1.2rem;
      font-family: poppinsBold;
      margin-right: 0.5rem;
    }
  }
  .navbarButton {
    background: rgba(189, 0, 67, 0.1);
    padding: 0.5rem;
    width: 2.25rem;
    height: 2.25rem;
    border-radius: 0.4rem;
    padding-left: 0.5rem;
  }
}
</style>

<script setup lang="ts">
import { defineProps, ref, computed } from "vue";
import { useRouter } from "vue-router";
import { formatNumber } from "src/components/partials/FunctionsComponent.vue";
import AppSplash from "src/components/common/AppSplash.vue";

interface Props {
  karma: number;
  showBack: boolean;
  isBodyLight: boolean;
}

const props: Props = defineProps({
  karma: {
    type: Number,
    required: true
  },
  showBack: {
    type: Boolean,
    required: false
  },
  isBodyLight: {
    type: Boolean,
    required: true
  }
});

const router = useRouter();
const isSwitchingRole = ref(false);

// Logo imports
const logoImageLight = new URL("../../assets/logos/dreamhubb_logo_l.svg", import.meta.url).href;
const logoImageDark = new URL("../../assets/logos/dreamhubb_logo_d.svg", import.meta.url).href;

// Computed logo based on light/dark mode
const logoImage = computed(() => {
  // Light mode: use dark logo (dreamhubb_logo_d.svg)
  // Dark mode: use light logo (dreamhubb_logo_l.svg)
  return props.isBodyLight ? logoImageDark : logoImageLight;
});

const handleLogoClick = async () => {
  console.log("Donee logo clicked! Switching to Donor mode...");
  // Add class to body to hide footer
  document.body.classList.add("splash-active");
  // Show splash screen
  isSwitchingRole.value = true;
  // Wait a bit for splash to show, then navigate
  await new Promise(resolve => setTimeout(resolve, 500));
  // Switch to Donor interface (role switch)
  await router.push({ name: "donor-posts" });
  // Hide splash after navigation
  setTimeout(() => {
    isSwitchingRole.value = false;
    document.body.classList.remove("splash-active");
  }, 300);
};
</script>
