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

    <!-- Illustration: outside slide transition so transform animations cannot shift fixed center -->
    <div
      v-if="currentSlide.image && currentSlide.image.trim() !== ''"
      class="auth-help-illustration"
    >
      <img
        :key="currentSlide.key"
        :src="currentSlide.image"
        :alt="currentSlide.title || currentSlide.titleLines?.join(' ') || 'Illustration'"
        class="auth-help-illustration-img"
        @error="handleImageError"
        @load="handleImageLoad"
      />
    </div>

    <!-- Carousel slides (text only — no transform ancestor for illustration) -->
    <div class="auth-help-slides">
      <transition :name="slideTransition" mode="out-in">
        <div
          :key="currentSlideIndex"
          class="auth-help-slide"
          :class="`auth-help-slide--${currentSlideIndex + 1}`"
        >
          <div class="auth-help-slide-body">
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
          </div>
        </div>
      </transition>
    </div>

    <!-- Bottom zone: nav buttons above progress bar, same position on every slide -->
    <div class="auth-help-bottom">
      <div class="auth-help-actions">
        <!-- Screens 1-4: Navigation arrows -->
        <template v-if="currentSlideIndex < 4">
          <button
            v-if="currentSlideIndex > 0"
            class="auth-help-cta-round auth-help-cta-round--left"
            @click="goPrevious"
          >
            <q-icon name="chevron_left" />
          </button>
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

      <div class="auth-help-progress">
        <div
          class="auth-help-progress-fill"
          :style="{ width: `${((currentSlideIndex + 1) / slides.length) * 100}%` }"
        ></div>
      </div>
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
    text: "dreamhubb connects people through dreams, problems, and ideas. Share what you want to achieve — and find others ready to lift you up.",
    image: helpIllustration1,
    isFinal: false
  },
  {
    key: "help-2",
    title: "Help others, let others help you",
    text: "Offer advice, experience, contacts, or a small act of support. When you need it, the community is here to give back.",
    image: helpIllustration2,
    isFinal: false
  },
  {
    key: "help-3",
    title: "Earn Tokens by helping",
    text: "Every kind action earns Tokens — recognition for the goodwill you bring to dreamhubb and the people you support.",
    image: helpIllustration3,
    isFinal: false
  },
  {
    key: "help-4",
    title: "Even partial help can push someone towards his dream",
    text: "You do not have to solve everything at once. A useful tip, a warm word, or an introduction can move someone meaningfully closer.",
    image: helpIllustration4,
    isFinal: false
  },
  {
    key: "help-5",
    titleLines: ["Now let's accomplish our", "dreams with"],
    text: "Join a community where giving and receiving support becomes a natural part of everyday life.",
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
  // Mark image as loaded (layout is CSS-driven; avoid inline display toggles that reflow center)
  if (img.src && img.naturalWidth > 1 && img.naturalHeight > 1) {
    loadedImages.value.add(img.src);
    imageErrors.value.delete(img.src);
  }
}
</script>

<style lang="scss" scoped>
/* Unified app background (iosSafeArea.scss) */
.auth-help-onboarding {
  position: relative;
  height: 100dvh;
  min-height: 100dvh;
  max-height: 100dvh;
  width: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  padding: 0 1rem;
  box-sizing: border-box;
  overflow: hidden;
  background: transparent;
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
  top: calc(env(safe-area-inset-top, 0px) + 16px);
  left: 20px;
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
  flex: 1 1 auto;
  min-height: 0;
  overflow: hidden;
  display: flex;
  align-items: stretch;
  justify-content: center;
}

.auth-help-slide {
  position: relative;
  width: 100%;
  height: 100%;
  box-sizing: border-box;
  overflow: visible;
}

.auth-help-slide-body {
  position: absolute;
  left: 0;
  right: 0;
  top: calc(50dvh + clamp(62px, 12.5dvh, 98px));
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: clamp(0.45rem, 1.4dvh, 0.85rem);
  padding: 0 0.5rem;
  box-sizing: border-box;
  z-index: 2;
}

// Illustration — exact viewport center; fixed box height prevents post-load vertical jump
.auth-help-illustration {
  position: fixed;
  left: 50%;
  top: 50%;
  transform: translate(-50%, calc(-50% - 100px));
  width: calc(100% - 2rem);
  max-width: 280px;
  height: clamp(130px, 27dvh, 210px);
  display: flex;
  align-items: center;
  justify-content: center;
  margin: 0;
  padding: 0;
  z-index: 2;
  pointer-events: none;
}

.auth-help-illustration-img {
  display: block;
  width: auto;
  max-width: 100%;
  height: auto;
  max-height: 100%;
  margin: 0 auto;
  object-fit: contain;
  object-position: center center;
  background: transparent;

  // Hide broken image icon and prevent green block
  &[src=""],
  &:not([src]) {
    display: none;
  }
}

// Title
.auth-help-title {
  font-size: clamp(1.1rem, 4.2vw, 1.4rem);
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  margin: 0;
  max-width: 88%;
  line-height: 1.25;
  font-family: poppinsSemiBold, sans-serif;
  flex-shrink: 0;
}

.auth-help-slide--4 .auth-help-title {
  font-size: clamp(1rem, 3.6vw, 1.2rem);
  max-width: 92%;
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
  font-size: clamp(1.1rem, 4vw, 1.35rem);
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  line-height: 1.25;
  font-family: poppinsSemiBold, sans-serif;
}

.auth-help-logo {
  font-size: clamp(1.5rem, 5vw, 1.85rem);
  font-weight: 700;
  color: #ffffff;
  text-align: center;
  margin: 0.25rem 0 0;
  font-family: poppinsSemiBold, sans-serif;
}

// Final slide — anchor copy above CTA, restore title/logo/tagline rhythm
.auth-help-slide--5 .auth-help-slide-body {
  top: auto;
  bottom: 1.25rem;
  gap: 0;
  padding: 0 1rem 0.25rem;
}

.auth-help-slide--5 .auth-help-title-final {
  gap: 0.2rem;
  margin-bottom: 0.15rem;
}

.auth-help-slide--5 .auth-help-title-line {
  line-height: 1.3;
}

.auth-help-slide--5 .auth-help-logo {
  font-size: clamp(1.85rem, 6vw, 2.35rem);
  margin: 0.45rem 0 1rem;
  line-height: 1.1;
}

.auth-help-slide--5 .auth-help-text {
  margin: 0;
  max-width: 80%;
  line-height: 1.5;
  padding: 0 0.5rem;
}

// Text
.auth-help-text {
  font-size: clamp(0.82rem, 2.8vw, 0.9rem);
  color: rgba(255, 255, 255, 0.8);
  text-align: center;
  margin: 0;
  max-width: 72%;
  line-height: 1.45;
  padding: 0 0.5rem;
  font-family: poppins, sans-serif;
  flex-shrink: 1;
  min-height: 0;
}

// Bottom zone: actions + progress in document flow (no overlap)
.auth-help-bottom {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 18px;
  width: 100%;
  max-width: 390px;
  padding-top: 0.35rem;
  padding-bottom: calc(env(safe-area-inset-bottom, 0px) + 16px);
  flex-shrink: 0;
  z-index: 3;
}

.auth-help-actions {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  gap: 28px;
  margin: 0;
  flex-shrink: 0;
}

// Round CTA button (screens 1-4)
.auth-help-cta-round {
  width: 64px;
  height: 64px;
  margin-top: -20px;
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

// Progress bar — always below nav buttons
.auth-help-progress {
  position: static;
  width: calc(100% - 40px);
  max-width: 320px;
  height: 4px;
  margin: 0 auto;
  background: rgba(189, 0, 67, 0.2);
  border-radius: 2px;
  overflow: hidden;
  flex-shrink: 0;
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
  .auth-help-slide:not(.auth-help-slide--5) .auth-help-slide-body {
    top: calc(50dvh + clamp(54px, 11dvh, 86px));
    gap: 0.4rem;
  }

  .auth-help-slide--5 .auth-help-slide-body {
    bottom: 1rem;
  }

  .auth-help-slide--5 .auth-help-logo {
    margin: 0.35rem 0 0.85rem;
  }

  .auth-help-illustration {
    height: clamp(118px, 24dvh, 180px);
  }

  .auth-help-bottom {
    gap: 16px;
    padding-top: 0.25rem;
  }
}

@media (max-height: 740px) {
  .auth-help-slide:not(.auth-help-slide--5) .auth-help-slide-body {
    top: calc(50dvh + clamp(48px, 10dvh, 76px));
  }

  .auth-help-slide--5 .auth-help-slide-body {
    bottom: 0.85rem;
  }

  .auth-help-slide--5 .auth-help-logo {
    font-size: clamp(1.65rem, 5.5vw, 2rem);
    margin: 0.3rem 0 0.75rem;
  }

  .auth-help-illustration {
    height: clamp(100px, 22dvh, 150px);
  }

  .auth-help-text {
    line-height: 1.35;
    max-width: 78%;
  }
}
</style>
