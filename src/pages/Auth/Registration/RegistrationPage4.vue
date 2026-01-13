<template>
  <div class="registerBody col-12">
    <p class="explainTitle registerLocationTitle">{{ $t("registerTitle4") }}</p>
    <img src="/images/Auth/map-image.svg" alt="" class="registerImg" />
    <div class="row col-12 container">
      <q-form class="">
        <div class="inputContainer">
          <div class="q-gutter-md row">
            <q-select
              borderless
              label="Choose your country"
              label-color="grey-6"
              class="registerLocation"
              v-model="data.state"
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              :options="filteredData"
              @filter="(val, update) => filterFn(val, update, states)"
              style="width: 300px"
              behavior="menu"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>
        <div class="inputContainer">
          <div class="q-gutter-md row">
            <q-select
              borderless
              label="Choose your state"
              label-color="grey-6"
              class="registerLocation"
              v-model="data.country"
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              :options="filteredData"
              @filter="(val, update) => filterFn(val, update, countries)"
              style="width: 300px"
              behavior="menu"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>
        <div class="inputContainer">
          <div class="q-gutter-md">
            <q-select
              borderless
              class="registerLocation"
              label="Choose your city"
              label-color="grey-6"
              v-model="data.city"
              use-input
              hide-selected
              fill-input
              input-debounce="0"
              :options="filteredData"
              @filter="(val, update) => filterFn(val, update, cities)"
              style="width: 300px"
              behavior="menu"
            >
              <template v-slot:no-option>
                <q-item>
                  <q-item-section class="text-grey">
                    No results
                  </q-item-section>
                </q-item>
              </template>
            </q-select>
          </div>
        </div>
      </q-form>
    </div>
    <p class="registerText">{{ $t("registerText4") }}</p>
  </div>
</template>
<script setup lang="ts">
import { watch, defineProps, reactive, PropType, ref } from "vue";

interface Props {
  changeCountry: (state: string, country: string, city: string) => void;
}

const props: Props = defineProps({
  changeCountry: {
    type: Function as PropType<Props["changeCountry"]>,
    required: true
  }
});

const data = reactive({
  state: "",
  country: "",
  city: ""
});

watch(data, () => {
  props.changeCountry(data.state, data.country, data.city);
});

const countries = ["USA", "Canada", "Mexico"];
const states = ["Alabama", "Alaska", "Arizona", "Arkansas", "California"];
const cities = ["New York", "Los Angeles", "Chicago", "Houston", "Phoenix"];
const filteredData = ref([""]);

const filterFn = (
  val: string,
  update: (par: () => void) => void,
  type: Array<string>
) => {
  update(() => {
    const needle = val.toLowerCase();
    filteredData.value = type.filter(
      (v: string) => v.toLowerCase().indexOf(needle) > -1
    );
  });
};
</script>
<style lang="scss" scoped>
.registerLocation {
  width: 100%;
  user-select: none;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  -webkit-tap-highlight-color: transparent;

  :deep(.q-field__control) {
    will-change: transform;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    transition: all 0.2s ease;
  }

  :deep(.q-select) {
    will-change: transform;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
  }

  :deep(.q-menu) {
    will-change: transform, opacity;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    backface-visibility: hidden;
    -webkit-backface-visibility: hidden;
    transform-origin: top center;
  }

  :deep(.q-menu:not(.q-menu--hide)) {
    animation: slideDownFade 0.25s cubic-bezier(0.4, 0, 0.2, 1);
  }

  :deep(.q-list) {
    padding: 4px 0;
    max-height: 300px;
    overflow-y: auto;
    scroll-behavior: smooth;
  }

  :deep(.q-item) {
    will-change: transform, opacity;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
    transition: background-color 0.2s ease, transform 0.15s ease;
    opacity: 0;
    transform: translateY(-4px);
    animation: fadeInUp 0.2s ease forwards;

    @for $i from 1 through 20 {
      &:nth-child(#{$i}) {
        animation-delay: #{$i * 0.015}s;
      }
    }

    &:hover {
      transform: translateY(0) scale(1.01);
      background-color: rgba(189, 0, 67, 0.1);
    }

    &.q-item--active {
      opacity: 1;
      transform: translateY(0);
    }
  }

  :deep(.q-field__native) {
    will-change: transform;
    transform: translateZ(0);
    -webkit-transform: translateZ(0);
  }
}

@keyframes slideDownFade {
  0% {
    opacity: 0;
    transform: translateY(-8px) scale(0.96);
  }
  100% {
    opacity: 1;
    transform: translateY(0) scale(1);
  }
}

@keyframes fadeInUp {
  0% {
    opacity: 0;
    transform: translateY(-4px);
  }
  100% {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
