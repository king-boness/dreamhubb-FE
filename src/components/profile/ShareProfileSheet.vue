<template>
  <transition name="sheet-fade">
    <div
      v-if="modelValue"
      class="shareProfileSheet-backdrop"
      @click.self="closeSheet"
    >
      <div
        class="shareProfileSheet"
        :class="{ dragging: isDragging }"
        :style="{
          height: `${sheetHeight}px`
        }"
        @touchstart="onSheetTouchStart"
        @touchmove="onSheetTouchMove"
        @touchend="onSheetTouchEnd"
        @mousedown="onSheetMouseDown"
      >
        <div
          class="shareProfileSheet-handle"
          @touchstart.stop="onHandleTouchStart"
          @touchmove.stop="onHandleTouchMove"
          @touchend.stop="onHandleTouchEnd"
          @mousedown.stop="onHandleMouseDown"
        ></div>
        <h2 class="shareProfileSheet-title">{{ shareTitle }}</h2>

        <div class="shareProfileSheet-platforms">
          <button
            v-for="platform in platforms"
            :key="platform.name"
            class="shareProfileSheet-platformBtn"
            @click="shareOnPlatform(platform)"
          >
            <img
              :src="platform.icon"
              :alt="platform.name"
              class="shareProfileSheet-platformIcon"
            />
            <span class="shareProfileSheet-platformName">{{ platform.name }}</span>
          </button>
        </div>

        <button
          v-if="hasNativeShare"
          class="shareProfileSheet-btn shareProfileSheet-btn--native"
          @click="shareNative"
        >
          Share via Device
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, computed, watch, onBeforeUnmount } from "vue";
import { Notify } from "quasar";

interface Props {
  modelValue: boolean;
  profileUrl: string;
  profileTitle?: string;
  profileText?: string;
  postType?: "dream" | "problem" | "idea" | null; // For dynamic title based on post type
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  profileUrl: "",
  profileTitle: "Check out this profile on dreamhubb",
  profileText: "Check out this profile on dreamhubb",
  postType: null
});

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
}>();

const startY = ref(0);
const startHeight = ref(0);
const isDragging = ref(false);
const sheetHeight = ref(0);
const dragStartY = ref(0);
const hasMoved = ref(false);
const MIN_HEIGHT = 280; // Minimum height in pixels
const INITIAL_HEIGHT = 400; // Initial height when opening (higher than min)
const MAX_HEIGHT_PERCENT = 90; // 90% of viewport height
const DRAG_THRESHOLD = 60; // Threshold to close sheet when dragging down
const DRAG_START_THRESHOLD = 5; // Minimum movement to start dragging (prevents scroll interference)

// Calculate max height based on viewport
const maxHeight = computed(() => {
  return (window.innerHeight * MAX_HEIGHT_PERCENT) / 100;
});

// Clamp height between min and max
const clampHeight = (height: number) => {
  return Math.max(MIN_HEIGHT, Math.min(height, maxHeight.value));
};

// Hide/show footer when sheet opens/closes
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      document.body.classList.add("bottom-sheet-open");
      // Set to initial height when opening (higher than min)
      sheetHeight.value = INITIAL_HEIGHT;
    } else {
      document.body.classList.remove("bottom-sheet-open");
      sheetHeight.value = MIN_HEIGHT;
    }
  },
  { immediate: true }
);

const hasNativeShare = computed(() => {
  return typeof navigator !== "undefined" && !!navigator.share;
});

// Dynamic title based on post type or default to "Share Profile"
const shareTitle = computed(() => {
  if (props.postType === "dream") {
    return "share dream";
  } else if (props.postType === "problem") {
    return "share problem";
  } else if (props.postType === "idea") {
    return "share idea";
  }
  return "Share Profile";
});

const closeSheet = () => {
  emit("update:modelValue", false);
};

// Calculate snap point based on current height
const calculateSnapPoint = (currentHeight: number) => {
  const midPoint = (MIN_HEIGHT + maxHeight.value) / 2;
  if (currentHeight < midPoint) {
    return MIN_HEIGHT;
  } else {
    return maxHeight.value;
  }
};

// Touch handlers - handle area (always drag)
const onHandleTouchStart = (e: TouchEvent) => {
  e.stopPropagation();
  startY.value = e.touches[0].clientY;
  startHeight.value = sheetHeight.value;
  dragStartY.value = e.touches[0].clientY;
  hasMoved.value = false;
  isDragging.value = true;
  // Prevent default immediately on handle
  if (e.cancelable) {
    e.preventDefault();
  }
};

const onHandleTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return;
  e.stopPropagation();
  const currentY = e.touches[0].clientY;
  const deltaY = startY.value - currentY; // Inverted: up = positive delta
  const newHeight = clampHeight(startHeight.value + deltaY);
  sheetHeight.value = newHeight;
  if (e.cancelable) {
    e.preventDefault();
  }
};

const onHandleTouchEnd = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  hasMoved.value = false;

  // Check if dragged down enough to close
  const draggedDown = startHeight.value - sheetHeight.value > DRAG_THRESHOLD;
  if (draggedDown && sheetHeight.value <= MIN_HEIGHT) {
    closeSheet();
  } else {
    // Snap to nearest point
    sheetHeight.value = calculateSnapPoint(sheetHeight.value);
  }
};

// Touch handlers - entire sheet (smart drag detection)
const onSheetTouchStart = (e: TouchEvent) => {
  // Ignore if touch started on handle (handle has its own handler)
  if ((e.target as HTMLElement).closest(".shareProfileSheet-handle")) {
    return;
  }

  startY.value = e.touches[0].clientY;
  startHeight.value = sheetHeight.value;
  dragStartY.value = e.touches[0].clientY;
  hasMoved.value = false;
  // Don't prevent default yet - let scroll work if user wants to scroll
};

const onSheetTouchMove = (e: TouchEvent) => {
  // Ignore if touch started on handle
  if ((e.target as HTMLElement).closest(".shareProfileSheet-handle")) {
    return;
  }

  const currentY = e.touches[0].clientY;
  const verticalDelta = currentY - dragStartY.value;
  const absDelta = Math.abs(verticalDelta);
  const scrollContainer = (e.target as HTMLElement).closest(".shareProfileSheet-platforms");

  // If user hasn't moved much, don't start dragging yet (allow scroll)
  if (!hasMoved.value && absDelta < DRAG_START_THRESHOLD) {
    return;
  }

  // Check if user is trying to scroll content instead of dragging sheet
  if (scrollContainer) {
    const scrollTop = scrollContainer.scrollTop;
    const scrollHeight = scrollContainer.scrollHeight;
    const clientHeight = scrollContainer.clientHeight;
    const isAtTop = scrollTop === 0;
    const isAtBottom = scrollTop + clientHeight >= scrollHeight - 1; // Allow 1px tolerance

    // If scrolling down and not at top, or scrolling up and not at bottom, allow scroll
    if ((verticalDelta > 0 && !isAtTop) || (verticalDelta < 0 && !isAtBottom)) {
      // User is scrolling content, don't drag
      return;
    }
  }

  // Start dragging if movement is significant and not scrolling content
  if (!hasMoved.value) {
    hasMoved.value = true;
    isDragging.value = true;
  }

  if (isDragging.value) {
    const heightDelta = startY.value - currentY; // Inverted: up = positive delta
    const newHeight = clampHeight(startHeight.value + heightDelta);
    sheetHeight.value = newHeight;

    // Prevent default only when actually dragging
    if (e.cancelable) {
      e.preventDefault();
    }
  }
};

const onSheetTouchEnd = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  hasMoved.value = false;

  // Check if dragged down enough to close
  const draggedDown = startHeight.value - sheetHeight.value > DRAG_THRESHOLD;
  if (draggedDown && sheetHeight.value <= MIN_HEIGHT) {
    closeSheet();
  } else {
    // Snap to nearest point
    sheetHeight.value = calculateSnapPoint(sheetHeight.value);
  }
};

// Mouse handlers for desktop - handle area (always drag)
const onHandleMouseDown = (e: MouseEvent) => {
  e.stopPropagation();
  startY.value = e.clientY;
  startHeight.value = sheetHeight.value;
  isDragging.value = true;
  document.addEventListener("mousemove", onHandleMouseMove);
  document.addEventListener("mouseup", onHandleMouseUp);
  e.preventDefault();
};

const onHandleMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  e.stopPropagation();
  const deltaY = startY.value - e.clientY; // Inverted: up = positive delta
  const newHeight = clampHeight(startHeight.value + deltaY);
  sheetHeight.value = newHeight;
};

const onHandleMouseUp = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  document.removeEventListener("mousemove", onHandleMouseMove);
  document.removeEventListener("mouseup", onHandleMouseUp);

  // Check if dragged down enough to close
  const draggedDown = startHeight.value - sheetHeight.value > DRAG_THRESHOLD;
  if (draggedDown && sheetHeight.value <= MIN_HEIGHT) {
    closeSheet();
  } else {
    // Snap to nearest point
    sheetHeight.value = calculateSnapPoint(sheetHeight.value);
  }
};

// Mouse handlers for desktop - entire sheet
const onSheetMouseDown = (e: MouseEvent) => {
  // Ignore if click started on handle
  if ((e.target as HTMLElement).closest(".shareProfileSheet-handle")) {
    return;
  }

  startY.value = e.clientY;
  startHeight.value = sheetHeight.value;
  dragStartY.value = e.clientY;
  hasMoved.value = false;
  isDragging.value = true;
  document.addEventListener("mousemove", onSheetMouseMove);
  document.addEventListener("mouseup", onSheetMouseUp);
};

const onSheetMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  const deltaY = startY.value - e.clientY; // Inverted: up = positive delta
  const newHeight = clampHeight(startHeight.value + deltaY);
  sheetHeight.value = newHeight;
};

const onSheetMouseUp = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  hasMoved.value = false;
  document.removeEventListener("mousemove", onSheetMouseMove);
  document.removeEventListener("mouseup", onSheetMouseUp);

  // Check if dragged down enough to close
  const draggedDown = startHeight.value - sheetHeight.value > DRAG_THRESHOLD;
  if (draggedDown && sheetHeight.value <= MIN_HEIGHT) {
    closeSheet();
  } else {
    // Snap to nearest point
    sheetHeight.value = calculateSnapPoint(sheetHeight.value);
  }
};

onBeforeUnmount(() => {
  document.removeEventListener("mousemove", onHandleMouseMove);
  document.removeEventListener("mouseup", onHandleMouseUp);
  document.removeEventListener("mousemove", onSheetMouseMove);
  document.removeEventListener("mouseup", onSheetMouseUp);
  document.body.classList.remove("bottom-sheet-open");
});

const shareOnPlatform = (platform: { name: string; url: (url: string, title: string, text: string) => string }) => {
  try {
    const shareUrl = platform.url(props.profileUrl, props.profileTitle, props.profileText);
    window.open(shareUrl, "_blank", "noopener,noreferrer");
  } catch (error) {
    if (process.env.NODE_ENV === "development") {
      console.error("Share error:", error);
    }
    Notify.create({
      type: "negative",
      message: "Failed to share. Please try again.",
      position: "top",
      timeout: 3000
    });
  }
};

const shareNative = async () => {
  try {
    await navigator.share({
      title: props.profileTitle,
      text: props.profileText,
      url: props.profileUrl
    });
  } catch (error) {
    // User cancelled or error - ignore
    if (process.env.NODE_ENV === "development") {
      console.log("Share cancelled or error:", error);
    }
  }
};

// Platforms ordered by global user base (most popular first, email always last)
const platforms = [
  {
    name: "Facebook",
    icon: "/icons/socials/facebook.svg",
    url: (url: string) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  },
  {
    name: "WhatsApp",
    icon: "/icons/socials/whatsapp.svg",
    url: (url: string, title: string, text: string) => {
      const message = `${text} ${url}`;
      // Try WhatsApp deep link, fallback to web
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        return `whatsapp://send?text=${encodeURIComponent(message)}`;
      }
      return `https://wa.me/?text=${encodeURIComponent(message)}`;
    }
  },
  {
    name: "Instagram",
    icon: "/icons/socials/instagram.svg",
    url: () => "https://www.instagram.com/"
  },
  {
    name: "WeChat",
    icon: "/icons/socials/wechat.svg",
    url: (url: string) => {
      // Try WeChat deep link, fallback to web
      if (/MicroMessenger/i.test(navigator.userAgent)) {
        return `weixin://dl/moments?url=${encodeURIComponent(url)}`;
      }
      return url;
    }
  },
  {
    name: "TikTok",
    icon: "/icons/socials/tiktok.svg",
    url: () => "https://www.tiktok.com/"
  },
  {
    name: "X (Twitter)",
    icon: "/icons/socials/x.svg",
    url: (url: string, title: string) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
  },
  {
    name: "Telegram",
    icon: "/icons/socials/telegram.svg",
    url: (url: string, title: string, text: string) => {
      const message = `${title}\n${text}\n${url}`;
      return `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(message)}`;
    }
  },
  {
    name: "Snapchat",
    icon: "/icons/socials/snapchat.svg",
    url: (url: string) => `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(url)}`
  },
  {
    name: "LinkedIn",
    icon: "/icons/socials/linkedin.svg",
    url: (url: string) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  },
  {
    name: "YouTube",
    icon: "/icons/socials/youtube.svg",
    url: (url: string) => url // YouTube doesn't have a direct share URL, just return the profile URL
  },
  {
    name: "Pinterest",
    icon: "/icons/socials/pinterest.svg",
    url: (url: string, title: string) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(title)}`
  },
  {
    name: "Reddit",
    icon: "/icons/socials/reddit.svg",
    url: (url: string, title: string) => `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  },
  {
    name: "Discord",
    icon: "/icons/socials/discord.svg",
    url: (url: string) => url
  },
  {
    name: "Viber",
    icon: "/icons/socials/viber.svg",
    url: (url: string, title: string, text: string) => {
      const message = `${text} ${url}`;
      // Try Viber deep link, fallback to web
      return `viber://forward?text=${encodeURIComponent(message)}`;
    }
  },
  {
    name: "Threads",
    icon: "/icons/socials/threads.svg",
    url: (url: string) => `https://www.threads.net/intent/post?text=${encodeURIComponent(url)}`
  },
  {
    name: "Tumblr",
    icon: "/icons/socials/tumblr.svg",
    url: (url: string, title: string) => `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  },
  {
    name: "Quora",
    icon: "/icons/socials/quora.svg",
    url: (url: string) => `https://www.quora.com/content?share=${encodeURIComponent(url)}`
  },
  {
    name: "GitHub",
    icon: "/icons/socials/github.svg",
    url: (url: string) => url
  },
  {
    name: "BeReal",
    icon: "/icons/socials/bereal.svg",
    url: () => "https://bere.al/"
  },
  {
    name: "Moodle",
    icon: "/icons/socials/moodle.svg",
    url: (url: string) => url
  },
  {
    name: "Email",
    icon: "/icons/socials/email.svg",
    url: (url: string, title: string, text: string) => {
      const subject = encodeURIComponent(title);
      const body = encodeURIComponent(`${text}\n\n${url}`);
      return `mailto:?subject=${subject}&body=${body}`;
    }
  }
];
</script>

<style scoped lang="scss">
.shareProfileSheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 1rem;
  z-index: 10001; // Above ProfileActionsSheet and footer
}

.shareProfileSheet {
  background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
  border-radius: 24px 24px 0 0;
  padding: 1.5rem 1.5rem 2rem;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease-out;
  min-height: 280px;
  height: 280px;
  overflow-y: auto;
  overflow-x: hidden;
  user-select: none;
  transition: height 0.3s ease-out;
  display: flex;
  flex-direction: column;

  // Remove transition during drag for real-time tracking
  &.dragging {
    transition: none;
  }

  // Add transition only when not dragging
  &:not(.dragging) {
    transition: height 0.3s ease-out;
  }

  .shareProfileSheet-handle {
    width: 40px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    margin: 0 auto 1.5rem;
    cursor: grab;
    touch-action: none;
    flex-shrink: 0;

    &:active {
      cursor: grabbing;
    }
  }

  .shareProfileSheet-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #fff;
    text-align: center;
    margin-bottom: 1.5rem;
    font-family: poppinsSemiBold;
    flex-shrink: 0;
  }

  .shareProfileSheet-platforms {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;
    flex: 1;
    overflow-y: auto;
    overflow-x: hidden;
    touch-action: pan-y; // Allow vertical scrolling

    @media (max-width: 480px) {
      grid-template-columns: repeat(3, 1fr);
      gap: 0.75rem;
    }
  }

  .shareProfileSheet-platformBtn {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.5rem;
    padding: 1rem 0.5rem;
    background: rgba(255, 255, 255, 0.05);
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    cursor: pointer;
    transition: all 0.2s ease;

    &:hover {
      background: rgba(255, 255, 255, 0.1);
      border-color: rgba(255, 255, 255, 0.2);
      transform: translateY(-2px);
    }

    &:active {
      transform: translateY(0);
    }
  }

  .shareProfileSheet-platformIcon {
    width: 32px;
    height: 32px;
    object-fit: contain;
  }

  .shareProfileSheet-platformName {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.8);
    text-align: center;
    font-family: poppins;
  }

  .shareProfileSheet-btn {
    width: 100%;
    padding: 1rem 1.5rem;
    border: none;
    border-radius: 12px;
    font-size: 1rem;
    font-weight: 600;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: montseraatSemiBold;
    flex-shrink: 0;

    &--native {
      background: rgba(100, 150, 255, 0.2);
      color: rgb(150, 200, 255);
      border: 1px solid rgba(100, 150, 255, 0.3);

      &:hover {
        background: rgba(100, 150, 255, 0.3);
        border-color: rgba(100, 150, 255, 0.5);
      }
    }
  }
}

@keyframes slideUp {
  from {
    transform: translateY(100%);
    opacity: 0;
  }
  to {
    transform: translateY(0);
    opacity: 1;
  }
}

.sheet-fade-enter-active,
.sheet-fade-leave-active {
  transition: opacity 0.3s ease;
}

.sheet-fade-enter-from,
.sheet-fade-leave-to {
  opacity: 0;
}
</style>
