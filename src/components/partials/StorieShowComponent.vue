<template>
  <div class="storiesComponent">
    <MyStoryComponent :stories="myStory" />
    <StoriesSliderComponent
      :stories="stories"
      @open-profile="openOtherProfile"
    />
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";
import StoriesSliderComponent from "./StoriesSliderComponent.vue";
import MyStoryComponent from "./MyStoryComponent.vue";

defineProps({
  stories: {
    type: Array,
    required: true
  },
  myStory: {
    type: Array,
    required: true
  }
});

const router = useRouter();
const route = useRoute();

const openOtherProfile = (userId: number | null | undefined) => {
  if (userId == null || !(userId > 0)) return;
  const name = route.name?.toString() || "";
  if (name.startsWith("donee")) {
    void router.push({ name: "donee-user-profile", params: { userId: String(userId) } });
    return;
  }
  void router.push({ name: "donor-user-profile", params: { userId: String(userId) } });
};
</script>

<style lang="scss" scoped>
.storiesComponent {
  padding: 0.8rem 0;
  border-bottom: 0.05rem solid rgba(255, 255, 255, 0.202);
  padding-bottom: 0.5rem;
  display: flex;
  align-items: center;
  min-width: 0;
  max-width: 100%;
  box-sizing: border-box;
}

.storiesComponent > .scroll,
.storiesComponent > .q-virtual-scroll {
  flex: 1 1 auto;
  min-width: 0;
}
</style>
