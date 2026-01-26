<template>
  <div class="filter searchFilter">
    <div class="filterBtnDiv">
      <q-btn @click="isFilter = !isFilter" class="filterBtn">
        <img src="../../assets/icons/optionIcon.png" class="filterBtnImg" />
        <div>Filters</div>
      </q-btn>
    </div>
    <Transition name="slide-fade">
      <div v-if="isFilter" class="filter-options">
        <div class="category">
          <p class="categoryTitle">Category</p>
          <SwiperComponent
            :options="categoryOptions"
            :horizontal="true"
            @changed="state.categoryOptions = $event"
          />
        </div>
        <div class="sub-category">
          <p class="categoryTitle">Sub-category</p>
          <SwiperComponent
            :options="subCategoryOptions"
            :horizontal="true"
            @changed="state.subCategoryOptions = $event"
          />
        </div>
        <div class="input-fields">
          <q-input
            borderless
            dark
            label-color="grey-6"
            v-model="state.keyWord"
            label="Add keywords"
            class="registerDatas"
          />
          <q-select
            dark
            borderless
            label="Choose your country"
            label-color="grey-6"
            class="registerDatas"
            v-model="state.country"
            use-input
            hide-selected
            fill-input
            input-debounce="0"
            :options="filteredData"
            @filter="(val, update) => filterFn(val, update, countries)"
            behavior="menu"
          >
            <template v-slot:no-option>
              <q-item>
                <q-item-section class="text-grey"> No results </q-item-section>
              </q-item>
            </template>
          </q-select>
        </div>
        <div class="applyBtnDiv">
          <button text-color="white" class="buttonRegister">
            Apply filters
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import SwiperComponent from "./SwiperComponent.vue";
import { RegistrationOptions } from "src/components/models";

const isFilter = ref(false);
const categoryOptions: RegistrationOptions[] = [
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
const subCategoryOptions: RegistrationOptions[] = [
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
const state = reactive({
  categoryOptions: "",
  subCategoryOptions: "",
  keyWord: "",
  country: ""
});

watch(state, () => {
  // no logs
});

const countries = ["USA", "Canada", "Mexico"];
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
<style scoped lang="scss">
.filter {
  background-image: none;
}
.tabDiv {
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 0 0.8rem;
}

.order-tabs {
  background-image: none;
}

.slide-fade-enter-active {
  transition: all 0.1s ease-out;
}

.slide-fade-leave-active {
  transition: all 0.1s cubic-bezier(1, 0.5, 0.8, 1);
}

.slide-fade-enter-from,
.slide-fade-leave-to {
  transform: translateY(20px);
  opacity: 0;
}
</style>
