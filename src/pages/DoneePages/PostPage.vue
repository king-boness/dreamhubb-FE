<template>
  <div class="post-page">
    <!-- First Post Hint Bubble -->
    <div v-if="showFirstPostHint" class="postPage-firstPostHint">
      <HintBubble
        title="Start your journey!"
        text="Create your first dream, problem or idea and share it with the world."
        arrow="down"
        :show-close="true"
        @close="dismissFirstPostHint"
      />
    </div>

    <div class="postPage-carouselContainer">
      <q-carousel
        v-model="slide"
        swipeable
        animated
        infinite
        :autoplay="3500"
        :navigation-position="navPos"
        navigation
        navigation-icon="img:/icons/navigation-icon.svg"
        navigation-active-icon="img:/icons/navigationActive-icon.svg"
        class="postPage-carousel"
      >
        <q-carousel-slide
          v-for="(carousel, i) in carousels"
          :key="i"
          :name="carousel.value"
          class="column no-wrap flex-center postPage-singleCarousel"
          :img-src="carousel.img"
        >
          <div class="postPage-carouselTextContainer">
            <span class="carousel-title">{{ carousel.title }}</span>
            <span class="carousel-text">{{ carousel.text }}</span>
          </div>
        </q-carousel-slide>
      </q-carousel>
    </div>

    <!-- My Dreams Section -->
    <div class="postPage-header postPgae-myDreamsContainer">
      <div class="postPage-headerContainer">
        <span class="postPage-title">{{ t("myDreams") }} ({{ mappedMyDreams.length }})</span>
      </div>
      <!-- Loading state -->
      <div v-if="postsStore.myDreamsLoading" class="postPage-loading">
        <p>{{ t("loading") }}</p>
      </div>
      <!-- Error state -->
      <div v-else-if="postsStore.myDreamsError" class="postPage-error">
        <p>{{ postsStore.myDreamsError }}</p>
      </div>
      <!-- Empty state -->
      <div v-else-if="!postsStore.myDreamsLoading && mappedMyDreams.length === 0" class="postPage-empty">
        <p>{{ t("noDreamsYet") }}</p>
      </div>
      <!-- Posts -->
      <PostComponent
        v-else
        class="postPage-postComponent"
        :post="mappedMyDreams"
      ></PostComponent>
    </div>

    <!-- My Problems Section -->
    <div class="postPage-postsContainer">
      <div class="postPage-header">
        <div class="postPage-headerContainer">
          <span class="postPage-title">{{ t("myProblems") }} ({{ mappedMyProblems.length }})</span>
        </div>
        <!-- Loading state -->
        <div v-if="postsStore.myProblemsLoading" class="postPage-loading">
          <p>{{ t("loading") }}</p>
        </div>
        <!-- Error state -->
        <div v-else-if="postsStore.myProblemsError" class="postPage-error">
          <p>{{ postsStore.myProblemsError }}</p>
        </div>
        <!-- Empty state -->
        <div v-else-if="!postsStore.myProblemsLoading && mappedMyProblems.length === 0" class="postPage-empty">
          <p>{{ t("noProblemsYet") }}</p>
        </div>
        <!-- Posts -->
        <PostComponent
          v-else
          class="postPage-postComponent"
          :post="mappedMyProblems"
        ></PostComponent>
      </div>
    </div>

    <!-- My Ideas Section -->
    <div class="postPage-postsContainer">
      <div class="postPage-header">
        <div class="postPage-headerContainer">
          <span class="postPage-title">{{ t("myIdeas") }} ({{ mappedMyIdeas.length }})</span>
        </div>
        <!-- Loading state -->
        <div v-if="postsStore.myIdeasLoading" class="postPage-loading">
          <p>{{ t("loading") }}</p>
        </div>
        <!-- Error state -->
        <div v-else-if="postsStore.myIdeasError" class="postPage-error">
          <p>{{ postsStore.myIdeasError }}</p>
        </div>
        <!-- Empty state -->
        <div v-else-if="!postsStore.myIdeasLoading && mappedMyIdeas.length === 0" class="postPage-empty">
          <p>{{ t("noIdeasYet") }}</p>
        </div>
        <!-- Posts -->
        <PostComponent
          v-else
          class="postPage-postComponent"
          :post="mappedMyIdeas"
        ></PostComponent>
      </div>
    </div>

    <!-- Recently Accomplished Section -->
    <div class="postPage-postsContainer">
      <div class="postPage-header">
        <div class="postPage-headerContainer">
          <span class="postPage-title">{{ t("recentlyAccomplished") }}</span>
        </div>
        <!-- Loading state -->
        <div v-if="postsStore.recentlyAccomplishedLoading" class="postPage-loading">
          <p>{{ t("loading") }}</p>
        </div>
        <!-- Error state -->
        <div v-else-if="postsStore.recentlyAccomplishedError" class="postPage-error">
          <p>{{ postsStore.recentlyAccomplishedError }}</p>
        </div>
        <!-- Empty state -->
        <div v-else-if="!postsStore.recentlyAccomplishedLoading && mappedRecentlyAccomplished.length === 0" class="postPage-empty">
          <p>{{ t("noGoalsAccomplished") }}</p>
        </div>
        <!-- Posts -->
        <PostComponent
          v-else
          class="postPage-postComponent"
          :post="mappedRecentlyAccomplished"
        ></PostComponent>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onActivated } from "vue";
import { useI18n } from "vue-i18n";
import { CarouselPost, Post } from "src/components/models";
import PostComponent from "src/components/doneeComponents/PostComponent.vue";
import { usePostsStore } from "src/stores/posts";
import HintBubble from "src/components/ui/HintBubble.vue";
import { getLocationLabel } from "src/utils/cityNames";

const { t, locale } = useI18n();

// Reactive state for dismissed hint
const hintDismissed = ref(false);

const postsStore = usePostsStore();

const slide = ref("1");
const navPos = ref<"top" | "right" | "bottom" | "left" | undefined>("top");

const carousels = ref([
  {
    value: "1",
    title: "Quote for the day",
    text: "“If you don't dream, you won't die, but even you won't be alive without them.”",
    img: "/icons/carousel-bg.svg"
  },
  {
    value: "2",
    title: "Quote for the day",
    text: "“We cannot solve problems with the kind of thinking we employed when we came up with them.”",
    img: "/icons/carousel-bg.svg"
  },
  {
    value: "3",
    title: "Quote for the day",
    text: "“Learn as if you will live forever, live like you will die tomorrow.”",
    img: "/icons/carousel-bg.svg"
  },
  {
    value: "4",
    title: "Quote for Tomi",
    text: "“I never dreamed about success. I worked for it.”",
    img: "/icons/carousel-bg.svg"
  }
] as CarouselPost[]);

// Map category names to icon file names (same as PostCreationPage)
const getCategoryIcon = (category: string | null): string => {
  if (!category) return "/icons/CategoryIcons/traveling.svg";
  const categoryMap: Record<string, string> = {
    traveling: "traveling",
    travelling: "traveling",
    health: "health",
    learning: "learning",
    possesions: "possesions",
    possessions: "possesions",
    relationships: "relationships",
    events: "events",
    profession: "proffesion",
    other: "other",
    others: "other"
  };
  const iconName = categoryMap[category.toLowerCase()] || "traveling";
  return `/icons/CategoryIcons/${iconName}.svg`;
};

// Map BE post data to Post interface format (for PostComponent)
const mapPostToComponentFormat = (post: Record<string, unknown>): Post => {
  const images = Array.isArray(post.images) ? post.images as string[] : [];
  const firstImage = images.length > 0 ? images[0] : "/images/Auth/postBackground.png";

  return {
    post_id: (post.post_id || null) as number | undefined,
    goalName: (post.title || "Untitled") as string,
    goalImage: getCategoryIcon((post.fe_category || post.category_name || null) as string | null),
    karma: (post.tokens || 0) as number,
    image: firstImage,
    images: images.length > 0 ? images : null,
    description: (post.description || "") as string,
    user: {
      userName: (post.author_name || "Unknown") as string,
      userPicture: "",
      badge: "verified"
    },
    postInfo: {
      dateCreated: (post.date_created || "") as string,
      location: getLocationLabel(post, locale.value as string) || "Unknown",
      viewed: (post.views || 0) as number
    }
  };
};

// Map my dreams from store to Post[] format
const mappedMyDreams = computed(() => {
  if (!postsStore.myDreams || postsStore.myDreams.length === 0) {
    return [];
  }
  return postsStore.myDreams.map(mapPostToComponentFormat);
});

// Map my problems from store to Post[] format
const mappedMyProblems = computed(() => {
  if (!postsStore.myProblems || postsStore.myProblems.length === 0) {
    return [];
  }
  return postsStore.myProblems.map(mapPostToComponentFormat);
});

// Map my ideas from store to Post[] format
const mappedMyIdeas = computed(() => {
  if (!postsStore.myIdeas || postsStore.myIdeas.length === 0) {
    return [];
  }
  return postsStore.myIdeas.map(mapPostToComponentFormat);
});

// Map recently accomplished dreams from store to Post[] format
const mappedRecentlyAccomplished = computed(() => {
  if (!postsStore.recentlyAccomplishedDreams || postsStore.recentlyAccomplishedDreams.length === 0) {
    return [];
  }
  return postsStore.recentlyAccomplishedDreams.map(mapPostToComponentFormat);
});

// Check if user has any posts
const hasAnyPosts = computed(() => {
  const totalPosts =
    (postsStore.myDreams?.length || 0) +
    (postsStore.myProblems?.length || 0) +
    (postsStore.myIdeas?.length || 0);
  return totalPosts > 0;
});

// Check if first post hint should be shown
const showFirstPostHint = computed(() => {
  // Check if hint was dismissed (reactive state or localStorage)
  if (hintDismissed.value) {
    return false;
  }

  const dismissed = localStorage.getItem("dh_donee_first_post_hint_dismissed");
  if (dismissed === "true") {
    return false;
  }

  // Don't show if user has posts (priority over localStorage)
  if (hasAnyPosts.value) {
    return false;
  }

  // Show only if all data is loaded (not loading)
  const isLoading =
    postsStore.myDreamsLoading ||
    postsStore.myProblemsLoading ||
    postsStore.myIdeasLoading;

  if (isLoading) {
    return false;
  }

  return true;
});

// Dismiss first post hint
const dismissFirstPostHint = () => {
  hintDismissed.value = true;
  localStorage.setItem("dh_donee_first_post_hint_dismissed", "true");
};

// Fetch data on mount
onMounted(async () => {
  // Check localStorage first
  const dismissed = localStorage.getItem("dh_donee_first_post_hint_dismissed");
  if (dismissed === "true") {
    hintDismissed.value = true;
  }

  await Promise.all([
    postsStore.fetchMyDreams({ type: "dream" }),
    postsStore.fetchMyProblems({ type: "problem" }),
    postsStore.fetchMyIdeas({ type: "idea" }),
    postsStore.fetchRecentlyAccomplishedDreams()
  ]);
});

// Re-fetch data when returning to this page (for updated data after post creation/donation)
onActivated(async () => {
  await Promise.all([
    postsStore.fetchMyDreams({ type: "dream" }),
    postsStore.fetchMyProblems({ type: "problem" }),
    postsStore.fetchMyIdeas({ type: "idea" }),
    postsStore.fetchRecentlyAccomplishedDreams()
  ]);
});
</script>
<style scoped lang="scss">
.post-page {
  .postPage-carouselContainer {
    margin: 1.3rem 0;
    image-rendering: auto;
    .postPage-carousel {
      background-color: rgba(34, 0, 113, 0.174);
      height: 7rem;
      .postPage-singleCarousel {
        background-size: cover;
        background-repeat: no-repeat;
        image-rendering: auto;
        background-position: 0rem 1rem;

        .postPage-carouselTextContainer {
          display: flex;
          flex-direction: column;
          padding-right: 26%;
          .carousel-text {
            color: white;
            font-family: poppinsBold;
            font-size: 0.8rem;
          }
          .carousel-title {
            color: $primary;
            font-family: poppins;
            font-size: 0.7rem;
            margin-bottom: 0.4rem;
          }
        }
      }
    }
  }
  .postPgae-myDreamsContainer {
    margin-bottom: 0.6rem;
  }

  .postPage-header {
    color: white;
    display: flex;
    align-items: center;
    flex-direction: column;
    min-height: 18rem;
    .postPage-headerContainer {
      display: flex;
      justify-content: space-between;
      align-items: center;
      width: 100%;
      padding: 0 1.2rem;
    }
    .postPage-title {
      font-family: poppinsSemiBold;
      font-size: 1.3125rem;
    }
    .postPage-headerButton {
      font-family: poppins;
      font-weight: 400;
      width: 5.5rem;
      font-size: 1.1rem;
      text-transform: capitalize;
      word-spacing: 0.1rem;
      padding: 0;
    }
  }

  .postPage-loading,
  .postPage-error,
  .postPage-empty {
    text-align: center;
    padding: 2rem 1rem;
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    font-family: poppins;
    width: 100%;
  }

  .postPage-error {
    color: rgba(255, 68, 68, 0.8);
  }

  .postPage-empty {
    color: rgba(255, 255, 255, 0.5);
  }
}

.postPage-firstPostHint {
  position: fixed;
  bottom: calc(8.5rem + 32px);
  left: 50%;
  transform: translateX(-50%);
  z-index: 9999;
  width: 100%;
  display: flex;
  justify-content: center;
}
</style>
<style lang="scss">
.q-carousel__navigation--top {
  top: 0.7rem !important;
  left: 73%;
}
.q-carousel__navigation-inner {
  margin-top: -0.5rem;
  flex: none;

  * {
    font-size: 0.3rem !important;
    height: 0.6rem !important;
    width: 0.6rem;
  }
}
.q-btn:before {
  box-shadow: none;
}
</style>
