<template>
  <router-view v-slot="{ Component }">
    <transition
      enter-active-class="animated fadeOut"
      leave-active-class="animated fadeOut"
      appear
      :duration="300"
    >
      <component :is="Component" />
    </transition>
  </router-view>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";

const $q = useQuasar();
$q.dark.toggle();
</script>
<style lang="scss">
:root {
  .slide-fade-enter-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1) !important;
  }
  .slide-fade-leave-active {
    transition: all 0.3s cubic-bezier(1, 0.5, 0.8, 1) !important;
  }
  --q-transition-duration: 0.5s;
}
</style>
