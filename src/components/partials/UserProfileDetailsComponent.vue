<template>
  <div class="userDetail-component">
    <div
      ref="tileRef"
      class="userDetail-reviews"
      :class="[`userDetail-reviews--${categoryClass}`, { 'userDetail-reviews--expanded': isExpanded, 'userDetail-reviews--sticky': isSticky }]"
      :style="{ background: categoryGradient }"
      @click="toggleExpand"
    >
      <div class="reviews-description">
        <img :src="props.profile.categories.img" alt="" />
        <span class="reviews-heading">{{ props.profile.categories.name }}</span>
        <span class="reviews-amount"
          >({{ totalCount }})</span
        >
      </div>
      <div class="arrowDiv no-shadow">
        <q-btn class="arrowBtn no-shadow"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
            class="arrow-icon"
            :class="{ 'arrow-rotated': isExpanded }"
          >
            <g opacity="0.6">
              <path
                d="M8.47503 15.8332C8.59952 15.8337 8.72253 15.8062 8.83501 15.7528C8.9475 15.6995 9.04659 15.6216 9.12503 15.5249L13.15 10.5249C13.2726 10.3758 13.3396 10.1888 13.3396 9.99574C13.3396 9.80272 13.2726 9.61568 13.15 9.46657L8.98336 4.46657C8.84191 4.29639 8.63865 4.18937 8.4183 4.16905C8.19794 4.14874 7.97854 4.21679 7.80836 4.35824C7.63818 4.49969 7.53116 4.70295 7.51084 4.9233C7.49053 5.14366 7.55858 5.36306 7.70003 5.53324L11.425 9.9999L7.82503 14.4666C7.72312 14.5889 7.65839 14.7378 7.63849 14.8958C7.61859 15.0538 7.64436 15.2141 7.71274 15.3579C7.78112 15.5017 7.88925 15.6228 8.02434 15.7071C8.15944 15.7913 8.31583 15.8351 8.47503 15.8332Z"
                fill="#D0DCD8"
              />
            </g></svg
        ></q-btn>
      </div>
    </div>
    <transition name="dropdown">
      <div v-if="isExpanded" class="userDetail-dropdown">
        <div class="userDetail-dropdown-content">
          <component
            :is="contentComponent"
            :profile="props.profile"
            :on-going="props.onGoing || []"
            :accomplished="props.accomplished || []"
          ></component>
        </div>
      </div>
    </transition>
  </div>
</template>
<script setup lang="ts">
import { defineProps, PropType, computed, ref, defineEmits, watch, onMounted, onBeforeUnmount, nextTick } from "vue";
import { UserProfile } from "src/components/models";
import ProfileReviewsComponent from "./ProfileReviewsComponent.vue";
import ProfileDonationsComponent from "./ProfileDonationsComponent.vue";
import ProfileDreamsComponent from "./ProfileDreamsComponent.vue";

interface Props {
  profile: UserProfile;
  expanded?: boolean;
  onGoing?: UserProfile[];
  accomplished?: UserProfile[];
}

const props: Props = defineProps({
  profile: {
    type: Object as PropType<UserProfile>,
    required: true
  },
  expanded: {
    type: Boolean,
    default: false
  },
  onGoing: {
    type: Array as PropType<UserProfile[]>,
    default: () => []
  },
  accomplished: {
    type: Array as PropType<UserProfile[]>,
    default: () => []
  }
});

const emit = defineEmits(["toggle"]);

const isExpanded = ref(props.expanded || false);
const tileRef = ref<HTMLElement | null>(null);
const isSticky = ref(false);

// Watch for external changes to expanded prop
watch(() => props.expanded, (newVal) => {
  isExpanded.value = newVal;
  if (newVal) {
    nextTick(() => {
      setupStickyListener();
    });
  } else {
    removeStickyListener();
  }
});

// Calculate total count of items for this category
const totalCount = computed(() => {
  const name = props.profile.categories.name.toLowerCase();
  if (name === "reviews") {
    // For reviews, we'll use a default count for now
    // In the future, this should come from a reviews array prop
    return 2; // Mock count - should be replaced with actual reviews count
  } else if (name === "donations") {
    // For donations, count from onGoing and accomplished
    const donations = [...(props.onGoing || []), ...(props.accomplished || [])];
    return donations.length;
  } else {
    // For Dreams, Problems, Ideas - count from onGoing and accomplished
    const items = [...(props.onGoing || []), ...(props.accomplished || [])];
    return items.length;
  }
});

// Category class for styling
const categoryClass = computed(() => {
  const name = props.profile.categories.name.toLowerCase();
  return name;
});

// Transparent gradient background for tiles - from top-left (darkest) to bottom-right (lightest)
const categoryGradient = computed(() => {
  // All tiles have the same transparent gradient - darker to blend with background
  return "linear-gradient(135deg, rgba(30, 30, 30, 0.25) 0%, rgba(40, 40, 40, 0.15) 50%, rgba(50, 50, 50, 0.1) 100%)";
});

// Determine which component to show based on category
const contentComponent = computed(() => {
  const name = props.profile.categories.name.toLowerCase();
  if (name === "reviews") {
    return ProfileReviewsComponent;
  } else if (name === "donations") {
    return ProfileDonationsComponent;
  } else {
    // Dreams, Problems, Ideas all use ProfileDreamsComponent
    return ProfileDreamsComponent;
  }
});

const toggleExpand = () => {
  isExpanded.value = !isExpanded.value;
  emit("toggle", props.profile.categories.name);
  if (isExpanded.value) {
    nextTick(() => {
      setupStickyListener();
    });
  } else {
    removeStickyListener();
  }
};

// Sticky header logic - CSS sticky should work, but we add a class for visual feedback
const setupStickyListener = () => {
  // CSS sticky positioning should handle this automatically
  // We just need to ensure the element is properly set up
  if (tileRef.value && isExpanded.value) {
    // Force a reflow to ensure sticky positioning is applied
    void tileRef.value.offsetHeight;
  }
};

const removeStickyListener = () => {
  isSticky.value = false;
};

onMounted(() => {
  if (isExpanded.value) {
    nextTick(() => {
      setupStickyListener();
    });
  }
});

onBeforeUnmount(() => {
  removeStickyListener();
});
</script>
<style scoped lang="scss">
.q-btn:before {
  box-shadow: none !important;
}
.userDetail-component {
  display: flex;
  justify-content: center;
  flex-direction: column;
  position: relative;
  width: 100%;
  margin: 0;
  padding: 0;
  overflow: visible !important;
  overflow-x: visible !important;
  overflow-y: visible !important;
  box-sizing: border-box;

  .userDetail-reviews {
    margin-bottom: 0;
    width: 100%;
    height: 5.5rem;
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1.5rem;
    border-radius: 0;
    cursor: pointer;
    transition: transform 0.2s ease, opacity 0.2s ease;
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: none;
    position: relative;
    z-index: 10;
    box-sizing: border-box;

    &.userDetail-reviews--expanded {
      position: -webkit-sticky !important;
      position: sticky !important;
      top: 0 !important;
      z-index: 999 !important;
      background: linear-gradient(135deg, rgba(30, 30, 30, 0.98) 0%, rgba(40, 40, 40, 0.95) 50%, rgba(50, 50, 50, 0.92) 100%) !important;
      backdrop-filter: blur(10px) !important;
      -webkit-backdrop-filter: blur(10px) !important;
      border-bottom: 1px solid rgba(255, 255, 255, 0.1);
      margin-bottom: 0;
      left: 0 !important;
      right: 0 !important;
      width: 100% !important;
      max-width: 100% !important;
    }

    &:hover {
      transform: translateY(-2px);
      opacity: 0.9;
    }

    &:active {
      transform: translateY(0);
    }

    .arrowDiv {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-left: 1rem;

      .arrowBtn {
        margin: 0;
        padding: 0;
        min-width: auto !important;
        min-height: auto !important;
        width: auto !important;
        height: auto !important;
        background: transparent !important;
        box-shadow: none !important;
        border: none !important;
        outline: none !important;

        &::before,
        &::after {
          display: none !important;
          content: none !important;
          box-shadow: none !important;
          border: none !important;
          background: none !important;
        }

        :deep(.q-btn__wrapper) {
          padding: 0 !important;
          min-height: auto !important;
          min-width: auto !important;
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;

          &::before,
          &::after {
            display: none !important;
            content: none !important;
            box-shadow: none !important;
            border: none !important;
            background: none !important;
          }
        }

        &:hover,
        &:active,
        &:focus {
          background: transparent !important;
          box-shadow: none !important;
          border: none !important;
          outline: none !important;
        }

        .arrow-icon {
          transition: transform 0.3s ease;
          display: block;
          margin: 0;
          padding: 0;

          &.arrow-rotated {
            transform: rotate(90deg);
          }
        }
      }
    }

    .reviews-description {
      display: flex;
      align-items: center;
      color: white;
      font-size: 1.3rem;

      img {
        margin-right: 1rem;
        height: 1.7rem;
      }

      .reviews-heading {
        margin-right: 0.3rem;
        font-family: poppinsSemiBold;
        font-size: 1.3rem;
      }

      .reviews-amount {
        font-size: 1.5rem;
        margin-left: 0.1rem;
      }
    }
  }

  .userDetail-dropdown {
    overflow: visible;
    background: transparent;
    border-top: none;
    position: relative;
    z-index: 1;
    width: 100%;
    margin: 0;
    padding: 0;
    left: 0;
    right: 0;
    display: block;
    clear: both;
    transform: translateX(0);
    max-width: 100%;

    .userDetail-dropdown-content {
      padding: 0;
      background: rgba(20, 20, 20, 0.95);
      border-top: 1px solid rgba(255, 255, 255, 0.1);
      width: 100%;
      max-width: 100%;
      margin: 0;
      position: relative;
      left: 0;
      right: 0;
      box-sizing: border-box;
      display: block;
      clear: both;
      transform: translateX(0);

      // Hide header sections in dropdown mode
      :deep(.ProfileReview-header) {
        display: none;
      }

      :deep(.ProfileReview-page) {
        margin-top: 0;
        padding: 0;
        width: 100%;
      }

      // Ensure PostFilterComponent tabs are below the tile
      :deep(.post-filter) {
        padding-top: 1rem;
        width: 100%;
        margin: 0;
      }

      // Ensure content is properly aligned
      :deep(.profileReviewsComponent-reviewsContainer) {
        padding: 0 1.5rem 1rem;
        width: 100%;
        margin: 0;
      }

      // Ensure order-tabs container is full width
      :deep(.order-tabs) {
        width: 100%;
        margin: 0;
        padding: 0;
      }
    }
  }
}

// Dropdown transition animations
.dropdown-enter-active,
.dropdown-leave-active {
  transition: max-height 0.3s ease, opacity 0.3s ease;
  overflow: hidden;
}

.dropdown-enter-from {
  max-height: 0;
  opacity: 0;
}

.dropdown-enter-to {
  max-height: 2000px;
  opacity: 1;
}

.dropdown-leave-from {
  max-height: 2000px;
  opacity: 1;
}

.dropdown-leave-to {
  max-height: 0;
  opacity: 0;
}
</style>
