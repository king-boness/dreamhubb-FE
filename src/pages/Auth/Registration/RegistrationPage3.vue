<template>
  <div class="row col-12">
    <div class="col-12">
      <p class="explainTitle">{{ $t("registerTitle3") }}</p>
      <SwiperComponent :options="options" @changed="props.changeDream" />
    </div>
    <p class="registerText">{{ $t("registerText3") }}</p>
  </div>
</template>
<script setup lang="ts">
import SwiperComponent from "src/components/partials/SwiperComponent.vue";
import { RegistrationOptions } from "src/components/models";
import { PropType } from "vue";

const props = defineProps({
  changeDream: {
    type: Function as PropType<(dream: string) => void>,
    required: true
  }
});

const options: RegistrationOptions[] = [
  {
    id: 1,
    title: "learning"
  },
  {
    id: 2,
    title: "health"
  },
  {
    id: 3,
    title: "traveling"
  },
  {
    id: 4,
    title: "possessions"
  },
  {
    id: 5,
    title: "relationships"
  }
];
</script>
