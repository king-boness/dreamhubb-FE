<template>
  <div class="submitPage1">
    <span v-if="!horiz" class="submitPage1-title">{{
      $t("postCreationTitle1")
    }}</span>
    <div class="" v-if="horiz">
      <div
        v-for="item in props.category"
        :key="item.id"
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
      :options="props.category"
      :horizontal="horiz"
      :next-page="props.nextPage"
      :key="rerender"
      :class="{ horizontalSwiper: horiz }"
      @changed="handleSelectedItemId"
    ></SwiperComponent>
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
  width: 15rem;
  margin: 0 auto;
  margin-top: 1rem;
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
import { PropType, ref, defineEmits, onMounted } from "vue";
import SwiperComponent from "src/components/partials/SwiperComponent.vue";
import { Category } from "src/components/models";
const horiz = ref(false);
const rerender = ref(1);
const emit = defineEmits(["changedHoriz"]);
const selectedItemIdFromChild = ref(null);

onMounted(() => {
  // no logs
});

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
  category: {
    type: Array as PropType<Category[]>,
    required: true
  }
});
</script>
