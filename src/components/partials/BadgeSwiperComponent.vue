<template>
  <div class="advance-example">
    <swiper
      class="horizontal-swiper"
      :modules="modules"
      :loop="true"
      :slides-per-view="1"
      :slides-per-group="1"
      :space-between="14"
      :pagination="false"
      :watch-slides-progress="true"
      :prevent-clicks="false"
      :prevent-clicks-propagation="false"
      @swiper="handleHSwiperReady"
      @slide-change="handleHSwiperSlideChange"
    >
      <template v-if="!openedFully">
        <swiper-slide
          v-for="(badgesSwiper, arrayIndex) in badges"
          class="slide"
          :key="arrayIndex"
        >
          <div class="badgeDiv">
            <button
              v-for="(button, index) in badgesSwiper"
              :key="index"
              :class="{
                active:
                  JSON.stringify(activeButton) ===
                  JSON.stringify([arrayIndex, index])
              }"
              class="badgeButton"
              @click="activateButton([arrayIndex, index])"
            >
              <div class="badgeIconDiv">
                <img
                  :src="button.image"
                  :alt="button.title"
                  class="badgeIconImg badgeGuard"
                  v-if="button.key === 'guard'"
                />
                <img
                  v-else
                  :src="button.image"
                  :alt="button.title"
                  class="badgeIconImg"
                />
                <span class="badgeIconTitle">{{ button.title }}</span>
              </div>
            </button>
          </div>
        </swiper-slide>
      </template>
      <div class="badges-column row scroll vertical-scroll-container" v-else>
        <template
          v-for="(badgesSwiper, arrayIndex) in badges"
          :key="arrayIndex"
        >
          <button
            v-for="(button, index) in badgesSwiper"
            :key="index"
            :class="{
              active:
                JSON.stringify(activeButton) ===
                JSON.stringify([arrayIndex, index])
            }"
            class="col-4 badge-button-vertical"
            @click="activateButton([arrayIndex, index])"
          >
            <div class="badgeIconDiv scroll">
              <img
                :src="button.image"
                :alt="button.title"
                class="badgeIconImg badgeGuard"
                v-if="button.key === 'guard'"
              />
              <img
                v-else
                :src="button.image"
                :alt="button.title"
                class="badgeIconImg"
              />
              <span class="badgeIconTitle">{{ button.title }}</span>
            </div>
          </button>
        </template>
      </div>
    </swiper>
  </div>
</template>
<script setup>
import { Pagination, Navigation, Grid, Mousewheel, FreeMode } from "swiper/modules";
import { Swiper, SwiperSlide } from "swiper/vue";
import { computed, ref } from "vue";
import { useI18n } from "vue-i18n";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

defineProps({
  openedFully: {
    type: Boolean,
    required: true
  }
});

const { t } = useI18n();

const handleHSwiperReady = () => {
  // no logs
};

const handleHSwiperSlideChange = (swiper) => {
  void swiper;
};

const BADGE_SLIDE_KEYS = [
  ["patron", "guard", "dreamer", "badge", "badge", "badge"],
  ["patron", "guard", "dreamer", "badge", "badge", "badge"],
  ["patron", "guard", "dreamer", "badge", "badge", "badge"],
  ["patron", "guard", "dreamer", "badge", "badge", "badge"],
  ["patron", "guard", "dreamer", "badge", "badge", "badge"]
];

const BADGE_IMAGES = {
  patron: "/icons/patronBadge-icon.svg",
  guard: "/icons/guardBadge-icon.svg",
  dreamer: "/icons/dreamerBadge-icon.svg",
  badge: [
    "/icons/diamondBadge-icon.svg",
    "/icons/emeraldBadge-icon.svg",
    "/icons/crownBadge-icon.svg"
  ]
};

function imageForKey(key, slotIndex) {
  if (key === "badge") {
    return BADGE_IMAGES.badge[slotIndex % BADGE_IMAGES.badge.length];
  }
  return BADGE_IMAGES[key];
}

const badges = computed(() =>
  BADGE_SLIDE_KEYS.map((slide) => {
    let badgeSlot = 0;
    return slide.map((key) => {
      const image = imageForKey(key, badgeSlot);
      if (key === "badge") badgeSlot += 1;
      return {
        key,
        image,
        title: t(`badges.${key}`)
      };
    });
  })
);

const emit = defineEmits(["badge-selected"]);

const activeButton = ref(null);

const activateButton = (array) => {
  activeButton.value = array;
  const [arrayIndex, index] = array;
  const slide = badges.value[arrayIndex];
  if (slide && slide[index]) {
    emit("badge-selected", { image: slide[index].image, title: slide[index].title });
  }
};
const modules = [Grid, Pagination, Navigation, Mousewheel, FreeMode];
</script>

<style scoped lang="scss">
* {
  --swiper-theme-color: #bd0043;
  --swiper-pagination-bullet-inactive-color: rgba(255, 255, 255, 0.741);
  z-index: 111 !important;
}

/* Label pod ikonou: dark drawer = svetlý text; light drawer prepíše --dh-badge-grid-label (druhý style blok). */
.advance-example {
  --dh-badge-grid-label: rgba(255, 255, 255, 0.92);
}

.badgeDiv {
  margin-bottom: 1.5rem !important;
}
.badgeDiv,
.badges-column {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 20px;
  width: 100%;

  .badgeButton {
    height: 3.8rem;
    width: 30%;
    box-sizing: border-box;
    background-color: transparent;
    border: 0.07rem solid transparent;
    border-radius: 1rem;
    transition: border-color 0.4s ease;
    margin-bottom: 0.5rem;
  }
  .badgeIconDiv {
    display: flex;
    justify-content: center;
    align-items: center;
    height: 4rem;
    flex-direction: column;

    .badgeIconImg {
      margin-bottom: 0.4rem;
    }
    .badgeIconTitle {
      font-size: 0.8rem;
      color: var(--dh-badge-grid-label);
    }
  }
}

.active {
  border: 0.07rem solid red !important;
}
.badges-column {
  display: flex;
  flex-wrap: wrap;
  justify-content: center;
  gap: 0.5rem;
  margin-bottom: 20px;
  width: 100%;
  overflow-y: auto;
  .badge-button-vertical {
    background-color: transparent;
    border: 0.07rem solid transparent;
    border-radius: 1rem;
    transition: border-color 0.4s ease;
    margin: 0.5rem 0;

    width: 30%;
    box-sizing: border-box;
  }
}
</style>

<style lang="scss">
/* Vyššia špecificita ako scoped .badgeIconDiv reťazec + konzistentné s .body--light badge sheet */
.body--light .badgeSelector-drawer {
  --dh-badge-grid-label: rgba(0, 0, 0, 0.88);
}

.body--light .badgeSelector-drawer .badgeIconTitle {
  color: rgba(0, 0, 0, 0.88) !important;
}
</style>
