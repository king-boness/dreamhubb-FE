<template>
  <!-- Flicking slider -->
  <!-- [B2] CRITICAL: Only render Flicking when we have valid images AND first image is loaded -->
  <!-- This prevents Flicking.js from trying to access panels before images are in DOM -->
  <div v-if="finalImages.length > 0" class="flicking-wrapper">
    <!-- [B2] Show placeholder while images are loading -->
    <div v-if="!imagesReady" class="flicking-loading-placeholder" style="width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; background: rgba(0,0,0,0.3);">
      <img
        v-if="finalImages[0]"
        :src="finalImages[0]"
        :alt="'Loading image'"
        style="width: 100%; height: 100%; object-fit: cover; opacity: 0.5;"
        @load="handleImageLoad(finalImages[0])"
        @error="handleImageError(finalImages[0], $event)"
      />
    </div>
    <!-- [B2] CRITICAL: Only render Flicking when first image is loaded -->
    <!-- This prevents Flicking.js from trying to access panels before images are in DOM -->
    <Flicking
      v-else-if="finalImages.length > 0 && finalImages[0] && finalImages.every(img => img && typeof img === 'string') && imagesReady"
      :key="`flicking-${finalImages.length}-${finalImages[0] || ''}-${loadedImages.size}`"
      :options="flickingOptions"
      :defaultIndex="selectedImageIndex"
      @ready="onFlickingReady"
      @changed="handleFlickingChanged"
      @error="handleFlickingError"
    >
      <!-- [B4] Stable key for slides: use image URL if available, fallback to index -->
      <!-- [B2] CRITICAL: Key must be on the actual DOM element, not on template -->
      <!-- [B2] Use validImages computed to avoid v-for with v-if -->
      <div
        v-for="(img, index) in validImages"
        :key="img ? `panel-${index}-${img}` : `panel-${index}`"
        class="flicking-panel slider-panel"
      >
          <img
            :src="img"
            :alt="`Image ${index + 1}`"
            class="slider-image"
            :loading="index === 0 ? 'eager' : 'lazy'"
            @click="emit('image-click', index)"
            @error="handleImageError(img, $event)"
            @load="handleImageLoad(img)"
            style="cursor: pointer;"
          />
      </div>
    </Flicking>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, PropType, watch, nextTick, onBeforeUnmount } from "vue";
import Flicking from "@egjs/vue3-flicking";

const props = defineProps({
  images: {
    type: Array as PropType<string[]>,
    default: () => [] // dôležité - nikdy nie undefined/null
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
// 🛡 Sanitizácia obrázkov - safe vstupy
// --------------------------------------------------
// Safe images computed - vždy vráti pole, nikdy null/undefined
const safeImages = computed<string[]>(() => {
  return Array.isArray(props.images) ? props.images : [];
});

const finalImages = computed(() => {
  if (process.env.NODE_ENV === "development") {
    console.log("🖼️ ImageIndexSlider - props.images:", props.images);
    console.log("🖼️ ImageIndexSlider - safeImages:", safeImages.value);
  }

  // safeImages je vždy pole, ale môže byť prázdne
  if (safeImages.value.length === 0) {
    if (process.env.NODE_ENV === "development") {
      console.log("🖼️ ImageIndexSlider - no images, using fallback");
    }
    return ["/images/Auth/postBackground.png"];
  }

  const clean = safeImages.value.filter(
    (img) =>
      img &&
      typeof img === "string" &&
      img !== "NULL" &&
      img !== "{NULL}" &&
      img.trim() !== ""
  );

  if (process.env.NODE_ENV === "development") {
    console.log("🖼️ ImageIndexSlider - cleaned images:", clean);
  }

  return clean.length > 0 ? clean : ["/images/Auth/postBackground.png"];
});

// [B2] Computed property for valid images only (for v-for without v-if)
// This avoids ESLint error: "You should not mix 'v-for' with 'v-if'"
const validImages = computed(() => {
  return finalImages.value.filter((img) => img && typeof img === "string");
});

// --------------------------------------------------
// 🔢 Slider index
// --------------------------------------------------
const selectedImageIndex = ref(0);
const isFlickingReady = ref(false);
// [B2] Track loaded images to prevent Flicking from initializing before images are ready
const loadedImages = ref<Set<string>>(new Set());
const imagesReady = computed(() => {
  // At least the first image must be loaded before initializing Flicking
  if (finalImages.value.length === 0) return false;
  const firstImage = finalImages.value[0];
  if (!firstImage || typeof firstImage !== "string") return false;
  return loadedImages.value.has(firstImage);
});

// [B1-B2] Watch for external index changes and update Flicking
// [B2] Guard: flickingInstance is initialized as null and checked before every access
// eslint-disable-next-line @typescript-eslint/no-explicit-any
let flickingInstance: any = null;

// Reset index and ready state when images change
// Use async with nextTick to prevent errors when component is unmounting
// [B3] CRITICAL: This watcher must not access flickingInstance to prevent errors
watch(() => finalImages.value, async () => {
  await nextTick();
  // Guard: only update if component is still mounted
  selectedImageIndex.value = 0;
  isFlickingReady.value = false;
  // [B2] Reset loaded images when images change
  loadedImages.value.clear();
  // [B2] Reset instance WITHOUT accessing panels - let onFlickingReady handle setup
  flickingInstance = null;

  // [B2] Pre-load first image immediately to trigger imagesReady
  if (finalImages.value.length > 0 && finalImages.value[0]) {
    const firstImg = finalImages.value[0];
    if (typeof firstImg === "string") {
      // Create a temporary image element to preload
      const img = new Image();
      img.onload = () => {
        loadedImages.value.add(firstImg);
        // Reduce console noise - only log if needed for debugging
        // if (process.env.NODE_ENV === "development") {
        //   console.log("🖼️ First image preloaded (watcher):", firstImg);
        // }
      };
      img.onerror = () => {
        if (process.env.NODE_ENV === "development") {
          console.warn("🖼️ First image failed to preload (watcher):", firstImg);
        }
      };
      img.src = firstImg;
    }
  }
}, { immediate: true });

watch(() => props.currentIndex, (newIndex) => {
  // Only update if index actually changed and instance exists
  if (selectedImageIndex.value === newIndex || !flickingInstance) {
    if (!flickingInstance && newIndex !== selectedImageIndex.value) {
      // Update index even if instance is not ready yet
      selectedImageIndex.value = newIndex;
    }
    return;
  }

  try {
    // Double-check instance is still valid before accessing
    if (!flickingInstance || typeof flickingInstance !== "object") {
      flickingInstance = null;
      selectedImageIndex.value = newIndex;
      return;
    }

    // Check if panels exist and are valid
    if (!("panels" in flickingInstance)) {
      flickingInstance = null;
      selectedImageIndex.value = newIndex;
      return;
    }

    // [B2] Guard: Check panels exist and are valid before accessing
    const panels = flickingInstance.panels;
    if (!panels || !Array.isArray(panels) || panels.length === 0) {
      flickingInstance = null;
      selectedImageIndex.value = newIndex;
      return;
    }

    // Check if moveTo method exists
    if (typeof flickingInstance.moveTo !== "function") {
      flickingInstance = null;
      selectedImageIndex.value = newIndex;
      return;
    }

    // All checks passed - safe to call moveTo
    selectedImageIndex.value = newIndex;
    flickingInstance.moveTo(newIndex, 0);
  } catch (error) {
    // Flicking instance might not be ready yet, ignore
    if (process.env.NODE_ENV === "development") {
      console.warn("🖼️ ImageIndexSlider - Error updating Flicking index:", error);
    }
    // Reset instance on error
    flickingInstance = null;
    // Still update the index
    selectedImageIndex.value = newIndex;
  }
}, { flush: "post" });

// [B3] Watch for images changes - reset Flicking instance if images change significantly
// [B3] Use nextTick and check for component existence to prevent errors when unmounted
// [B3] CRITICAL: This watcher must not access flickingInstance.panels directly
// because Flicking.js library may not have initialized panels yet
watch(() => props.images, async (newImages) => {
  // [B3] Wait for next tick to ensure component is still mounted
  await nextTick();

  if (process.env.NODE_ENV === "development") {
    console.log("🖼️ ImageIndexSlider - images prop changed:", newImages);
    console.log("🖼️ ImageIndexSlider - finalImages computed:", finalImages.value);
  }

  // Reset selected index when images change
  selectedImageIndex.value = 0;
  // [B2] Reset loaded images when images change
  loadedImages.value.clear();

  // [B2] CRITICAL: Reset flicking instance WITHOUT accessing panels
  // This prevents errors when Flicking.js tries to access panels that don't exist yet
  // We'll let onFlickingReady handle the instance setup when it's actually ready
  flickingInstance = null;
  isFlickingReady.value = false;
}, { immediate: true, deep: true });

// [B2] Expose method to get Flicking instance
// [B2] CRITICAL: This is the ONLY place where we safely access panels
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const onFlickingReady = async (e: any) => {
  // [B2] Wait for multiple ticks to ensure panels are fully initialized
  await nextTick();
  await nextTick();
  // [B2] Additional delay to ensure Flicking.js has fully initialized its internal state
  await new Promise(resolve => setTimeout(resolve, 100));

  try {
    // [B2] Check if instance is valid and has panels
    if (e && typeof e === "object" && e !== null) {
      // [B2] Try to access panels safely - this is the ONLY safe place to do it
      let hasPanels = false;
      let panels: unknown = null;
      try {
        if ("panels" in e) {
          panels = e.panels;
          hasPanels = panels !== null && panels !== undefined && Array.isArray(panels) && panels.length > 0;
        }
      } catch (err) {
        // [B2] If accessing panels throws error, instance is invalid
        if (process.env.NODE_ENV === "development") {
          console.warn("🖼️ ImageIndexSlider - Error accessing panels:", err);
        }
        flickingInstance = null;
        isFlickingReady.value = false;
        return;
      }

      if (hasPanels) {
        flickingInstance = e;
        isFlickingReady.value = true;
        // Only log in development if there's an actual issue
        if (process.env.NODE_ENV === "development" && Array.isArray(panels) && panels.length === 0) {
          console.warn("🖼️ ImageIndexSlider - Flicking instance ready but has 0 panels");
        }
      } else {
        // Only warn if this is unexpected (not during initial load)
        if (process.env.NODE_ENV === "development" && isFlickingReady.value) {
          console.warn("🖼️ ImageIndexSlider - Flicking instance lost panels:", e);
        }
        flickingInstance = null;
        isFlickingReady.value = false;
      }
    } else {
      // Only warn if this is unexpected
      if (process.env.NODE_ENV === "development" && isFlickingReady.value) {
        console.warn("🖼️ ImageIndexSlider - Flicking instance became invalid:", e);
      }
      flickingInstance = null;
      isFlickingReady.value = false;
    }
  } catch (error) {
    // [B2] Catch any errors during initialization
    if (process.env.NODE_ENV === "development") {
      console.error("🖼️ ImageIndexSlider - Error in onFlickingReady:", error);
    }
    flickingInstance = null;
    isFlickingReady.value = false;
  }
};

// Handle Flicking changed event
const handleFlickingChanged = (e: unknown) => {
  if (e && typeof e === "object" && "index" in e && typeof e.index === "number") {
    selectedImageIndex.value = e.index;
    emit("index-change", e.index);
  }
};

// [B2] Handle Flicking errors - catch panels errors from Flicking.js library
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const handleFlickingError = (error: any) => {
  if (process.env.NODE_ENV === "development") {
    console.warn("🖼️ ImageIndexSlider - Flicking error caught:", error);
  }
  // Reset instance on error
  flickingInstance = null;
  isFlickingReady.value = false;
};

// Handle image load events
// [B2] CRITICAL: Track when images are loaded so Flicking can initialize safely
const handleImageLoad = (img: string) => {
  // Mark this image as loaded
  loadedImages.value.add(img);
  // Only log first image load in development (reduce console noise)
  if (process.env.NODE_ENV === "development" && finalImages.value.length > 0 && img === finalImages.value[0]) {
    console.log("🖼️ First image loaded, Flicking can now initialize");
  }
};

const handleImageError = (img: string, event: Event) => {
  if (process.env.NODE_ENV === "development") {
    console.error("🖼️ Image load error:", img, event);
  }
};

// --------------------------------------------------
// ⚙️ Flicking konfigurácia
// --------------------------------------------------
const flickingOptions = computed(() => {
  // Ensure defaultIndex is always a valid number
  const defaultIdx = Number.isInteger(selectedImageIndex.value) && selectedImageIndex.value >= 0
    ? selectedImageIndex.value
    : 0;

  return {
    inputType: ["mouse", "touch", "pointer"] as string[],
    defaultIndex: defaultIdx,
    align: "center" as const,
    bounce: 30,
    duration: 180,
    circular: false,
    // Prevent errors when panels are not ready
    renderOnlyVisible: true
  };
});

// [B3] Cleanup on unmount - prevent memory leaks and errors
onBeforeUnmount(() => {
  // [B3] Reset instance to prevent access after unmount
  flickingInstance = null;
  isFlickingReady.value = false;
});
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
  background: #161616; // Ensure consistent background
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
