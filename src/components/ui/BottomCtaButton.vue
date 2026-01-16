<template>
  <q-page-sticky position="bottom" expand class="dhBottomCta">
    <div class="dhBottomCta-bar">
      <q-btn
        class="dhBottomCta-btn"
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
  </q-page-sticky>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  label: string;
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
  iconSrc?: string;
}>(), {
  loading: false,
  loadingLabel: "",
  disabled: false,
  iconSrc: ""
});

const emit = defineEmits<{
  click: [];
}>();
</script>

<style scoped lang="scss">
.dhBottomCta {
  z-index: 2000;
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

.dhBottomCta-icon {
  height: 1.2rem;
  width: auto;
}
</style>

