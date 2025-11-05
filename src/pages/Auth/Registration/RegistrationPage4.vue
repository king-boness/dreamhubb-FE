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
