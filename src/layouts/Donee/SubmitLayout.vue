<template>
  <div class="submit-layout">
    <div class="submit-header">
      <q-btn @click="previousSubmit" class="submit-buttonPrevious">
        <img src="/icons/arrowButton-icon.svg" alt="" />
      </q-btn>
      <q-linear-progress
        :value="progress"
        rounded
        dark
        animationSpeed="600"
        color="negative"
        class="submit-progress"
      />
    </div>
    <div class="submit-routerContainer">
      <RouterView
        :key="route.fullPath"
        :next-page="nextSubmit"
        @changedHoriz="handleChangedHoriz"
        :category="categories"
        :specificCategory="specificCategory"
      ></RouterView>
    </div>
    <div class="submit-footer">
      <span v-if="!horizontalSwiper" class="submit-description"
        >Choose by swiping up or down</span
      >
      <div v-if="horizontalSwiper && onSubmitIndex != 2">
        <div
          v-for="(item, i) in categories"
          :key="i"
          class="categoryTitleContainer"
        >
          <p v-if="selectedGoal == item.title" class="submitPage-description">
            {{ item.description }}
          </p>
        </div>
      </div>
      <div v-if="horizontalSwiper && onSubmitIndex != 1">
        <div
          v-for="(item, i) in specificCategory"
          :key="i"
          class="categoryTitleContainer"
        >
          <p v-if="selectedGoal == item.title" class="submitPage-description">
            {{ item.description }}
          </p>
        </div>
      </div>
      <q-btn
        v-if="onSubmitIndex != 2"
        class="submit-nextButton"
        @click="nextSubmit"
        >Next step</q-btn
      >
      <q-btn
        v-else
        class="submit-nextButton"
        @click="nextSubmit"
        >Next step</q-btn
      >
    </div>
  </div>
</template>
<style scoped lang="scss">
.submit-layout {
  padding-top: 1.7rem !important;
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  .submit-header {
    display: flex;
    flex-direction: row;
    align-items: center;
    justify-content: start;
    padding: 1.3rem 1rem;
    .submit-buttonPrevious {
      margin: 0 0.4rem;
      width: 2.1rem;
      height: 2.1rem;
      border-radius: 2rem;
      padding-left: 0.98rem;
      border: 0.15rem solid white;
      backdrop-filter: blur(1rem);
      img {
        height: 1rem;
      }
    }
    .submit-progress {
      width: 9rem;
      margin-left: 15%;
      height: 0.3rem;
    }
  }
  .submit-routerContainer {
    width: 100%;
    flex: 1;
    overflow-y: auto;
  }
  .categoryTitleContainer {
    display: flex;
    text-align: center;
    padding: 0 1rem;
    .submitPage-description {
      font-size: 1rem;
      margin-top: 1.5rem !important;
      margin-bottom: 9.3rem;
      font-family: inter;
    }
  }
  .submit-footer {
    display: flex;
    justify-content: center;
    align-items: center;
    flex-direction: column;
    gap: 1.1rem;

    .submit-description {
      color: white;
      font-family: poppins;
      font-weight: 400;
      font-size: 1.1rem;
    }
    .submit-nextButton {
      background-color: rgba(182, 0, 67, 1);
      color: white;
      border: none;
      font-size: 1.2rem;
      height: 3.2rem;
      width: 22rem;
      font-family: montseraatSemiBold;
      border-radius: 0.5rem !important;
      margin-bottom: 0.8rem;
    }
  }
}
</style>
<script setup lang="ts">
import { ref, watch, onMounted } from "vue";
import { useRouter, useRoute } from "vue-router";
import { Category } from "src/components/models";
const router = useRouter();
const route = useRoute();

// Initialize onSubmitIndex from route name
const getInitialIndex = () => {
  const routeName = String(route.name || "");
  if (routeName.startsWith("submit-")) {
    const indexStr = routeName.substring(7);
    const index = parseInt(indexStr);
    return isNaN(index) ? 1 : index;
  }
  return 1;
};

// Initialize with current route
const initialIndex = getInitialIndex();
const onSubmitIndex = ref(initialIndex);
const progress = ref(initialIndex * 0.35);

const horizontalSwiper = ref(false);
const selectedGoal = ref();
const selectedCategory = ref();

// Watch for route changes to update index
watch(() => route.name, (newName) => {
  if (newName && String(newName).startsWith("submit-")) {
    const indexStr = String(newName).substring(7);
    const index = parseInt(indexStr);
    if (!isNaN(index) && index !== onSubmitIndex.value) {
      onSubmitIndex.value = index;
      progress.value = index * 0.35;
      horizontalSwiper.value = false;
    }
  }
}, { immediate: true });

const nextSubmit = async () => {
  if (onSubmitIndex.value === 1) {
    // Step 1: Goal selection -> navigate to step 2 (category selection)
    progress.value += 0.35;
    onSubmitIndex.value++;
    horizontalSwiper.value = false;
    await router.push({ name: `submit-${onSubmitIndex.value}` });
  } else if (onSubmitIndex.value === 2) {
    // Step 2: Category selection -> save and navigate to post creation page
    // Save selected values to localStorage before navigating
    if (selectedGoal.value) {
      localStorage.setItem("donee_postCreation_goal", selectedGoal.value);
    }
    if (selectedCategory.value) {
      localStorage.setItem("donee_postCreation_category", selectedCategory.value);
    }
    // Navigate directly to post creation page (skip subcategory picker in onboarding flow)
    router.push({ name: "submit-postCreation" });
  }
};

const previousSubmit = () => {
  if (onSubmitIndex.value - 1 < 1) {
    router.push({ name: "donee-posts" });
  } else {
    progress.value -= 0.35;
    onSubmitIndex.value--;
    router.push({ name: `submit-${onSubmitIndex.value}` });
  }
};
const GOAL_ID_TO_SLUG: Record<string | number, string> = { 1: "problem", 2: "dream", 3: "idea", "1": "problem", "2": "dream", "3": "idea" };
const toGoalSlug = (v: unknown): string | null => {
  if (v === null || v === undefined) return null;
  const s = String(v).toLowerCase().trim();
  if (["dream", "problem", "idea"].includes(s)) return s;
  return GOAL_ID_TO_SLUG[v as string | number] ?? null;
};
const handleChangedHoriz = (data: { horiz: boolean; selectedItemId: any }) => {
  const { horiz, selectedItemId } = data;
  if (onSubmitIndex.value === 1) {
    const slug = toGoalSlug(selectedItemId) ?? selectedItemId;
    selectedGoal.value = slug;
    if (slug) {
      localStorage.setItem("postCreation_goal", slug);
      localStorage.setItem("donee_postCreation_goal", slug);
    }
  } else if (onSubmitIndex.value === 2) {
    selectedCategory.value = selectedItemId;
    if (selectedItemId) {
      localStorage.setItem("postCreation_category", selectedItemId);
      localStorage.setItem("donee_postCreation_category", selectedItemId);
    }
  }
  horizontalSwiper.value = horiz;
};
const categories = ref([
  {
    id: 1,
    title: "problem",
    description:
      "Any person that can give or provide anything or any service that someone else might be interested in and find valuable. There is a variety of ways in which the mentor can help donees. He or she can either help in a full or just partially or anything in between depending on his or her skills, means, and abilities."
  },
  {
    id: 2,
    title: "dream",
    description:
      "Any person that can give or provide anything or any service that someone else might be interested in and find valuable. There is a variety of ways in which the mentor can help donees. He or she can either help in a full or just partially or anything in between depending on his or her skills, means, and abilities."
  },
  {
    id: 3,
    title: "idea",
    description:
      "Any person that can give or provide anything or any service that someone else might be interested in and find valuable. There is a variety of ways in which the mentor can help donees. He or she can either help in a full or just partially or anything in between depending on his or her skills, means, and abilities."
  }
] as Category[]);

const specificCategory = ref([
  {
    id: 6,
    title: "profession",
    description:
      "Any person that can give or provide anything or any service that someone else might be interested in and find valuable. There is a variety of ways in which the mentor can help donees. He or she can either help in a full or just partially or anything in between depending on his or her skills, means, and abilities."
  },
  {
    id: 7,
    title: "events",
    description:
      "Any person that can give or provide anything or any service that someone else might be interested in and find valuable. There is a variety of ways in which the mentor can help donees. He or she can either help in a full or just partially or anything in between depending on his or her skills, means, and abilities."
  },
  {
    id: 8,
    title: "other",
    description:
      "Any person that can give or provide anything or any service that someone else might be interested in and find valuable. There is a variety of ways in which the mentor can help donees. He or she can either help in a full or just partially or anything in between depending on his or her skills, means, and abilities."
  },
  {
    id: 3,
    title: "traveling",
    description:
      "Any person that can give or provide anything or any service that someone else might be interested in and find valuable. There is a variety of ways in which the mentor can help donees. He or she can either help in a full or just partially or anything in between depending on his or her skills, means, and abilities."
  },
  {
    id: 2,
    title: "health",
    description:
      "Any person that can give or provide anything or any service that someone else might be interested in and find valuable. There is a variety of ways in which the mentor can help donees. He or she can either help in a full or just partially or anything in between depending on his or her skills, means, and abilities."
  },
  {
    id: 1,
    title: "learning",
    description:
      "Any person that can give or provide anything or any service that someone else might be interested in and find valuable. There is a variety of ways in which the mentor can help donees. He or she can either help in a full or just partially or anything in between depending on his or her skills, means, and abilities."
  },
  {
    id: 4,
    title: "possessions",
    description:
      "Any person that can give or provide anything or any service that someone else might be interested in and find valuable. There is a variety of ways in which the mentor can help donees. He or she can either help in a full or just partially or anything in between depending on his or her skills, means, and abilities."
  },
  {
    id: 5,
    title: "relationships",
    description:
      "Any person that can give or provide anything or any service that someone else might be interested in and find valuable. There is a variety of ways in which the mentor can help donees. He or she can either help in a full or just partially or anything in between depending on his or her skills, means, and abilities."
  }
] as Category[]);
</script>
