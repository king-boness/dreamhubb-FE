<template>
  <div class="myProfileRewievs-page">
    <UserProfileHeaderDoneeComponent
      v-if="donee"
    ></UserProfileHeaderDoneeComponent>
    <UserProfileHeaderDonorComponent v-else></UserProfileHeaderDonorComponent>
    <ProfileDonationsComponent></ProfileDonationsComponent>
  </div>
</template>
<script setup lang="ts">
import ProfileDonationsComponent from "src/components/partials/ProfileDonationsComponent.vue";
import UserProfileHeaderDonorComponent from "src/components/partials/UserProfileHeaderComponent.vue";
import UserProfileHeaderDoneeComponent from "src/components/doneeComponents/UserProfileHeaderComponent.vue";
import { watch } from "vue";
import { useRoute } from "vue-router";

const route = useRoute();
let routesName = route.name?.toString() || "";

let donee = false;

const routeCheck = () => {
  routesName = route.name?.toString() || "";
  routesName.startsWith("donee") ? (donee = true) : (donee = false);
};

routeCheck();
watch(route, () => {
  routeCheck();
});
</script>
<style lang="scss" scoped></style>
