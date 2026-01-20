<template>
  <button
    type="button"
    class="profileMenuItem"
    :class="{ 'profileMenuItem--disabled': disabled }"
    @click="emitClick"
  >
    <div class="profileMenuItem-left">
      <img v-if="iconSrc" :src="iconSrc" alt="" class="profileMenuItem-icon" />
      <span class="profileMenuItem-label">{{ label }}</span>
    </div>

    <q-icon name="chevron_right" size="22px" class="profileMenuItem-chevron" />
  </button>
</template>

<script setup lang="ts">
const props = defineProps<{
  label: string;
  iconSrc?: string;
  disabled?: boolean;
}>();

const emit = defineEmits<{
  (e: "click"): void;
}>();

const emitClick = () => {
  if (props.disabled) return;
  emit("click");
};
</script>

<style scoped lang="scss">
.profileMenuItem {
  width: 100%;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  padding: 16px 14px;
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  background: rgba(255, 255, 255, 0.06);
  color: #fff;
  cursor: pointer;
  text-align: left;
}

.profileMenuItem-left {
  display: flex;
  align-items: center;
  gap: 12px;
  min-width: 0;
}

.profileMenuItem-icon {
  width: 20px;
  height: 20px;
  object-fit: contain;
  opacity: 0.95;
}

.profileMenuItem-label {
  font-family: poppinsSemiBold;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.95);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.profileMenuItem-chevron {
  color: rgba(255, 255, 255, 0.7);
}

.profileMenuItem:active {
  transform: scale(0.99);
}

.profileMenuItem--disabled {
  opacity: 0.45;
  cursor: not-allowed;
}
</style>

