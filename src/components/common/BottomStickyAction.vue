<template>
  <q-page-sticky position="bottom" expand class="bottom-sticky-action">
    <div 
      class="bottom-sticky-action-wrapper q-px-md q-pb-xl q-pt-md q-mt-lg"
      :style="safeAreaStyle"
    >
      <q-btn
        class="full-width primary-cta bottom-sticky-action-btn"
        color="primary"
        unelevated
        no-caps
        padding="14px 24px"
        :disable="disabled || loading"
        :loading="loading"
        @click="$emit('click')"
      >
        <template v-if="!loading">
          {{ label }}
        </template>
        <template v-else>
          {{ loadingLabel || label }}
        </template>
      </q-btn>
    </div>
  </q-page-sticky>
</template>

<script setup lang="ts">
import { computed } from "vue";

interface Props {
  label: string;
  loading?: boolean;
  loadingLabel?: string;
  disabled?: boolean;
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  loadingLabel: undefined,
  disabled: false
});

defineEmits<{
  click: [];
}>();

// Safe area inset for iOS (bottom padding)
const safeAreaStyle = computed(() => {
  // Use CSS env() for safe-area-inset-bottom if available
  return {
    paddingBottom: "calc(1.5rem + env(safe-area-inset-bottom, 0px))"
  };
});
</script>

<style scoped lang="scss">
.bottom-sticky-action {
  background: transparent;
  z-index: 1000;
}

.bottom-sticky-action-wrapper {
  width: 100%;
  max-width: 100%;
}

.primary-cta {
  border-radius: 999px;
  font-weight: 700;
  font-size: 15px;
  height: 60px;
  font-family: montseraatSemiBold;
}

.bottom-sticky-action-btn.q-btn--disabled {
  opacity: 0.45;
}

.bottom-sticky-action-btn.q-btn--loading {
  opacity: 0.8;
}
</style>
