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
    <div v-if="postsStore.loading" class="searchPage-empty">Loading...</div>
    <div v-else-if="search.trim() === ''" class="searchPage-empty">
      Enter a keyword to search posts.
    </div>
    <div v-else-if="filteredPosts.length === 0" class="searchPage-empty">
      No posts match your search.
    </div>
    <ul v-else class="searchPage-resultsList">
      <li
        v-for="(post, i) in filteredPosts"
        :key="post.post_id ?? post.id ?? i"
        class="searchPage-resultItem"
      >
        <span class="searchPage-resultTitle">{{ getPostTitle(post) }}</span>
        <span class="searchPage-resultSnippet">{{ getPostSnippet(post) }}</span>
      </li>
    </ul>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { usePostsStore } from "src/stores/posts";

const router = useRouter();
const postsStore = usePostsStore();

const search = ref("");

function getPostTitle(p: Record<string, unknown>): string {
  const t = String(p.goal_name ?? p.goalName ?? p.title ?? "").trim();
  return t || "Untitled";
}

function getPostSnippet(p: Record<string, unknown>): string {
  const d = String(p.description ?? "").trim();
  if (!d) return "";
  return d.length > 120 ? d.slice(0, 120) + "…" : d;
}

const filteredPosts = computed(() => {
  const list = postsStore.posts;
  const term = search.value.trim().toLowerCase();
  if (!term) return [];
  return list.filter((p: Record<string, unknown>) => {
    const goalName = String(p.goal_name ?? p.goalName ?? "").toLowerCase();
    const title = String(p.title ?? "").toLowerCase();
    const description = String(p.description ?? "").toLowerCase();
    return (
      goalName.includes(term) ||
      title.includes(term) ||
      description.includes(term)
    );
  });
});

onMounted(async () => {
  if (postsStore.posts.length === 0) {
    await postsStore.fetchPosts({});
  }
});

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
  min-height: 100%;
  background: #0a0a0a;
  padding-bottom: env(safe-area-inset-bottom, 0px);
  padding-top: env(safe-area-inset-top, 0px);

  .search-barDiv {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    padding: 0.4rem 1rem 0.5rem;
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

  .searchPage-empty {
    color: rgba(255, 255, 255, 0.7);
    text-align: center;
    padding: 2rem 1.3rem;
    font-size: 1rem;
  }

  .searchPage-resultsList {
    list-style: none;
    margin: 0;
    padding: 0 1.3rem 2rem;
    padding-bottom: calc(2rem + env(safe-area-inset-bottom, 0px));
    display: flex;
    flex-direction: column;
    gap: 0;
  }

  .searchPage-resultItem {
    padding: 1rem 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
    display: flex;
    flex-direction: column;
    gap: 0.25rem;
    &:last-child {
      border-bottom: none;
    }
  }

  .searchPage-resultTitle {
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
    font-family: poppinsSemiBold;
  }

  .searchPage-resultSnippet {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.4;
    font-family: poppins;
  }
}
</style>
