<template>
  <q-virtual-scroll
    :key="scrollLayoutKey"
    :items="props.post"
    :virtual-scroll-horizontal="!isTabletColumn"
    v-slot="{ item }"
    class="scroll"
    :class="{ 'scroll--tabletColumn': isTabletColumn }"
  >
    <div
      class="post-component"
      @click="handlePostClick(item)"
    >
      <div class="post-component-imageWrapper">
        <PostCover
          :images="item.images"
          :post-type="item.postType || null"
          :icon-url="item.goalImage"
          :auto-slide="true"
          :show-progress="true"
          :show-arrows="false"
          :show-dots="false"
          alt="Post image"
        />
      </div>
      <div class="postComponent-valueContainer">
        <img class="postComponent-valueImg" src="/icons/KarmaIcon.png" alt="" />
        <span class="postComponent-value">{{ formatNumber(item.karma) }}</span>
      </div>
      <div class="postComponent-categoryContainer">
        <img :src="item.goalImage" alt="" class="postComponent-categoryImg" />
        <span class="postComponent-categoryTitle">{{ item.goalName }}</span>
      </div>
    </div>
  </q-virtual-scroll>
</template>
<style scoped lang="scss">
.scroll::-webkit-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
  display: none;
}
.scroll {
  width: 100%;
  margin-top: 1rem;
}
.post-component {
  position: relative;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 18rem;
  height: 13rem;
  margin: 0 1rem;
  /* 24px — same outer radius as donor feed .postCard */
  border-radius: 24px;
  padding: 16px;
  overflow: hidden;

  .post-component-imageWrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 0;
    border-radius: inherit;
  }
  .postComponent-valueContainer {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      108.46deg,
      rgba(0, 0, 0, 0.441) 1%,
      rgba(23, 23, 23, 0.599) 100%
    );
    width: 6.5rem;
    height: 3rem;
    border-radius: 1rem;
    gap: 0.3rem;
    .postComponent-valueImg {
      height: 1.3rem;
    }
    .postComponent-value {
      color: $primary;
      font-family: poppinsBold;
      font-size: 1rem;
    }
  }
  .postComponent-categoryContainer {
    position: relative;
    z-index: 1;
    background: linear-gradient(
      108.46deg,
      rgba(0, 0, 0, 0.441) 1%,
      rgba(23, 23, 23, 0.599) 100%
    );
    width: 13.5rem;
    height: 3.3rem;
    display: flex;
    gap: 0.3rem;
    justify-content: center;
    align-items: center;
    border-radius: 1rem;
    .postComponent-categoryImg {
      height: 0.9rem;
    }
    .postComponent-categoryTitle {
      font-family: poppinsSemiBold;
      font-size: 1.1rem;
    }
  }
}

/* Tablet columns: stack cards vertically and fill bucket width (aspect preserved). */
@media (min-width: 768px) and (max-width: 1199px) {
  .scroll.scroll--tabletColumn {
    width: 100%;
    margin-top: 0.65rem;
    max-height: none;
  }

  .post-component {
    width: 100%;
    max-width: 100%;
    height: auto;
    aspect-ratio: 18 / 13;
    margin: 0 0 0.85rem;
    box-sizing: border-box;

    .postComponent-valueContainer {
      width: clamp(5.25rem, 42%, 6.5rem);
      height: 2.65rem;

      .postComponent-valueImg {
        height: 1.15rem;
      }

      .postComponent-value {
        font-size: 0.92rem;
      }
    }

    .postComponent-categoryContainer {
      width: min(100%, 13.5rem);
      max-width: calc(100% - 0.25rem);
      height: 2.9rem;
      padding: 0 0.55rem;
      box-sizing: border-box;

      .postComponent-categoryTitle {
        font-size: clamp(0.85rem, 2.6vw, 1.05rem);
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        min-width: 0;
      }
    }
  }
}
</style>
<script setup lang="ts">
import { defineProps, PropType, ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter } from "vue-router";
import { Post } from "src/components/models";
import { formatNumber } from "src/components/partials/FunctionsComponent.vue";
import PostCover from "src/components/post/PostCover.vue";

interface Props {
  post: Post[];
}

const props: Props = defineProps({
  post: {
    type: Array as PropType<Post[]>,
    required: true
  }
});

const router = useRouter();

/** Tablet Donee wall: vertical stack inside each Dreams/Problems/Ideas column. */
const isTabletColumn = ref(false);
let tabletMq: MediaQueryList | null = null;

const syncTabletLayout = () => {
  isTabletColumn.value = Boolean(tabletMq?.matches);
};

const scrollLayoutKey = computed(() => (isTabletColumn.value ? "tablet-col" : "phone-row"));

onMounted(() => {
  if (typeof window === "undefined" || typeof window.matchMedia !== "function") return;
  tabletMq = window.matchMedia("(min-width: 768px) and (max-width: 1199px)");
  syncTabletLayout();
  tabletMq.addEventListener("change", syncTabletLayout);
});

onBeforeUnmount(() => {
  tabletMq?.removeEventListener("change", syncTabletLayout);
  tabletMq = null;
});

const handlePostClick = (post: Post) => {
  if (post.post_id) {
    // Navigate to post detail page (same as Donor feed)
    router.push({ name: "donor-post-detail", params: { id: post.post_id } });
  }
};
</script>
