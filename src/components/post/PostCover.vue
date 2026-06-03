<template>
  <div class="dhPostCover" :class="rootClasses" aria-hidden="true">
    <PostImagesCarousel
      v-if="hasCoverImage"
      class="dhPostCover-media"
      :images="images"
      :auto-slide="autoSlide"
      :show-progress="showProgress"
      :show-arrows="showArrows"
      :show-dots="showDots"
      :alt="alt"
      :progress-context="progressContext"
      :image-style="imageStyle"
      @image-click="$emit('image-click', $event)"
    />

    <div v-else class="dhPostCover-fallback">
      <div v-if="watermarkLabel" class="dhPostCover-watermark">{{ watermarkLabel }}</div>
      <div v-if="iconUrl" class="dhPostCover-fallbackIcon" :class="iconClasses" aria-hidden="true">
        <img :src="iconUrl" alt="" />
      </div>
      <div class="dhPostCover-fallbackOverlay" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import PostImagesCarousel from "src/components/post/PostImagesCarousel.vue";

type PostType = "dream" | "problem" | "idea";

interface Props {
  images?: string[] | null;
  alt?: string;
  postType?: PostType | string | null;
  iconUrl?: string | null;
  iconPlacement?: "corner" | "center";
  fill?: boolean;
  autoSlide?: boolean;
  showProgress?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
  imageStyle?: Record<string, string>;
  progressContext?: "feed" | "detail";
}

const props = withDefaults(defineProps<Props>(), {
  images: () => [],
  alt: "Post image",
  postType: null,
  iconUrl: null,
  iconPlacement: "corner",
  fill: true,
  autoSlide: true,
  showProgress: true,
  showArrows: true,
  showDots: true,
  imageStyle: () => ({}),
  progressContext: "feed"
});

defineEmits<{
  "image-click": [index: number];
}>();

const hasCoverImage = computed(() => Array.isArray(props.images) && props.images.length > 0);

const normalizedType = computed<PostType | null>(() => {
  const raw = typeof props.postType === "string" ? props.postType.toLowerCase().trim() : "";
  if (raw === "dream" || raw === "problem" || raw === "idea") return raw;
  return null;
});

const watermarkLabel = computed(() => {
  const t = normalizedType.value;
  return t || "";
});

const rootClasses = computed(() => {
  const classes: Record<string, boolean> = {
    "dhPostCover--fill": props.fill === true
  };
  if (normalizedType.value) {
    classes[`dhPostCover--${normalizedType.value}`] = true;
  } else {
    classes["dhPostCover--generic"] = true;
  }
  return classes;
});

const iconClasses = computed(() => ({
  "dhPostCover-fallbackIcon--corner": props.iconPlacement === "corner",
  "dhPostCover-fallbackIcon--center": props.iconPlacement === "center"
}));
</script>

<style scoped lang="scss">
.dhPostCover {
  width: 100%;
  height: 100%;
  border-radius: inherit;
  overflow: hidden;
}

.dhPostCover--fill {
  position: absolute;
  inset: 0;
}

.dhPostCover-media {
  width: 100%;
  height: 100%;
}

.dhPostCover-fallback {
  position: absolute;
  inset: 0;
  border-radius: inherit;
  overflow: hidden;

  // Premium dark gradient + subtle glow/noise (CSS-only, no assets)
  background-image:
    radial-gradient(800px 420px at 18% 18%, rgba(189, 0, 67, 0.18), rgba(0, 0, 0, 0) 60%),
    radial-gradient(760px 420px at 82% 22%, rgba(142, 68, 255, 0.16), rgba(0, 0, 0, 0) 62%),
    radial-gradient(860px 520px at 60% 92%, rgba(255, 0, 122, 0.12), rgba(0, 0, 0, 0) 62%),
    linear-gradient(135deg, #05040a 0%, #141021 42%, #0a0711 100%);
}

.dhPostCover-fallback::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.06;
  background-image:
    repeating-radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.22) 0 1px, rgba(0, 0, 0, 0) 1px 6px),
    repeating-linear-gradient(135deg, rgba(255, 255, 255, 0.12) 0 1px, rgba(0, 0, 0, 0) 1px 10px);
  mix-blend-mode: overlay;
  pointer-events: none;
}

.dhPostCover-fallbackOverlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(
    to bottom,
    rgba(0, 0, 0, 0.10) 0%,
    rgba(0, 0, 0, 0.28) 35%,
    rgba(0, 0, 0, 0.45) 100%
  );
  pointer-events: none;
}

.dhPostCover-watermark {
  position: absolute;
  left: 50%;
  top: 56%;
  transform: translate(-50%, -50%);
  font-family: poppinsSemiBold;
  font-size: clamp(2.4rem, 9vw, 4.4rem);
  letter-spacing: 0.02em;
  text-transform: lowercase;
  color: rgba(255, 255, 255, 0.12);
  white-space: nowrap;
  pointer-events: none;
  user-select: none;
  filter: blur(0.2px);
}

.dhPostCover-fallbackIcon {
  position: absolute;
  width: 44px;
  height: 44px;
  opacity: 0.16;
  pointer-events: none;

  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
    filter: drop-shadow(0 10px 20px rgba(0, 0, 0, 0.55));
  }
}

.dhPostCover-fallbackIcon--corner {
  top: 14px;
  right: 14px;
}

.dhPostCover-fallbackIcon--center {
  left: 50%;
  top: 46%;
  transform: translate(-50%, -50%);
  width: 88px;
  height: 88px;
  opacity: 0.22;

  img {
    filter: drop-shadow(0 18px 34px rgba(0, 0, 0, 0.70));
  }
}

/* Type variants (subtle differences) */
.dhPostCover--problem .dhPostCover-fallback {
  background-image:
    radial-gradient(860px 520px at 16% 20%, rgba(255, 0, 122, 0.20), rgba(0, 0, 0, 0) 60%),
    radial-gradient(760px 460px at 84% 26%, rgba(189, 0, 67, 0.18), rgba(0, 0, 0, 0) 62%),
    radial-gradient(880px 560px at 55% 92%, rgba(142, 68, 255, 0.14), rgba(0, 0, 0, 0) 62%),
    linear-gradient(135deg, #07030a 0%, #1b0b1b 45%, #07030a 100%);
}

.dhPostCover--dream .dhPostCover-fallback {
  background-image:
    radial-gradient(860px 520px at 18% 18%, rgba(142, 68, 255, 0.18), rgba(0, 0, 0, 0) 60%),
    radial-gradient(760px 460px at 82% 22%, rgba(189, 0, 67, 0.16), rgba(0, 0, 0, 0) 62%),
    radial-gradient(880px 560px at 58% 92%, rgba(255, 0, 122, 0.10), rgba(0, 0, 0, 0) 62%),
    linear-gradient(135deg, #05040a 0%, #121028 42%, #07030a 100%);
}

.dhPostCover--idea .dhPostCover-fallback {
  background-image:
    radial-gradient(860px 520px at 20% 20%, rgba(255, 0, 122, 0.16), rgba(0, 0, 0, 0) 60%),
    radial-gradient(760px 460px at 84% 18%, rgba(142, 68, 255, 0.18), rgba(0, 0, 0, 0) 62%),
    radial-gradient(880px 560px at 58% 92%, rgba(189, 0, 67, 0.10), rgba(0, 0, 0, 0) 62%),
    linear-gradient(135deg, #05040a 0%, #101322 44%, #06020a 100%);
}
</style>
