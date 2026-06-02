<template>
  <q-dialog v-model="isOpen" maximized class="image-preview-dialog">
    <q-card class="image-preview-card">
      <q-btn
        flat
        round
        dense
        icon="close"
        class="image-preview-close"
        @click="close"
      />

      <!-- Navigation arrows (only if multiple images) -->
      <q-btn
        v-if="images.length > 1"
        flat
        round
        dense
        icon="chevron_left"
        class="image-preview-nav image-preview-nav-left"
        @click="previousImage"
      />
      <q-btn
        v-if="images.length > 1"
        flat
        round
        dense
        icon="chevron_right"
        class="image-preview-nav image-preview-nav-right"
        @click="nextImage"
      />

      <!-- Image counter (only if multiple images) -->
      <div v-if="images.length > 1" class="image-preview-counter">
        {{ currentIndex + 1 }} / {{ images.length }}
      </div>

      <div class="image-preview-content">
        <q-carousel
          v-if="images.length > 0"
          v-model="currentIndex"
          animated
          swipeable
          :arrows="false"
          :navigation="false"
          class="image-preview-carousel"
        >
          <q-carousel-slide
            v-for="(url, idx) in images"
            :key="`${idx}-${url}`"
            :name="idx"
            class="image-preview-slide"
          >
            <img
              :src="url"
              :alt="`Image ${idx + 1}`"
              class="image-preview-image"
              draggable="false"
            />
          </q-carousel-slide>
        </q-carousel>
      </div>
    </q-card>
  </q-dialog>
</template>

<script setup lang="ts">
import { ref, computed, watch } from "vue";

interface Props {
  modelValue: boolean;
  images: string[];
  initialIndex?: number;
}

const props = withDefaults(defineProps<Props>(), {
  initialIndex: 0
});

const emit = defineEmits<{
  "update:modelValue": [value: boolean];
}>();

const currentIndex = ref(props.initialIndex);

const isOpen = computed({
  get: () => props.modelValue,
  set: (value) => emit("update:modelValue", value)
});

// currentIndex drives QCarousel; we keep it in bounds on updates.

// Watch for initialIndex changes
watch(() => props.initialIndex, (newIndex) => {
  if (newIndex >= 0 && newIndex < props.images.length) {
    currentIndex.value = newIndex;
  }
});

// Watch for images array changes
watch(() => props.images, () => {
  if (currentIndex.value >= props.images.length) {
    currentIndex.value = Math.max(0, props.images.length - 1);
  }
});

const nextImage = () => {
  if (props.images.length > 1) {
    currentIndex.value = (currentIndex.value + 1) % props.images.length;
  }
};

const previousImage = () => {
  if (props.images.length > 1) {
    currentIndex.value = currentIndex.value === 0
      ? props.images.length - 1
      : currentIndex.value - 1;
  }
};

const close = () => {
  isOpen.value = false;
};

// Keyboard navigation
const handleKeydown = (event: KeyboardEvent) => {
  if (!isOpen.value) return;

  if (event.key === "ArrowLeft") {
    previousImage();
  } else if (event.key === "ArrowRight") {
    nextImage();
  } else if (event.key === "Escape") {
    close();
  }
};

// Add keyboard event listener when modal is open
watch(isOpen, (open) => {
  if (open) {
    window.addEventListener("keydown", handleKeydown);
  } else {
    window.removeEventListener("keydown", handleKeydown);
  }
});
</script>

<style lang="scss" scoped>
.image-preview-dialog {
  z-index: 10000 !important;

  :deep(.q-dialog__backdrop) {
    background: rgba(0, 0, 0, 0.96) !important;
    backdrop-filter: none !important;
  }

  :deep(.q-dialog__inner) {
    padding: 0 !important;
    width: 100vw !important;
    height: 100vh !important;
    height: 100dvh !important;
    max-width: 100vw !important;
    max-height: 100dvh !important;
  }

  :deep(.q-dialog__inner > div) {
    max-width: 100% !important;
    max-height: 100% !important;
  }
}

.image-preview-card {
  width: 100vw;
  height: 100vh;
  height: 100dvh;
  max-width: 100vw;
  max-height: 100vh;
  max-height: 100dvh;
  background: #000;
  display: flex;
  flex-direction: column;
  position: relative;
  overflow: hidden;
  animation: imagePreviewFadeIn 0.22s ease-out;
  border-radius: 0 !important;
  box-shadow: none !important;
}

@keyframes imagePreviewFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

.image-preview-close {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + 1rem);
  right: calc(env(safe-area-inset-right, 0px) + 1rem);
  z-index: 30;
  width: 48px;
  height: 48px;
  min-width: 48px;
  min-height: 48px;
  background: rgba(0, 0, 0, 0.55) !important;
  color: #ffffff !important;
  backdrop-filter: blur(10px);
  -webkit-backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.22);

  :deep(.q-icon) {
    color: #ffffff !important;
    font-size: 1.35rem;
  }

  &:hover {
    background: rgba(0, 0, 0, 0.72) !important;
  }
}

.image-preview-nav {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  z-index: 25;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  backdrop-filter: blur(8px);
  width: 48px;
  height: 48px;

  &:hover {
    background: rgba(0, 0, 0, 0.7);
  }
}

.image-preview-nav-left {
  left: 1rem;
}

.image-preview-nav-right {
  right: 1rem;
}

.image-preview-counter {
  position: absolute;
  bottom: calc(env(safe-area-inset-bottom, 0px) + 1.25rem);
  left: 50%;
  transform: translateX(-50%);
  z-index: 30;
  pointer-events: none;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  padding: 0.5rem 1rem;
  border-radius: 999px;
  font-size: 0.875rem;
  font-weight: 600;
  backdrop-filter: blur(8px);
}

.image-preview-content {
  position: relative;
  width: 100%;
  height: 100%;
  flex: 1 1 auto;
  min-height: 0;
  padding:
    calc(env(safe-area-inset-top, 0px) + 3.25rem)
    0
    calc(env(safe-area-inset-bottom, 0px) + 3.25rem)
    0;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}

.image-preview-carousel,
.image-preview-slide {
  width: 100%;
  height: 100%;
}

.image-preview-carousel {
  background: transparent;

  :deep(.q-carousel__viewport),
  :deep(.q-carousel__slides-container),
  :deep(.q-panel),
  :deep(.q-carousel__slide) {
    width: 100% !important;
    height: 100% !important;
  }

  :deep(.q-img),
  :deep(.q-img__container),
  :deep(.q-img__image),
  :deep(img) {
    width: 100% !important;
    max-width: 100% !important;
    height: auto !important;
    max-height: 100% !important;
    object-fit: contain !important;
    object-position: center !important;
  }
}

.image-preview-slide {
  padding: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  overflow: hidden;
}

.image-preview-image {
  display: block;
  width: 100%;
  max-width: 100vw;
  height: auto;
  max-height: 100%;
  object-fit: contain;
  object-position: center;
  flex: 0 1 auto;
  align-self: center;
  user-select: none;
  -webkit-user-select: none;
  border-radius: 0;
  box-shadow: none;
  background: transparent;
}
</style>

<style lang="scss">
/* Light app global h3/span rules must not wash out viewer chrome */
.body--light .image-preview-close,
.body--light .image-preview-close .q-icon,
.body--light .image-preview-close .q-btn__content {
  color: #ffffff !important;
}
</style>
