<template>
  <div class="back-overlay-button">
    <q-btn
      round
      flat
      dense
      class="back-overlay-button__btn"
      icon="chevron_left"
      @click="handleClick"
    />
  </div>
</template>

<script setup lang="ts">
import type { RouteLocationRaw } from "vue-router";
import { useRoute, useRouter } from "vue-router";
import { goBackOrFallback } from "src/utils/navigation";

interface Props {
  fallback?: RouteLocationRaw;
}

const props = defineProps<Props>();

const router = useRouter();
const route = useRoute();

const defaultFallback = (): RouteLocationRaw => {
  // Prefer side-aware home when no explicit fallback is provided.
  const name = route.name?.toString() ?? "";
  if (name.includes("donee")) return { name: "donee-posts" };
  if (name.includes("donor")) return { name: "donor-posts" };
  return { name: "donor-posts" };
};

const handleClick = () => {
  goBackOrFallback(router, props.fallback ?? defaultFallback());
};
</script>

<style lang="scss" scoped>
/* Match CloseOverlayButton styling, but with a back arrow icon */
.back-overlay-button {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + 12px);
  left: calc(env(safe-area-inset-left, 0px) + 12px);
  z-index: 15;
  pointer-events: none;

  .back-overlay-button__btn {
    width: 44px;
    height: 44px;
    border-radius: 999px;
    border: none;
    display: flex;
    align-items: center;
    justify-content: center;
    background: rgba(0, 0, 0, 0.45) !important;
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.4);
    backdrop-filter: blur(14px);
    color: #fff;
    cursor: pointer;
    transition: transform 0.2s cubic-bezier(0.34, 1.56, 0.64, 1), background 0.15s ease;
    pointer-events: auto;

    &:hover {
      transform: translateY(-1px);
      background: rgba(0, 0, 0, 0.6) !important;
    }

    &:active {
      transform: scale(0.95);
      background: rgba(0, 0, 0, 0.75) !important;
    }

    :deep(.q-icon) {
      font-size: 24px;
      color: #fff;
    }
  }
}
</style>

