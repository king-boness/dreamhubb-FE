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

        <!-- Flicking carousel -->
        <div class="dream-carousel-wrapper">
          <Flicking
            :options="flickingOptions"
            :plugins="flickingPlugins"
            @changed="handleFlickingChanged"
            class="dream-flicking"
          >
            <div
              v-for="category in categories"
              :key="category.id"
              class="dream-option"
              :class="{ 'is-active': localValue === category.id }"
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
            </div>
          </Flicking>

          <button class="dream-helpBtn" @click="handleInfoClick">
            <q-icon name="help_outline" />
          </button>
        </div>

        <p class="dream-instruction">choose by swiping up or down</p>
      </div>
    </template>
    <template v-else>
      <div class="dream-content">
        <!-- Flicking carousel -->
      <div class="dream-carousel-wrapper">
        <Flicking
          :options="flickingOptions"
          :plugins="flickingPlugins"
          @changed="handleFlickingChanged"
          class="dream-flicking"
        >
          <div
            v-for="category in categories"
            :key="category.id"
            class="dream-option"
            :class="{ 'is-active': localValue === category.id }"
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
          </div>
        </Flicking>

        <button class="dream-helpBtn" @click="handleInfoClick">
          <q-icon name="help_outline" />
        </button>
      </div>
      </div>
    </template>

    <!-- Action buttons (hidden if hideFooter is true) -->
    <template v-if="!hideFooter">
      <div class="dream-actions" v-if="showSearchButton">
        <button class="dream-searchBtn" @click="handleSearch">SEARCH</button>
        <button class="dream-nextBtn" @click="handleNext">{{ nextButtonLabel }}</button>
      </div>
      <button v-else class="dream-nextBtn dream-nextBtn-single" @click="handleNext">{{ nextButtonLabel }}</button>
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
import { ref, computed } from "vue";
import { Fade, Perspective } from "@egjs/flicking-plugins";
import Flicking from "@egjs/vue3-flicking";
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
}>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
  next: [];
  back: [];
  search: [];
}>();

const categories: Category[] = [
  { id: "traveling", label: "traveling", icon: "public", iconFile: "traveling" },
  { id: "health", label: "health", icon: "local_hospital", iconFile: "health" },
  { id: "possessions", label: "possesions", icon: "home", iconFile: "possesions" },
  { id: "relationships", label: "relationships", icon: "favorite", iconFile: "relationships" },
  { id: "learning", label: "learning", icon: "school", iconFile: "learning" },
  { id: "events", label: "events", icon: "event", iconFile: "events" },
  { id: "profession", label: "profession", icon: "work", iconFile: "proffesion" },
  { id: "other", label: "other", icon: "more_horiz", iconFile: "other" }
];

const localValue = ref<string>(props.modelValue || categories[0].id);
const showInfoModal = ref(false);

const progressWidth = computed(() => {
  return `${props.progress ?? 60}%`;
});

const title = computed(() => props.title ?? "from category");
const nextButtonLabel = computed(() => props.nextButtonLabel ?? "NEXT STEP");

const handleSearch = () => {
  emit("search");
};

const currentCategory = computed(() => {
  return categories.find(cat => cat.id === localValue.value) || categories[0];
});

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

const flickingOptions = computed(() => {
  const defaultIdx = categories.findIndex(cat => cat.id === localValue.value);
  return {
    horizontal: false, // Vertical scrolling
    inputType: ["mouse", "touch", "pointer"],
    defaultIndex: defaultIdx >= 0 ? defaultIdx : 0,
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
  const selectedCategory = categories[e.index];
  localValue.value = selectedCategory.id;
  emit("update:modelValue", localValue.value);
};

const handleInfoClick = () => {
  showInfoModal.value = true;
};

const handleInfoCta = () => {
  // User confirmed their choice, proceed to next step
  handleNext();
};

const handleNext = () => {
  emit("update:modelValue", localValue.value);
  emit("next");
};
</script>

<style lang="scss" scoped>
.whatKindOfDream {
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
  &.whatKindOfDream--filter-mode {
    padding: 0;
    margin: 0;
    background: transparent;
    height: 100%;
    max-width: 100%;
  }
}

.dream-header {
  display: flex;
  align-items: flex-start;
  gap: 16px;
  margin-bottom: 20px;
  flex-shrink: 0;
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
  flex: 1;
  height: 4px;
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
  overflow: hidden;
  position: relative;

  // In filter mode, content should fill available space
  .whatKindOfDream--filter-mode & {
    flex: 1;
    width: 100%;
  }
}

.dream-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 20px 0;
  text-align: center;
  flex-shrink: 0;
  line-height: 1.2;
}

.dream-carousel-wrapper {
  position: relative;
  width: 100%;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 0;
  margin: 0;
}

.dream-flicking {
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

.dream-option {
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
  &:not(.is-active) .dream-icon {
    opacity: 0.1;
  }
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
}

.dream-icon {
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

  .dream-option.is-active & {
    opacity: 1;
    transform: scale(1.1);
  }
}

.dream-icon-img {
  width: 100%;
  height: 100%;
  object-fit: contain;
  filter: drop-shadow(0 0 20px rgba(189, 0, 67, 0.5));
}

.dream-helpBtn {
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

.dream-instruction {
  font-size: 0.875rem;
  color: rgba(255, 255, 255, 0.6);
  margin: 0 0 20px 0;
  text-align: center;
  flex-shrink: 0;
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
