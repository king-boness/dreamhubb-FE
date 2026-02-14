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
    <div v-if="search === ''">
      <div
        v-for="(history, i) in histories"
        :key="i"
        class="histories historyDiv"
        @click="filterPostsByTitle(history.historyTitle)"
      >
        <SearchHistoryComponent :history="history" />
      </div>
    </div>
    <div
      v-else-if="search !== '' && filteredTopics.length === 0"
      class="errorDiv"
    >
      <span>Nothing like that</span>
    </div>
    <div v-else>
      <div class="filterButtonContainer">
        <FilterSearchComponent></FilterSearchComponent>
      </div>
      <div
        v-for="(topic, i) in filteredTopics"
        :key="i"
        class="histories historyDiv"
        @click="
          filterPostsByTitle(topic.topicTitle);
          showPosts = true;
        "
      >
        <!-- <SearchTopicComponent :topic="topic" /> -->
      </div>
      <div v-if="showPosts || selectedHistory">
        <div v-for="(post, i) in filteredPosts" :key="post.post_id ?? post.id ?? i" class="postComponent">
          <PostComponent :post="post" />
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed } from "vue";
import { History, Topic, Post } from "src/components/models";
import SearchHistoryComponent from "src/components/partials/SearchHistoryComponent.vue";
import SearchTopicComponent from "src/components/partials/SearchTopicComponent.vue";
import PostComponent from "src/components/partials/PostComponent.vue";
import FilterSearchComponent from "src/components/partials/FilterSearchComponent.vue";

import { useRouter } from "vue-router";
const router = useRouter();

const search = ref("");
const showPosts = ref(false);
const selectedHistory = ref<History | null>(null);

const histories = ref([
  {
    historyTitle: "Ukraine Help"
  },
  {
    historyTitle: "Charity helping organizations"
  },
  {
    historyTitle: "Finding the purpose of life"
  }
] as History[]);

const topics = ref([
  {
    topicTitle: "Ukraine Help"
  },
  {
    topicTitle: "Ukraine Help People"
  },
  {
    topicTitle: "Finding the purpose"
  },
  {
    topicTitle: "Aurora Expedition"
  }
] as Topic[]);

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

const filteredTopics = computed(() => {
  const searchTerm = search.value.toLowerCase();
  return topics.value
    .filter((topic) => topic.topicTitle.toLowerCase().includes(searchTerm))
    .sort((a, b) => a.topicTitle.localeCompare(b.topicTitle));
});

const filteredPosts = computed(() => {
  const searchTerm = search.value.toLowerCase();
  const selectedHistoryTitle =
    selectedHistory.value?.historyTitle.toLowerCase();
  return posts.value.filter((post) => {
    const matchesSearch = post.goalName.toLowerCase().includes(searchTerm);
    const matchesHistory =
      !selectedHistoryTitle ||
      post.goalName.toLowerCase().includes(selectedHistoryTitle);
    return matchesSearch && matchesHistory;
  });
});

function filterPostsByTitle(title: string) {
  const history = histories.value.find((h) => h.historyTitle === title);
  search.value = title;
  showPosts.value = false;
  selectedHistory.value = history || null;
}

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
  min-height: 100vh;
  .filterButtonContainer {
    padding: 0 0.5rem;
  }
  .search-barDiv {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    padding-bottom: 0.5rem;

    .inputSearch {
      font-family: montseraat;
      background: linear-gradient(
        90deg,
        rgba(67, 67, 67, 0.986) 10%,
        rgba(53, 53, 53, 0.832) 80%
      );
      border-radius: 0.8rem;
      padding: 0.15rem 0.5rem;
      height: 2.7rem;
      width: 100%;
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
  .histories {
    padding: 0 1.5rem;
    margin: 1.5rem 0;
  }
}
.errorDiv {
  color: $primary;
  font-family: poppinsBold;
  justify-content: center;
  display: flex;
  padding-top: 1rem;
  text-align: center;
}
</style>
