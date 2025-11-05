<template>
  <div class="myProfileRewievs-page">
    <MyProfileHeaderComponent></MyProfileHeaderComponent>
    <ProfileDreamsComponent
      :on-going="onGoing"
      :accomplished="accomplished"
      :profile="profile"
    ></ProfileDreamsComponent>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import MyProfileHeaderComponent from "src/components/partials/MyProfileHeaderComponent.vue";
import ProfileDreamsComponent from "src/components/partials/ProfileDreamsComponent.vue";
import { UserProfile } from "src/components/models";

const profile = ref({
  categories: {
    name: "Dreams",
    amount: 34,
    img: "/icons/redCloudIcon.svg"
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
</script>
<style lang="scss" scoped></style>
