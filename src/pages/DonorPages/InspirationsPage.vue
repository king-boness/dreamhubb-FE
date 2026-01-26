<template>
  <div class="inspiration-Page">
    <StorieShowComponent
      :my-story="myStory"
      :stories="stories"
      @seen="(index) => setSeen(index)"
    />
    <div class="inspiration-Header">
      <h2 class="inspiration-Heading">Inspirations for you</h2>

      <q-btn
        class="addPost-btn"
        no-caps
        @click="[(dialog = true), cycleDrawer()]"
      >
        <img src="/images/Auth/tokenButton.png" alt="" />
        <span> Add post </span>
      </q-btn>
    </div>
    <div style="min-height: 744px" class="inspiration-Body">
      <q-pull-to-refresh @refresh="refresh">
        <InspirationComponent :inspiration="inspiration"></InspirationComponent>
        <InspirationComponent :inspiration="inspiration"></InspirationComponent>
        <InspirationComponent :inspiration="inspiration"></InspirationComponent>
      </q-pull-to-refresh>
    </div>
  </div>
  <div v-if="dialog">
    <q-card
      class="slide-drawer slide-drawer--bottom text-white fixed-bottom column no-wrap"
      :class="`slide-drawer--open-${drawerMode}`"
      :style="drawerStyle"
      v-touch-pan.mouse.vertical.prevent="() => {}"
    >
      <q-card-section
        class="slide-drawer__handler--horizontal row flex-center"
        v-touch-pan.mouse.vertical.prevent="slideDrawer"
      >
        <div class="cursor-pointer"></div>
      </q-card-section>
      <q-card-section class="badgeSwiper-Titlediv">
        <span class="badgeSwiper-title">Add a Inspiration Post</span>
      </q-card-section>
      <q-card-section class="badgeSwiper-uploaderDiv">
        <ImageUploader :max="5"></ImageUploader>
      </q-card-section>
      <q-card-section class="badgeSwiper-messageDiv">
        <q-input
          borderless
          dark
          hide-bottom-space
          bottom-slots
          v-model="insiparionMessage"
          label="Write about your inspiration post..."
          class="registerDatas registerSecrete badgeSwiper-inspirationMessage"
          type="textarea"
        >
        </q-input>
      </q-card-section>
      <q-card-section class="badgeSwiper-descDiv">
        <q-btn class="confirmButton"> Post inspiration</q-btn>
      </q-card-section>
    </q-card>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick } from "vue";
import { Inspiration } from "src/components/models";
import { useQuasar } from "quasar";
import InspirationComponent from "src/components/partials/InspirationComponent.vue";
import StorieShowComponent from "src/components/partials/StorieShowComponent.vue";
import ImageUploader from "../../components/partials/UploadImgComponent.vue";
import MyStoryComponent from "src/components/partials/MyStoryComponent.vue";
const insiparionMessage = ref("");
const onRefresh = (done: any) => {
  done();
};
const refresh = (done: any) => {
  setTimeout(() => {
    done();
  }, 1000);
};
const inspiration = ref({
  user: {
    userName: "Jakub Perdoch",
    userPicture: "/images/Auth/profilePicture.jpeg"
  },
  description:
    "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim.",
  inspirationInfo: {
    dateCreated: "09/15/2023",
    likes: 1594,
    inspirationImage: "/images/Auth/inspirationImg.jpg"
  }
} as Inspiration);
const myStory = ref([
  {
    id: 0,
    label: "Your Story",
    userProfileImage: inspiration.value.user.userPicture,
    seen: false,
    slides: []
  }
]);
const stories = ref([
  {
    id: 0,
    label: "Timi",
    userProfileImage: "https://www.w3schools.com/w3images/avatar3.png",
    seen: false,
    slides: [
      {
        id: 6,
        image:
          "https://images.unsplash.com/photo-1618527435578-7ef042520eff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=627&q=80",
        duration: 400000
      },
      {
        id: 7,
        image:
          "https://images.unsplash.com/photo-1658312226966-29bd4e77c62c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=627&q=80"
      }
    ]
  },
  {
    id: 1,
    label: "Timi",
    userProfileImage: "https://www.w3schools.com/w3images/avatar3.png",
    seen: false,
    slides: [
      {
        id: 6,
        image:
          "https://images.unsplash.com/photo-1618527435578-7ef042520eff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=627&q=80",
        duration: 400000
      },
      {
        id: 7,
        image:
          "https://images.unsplash.com/photo-1658312226966-29bd4e77c62c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=627&q=80"
      }
    ]
  },
  {
    id: 2,
    label: "Timi",
    userProfileImage: "https://www.w3schools.com/w3images/avatar3.png",
    seen: false,
    slides: [
      {
        id: 6,
        image:
          "https://images.unsplash.com/photo-1618527435578-7ef042520eff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=627&q=80",
        duration: 400000
      },
      {
        id: 7,
        image:
          "https://images.unsplash.com/photo-1658312226966-29bd4e77c62c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=627&q=80"
      }
    ]
  },
  {
    id: 3,
    label: "Timi",
    userProfileImage: "https://www.w3schools.com/w3images/avatar3.png",
    seen: false,
    slides: [
      {
        id: 6,
        image:
          "https://images.unsplash.com/photo-1618527435578-7ef042520eff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=627&q=80",
        duration: 400000
      },
      {
        id: 7,
        image:
          "https://images.unsplash.com/photo-1658312226966-29bd4e77c62c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=627&q=80"
      }
    ]
  },
  {
    id: 4,
    label: "Timi",
    userProfileImage: "https://www.w3schools.com/w3images/avatar3.png",
    seen: false,
    slides: [
      {
        id: 6,
        image:
          "https://images.unsplash.com/photo-1618527435578-7ef042520eff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=627&q=80",
        duration: 400000
      },
      {
        id: 7,
        image:
          "https://images.unsplash.com/photo-1658312226966-29bd4e77c62c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=627&q=80"
      }
    ]
  },
  {
    id: 5,
    label: "Filip",
    userProfileImage: "https://www.w3schools.com/w3images/avatar3.png",
    seen: false,
    slides: [
      {
        id: 6,
        image:
          "https://images.unsplash.com/photo-1618527435578-7ef042520eff?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=627&q=80",
        duration: 400000
      },
      {
        id: 7,
        image:
          "https://images.unsplash.com/photo-1658312226966-29bd4e77c62c?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=627&q=80"
      }
    ]
  }
]);

const setSeen = (index: number) => {
  index
    ? (stories.value[index - 1].seen = true)
    : (stories.value[stories.value.length - 1].seen = true);
};
const $q = useQuasar();

const drawerMinHeight = 100;
const drawerTopOffset = $q.screen.height - 630;
const drawerOpenRatioHalf = 50;
let animateTimeout: any;
const dialog = ref(false);

const drawerPos = ref(drawerMinHeight);

const drawerMaxHeight = computed(() => {
  return Math.max(0, $q.screen.height - drawerTopOffset);
});

const drawerOpenRatio = computed(() => {
  return Math.round(
    (Math.max(0, drawerPos.value - drawerMinHeight) /
      Math.max(1, drawerMaxHeight.value - drawerMinHeight)) *
      100
  );
});

const drawerStyle = computed(() => {
  return {
    height: `${drawerMaxHeight.value}px`,
    transform: `translateY(${-drawerPos.value}px)`
  };
});

const drawerMode = computed(() => {
  if (drawerOpenRatio.value > drawerOpenRatioHalf) {
    return "full";
  }
  return drawerOpenRatio.value > 0 ? "half" : "handler";
});

const slideDrawer = (ev: any) => {
  const { direction, delta, isFinal } = ev;
  drawerPos.value = Math.max(
    drawerMinHeight,
    Math.min(drawerMaxHeight.value, drawerPos.value - delta.y)
  );

  if (isFinal === true) {
    nextTick(() => {
      const aboveHalf = drawerOpenRatio.value > drawerOpenRatioHalf;
      const targetHeight =
        direction === "up"
          ? aboveHalf
            ? drawerMaxHeight.value
            : Math.round(drawerMaxHeight.value / 2)
          : null;

      animateDrawerTo(targetHeight);
    });
  }
};

const cycleDrawer = () => {
  const targetHeight = Math.round(drawerMaxHeight.value);
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

watch(
  () => drawerOpenRatio.value,
  (newVal) => {
    if (newVal === 0) {
      animateDrawerTo(drawerMinHeight);
      dialog.value = false;
      // no logs
    }
  }
);
</script>
<style lang="scss">
.q-field__label {
  color: rgba(255, 255, 255, 0.366) !important;
}
// .q-field--highlighted {
//   .q-field__label {
//     color: transparent !important;
//   }
// }
</style>
<style scoped lang="scss">
.badgeSwiper-uploaderDiv {
  padding: 0.5rem;
  display: flex;
  justify-content: center;
  align-items: center;
}
.inspiration-Page {
  .inspiration-Body {
    background-image: url("/images/Auth/bg-explain.png") !important;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
  }
}

.inspiration-Header {
  display: flex;
  align-items: center;
  padding: 1rem 0.8rem;
  flex-direction: row;
  justify-content: space-between;

  .inspiration-Heading {
    color: white;
    margin: 0;
    font-family: poppinsSemiBold;
    font-size: 1.1rem;
    margin-right: 2rem;
  }

  .addPost-btn {
    background-color: rgba(221, 31, 97, 0.176) !important;
    color: rgb(218, 3, 82) !important;
    font-family: montseraat;
    font-size: 0.9rem !important;
    width: 7.1rem !important;
    height: 2rem;
    border-radius: 1.5rem;
    display: flex;
    align-items: center;
    justify-content: center;
    img {
      margin-right: 0.3rem;
      margin-left: -0.3rem;
    }
    span {
      padding-bottom: 0.07rem;
    }
  }
}

.slide-drawer {
  height: 40rem !important;
  border-radius: 20px !important;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
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
  .badgeSwiper-uploaderDiv {
    .container {
      padding: 1rem 0;
      height: 14rem;
      display: flex;
      flex-wrap: wrap;
    }
  }
  .badgeSwiper-messageDiv {
    padding-top: 0;
    padding-bottom: 0;
    padding: 0.5rem;
    .badgeSwiper-inspirationMessage {
      height: 9rem;
      width: 100%;
      margin-bottom: 0;
      margin-top: 0;
    }
  }
  .badgeSwiper-descDiv {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    padding-top: 0;
    padding-bottom: 0;
    padding: 0.5rem;
    padding-top: 0;
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
      margin-top: 0.5rem;
      font-family: montseraatSemiBold;
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
    bottom: unset;
    top: 100%;
    transition: background-color 0.3s ease-in-out;
    z-index: 111;

    > div:last-child,
    > img:last-child {
      border-bottom-left-radius: 0;
      border-bottom-right-radius: 0;
    }

    &.slide-drawer--open-half {
      opacity: 0.9;
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
  border-radius: 20px;
  border-bottom-left-radius: 0;
  border-bottom-right-radius: 0;
}
</style>
