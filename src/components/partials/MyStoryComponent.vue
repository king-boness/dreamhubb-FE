<template>
  <div class="myStoryComponent">
    <a
      v-for="(story, i) in stories"
      :key="i"
      class="story"
      href="#"
      @click.prevent="openMyProfile"
    >
      <div class="profile">
        <img
          :src="(story as any).userProfileImage"
          alt=""
          width="62"
          height="62"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div class="title">{{ (story as any).label }}</div>
    </a>
  </div>
</template>

<script setup lang="ts">
import { useRoute, useRouter } from "vue-router";

defineProps({
  stories: {
    type: Array,
    required: true
  }
});

const router = useRouter();
const route = useRoute();

const openMyProfile = () => {
  const name = route.name?.toString() || "";
  if (name.startsWith("donee")) {
    void router.push({ name: "donee-myprofile" });
    return;
  }
  void router.push({ name: "donor-myprofile" });
};
</script>

<style lang="scss" scoped>
.body--light {
  .title {
    color: #0f0026;
  }
}

.myStoryComponent {
  padding: 0.8rem 0;
  padding-bottom: 0.5rem;
  display: flex;
  align-items: center;
}

.story {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  text-decoration: none;
}

.story .profile {
  background: $primary;
  padding: 5px;
  margin: 5px;
  margin-top: 0;
  width: 70px;
  height: 70px;
  border-radius: 50%;
  display: flex;
  justify-content: center;
  align-items: center;
}

.story .profile img {
  width: 62px;
  height: 62px;
  min-width: 62px;
  min-height: 62px;
  border-radius: 50%;
  padding: 0;
  margin: 0;
  border: 2px solid #000;
  box-sizing: content-box;
  object-fit: cover;
  display: block;
  flex-shrink: 0;
}

.story .title {
  color: white;
  text-align: center;
  padding: 5px 0 0;
  max-width: 4.5rem;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 0.72rem;
  line-height: 1.15;
}
</style>
