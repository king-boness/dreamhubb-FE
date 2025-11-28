<template>
  <!-- Flicking slider -->
  <div class="flicking-wrapper">
    <Flicking
      :options="flickingOptions"
      :defaultIndex="selectedImageIndex"
      @ready="onFlickingReady"
      @changed="(e) => {
        selectedImageIndex = e.index;
        emit('index-change', e.index);
      }"
    >
      <div
        v-for="(img, index) in finalImages"
        :key="index"
        class="flicking-panel slider-panel"
      >
        <img
          :src="img"
          class="slider-image"
          loading="lazy"
          @click="emit('image-click', index)"
          style="cursor: pointer;"
        />
      </div>
    </Flicking>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";
import { ref, computed, defineProps, PropType, watch } from "vue";
import Flicking from "@egjs/vue3-flicking";

const $q = useQuasar();

const props = defineProps({
  images: {
    type: Array as PropType<string[]>,
    required: true
  },
  currentIndex: {
    type: Number,
    default: 0
  }
});

const emit = defineEmits<{
  "index-change": [index: number];
  "image-click": [index: number];
}>();

// --------------------------------------------------
// 🛡 Sanitizácia obrázkov
// --------------------------------------------------
const finalImages = computed(() => {
  if (!props.images || !Array.isArray(props.images)) {
    return ["/images/Auth/postBackground.png"];
  }

  const clean = props.images.filter(
    (img) =>
      img &&
      typeof img === "string" &&
      img !== "NULL" &&
      img !== "{NULL}" &&
      img.trim() !== ""
  );

  return clean.length > 0 ? clean : ["/images/Auth/postBackground.png"];
});

// --------------------------------------------------
// 🔢 Slider index
// --------------------------------------------------
const selectedImageIndex = ref(props.currentIndex);

// Watch for external index changes and update Flicking
let flickingInstance: any = null;

watch(() => props.currentIndex, (newIndex) => {
  if (selectedImageIndex.value !== newIndex && flickingInstance) {
    try {
      // Check if moveTo method exists before calling
      if (typeof flickingInstance.moveTo === "function") {
        selectedImageIndex.value = newIndex;
        flickingInstance.moveTo(newIndex, 0);
      } else {
        // If moveTo doesn't exist, just update the index
        selectedImageIndex.value = newIndex;
      }
    } catch (error) {
      // Flicking instance might not be ready yet, ignore
      if (process.env.NODE_ENV === "development") {
        console.warn("Error updating Flicking index:", error);
      }
    }
  }
}, { flush: "post" });

// Expose method to get Flicking instance
const onFlickingReady = (e: any) => {
  flickingInstance = e;
};

// --------------------------------------------------
// ⚙️ Flicking konfigurácia
// --------------------------------------------------
const flickingOptions = {
  inputType: ["mouse", "touch", "pointer"],
  defaultIndex: 0,
  align: "center",
  bounce: 30,
  duration: 180,
  circular: false
};
</script>

<style scoped lang="scss">
/* ---------------------------------------------
   Slider viewport
--------------------------------------------- */
.flicking-wrapper {
  width: 100%;
  height: 100%;
  overflow: hidden;
  position: relative;
}

.slider-panel {
  width: 100%;
  height: 100%;
}

.slider-image {
  width: 100%;
  height: 100%;
  object-fit: cover;  /* 🔥 Najdôležitejšie — žiadne deformácie */
  object-position: center top;
  display: block;
  animation: fadeIn 0.35s ease;
}

@keyframes fadeIn {
  from { opacity: 0; }
  to { opacity: 1; }
}
</style>
