<template>
  <div class="image-index-bars" :class="{ iphoneDevice: $q.platform.is.ios }">
    <div
      v-for="(bar, index) in props.count"
      :key="index"
      class="index-bar"
      :style="'width:' + $q.screen.width / props.count + 'px;'"
      :class="[index === selectedImageIndex ? 'selected' : '']"
    ></div>
  </div>
  <div class="flicking-camera">
    <Flicking
      :options="flickingOptions"
      @changed="(e) => (selectedImageIndex = e.index)"
    >
      <div
        v-for="(item, index) in props.images"
        :key="index"
        class="flicking-panel is-size-1 postDetail-img"
      >
        <img :src="item" class="postDetail-parallaxImg" />
      </div>
    </Flicking>
  </div>
</template>
<script setup lang="ts">
import { useQuasar } from "quasar";
import { ref, defineProps, PropType, watch, defineEmits } from "vue";
import Flicking from "@egjs/vue3-flicking";

const $q = useQuasar();
const emit = defineEmits(["change"]);
const props = defineProps({
  images: {
    type: Array as PropType<string[]>,
    required: true
  },
  count: {
    type: Number,
    required: true
  }
});
const flickingOptions = {
  inputType: ["mouse", "touch", "pointer"],
  defaultIndex: 0,
  align: "center",
  bound: true,
  duration: 100
};
const selectedImageIndex = ref(0);
const newIndexFunction = () => {
  emit("change", selectedImageIndex.value);
};
watch(selectedImageIndex, () => {
  newIndexFunction();
});
</script>

<style scoped lang="scss">
.image-index-bars {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: space-evenly;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  padding: 16px;
  z-index: 2;
}

.index-bar {
  height: 4px;
  background-color: #d3d6d745;
  border-radius: 5px;
  margin: 0 2.5px;
}

.index-bar.selected {
  background-color: #fff;
}

.flicking-viewport {
  width: 100%;
  height: 100%;
}
</style>
