<template>
  <div class="close-overlay-button">
    <q-btn
      round
      flat
      dense
      class="close-overlay-button__btn"
      :icon="closeIcon"
      @click="handleClick"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useRouter } from "vue-router";

interface Props {
  onClick?: () => void;
}

const props = defineProps<Props>();

const router = useRouter();

const closeIcon = computed(() => "img:/assets/icons/post/icon-close.svg");

const handleClick = () => {
  if (props.onClick) {
    props.onClick();
  } else {
    // Default behavior: same as PostDetailPage
    if (window.history.length > 1) {
      router.back();
    } else {
      // Fallback based on current route
      const currentRoute = router.currentRoute.value;
      if (currentRoute.name?.toString().includes("donee")) {
        router.push({ name: "donee-posts" });
      } else if (currentRoute.name?.toString().includes("donor")) {
        router.push({ name: "donor-posts" });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.close-overlay-button {
  position: absolute;
  top: calc(env(safe-area-inset-top, 0px) + 10px);
  left: 1rem;
  z-index: 15;
  pointer-events: none;

  .close-overlay-button__btn {
    width: 40px;
    height: 40px;
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
      font-size: 20px;
      color: #fff;
    }
  }
}
</style>
