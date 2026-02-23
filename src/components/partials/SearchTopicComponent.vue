<template>
  <div class="searchTopic-component">
    <span>{{ props.topic.topicTitle }}</span>
  </div>
</template>
<script setup lang="ts">
import { defineProps, PropType } from "vue";
import { Topic } from "src/components/models";
interface Props {
  topic: Topic;
}

const props: Props = defineProps({
  topic: {
    type: Object as PropType<Topic>,
    required: true
  }
});
</script>

<style scoped lang="scss">
.searchTopic-component {
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
