<template>
  <Transition name="slide-fade">
    <div v-if="!isFilter" class="order-tabs">
      <q-tabs
        v-model="tab"
        dense
        class="filterComponent"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        inline-label
        active-class="activeTab"
      >
        <q-tab name="byHelp" :label="t('byHelp')" style="" class="tab"
          ><svg
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M12 21.35L10.55 20.03C5.4 15.36 2 12.27 2 8.5C2 5.41 4.42 3 7.5 3C9.24 3 10.91 3.81 12 5.08C13.09 3.81 14.76 3 16.5 3C19.58 3 22 5.41 22 8.5C22 12.27 18.6 15.36 13.45 20.03L12 21.35Z"
              fill="#FCFCFC"
            />
          </svg>
        </q-tab>

        <q-tab name="byPay" :label="t('byPay')" style="" class="tab"
          ><svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              fill-rule="evenodd"
              clip-rule="evenodd"
              d="M21.1699 10.4389C15.9604 12.1368 12.3008 15.5696 10.7285 20.9797C9.00732 15.615 5.25425 12.2847 7.23069e-05 10.7311C5.20954 9.03439 8.86899 5.60025 10.4416 0.189569C12.1625 5.55477 15.9155 8.88644 21.1701 10.4389L21.1699 10.4389Z"
              fill="#FCFCFC"
            />
          </svg>
        </q-tab>

        <q-tab name="byTop" :label="t('byTop')" style="" class="tab"
          ><svg
            width="22"
            height="22"
            viewBox="0 0 22 22"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M10.5611 4.18332C10.7712 4.17596 10.9783 4.24785 11.1336 4.40253L15.9245 9.19842C16.2589 9.53401 16.2789 10.0529 15.9687 10.3631L15.2568 11.0762C14.9466 11.3864 14.428 11.3661 14.0939 11.032L12.0924 9.0287V16.2548C12.0924 16.6617 11.7904 16.9873 11.4144 16.9873H9.73407C9.35782 16.9873 9.05375 16.6617 9.05375 16.2548V9.0287L7.0546 11.032C6.71842 11.3664 6.19955 11.3864 5.88989 11.0762L5.17744 10.3631C4.86777 10.0529 4.88899 9.53401 5.22341 9.19842L9.96861 4.44732C10.136 4.27996 10.3511 4.19069 10.5611 4.18332ZM10.5732 0C7.7694 0 5.07962 1.11522 3.09668 3.09992C1.11404 5.08581 0 7.77736 0 10.5862C0 13.392 1.11404 16.0854 3.09668 18.0701C5.07962 20.0548 7.7694 21.17 10.5732 21.17C13.3785 21.17 16.0671 20.0548 18.0497 18.0701C20.0327 16.0854 21.147 13.392 21.147 10.5862C21.147 7.77736 20.033 5.08581 18.0497 3.09992C16.0671 1.11551 13.3785 0 10.5732 0Z"
              fill="#FCFCFC"
            />
          </svg>
        </q-tab>
      </q-tabs>
    </div>
  </Transition>
  <div class="filter scroll">
    <div class="filterBtnDiv">
      <q-btn @click="isFilter = !isFilter" class="filterBtn">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="17"
          height="16"
          viewBox="0 0 17 16"
          fill="none"
          class="filterBtnImg"
        >
          <path
            fill-rule="evenodd"
            clip-rule="evenodd"
            d="M5.16667 2C5.75791 2.00008 6.33239 2.19655 6.79985 2.55855C7.26732 2.92056 7.6013 3.42759 7.74933 4H13.1667V5.33333H7.74933C7.58551 5.96033 7.19909 6.50626 6.66222 6.8692C6.12535 7.23214 5.47473 7.38727 4.83185 7.30562C4.18898 7.22398 3.59779 6.91114 3.16868 6.42552C2.73958 5.9399 2.50189 5.3147 2.5 4.66667C2.5 3.95942 2.78095 3.28115 3.28105 2.78105C3.78115 2.28095 4.45942 2 5.16667 2ZM5.16667 6C5.52029 6 5.85943 5.85952 6.10948 5.60948C6.35952 5.35943 6.5 5.02029 6.5 4.66667C6.5 4.31304 6.35952 3.97391 6.10948 3.72386C5.85943 3.47381 5.52029 3.33333 5.16667 3.33333C4.81304 3.33333 4.47391 3.47381 4.22386 3.72386C3.97381 3.97391 3.83333 4.31304 3.83333 4.66667C3.83333 5.02029 3.97381 5.35943 4.22386 5.60948C4.47391 5.85952 4.81304 6 5.16667 6ZM11.8333 13.3333C11.2421 13.3333 10.6676 13.1368 10.2001 12.7748C9.73268 12.4128 9.3987 11.9057 9.25067 11.3333H3.83333V10H9.25067C9.41449 9.37301 9.80091 8.82707 10.3378 8.46413C10.8747 8.10119 11.5253 7.94606 12.1681 8.02771C12.811 8.10936 13.4022 8.42219 13.8313 8.90781C14.2604 9.39343 14.4981 10.0186 14.5 10.6667C14.5 11.3739 14.219 12.0522 13.719 12.5523C13.2189 13.0524 12.5406 13.3333 11.8333 13.3333ZM11.8333 12C12.187 12 12.5261 11.8595 12.7761 11.6095C13.0262 11.3594 13.1667 11.0203 13.1667 10.6667C13.1667 10.313 13.0262 9.97391 12.7761 9.72386C12.5261 9.47381 12.187 9.33333 11.8333 9.33333C11.4797 9.33333 11.1406 9.47381 10.8905 9.72386C10.6405 9.97391 10.5 10.313 10.5 10.6667C10.5 11.0203 10.6405 11.3594 10.8905 11.6095C11.1406 11.8595 11.4797 12 11.8333 12Z"
            fill="#FCFCFC"
          />
        </svg>
        <div class="filtercomponent-title">{{ t("filters") }}</div>
      </q-btn>
    </div>
    <Transition name="slide-fade">
      <div v-if="isFilter" class="filter-options">
        <div class="category">
          <p class="categoryTitle">{{ t("category") }}</p>
          <SwiperComponent
            :options="categoryOptions"
            :horizontal="true"
            @changed="state.categoryOptions = $event"
          />
        </div>
        <div class="sub-category">
          <p class="categoryTitle">{{ t("subCategory") }}</p>
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
          <q-btn text-color="white" class="applyFilterButton">
            Apply filters
          </q-btn>
        </div>
      </div>
    </Transition>
  </div>
</template>
<script setup lang="ts">
import { reactive, ref, watch } from "vue";
import { useI18n } from "vue-i18n";
import SwiperComponent from "./SwiperComponent.vue";
import { RegistrationOptions } from "src/components/models";

const { t } = useI18n();
const tab = ref("byHelp");
const isFilter = ref(false);

const categoryOptions: RegistrationOptions[] = [
  {
    id: 3,
    title: "idea"
  },
  {
    id: 2,
    title: "dream"
  },
  {
    id: 1,
    title: "problem"
  }
];
const subCategoryOptions: RegistrationOptions[] = [
  {
    id: 6,
    title: "profession"
  },
  {
    id: 7,
    title: "events"
  },
  {
    id: 8,
    title: "others"
  },
  {
    id: 3,
    title: "traveling"
  },
  {
    id: 2,
    title: "health"
  },
  {
    id: 1,
    title: "learning"
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
  if (process.env.NODE_ENV === "development") {
    console.log(state);
  }
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
<style lang="scss">
.input-fields {
  .registerDatas {
    .q-field__label {
      font-size: 0.9rem !important;
    }
  }
}
</style>
<style scoped lang="scss">
.body--light {
  .filterBtnDiv .filterBtn {
    background: rgba(15, 0, 38, 0.181);
    * {
      fill: black;
    }
  }
}
.applyBtnDiv {
  display: flex;
  justify-content: center;
  width: 100%;
}
.order-tabs {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}
</style>
<style lang="scss">
.filter-options {
  width: 100%;
}
.q-tab__content {
  display: flex;
  flex-direction: row-reverse; /* Reverses the order of label and icon */
  align-items: center; /* Vertically aligns label and icon */
  svg {
    margin-right: 0.5rem;
  }
}

.applyFilterButton {
  background-color: rgba(182, 0, 67, 1);
  color: white;
  border: none;
  font-size: 1.2rem;
  height: 3.2rem;
  width: 22rem;
  font-family: montseraatSemiBold;
  border-radius: 0.5rem !important;
  margin-bottom: 4rem !important;
}
.filtercomponent-title {
  font-family: poppinsSemiBold;
}
.filter {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  width: 100%;
}
.tabDiv {
  display: flex;
  align-items: center;
  justify-content: center;

  padding: 0 0.8rem;
}
.input-fields {
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
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
.filterComponent {
  display: flex;
  justify-content: center;
  width: 100%;
  align-items: center;
  padding: 0 0.5rem;
  padding-top: 0.4rem;
  .q-tab__content {
    padding-bottom: 0.4rem;
    text-transform: none;
    font-family: poppinsMedium;
    color: white;
  }
  .q-ripple {
    display: none;
  }
}
.activeTab {
  * {
    fill: $primary !important;
    color: $primary !important;
  }
}
</style>
