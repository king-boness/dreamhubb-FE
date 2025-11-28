<template>
  <div class="myProfileRewievs-page">
    <UserProfileHeaderDoneeComponent
      v-if="donee"
    ></UserProfileHeaderDoneeComponent>
    <UserProfileHeaderDonorComponent v-else></UserProfileHeaderDonorComponent>
    <ProfileDreamsComponent
      :on-going="onGoing"
      :accomplished="accomplished"
      :profile="profile"
    ></ProfileDreamsComponent>
  </div>
</template>
<script setup lang="ts">
import UserProfileHeaderDonorComponent from "src/components/partials/UserProfileHeaderComponent.vue";
import UserProfileHeaderDoneeComponent from "src/components/doneeComponents/UserProfileHeaderComponent.vue";
import { watch, ref } from "vue";
import { useRoute } from "vue-router";

import ProfileDreamsComponent from "src/components/partials/ProfileDreamsComponent.vue";
import { UserProfile } from "src/components/models";

const profile = ref({
  categories: {
    name: "Problems",
    amount: 34,
    img: "/icons/problemIcon.svg"
  }
} as UserProfile);
const onGoing = ref([
  {
    dreams: {
      category: "dream",
      type: "onGoing",
      donatedValue: 3000,
      postDreamName: "Trip to NY",
      postDreamBackground: "/images/Auth/postBackground.png",
      postDreamCategoryImg: "/icons/redCloudIcon.svg",
      postOwner: "John Doe",
      postOwnerPicture: "/images/Auth/profilePicture.jpeg",
      description:
        "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim. Eu id nibh iaculis orci."
    }
  },
  {
    dreams: {
      category: "dream",
      type: "onGoing",
      donatedValue: 30000,
      postDreamName: "Aurora Expedition",
      postDreamBackground: "/images/Auth/postBackground.png",
      postDreamCategoryImg: "/icons/redCloudIcon.svg",
      postOwner: "John Doe",
      postOwnerPicture: "/images/Auth/profilePicture.jpeg",
      description:
        "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim. Eu id nibh iaculis orci."
    }
  }
] as UserProfile[]);

const accomplished = ref([
  {
    dreams: {
      category: "dream",
      type: "onGoing",
      donatedValue: 43000,
      postDreamName: "Aurora Expedition",
      postDreamBackground: "/images/Auth/postBackground.png",
      postDreamCategoryImg: "/icons/redCloudIcon.svg",
      postOwner: "John Doe",
      postOwnerPicture: "/images/Auth/profilePicture.jpeg",
      description:
        "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim. Eu id nibh iaculis orci."
    }
  },
  {
    dreams: {
      category: "dream",
      type: "onGoing",
      donatedValue: 30000,
      postDreamName: "Aurora Expedition",
      postDreamBackground: "/images/Auth/postBackground.png",
      postDreamCategoryImg: "/icons/redCloudIcon.svg",
      postOwner: "John Doe",
      postOwnerPicture: "/images/Auth/profilePicture.jpeg",
      description:
        "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim. Eu id nibh iaculis orci."
    }
  }
] as UserProfile[]);

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
