<template>
  <div class="">
    <MyProfileFilterComponent :post="post"></MyProfileFilterComponent>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted } from "vue";
import { useAuthStore } from "src/stores/auth";
import MyProfileFilterComponent from "src/components/doneeComponents/MyProfileFilterComponent.vue";
import { Post } from "src/components/models";

const authStore = useAuthStore();

// Create post object from auth store data for MyProfileFilterComponent
const post = computed(() => {
  return {
    description: "",
    goalName: "",
    goalImage: "/images/Auth/goalPicture.png",
    karma: authStore.user?.tokens || 0,
    image: "/images/Auth/postBackground.png",
    user: {
      badge: "verified",
      userName: authStore.user?.username || "User",
      userPicture: authStore.user?.profile_picture || "/images/Auth/profilePicture.jpeg"
    }
  } as Post;
});

// Fetch user data on mount if not loaded
onMounted(async () => {
  if (authStore.isAuthenticated && !authStore.user) {
    try {
      await authStore.fetchUser();
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.warn("Failed to fetch user data:", error);
      }
    }
  }
});
</script>
<style></style>
