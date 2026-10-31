<template>
  <component
    :is="inline ? 'div' : 'q-page-sticky'"
    v-bind="inline ? { class: 'dhBottomCta dhBottomCta--inline' } : { position: 'bottom', expand: true, class: 'dhBottomCta' }"
  >
    <div class="dhBottomCta-bar" :class="{ 'dhBottomCta-bar--inline': inline }">
      <q-btn
        class="dhBottomCta-btn"
        :class="{ 'dhBottomCta-btn--inline': inline }"
        color="primary"
        unelevated
        no-caps
        :loading="loading"
        :disable="disabled || loading"
        @click="emit('click')"
      >
        <img v-if="iconSrc" :src="iconSrc" alt="" class="dhBottomCta-icon" />
        <span>{{ loading ? (loadingLabel || label) : label }}</span>
      </q-btn>
    </div>
  </component>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label: string;
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  iconSrc?: string;
  /** When true, render full-width in-flow CTA (desktop edit panel) instead of sticky footer. */
  inline?: boolean;
}>(), {
  loading: false,
  loadingLabel: "",
  disabled: false,
  iconSrc: "",
  inline: false
});

const emit = defineEmits<{
  click: [];
}>();
</script>

<style scoped lang="scss">
.dhBottomCta {
  z-index: 2000;
}

.dhBottomCta--inline {
  position: static;
  z-index: auto;
  width: 100%;
  margin-top: 0.5rem;
}

/* Matches existing HELP TO FULFILL sticky footer styling */
.dhBottomCta-bar {
  width: 100%;
  max-width: 390px;
  margin-left: auto;
  margin-right: auto;
  background: linear-gradient(
    to top,
    rgba(2, 3, 7, 0.95) 0%,
    rgba(2, 3, 7, 0.98) 50%,
    rgba(2, 3, 7, 1) 100%
  );
  backdrop-filter: blur(20px);
  padding: 1rem 20px;
  padding-bottom: calc(1rem + env(safe-area-inset-bottom, 0px));
  box-shadow: 0 -4px 20px rgba(0, 0, 0, 0.5);
  border-top: 1px solid rgba(255, 255, 255, 0.1);
}

.dhBottomCta-bar--inline {
  max-width: none;
  margin: 0;
  padding: 0;
  padding-bottom: 0;
  background: transparent;
  backdrop-filter: none;
  box-shadow: none;
  border-top: none;
}

.dhBottomCta-btn {
  background-color: $primary;
  color: white;
  border: none;
  font-size: 1.2rem;
  height: 3.5rem;
  width: 100%;
  font-family: montseraatSemiBold;
  border-radius: 0.5rem !important;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  max-width: 390px;
  margin: 0 auto;
}

.dhBottomCta-btn--inline {
  max-width: none;
  margin: 0;
  font-family: poppinsSemiBold, poppins, sans-serif;
  font-size: 1rem;
  height: 3.25rem;
  border-radius: 0.75rem !important;
}

.dhBottomCta-icon {
  height: 1.2rem;
  width: auto;
}
</style>
