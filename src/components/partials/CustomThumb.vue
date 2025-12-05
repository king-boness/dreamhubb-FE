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
      snap
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
  // Emit hodnotu
  emit("update:modelValue", sliderValue.value);
});
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
  touch-action: none !important;
  pointer-events: auto !important;
  user-select: none;
  -webkit-user-select: none;
}

.q-slider__thumb:active {
  cursor: grabbing !important;
}

.q-slider__track-container {
  cursor: pointer !important;
  touch-action: none !important;
}

.q-slider__thumb-shape {
  display: none;
}
.q-slider__track {
  height: 0.6rem !important;
  cursor: pointer !important;
  touch-action: none !important;
}

.bg-brand {
  background: #bd004280 !important;
}
</style>
