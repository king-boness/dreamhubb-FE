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
        @click="$router.push({ name: 'submit-postCreation' })"
        >Next step</q-btn
      >
    </div>
  </div>
</template>
<style scoped lang="scss">
.submit-layout {
  padding-top: 1.7rem !important;

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
import { ref } from "vue";
import { useRouter } from "vue-router";
import { Category } from "src/components/models";
const router = useRouter();
const currentIndex = String(router.currentRoute.value.name).substring(7);
const onSubmitIndex = ref(parseInt(currentIndex));
const progress = ref(onSubmitIndex.value * 0.35);

let horizontalSwiper = ref(false);
const selectedGoal = ref();
const selectedCategory = ref();
const nextSubmit = async () => {
  if (onSubmitIndex.value !== 2) {
    progress.value += 0.35;
    onSubmitIndex.value++;
    horizontalSwiper = ref(false);
    await router.push({ name: `submit-${onSubmitIndex.value}` });
  } else {
    // Save selected values to localStorage before navigating
    if (selectedGoal.value) {
      localStorage.setItem("postCreation_goal", selectedGoal.value);
    }
    if (selectedCategory.value) {
      localStorage.setItem("postCreation_category", selectedCategory.value);
    }
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
const handleChangedHoriz = (data: { horiz: boolean; selectedItemId: any }) => {
  const { horiz, selectedItemId } = data;
  // If we're on step 1, save as goal; if on step 2, save as category
  if (onSubmitIndex.value === 1) {
    selectedGoal.value = selectedItemId;
    // Save to localStorage immediately
    if (selectedItemId) {
      localStorage.setItem("postCreation_goal", selectedItemId);
    }
  } else if (onSubmitIndex.value === 2) {
    selectedCategory.value = selectedItemId;
    // Save to localStorage immediately
    if (selectedItemId) {
      localStorage.setItem("postCreation_category", selectedItemId);
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
    title: "others",
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
    title: "possesions",
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
