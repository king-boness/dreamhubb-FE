<template>
  <div :class="['retryPanel', `retryPanel--${variant}`]" v-bind="$attrs">
    <p v-if="message" class="retryPanel-message">{{ message }}</p>
    <q-btn
      :class="['retryPanel-button', buttonClass]"
      :unelevated="variant === 'card'"
      :flat="variant === 'inline'"
      :no-caps="true"
      :color="variant === 'card' ? 'primary' : undefined"
      :disable="loading"
      :label="retryLabel"
      @click="handleRetry"
    />
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";

interface Props {
  message?: string;
  messageKey?: string;
  titleKey?: string;
  onRetry: () => void | Promise<void>;
  loading?: boolean;
  variant?: "inline" | "card";
  buttonClass?: string;
}

const props = withDefaults(defineProps<Props>(), {
  message: undefined,
  messageKey: undefined,
  titleKey: undefined,
  loading: false,
  variant: "inline",
  buttonClass: undefined
});

const { t } = useI18n();

const retryLabel = computed(() => {
  const label = t("common.actions.retry");
  return label === "common.actions.retry" ? "Retry" : label;
});

const handleRetry = async () => {
  await props.onRetry();
};
</script>

<style scoped lang="scss">
.retryPanel {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 3rem 0;
  color: rgba(255, 255, 255, 0.6);
  font-size: 0.95rem;

  &--inline {
    padding: 1rem 0;
    gap: 8px;
  }

  &--card {
    padding: 2rem 1rem;
    background: rgba(10, 6, 18, 0.5);
    border-radius: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
  }
}

.retryPanel-message {
  margin: 0;
  text-align: center;
  color: rgba(255, 255, 255, 0.7);
}

.retryPanel-button {
  font-family: poppinsSemiBold;

  .retryPanel--inline & {
    color: #ff4db8;
  }
}
</style>
