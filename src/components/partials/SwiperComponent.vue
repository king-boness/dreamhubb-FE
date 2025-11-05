<template>
  <div class="flicking-camera">
    <Flicking
      :options="flickingOptions"
      :plugins="flickingPlugins"
      @changed="
        (e) => {
          $emit('changed', props.options[e.index].title);
        }
      "
    >
      <div
        v-for="item in props.options"
        :key="item.id"
        :class="[props.horizontal ? 'flicking-panel-vertical' : null]"
        @click="nextPage"
      >
        <q-img
          :src="'/icons/CategoryIcons/' + item.title + '.png'"
          class="img"
          v-if="!lightMode"
        />
        <q-img
          :src="'/icons/CategoryIcons/' + item.title + '-light.png'"
          class="img img-light"
          v-else
        />
      </div>
    </Flicking>
  </div>
</template>

<script setup lang="ts">
import { RegistrationOptions } from "src/components/models";
import { PropType, onMounted, onBeforeUnmount, ref, watch } from "vue";
import { Fade, Perspective } from "@egjs/flicking-plugins";
import Flicking from "@egjs/vue3-flicking";
const selectedItemId = ref<string | null>(null); // Initialize as null

interface Props {
  options: RegistrationOptions[];
  horizontal: boolean;
}
const props: Props = defineProps({
  options: {
    type: Array as PropType<RegistrationOptions[]>,
    required: true
  },
  horizontal: {
    type: Boolean,
    required: false
  },
  nextPage: {
    type: Function as PropType<(event: MouseEvent) => void>,
    required: false
  }
});
const flickingOptions = {
  horizontal: props.horizontal,
  inputType: ["mouse", "touch", "pointer"],
  defaultIndex: Math.round(props.options.length / 2) - 1,
  align: "center",
  circular: true
};
const flickingPlugins = [
  new Fade("", 1.2),
  new Perspective({ rotate: 0.5, scale: 2 })
];
const lightMode = ref(false);
const checkBodyClass = () => {
  lightMode.value = document.body.classList.contains("body--light");
};
onMounted(() => {
  checkBodyClass();
});
onBeforeUnmount(() => {
  checkBodyClass();
});

const emit = defineEmits(["changed"]);

emit("changed", props.options[flickingOptions.defaultIndex].title);

watch(selectedItemId, (newValue, oldValue) => {
  if (newValue !== oldValue) {
    emit("changed", newValue);
  }
});
</script>
<style lang="scss">
.flicking-viewport {
  width: 100%;
  height: 60vh;
}
.img {
  margin: 0.5rem 0;
}

.flicking-panel-vertical {
  width: 50%;
  height: 50%;
  justify-content: center;
  align-items: center;
  font-size: 32px;
  font-weight: bold;
  margin: 10px 0;
}
</style>
