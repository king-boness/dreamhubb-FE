<template>
  <div class="tokensPage">
    <BackOverlayButton :fallback="fallbackRoute" />
    <StatsFilterComponent></StatsFilterComponent>
  </div>
</template>
<script setup lang="ts">
import StatsFilterComponent from "src/components/partials/StatsFilterComponent.vue";
import { computed } from "vue";
import { useRoute } from "vue-router";
import BackOverlayButton from "src/components/common/BackOverlayButton.vue";

const route = useRoute();
const fallbackRoute = computed(() => {
  // Token shop is typically opened from tokens info page.
  return route.path.startsWith("/donee") ? { name: "donee-token" } : { name: "donor-token" };
});
</script>

<style scoped lang="scss">
.tokensPage {
  position: relative;
}
</style>
