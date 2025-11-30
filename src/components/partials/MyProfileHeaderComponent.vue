<template>
  <div
    class="myProfile-header"
    :style="{
      backgroundImage: 'url(' + profile.user.userBackground + ')'
    }"
  >
    <div class="myProfile-headerBlur"></div>
    <div class="myProfile-btnDiv">
      <q-btn class="myProfile-headerBtn" @click="openBackgroundInput"
        ><img src="/icons/photoSettingIcon.svg" alt=""
      /></q-btn>
      <input
        type="file"
        ref="backgroundInput"
        @change="handleFileChange($event, 'backgroundImage')"
        style="display: none"
        multiple
        accept="image/*"
      />
    </div>
    <div class="myProfile-userDetail">
      <div class="myProfile-preview">
        <div class="myProfile-profileImgDiv">
          <img :src="profile.user.userPicture" alt="" class="myProfile-img" />
          <q-btn class="myProfile-imgBtn" @click="openProfileInput"
            ><img src="/icons/photoSettingIcon.svg" alt=""
          /></q-btn>
          <input
            type="file"
            ref="profileInput"
            @change="handleFileChange($event, 'profilePicture')"
            style="display: none"
            multiple
            accept="image/*"
          />
        </div>
        <div class="myProfile-nameDiv">
          <h3>{{ profile.user.userName }}</h3>
          <img
            v-if="selectedBadge"
            :src="selectedBadge.image"
            :alt="selectedBadge.title"
            class="myProfile-selectedBadge"
          />
          <img
            src="/icons/addBadge-icon.svg"
            alt=""
            @click="[(dialog = true), cycleDrawer()]"
          />
        </div>
      </div>
      <div class="myProfile-settingDiv">
        <q-btn
          class="userProfile-settingSettingsBtn"
          @click="routeCheck('settings')"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="17"
            height="16"
            viewBox="0 0 17 16"
            fill="none"
            class="settingButtonImage"
          >
            <mask
              id="mask0_491_36366"
              style="mask-type: luminance"
              maskUnits="userSpaceOnUse"
              x="1"
              y="0"
              width="15"
              height="16"
            >
              <path
                d="M6.59471 14.3902C5.49206 14.061 4.49344 13.4519 3.69604 12.6222C3.9526 12.3179 4.11253 11.944 4.15537 11.5483C4.19821 11.1526 4.12201 10.7531 3.93652 10.401C3.75103 10.0488 3.46469 9.76001 3.11414 9.57152C2.76358 9.38303 2.36476 9.30343 1.96871 9.34289C1.87848 8.90092 1.83314 8.45097 1.83337 7.99989C1.83337 7.30322 1.94004 6.63122 2.13871 5.99989H2.16671C2.50663 5.99999 2.84096 5.91347 3.13815 5.74847C3.43534 5.58347 3.68557 5.34545 3.86522 5.05688C4.04487 4.76831 4.148 4.43872 4.16488 4.09922C4.18176 3.75972 4.11184 3.42152 3.96171 3.11655C4.74324 2.38883 5.68839 1.85983 6.71738 1.57422C6.88483 1.90302 7.13999 2.17908 7.45461 2.37187C7.76923 2.56465 8.13105 2.66664 8.50004 2.66655C8.86903 2.66664 9.23085 2.56465 9.54547 2.37187C9.86009 2.17908 10.1152 1.90302 10.2827 1.57422C11.3117 1.85983 12.2568 2.38883 13.0384 3.11655C12.8871 3.42366 12.8173 3.76443 12.8355 4.10627C12.8536 4.44811 12.9592 4.77956 13.1422 5.06889C13.3251 5.35823 13.5792 5.59577 13.8803 5.75878C14.1813 5.92179 14.5191 6.00481 14.8614 5.99989C15.0644 6.64712 15.1673 7.32156 15.1667 7.99989C15.1667 8.45989 15.12 8.90922 15.0314 9.34322C14.6353 9.30376 14.2365 9.38337 13.8859 9.57186C13.5354 9.76035 13.2491 10.0491 13.0636 10.4013C12.8781 10.7534 12.8019 11.1529 12.8447 11.5486C12.8876 11.9443 13.0475 12.3183 13.304 12.6226C12.5066 13.4521 11.508 14.0611 10.4054 14.3902C10.2759 13.9867 10.0216 13.6346 9.67919 13.3849C9.33676 13.1351 8.92387 13.0005 8.50004 13.0005C8.07621 13.0005 7.66332 13.1351 7.3209 13.3849C6.97847 13.6346 6.72419 13.9867 6.59471 14.3902Z"
                fill="white"
                stroke="white"
                stroke-width="1.33333"
                stroke-linejoin="round"
              />
              <path
                d="M8.50008 10.3332C8.8065 10.3332 9.10992 10.2728 9.39301 10.1556C9.6761 10.0383 9.93333 9.86642 10.15 9.64975C10.3667 9.43308 10.5385 9.17586 10.6558 8.89277C10.7731 8.60967 10.8334 8.30626 10.8334 7.99984C10.8334 7.69342 10.7731 7.39 10.6558 7.10691C10.5385 6.82382 10.3667 6.56659 10.15 6.34992C9.93333 6.13325 9.6761 5.96138 9.39301 5.84412C9.10992 5.72686 8.8065 5.6665 8.50008 5.6665C7.88124 5.6665 7.28775 5.91234 6.85017 6.34992C6.41258 6.78751 6.16675 7.381 6.16675 7.99984C6.16675 8.61868 6.41258 9.21217 6.85017 9.64975C7.28775 10.0873 7.88124 10.3332 8.50008 10.3332Z"
                fill="black"
                stroke="black"
                stroke-width="1.33333"
                stroke-linejoin="round"
              />
            </mask>
            <g mask="url(#mask0_491_36366)">
              <path d="M0.5 0H16.5V16H0.5V0Z" fill="#BD0043" />
            </g>
          </svg>
          Settings</q-btn
        >
        <q-btn class="userProfile-settingShareBtn"
          ><img src="/icons/shareIcon.svg" alt=""
        /></q-btn>
      </div>
    </div>
  </div>
  <div v-if="dialog" class="badgeSwiper z-max" @click="handleDrawerClick">
    <q-card
      class="slide-drawer slide-drawer--bottom text-white fixed-bottom column no-wrap"
      :class="`slide-drawer--open-${drawerMode}`"
      :style="drawerStyle"
      @click.stop
    >
      <q-card-section
        class="slide-drawer__handler--horizontal row flex-center"
        v-touch-pan.mouse.vertical.prevent="slideDrawer"
        @click="cycleDrawer"
      >
        <div class="cursor-pointer"></div>
      </q-card-section>
      <q-card-section class="badgeSwiper-Titlediv">
        <span class="badgeSwiper-title">Select Badge to Display</span>
      </q-card-section>
      <q-card-section class="imgUploaderContainer scroll">
        <BadgeSwiper
          class="imageUploaderComponent"
          :openedFully="openedFully"
          :key="drawerMode"
          @badge-selected="handleBadgeSelected"
        ></BadgeSwiper>
      </q-card-section>
      <q-card-section class="badgeSwiper-descDiv text-center">
        <span class="badgeSwiper-description"
          >Earn more badges by completing tasks</span
        >
        <q-btn class="confirmButton" @click="saveBadge"> Save badge </q-btn>
      </q-card-section>
    </q-card>
  </div>
</template>
<script setup lang="ts">
/* eslint-disable */
//@ts-ignore
import { ref, computed, nextTick, onBeforeUnmount, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import BadgeSwiper from "src/components/partials/BadgeSwiperComponent.vue";
import { UserProfile } from "src/components/models";
import { useUserStore } from "src/stores/user-store";
import { useApiCallStore } from "src/stores/api-calls-store";

const userStore = useUserStore();
const apiStore = useApiCallStore();

const profile = ref({
  user: {
    userName: "User",
    userPicture: "/images/Auth/profilePicture.jpeg",
    userBackground: "/images/Auth/postBackground.png",
    dateCreated: "09/15/2023",
    location: "Island, Reykjavik",
    views: 156
  }
} as UserProfile);

// Update user name from API store
watch(
  () => apiStore.user,
  (user) => {
    if (process.env.NODE_ENV === "development") {
      console.log("API Store User:", user);
    }
    if (user) {
      // Try different possible property names from API
      const userName = (user as any).name || (user as any).username || (user as any).fullName || (user as any).nickname;
      if (process.env.NODE_ENV === "development") {
        console.log("Extracted userName:", userName);
      }
      if (userName) {
        profile.value.user.userName = userName;
        return;
      }
    }
    // Fallback to userStore.name
    if (userStore.name) {
      if (process.env.NODE_ENV === "development") {
        console.log("Using userStore.name:", userStore.name);
      }
      profile.value.user.userName = userStore.name;
    }
  },
  { immediate: true, deep: true }
);

// Selected badge state
const selectedBadge = ref<{ image: string; title: string } | null>(null);
const tempSelectedBadge = ref<{ image: string; title: string } | null>(null);

// Load saved badge from localStorage on mount
const loadSavedBadge = () => {
  const savedBadge = localStorage.getItem("userSelectedBadge");
  if (savedBadge) {
    try {
      selectedBadge.value = JSON.parse(savedBadge);
    } catch (e) {
      // Ignore parse errors
    }
  }
};

// Handle badge selection from BadgeSwiper component
const handleBadgeSelected = (badge: { image: string; title: string }) => {
  tempSelectedBadge.value = badge;
};

// Save badge and close dialog
const saveBadge = () => {
  if (tempSelectedBadge.value) {
    selectedBadge.value = tempSelectedBadge.value;
    localStorage.setItem("userSelectedBadge", JSON.stringify(tempSelectedBadge.value));
    dialog.value = false;
    animateDrawerTo(drawerMinHeight);
  }
};

const drawerMinHeight = 40;
const drawerTopOffset = 30;
const drawerOpenRatioHalf = 50;
const dialog = ref(false);
const openedFully = ref(false);
const profileInput = ref<HTMLInputElement | null>(null);
const backgroundInput = ref<HTMLInputElement | null>(null);

const openProfileInput = () => {
  if (profileInput.value) {
    profileInput.value.click();
  }
};
const openBackgroundInput = () => {
  if (backgroundInput.value) {
    backgroundInput.value.click();
  }
};

const handleFileChange = (event: Event, object: string) => {
  const target = event.target as HTMLInputElement;
  const files = target.files;

  if (files) {
    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const reader = new FileReader();

      reader.onload = () => {
        if (object == "profilePicture") {
          profile.value.user.userPicture = reader.result as string;
        } else if (object == "backgroundImage") {
          profile.value.user.userBackground = reader.result as string;
        }
      };

      reader.readAsDataURL(file);
    }
  }
};
const drawerPos = ref(drawerMinHeight);

const drawerMaxHeight = computed(() =>
  Math.max(0, window.innerHeight - drawerTopOffset)
);

const drawerOpenRatio = computed(() => {
  return Math.round(
    (Math.max(0, drawerPos.value - drawerMinHeight) /
      Math.max(1, drawerMaxHeight.value - drawerMinHeight)) *
      100
  );
});

const drawerStyle = computed(() => ({
  height: `${drawerMaxHeight.value}px`,
  transform: `translateY(${-drawerPos.value}px)`
}));

const drawerMode = computed(() => {
  if (drawerOpenRatio.value > drawerOpenRatioHalf) {
    openedFully.value = true;
    return "full";
  }
  openedFully.value = false;
  return drawerOpenRatio.value > 0 ? "half" : "handler";
});

let animateTimeout: any;

const slideDrawer = (ev: any) => {
  const { direction, delta, isFinal } = ev;
  drawerPos.value = Math.max(
    drawerMinHeight,
    Math.min(drawerMaxHeight.value, drawerPos.value - delta.y)
  );

  if (isFinal === true) {
    nextTick(() => {
      const aboveHalf = drawerOpenRatio.value > drawerOpenRatioHalf;
      let targetHeight: number;
      if (direction === "up") {
        targetHeight = aboveHalf
          ? drawerMaxHeight.value
          : Math.round(drawerMaxHeight.value / 2);
      } else {
        // Swiping down
        if (drawerOpenRatio.value < 10) {
          // Close drawer if swiped down near the bottom
          dialog.value = false;
          targetHeight = drawerMinHeight;
        } else {
          targetHeight = aboveHalf
            ? Math.round(drawerMaxHeight.value / 2)
            : drawerMinHeight;
        }
      }
      animateDrawerTo(targetHeight);
    });
  }
};

const cycleDrawer = () => {
  // If drawer is fully open or half open, close it
  if (drawerMode.value === "full" || drawerMode.value === "half") {
    dialog.value = false;
    animateDrawerTo(drawerMinHeight);
    return;
  }
  // Otherwise, open to half
  const targetHeight =
    drawerMode.value === "handler"
      ? Math.round(drawerMaxHeight.value / 2)
      : drawerMinHeight;

  animateDrawerTo(targetHeight);
};

const animateDrawerTo = (height: any) => {
  clearTimeout(animateTimeout);

  const diff = height - drawerPos.value;

  if (diff !== 0) {
    drawerPos.value += Math.abs(diff) < 2 ? diff : Math.round(diff / 2);

    animateTimeout = setTimeout(() => {
      animateDrawerTo(height);
    }, 30);
  }
};

onBeforeUnmount(() => {
  clearTimeout(animateTimeout);
  // Clean up body classes
  document.body.classList.remove("badge-drawer-open");
  document.body.classList.remove("badge-drawer-full");
});

watch(
  () => drawerOpenRatio.value,
  (newVal: number) => {
    if (newVal === 0) {
      animateDrawerTo(drawerMinHeight);
      dialog.value = false;
    }
  }
);

// Watch dialog state and update body class for footer hiding
watch(
  () => dialog.value,
  (isOpen) => {
    if (isOpen) {
      document.body.classList.add("badge-drawer-open");
    } else {
      document.body.classList.remove("badge-drawer-open");
      document.body.classList.remove("badge-drawer-full");
    }
  },
  { immediate: true }
);

// Watch openedFully state and update body class for header hiding
watch(
  () => openedFully.value,
  (isFullyOpen) => {
    if (isFullyOpen && dialog.value) {
      document.body.classList.add("badge-drawer-full");
    } else {
      document.body.classList.remove("badge-drawer-full");
    }
  },
  { immediate: true }
);

// Close drawer when clicking outside
const handleDrawerClick = (event: MouseEvent) => {
  const target = event.target as HTMLElement;
  if (target.classList.contains("badgeSwiper")) {
    // Clicked on overlay, close drawer
    dialog.value = false;
    animateDrawerTo(drawerMinHeight);
  }
};

const router = useRouter();
const route = useRoute();
const routesName = route.name?.toString() || "";

const routeCheck = (name: string) => {
  if (process.env.NODE_ENV === "development") {
    console.log(routesName);
  }
  routesName.startsWith("donee")
    ? router.push({ name: `donee-${name}` })
    : router.push({ name: `donor-${name}` });
};

// Load saved badge and user data on mount
onMounted(async () => {
  loadSavedBadge();
  // Fetch user data if not already loaded
  if (!apiStore.user) {
    await apiStore.fetchUser();
  }
  // Update name from API store - try different possible property names
  if (apiStore.user) {
    if (process.env.NODE_ENV === "development") {
      console.log("API Store User on mount:", apiStore.user);
    }
    const userName = (apiStore.user as any).name || (apiStore.user as any).username || (apiStore.user as any).fullName || (apiStore.user as any).nickname;
    if (process.env.NODE_ENV === "development") {
      console.log("Extracted userName on mount:", userName);
    }
    if (userName) {
      profile.value.user.userName = userName;
    } else if (userStore.name) {
      profile.value.user.userName = userStore.name;
    }
  } else if (userStore.name) {
    profile.value.user.userName = userStore.name;
  }
  
  // Also check localStorage for saved name
  const savedName = localStorage.getItem("userName") || localStorage.getItem("user_name");
  if (savedName && !profile.value.user.userName || profile.value.user.userName === "User") {
    profile.value.user.userName = savedName;
  }
});
</script>
<style scoped lang="scss"></style>
<style lang="scss">
.badgeSwiper {
  * {
    z-index: 111 !important;
  }
}
.imgUploaderContainer {
  width: 100%;
}

.myProfile-header {
  height: 10rem;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
  position: relative;
  width: 100%;
  box-shadow: inset 0rem 1rem 3rem -3rem rgba(0, 0, 0, 0.75),
    inset 0px -1rem 4rem -2rem rgba(0, 0, 0, 0.75);
  margin-bottom: 7rem;
  .myProfile-btnDiv {
    display: flex;
    justify-content: end;
    padding: 0.5rem 0.4rem;

    .myProfile-headerBtn {
      margin: 0 0.4rem;
      width: 2.8rem;
      height: 2.8rem;
      border-radius: 2rem;
      background: linear-gradient(
        108.46deg,
        rgba(0, 0, 0, 0.33) 0%,
        rgba(23, 23, 23, 0.33) 100%
      );
      backdrop-filter: blur(1rem);

      img {
        height: 1.3rem;
      }
    }
  }

  .myProfile-userDetail {
    margin-top: 7rem;
    display: flex;
    flex-direction: column;
    justify-content: center;
    height: 6rem;

    .myProfile-preview {
      padding: 0 1rem;
      display: flex;
      flex-direction: row;
      align-items: center;
      justify-content: space-between;
      margin-top: -4.8rem;
      margin-bottom: 1rem;

      .myProfile-profileImgDiv {
        justify-content: center;
        align-items: center;
        display: flex;

        .myProfile-img {
          margin-top: -1rem;
          border-radius: 5rem;
          height: 7rem;
          width: 7rem;
          z-index: 1;
        }

        .myProfile-imgBtn {
          margin-top: 2.5rem;
          margin-left: -2.1rem;
          width: 2.8rem;
          height: 2.8rem;
          z-index: 1;

          border-radius: 2rem;
          background: linear-gradient(
            108.46deg,
            rgba(0, 0, 0, 0.33) 0%,
            rgba(23, 23, 23, 0.33) 100%
          );
          backdrop-filter: blur(1rem);

          img {
            height: 1.3rem;
          }
        }
      }
      .myProfile-nameDiv {
        display: flex;
        align-items: center;
        justify-content: space-evenly;
        background: linear-gradient(
          108.46deg,
          rgba(0, 0, 0, 0.33) 0%,
          rgba(23, 23, 23, 0.33) 100%
        );
        backdrop-filter: blur(1rem);
        padding: 2rem 1.3rem;
        height: 4rem;
        border-radius: 0.8rem;
        z-index: 1;
        gap: 0.5rem;
        h3 {
          color: white;
          font-size: 1.5rem;
          font-family: poppinsSemiBold;
          margin-right: 0;
        }
        .myProfile-selectedBadge {
          height: 1.5rem;
          width: 1.5rem;
          object-fit: contain;
        }
      }
    }

    .myProfile-settingDiv {
      margin-bottom: 1rem;
      display: flex;
      justify-content: space-between;
      padding: 0 0.8rem;

      .userProfile-settingSettingsBtn {
        .settingButtonImage {
          margin-right: 0.3rem;
          image-rendering: auto;
        }

        background-color: rgba(141, 31, 70, 0.272) !important;
        color: rgba(218, 3, 82, 0.704) !important;
        font-family: montseraatSemiBold;
        font-size: 1.2rem !important;
        border-radius: 0.5rem !important;
        width: 18rem;
      }

      .userProfile-settingShareBtn {
        width: 2.8rem;
        height: 2.8rem;
        border-radius: 2rem;
        background: linear-gradient(
          108.46deg,
          rgba(40, 40, 40, 0.654) 0%,
          rgb(23, 23, 23) 100%
        );
        backdrop-filter: blur(1rem);

        img {
          height: 1.8rem;
        }
      }
    }
  }
}
.slide-drawer {
  .badgeSwiper-Titlediv {
    display: flex;
    justify-content: center;
    .badgeSwiper-title {
      color: white;
      font-family: poppins;
      font-weight: 600;
      font-size: 1.2rem;
    }
  }
  .badgeSwiper-descDiv {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 7rem;
    flex-direction: column;
    padding-top: 0.5rem !important;
    padding-bottom: 1rem !important;
    .badgeSwiper-description {
      font-family: poppins;
      font-weight: 400;
    }
    .confirmButton {
      background-color: rgba(182, 0, 67, 1);
      color: white;
      border: none;
      font-size: 1.2rem;
      height: 3.3rem;
      border-radius: 0.5rem;
      width: 22rem;
      margin-top: 0.7rem;
      font-family: montseraatSemiBold;
      margin-bottom: 0.7rem !important;
    }
  }
  &--bottom {
    border-radius: 20px;
    border-bottom-left-radius: 0;
    border-bottom-right-radius: 0;
    background-color: #333;
    background-image: radial-gradient(
      circle,
      rgba(0, 0, 0, 0.1) 0%,
      rgba(0, 0, 0, 0.4) 100%
    );
    top: 100%;

    transition: background-color 0.3s ease-in-out;

    > div:last-child,
    > img:last-child {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }

    &.slide-drawer--open-half {
    }
  }

  &__handler {
    &--horizontal {
      cursor: grab;

      > div {
        width: 50%;
        height: 8px;
        border-radius: 4px;
        background-color: rgba(200, 200, 200, 0.7);
      }
    }
  }
}

.slide-drawer::before {
  content: "\A";
  position: absolute;
  width: 100%;
  height: 100%;
  top: 0;
  left: 0;
  background: rgba(0, 0, 0, 0.5);
  opacity: 1;
  transition: all 0.5s;
  -webkit-transition: all 0.5s;
  -moz-transition: all 0.5s;
}

.myProfile-header::after {
  content: "";
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  height: 4rem;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 0.834)
  );
  pointer-events: none;
}

.myProfile-headerBlur {
  position: absolute;
  top: 0rem;
  backdrop-filter: blur(1px);
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0),
    rgba(0, 0, 0, 0.825)
  );
  height: 10rem;
  width: 100%;
  pointer-events: none;
}
</style>
