<template>
  <div class="row col-12">
    <p v-if="!horiz" class="explainTitle registrationTitle">
      {{ $t("registerTitle1") }}
    </p>
    <p v-else class="explainTitle registrationTitle">
      Who is {{ props.registrationInfo.side }}?
    </p>
    <div class="col-12">
      <SwiperComponent
        :options="options"
        :horizontal="horiz"
        @changed="props.changeSide"
        :key="rerender"
        class="swiper"
        :next-page="nextPage"
        :class="{ horizontalSwiper: horiz }"
      />
    </div>
    <img
      src="/images/Auth/swipingIcon.svg"
      alt=""
      class="swipingIcon"
      v-if="horiz"
    />
    <q-btn class="register-questionButton" @click="changeSwiper"
      ><img src="/images/Auth/question-icon.svg" alt=""
    /></q-btn>
    <p v-if="!horiz" class="registerText swiperText">
      {{ $t("registerText1") }}
    </p>
    <p
      v-if="props.registrationInfo.side == 'Donor' && horiz"
      class="registerText horizText"
    >
      {{ donor.text }}
    </p>
    <p
      v-if="props.registrationInfo.side == 'Donee' && horiz"
      class="registerText horizText"
    >
      {{ donee.text }}
    </p>
  </div>
</template>
<style lang="scss">
.horizontalSwiper {
  margin: 0 auto !important;
  height: 19rem !important;
  * {
    height: 13rem !important;
    width: 100% !important;
  }
}
</style>
<style scoped lang="scss">
.horizText {
  font-size: 1rem;
  margin-top: 0rem !important;
  margin-bottom: 5.8rem;
}
.swipingIcon {
  position: absolute;
  left: 50%;
  transform: translate(-50%, 0);
  top: 46%;
  width: 2.5rem;
}
.register-questionButton {
  height: 1rem;
  width: 1rem;
  border-radius: 50%;
  position: absolute;
  right: 1rem;
  top: 48%;
}
.swiper {
  width: 18rem;
  height: 30rem;
  margin: 0 auto;
}
.swiperText {
  margin-top: 2.3rem !important;
}
</style>
<script setup lang="ts">
import SwiperComponent from "src/components/partials/SwiperComponent.vue";
import {
  RegistrationOptions,
  donorDescription,
  doneeDescription
} from "src/components/models";
import { PropType, ref, defineEmits } from "vue";

const emit = defineEmits(["changedHoriz"]);

const horiz = ref(false);
const rerender = ref(1);
const changeSwiper = () => {
  horiz.value = !horiz.value;
  rerender.value++;
  emit("changedHoriz", horiz.value);
};
const props = defineProps({
  changeSide: {
    type: Function as PropType<(side: string) => void>,
    required: true
  },
  nextPage: {
    type: Function as PropType<(event: MouseEvent) => void>,
    required: false
  },
  registrationInfo: {
    type: Object,
    required: true
  }
});

const donee = ref({
  text: "Any person that can give or provide anything or any service that someone else might be interested in and find valuable. There is a variety of ways in which the mentor can help donees. He or she can either help in a full or just partially or anything in between depending on his or her skills, means, and abilities."
} as doneeDescription);
const donor = ref({
  text: "Any person that can give or provide anything or any service that someone else might be interested in and find valuable. There is a variety of ways in which the mentor can help donees. He or she can either help in a full or just partially or anything in between depending on his or her skills, means, and abilities."
} as donorDescription);

const options: RegistrationOptions[] = [
  {
    id: 1,
    title: "Donor"
  },
  {
    id: 2,
    title: "Donee"
  }
];
</script>
