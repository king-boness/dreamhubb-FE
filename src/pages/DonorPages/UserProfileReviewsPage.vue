<template>
  <div class="myProfileRewievs-page">
    <UserProfileHeaderDoneeComponent v-if="donee">
    </UserProfileHeaderDoneeComponent>
    <UserProfileHeaderDonorComponent v-else></UserProfileHeaderDonorComponent>
    <ProfileReviewsComponent></ProfileReviewsComponent>
  </div>
</template>
<script setup lang="ts">
import UserProfileHeaderDonorComponent from "src/components/partials/UserProfileHeaderComponent.vue";
import ProfileReviewsComponent from "src/components/partials/ProfileReviewsComponent.vue";
import UserProfileHeaderDoneeComponent from "src/components/doneeComponents/UserProfileHeaderComponent.vue";
import { watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
let routesName = route.name?.toString() || "";

let donee = false;

const routeCheck = () => {
  routesName = route.name?.toString() || "";
  if (process.env.NODE_ENV === "development") {
    console.log(routesName);
  }
  routesName.startsWith("donee") ? (donee = true) : (donee = false);
};
routeCheck();
watch(route, () => {
  routeCheck();
});
</script>
<style lang="scss" scoped></style>
