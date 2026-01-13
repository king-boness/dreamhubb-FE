<template>
  <div class="btn-container segmented-toggle-container">
    <div
      class="toggle-btn segmented-toggle-btn"
      :class="{ active: modelValue === options[0] }"
      @click="handleClick"
    >
      <span class="segmented-toggle-option-left">{{ options[0] }}</span>
      <span class="segmented-toggle-option-right">{{ options[1] }}</span>
      <div class="inner-circle segmented-toggle-circle"></div>
    </div>
  </div>
</template>

<script setup lang="ts">
interface Props {
  modelValue: string;
  options: [string, string]; // Tuple of two option labels
}

const props = defineProps<Props>();

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const handleClick = () => {
  // Toggle between the two options
  const newValue = props.modelValue === props.options[0] ? props.options[1] : props.options[0];
  emit("update:modelValue", newValue);
};
</script>

<style lang="scss" scoped>
.segmented-toggle-container {
  width: 100%; // Full width of parent, will be constrained by parent
  border-radius: 6.25rem;
  border: 0.1rem solid $primary;
  display: flex;
}

.segmented-toggle-btn {
  width: 100%; // Full width of container
  height: 40px;
  background-color: transparent !important;
  border-radius: 6.25rem;
  cursor: pointer;
  position: relative;
  display: flex;
  -webkit-transition: all 0.3s 0.1s ease-in-out;
  -moz-transition: all 0.3s 0.1s ease-in-out;
  -o-transition: all 0.3s 0.1s ease-in-out;
  transition: all 0.3s 0.1s ease-in-out;
}

.segmented-toggle-circle {
  width: 50% !important; // Each half takes 50% width
  height: 40px;
  background: $primary;
  border-radius: 6.25rem;
  position: absolute;
  top: 0;
  left: 0;
  -webkit-transition: all 0.3s 0.1s ease-in-out;
  -moz-transition: all 0.3s 0.1s ease-in-out;
  -o-transition: all 0.3s 0.1s ease-in-out;
  transition: all 0.3s 0.1s ease-in-out;
}

.segmented-toggle-btn.active > .segmented-toggle-circle {
  margin-left: 50% !important; // Move to right half when active
}

.segmented-toggle-option-left {
  position: absolute;
  z-index: 1;
  color: white;
  font-family: poppins;
  top: 50%;
  left: 25%; // Center of left half
  transform: translate(-50%, -50%);
  font-size: 0.9rem;
  white-space: nowrap;
  text-align: center;
  padding: 8px 18px; // Sufficient horizontal padding
  box-sizing: border-box;
}

.segmented-toggle-option-right {
  position: absolute;
  z-index: 1;
  color: white;
  font-family: poppins;
  top: 50%;
  left: 75%; // Center of right half
  transform: translate(-50%, -50%);
  font-size: 0.9rem;
  white-space: nowrap;
  text-align: center;
  padding: 8px 18px; // Sufficient horizontal padding
  box-sizing: border-box;
}
</style>
