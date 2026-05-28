<template>
  <q-avatar :size="size" :color="displayImageUrl ? 'transparent' : 'primary'" :text-color="displayImageUrl ? undefined : 'white'">
    <img
      v-if="displayImageUrl && !displayImageUrl.startsWith('data:image')"
      :src="displayImageUrl"
      :alt="name || 'Avatar'"
      @load="onImageLoad"
      @error="onImageError"
    />
    <span v-else>{{ initials }}</span>
  </q-avatar>
</template>

<script setup lang="ts">
import { computed, ref, watch } from "vue";
import { getUserInitials } from "src/utils/avatar";

interface Props {
  imageUrl?: string | null;
  name?: string | null;
  size?: string;
}

const props = withDefaults(defineProps<Props>(), {
  imageUrl: null,
  name: null,
  size: "32px"
});

const broken = ref(false);
watch(
  () => props.imageUrl,
  () => {
    broken.value = false;
  }
);

const displayImageUrl = computed(() => (broken.value ? null : props.imageUrl));
const initials = computed(() => getUserInitials(props.name));
if (import.meta.env.DEV) {
  watch(
    () => displayImageUrl.value,
    (src) => {
      console.info("[DH-PROFILE-UPLOAD]", "render src", {
        component: "UserAvatar",
        src: src ?? "(none)"
      });
    },
    { immediate: true }
  );
}
const onImageLoad = () => {
  if (import.meta.env.DEV) {
    console.info("[DH-PROFILE-UPLOAD]", "img onload", {
      component: "UserAvatar",
      src: displayImageUrl.value ?? "(none)"
    });
  }
};
const onImageError = () => {
  broken.value = true;
  if (import.meta.env.DEV) {
    console.info("[DH-PROFILE-UPLOAD]", "img onerror", {
      component: "UserAvatar",
      src: props.imageUrl ?? "(none)"
    });
  }
};
</script>

<style scoped lang="scss">
.q-avatar {
  img {
    object-fit: cover;
    width: 100%;
    height: 100%;
  }
}
</style>
