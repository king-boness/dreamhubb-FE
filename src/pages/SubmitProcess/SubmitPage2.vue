<template>
  <div class="submitPage1 submitPage2">
    <span v-if="!horiz" class="submitPage1-title submitPage-title">{{
      $t("postCreationTitle2")
    }}</span>
    <div class="" v-if="horiz">
      <div
        v-for="(item, i) in specificCategory"
        :key="i"
        class="categoryTitleContainer"
      >
        <p
          v-if="selectedItemIdFromChild == item.title"
          class="submitPage1-title"
        >
          {{ item.title }}
        </p>
      </div>
    </div>
    <SwiperComponent
      class="swiper"
      :options="props.specificCategory"
      :horizontal="horiz"
      :next-page="props.nextPage"
      :key="rerender"
      :class="{ horizontalSwiper: horiz }"
      @changed="handleSelectedItemId"
    />
    <img
      src="/images/Auth/swipingIcon.svg"
      alt=""
      class="swipingIcon"
      v-if="horiz"
    />
    <q-btn v-if="!horiz" class="register-questionButton" @click="changeSwiper"
      ><img src="/images/Auth/question-icon.svg" alt=""
    /></q-btn>
  </div>
</template>
<style lang="scss">
.horizontalSwiper {
  margin: 0 auto !important;
  height: 12rem !important;
  * {
    height: 10rem !important;
    width: 100% !important;
  }
}
</style>
<style scoped lang="scss">
.swiper {
  width: 17rem;
  margin: 0 auto;
  margin-top: 0.5rem;
  margin-bottom: 0.5rem;
}
.submitPage1 {
  display: flex;
  justify-content: center;
  align-content: center;
  flex-direction: column;
  text-align: center;
  gap: 1rem;
  margin-bottom: 13%;
  .submitPage1-title {
    color: white;
    font-size: 1.3rem;
    font-family: poppinsSemiBold;
    text-transform: capitalize;
  }
  .submitPage-title {
    width: 90%;
    margin-bottom: -1.95rem !important;
    margin: 0 auto;
  }
}
.swipingIcon {
  position: absolute;
  left: 50%;
  transform: translate(-50%, 0);
  top: 40%;
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
</style>
<script setup lang="ts">
import SwiperComponent from "src/components/partials/SwiperComponent.vue";
import { Category } from "src/components/models";

import { PropType, ref } from "vue";
const horiz = ref(false);
const rerender = ref(1);
const emit = defineEmits(["changedHoriz"]);
const selectedItemIdFromChild = ref(null);

const changeSwiper = () => {
  horiz.value = !horiz.value;
  rerender.value++;
  emit("changedHoriz", {
    horiz: horiz.value,
    selectedItemId: selectedItemIdFromChild.value
  });
};

const handleSelectedItemId = (itemId: any) => {
  selectedItemIdFromChild.value = itemId;
  emit("changedHoriz", { horiz: horiz.value, selectedItemId: itemId });
  // no logs
};

const props = defineProps({
  nextPage: {
    type: Function as PropType<(event: MouseEvent) => void>,
    required: false
  },
  specificCategory: {
    type: Array as PropType<Category[]>,
    required: true
  }
});
</script>
