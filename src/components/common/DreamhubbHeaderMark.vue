<template>
  <svg
    :key="isLight ? 'theme-light' : 'theme-dark'"
    class="dreamhubbHeaderMark"
    :class="{ 'dreamhubbHeaderMark--onLight': isLight }"
    viewBox="0 0 177 245"
    xmlns="http://www.w3.org/2000/svg"
    aria-hidden="true"
    focusable="false"
  >
    <g :clip-path="`url(#${clipId})`">
      <path
        fill-rule="evenodd"
        clip-rule="evenodd"
        d="M173.5 0H132.9V84.6C76.4998 48.3 -0.700156 90.5 -0.000156235 158.1C1.79984 256.4 136 277.5 168.8 186.3C159.1 191.6 145.5 190.8 136.6 184.5C109 235.6 31.0998 217.1 30.3998 158.1C30.7998 102.8 101.6 81.2 132.9 125.7C132.9 125.8 133 125.9 133 125.9C134.3 127.8 135.5 129.7 136.6 131.7C147.3 124.2 163.4 124.8 173.5 132.9V0Z"
        fill="#BD0043"
      />
      <path
        d="M154.2 180C166.295 180 176.1 170.195 176.1 158.1C176.1 146.005 166.295 136.2 154.2 136.2C142.105 136.2 132.3 146.005 132.3 158.1C132.3 170.195 142.105 180 154.2 180Z"
        fill="currentColor"
      />
    </g>
    <defs>
      <clipPath :id="clipId">
        <rect width="176.1" height="244.5" fill="white" />
      </clipPath>
    </defs>
  </svg>
</template>

<script setup lang="ts">
import { useId, ref, computed, onMounted, onBeforeUnmount, watch, nextTick } from "vue";
import { useQuasar } from "quasar";

/** Prop kept for call-site compatibility; logo color follows DOM `body--light` to avoid stale parent refs. */
defineProps<{
  isBodyLight?: boolean;
}>();

const $q = useQuasar();
const bodyLightFromDom = ref(false);

const syncFromDom = () => {
  if (typeof document === "undefined") return;
  bodyLightFromDom.value = document.body.classList.contains("body--light");
};

const isLight = computed(() => bodyLightFromDom.value);

let observer: MutationObserver | null = null;

onMounted(() => {
  syncFromDom();
  observer = new MutationObserver(() => {
    syncFromDom();
    requestAnimationFrame(() => {
      syncFromDom();
    });
  });
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });
});

watch(
  () => $q.dark.isActive,
  () => {
    nextTick(() => {
      syncFromDom();
      requestAnimationFrame(syncFromDom);
    });
  }
);

onBeforeUnmount(() => {
  observer?.disconnect();
  observer = null;
});

const clipId = `dh-logo-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
</script>

<style scoped lang="scss">
.dreamhubbHeaderMark {
  display: block;
  height: 1.6rem;
  width: auto;
  flex-shrink: 0;
  color: #fcfcfc;
}

.dreamhubbHeaderMark--onLight {
  color: #0f0026;
}
</style>
