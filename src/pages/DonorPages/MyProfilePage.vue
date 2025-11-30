<template>
  <div class="myProfile">
    <MyProfileHeaderComponent></MyProfileHeaderComponent>
    <div class="userProfile-detailsContainer">
      <div v-for="(profile, i) in profiles" :key="i" class="profile-item-wrapper">
        <UserProfileDetailsComponent
          :profile="profile"
          :expanded="expandedCategory === profile.categories.name"
          :on-going="getMockData(profile.categories.name).onGoing"
          :accomplished="getMockData(profile.categories.name).accomplished"
          @toggle="handleToggle"
        ></UserProfileDetailsComponent>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
import UserProfileDetailsComponent from "src/components/partials/UserProfileDetailsComponent.vue";
import MyProfileHeaderComponent from "src/components/partials/MyProfileHeaderComponent.vue";
import { UserProfile } from "src/components/models";

const expandedCategory = ref<string | null>(null);

const handleToggle = (category: string) => {
  if (expandedCategory.value === category) {
    expandedCategory.value = null;
  } else {
    expandedCategory.value = category;
  }
};

// Mock data for ongoing and accomplished posts
const getMockData = (categoryName: string) => {
  // Special handling for Donations
  if (categoryName === "Donations") {
    return {
      onGoing: [
        {
          donations: {
            donatedValue: 300,
            postDonatedName: "Aurora Expedition",
            postDonatedCategoryImg: "/icons/redCloudIcon.svg",
            postOwner: "Mackenzie Doe",
            postOwnerPicture: "/images/Auth/profilePicture.jpeg",
            postDonatedBackground: "/images/Auth/postBackground.png",
            description: "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim. Eu id nibh iaculis orci."
          }
        },
        {
          donations: {
            donatedValue: 500,
            postDonatedName: "Ocean Cleanup Project",
            postDonatedCategoryImg: "/icons/redCloudIcon.svg",
            postOwner: "John Smith",
            postOwnerPicture: "/images/Auth/profilePicture.jpeg",
            postDonatedBackground: "/images/Auth/postBackground.png",
            description: "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim. Eu id nibh iaculis orci."
          }
        }
      ] as UserProfile[],
      accomplished: [
        {
          donations: {
            donatedValue: 1000,
            postDonatedName: "Education for All",
            postDonatedCategoryImg: "/icons/redCloudIcon.svg",
            postOwner: "Sarah Johnson",
            postOwnerPicture: "/images/Auth/profilePicture.jpeg",
            postDonatedBackground: "/images/Auth/postBackground.png",
            description: "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim. Eu id nibh iaculis orci."
          }
        },
        {
          donations: {
            donatedValue: 750,
            postDonatedName: "Healthcare Initiative",
            postDonatedCategoryImg: "/icons/redCloudIcon.svg",
            postOwner: "Michael Brown",
            postOwnerPicture: "/images/Auth/profilePicture.jpeg",
            postDonatedBackground: "/images/Auth/postBackground.png",
            description: "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim. Eu id nibh iaculis orci."
          }
        }
      ] as UserProfile[]
    };
  }

  // For Dreams, Problems, Ideas
  const categoryMap: Record<string, { img: string; category: string }> = {
    Dreams: { img: "/icons/redCloudIcon.svg", category: "dream" },
    Problems: { img: "/icons/problemIcon.svg", category: "problem" },
    Ideas: { img: "/icons/ideaIcon.svg", category: "idea" }
  };
  const categoryInfo = categoryMap[categoryName] || { img: "/icons/redCloudIcon.svg", category: "dream" };

  return {
    onGoing: [
      {
        dreams: {
          category: categoryInfo.category,
          type: "onGoing",
          donatedValue: 3000,
          postDreamName: `${categoryName} Post 1`,
          postDreamBackground: "/images/Auth/postBackground.png",
          postDreamCategoryImg: categoryInfo.img,
          postOwner: "John Doe",
          postOwnerPicture: "/images/Auth/profilePicture.jpeg",
          description: "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim. Eu id nibh iaculis orci."
        }
      },
      {
        dreams: {
          category: categoryInfo.category,
          type: "onGoing",
          donatedValue: 30000,
          postDreamName: `${categoryName} Post 2`,
          postDreamBackground: "/images/Auth/postBackground.png",
          postDreamCategoryImg: categoryInfo.img,
          postOwner: "John Doe",
          postOwnerPicture: "/images/Auth/profilePicture.jpeg",
          description: "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim. Eu id nibh iaculis orci."
        }
      }
    ] as UserProfile[],
    accomplished: [
      {
        dreams: {
          category: categoryInfo.category,
          type: "accomplished",
          donatedValue: 43000,
          postDreamName: `${categoryName} Accomplished 1`,
          postDreamBackground: "/images/Auth/postBackground.png",
          postDreamCategoryImg: categoryInfo.img,
          postOwner: "John Doe",
          postOwnerPicture: "/images/Auth/profilePicture.jpeg",
          description: "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim. Eu id nibh iaculis orci."
        }
      },
      {
        dreams: {
          category: categoryInfo.category,
          type: "accomplished",
          donatedValue: 30000,
          postDreamName: `${categoryName} Accomplished 2`,
          postDreamBackground: "/images/Auth/postBackground.png",
          postDreamCategoryImg: categoryInfo.img,
          postOwner: "John Doe",
          postOwnerPicture: "/images/Auth/profilePicture.jpeg",
          description: "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim. Eu id nibh iaculis orci."
        }
      }
    ] as UserProfile[]
  };
};

const profiles = ref([
  {
    categories: {
      name: "Reviews",
      amount: 0, // Will be calculated dynamically
      img: "/icons/starIcon.svg",
      destination: "myprofile-reviews"
    }
  },
  {
    categories: {
      name: "Donations",
      amount: 0, // Will be calculated dynamically
      img: "/icons/redGiftIcon.svg",
      destination: "myprofile-donations"
    }
  },
  {
    categories: {
      name: "Dreams",
      amount: 0, // Will be calculated dynamically
      img: "/icons/redCloudIcon.svg",
      destination: "myprofile-dreams"
    }
  },
  {
    categories: {
      name: "Problems",
      amount: 0, // Will be calculated dynamically
      img: "/icons/problemIcon.svg",
      destination: "myprofile-problems"
    }
  },
  {
    categories: {
      name: "Ideas",
      amount: 0, // Will be calculated dynamically
      img: "/icons/ideaIcon.svg",
      destination: "myprofile-ideas"
    }
  }
] as UserProfile[]);
</script>
<style scoped lang="scss">
.myProfile {
  overflow: visible !important;
  position: relative;
  height: 100%;
}

:deep(.q-layout) {
  overflow: visible !important;
}

:deep(.q-page-container) {
  overflow: visible !important;
  overflow-x: visible !important;
  overflow-y: visible !important;
}

:deep(.q-page) {
  overflow: visible !important;
  overflow-x: visible !important;
  overflow-y: visible !important;
}

.userProfile-detailsContainer {
  margin-top: 6rem;
  margin-bottom: 4rem;
  padding: 0;
  width: 100%;
  position: relative;
  overflow: visible !important;
  overflow-x: visible !important;
  overflow-y: visible !important;
  min-height: 100vh;
  height: auto;
}

.profile-item-wrapper {
  width: 100%;
  margin: 0;
  padding: 0;
  position: relative;
  overflow: visible !important;
  overflow-x: visible !important;
  overflow-y: visible !important;
  box-sizing: border-box;
}
</style>
