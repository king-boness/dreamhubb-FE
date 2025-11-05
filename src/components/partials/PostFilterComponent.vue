<template>
  <div class="stats-filter post-filter">
    <div class="order-tabs">
      <q-tabs
        class="text-grey filterTabs postFilter"
        active-color="primary"
        indicator-color="primary"
        align="justify"
        inline-label
        v-model="tab"
        active-class="activeTab"
      >
        <q-tab name="onGoing" label="Ongoing" class="postFilter onGoingTab"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M12 2V4"
              stroke="#FCFCFC"
              stroke-width="1.33333"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M17 3.33975L16 5.0718"
              stroke="#FCFCFC"
              stroke-width="1.33333"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M20.6602 7L18.9281 8"
              stroke="#FCFCFC"
              stroke-width="1.33333"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M22 12H20"
              stroke="#FCFCFC"
              stroke-width="1.33333"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M20.6602 17L18.9281 16"
              stroke="#FCFCFC"
              stroke-width="1.33333"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M17 20.6602L16 18.9282"
              stroke="#FCFCFC"
              stroke-width="1.33333"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M12 22V20"
              stroke="#FCFCFC"
              stroke-width="1.33333"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M7 20.6602L8 18.9282"
              stroke="#FCFCFC"
              stroke-width="1.33333"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M3.33984 17L5.0719 16"
              stroke="#FCFCFC"
              stroke-width="1.33333"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M2 12H4"
              stroke="#FCFCFC"
              stroke-width="1.33333"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M3.33984 7L5.0719 8"
              stroke="#FCFCFC"
              stroke-width="1.33333"
              stroke-linecap="round"
              stroke-linejoin="round"
            />
            <path
              d="M7 3.33975L8 5.0718"
              stroke="#FCFCFC"
              stroke-width="1.33333"
              stroke-linecap="round"
              stroke-linejoin="round"
            /></svg
        ></q-tab>
        <q-tab name="accomplished" label="Accomplished" class="postFilter"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
          >
            <path
              d="M10.6 13.8L8.425 11.625C8.24167 11.4417 8.01667 11.35 7.75 11.35C7.48333 11.35 7.25 11.45 7.05 11.65C6.86667 11.8333 6.775 12.0667 6.775 12.35C6.775 12.6333 6.86667 12.8667 7.05 13.05L9.9 15.9C10.0833 16.0833 10.3167 16.175 10.6 16.175C10.8833 16.175 11.1167 16.0833 11.3 15.9L16.975 10.225C17.1583 10.0417 17.25 9.81667 17.25 9.55C17.25 9.28333 17.15 9.05 16.95 8.85C16.7667 8.66667 16.5333 8.575 16.25 8.575C15.9667 8.575 15.7333 8.66667 15.55 8.85L10.6 13.8ZM12 22C10.6167 22 9.31667 21.7373 8.1 21.212C6.88333 20.6873 5.825 19.975 4.925 19.075C4.025 18.175 3.31267 17.1167 2.788 15.9C2.26267 14.6833 2 13.3833 2 12C2 10.6167 2.26267 9.31667 2.788 8.1C3.31267 6.88333 4.025 5.825 4.925 4.925C5.825 4.025 6.88333 3.31233 8.1 2.787C9.31667 2.26233 10.6167 2 12 2C13.3833 2 14.6833 2.26233 15.9 2.787C17.1167 3.31233 18.175 4.025 19.075 4.925C19.975 5.825 20.6873 6.88333 21.212 8.1C21.7373 9.31667 22 10.6167 22 12C22 13.3833 21.7373 14.6833 21.212 15.9C20.6873 17.1167 19.975 18.175 19.075 19.075C18.175 19.975 17.1167 20.6873 15.9 21.212C14.6833 21.7373 13.3833 22 12 22Z"
              fill="#FCFCFC"
            /></svg
        ></q-tab>
      </q-tabs>

      <q-tab-panels v-model="tab" animated swipeable>
        <q-tab-panel name="onGoing">
          <div v-for="(profile, i) in onGoing" :key="i">
            <DreamsComponent :profile="profile"></DreamsComponent>
          </div>
        </q-tab-panel>

        <q-tab-panel name="accomplished">
          <div v-for="(profile, i) in accomplished" :key="i">
            <DreamsComponent :profile="profile"></DreamsComponent>
          </div>
        </q-tab-panel>
      </q-tab-panels>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, defineProps, PropType } from "vue";
import { UserProfile } from "src/components/models";
import DreamsComponent from "./DreamsComponent.vue";

const tab = ref("onGoing");

interface Props {
  onGoing: UserProfile[];
  accomplished: UserProfile[];
}

const props: Props = defineProps({
  onGoing: {
    type: Array as PropType<UserProfile[]>,
    required: true
  },
  accomplished: {
    type: Array as PropType<UserProfile[]>,
    required: true
  }
});
</script>

<!-- Add your styles -->
<style scoped>
.order-tabs {
  padding-top: 0;
}

.postFilter {
  text-transform: capitalize !important;
  font-family: poppinsMedium;
}
</style>
<style lang="scss">
.post-filter {
  .filterTabs {
    padding: 0 1.6rem;
  }
  .q-ripple {
    display: none;
  }
}
.activeTab {
  * {
    fill: $primary !important;
    color: $primary !important;
    stroke: $primary !important;
  }

  .q-ripple {
    display: none;
  }
}
.post-filter {
  .q-tab-panel {
    padding: 0px;
  }
}
.q-tab__content {
  display: flex;
  flex-direction: row-reverse !important; /* Reverses the order of label and icon */
  align-items: center; /* Vertically aligns label and icon */
  svg {
    margin-right: 0.5rem;
  }
}
</style>
