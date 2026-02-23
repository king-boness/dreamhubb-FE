<template>
  <div class="searchHistory-component">
    <img src="/icons/history-icon.svg" alt="" />
    <span>{{ props.history.historyTitle }}</span>
  </div>
</template>
<script setup lang="ts">
import { defineProps, PropType } from "vue";
import { History } from "src/components/models";
interface Props {
  history: History;
}

const props: Props = defineProps({
  history: {
    type: Object as PropType<History>,
    required: true
  }
});
</script>

<style scoped lang="scss">
.searchHistory-component {
  display: flex;
  align-items: center;
  gap: 0.4rem;
  cursor: pointer;
  height: 1.1rem;
  span {
    color: rgb(198, 195, 195);
    font-size: 1.1rem;
  }
  img {
    height: 1.7rem;
  }
}
</style>
