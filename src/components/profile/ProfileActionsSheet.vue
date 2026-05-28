<template>
  <transition name="sheet-fade">
    <div
      v-if="modelValue"
      class="profileActionsSheet-backdrop"
      @click.self="closeSheet"
    >
      <div
        class="profileActionsSheet"
        :class="{ dragging: isDragging }"
        :style="{ transform: `translateY(${dragOffset}px)` }"
        @touchstart.passive="onTouchStart"
        @touchmove.passive="onTouchMove"
        @touchend.passive="onTouchEnd"
        @mousedown="onMouseDown"
      >
        <div
          class="profileActionsSheet-handle"
          @touchstart.passive="onTouchStart"
          @mousedown="onMouseDown"
        ></div>
        <h2 class="profileActionsSheet-title">Profile Actions</h2>

        <button class="profileActionsSheet-btn primary" @click="handleViewPhoto">
          VIEW PROFILE PHOTO
        </button>
        <button class="profileActionsSheet-btn secondary" @click="handleChangePhoto">
          CHANGE PROFILE PHOTO
        </button>
        <button class="profileActionsSheet-btn tertiary" @click="handleSelectBadge">
          SELECT BADGE
        </button>
        <button class="profileActionsSheet-btn quaternary" @click="handleShareProfile">
          SHARE PROFILE
        </button>
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from "vue";

interface Props {
  modelValue: boolean;
  user?: {
    username?: string;
    profile_picture?: string | null;
    [key: string]: unknown;
  } | null;
}

const props = withDefaults(defineProps<Props>(), {
  modelValue: false,
  user: null
});

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "view-photo"): void;
  (e: "change-photo"): void;
  (e: "select-badge"): void;
  (e: "share-profile"): void;
}>();

const dragOffset = ref(0);
const startY = ref(0);
const isDragging = ref(false);
const DRAG_THRESHOLD = 60;

// Hide/show footer when sheet opens/closes
watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      document.body.classList.add("bottom-sheet-open");
    } else {
      document.body.classList.remove("bottom-sheet-open");
      dragOffset.value = 0;
    }
  },
  { immediate: true }
);

const closeSheet = () => {
  emit("update:modelValue", false);
};

// Touch handlers
const onTouchStart = (e: TouchEvent) => {
  startY.value = e.touches[0].clientY;
  isDragging.value = true;
};

const onTouchMove = (e: TouchEvent) => {
  if (!isDragging.value) return;
  const currentY = e.touches[0].clientY;
  const deltaY = currentY - startY.value;
  if (deltaY > 0) {
    dragOffset.value = deltaY;
  }
};

const onTouchEnd = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  if (dragOffset.value >= DRAG_THRESHOLD) {
    closeSheet();
  } else {
    dragOffset.value = 0;
  }
};

// Mouse handlers for desktop
const onMouseDown = (e: MouseEvent) => {
  startY.value = e.clientY;
  isDragging.value = true;
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
};

const onMouseMove = (e: MouseEvent) => {
  if (!isDragging.value) return;
  const deltaY = e.clientY - startY.value;
  if (deltaY > 0) {
    dragOffset.value = deltaY;
  }
};

const onMouseUp = () => {
  if (!isDragging.value) return;
  isDragging.value = false;
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
  if (dragOffset.value >= DRAG_THRESHOLD) {
    closeSheet();
  } else {
    dragOffset.value = 0;
  }
};

onBeforeUnmount(() => {
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
  document.body.classList.remove("bottom-sheet-open");
});

const handleViewPhoto = () => {
  emit("view-photo");
};

const handleChangePhoto = () => {
  console.info("[DH-PROFILE-UPLOAD]", "ACTIVE_HANDLER_REACHED", {
    stage: "ProfileActionsSheet.emit-change-photo",
    component: "ProfileActionsSheet.vue"
  });
  emit("change-photo");
};

const handleSelectBadge = () => {
  emit("select-badge");
};

const handleShareProfile = () => {
  emit("share-profile");
};
</script>

<style scoped lang="scss">
.profileActionsSheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.65);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  padding: 0 1rem;
  z-index: 10000; // Above footer (footer has z-index 2000/99999)
}

.profileActionsSheet {
  background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
  border-radius: 24px 24px 0 0;
  padding: 1.5rem 1.5rem 2rem;
  width: 100%;
  max-width: 600px;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.5);
  animation: slideUp 0.3s ease-out;
  cursor: grab;
  user-select: none;

  &:active {
    cursor: grabbing;
  }

  // Remove transition during drag for real-time tracking
  &.dragging {
    transition: none;
  }

  // Add transition only when not dragging
  &:not(.dragging) {
    transition: transform 0.2s ease-out;
  }

  .profileActionsSheet-handle {
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

  .profileActionsSheet-title {
    font-size: 1.25rem;
    font-weight: 600;
    color: #fff;
    text-align: center;
    margin-bottom: 1.5rem;
    font-family: poppinsSemiBold;
  }

  .profileActionsSheet-btn {
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
    margin-bottom: 0.75rem;
    font-family: montseraatSemiBold;

    &:last-child {
      margin-bottom: 0;
    }

    &.primary {
      background: rgba(182, 0, 67, 1);
      color: white;

      &:hover {
        background: rgba(182, 0, 67, 0.9);
        transform: translateY(-1px);
      }

      &:active {
        transform: translateY(0);
      }
    }

    &.secondary {
      background: rgba(221, 31, 97, 0.2);
      color: rgb(218, 3, 82);
      border: 1px solid rgba(218, 3, 82, 0.3);

      &:hover {
        background: rgba(221, 31, 97, 0.3);
        border-color: rgba(218, 3, 82, 0.5);
      }
    }

    &.tertiary {
      background: rgba(255, 255, 255, 0.1);
      color: white;
      border: 1px solid rgba(255, 255, 255, 0.2);

      &:hover {
        background: rgba(255, 255, 255, 0.15);
        border-color: rgba(255, 255, 255, 0.3);
      }
    }

    &.quaternary {
      background: rgba(100, 150, 255, 0.2);
      color: rgb(150, 200, 255);
      border: 1px solid rgba(100, 150, 255, 0.3);

      &:hover {
        background: rgba(100, 150, 255, 0.3);
        border-color: rgba(100, 150, 255, 0.5);
      }
    }

    &:disabled {
      opacity: 0.5;
      cursor: not-allowed;
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
