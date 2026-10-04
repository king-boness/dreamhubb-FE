<template>
  <div class="dhPageTitle" :class="{ 'dhPageTitle--withAction': hasAction }">
    <h2 class="dhPageTitle-heading">{{ title }}</h2>
    <div v-if="hasAction" class="dhPageTitle-action">
      <slot name="action" />
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed, useSlots } from "vue";

defineProps<{
  title: string;
}>();

const slots = useSlots();
const hasAction = computed(() => !!slots.action);
</script>

<style scoped lang="scss">
.dhPageTitle {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 1.5rem 1.2rem 1rem 1.2rem;
}

.dhPageTitle--withAction {
  justify-content: space-between;
  gap: 0.75rem;
  flex-wrap: wrap;
}

.dhPageTitle-heading {
  color: white;
  font-size: 1.7rem;
  font-family: poppinsSemiBold;
  margin: 0;
  text-align: center;
}

.dhPageTitle--withAction .dhPageTitle-heading {
  text-align: left;
  flex: 1 1 auto;
  min-width: 0;
  font-size: clamp(1.25rem, 4vw, 1.7rem);
}

.dhPageTitle-action {
  flex: 0 0 auto;
  display: flex;
  align-items: center;
}
</style>
