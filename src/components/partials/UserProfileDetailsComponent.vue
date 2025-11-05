<template>
  <div class="userDetail-component">
    <div class="userDetail-reviews" @click="routeCheck()">
      <div class="reviews-description">
        <img :src="props.profile.categories.img" alt="" />
        <span class="reviews-heading">{{ props.profile.categories.name }}</span>
        <span class="reviews-amount"
          >({{ props.profile.categories.amount }})</span
        >
      </div>
      <div class="arrowDiv no-shadow">
        <q-btn class="arrowBtn no-shadow"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <g opacity="0.6">
              <path
                d="M8.47503 15.8332C8.59952 15.8337 8.72253 15.8062 8.83501 15.7528C8.9475 15.6995 9.04659 15.6216 9.12503 15.5249L13.15 10.5249C13.2726 10.3758 13.3396 10.1888 13.3396 9.99574C13.3396 9.80272 13.2726 9.61568 13.15 9.46657L8.98336 4.46657C8.84191 4.29639 8.63865 4.18937 8.4183 4.16905C8.19794 4.14874 7.97854 4.21679 7.80836 4.35824C7.63818 4.49969 7.53116 4.70295 7.51084 4.9233C7.49053 5.14366 7.55858 5.36306 7.70003 5.53324L11.425 9.9999L7.82503 14.4666C7.72312 14.5889 7.65839 14.7378 7.63849 14.8958C7.61859 15.0538 7.64436 15.2141 7.71274 15.3579C7.78112 15.5017 7.88925 15.6228 8.02434 15.7071C8.15944 15.7913 8.31583 15.8351 8.47503 15.8332Z"
                fill="#D0DCD8"
              />
            </g></svg
        ></q-btn>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { defineProps, PropType } from "vue";
import { UserProfile } from "src/components/models";
import { useRouter, useRoute } from "vue-router";

interface Props {
  profile: UserProfile;
}

const props: Props = defineProps({
  profile: {
    type: Object as PropType<UserProfile>,
    required: true
  }
});

const router = useRouter();
const route = useRoute();
const routesName = route.name?.toString() || "";

const routeCheck = () => {
  if (process.env.NODE_ENV === "development") {
    console.log(routesName);
  }
  routesName.startsWith("donee")
    ? router.push({ name: `donee-${props.profile.categories.destination}` })
    : router.push({ name: `donor-${props.profile.categories.destination}` });
};
</script>
<style scoped lang="scss">
.q-btn:before {
  box-shadow: none !important;
}
.userDetail-component {
  display: flex;
  justify-content: center;
  flex-direction: column;

  .userDetail-reviews {
    margin-bottom: 0.2rem;
    width: 100%;
    height: 5.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;

    .arrowDiv {
      .arrowBtn {
        margin-left: 1rem;
      }
    }

    .reviews-description {
      display: flex;
      align-items: center;
      color: white;
      font-size: 1.3rem;

      img {
        margin-right: 1rem;
        height: 1.7rem;
      }

      .reviews-heading {
        margin-right: 0.3rem;
        font-family: poppinsSemiBold;
        font-size: 1.3rem;
      }

      .reviews-amount {
        font-size: 1.5rem;
        margin-left: 0.1rem;
      }
    }
  }
}
</style>
