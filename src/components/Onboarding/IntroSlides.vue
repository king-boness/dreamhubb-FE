<template>
  <div class="introSlides">
    <!-- Skip button -->
    <button class="intro-skip" @click="emit('skip')">Skip</button>

    <!-- Slide content -->
    <div class="intro-content">
      <div class="intro-illustration">
        <img :src="currentSlideData.image" :alt="currentSlideData.title" />
      </div>

      <h1 class="intro-title">{{ currentSlideData.title }}</h1>
      <p class="intro-subtitle">{{ currentSlideData.subtitle }}</p>
    </div>

    <!-- Navigation -->
    <div class="intro-navigation">
      <!-- Next button -->
      <button class="intro-nextBtn" @click="emit('next')">
        <q-icon name="chevron_right" />
      </button>

      <!-- Progress indicator -->
      <div class="intro-progress">
        <span
          v-for="(slide, index) in slides"
          :key="index"
          class="intro-progress_dot"
          :class="{ 'is-active': index === currentSlide }"
        ></span>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Slide {
  title: string;
  subtitle: string;
  image: string;
}

const props = defineProps<{
  currentSlide: number;
}>();

const emit = defineEmits<{
  next: [];
  skip: [];
}>();

const slides: Slide[] = [
  {
    title: "It's all about help",
    subtitle: "Tellus dictum cursus elementum quisque. Sapien faucibus sit non urna. Id viverra ultricies non tortor. A vitae hendrerit diam a. Tortor. A vitae hendrerit diam a.",
    image: "/images/onboarding/slide-1.png"
  },
  {
    title: "Help others, let others help you",
    subtitle: "Tellus dictum cursus elementum quisque. Sapien faucibus sit non urna. Id viverra ultricies non tortor. A vitae hendrerit diam a. Tortor. A vitae hendrerit diam a.",
    image: "/images/onboarding/slide-2.png"
  },
  {
    title: "Earn Karma by helping",
    subtitle: "Tellus dictum cursus elementum quisque. Sapien faucibus sit non urna. Id viverra ultricies non tortor. A vitae hendrerit diam a. Tortor. A vitae hendrerit diam a.",
    image: "/images/onboarding/slide-3.png"
  },
  {
    title: "Even partial help can push someone towards his dream",
    subtitle: "Tellus dictum cursus elementum quisque. Sapien faucibus sit non urna. Id viverra ultricies non tortor.",
    image: "/images/onboarding/slide-4.png"
  },
  {
    title: "Now let's accomplish our dreams with",
    subtitle: "dreamhubb",
    image: "/images/onboarding/slide-5.png"
  }
];

const currentSlideData = computed(() => slides[props.currentSlide]);
</script>

<style lang="scss" scoped>
.introSlides {
  width: 100%;
  max-width: 390px;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 24px 20px 40px;
  margin: 0 auto;
}

.intro-skip {
  align-self: flex-start;
  background: transparent;
  border: 2px solid rgba(255, 255, 255, 0.3);
  border-radius: 9999px;
  padding: 8px 16px;
  color: rgba(255, 255, 255, 0.8);
  font-size: 0.875rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    border-color: rgba(255, 255, 255, 0.6);
    color: rgba(255, 255, 255, 1);
  }
}

.intro-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 40px 0;
}

.intro-illustration {
  width: 100%;
  max-width: 320px;
  margin-bottom: 48px;

  img {
    width: 100%;
    height: auto;
    display: block;
  }
}

.intro-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 16px 0;
  line-height: 1.3;
  max-width: 320px;
}

.intro-subtitle {
  font-size: 0.9375rem;
  font-weight: 400;
  color: rgba(255, 255, 255, 0.7);
  margin: 0;
  line-height: 1.6;
  max-width: 320px;
}

.intro-navigation {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 24px;
  width: 100%;
}

.intro-nextBtn {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: linear-gradient(135deg, #ff2c8b 0%, #ff5f6d 100%);
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  box-shadow: 0 8px 24px rgba(255, 44, 139, 0.3);

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(255, 44, 139, 0.4);
  }

  .q-icon {
    font-size: 32px;
    color: #ffffff;
  }
}

.intro-progress {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  height: 4px;
}

.intro-progress_dot {
  width: 40px;
  height: 4px;
  border-radius: 2px;
  background-color: rgba(255, 255, 255, 0.2);
  transition: all 0.3s ease;

  &.is-active {
    background-color: #ff2c8b;
    width: 60px;
  }
}
</style>
