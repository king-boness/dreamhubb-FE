<template>
  <div
    class="search-page"
    :class="{ 'iphoneDevice-small': $q.platform.is.ios }"
  >
    <div class="search-barDiv">
      <q-input
        v-model="search"
        type="search"
        dark
        class="inputSearch"
        borderless
        placeholder="Search anything"
        dense
      >
        <template v-slot:prepend>
          <q-icon name="search" class="searchIcon" />
        </template>
      </q-input>
      <q-btn class="searchbar-Btn" @click="handleCloseIconClick">
        <img src="/icons/closeIcon.svg" alt="" />
      </q-btn>
    </div>
    <div class="searchPage-sortingContainer">
      <span class="searchPage-sortingTitle">My Dreams</span>
      <q-select
        borderless
        dense
        class="registerDatas searchPage-sortingComponent text-primary"
        v-model="sorting"
        :options="['Newest', 'Oldest']"
        behavior="menu"
      />
    </div>
    <div class="searchPage-dreamsContainer" v-for="(post, i) in posts" :key="i">
      <PostComponent :post="post"></PostComponent>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref } from "vue";
import { Post } from "src/components/models";
import PostComponent from "src/components/partials/PostComponent.vue";

import { useRouter } from "vue-router";
const router = useRouter();

const search = ref("");
const sorting = ref("Newest");
const posts = ref([
  {
    description:
      "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim.",
    goalName: "Ukraine Help",
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
    description:
      "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim.",
    goalName: "Aurora Expedition",
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
    description:
      "Adipiscing viverra netus ultricies lacus consectetur. Neque nulla fusce lorem ac nunc semper pellentesque vitae enim.",
    goalName: "Finding the purpose",
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

function handleCloseIconClick() {
  if (search.value !== "") {
    search.value = "";
  } else {
    router.go(-1);
  }
}
</script>

<style scoped lang="scss">
.search-page {
  padding: 0;

  .search-barDiv {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    padding: 1.3rem;
    padding-bottom: 0.5rem;

    .inputSearch {
      background: linear-gradient(
        90deg,
        rgba(67, 67, 67, 0.986) 10%,
        rgba(53, 53, 53, 0.832) 80%
      );
      border-radius: 0.8rem;
      padding: 0.15rem 1rem;
      height: 2.7rem;
      width: 18rem;
      display: flex;
    }

    .searchbar-Btn {
      margin: 0 0.4rem;
      width: 2.8rem;
      height: 2.8rem;
      border-radius: 2rem;
      margin-left: 1rem;
      background: linear-gradient(
        90deg,
        rgba(57, 57, 57, 0.832) 10%,
        rgba(93, 92, 92, 0.986) 100%
      );
    }
  }
  .searchPage-sortingContainer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    color: white;
    padding: 1rem 1.3rem;
    .searchPage-sortingTitle {
      font-family: poppinsSemiBold;
      font-size: 1.3rem;
    }
    .searchPage-sortingComponent {
      width: 11rem;
      margin: 0;
      height: 3.2rem;
      padding-top: 0.3rem;
      padding-right: 0.7rem;
      font-family: montseraat;
      font-size: 1rem;
    }
  }
}
</style>
<style lang="scss">
.searchPage-sortingComponent {
  * {
    color: rgba(255, 255, 255, 0.753);
  }
}
</style>
