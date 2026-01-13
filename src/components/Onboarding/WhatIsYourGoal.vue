<template>
  <div class="whatIsYourGoal" :class="{ 'whatIsYourGoal--filter-mode': hideHeader && hideFooter }">
    <!-- Back button + Title (hidden if hideHeader is true) -->
    <template v-if="!hideHeader">
      <div class="goal-header">
        <button class="goal-backBtn" @click="emit('back')">
          <q-icon name="chevron_left" />
        </button>
        <div class="goal-progress">
          <span class="goal-progress_fill" :style="{ width: progressWidth }"></span>
        </div>
      </div>
      <div class="goal-content">
        <h1 class="goal-title">{{ title }}</h1>

        <!-- Flicking carousel -->
        <div class="goal-carousel-wrapper">
          <Flicking
            ref="flickingInstance"
            :options="flickingOptions"
            :plugins="flickingPlugins"
            @changed="handleFlickingChanged"
            @ready="handleFlickingReady"
            class="goal-flicking"
          >
            <div
              v-for="option in options"
              :key="option.id"
              class="goal-option"
              :class="{ 'is-active': localValue === option.value }"
            >
              <div class="goal-content-wrapper">
                <div class="goal-icon" :class="`goal-icon--${option.value}`">
                  <img
                    :src="`/icons/CategoryIcons/${option.value}.svg`"
                    :alt="option.value"
                    class="goal-icon-img"
                  />
                </div>
              </div>
            </div>
          </Flicking>

          <button class="goal-helpBtn" @click="handleInfoClick">
            <q-icon name="help_outline" />
          </button>
        </div>

        <p class="goal-instruction">choose by swiping up or down</p>
      </div>
    </template>
    <template v-else>
      <div class="goal-content">
        <!-- Flicking carousel -->
      <div class="goal-carousel-wrapper">
        <Flicking
          ref="flickingInstance"
          :options="flickingOptions"
          :plugins="flickingPlugins"
          @changed="handleFlickingChanged"
          @ready="handleFlickingReady"
          class="goal-flicking"
        >
            <div
              v-for="option in options"
              :key="option.id"
              class="goal-option"
              :class="{ 'is-active': localValue === option.value }"
            >
              <div class="goal-content-wrapper">
                <div class="goal-icon" :class="`goal-icon--${option.value}`">
                  <img
                    :src="`/icons/CategoryIcons/${option.value}.svg`"
                    :alt="option.value"
                    class="goal-icon-img"
                  />
                </div>
              </div>
            </div>
          </Flicking>

          <button class="goal-helpBtn" @click="handleInfoClick">
            <q-icon name="help_outline" />
          </button>
        </div>
      </div>
    </template>

    <!-- Action buttons (hidden if hideFooter is true) -->
    <template v-if="!hideFooter">
      <div class="goal-actions" v-if="showSearchButton">
        <button class="goal-searchBtn" @click="handleSearch">SEARCH</button>
        <button class="goal-nextBtn" @click="handleNext">{{ nextButtonLabel }}</button>
      </div>
      <button v-else class="goal-nextBtn goal-nextBtn-single" @click="handleNext">{{ nextButtonLabel }}</button>
    </template>

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
import { ref, computed, watch, nextTick, onMounted } from "vue";
import { Fade, Perspective } from "@egjs/flicking-plugins";
import Flicking from "@egjs/vue3-flicking";
import InfoModal from "./InfoModal.vue";
import { goalInfo } from "src/config/onboardingInfo";

const props = defineProps<{
  modelValue: "problem" | "dream" | "idea" | null;
  progress?: number; // Progress percentage (0-100), defaults to 40 for onboarding
  title?: string; // Custom title, defaults to "the post will be about"
  nextButtonLabel?: string; // Custom next button label, defaults to "NEXT STEP"
  showSearchButton?: boolean; // Show search button, defaults to false
  hideHeader?: boolean; // Hide header (back button + title), defaults to false
  hideFooter?: boolean; // Hide footer (CTA buttons), defaults to false
}>();

const emit = defineEmits<{
  "update:modelValue": [value: "problem" | "dream" | "idea"];
  next: [];
  back: [];
  search: [];
}>();

// Initialize with "dream" as default (index 1 in options array)
const localValue = ref<"problem" | "dream" | "idea">(props.modelValue || "dream");
const showInfoModal = ref(false);
const flickingInstance = ref<InstanceType<typeof Flicking> | null>(null);
const isFlickingReady = ref(false);

// Watch for flickingInstance changes and synchronize when it becomes available
watch(() => flickingInstance.value, async (newInstance) => {
  if (newInstance && !isFlickingReady.value) {
    // Check if it's a Vue component wrapper
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = (newInstance as any)?.flicking || newInstance;
    if (instance && typeof instance.moveTo === "function") {
      isFlickingReady.value = true;
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 100));
      await syncFlickingToValue();
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 WhatIsYourGoal: flickingInstance watch - Synchronized to value:", localValue.value);
      }
    }
  }
}, { immediate: true });

// Synchronize Flicking position with selected value
const syncFlickingToValue = async () => {
  if (!flickingInstance.value) {
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 WhatIsYourGoal: syncFlickingToValue - instance not available");
    }
    return;
  }

  const targetIndex = options.findIndex(opt => opt.value === localValue.value);
  if (targetIndex < 0) {
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ WhatIsYourGoal: targetIndex not found for value:", localValue.value);
    }
    return;
  }

  try {
    // Get the actual Flicking instance (might be wrapped in Vue component)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const flicking = (flickingInstance.value as any)?.flicking || flickingInstance.value;

    // Check if moveTo method exists
    if (typeof flicking?.moveTo !== "function") {
      if (process.env.NODE_ENV === "development") {
        console.warn("⚠️ WhatIsYourGoal: moveTo method not found on Flicking instance", flicking);
      }
      return;
    }

    // Use moveTo to synchronize position without animation (duration: 0)
    // Use requestAnimationFrame to ensure DOM is ready
    await new Promise(resolve => requestAnimationFrame(resolve));
    flicking.moveTo(targetIndex, 0);

    if (process.env.NODE_ENV === "development") {
      console.log("🔍 WhatIsYourGoal: Synchronized Flicking to index", targetIndex, "for value", localValue.value);
    }
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.warn("⚠️ WhatIsYourGoal: Error synchronizing Flicking:", error);
    }
  }
};

// Watch for changes to modelValue prop and update localValue immediately (but only if different)
// IMPORTANT: We don't sync Flicking here on initial mount if value is already correct
// This prevents animation when returning to the page
watch(() => props.modelValue, async (newVal, oldVal) => {
  // Skip if this is the initial watch call (oldVal is undefined) and value matches
  if (oldVal === undefined && newVal === localValue.value) {
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 WhatIsYourGoal: Initial watch skipped - value already matches:", newVal);
    }
    return;
  }

  if (newVal !== null && newVal !== undefined && newVal !== localValue.value) {
    localValue.value = newVal;
    if (process.env.NODE_ENV === "development") {
      console.log("🔍 WhatIsYourGoal: modelValue prop changed, updating localValue to:", newVal);
    }
    // Only sync Flicking if it's ready (not on initial mount if value is correct)
    if (isFlickingReady.value) {
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 50));
      await syncFlickingToValue();
    }
  } else if (newVal === null || newVal === undefined) {
    // If modelValue is null/undefined, default to "dream"
    if (localValue.value !== "dream") {
      localValue.value = "dream";
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 WhatIsYourGoal: modelValue is null, defaulting to dream");
      }
      // Only sync Flicking if it's ready
      if (isFlickingReady.value) {
        await nextTick();
        await new Promise(resolve => setTimeout(resolve, 50));
        await syncFlickingToValue();
      }
    }
  }
}, { immediate: true });

const progressWidth = computed(() => {
  return `${props.progress ?? 40}%`;
});

const title = computed(() => props.title ?? "the post will be about");
const nextButtonLabel = computed(() => props.nextButtonLabel ?? "NEXT STEP");

const handleSearch = () => {
  emit("search");
};

// Flicking options - problem first (top), dream second (middle), idea third (bottom)
const options = [
  { id: 1, title: "Problem", value: "problem" as const },
  { id: 2, title: "Dream", value: "dream" as const },
  { id: 3, title: "Idea", value: "idea" as const }
];

const flickingOptions = computed(() => {
  // Default to dream (index 1) if no value set or if value is null/undefined
  let defaultIdx = 1; // dream is default (index 1)
  if (localValue.value === "problem") {
    defaultIdx = 0;
  } else if (localValue.value === "dream") {
    defaultIdx = 1;
  } else if (localValue.value === "idea") {
    defaultIdx = 2;
  }
  // If localValue is null/undefined, defaultIdx stays 1 (dream)

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
  localValue.value = selectedOption.value;
  emit("update:modelValue", localValue.value);
};

// Handle Flicking ready event - synchronize position when component is ready
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleFlickingReady = async (e: any) => {
  // The @ready event passes the Flicking instance directly
  // Store it for later use
  if (e) {
    // Check if it's the Flicking instance or a wrapper
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = (e as any).flicking || e;
    if (instance && typeof instance.moveTo === "function") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      flickingInstance.value = instance as any;
      isFlickingReady.value = true;

      // Wait for next tick and a small delay to ensure Flicking is fully initialized
      await nextTick();
      await new Promise(resolve => setTimeout(resolve, 150));

      // Synchronize position with current value
      await syncFlickingToValue();

      if (process.env.NODE_ENV === "development") {
        console.log("🔍 WhatIsYourGoal: Flicking ready, synchronized to value:", localValue.value);
      }
    }
  }
};

// Also synchronize on mount (in case @ready event doesn't fire or component is re-mounted)
onMounted(async () => {
  // Wait for Flicking to initialize - use multiple delays to ensure it's ready
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 100));
  await nextTick();
  await new Promise(resolve => setTimeout(resolve, 100));

  // Try to get Flicking instance from ref
  if (flickingInstance.value) {
    // Check if it's a Vue component wrapper
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const instance = (flickingInstance.value as any)?.flicking || flickingInstance.value;
    if (instance && typeof instance.moveTo === "function") {
      isFlickingReady.value = true;
      await syncFlickingToValue();
      if (process.env.NODE_ENV === "development") {
        console.log("🔍 WhatIsYourGoal: onMounted - Synchronized to value:", localValue.value);
      }
    }
  }
});

const currentInfo = computed(() => {
  return goalInfo[localValue.value] || goalInfo.dream;
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

const handleNext = () => {
  if (process.env.NODE_ENV === "development") {
    console.log("🔍 WhatIsYourGoal: handleNext called - before emit", {
      localValue: localValue.value,
      modelValue: props.modelValue
    });
  }

  // Always emit update:modelValue first
  emit("update:modelValue", localValue.value);

  if (process.env.NODE_ENV === "development") {
    console.log("🔍 WhatIsYourGoal: handleNext - after emit update:modelValue, emitting next event");
  }

  // Then emit next event
  emit("next");

  if (process.env.NODE_ENV === "development") {
    console.log("🔍 WhatIsYourGoal: handleNext - next event emitted");
  }
};
</script>

<style lang="scss" scoped>
.whatIsYourGoal {
  width: 100%;
  max-width: 390px;
  height: 100vh;
  display: flex;
  flex-direction: column;
  padding: 24px 20px 40px;
  margin: 0 auto;
  background: radial-gradient(circle at top, #0b001c 0%, #05000e 40%, #010006 100%);
  overflow: hidden;
  position: relative;

  // When used in filters (hide-header and hide-footer), remove padding and background
  &.whatIsYourGoal--filter-mode {
    padding: 0;
    margin: 0;
    background: transparent;
    height: 100%;
    max-width: 100%;
  }
}

.goal-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  flex-shrink: 0;
  position: relative;
}

.goal-backBtn {
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

.goal-progress {
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

.goal-progress_fill {
  display: block;
  height: 100%;
  background: #BD0043;
  transition: width 0.3s ease;
}

.goal-content {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 0;
  min-height: 0;
  overflow: hidden;
  position: relative;

  // In filter mode, content should fill available space
  .whatIsYourGoal--filter-mode & {
    flex: 1;
    width: 100%;
  }
}

.goal-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 20px 0;
  text-align: center;
  flex-shrink: 0;
  line-height: 1.2;
}

.goal-carousel-wrapper {
  position: relative;
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  margin: 0;
}

.goal-flicking {
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

.goal-option {
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
  &:not(.is-active) .goal-icon {
    opacity: 0.1;
  }
}

.goal-content-wrapper {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0;
  position: relative;
  width: 100%;
  height: 100%;
}

.goal-icon {
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

  .goal-option.is-active & {
    opacity: 1;
    transform: scale(1.1);
  }
}

.goal-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(189, 0, 67, 0.5));
}

.goal-helpBtn {
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

.goal-instruction {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 20px 0;
  text-align: center;
  flex-shrink: 0;
}

.goal-actions {
  display: flex;
  flex-direction: column;
  gap: 10px;
  width: 100%;
  flex-shrink: 0;
}

.goal-searchBtn {
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

.goal-nextBtn {
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

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &:not(:disabled):hover {
    transform: translateY(-2px);
    box-shadow: 0 12px 32px rgba(189, 0, 67, 0.4);
  }
}

.goal-nextBtn-single {
  margin-top: 0;
}
</style>
