<template>
  <div class="whatKindOfDream" :class="{ 'whatKindOfDream--filter-mode': hideHeader && hideFooter }">
    <!-- Back button + Title (hidden if hideHeader is true) -->
    <template v-if="!hideHeader">
      <div class="dream-header">
        <button class="dream-backBtn" @click="emit('back')">
          <q-icon name="chevron_left" />
        </button>
        <div class="dream-progress">
          <span class="dream-progress_fill" :style="{ width: progressWidth }"></span>
        </div>
      </div>
      <div class="dream-content">
        <h1 class="dream-title">{{ title }}</h1>

        <div class="dream-carousel-wrapper" :style="dreamCarouselWrapperStyle">
          <div class="dream-carousel-stage" :style="dreamCarouselStageStyle">
            <div class="dream-swiper-shell">
              <Swiper
                class="dream-swiper"
                direction="vertical"
                :loop="true"
                :loop-additional-slides="2"
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
                  v-for="category in categories"
                  :key="category.id"
                  class="dream-option"
                >
                  <div class="dream-content-wrapper">
                    <div class="dream-icon">
                      <img
                        :src="`/icons/CategoryIcons/${category.iconFile}.svg`"
                        :alt="category.label"
                        class="dream-icon-img"
                      />
                    </div>
                  </div>
                </SwiperSlide>
              </Swiper>
            </div>
          </div>
          <button type="button" class="dream-helpBtn" @click="handleInfoClick">
            <q-icon name="help_outline" />
          </button>
        </div>

        <p v-if="hideFooter" class="dream-instruction dream-instruction--inline">
          choose by swiping up or down
        </p>
      </div>
    </template>
    <template v-else>
      <div class="dream-content">
        <div class="dream-carousel-wrapper" :style="dreamCarouselWrapperStyle">
          <div class="dream-carousel-stage" :style="dreamCarouselStageStyle">
            <div class="dream-swiper-shell">
              <Swiper
                class="dream-swiper"
                direction="vertical"
                :loop="true"
                :loop-additional-slides="2"
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
                  v-for="category in categories"
                  :key="category.id"
                  class="dream-option"
                >
                  <div class="dream-content-wrapper">
                    <div class="dream-icon">
                      <img
                        :src="`/icons/CategoryIcons/${category.iconFile}.svg`"
                        :alt="category.label"
                        class="dream-icon-img"
                      />
                    </div>
                  </div>
                </SwiperSlide>
              </Swiper>
            </div>
          </div>
          <button type="button" class="dream-helpBtn" @click="handleInfoClick">
            <q-icon name="help_outline" />
          </button>
        </div>
      </div>
    </template>

    <div v-if="!hideFooter" class="dream-bottom">
      <p class="dream-instruction">choose by swiping up or down</p>
      <div class="dream-actions" v-if="showSearchButton">
        <button class="dream-searchBtn" @click="handleSearch">SEARCH</button>
        <button class="dream-nextBtn" @click="handleNext">{{ nextButtonLabel }}</button>
      </div>
      <button v-else class="dream-nextBtn dream-nextBtn-single" @click="handleNext">{{ nextButtonLabel }}</button>
    </div>

    <!-- Info Modal -->
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
import { ref, computed, watch, nextTick } from "vue";
import { Swiper, SwiperSlide } from "swiper/vue";
import { Mousewheel } from "swiper/modules";
import type { Swiper as SwiperClass } from "swiper";
import "swiper/css";
import InfoModal from "./InfoModal.vue";
import { categoryInfo } from "src/config/onboardingInfo";

interface Category {
  id: string;
  label: string;
  icon: string; // Quasar icon name for InfoModal
  iconFile: string; // SVG file name
}

const props = defineProps<{
  modelValue: string | null;
  progress?: number; // Progress percentage (0-100), defaults to 60 for onboarding
  title?: string; // Custom title, defaults to "from category"
  nextButtonLabel?: string; // Custom next button label, defaults to "NEXT STEP"
  showSearchButton?: boolean; // Show search button, defaults to false
  hideHeader?: boolean; // Hide header (back button + title), defaults to false
  hideFooter?: boolean; // Hide footer (CTA buttons), defaults to false
  centerOffsetY?: number; // Vertical shift of the whole roller block (px)
  rollerAxisOffsetY?: number; // Vertical shift of wheel axis only (px), keeps ? fixed
}>();

const POST_CREATION_CENTER_OFFSET_Y = -17;
const POST_CREATION_ROLLER_AXIS_OFFSET_Y = -19;

const emit = defineEmits<{
  "update:modelValue": [value: string];
  next: [];
  back: [];
  search: [];
}>();

const categories: Category[] = [
  { id: "traveling", label: "traveling", icon: "public", iconFile: "traveling" },
  { id: "health", label: "health", icon: "local_hospital", iconFile: "health" },
  { id: "possessions", label: "possessions", icon: "home", iconFile: "possesions" },
  { id: "relationships", label: "relationships", icon: "favorite", iconFile: "relationships" },
  { id: "learning", label: "learning", icon: "school", iconFile: "learning" },
  { id: "events", label: "events", icon: "event", iconFile: "events" },
  { id: "profession", label: "profession", icon: "work", iconFile: "proffesion" },
  { id: "other", label: "other", icon: "more_horiz", iconFile: "other" }
];

// Initialize localValue with modelValue, but don't default to first category if modelValue is null
// This allows the parent to control the initial value
const localValue = ref<string>(props.modelValue ?? categories[0].id);
const showInfoModal = ref(false);
const swiperRef = ref<SwiperClass | null>(null);
const swiperModules = [Mousewheel];

const progressWidth = computed(() => {
  return `${props.progress ?? 60}%`;
});

const title = computed(() => props.title ?? "from category");
const nextButtonLabel = computed(() => props.nextButtonLabel ?? "NEXT STEP");
const dreamCarouselWrapperStyle = computed(() => ({
  transform: `translateY(${props.centerOffsetY ?? POST_CREATION_CENTER_OFFSET_Y}px)`
}));
const dreamCarouselStageStyle = computed(() => ({
  transform: `translateY(${props.rollerAxisOffsetY ?? POST_CREATION_ROLLER_AXIS_OFFSET_Y}px)`
}));

const handleSearch = () => {
  emit("search");
};

const currentInfo = computed(() => {
  // Map category id to config key (some might differ)
  const configKey = localValue.value === "possessions" ? "possessions" : localValue.value;
  return categoryInfo[configKey] || categoryInfo.traveling;
});

const infoModalTitle = computed(() => currentInfo.value?.title || "");
const infoModalText = computed(() => currentInfo.value?.highlight || "");
const infoModalDescription = computed(() => currentInfo.value?.description || "");
const infoModalCta = computed(() => currentInfo.value?.ctaLabel || "");
const infoModalIcon = computed(() => currentInfo.value?.icon || "");

const handleSwiperChanged = (swiper: SwiperClass) => {
  const selectedCategory = categories[swiper.realIndex] ?? categories[0];
  localValue.value = selectedCategory.id;
  emit("update:modelValue", localValue.value);
};

const onSwiperReady = async (swiper: SwiperClass) => {
  swiperRef.value = swiper;
  await nextTick();
  const idx = categories.findIndex(cat => cat.id === localValue.value);
  if (idx >= 0) swiper.slideToLoop(idx, 0, false);
};

watch(
  () => props.modelValue,
  async (newVal) => {
    const normalized = newVal ?? categories[0].id;
    if (normalized !== localValue.value) {
      localValue.value = normalized;
    }
    if (!swiperRef.value) return;
    await nextTick();
    const idx = categories.findIndex(cat => cat.id === normalized);
    if (idx >= 0 && swiperRef.value.realIndex !== idx) {
      swiperRef.value.slideToLoop(idx, 0, false);
    }
  },
  { immediate: true }
);

const handleInfoClick = () => {
  showInfoModal.value = true;
};

const handleInfoCta = () => {
  // User confirmed their choice, proceed to next step
  handleNext();
};

const handleNext = () => {
  // Ensure we emit the current value before proceeding
  // Always emit update:modelValue first
  emit("update:modelValue", localValue.value);

  // Then emit next event
  emit("next");
};
</script>

<style lang="scss" scoped>
.whatKindOfDream {
  --goal-wheel-shell-height: 400px;
  --goal-wheel-shell-min-height: 320px;
  --goal-wheel-shell-max-height: 48vh;
  --goal-wheel-slide-size: 152px;
  --goal-wheel-wrapper-pad-y: 0.5rem;
  --goal-wheel-track-pad-y: 20px;
  --goal-inline-instruction-gap: 0.9rem;
  --goal-bottom-top-gap: 10px;
  --goal-instruction-bottom-gap: 14px;

  width: 100%;
  max-width: 390px;
  min-height: 100dvh;
  height: 100dvh;
  max-height: 100dvh;
  display: flex;
  flex-direction: column;
  padding: 24px 20px 40px;
  padding-bottom: max(33px, env(safe-area-inset-bottom, 0px));
  margin: 0 auto;
  background: transparent;
  overflow-x: hidden;
  overflow-y: auto;
  position: relative;
  box-sizing: border-box;

  // When used in filters (hide-header and hide-footer), remove padding and background
  &.whatKindOfDream--filter-mode {
    padding: 0;
    margin: 0;
    background: transparent;
    max-width: 100%;
    width: 100%;
    flex: 0 1 auto;
    min-height: 0;
  }
}

.dream-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  flex-shrink: 0;
  position: relative;
  padding-top: 41px;
}

.dream-backBtn {
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

.dream-progress {
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

.dream-progress_fill {
  display: block;
  height: 100%;
  background: #BD0043;
  transition: width 0.3s ease;
}

.dream-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
  min-height: 0;
  overflow: visible !important;
  position: relative;

  .whatKindOfDream--filter-mode & {
    flex: 0 0 auto;
    width: 100%;
    justify-content: flex-start;
  }
}

.dream-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 8px 0;
  text-align: center;
  flex-shrink: 0;
  line-height: 1.2;
}

.dream-carousel-wrapper {
  position: relative;
  width: 100%;
  flex: 1 1 auto;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0;
  transform: translateY(var(--goal-center-offset-y, 0px));
  padding: var(--goal-wheel-wrapper-pad-y) 0;
  box-sizing: border-box;
  overflow: visible !important;

  .whatKindOfDream--filter-mode & {
    flex: 0 0 auto;
    align-items: center;
    min-height: 0;
    margin: 0;
    padding: var(--goal-wheel-wrapper-pad-y) 0;
  }
}

.dream-carousel-stage {
  position: relative;
  z-index: 1;
  width: 100%;
  max-width: 280px;
  flex-shrink: 0;
  min-height: 0;
  overflow: visible !important;
}

.dream-swiper-shell {
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

.dream-swiper {
  width: 100%;
  max-width: 280px;
  height: var(--goal-wheel-shell-height);
  min-height: var(--goal-wheel-shell-min-height);
  max-height: var(--goal-wheel-shell-max-height);
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
  padding-top: var(--goal-wheel-track-pad-y);
  padding-bottom: var(--goal-wheel-track-pad-y);
  overflow: visible !important;
}

/* Numeric slidesPerView would force each slide to (containerH/3); auto uses this row height */
:deep(.swiper-slide) {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  height: var(--goal-wheel-slide-size) !important;
  min-height: var(--goal-wheel-slide-size);
  max-height: var(--goal-wheel-slide-size);
  box-sizing: border-box;
  transition: transform 0.25s ease;
  overflow: visible !important;
}

.dream-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 100%;
  min-height: var(--goal-wheel-slide-size);
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  pointer-events: auto;
  overflow: visible !important;
}

:deep(.swiper-slide-active) {
  z-index: 2;
}

:deep(.swiper-slide-active .dream-content-wrapper::before) {
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

:deep(.swiper-slide:not(.swiper-slide-active) .dream-icon) {
  opacity: 0.42;
  transform: scale(0.94);
}

:deep(.swiper-slide-prev .dream-icon),
:deep(.swiper-slide-next .dream-icon) {
  opacity: 0.58;
  transform: scale(0.98);
}

.dream-content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  position: relative;
  width: 100%;
  height: 100%;
  overflow: visible !important;
}

.dream-icon {
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

:deep(.swiper-slide-active .dream-icon) {
  opacity: 1;
  transform: scale(1.12);
  z-index: 1;
  filter: brightness(1.08);
}

.dream-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 16px rgba(189, 0, 67, 0.45));
}

:deep(.swiper-slide-active .dream-icon-img) {
  filter: brightness(1.1) drop-shadow(0 0 18px rgba(189, 0, 67, 0.65))
    drop-shadow(0 0 34px rgba(189, 0, 67, 0.35));
}

.dream-helpBtn {
  position: absolute;
  right: 1.25rem;
  top: 50%;
  transform: translateY(-50%);

  .whatKindOfDream--filter-mode & {
    top: 50%;
    transform: translateY(-50%);
  }
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 50;
  pointer-events: auto;
  -webkit-tap-highlight-color: transparent;

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

.dream-bottom {
  flex-shrink: 0;
  width: 100%;
  margin-top: auto;
  padding-top: var(--goal-bottom-top-gap);
  display: flex;
  flex-direction: column;
  align-items: stretch;
  position: relative;
  z-index: 20;
}

.dream-instruction {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 var(--goal-instruction-bottom-gap) 0;
  text-align: center;
  flex-shrink: 0;
}

.dream-instruction--inline {
  margin-top: var(--goal-inline-instruction-gap);
  margin-bottom: 0;
}

.dream-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  flex-shrink: 0;
}

.dream-searchBtn {
  width: 100%;
  height: 48px;
  border-radius: 9999px;
  background: transparent;
  border: 2px solid #BD0043;
  color: #BD0043;
  font-size: 0.9rem;
  font-weight: 700;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;

  &:hover {
    transform: translateY(-2px);
    background: rgba(189, 0, 67, 0.1);
  }
}

.dream-nextBtn {
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

  &:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(189, 0, 67, 0.4);
  }
}

.dream-nextBtn-single {
  margin-top: 0;
}
</style>
