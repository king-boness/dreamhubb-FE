<template>
  <q-virtual-scroll
    ref="scrollRef"
    class="scroll stories-horizontal-scroll"
    :items="props.stories"
    virtual-scroll-horizontal
    v-slot="{ item }"
  >
    <a
      class="story"
      @click="setSeen(item.id)"
      :class="!item.slides.length ? '' : 'noStoryProfile'"
    >
      <div :class="!item.seen ? 'profile' : 'profile visited'">
        <img
          :src="item.userProfileImage"
          alt=""
          width="62"
          height="62"
          loading="lazy"
          decoding="async"
        />
      </div>
      <div class="title">{{ item.label }}</div>
    </a>
  </q-virtual-scroll>
</template>

<script setup lang="ts">
import { onBeforeUnmount, onMounted, ref } from "vue";

const props = defineProps({
  stories: {
    type: Array,
    required: true
  }
});

const emit = defineEmits(["clicked"]);
const scrollRef = ref<{ $el?: HTMLElement } | null>(null);
let wheelTarget: HTMLElement | null = null;

const setSeen = (index: number) => {
  // will send to backend
  // stories.value[index].seen = true;
  emit("clicked", index);
};

/** Desktop mouse wheel → horizontal scroll when the strip overflows. */
const onWheel = (event: WheelEvent) => {
  if (!wheelTarget) return;
  if (wheelTarget.scrollWidth <= wheelTarget.clientWidth + 1) return;
  // Prefer native horizontal deltas (trackpad); map vertical wheel otherwise.
  const delta =
    Math.abs(event.deltaX) > Math.abs(event.deltaY) ? event.deltaX : event.deltaY;
  if (delta === 0) return;
  const prev = wheelTarget.scrollLeft;
  wheelTarget.scrollLeft += delta;
  if (wheelTarget.scrollLeft !== prev) {
    event.preventDefault();
  }
};

onMounted(() => {
  const inst = scrollRef.value as { $el?: HTMLElement } | HTMLElement | null;
  const el =
    inst && typeof inst === "object" && "$el" in inst && inst.$el
      ? inst.$el
      : (inst as HTMLElement | null);
  if (!el || !(el instanceof HTMLElement)) return;
  wheelTarget = el;
  el.addEventListener("wheel", onWheel, { passive: false });
});

onBeforeUnmount(() => {
  if (wheelTarget) {
    wheelTarget.removeEventListener("wheel", onWheel);
    wheelTarget = null;
  }
});
</script>
<style lang="scss" scoped>
.body--light {
  .title {
    color: #0f0026;
  }
}
</style>
<style lang="scss">
.noStoryProfile {
  background-color: none !important;
}
.scroll::-webkit-scrollbar,
.stories-horizontal-scroll::-webkit-scrollbar {
  -ms-overflow-style: none; /* IE and Edge */
  scrollbar-width: none; /* Firefox */
  display: none;
}

.stories-horizontal-scroll {
  min-width: 0;
  max-width: 100%;
  overflow-x: auto;
  overflow-y: hidden;
  overscroll-behavior-x: contain;
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
  object-position: center;
  display: block;
  flex-shrink: 0;
}

.story .title {
  text-align: center;
  padding: 5px 0;
}

.story .profile.visited {
  background: #a1a1a1;
  opacity: 0.4;
}

.story.active .profile {
  animation-duration: 1s;
  animation-name: story;
  animation-iteration-count: infinite;
}
</style>
