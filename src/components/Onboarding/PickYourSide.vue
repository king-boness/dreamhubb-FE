<template>
  <div class="pickYourSide">
    <div class="pick-header">
      <button class="pick-backBtn" type="button" @click="handleBack">
        <q-icon name="chevron_left" />
      </button>
      <div class="pick-progress">
        <span class="pick-progress_fill" style="width: 20%"></span>
      </div>
    </div>

    <div class="pick-content">
      <h1 class="pick-title">choose your side</h1>

      <div ref="carouselZoneRef" class="pick-carousel-zone">
        <div class="pick-carousel-wrapper">
          <div class="pick-carousel-stage">
            <div class="pick-swiper-shell">
              <Swiper
                class="pick-swiper"
                direction="vertical"
                :loop="false"
                :rewind="true"
                :watch-overflow="true"
                :centered-slides="true"
                slides-per-view="auto"
                :space-between="0"
                :speed="320"
                :threshold="5"
                :free-mode="false"
                :mousewheel="{ forceToAxis: true, releaseOnEdges: false, sensitivity: 0.85 }"
                :modules="swiperModules"
                @swiper="onSwiperReady"
                @slideChange="handleSwiperChanged"
              >
                <SwiperSlide
                  v-for="option in options"
                  :key="option.id"
                  class="pick-option"
                >
                  <div class="pick-content-wrapper">
                    <div class="pick-icon" :class="`pick-icon--${option.value}`">
                      <img
                        :src="`/icons/CategoryIcons/${option.value === 'donee' ? 'donees' : 'donors'}.svg`"
                        :alt="option.value"
                        class="pick-icon-img"
                      />
                    </div>
                  </div>
                </SwiperSlide>
              </Swiper>
            </div>
          </div>
        </div>
        <div ref="helpAnchorRef" class="pick-helpBtn-anchor" :style="pickHelpAnchorStyle">
          <button type="button" class="pick-helpBtn" @click="handleInfoClick">
            <q-icon name="help_outline" />
          </button>
        </div>
      </div>

    </div>

    <div class="pick-bottom">
      <p class="pick-instruction">choose by swiping up or down</p>
      <div class="pick-nextBtn-slot" aria-hidden="true" />
    </div>
    <div class="pick-nextBtn-anchor">
      <button
        type="button"
        class="pick-nextBtn pick-nextBtn-single"
        @click="handleNext"
        :disabled="!localValue"
      >
        NEXT STEP
      </button>
    </div>

    <InfoModal
      v-model="showInfoModal"
      :title="infoModalTitle"
      :stylized-text="infoModalText"
      :description="infoModalDescription"
      :cta-label="infoModalCta"
      :icon="infoModalIcon"
      @cta="handleInfoCta"
    />
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Mousewheel } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import InfoModal from "./InfoModal.vue";
import { sideInfo } from "src/config/onboardingInfo";

const router = useRouter();

const props = defineProps<{
  modelValue: "donor" | "donee" | null;
}>();

const emit = defineEmits<{
  "update:modelValue": [value: "donor" | "donee"];
  next: [];
  back: [];
}>();

const localValue = ref<"donor" | "donee">(props.modelValue || "donor");
const showInfoModal = ref(false);
const swiperRef = ref<SwiperClass | null>(null);
const swiperModules = [Mousewheel];

const options = [
  { id: 1, title: "Donee", value: "donee" as const },
  { id: 2, title: "Donor", value: "donor" as const }
];

const defaultIndex = computed(() => (localValue.value === "donee" ? 0 : 1));

const onSwiperReady = (swiper: SwiperClass) => {
  swiperRef.value = swiper;
  const idx = defaultIndex.value;
  if (swiper.activeIndex !== idx) {
    swiper.slideTo(idx, 0);
  }
  schedulePickHelpAnchorSync();
};

const handleSwiperChanged = (swiper: SwiperClass) => {
  const selectedOption = options[swiper.activeIndex] ?? options[1];
  localValue.value = selectedOption.value;
  emit("update:modelValue", localValue.value);
};

watch(
  () => props.modelValue,
  (value) => {
    if (!value) return;
    localValue.value = value;
    const idx = value === "donee" ? 0 : 1;
    nextTick(() => {
      swiperRef.value?.slideTo(idx, 0);
    });
  }
);

const currentInfo = computed(() => {
  const key = localValue.value === "donor" ? "donor" : "donee";
  return sideInfo[key];
});

const infoModalTitle = computed(() => currentInfo.value?.title || "");
const infoModalText = computed(() => currentInfo.value?.highlight || "");
const infoModalDescription = computed(() => currentInfo.value?.description || "");
const infoModalCta = computed(() => currentInfo.value?.ctaLabel || "");
const infoModalIcon = computed(() => currentInfo.value?.icon || "");

const handleInfoClick = () => {
  showInfoModal.value = true;
};

const handleInfoCta = () => {
  handleNext();
};

const handleBack = () => {
  router.push({ name: "auth-welcome-page" });
};

const handleNext = () => {
  emit("update:modelValue", localValue.value);
  emit("next");
};

/** Button center px above zone vertical center (lower = further down). */
const PICK_HELP_LIFT_PX = 23;
/** Fine tune: positive = down, negative = up (applied after lift). */
const PICK_HELP_OFFSET_Y_PX = 2;
const PICK_HELP_BTN_HALF_PX = 20;

const carouselZoneRef = ref<HTMLElement | null>(null);
const helpAnchorRef = ref<HTMLElement | null>(null);
const pickHelpAnchorStyle = ref<Record<string, string>>({});

let pickHelpZoneObserver: ResizeObserver | null = null;

const syncPickHelpAnchorPosition = () => {
  const zone = carouselZoneRef.value;
  const anchor = helpAnchorRef.value;
  if (!zone || !anchor) return;

  const topPx =
    zone.clientHeight / 2 -
    PICK_HELP_LIFT_PX -
    PICK_HELP_BTN_HALF_PX +
    PICK_HELP_OFFSET_Y_PX;
  const topValue = `${topPx}px`;

  anchor.style.top = topValue;
  pickHelpAnchorStyle.value = { top: topValue };
};

const schedulePickHelpAnchorSync = () => {
  nextTick(() => {
    requestAnimationFrame(() => {
      syncPickHelpAnchorPosition();
    });
  });
};

onMounted(() => {
  schedulePickHelpAnchorSync();
  window.setTimeout(schedulePickHelpAnchorSync, 100);

  const zone = carouselZoneRef.value;
  if (!zone) return;
  pickHelpZoneObserver = new ResizeObserver(schedulePickHelpAnchorSync);
  pickHelpZoneObserver.observe(zone);
});

onBeforeUnmount(() => {
  pickHelpZoneObserver?.disconnect();
  pickHelpZoneObserver = null;
});
</script>

<style lang="scss" scoped>
.pickYourSide {
  --pick-wheel-shell-height: 400px;
  --pick-wheel-shell-min-height: 320px;
  --pick-wheel-shell-max-height: 48vh;
  --pick-wheel-slide-size: 152px;
  --pick-wheel-wrapper-pad-y: 0.5rem;
  --pick-wheel-track-pad-y: 20px;
  --pick-bottom-top-gap: 10px;
  --pick-instruction-bottom-gap: 14px;
  /* Goal baseline −17px; wrapper +5px up (−22). Asymmetric pad shifts roller down without touching ? */
  --pick-wrapper-offset-y: -22px;
  --pick-roller-offset-y: -19px;
  --pick-roller-nudge-down: 2px;
  /* +3px worked; −1px down → +2px (no transform — iOS fixed + transform ignores sub-pixel shifts). */
  --pick-next-btn-bottom-boost: 2px;
  --pick-bottom-reserve: calc(
    var(--pick-bottom-top-gap) + var(--pick-instruction-bottom-gap) + 0.875rem +
      56px + max(33px, env(safe-area-inset-bottom, 0px))
  );

  width: 100%;
  max-width: 390px;
  min-height: 100dvh;
  height: 100dvh;
  max-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: 24px 20px 0;
  padding-bottom: var(--pick-bottom-reserve);
  margin: 0 auto;
  background: transparent;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
  box-sizing: border-box;
}

.pick-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  flex-shrink: 0;
  position: relative;
  padding-top: 41px;
}

.pick-backBtn {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  flex-shrink: 0;

  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
  }

  .q-icon {
    font-size: 24px;
    color: #ffffff;
  }
}

.pick-progress {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 200px;
  max-width: calc(100% - 120px);
  height: 3px;
  background-color: rgba(255, 255, 255, 0.1);
  border-radius: 2px;
  overflow: hidden;
  margin-top: 18px;
}

.pick-progress_fill {
  display: block;
  height: 100%;
  background: #BD0043;
  transition: width 0.3s ease;
}

.pick-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
  min-height: 0;
  overflow: visible !important;
  position: relative;
}

.pick-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  text-align: center;
  flex-shrink: 0;
  line-height: 1.2;
}

.pick-carousel-zone {
  position: relative;
  width: 100%;
  flex: 1 1 auto;
  min-height: 0;
  overflow: visible !important;
}

.pick-carousel-wrapper {
  position: relative;
  width: 100%;
  height: 100%;
  margin: 0;
  padding: var(--pick-wheel-wrapper-pad-y) 0;
  box-sizing: border-box;
  overflow: visible !important;
  transform: translate3d(0, var(--pick-wrapper-offset-y), 0);
}

.pick-carousel-stage {
  position: absolute;
  left: 0;
  right: 0;
  top: 50%;
  z-index: 1;
  width: 100%;
  max-width: 280px;
  margin: 0 auto;
  min-height: 0;
  overflow: visible !important;
  transform: translate3d(
    0,
    calc(-50% + var(--pick-roller-offset-y) + var(--pick-roller-nudge-down)),
    0
  ) !important;
}

.pick-swiper-shell {
  position: relative;
  z-index: 1;
  max-width: 280px;
  margin: 0 auto;
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 10%,
    black 90%,
    transparent 100%
  );
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    black 10%,
    black 90%,
    transparent 100%
  );
  mask-size: 100% 100%;
  -webkit-mask-size: 100% 100%;
  mask-repeat: no-repeat;
  -webkit-mask-repeat: no-repeat;
}

.pick-swiper {
  width: 100%;
  max-width: 280px;
  height: var(--pick-wheel-shell-height);
  min-height: var(--pick-wheel-shell-min-height);
  max-height: var(--pick-wheel-shell-max-height);
  overflow: visible !important;
  flex-shrink: 0;
}

:deep(.swiper.swiper-vertical) {
  width: 100%;
  height: 100%;
  overflow: visible !important;
  pointer-events: auto;
  z-index: 1;
}

:deep(.swiper-wrapper) {
  flex-direction: column !important;
  box-sizing: border-box;
  padding-top: var(--pick-wheel-track-pad-y);
  padding-bottom: var(--pick-wheel-track-pad-y);
  overflow: visible !important;
}

:deep(.swiper-slide) {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--pick-wheel-slide-size) !important;
  min-height: var(--pick-wheel-slide-size);
  max-height: var(--pick-wheel-slide-size);
  box-sizing: border-box;
  transition: transform 0.25s ease;
  overflow: visible !important;
}

.pick-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  min-height: var(--pick-wheel-slide-size);
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  pointer-events: auto;
  overflow: visible !important;
}

:deep(.swiper-slide-active) {
  z-index: 2;
}

:deep(.swiper-slide-active .pick-content-wrapper::before) {
  content: "";
  position: absolute;
  left: 50%;
  top: 50%;
  width: 124px;
  height: 124px;
  transform: translate(-50%, -50%);
  border-radius: 50%;
  z-index: 0;
  pointer-events: none;
  background: radial-gradient(
    circle,
    rgba(189, 0, 67, 0.35) 0%,
    rgba(189, 0, 67, 0.12) 45%,
    transparent 72%
  );
  box-shadow:
    0 0 22px 10px rgba(189, 0, 67, 0.28),
    0 0 42px 18px rgba(189, 0, 67, 0.12);
}

:deep(.swiper-slide:not(.swiper-slide-active) .pick-icon) {
  opacity: 0.42;
  transform: scale(0.94);
}

:deep(.swiper-slide-prev .pick-icon),
:deep(.swiper-slide-next .pick-icon) {
  opacity: 0.58;
  transform: scale(0.98);
}

.pick-content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: visible !important;
}

.pick-icon {
  width: 108px;
  height: 108px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  opacity: 1;
  pointer-events: none;
  transition: opacity 0.3s ease, transform 0.3s ease;
}

:deep(.swiper-slide-active .pick-icon) {
  opacity: 1;
  transform: scale(1.12);
  filter: brightness(1.08);
}

.pick-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 16px rgba(189, 0, 67, 0.45));
}

:deep(.swiper-slide-active .pick-icon-img) {
  filter: brightness(1.1) drop-shadow(0 0 18px rgba(189, 0, 67, 0.65))
    drop-shadow(0 0 34px rgba(189, 0, 67, 0.35));
}

.pick-helpBtn-anchor {
  position: absolute;
  right: 1.25rem;
  width: 40px;
  height: 40px;
  z-index: 50;
  pointer-events: none;
  /* top in px via syncPickHelpAnchorPosition — avoids iOS %/calc/margin quirks */
}

.pick-helpBtn {
  position: relative;
  top: 0;
  right: 0;
  width: 100%;
  height: 100%;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  pointer-events: auto;

  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
    background: rgba(255, 255, 255, 0.05);
  }

  .q-icon {
    font-size: 20px;
    color: #ffffff;
    pointer-events: none;
  }
}

.pick-bottom {
  position: fixed;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 390px;
  padding-left: 20px;
  padding-right: 20px;
  box-sizing: border-box;
  bottom: max(33px, env(safe-area-inset-bottom, 0px));
  padding-top: var(--pick-bottom-top-gap);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  z-index: 20;
}

.pick-instruction {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 var(--pick-instruction-bottom-gap) 0;
  text-align: center;
  flex-shrink: 0;
}

.pick-nextBtn-slot {
  height: 56px;
  flex-shrink: 0;
  pointer-events: none;
}

.pick-nextBtn-anchor {
  position: fixed;
  left: 0;
  right: 0;
  width: calc(100% - 40px);
  max-width: 350px;
  margin-left: auto;
  margin-right: auto;
  box-sizing: border-box;
  z-index: 21;
  bottom: calc(max(33px, env(safe-area-inset-bottom, 0px)) + var(--pick-next-btn-bottom-boost, 2px));
  transform: none;
}

.pick-nextBtn {
  width: 100%;
  height: 56px;
  border-radius: 9999px;
  background: #BD0043;
  border: none;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 8px 24px rgba(189, 0, 67, 0.3);
  flex-shrink: 0;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &.pick-nextBtn-single {
    width: 100%;

    &:not(:disabled):hover {
      transform: translateY(-2px);
      box-shadow: 0 12px 32px rgba(189, 0, 67, 0.4);
    }
  }
}
</style>
