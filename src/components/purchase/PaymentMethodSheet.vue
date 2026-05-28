<template>
  <div
    v-if="modelValue"
    class="paymentSheet-backdrop"
    @click.self="closeSheet"
  >
    <div
      class="paymentSheet"
      :class="{ dragging: isDragging }"
      :style="{ height: `${sheetHeight}px` }"
      @touchstart="onSheetTouchStart"
      @touchmove="onSheetTouchMove"
      @touchend="onSheetTouchEnd"
      @mousedown="onSheetMouseDown"
    >
        <div
          class="paymentSheet-handle"
          @touchstart.stop="onHandleTouchStart"
          @touchmove.stop.prevent="onHandleTouchMove"
          @touchend.stop="onHandleTouchEnd"
          @mousedown.stop="onHandleMouseDown"
        />
        <button
          type="button"
          class="paymentSheet-close"
          aria-label="Close"
          @click="closeSheet"
        >
          <img src="/icons/closeIcon.svg" alt="" class="paymentSheet-closeIcon" />
        </button>

        <template v-if="selectedPackage">
          <div class="paymentSheet-package">
            <img :src="selectedPackage.img" alt="" class="paymentSheet-packageImg" />
            <div class="paymentSheet-packageInfo">
              <span class="paymentSheet-packageName">{{ selectedPackage.displayName }} Tokens ({{ selectedPackage.tokenAmount.toLocaleString('de-DE') }})</span>
              <span class="paymentSheet-packagePrice">{{ selectedPackage.priceDisplay }}</span>
            </div>
          </div>
          <h2 class="paymentSheet-title">Choose payment method</h2>
          <div class="paymentSheet-grid">
            <button
              v-for="method in WEB_PAYMENT_METHODS"
              :key="method.id"
              type="button"
              class="paymentSheet-methodBtn"
              :class="{ 'paymentSheet-methodBtn--selected': selectedMethod === method.id }"
              @click="selectedMethod = method.id"
            >
              <span class="paymentSheet-methodLabel">{{ method.label }}</span>
              <span v-if="!isStripeSupportedMethod(method.id) && !isPayPalSupportedMethod(method.id)" class="paymentSheet-methodSoon">Coming soon</span>
            </button>
          </div>
          <button
            type="button"
            class="paymentSheet-cta"
            :class="{ 'paymentSheet-cta--disabled': !selectedMethod }"
            :disabled="!selectedMethod"
            @click="onContinue"
          >
            CONTINUE
          </button>
        </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch, onBeforeUnmount } from "vue";
import type { TokenPackage, WebPaymentMethodId } from "src/types/purchase";
import { WEB_PAYMENT_METHODS } from "src/types/purchase";
import { isPayPalSupportedMethod } from "src/services/paypalCheckoutService";
import { isStripeSupportedMethod } from "src/services/stripeCheckoutService";

const props = withDefaults(
  defineProps<{
    modelValue: boolean;
    selectedPackage: TokenPackage | null;
  }>(),
  { selectedPackage: null }
);

// eslint-disable-next-line func-call-spacing
const emit = defineEmits<{
  (e: "update:modelValue", value: boolean): void;
  (e: "continue", pkg: TokenPackage, method: WebPaymentMethodId): void;
}>();

const selectedMethod = ref<WebPaymentMethodId | null>(null);
const startY = ref(0);
const startHeight = ref(0);
const isDragging = ref(false);
const sheetHeight = ref(380);
const MIN_HEIGHT = 280;
const INITIAL_HEIGHT = 380;
const MAX_HEIGHT_PERCENT = 90;

const maxHeight = () =>
  typeof window !== "undefined" ? (window.innerHeight * MAX_HEIGHT_PERCENT) / 100 : 720;
const clampHeight = (h: number) => Math.max(MIN_HEIGHT, Math.min(h, maxHeight()));

watch(
  () => props.modelValue,
  (isOpen) => {
    if (isOpen) {
      document.body.classList.add("bottom-sheet-open");
      sheetHeight.value = INITIAL_HEIGHT;
      selectedMethod.value = null;
    } else {
      document.body.classList.remove("bottom-sheet-open");
    }
  },
  { immediate: true }
);

function closeSheet() {
  emit("update:modelValue", false);
}

function onContinue() {
  if (!props.selectedPackage || !selectedMethod.value) return;
  emit("continue", props.selectedPackage, selectedMethod.value);
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
  if ((e.target as HTMLElement).closest(".paymentSheet-handle")) return;
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
  if ((e.target as HTMLElement).closest(".paymentSheet-handle")) return;
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
.paymentSheet-backdrop {
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: flex-end;
  justify-content: center;
  z-index: 10001;
  padding: 0;
  animation: paymentSheetBackdropFadeIn 0.3s ease;
}

.paymentSheet {
  background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
  border-radius: 24px 24px 0 0;
  padding: 1rem 1.25rem 1.5rem;
  padding-bottom: calc(1.5rem + env(safe-area-inset-bottom, 0px));
  width: min(600px, 100vw);
  max-height: 92vh;
  box-shadow: 0 -8px 32px rgba(0, 0, 0, 0.5);
  min-height: 280px;
  overflow-y: auto;
  overflow-x: hidden;
  transition: height 0.25s ease-out;
  display: flex;
  flex-direction: column;
  position: relative;
  animation: paymentSheetSlideUp 0.3s ease-out;
  margin-bottom: 0;

  &.dragging {
    transition: none;
  }
}

.paymentSheet-handle {
  width: 40px;
  height: 4px;
  background: rgba(255, 255, 255, 0.3);
  border-radius: 2px;
  margin: 0 auto 0.75rem;
  cursor: grab;
  touch-action: none;
  flex-shrink: 0;
}

.paymentSheet-close {
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

.paymentSheet-closeIcon {
  width: 20px;
  height: 20px;
  filter: brightness(0) invert(1);
}

.paymentSheet-package {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.75rem 1rem;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  margin-bottom: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.paymentSheet-packageImg {
  height: 2rem;
  width: auto;
}

.paymentSheet-packageInfo {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.paymentSheet-packageName {
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.95rem;
  font-family: poppinsSemiBold;
}

.paymentSheet-packagePrice {
  color: #ff2c8b;
  font-size: 1.1rem;
  font-family: poppinsBold;
}

.paymentSheet-title {
  font-size: 1.15rem;
  font-weight: 600;
  color: #fff;
  margin: 0 0 1rem;
  font-family: poppinsSemiBold;
}

.paymentSheet-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.75rem;
  margin-bottom: 1.25rem;
  flex: 1;
  min-height: 0;
}

.paymentSheet-methodBtn {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 1rem 0.75rem;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.12);
  border-radius: 12px;
  cursor: pointer;
  transition: all 0.2s ease;
  font-family: poppins;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);

  &:hover {
    background: rgba(255, 255, 255, 0.08);
    border-color: rgba(255, 44, 139, 0.4);
  }

  &--selected {
    background: rgba(189, 0, 67, 0.2);
    border-color: #bd0043;
    color: #fff;
  }
}

.paymentSheet-methodLabel {
  text-align: center;
}

.paymentSheet-methodSoon {
  display: block;
  font-size: 0.7rem;
  color: rgba(255, 255, 255, 0.5);
  margin-top: 0.2rem;
}

.paymentSheet-cta {
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

  &--disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
}

@keyframes paymentSheetBackdropFadeIn {
  from {
    opacity: 0;
  }
  to {
    opacity: 1;
  }
}

@keyframes paymentSheetSlideUp {
  from {
    transform: translateY(100%);
  }
  to {
    transform: translateY(0);
  }
}
</style>
