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
        :placeholder="searchPlaceholder"
        dense
        clearable
        @keydown.enter.prevent="focusFirstResult"
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
      <span class="searchPage-sortingTitle">{{ myDreamsTitle }}</span>
      <q-select
        borderless
        dense
        class="registerDatas searchPage-sortingComponent text-primary"
        v-model="sorting"
        :options="sortOptions"
        option-value="value"
        option-label="label"
        emit-value
        map-options
        behavior="menu"
      />
    </div>
    <div v-if="postsStore.myDreamsLoading" class="searchPage-empty">{{ loadingLabel }}</div>
    <div v-else-if="postsStore.myDreamsError" class="searchPage-empty searchPage-empty--error">
      {{ postsStore.myDreamsError }}
      <q-btn
        flat
        dense
        no-caps
        class="searchPage-retry"
        :label="retryLabel"
        @click="reloadDreams"
      />
    </div>
    <div v-else-if="filteredPosts.length === 0" class="searchPage-empty">
      {{ emptyMessage }}
    </div>
    <div v-else class="searchPage-resultsWrap">
      <p class="searchPage-resultsCount" aria-live="polite">
        {{ t("feed.resultsCount", filteredPosts.length, { n: filteredPosts.length }) }}
      </p>
      <ul class="searchPage-resultsList">
        <li
          v-for="(post, i) in filteredPosts"
          :key="String(getPostId(post) ?? i)"
          class="searchPage-resultItem"
          role="button"
          tabindex="0"
          @click="openPost(post)"
          @keydown.enter.prevent="openPost(post)"
        >
          <span class="searchPage-resultTitle">{{ getPostTitle(post) }}</span>
          <span class="searchPage-resultSnippet">{{ getPostSnippet(post) }}</span>
        </li>
      </ul>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from "vue";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { usePostsStore } from "src/stores/posts";

const { t } = useI18n();
const router = useRouter();
const postsStore = usePostsStore();

const search = ref("");
const sorting = ref<"newest" | "oldest">("newest");

const searchPlaceholder = computed(() => t("feed.searchMyDreams"));
const myDreamsTitle = computed(() => t("feed.myDreamsTitle"));
const loadingLabel = computed(() => t("loading"));
const retryLabel = computed(() => t("common.actions.retry"));
const untitledLabel = computed(() => t("feed.untitled"));
const emptyMessage = computed(() =>
  search.value.trim()
    ? t("feed.searchEmptyMine")
    : t("feed.searchEmptyMineNone")
);

const sortOptions = computed(() => [
  { label: t("feed.sortNewest"), value: "newest" as const },
  { label: t("feed.sortOldest"), value: "oldest" as const }
]);

function getPostId(p: Record<string, unknown>): string | number | null {
  const id = p.post_id ?? p.id;
  if (id === null || id === undefined || id === "") return null;
  return id as string | number;
}

function getPostTitle(p: Record<string, unknown>): string {
  const title = String(p.goal_name ?? p.goalName ?? p.title ?? "").trim();
  return title || untitledLabel.value;
}

function getPostSnippet(p: Record<string, unknown>): string {
  const d = String(p.description ?? "").trim();
  if (!d) return "";
  return d.length > 120 ? d.slice(0, 120) + "…" : d;
}

const filteredPosts = computed(() => {
  const list = postsStore.myDreams;
  const term = search.value.trim().toLowerCase();
  const filtered = !term
    ? [...list]
    : list.filter((p: Record<string, unknown>) => {
      const goalName = String(p.goal_name ?? p.goalName ?? "").toLowerCase();
      const description = String(p.description ?? "").toLowerCase();
      const title = String(p.title ?? "").toLowerCase();
      return goalName.includes(term) || description.includes(term) || title.includes(term);
    });
  const sorted = [...filtered];
  const order = sorting.value === "oldest" ? 1 : -1;
  sorted.sort((a: Record<string, unknown>, b: Record<string, unknown>) => {
    const dateA = new Date((a.created_at ?? a.createdAt ?? 0) as string | number).getTime();
    const dateB = new Date((b.created_at ?? b.createdAt ?? 0) as string | number).getTime();
    return order * (dateA - dateB);
  });
  return sorted;
});

function reloadDreams() {
  void postsStore.fetchMyDreams({ category: "dream" });
}

onMounted(() => {
  reloadDreams();
});

function openPost(post: Record<string, unknown>) {
  const id = getPostId(post);
  if (id === null) return;
  void router.push({ name: "donee-post-detail", params: { id: String(id) } });
}

function focusFirstResult() {
  const first = filteredPosts.value[0];
  if (first) openPost(first);
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
  min-height: 100%;
  background: #0a0a0a;
  padding-bottom: env(safe-area-inset-bottom, 0px);

  .search-barDiv {
    display: flex;
    width: 100%;
    justify-content: space-between;
    align-items: center;
    padding: 1.3rem;
    padding-bottom: 0.5rem;
    gap: 0.5rem;
    box-sizing: border-box;

    .inputSearch {
      background: linear-gradient(
        90deg,
        rgba(67, 67, 67, 0.986) 10%,
        rgba(53, 53, 53, 0.832) 80%
      );
      border-radius: 0.8rem;
      padding: 0.15rem 1rem;
      height: 2.7rem;
      width: 100%;
      min-width: 0;
      flex: 1 1 auto;
      display: flex;
    }

    .searchbar-Btn {
      margin: 0;
      width: 2.8rem;
      height: 2.8rem;
      flex-shrink: 0;
      border-radius: 2rem;
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
    gap: 1rem;
    .searchPage-sortingTitle {
      font-family: poppinsSemiBold;
      font-size: 1.3rem;
    }
    .searchPage-sortingComponent {
      width: 11rem;
      max-width: 45%;
      margin: 0;
      height: 3.2rem;
      padding-top: 0.3rem;
      padding-right: 0.7rem;
      font-family: montseraat;
      font-size: 1rem;
    }
  }
  .searchPage-empty {
    color: rgba(255, 255, 255, 0.7);
    text-align: center;
    padding: 2rem 1.3rem;
    font-size: 1rem;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 0.75rem;
  }
  .searchPage-empty--error {
    color: rgba(255, 180, 180, 0.9);
  }
  .searchPage-retry {
    color: #fff;
    text-decoration: underline;
  }
  .searchPage-resultsCount {
    margin: 0;
    padding: 0 1.3rem 0.5rem;
    color: rgba(255, 255, 255, 0.55);
    font-size: 0.85rem;
    font-family: inter, sans-serif;
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
    cursor: pointer;
    min-width: 0;
    &:last-child {
      border-bottom: none;
    }
    &:hover .searchPage-resultTitle,
    &:focus-visible .searchPage-resultTitle {
      color: #ff6b9d;
    }
    &:focus-visible {
      outline: 1px solid rgba(255, 255, 255, 0.35);
      outline-offset: 2px;
    }
  }
  .searchPage-resultTitle {
    font-size: 1rem;
    font-weight: 600;
    color: #fff;
    font-family: poppinsSemiBold;
    overflow-wrap: anywhere;
    word-break: break-word;
  }
  .searchPage-resultSnippet {
    font-size: 0.875rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.4;
    font-family: poppins;
    overflow-wrap: anywhere;
    word-break: break-word;
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
