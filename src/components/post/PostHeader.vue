<template>
  <div class="post-header">
    <div class="post-header-bg">
      <div class="post-header-imageWrapper" :style="imageWrapperStyle">
        <PostCover
          :images="headerImages"
          :post-type="postType"
          :icon-url="iconUrl"
          :icon-placement="iconPlacement"
          :auto-slide="autoSlide"
          :show-progress="showProgress"
          :show-arrows="showArrows"
          :show-dots="showDots"
          :progress-context="progressContext"
          alt="Post image"
          :image-style="imageStyle"
          @image-click="$emit('image-click', $event)"
        />
      </div>

      <!-- GRADIENT -->
      <div class="post-header-blurContainer"></div>

      <!-- TOP ICONS -->
      <div class="post-header-topIcons">
        <q-btn
          round
          flat
          dense
          class="post-header-iconBtn post-header-iconBtn--left"
          :icon="closeIcon"
          @click="$emit('close')"
        />

        <div v-if="showShareAndLike" class="post-header-topIconsRight">
          <q-btn
            round
            flat
            dense
            class="post-header-iconBtn"
            :icon="shareIcon"
            @click="$emit('share')"
          />
          <button
            class="post-header-heartBtn"
            :class="{ 'post-header-heartBtn--liked': isLiked }"
            @click.stop="$emit('like')"
          >
            <img
              :src="isLiked ? '/post_icons/hearth_s.svg' : '/header_icons/hearth_ns.svg'"
              alt="Like"
              class="post-header-heartIcon"
            />
          </button>
        </div>
      </div>

      <!-- TITLE + META OVERLAY -->
      <div class="post-header-infoOverlay">
        <!-- CATEGORY CHIP - moved above title -->
        <div class="post-header-chipRow">
          <div class="post-header-categoryPill">
            <img
              v-if="categoryIcon"
              :src="categoryIcon"
              class="post-header-categoryIcon"
              alt=""
            />
            <span class="post-header-categoryText">
              {{ categoryName }}
            </span>
          </div>
        </div>
        <h1 class="post-header-title">{{ title }}</h1>
        <div class="post-header-metaRow">
          <div class="post-header-metaItem">
            <q-icon
              class="post-header-metaIcon"
              :name="'img:/assets/icons/ui/icon-date.svg'"
            />
            <span>{{ date }}</span>
          </div>
          <div class="post-header-metaItem">
            <q-icon
              class="post-header-metaIcon"
              :name="'img:/assets/icons/ui/icon-location.svg'"
            />
            <span>{{ location }}</span>
          </div>
          <div class="post-header-metaItem">
            <q-icon
              class="post-header-metaIcon"
              :name="'img:/assets/icons/ui/icon-views.svg'"
            />
            <span>{{ views }}</span>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import PostCover from "src/components/post/PostCover.vue";

type PostType = "dream" | "problem" | "idea";

interface Props {
  // Images
  images?: string[];
  coverImage?: string | null;
  postType?: PostType | string | null;
  iconUrl?: string | null;
  iconPlacement?: "corner" | "center";
  // Carousel options
  autoSlide?: boolean;
  showProgress?: boolean;
  showArrows?: boolean;
  showDots?: boolean;
  imageStyle?: Record<string, string>;
  imageWrapperStyle?: Record<string, string>;
  // Content
  title: string;
  date: string;
  location: string;
  views: number | string;
  categoryName: string;
  categoryIcon?: string | null;
  // Icons
  closeIcon?: string;
  shareIcon?: string;
  // State
  isLiked?: boolean;
  // Show/hide share and like buttons
  showShareAndLike?: boolean;
  progressContext?: "feed" | "detail";
}

const props = withDefaults(defineProps<Props>(), {
  images: () => [],
  coverImage: null,
  postType: null,
  iconUrl: null,
  iconPlacement: "corner",
  autoSlide: true,
  showProgress: true,
  showArrows: true,
  showDots: true,
  imageStyle: () => ({}),
  imageWrapperStyle: () => ({}),
  categoryIcon: null,
  closeIcon: "img:/assets/icons/post/icon-close.svg",
  shareIcon: "img:/assets/icons/post/icon-share.svg",
  isLiked: false,
  showShareAndLike: true,
  progressContext: "feed"
});

defineEmits<{
  close: [];
  share: [];
  like: [];
  "image-click": [index: number];
}>();

const headerImages = computed(() => {
  const imgs = Array.isArray(props.images) ? props.images.filter(Boolean) : [];
  if (imgs.length > 0) return imgs;
  if (typeof props.coverImage === "string" && props.coverImage.trim().length > 0) return [props.coverImage];
  return [];
});
</script>

<style lang="scss" scoped>
@import "src/css/partials/abstracts/mixins";

.post-header {
  // Scoped styles to prevent affecting PostDetailPage
  width: 100%;
  height: 100%;

  .post-header-bg {
    position: relative;
    width: 100%;
    height: 100%;
    min-height: 360px;
    overflow: hidden;
    border-radius: 0 0 24px 24px;
    box-shadow: 0 24px 60px rgba(0, 0, 0, 0.75);
    margin-bottom: 0;

    .post-header-imageWrapper {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      border-radius: 0 0 24px 24px;
      overflow: hidden;
      will-change: transform, filter, opacity;
      transition:
        transform 0.15s ease-out,
        filter 0.15s ease-out,
        opacity 0.15s ease-out;
    }

    .post-header-img {
      width: 100%;
      height: 100%;
      background-size: cover;
      background-position: center;
      background-repeat: no-repeat;
    }

    /* Celoplošný gradient (to top) — žiadny „polovičný“ blur ani ostrý rez výšky ~50 % */
    .post-header-blurContainer {
      position: absolute;
      inset: 0;
      height: auto;
      border-radius: 0 0 24px 24px;
      /* Jemný scrim: silnejší pri spodku fotky, dlhý priesvit smerom hore — bez tvrdého „rezu“ */
      background: linear-gradient(
        to top,
        rgba(1, 3, 16, 0.88) 0%,
        rgba(1, 3, 16, 0.5) 22%,
        rgba(1, 3, 16, 0.18) 42%,
        rgba(1, 3, 16, 0.06) 58%,
        rgba(1, 3, 16, 0) 78%
      );
      pointer-events: none;
      z-index: 1;
    }

    .post-header-topIcons {
      position: absolute;
      top: calc(env(safe-area-inset-top, 0px) + 14px);
      left: 0;
      right: 0;
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      padding: 0 16px;
      z-index: 15;
      pointer-events: none;

      > * {
        pointer-events: auto;
      }

      .post-header-topIconsRight {
        display: flex;
        gap: 0.5rem;
        align-items: center;
      }
    }

    .post-header-iconBtn,
    .post-header-heartBtn {
      @include dh-hero-action-btn;

      &.q-btn {
        min-height: 48px;
        line-height: 1;
      }

      @include dh-hero-action-btn-icon;

      &--liked {
        .post-header-heartIcon {
          animation: heartLike 0.5s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
      }
    }

    @keyframes heartLike {
      0% {
        transform: scale(1);
      }
      25% {
        transform: scale(1.3);
      }
      50% {
        transform: scale(0.9);
      }
      75% {
        transform: scale(1.1);
      }
      100% {
        transform: scale(1);
      }
    }

    .post-header-heartIcon {
      width: 22px;
      height: 22px;
      object-fit: contain;
    }

    .post-header-chipRow {
      position: relative;
      margin-bottom: 0.75rem; // Spacing above title
      padding: 0;
      z-index: 12;
      pointer-events: none;
      width: 100%;
      overflow: visible;
    }

    .post-header-categoryPill {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      min-height: 32px;
      box-sizing: border-box;
      padding: 0.5rem 0.85rem 0.42rem;
      line-height: 1.25;
      background: rgba(0, 0, 0, 0.45);
      backdrop-filter: blur(14px);
      border-radius: 999px;
      border: 1px solid rgba(255, 255, 255, 0.1);
      pointer-events: auto;
      overflow: visible;
      flex-wrap: nowrap;
    }

    .post-header-categoryIcon {
      width: 16px;
      height: 16px;
      flex-shrink: 0;
      object-fit: contain;
    }

    .post-header-categoryText {
      font-size: 0.75rem;
      font-weight: 600;
      line-height: 1.25;
      color: #ffffff;
      /* text-transform removed - formatting is handled by formatSubcategoryLabel() in JavaScript */
    }

    .post-header-infoOverlay {
      position: absolute;
      left: 0;
      right: 0;
      bottom: 0;
      padding: 0 16px 20px; // Match feed card body padding (16px horizontal, same as .postCard-body)
      z-index: 10;
      display: flex;
      flex-direction: column;
      gap: 0.35rem;
      box-sizing: border-box;
      align-items: flex-start; // Align category chip to left (same as title)
    }

    .post-header-title {
      margin: 0;
      margin-bottom: 8px; // Match feed card title margin (exactly as .postCard-title)
      padding: 0; // Match feed card title padding (exactly as .postCard-title)
      font-size: 1.15rem; // Match feed card title size (exactly as .postCard-title)
      font-weight: 700; // Match feed card title weight (exactly as .postCard-title)
      color: #ffffff; // Match feed card title color (exactly as .postCard-title)
      line-height: 1.3; // Match feed card title line-height (exactly as .postCard-title)
      text-align: left; // Match feed card title alignment (exactly as .postCard-title)
      width: 100%; // Match feed card title width (exactly as .postCard-title)
      box-sizing: border-box; // Match feed card title box-sizing (exactly as .postCard-title)
    }

    .post-header-metaRow {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      font-size: 0.75rem;
      color: rgba(255, 255, 255, 0.75);
    }

    .post-header-metaItem {
      display: flex;
      align-items: center;
      gap: 4px;

      .post-header-metaIcon {
        font-size: 14px;
        width: 14px;
        height: 14px;
        opacity: 0.7;
      }

      span {
        line-height: 1.2;
      }
    }
  }
}
</style>
