<template>
  <div
    class="dhHintBubble"
    :class="[
      `dhHintBubble--arrow-${arrow}`,
      { 'dhHintBubble--clickable': clickable }
    ]"
    :role="clickable ? 'button' : undefined"
    :tabindex="clickable ? 0 : undefined"
    @click="clickable ? emit('click') : undefined"
    @keyup.enter.space="clickable ? emit('click') : undefined"
  >
    <button
      v-if="showClose"
      class="dhHintBubble-close"
      type="button"
      aria-label="Close hint"
      @click.stop="emit('close')"
    >
      ×
    </button>

    <div class="dhHintBubble-content">
      <h3 v-if="title" class="dhHintBubble-title">{{ title }}</h3>
      <p class="dhHintBubble-text">{{ text }}</p>
      <slot />
    </div>

    <div class="dhHintBubble-arrow" />
  </div>
</template>

<script setup lang="ts">
withDefaults(defineProps<{
  title?: string;
  text: string;
  arrow?: "up" | "down";
  clickable?: boolean;
  showClose?: boolean;
}>(), {
  title: "",
  arrow: "down",
  clickable: false,
  showClose: false
});

const emit = defineEmits<{
  click: [];
  close: [];
}>();
</script>

<style scoped lang="scss">
.dhHintBubble {
  position: relative;
  background: linear-gradient(135deg, rgba(189, 0, 67, 0.95), rgba(255, 0, 110, 0.95));
  border-radius: 1rem;
  padding: 1rem 1.5rem;
  max-width: 320px;
  width: calc(100% - 3rem);
  box-shadow: 0 8px 24px rgba(189, 0, 67, 0.4);
  animation: fadeInUp 0.3s ease-out;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.dhHintBubble--clickable {
  cursor: pointer;
}

@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(10px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.dhHintBubble-close {
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  background: transparent;
  border: none;
  color: white;
  font-size: 1.5rem;
  line-height: 1;
  cursor: pointer;
  padding: 0;
  width: 1.5rem;
  height: 1.5rem;
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0.8;
  transition: opacity 0.2s;
}

.dhHintBubble-close:hover {
  opacity: 1;
}

.dhHintBubble-content {
  color: white;
  text-align: center;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.5rem 0;
  margin-top: -4px;
  transform: translateY(-4px);
}

.dhHintBubble-title {
  font-family: poppinsSemiBold;
  font-size: 1rem;
  margin: 0 0 0.5rem 0;
  color: white;
  text-align: center;
}

.dhHintBubble-text {
  font-family: poppins;
  font-size: 0.85rem;
  margin: 0;
  color: rgba(255, 255, 255, 0.95);
  line-height: 1.4;
  text-align: center;
}

.dhHintBubble-arrow {
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  width: 0;
  height: 0;
  border-left: 0.75rem solid transparent;
  border-right: 0.75rem solid transparent;
}

.dhHintBubble--arrow-down .dhHintBubble-arrow {
  bottom: -0.5rem;
  border-top: 0.75rem solid rgba(189, 0, 67, 0.95);
}

.dhHintBubble--arrow-up .dhHintBubble-arrow {
  top: -0.5rem;
  border-bottom: 0.75rem solid rgba(189, 0, 67, 0.95);
}
</style>
