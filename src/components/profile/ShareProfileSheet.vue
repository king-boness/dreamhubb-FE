<template>
  <transition name="sheet-fade">
    <div
      v-if="modelValue"
      class="shareProfileSheet-backdrop"
      @click.self="closeSheet"
    >
      <div
        class="shareProfileSheet"
        :class="{ dragging: isDragging, expanded: currentSnapPoint === 'expanded' }"
        :style="{ 
          transform: `translateY(${dragOffset}px)`,
          maxHeight: currentSnapPoint === 'expanded' ? `${EXPANDED_HEIGHT_PERCENT}vh` : `${COLLAPSED_HEIGHT_PERCENT}vh`
        }"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
        @mousedown="onMouseDown"
      >
        <div
          class="shareProfileSheet-handle"
          @touchstart="onTouchStart"
          @mousedown="onMouseDown"
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

const dragOffset = ref(0);
const startY = ref(0);
const isDragging = ref(false);
const sheetHeight = ref(0);
const currentSnapPoint = ref<"collapsed" | "expanded">("collapsed");
const DRAG_THRESHOLD = 60;
const COLLAPSED_HEIGHT_PERCENT = 40; // 40% of viewport height
const EXPANDED_HEIGHT_PERCENT = 90; // 90% of viewport height

// Hide/show footer when sheet opens/closes
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      document.body.classList.add("bottom-sheet-open");
      // Reset to collapsed when opening
      currentSnapPoint.value = "collapsed";
      dragOffset.value = 0;
      sheetHeight.value = (window.innerHeight * COLLAPSED_HEIGHT_PERCENT) / 100;
    } else {
      document.body.classList.remove("bottom-sheet-open");
      dragOffset.value = 0;
      currentSnapPoint.value = "collapsed";
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

// Calculate snap point based on drag direction and distance
const calculateSnapPoint = (deltaY: number, isDownward: boolean) => {
  const viewportHeight = window.innerHeight;
  const collapsedHeight = (viewportHeight * COLLAPSED_HEIGHT_PERCENT) / 100;
  const expandedHeight = (viewportHeight * EXPANDED_HEIGHT_PERCENT) / 100;
  const currentHeight = currentSnapPoint.value === "collapsed" ? collapsedHeight : expandedHeight;
  const newHeight = currentHeight + (isDownward ? deltaY : -deltaY);

  // Determine target snap point
  const midPoint = (collapsedHeight + expandedHeight) / 2;
  if (newHeight < midPoint) {
    return { snapPoint: "collapsed" as const, targetHeight: collapsedHeight };
  } else {
    return { snapPoint: "expanded" as const, targetHeight: expandedHeight };
  }
};

// Touch handlers
const onTouchStart = (e: TouchEvent) => {
  startY.value = e.touches[0].clientY;
  isDragging.value = true;
  // Prevent scrolling while dragging
  e.preventDefault();
};

const onTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return;
  const currentY = e.touches[0].clientY;
  const deltaY = currentY - startY.value;
  const isDownward = deltaY > 0;
  
  // Allow dragging in both directions
  if (isDownward) {
    // Dragging down - can close or collapse
    dragOffset.value = deltaY;
  } else {
    // Dragging up - can expand
    const viewportHeight = window.innerHeight;
    const maxHeight = (viewportHeight * EXPANDED_HEIGHT_PERCENT) / 100;
    const currentHeight = currentSnapPoint.value === "collapsed" 
      ? (viewportHeight * COLLAPSED_HEIGHT_PERCENT) / 100
      : (viewportHeight * EXPANDED_HEIGHT_PERCENT) / 100;
    const newHeight = currentHeight - Math.abs(deltaY);
    if (newHeight <= maxHeight) {
      dragOffset.value = deltaY;
    }
  }
};

const onTouchEnd = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  
  const deltaY = dragOffset.value;
  const isDownward = deltaY > 0;
  
  if (isDownward && Math.abs(deltaY) >= DRAG_THRESHOLD) {
    // Close sheet if dragged down enough
    closeSheet();
  } else {
    // Snap to nearest point
    const { snapPoint, targetHeight } = calculateSnapPoint(Math.abs(deltaY), isDownward);
    currentSnapPoint.value = snapPoint;
    const viewportHeight = window.innerHeight;
    const currentHeight = currentSnapPoint.value === "collapsed" 
      ? (viewportHeight * COLLAPSED_HEIGHT_PERCENT) / 100
      : (viewportHeight * EXPANDED_HEIGHT_PERCENT) / 100;
    dragOffset.value = 0;
    sheetHeight.value = targetHeight;
  }
};

// Mouse handlers for desktop
const onMouseDown = (e: MouseEvent) => {
  startY.value = e.clientY;
  isDragging.value = true;
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
  e.preventDefault();
};

const onMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  const deltaY = e.clientY - startY.value;
  const isDownward = deltaY > 0;
  
  if (isDownward) {
    dragOffset.value = deltaY;
  } else {
    const viewportHeight = window.innerHeight;
    const maxHeight = (viewportHeight * EXPANDED_HEIGHT_PERCENT) / 100;
    const currentHeight = currentSnapPoint.value === "collapsed" 
      ? (viewportHeight * COLLAPSED_HEIGHT_PERCENT) / 100
      : (viewportHeight * EXPANDED_HEIGHT_PERCENT) / 100;
    const newHeight = currentHeight - Math.abs(deltaY);
    if (newHeight <= maxHeight) {
      dragOffset.value = deltaY;
    }
  }
};

const onMouseUp = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
  
  const deltaY = dragOffset.value;
  const isDownward = deltaY > 0;
  
  if (isDownward && Math.abs(deltaY) >= DRAG_THRESHOLD) {
    closeSheet();
  } else {
    const { snapPoint, targetHeight } = calculateSnapPoint(Math.abs(deltaY), isDownward);
    currentSnapPoint.value = snapPoint;
    dragOffset.value = 0;
    sheetHeight.value = targetHeight;
  }
};

onBeforeUnmount(() => {
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
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
  max-height: 40vh;
  overflow-y: auto;
  cursor: grab;
  user-select: none;
  transition: max-height 0.3s ease-out;

  &:active {
    cursor: grabbing;
  }

  // Remove transition during drag for real-time tracking
  &.dragging {
    transition: none;
  }

  // Add transition only when not dragging
  &:not(.dragging) {
    transition: transform 0.2s ease-out, max-height 0.3s ease-out;
  }

  &.expanded {
    max-height: 90vh;
  }

  .shareProfileSheet-handle {
    width: 40px;
    height: 4px;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 2px;
    margin: 0 auto 1.5rem;
    cursor: grab;
    touch-action: none;

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
  }

  .shareProfileSheet-platforms {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 1rem;
    margin-bottom: 1.5rem;

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
