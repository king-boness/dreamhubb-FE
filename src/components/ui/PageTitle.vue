<template>
  <div class="dhPageTitle">
    <h2 class="dhPageTitle-heading">{{ title }}</h2>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  title: string;
}>();
</script>

<style scoped lang="scss">
.dhPageTitle {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
  padding: 1.5rem 1.2rem 1rem 1.2rem;
}

.dhPageTitle-heading {
  color: white;
  font-size: 1.7rem;
  font-family: poppinsSemiBold;
  margin: 0;
  text-align: center;
}
</style>
