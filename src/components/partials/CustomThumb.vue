<template>
  <div class="star-range-slider">
    <div class="karmaValueContainer">
      <div v-if="props.review" class="ratingSection">
        <span class="ratingValue" role="textbox">{{ sliderValue }} %</span>
      </div>
      <q-input
        v-if="!props.review"
        class="sliderValue"
        v-model="sliderValue"
        borderless
        dark
        hide-bottom-space
        bottom-slots
        pattern="\d*"
      >
        <template v-slot:append>
          <q-icon name="img:/icons/karma-icon.svg" />
        </template>
      </q-input>
    </div>
    <q-slider
      v-model="sliderValue"
      :min="0"
      :max="props.userKarma"
      track-color="brand"
      :inner-max="props.userKarma"
      :step="1"
      :disable="false"
      :disable-drag-value="false"
      @update:model-value="(val) => { sliderValue = val; emit('update:modelValue', val); }"
    />
  </div>
</template>

<script lang="ts" setup>
import { ref, defineProps, watch, defineEmits } from "vue";

const sliderValue = ref(0);

interface Props {
  userKarma: number;
  maxValue: number;
  review: boolean;
  modelValue?: number;
}

const props: Props = defineProps({
  userKarma: {
    type: Number,
    required: true
  },
  maxValue: {
    type: Number,
    required: true
  },
  review: {
    type: Boolean,
    required: true
  },
  modelValue: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits<{
  "update:modelValue": [value: number];
}>();

// Sync s modelValue prop
watch(() => props.modelValue, (newVal) => {
  if (newVal !== undefined && newVal !== sliderValue.value) {
    sliderValue.value = newVal;
  }
}, { immediate: true });

watch(sliderValue, (newVal) => {
  if (newVal > props.userKarma) {
    sliderValue.value = props.userKarma;
  }
  if (newVal < 0) {
    sliderValue.value = 0;
  }
  // Emit hodnotu
  emit("update:modelValue", sliderValue.value);
}, { flush: "sync" });
</script>

<style lang="scss">
.karmaValueContainer {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  justify-content: end;
  margin-bottom: 0.5rem;

  * {
    color: $primary !important;
  }
  img {
    height: 1.2rem;
  }
  .sliderValue {
    color: $primary !important;
    font-family: poppinsBold;
    font-size: 1rem;
    height: 2rem;
    padding-left: 3rem;
    width: 60%; /* Set the input width to 100% */
    max-width: none; /* Disable the max-width property */
    resize: horizontal; /* Enable horizontal resizing */
    .q-field__control {
      padding-right: 0;
    }
    .q-field__native {
      text-align: end !important;
    }
    .q-field__append {
      padding-left: 0.3rem !important;
    }
  }
  .ratingValue {
    color: $primary !important;
    font-family: poppinsBold;
    font-size: 1rem;
  }
}
.ratingSection {
  display: flex;
  align-items: center;
  justify-content: center;
}

.q-slider__thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 22px !important;
  height: 30px !important;
  background: url("/icons/sliderHand.svg");
  filter: contrast(1);
  background-size: auto;
  background-repeat: no-repeat;
  cursor: grab !important;
  touch-action: pan-x !important;
  pointer-events: auto !important;
  user-select: none;
  -webkit-user-select: none;
  transition: transform 0.01s ease-out, left 0s linear !important;
  will-change: transform, left;
}

.q-slider__thumb:active {
  cursor: grabbing !important;
  transform: scale(1.1);
  transition: transform 0.01s ease-out !important;
}

.q-slider__track-container {
  cursor: pointer !important;
  touch-action: pan-x !important;
  -webkit-tap-highlight-color: transparent;
}

.q-slider__thumb-shape {
  display: none;
}
.q-slider__track {
  height: 0.6rem !important;
  cursor: pointer !important;
  touch-action: pan-x !important;
  -webkit-tap-highlight-color: transparent;
}

// Improve slider responsiveness
:deep(.q-slider) {
  touch-action: pan-x !important;
  -webkit-tap-highlight-color: transparent;
  transition: none !important;

  .q-slider__track-container {
    touch-action: pan-x !important;
    transition: none !important;
  }

  .q-slider__thumb-container {
    touch-action: pan-x !important;
    transition: left 0s linear !important;
    will-change: left;
  }

  .q-slider__track {
    transition: width 0s linear !important;
    will-change: width;
  }

  .q-slider__track-fill {
    transition: width 0s linear !important;
    will-change: width;
  }
}

.bg-brand {
  background: #bd004280 !important;
}
</style>
