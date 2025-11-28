<template>
  <div class="dream-component">

    <!-- HEADER -->
    <div
      class="component-header"
      :style="{ backgroundImage: `url('${headerImage}')` }"
    >
      <!-- USER -->
      <div class="componentProfileContainer">
        <img
          :src="authorPicture"
          alt="profile"
          class="component-profilePicture"
        />

        <img
          v-if="badge"
          :src="`/icons/Badges/${badge}.svg`"
          class="badgeImg"
          alt="badge"
        />

        <span class="component-profileName">{{ authorName }}</span>
      </div>

      <!-- CATEGORY + TOKENS -->
      <div class="component-informationContainer">
        <div class="component-postNameContainer">
          <img
            :src="categoryImage"
            alt="category"
            class="component-postCategoryImg"
          />
          <span class="component-postTitle">{{ category }}</span>
        </div>

        <div class="component-karmaContainer">
          <img src="/icons/KarmaIcon.png" alt="" class="component-karmaImg" />
          <span class="component-karmaValue">
            {{ formatNumber(tokens) }}
          </span>
        </div>
      </div>
    </div>

    <!-- DESCRIPTION -->
    <div class="component-descriptionContainer">
      <span class="component-descriptionText">
        {{ post.description }}
      </span>
    </div>

  </div>
</template>

<script setup lang="ts">
import { defineProps, PropType, computed } from "vue";
import { Post } from "src/stores/api-calls-store";
import { formatNumber } from "src/components/partials/FunctionsComponent.vue";

const props = defineProps({
  post: {
    type: Object as PropType<Post>,
    required: true
  }
});

/* FE MAPPING */
const headerImage = computed(() => {
  return props.post.images?.length
    ? props.post.images[0]
    : "/images/Auth/postBackground.png";
});

const authorName = computed(() => {
  return props.post.author_name || "Unknown User";
});

const authorPicture = computed(() => {
  return props.post.author_picture || "/images/Auth/profilePicture.jpeg";
});

const badge = computed(() => "verified");

const category = computed(() => {
  return props.post.category_name || "Unknown";
});

const categoryImage = computed(() => {
  return props.post.category_image || "/images/Auth/goalPicture.png";
});

const tokens = computed(() => {
  return props.post.tokens || 0;
});
</script>

<style scoped lang="scss">
/* tvoje pôvodné CSS */
</style>
