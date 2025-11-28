<template>
  <q-page class="auth-help-onboarding">
    <!-- Background gradient (shared with AuthWelcomePage) -->
    <div class="auth-help-background"></div>

    <!-- Map in background (shared with AuthWelcomePage) -->
    <div class="auth-map-wrapper">
      <img
        :src="mapImage"
        alt="World map"
        class="auth-map"
        @error="handleMapError"
      />
    </div>

    <!-- Back button -->
    <button class="auth-help-back-btn" @click="goBack">
      <q-icon name="chevron_left" />
    </button>

    <!-- Carousel slides -->
    <div class="auth-help-slides">
      <transition :name="slideTransition" mode="out-in">
        <div
          :key="currentSlideIndex"
          class="auth-help-slide"
        >
          <!-- Illustration -->
          <div
            v-if="currentSlide.image && currentSlide.image.trim() !== ''"
            class="auth-help-illustration"
          >
            <img
              :src="currentSlide.image"
              :alt="currentSlide.title || currentSlide.titleLines?.join(' ') || 'Illustration'"
              class="auth-help-illustration-img"
              @error="handleImageError"
              @load="handleImageLoad"
            />
          </div>

          <!-- Title -->
          <h3 v-if="!currentSlide.isFinal" class="auth-help-title">{{ currentSlide.title }}</h3>
          <div v-else class="auth-help-title-final">
            <div class="auth-help-title-lines">
              <div v-for="(line, index) in currentSlide.titleLines" :key="index" class="auth-help-title-line">
                {{ line }}
              </div>
            </div>
            <h1 class="auth-help-logo">dreamhubb</h1>
          </div>

          <!-- Text -->
          <p v-if="currentSlide.text" class="auth-help-text">{{ currentSlide.text }}</p>

          <!-- CTA Button -->
          <div class="auth-help-cta">
            <!-- Screens 1-4: Navigation arrows -->
            <template v-if="currentSlideIndex < 4">
              <!-- Left arrow (back) - only show if not on first slide -->
              <button
                v-if="currentSlideIndex > 0"
                class="auth-help-cta-round auth-help-cta-round--left"
                @click="goPrevious"
              >
                <q-icon name="chevron_left" />
              </button>
              <!-- Right arrow (next) -->
              <button
                class="auth-help-cta-round auth-help-cta-round--right"
                @click="goNext"
              >
                <q-icon name="chevron_right" />
              </button>
            </template>

            <!-- Screen 5: Full-width button -->
            <button
              v-else
              class="auth-help-cta-full"
              @click="handleFinalCta"
            >
              JOIN THE MOVEMENT
            </button>
          </div>

          <!-- Progress bar -->
          <div class="auth-help-progress">
            <div
              class="auth-help-progress-fill"
              :style="{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }"
            ></div>
          </div>
        </div>
      </transition>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { useRouter } from "vue-router";

const router = useRouter();

// Map image (shared with AuthWelcomePage)
import mapImage from "src/assets/Auth/map-image.svg";

// Import illustrations - using SVG format
import helpIllustration1 from "src/assets/onboarding/help_1_hand_heart.svg";
import helpIllustration2 from "src/assets/onboarding/help_2_balloon.svg";
import helpIllustration3 from "src/assets/onboarding/help_3_karma.svg";
import helpIllustration4 from "src/assets/onboarding/help_4_star.svg";
import helpIllustration5 from "src/assets/onboarding/help_5_flower.svg";

// Slides data
const slides = [
  {
    key: "help-1",
    title: "It's all about help",
    text: "Tellus dictum cursus elementum quisque. Sapien faucibus sit non urna. Id viverra ultricies non tortor.",
    image: helpIllustration1,
    isFinal: false
  },
  {
    key: "help-2",
    title: "Help others, let others help you",
    text: "Tellus dictum cursus elementum quisque. Sapien faucibus sit non urna. Id viverra ultricies non tortor.",
    image: helpIllustration2,
    isFinal: false
  },
  {
    key: "help-3",
    title: "Earn Karma by helping",
    text: "Tellus dictum cursus elementum quisque. Sapien faucibus sit non urna. Id viverra ultricies non tortor.",
    image: helpIllustration3,
    isFinal: false
  },
  {
    key: "help-4",
    title: "Even partial help can push someone towards his dream",
    text: "Tellus dictum cursus elementum quisque. Sapien faucibus sit non urna. Id viverra ultricies non tortor.",
    image: helpIllustration4,
    isFinal: false
  },
  {
    key: "help-5",
    titleLines: ["Now let's accomplish our", "dreams with"],
    text: "",
    image: helpIllustration5,
    isFinal: true,
    ctaLabel: "JOIN THE MOVEMENT"
  }
];

// Current slide index
const currentSlideIndex = ref(0);
const slideTransition = ref("slide-next");

// Computed
const currentSlide = computed(() => slides[currentSlideIndex.value]);

// Functions
function goNext() {
  if (currentSlideIndex.value < slides.length - 1) {
    slideTransition.value = "slide-next";
    currentSlideIndex.value++;
  }
}

function goPrevious() {
  if (currentSlideIndex.value > 0) {
    slideTransition.value = "slide-prev";
    currentSlideIndex.value--;
  }
}

function goBack() {
  router.push({ name: "auth-welcome-page" });
}

function handleFinalCta() {
  router.push({ name: "auth-welcome-page" });
}

function handleMapError(event: Event) {
  const img = event.target as HTMLImageElement;
  img.style.display = "none";
}

const imageErrors = ref<Set<string>>(new Set());
const loadedImages = ref<Set<string>>(new Set());

const isImageLoaded = (imageSrc: string): boolean => {
  return loadedImages.value.has(imageSrc) && !imageErrors.value.has(imageSrc);
};

function handleImageError(event: Event) {
  const img = event.target as HTMLImageElement;
  if (img.src) {
    imageErrors.value.add(img.src);
  }
  // Hide the image and its container
  img.style.display = "none";
  const container = img.closest(".auth-help-illustration");
  if (container) {
    (container as HTMLElement).style.display = "none";
  }
}

function handleImageLoad(event: Event) {
  const img = event.target as HTMLImageElement;
  // Check if image is too small (1x1px placeholder) - hide it
  if (img.naturalWidth <= 1 && img.naturalHeight <= 1) {
    // Hide placeholder images that are too small
    if (img.src) {
      imageErrors.value.add(img.src);
    }
    img.style.display = "none";
    img.style.visibility = "hidden";
    img.style.opacity = "0";
    const container = img.closest(".auth-help-illustration");
    if (container) {
      (container as HTMLElement).style.display = "none";
      (container as HTMLElement).style.visibility = "hidden";
    }
    return;
  }
  // Mark image as loaded and show it (only if it's a real image, not a placeholder)
  if (img.src && img.naturalWidth > 1 && img.naturalHeight > 1) {
    loadedImages.value.add(img.src);
    imageErrors.value.delete(img.src); // Remove from errors if it loads successfully
    // Show the image when it loads successfully and is not a placeholder
    img.style.display = "block";
    img.style.visibility = "visible";
    img.style.opacity = "1";
    const container = img.closest(".auth-help-illustration");
    if (container) {
      (container as HTMLElement).style.display = "flex";
      (container as HTMLElement).style.visibility = "visible";
    }
  }
}
</script>

<style lang="scss" scoped>
// Shared background styles (same as AuthWelcomePage)
.auth-help-onboarding {
  position: relative;
  min-height: 100vh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
  overflow: hidden;
  // Gradient podľa dizajnu - tmavý fialovo-modrý, smeruje zhora nadol
  background: radial-gradient(circle at top, #0b001c 0%, #05000e 40%, #010006 100%);
}

.auth-help-background {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  z-index: 0;
}

// Map wrapper (shared with AuthWelcomePage)
.auth-map-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 40vh;
  max-height: 340px;
  margin-top: 70px;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  pointer-events: none;
  z-index: 1;
}

.auth-map {
  position: relative;
  max-width: 100%;
  height: auto;
  object-fit: contain;
  opacity: 0.65;
}

// Back button
.auth-help-back-btn {
  position: absolute;
  top: 1.5rem;
  left: 1.5rem;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  transition: all 0.2s ease;

  &:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .q-icon {
    font-size: 24px;
    color: #ffffff;
  }
}

// Slides container
.auth-help-slides {
  position: relative;
  z-index: 2;
  width: 100%;
  max-width: 390px;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.auth-help-slide {
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  gap: 1.5rem;
  padding: 2rem 1rem;
  min-height: calc(100vh - 4rem);
  padding-top: 4rem; // More padding from top for illustration
}

// Illustration
.auth-help-illustration {
  width: 100%;
  max-width: 300px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 1rem;
  padding-top: 2rem;
  flex: 0 0 auto;
  min-height: 200px;
  visibility: visible;
}

.auth-help-illustration-img {
  width: 100%;
  max-height: 320px;
  min-height: 200px;
  object-fit: contain;
  background: transparent;
  display: block; // Show by default, hide only if error or too small
  visibility: visible;
  opacity: 1;

  // Hide broken image icon and prevent green block
  &[src=""],
  &:not([src]) {
    display: none;
  }
}

// Title
.auth-help-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  margin: 0;
  max-width: 80%;
  line-height: 1.3;
  font-family: poppinsSemiBold, sans-serif;
}

// Final slide title
.auth-help-title-final {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  max-width: 80%;
}

.auth-help-title-lines {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0;
}

.auth-help-title-line {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  line-height: 1.3;
  font-family: poppinsSemiBold, sans-serif;
}

.auth-help-logo {
  font-size: 2rem;
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  margin: 0.5rem 0 0 0;
  font-family: poppinsSemiBold, sans-serif;
}

// Text
.auth-help-text {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin: 0;
  max-width: 66.67%; // ~2/3 width
  line-height: 1.8; // Higher line-height for readability
  padding: 0 1rem;
  font-family: poppins, sans-serif;
}

// CTA
.auth-help-cta {
  margin-top: auto;
  margin-bottom: 2rem;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 1rem;
}

// Round CTA button (screens 1-4)
.auth-help-cta-round {
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #BD0043;
  border: none;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 8px 24px rgba(189, 0, 67, 0.3);

  &:hover {
    background: #a0003a;
    transform: scale(1.05);
    box-shadow: 0 12px 32px rgba(189, 0, 67, 0.4);
  }

  .q-icon {
    font-size: 32px;
    color: #ffffff;
  }
}

// Full-width CTA button (screen 5)
.auth-help-cta-full {
  width: 100%;
  max-width: 320px;
  height: 56px;
  border-radius: 9999px;
  background: #BD0043;
  border: none;
  color: #ffffff;
  font-size: 1rem;
  font-weight: 600;
  letter-spacing: 0.5px;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 8px 24px rgba(189, 0, 67, 0.3);
  font-family: poppinsSemiBold, sans-serif;

  &:hover {
    background: #a0003a;
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(189, 0, 67, 0.4);
  }
}

// Progress bar
.auth-help-progress {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 320px;
  height: 4px;
  background: rgba(189, 0, 67, 0.2);
  border-radius: 2px;
  overflow: hidden;
}

.auth-help-progress-fill {
  height: 100%;
  background: #BD0043;
  border-radius: 2px;
  transition: width 0.3s ease;
}

// Slide transitions
.slide-next-enter-active,
.slide-next-leave-active,
.slide-prev-enter-active,
.slide-prev-leave-active {
  transition: all 0.3s ease;
}

.slide-next-enter-from {
  opacity: 0;
  transform: translateX(30px);
}

.slide-next-leave-to {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-prev-enter-from {
  opacity: 0;
  transform: translateX(-30px);
}

.slide-prev-leave-to {
  opacity: 0;
  transform: translateX(30px);
}

// Responzivita
@media (min-width: 391px) {
  .auth-help-slides {
    max-width: 390px;
  }

  .auth-map-wrapper {
    max-width: 390px;
  }
}

@media (max-height: 844px) {
  .auth-help-illustration-img {
    max-height: 240px;
  }

  .auth-help-slide {
    gap: 1rem;
    padding: 1.5rem 1rem;
    padding-top: 3rem;
  }

  .auth-help-illustration {
    padding-top: 1rem;
  }
}
</style>
