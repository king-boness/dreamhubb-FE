<template>
  <div class="advance-example">
    <swiper
      class="horizontal-swiper"
      :modules="modules"
      :loop="true"
      :slides-per-view="1"
      :slides-per-group="1"
      :space-between="14"
      :pagination="{ clickable: true }"
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
                  v-if="button.title == 'Guard'"
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
                v-if="button.title == 'Guard'"
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
import { ref } from "vue";

import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

defineProps({
  openedFully: {
    type: Boolean,
    required: true
  }
});

const handleHSwiperReady = () => {
  // no logs
};

const handleHSwiperSlideChange = (swiper) => {
  void swiper;
};

const badges = [
  [
    { image: "/icons/patronBadge-icon.svg", title: "Patron" },
    { image: "/icons/guardBadge-icon.svg", title: "Guard" },
    { image: "/icons/dreamerBadge-icon.svg", title: "Dreamer" },
    { image: "/icons/diamondBadge-icon.svg", title: "Badge" },
    { image: "/icons/emeraldBadge-icon.svg", title: "Badge" },
    { image: "/icons/crownBadge-icon.svg", title: "Badge" }
  ],
  [
    { image: "/icons/patronBadge-icon.svg", title: "Patron" },
    { image: "/icons/guardBadge-icon.svg", title: "Guard" },
    { image: "/icons/dreamerBadge-icon.svg", title: "Dreamer" },
    { image: "/icons/diamondBadge-icon.svg", title: "Badge" },
    { image: "/icons/emeraldBadge-icon.svg", title: "Badge" },
    { image: "/icons/crownBadge-icon.svg", title: "Badge" }
  ],
  [
    { image: "/icons/patronBadge-icon.svg", title: "Patron" },
    { image: "/icons/guardBadge-icon.svg", title: "Guard" },
    { image: "/icons/dreamerBadge-icon.svg", title: "Dreamer" },
    { image: "/icons/diamondBadge-icon.svg", title: "Badge" },
    { image: "/icons/emeraldBadge-icon.svg", title: "Badge" },
    { image: "/icons/crownBadge-icon.svg", title: "Badge" }
  ],
  [
    { image: "/icons/patronBadge-icon.svg", title: "Patron" },
    { image: "/icons/guardBadge-icon.svg", title: "Guard" },
    { image: "/icons/dreamerBadge-icon.svg", title: "Dreamer" },
    { image: "/icons/diamondBadge-icon.svg", title: "Badge" },
    { image: "/icons/emeraldBadge-icon.svg", title: "Badge" },
    { image: "/icons/crownBadge-icon.svg", title: "Badge" }
  ],
  [
    { image: "/icons/patronBadge-icon.svg", title: "Patron" },
    { image: "/icons/guardBadge-icon.svg", title: "Guard" },
    { image: "/icons/dreamerBadge-icon.svg", title: "Dreamer" },
    { image: "/icons/diamondBadge-icon.svg", title: "Badge" },
    { image: "/icons/emeraldBadge-icon.svg", title: "Badge" },
    { image: "/icons/crownBadge-icon.svg", title: "Badge" }
  ]
];

const emit = defineEmits(["badge-selected"]);

const activeButton = ref(null);

const activateButton = (array) => {
  activeButton.value = array;
  // Find the selected badge and emit it
  const [arrayIndex, index] = array;
  if (badges[arrayIndex] && badges[arrayIndex][index]) {
    emit("badge-selected", badges[arrayIndex][index]);
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
      color: white;
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
