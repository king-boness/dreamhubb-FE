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
          <span class="component-postTitle">{{ categoryDisplayName }}</span>
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
import { normalizePost } from "src/utils/normalizePost";
import { useI18n } from "vue-i18n";
import { getCategoryIcon } from "src/domain/categories";
import { formatSubcategoryLabel } from "src/utils/formatSubcategoryLabel";

const { t } = useI18n();

const props = defineProps({
  post: {
    type: Object as PropType<Post>,
    required: true
  }
});

// Normalize post data to ensure category and subcategory objects exist
const normalizedPost = computed(() => normalizePost(props.post as Parameters<typeof normalizePost>[0]));

/* FE MAPPING */
const headerImage = computed(() => {
  return normalizedPost.value.images?.length
    ? normalizedPost.value.images[0]
    : "/images/Auth/postBackground.png";
});

const authorName = computed(() => {
  return normalizedPost.value.author_name || "Unknown User";
});

const authorPicture = computed(() => {
  return normalizedPost.value.author_picture || "/images/Auth/profilePicture.jpeg";
});

const badge = computed(() => "verified");

// Display subcategory name (traveling/health/etc.) using i18n
const categoryDisplayName = computed(() => {
  const subcategorySlug = normalizedPost.value.subcategory?.slug;
  if (!subcategorySlug) {
    const translated = t("subcategories.other") || "Other";
    return formatSubcategoryLabel(translated);
  }
  // Use i18n key: subcategories.traveling, subcategories.health, etc.
  const i18nKey = `subcategories.${subcategorySlug}`;
  const translated = t(i18nKey);
  // If translation doesn't exist, return capitalized slug, then apply formatSubcategoryLabel
  const finalText = translated !== i18nKey ? translated : subcategorySlug.charAt(0).toUpperCase() + subcategorySlug.slice(1);
  return formatSubcategoryLabel(finalText);
});

// Category icon - use category icon (dream/problem/idea), NOT subcategory icon
const categoryImage = computed(() => {
  const categorySlug = normalizedPost.value.category?.slug;
  return getCategoryIcon(categorySlug);
});

const tokens = computed(() => {
  return normalizedPost.value.tokens || 0;
});
</script>

<style scoped lang="scss">
/* tvoje pôvodné CSS */
</style>
