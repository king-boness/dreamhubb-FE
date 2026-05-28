<template>
  <a
    class="story"
    v-for="(story, i) in props.stories"
    :key="i"
    @click="setSeen((story as any).id)"
    :class="!(story as any).slides.length ? '' : 'noStoryProfile'"
  >
    <div :class="!(story as any).seen ? 'profile' : 'profile visited'">
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
</template>

<script setup lang="ts">
const props = defineProps({
  stories: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(["clicked"]);

const setSeen = (index: number) => {
  // will send to backend
  // stories.value[index].seen = true;
  emit("clicked", index);
};
</script>
<style lang="scss" scoped>
.body--light {
  .title {
    color: #0f0026;
  }
}
</style>
<style lang="scss" scoped>
.noStoryProfile {
  background-color: none !important;
}
.scroll::-webkit-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  display: none;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

.title {
  color: white;
}
.story {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
}
.story .profile {
  background: $primary;
  padding: 5px;
  margin: 5px;
  margin-top: 0px;
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
  text-align: center;
  padding: 5px 0;
  padding-top: 4px;
}
</style>
