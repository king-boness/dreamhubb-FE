<template>
  <div class="row col-12">
    <div class="col-12">
      <p class="explainTitle">{{ $t("registerTitle2") }}</p>
      <SwiperComponent :options="options" @changed="props.changeGoal" />
    </div>
    <p class="registerText">{{ $t("registerText2") }}</p>
  </div>
</template>
<script setup lang="ts">
import SwiperComponent from "src/components/partials/SwiperComponent.vue";
import { RegistrationOptions } from "src/components/models";
import { PropType } from "vue";

const props = defineProps({
  changeGoal: {
    type: Function as PropType<(goal: string) => void>,
    required: true
  }
});

const options: RegistrationOptions[] = [
  {
    id: 1,
    title: "problem"
  },
  {
    id: 2,
    title: "dream"
  },
  {
    id: 3,
    title: "idea"
  }
];
</script>
