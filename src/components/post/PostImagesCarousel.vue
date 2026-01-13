<template>
  <div class="postImagesCarousel">
    <!-- Progress bar -->
    <div v-if="hasMultipleImages && showProgress" class="postCarousel-progress">
      <div
        v-for="(img, index) in safeImages"
        :key="index"
        class="postCarousel-progress-segment"
        :class="{ 'postCarousel-progress-segment--active': index === currentImageIndex }"
      >
        <div
          v-if="index === currentImageIndex"
          class="postCarousel-progress-fill"
          :key="`fill-${currentImageIndex}-${animationKey}`"
        ></div>
      </div>
    </div>

    <Transition :name="`postCarousel-slide-${slideDirection}`">
      <img
        v-if="currentImage"
        :key="currentImage"
        class="postCarousel-image"
        :src="currentImage"
        :alt="alt || 'Post image'"
        @click="handleImageClick"
        @touchstart.passive="onTouchStart"
        @touchend.passive="onTouchEnd"
        :style="imageStyle"
      />
    </Transition>
    <!-- fallback, ak nie sú obrázky -->
    <div v-if="!currentImage" class="postCarousel-image postCarousel-image--fallback"></div>

    <!-- Navigation arrows (optional, can be hidden via prop) -->
    <template v-if="hasMultipleImages && showArrows">
      <button
        class="postCarousel-arrow postCarousel-arrow--left"
        @click="handleManualPrev"
      >
        ‹
      </button>
      <button
        class="postCarousel-arrow postCarousel-arrow--right"
        @click="handleManualNext"
      >
        ›
      </button>
    </template>

    <!-- Dots indicators (optional, can be hidden via prop) -->
    <div v-if="hasMultipleImages && showDots" class="postCarousel-dots">
      <span
        v-for="(img, index) in safeImages"
        :key="index"
        class="postCarousel-dot"
        :class="{ 'postCarousel-dot--active': index === currentImageIndex }"
        @click="handleDotClick(index)"
      ></span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, watch, onMounted, onBeforeUnmount } from "vue";

interface Props {
  images: string[] | null | undefined;
  initialIndex?: number;
  autoSlide?: boolean;
  showProgress?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
  alt?: string;
  imageStyle?: Record<string, string>;
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0,
  autoSlide: true,
  showProgress: true,
  showArrows: true,
  showDots: true,
  alt: "Post image",
  imageStyle: () => ({})
});

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: "image-click", index: number): void;
}>();

// Auto-slide constants and state
const AUTO_SLIDE_INTERVAL_MS = 5000;
let autoSlideTimer: ReturnType<typeof setInterval> | null = null;
const touchStartX = ref<number | null>(null);
const animationKey = ref(0);
const slideDirection = ref<"next" | "prev">("next");
const currentImageIndex = ref(props.initialIndex);

// Filter and validate images
const safeImages = computed(() => {
  if (!props.images || !Array.isArray(props.images) || props.images.length === 0) {
    return [];
  }

  const validImages = props.images.filter(
    (img) =>
      img &&
      typeof img === "string" &&
      !["NULL", "{NULL}"].includes(img.trim())
  );

  return validImages;
});

const hasMultipleImages = computed(() => safeImages.value && safeImages.value.length > 1);

// Current image for display
const currentImage = computed(() => {
  if (!safeImages.value || safeImages.value.length === 0) return null;
  const length = safeImages.value.length;
  const index = ((currentImageIndex.value % length) + length) % length;
  return safeImages.value[index];
});

const restartProgressAnimation = () => {
  animationKey.value++;
};

const goToImage = (index: number, direction: "next" | "prev" = "next") => {
  if (!safeImages.value || safeImages.value.length === 0) return;
  const length = safeImages.value.length;
  slideDirection.value = direction;
  currentImageIndex.value = ((index % length) + length) % length;
  restartProgressAnimation();
};

const showPrevImage = () => {
  if (!hasMultipleImages.value) return;
  goToImage(currentImageIndex.value - 1, "prev");
};

const showNextImage = () => {
  if (!hasMultipleImages.value) return;
  goToImage(currentImageIndex.value + 1, "next");
};

// Auto-slide helpers
const startAutoSlide = () => {
  if (!hasMultipleImages.value || !props.autoSlide) return;
  stopAutoSlide();
  autoSlideTimer = setInterval(() => {
    showNextImage();
  }, AUTO_SLIDE_INTERVAL_MS);
};

const stopAutoSlide = () => {
  if (autoSlideTimer) {
    clearInterval(autoSlideTimer);
    autoSlideTimer = null;
  }
};

// Manual control handlers (reset timer after manual action)
const handleManualNext = () => {
  showNextImage();
  startAutoSlide();
};

const handleManualPrev = () => {
  showPrevImage();
  startAutoSlide();
};

const handleDotClick = (index: number) => {
  const direction = index > currentImageIndex.value ? "next" : "prev";
  goToImage(index, direction);
  startAutoSlide();
};

// Swipe gestures
const onTouchStart = (e: TouchEvent) => {
  touchStartX.value = e.touches[0]?.clientX ?? null;
};

const onTouchEnd = (e: TouchEvent) => {
  if (touchStartX.value === null) return;
  const endX = e.changedTouches[0]?.clientX ?? touchStartX.value;
  const deltaX = endX - touchStartX.value;
  const THRESHOLD = 40;

  if (deltaX > THRESHOLD) {
    // swipe right -> previous image
    handleManualPrev();
  } else if (deltaX < -THRESHOLD) {
    // swipe left -> next image
    handleManualNext();
  }

  touchStartX.value = null;
};

const handleImageClick = () => {
  emit("image-click", currentImageIndex.value);
};

// Watch for images changes
watch(
  () => safeImages.value?.length,
  () => {
    currentImageIndex.value = 0;
    restartProgressAnimation();
    startAutoSlide();
  }
);

// Watch for initialIndex changes
watch(
  () => props.initialIndex,
  (newIndex) => {
    currentImageIndex.value = newIndex;
    restartProgressAnimation();
  }
);

// Lifecycle hooks
onMounted(() => {
  currentImageIndex.value = props.initialIndex;
  startAutoSlide();
});

onBeforeUnmount(() => {
  stopAutoSlide();
});
</script>

<style lang="scss" scoped>
.postImagesCarousel {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
}

.postCarousel-image {
  display: block;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: center top;

  &--fallback {
    background: #1a1a1a;
  }
}

// Progress bar
.postCarousel-progress {
  position: absolute;
  top: 0.75rem;
  left: 0.75rem;
  right: 0.75rem;
  display: flex;
  gap: 0.25rem;
  z-index: 15;
}

.postCarousel-progress-segment {
  flex: 1;
  height: 3px;
  border-radius: 999px;
  overflow: hidden;
  background: rgba(84, 0, 29, 0.3);
  transition: background 0.2s ease;
  position: relative;

  &--active {
    background: rgba(84, 0, 29, 0.5);
  }
}

.postCarousel-progress-fill {
  width: 0%;
  height: 100%;
  background: rgba(84, 0, 29, 0.841);
  animation: postCarouselFill 5s linear forwards;
}

@keyframes postCarouselFill {
  from {
    width: 0%;
  }
  to {
    width: 100%;
  }
}

// Navigation arrows
.postCarousel-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(8px);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 24px;
  font-weight: 300;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 12;
  transition: all 0.2s ease;
  user-select: none;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
    border-color: rgba(255, 255, 255, 0.4);
    transform: translateY(-50%) scale(1.1);
  }

  &:active {
    transform: translateY(-50%) scale(0.95);
  }

  &--left {
    left: 12px;
  }

  &--right {
    right: 12px;
  }
}

// Dots indicators
.postCarousel-dots {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 12;
  pointer-events: auto;
}

.postCarousel-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.4);
  cursor: pointer;
  transition: all 0.2s ease;
  border: 1px solid rgba(255, 255, 255, 0.2);

  &:hover {
    background: rgba(255, 255, 255, 0.6);
    transform: scale(1.2);
  }

  &--active {
    background: rgba(255, 255, 255, 1);
    width: 24px;
    border-radius: 4px;
    border-color: rgba(255, 255, 255, 0.5);
  }
}

// Slide animations
.postCarousel-slide-next-enter-active,
.postCarousel-slide-next-leave-active,
.postCarousel-slide-prev-enter-active,
.postCarousel-slide-prev-leave-active {
  transition: transform 0.35s ease, opacity 0.35s ease;
}

.postCarousel-slide-next-enter-from {
  transform: translateX(100%);
  opacity: 0;
}

.postCarousel-slide-next-enter-to {
  transform: translateX(0%);
  opacity: 1;
}

.postCarousel-slide-next-leave-from {
  transform: translateX(0%);
  opacity: 1;
}

.postCarousel-slide-next-leave-to {
  transform: translateX(-30%);
  opacity: 0;
}

.postCarousel-slide-prev-enter-from {
  transform: translateX(-100%);
  opacity: 0;
}

.postCarousel-slide-prev-enter-to {
  transform: translateX(0%);
  opacity: 1;
}

.postCarousel-slide-prev-leave-from {
  transform: translateX(0%);
  opacity: 1;
}

.postCarousel-slide-prev-leave-to {
  transform: translateX(30%);
  opacity: 0;
}
</style>
