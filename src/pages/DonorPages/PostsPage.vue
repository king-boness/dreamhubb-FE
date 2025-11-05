<template>
  <div class="column col-12 postDetail">
    <FilterComponent />
    <div v-for="(post, i) in posts" :key="i" class="post">
      <PostComponent :post="post" />
    </div>
    <q-pull-to-refresh @refresh="refresh"></q-pull-to-refresh>
  </div>
</template>
<style scoped lang="scss">
.postDetail {
  .post {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
  }
}
</style>
<script setup lang="ts">
import { ref } from "vue";
import { Post } from "src/components/models";
import FilterComponent from "src/components/partials/FilterComponent.vue";
import PostComponent from "src/components/partials/PostComponent.vue";
const refresh = (done: any) => {
  setTimeout(() => {
    done();
  }, 1000);
};
const posts = ref([
  {
    description: "lorem ipsum dolor sit amet",
    goalName: "goalName",
    goalImage: "/images/Auth/goalPicture.png",
    karma: 230000000,
    image: "/images/Auth/postBackground.png",
    user: {
      badge: "verified",
      userName: "Jakub Perdoch",
      userPicture: "/images/Auth/profilePicture.jpeg"
    }
  },
  {
    description: "lorem ipsum dolor sit amet",
    goalName: "goalName",
    goalImage: "/images/Auth/goalPicture.png",
    karma: 230000000,
    image: "/images/Auth/postBackground.png",
    user: {
      badge: "verified",
      userName: "Jakub Perdoch",
      userPicture: "/images/Auth/profilePicture.jpeg"
    }
  },
  {
    description: "lorem ipsum dolor sit amet",
    goalName: "goalName",
    goalImage: "/images/Auth/goalPicture.png",
    karma: 230000000,
    image: "/images/Auth/postBackground.png",
    user: {
      badge: "verified",
      userName: "Jakub Perdoch",
      userPicture: "/images/Auth/profilePicture.jpeg"
    }
  }
] as Post[]);
// const posts = ref([] as Post[]);
// import { useApiCallStore } from "src/stores/api-calls-store";

// const apiCalls = useApiCallStore();
// onMounted(async () => {
//   posts.value = (await apiCalls.getPosts()).data;
//   console.log(posts.value);
// });
</script>
