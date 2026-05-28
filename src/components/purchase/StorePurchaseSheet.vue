<template>
  <div
    v-if="modelValue"
    class="storePurchaseSheet-backdrop"
    @click.self="closeSheet"
  >
    <div
      class="storePurchaseSheet"
      :class="{ dragging: isDragging }"
      :style="{ height: `${sheetHeight}px` }"
      @touchstart="onSheetTouchStart"
      @touchmove="onSheetTouchMove"
      @touchend="onSheetTouchEnd"
      @mousedown="onSheetMouseDown"
    >
        <div
          class="storePurchaseSheet-handle"
          @touchstart.stop="onHandleTouchStart"
          @touchmove.stop.prevent="onHandleTouchMove"
          @touchend.stop="onHandleTouchEnd"
          @mousedown.stop="onHandleMouseDown"
        />
        <button
          type="button"
          class="storePurchaseSheet-close"
          aria-label="Close"
          @click="closeSheet"
        >
          <img src="/icons/closeIcon.svg" alt="" class="storePurchaseSheet-closeIcon" />
        </button>

        <template v-if="selectedPackage">
          <div class="storePurchaseSheet-package">
            <img :src="selectedPackage.img" alt="" class="storePurchaseSheet-packageImg" />
            <div class="storePurchaseSheet-packageInfo">
              <span class="storePurchaseSheet-packageName">{{ selectedPackage.displayName }} Tokens ({{ selectedPackage.tokenAmount.toLocaleString('de-DE') }})</span>
              <span class="storePurchaseSheet-packagePrice">{{ selectedPackage.priceDisplay }}</span>
            </div>
          </div>
          <p class="storePurchaseSheet-description">
            Complete your purchase using your device's payment method.
          </p>
          <button
            type="button"
            class="storePurchaseSheet-cta"
            :disabled="purchaseInProgress"
            @click="onPurchase"
          >
            {{ purchaseInProgress ? "…" : "Purchase" }}
          </button>
        </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from "vue";
import type { TokenPackage } from "src/types/purchase";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    selectedPackage: TokenPackage | null;
    purchaseInProgress?: boolean;
  }>(),
  { selectedPackage: null, purchaseInProgress: false }
);

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "purchase", pkg: TokenPackage): void;
}>();

const startY = ref(0);
const startHeight = ref(0);
const isDragging = ref(false);
const sheetHeight = ref(300);
const MIN_HEIGHT = 260;
/** Rovnaký „peek“ ako badge / share sheet */
const INITIAL_HEIGHT = 300;
const MAX_HEIGHT_PERCENT = 90;

const maxSheetPx = () =>
  typeof window !== "undefined" ? (window.innerHeight * MAX_HEIGHT_PERCENT) / 100 : 640;

const clampHeight = (h: number) => Math.max(MIN_HEIGHT, Math.min(h, maxSheetPx()));

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      document.body.classList.add("bottom-sheet-open");
      sheetHeight.value = INITIAL_HEIGHT;
    } else {
      document.body.classList.remove("bottom-sheet-open");
    }
  },
  { immediate: true }
);

function closeSheet() {
  emit("update:modelValue", false);
}

function onPurchase() {
  if (!props.selectedPackage) return;
  emit("purchase", props.selectedPackage);
  closeSheet();
}

function onHandleTouchStart(e: TouchEvent) {
  startY.value = e.touches[0].clientY;
  startHeight.value = sheetHeight.value;
  isDragging.value = true;
  if (e.cancelable) e.preventDefault();
}

function onHandleTouchMove(e: TouchEvent) {
  if (!isDragging.value) return;
  const deltaY = startY.value - e.touches[0].clientY;
  sheetHeight.value = clampHeight(startHeight.value + deltaY);
  if (e.cancelable) e.preventDefault();
}

function onHandleTouchEnd() {
  if (!isDragging.value) return;
  isDragging.value = false;
  if (sheetHeight.value < MIN_HEIGHT + 40) closeSheet();
  else sheetHeight.value = INITIAL_HEIGHT;
}

function onSheetTouchStart(e: TouchEvent) {
  if ((e.target as HTMLElement).closest(".storePurchaseSheet-handle")) return;
  startY.value = e.touches[0].clientY;
  startHeight.value = sheetHeight.value;
  isDragging.value = true;
}

function onSheetTouchMove(e: TouchEvent) {
  if (!isDragging.value) return;
  const deltaY = startY.value - e.touches[0].clientY;
  sheetHeight.value = clampHeight(startHeight.value + deltaY);
  if (e.cancelable) e.preventDefault();
}

function onSheetTouchEnd() {
  if (!isDragging.value) return;
  isDragging.value = false;
  if (sheetHeight.value < MIN_HEIGHT + 40) closeSheet();
  else sheetHeight.value = INITIAL_HEIGHT;
}

function onHandleMouseDown(e: MouseEvent) {
  e.stopPropagation();
  startY.value = e.clientY;
  startHeight.value = sheetHeight.value;
  isDragging.value = true;
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function onSheetMouseDown(e: MouseEvent) {
  if ((e.target as HTMLElement).closest(".storePurchaseSheet-handle")) return;
  startY.value = e.clientY;
  startHeight.value = sheetHeight.value;
  isDragging.value = true;
  document.addEventListener("mousemove", onMouseMove);
  document.addEventListener("mouseup", onMouseUp);
}

function onMouseMove(e: MouseEvent) {
  if (!isDragging.value) return;
  const deltaY = startY.value - e.clientY;
  sheetHeight.value = clampHeight(startHeight.value + deltaY);
}

function onMouseUp() {
  if (!isDragging.value) return;
  isDragging.value = false;
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
  if (sheetHeight.value < MIN_HEIGHT + 40) closeSheet();
  else sheetHeight.value = INITIAL_HEIGHT;
}

onBeforeUnmount(() => {
  document.removeEventListener("mousemove", onMouseMove);
  document.removeEventListener("mouseup", onMouseUp);
  document.body.classList.remove("bottom-sheet-open");
});
</script>

<style scoped lang="scss">
.storePurchaseSheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 10001;
  padding: 0;
  animation: storePurchaseBackdropFadeIn 0.3s ease;
}

.storePurchaseSheet {
  background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
  border-radius: 24px 24px 0 0;
  padding: 1rem 1.25rem 1.5rem;
  padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
  width: min(600px, 100vw);
  max-height: 92vh;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.5);
  min-height: 280px;
  overflow-y: auto;
  transition: height 0.25s ease-out;
  display: flex;
  flex-direction: column;
  position: relative;
  margin-bottom: 0;
  animation: storePurchaseSheetSlideUp 0.3s ease-out;

  &.dragging {
    transition: none;
  }
}

.storePurchaseSheet-handle {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  margin: 0 auto 0.75rem;
  cursor: grab;
  touch-action: none;
  flex-shrink: 0;
}

.storePurchaseSheet-close {
  position: absolute;
  top: 0.5rem;
  right: 1rem;
  width: 40px;
  height: 40px;
  border: none;
  background: rgba(255, 255, 255, 0.08);
  border-radius: 50%;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0;
  &:hover {
    background: rgba(255, 255, 255, 0.12);
  }
}

.storePurchaseSheet-closeIcon {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
}

.storePurchaseSheet-package {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.storePurchaseSheet-packageImg {
  height: 2.5rem;
  width: auto;
}

.storePurchaseSheet-packageInfo {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.storePurchaseSheet-packageName {
  color: rgba(255, 255, 255, 0.9);
  font-size: 1rem;
  font-family: poppinsSemiBold;
}

.storePurchaseSheet-packagePrice {
  color: #ff2c8b;
  font-size: 1.2rem;
  font-family: poppinsBold;
}

.storePurchaseSheet-description {
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.9rem;
  margin: 0 0 1.25rem;
  font-family: poppins;
  line-height: 1.4;
}

.storePurchaseSheet-cta {
  width: 100%;
  padding: 1rem 1.5rem;
  border: none;
  border-radius: 12px;
  font-size: 1rem;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  cursor: pointer;
  font-family: montseraatSemiBold;
  background: linear-gradient(135deg, #bd0043 0%, #ff2c8b 100%);
  color: #fff;
  transition: opacity 0.2s;

  &:hover:not(:disabled) {
    opacity: 0.95;
  }

  &:disabled {
    opacity: 0.7;
    cursor: not-allowed;
  }
}

@keyframes storePurchaseBackdropFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes storePurchaseSheetSlideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
