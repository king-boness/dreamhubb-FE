<template>
  <div class="pickYourSide">
    <!-- Back button + Progress -->
    <div class="pick-header">
      <button class="pick-backBtn" @click="handleBack">
        <q-icon name="chevron_left" />
      </button>
      <div class="pick-progress">
        <span class="pick-progress_fill" style="width: 20%"></span>
      </div>
    </div>

    <div class="pick-content">
      <h1 class="pick-title">choose your side</h1>

      <!-- Flicking carousel -->
      <div class="pick-carousel-wrapper">
        <Flicking
          :options="flickingOptions"
          :plugins="flickingPlugins"
          @changed="handleFlickingChanged"
          class="pick-flicking"
        >
          <div
            v-for="option in options"
            :key="option.id"
            class="pick-option"
            :class="{ 'is-active': localValue === option.value }"
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
          </div>
        </Flicking>

        <button class="pick-helpBtn" @click="handleInfoClick">
          <q-icon name="help_outline" />
        </button>
      </div>

      <p class="pick-instruction">choose by swiping up or down</p>
    </div>

    <!-- Next button -->
    <button class="pick-nextBtn" @click="handleNext" :disabled="!localValue">
      NEXT STEP
    </button>

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
import { ref, computed } from "vue";
import { useRouter } from "vue-router";
import { Fade, Perspective } from "@egjs/flicking-plugins";
import Flicking from "@egjs/vue3-flicking";
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

// Flicking options - donee first (top), donor second (bottom)
const options = [
  { id: 1, title: "Donee", value: "donee" },
  { id: 2, title: "Donor", value: "donor" }
];

const flickingOptions = computed(() => {
  // Default to donor (index 1) if no value set
  const defaultIdx = localValue.value === "donee" ? 0 : 1;
  return {
    horizontal: false, // Vertical scrolling
    inputType: ["mouse", "touch", "pointer"],
    defaultIndex: defaultIdx,
    align: "center",
    circular: true,
    duration: 300, // Faster transition
    easing: (x: number) => 1 - Math.pow(1 - x, 3), // Ease-out cubic
    deceleration: 0.0075, // Smoother deceleration
    threshold: 40, // Lower threshold for easier swiping
    interruptable: true, // Allow interrupting animations
    bounce: 0 // No bounce for smoother feel
  };
});

const flickingPlugins = [
  new Fade("", 0.3), // Very tight fade range - only active item visible
  new Perspective({ rotate: 0.2, scale: 1.3 }) // Minimal perspective effect
];

const handleFlickingChanged = (e: { index: number }) => {
  const selectedOption = options[e.index];
  localValue.value = selectedOption.value as "donor" | "donee";
  emit("update:modelValue", localValue.value);
};

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
  // User confirmed their choice, proceed to next step
  handleNext();
};

const handleBack = () => {
  router.push({ name: "auth-welcome-page" });
};

const handleNext = () => {
  emit("update:modelValue", localValue.value);
  emit("next");
};
</script>

<style lang="scss" scoped>
.pickYourSide {
  width: 100%;
  max-width: 390px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 24px 20px 40px;
  margin: 0 auto;
  background: transparent;
  overflow: hidden;
  position: relative;
}

.pick-header {
  display: flex;
  align-items: flex-start;
  justify-content: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  flex-shrink: 0;
  position: relative;
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
  overflow: hidden;
  position: relative;
}

.pick-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 20px 0;
  text-align: center;
  flex-shrink: 0;
  line-height: 1.2;
}

.pick-carousel-wrapper {
  position: relative;
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  margin: 0;
}

.pick-flicking {
  width: 100%;
  height: 100%;
  max-height: 450px;
}

:deep(.flicking-viewport) {
  width: 100%;
  height: 100%;
  overflow: hidden;
  pointer-events: auto;
}

:deep(.flicking-camera) {
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 80px; // Reduced gap to make transitions smoother
}

:deep(.flicking-panel) {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 220px;
}

.pick-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  width: 100%;
  min-height: 200px;
  opacity: 0;
  transition: opacity 0.2s ease, transform 0.2s ease;
  position: relative;
  cursor: pointer;
  flex-shrink: 0;
  will-change: opacity, transform;
  pointer-events: none;

  &.is-active {
    opacity: 1;
    transform: scale(1.2);
    pointer-events: auto;
  }

  // Show icon even when not active, but very faint
  &:not(.is-active) .pick-icon {
    opacity: 0.1;
  }
}

.pick-content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  position: relative;
  width: 100%;
  height: 100%;
}

.pick-label {
  font-size: 3.5rem;
  font-weight: 700;
  color: #BD0043;
  font-family: serif;
  transition: color 0.3s ease;
  position: relative;
  z-index: 2;
  line-height: 1;
  text-transform: lowercase;
  text-align: center;
  margin-bottom: -40px;
  display: block;
  opacity: 1;
  visibility: visible;
}

// Hide label completely for non-active options
.pick-option:not(.is-active) .pick-label {
  display: none !important;
  opacity: 0 !important;
  visibility: hidden !important;
}

.pick-icon {
  width: 160px;
  height: 160px;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  z-index: 1;
  opacity: 0.3;
  pointer-events: none;
  transition: opacity 0.3s ease, transform 0.3s ease;
  margin-top: 0;

  .pick-option.is-active & {
    opacity: 1;
    transform: scale(1.1);
  }
}

.pick-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(189, 0, 67, 0.5));
}

.pick-helpBtn {
  position: absolute;
  right: 20px;
  top: calc(50% - 40px);
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 2px solid rgba(255, 255, 255, 0.3);
  background: transparent;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
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

.pick-instruction {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 20px 0;
  text-align: center;
  flex-shrink: 0;
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

  &:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(189, 0, 67, 0.4);
  }
}
</style>
