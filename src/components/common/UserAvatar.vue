<template>
  <q-avatar :size="size" :color="imageUrl ? 'transparent' : 'primary'" :text-color="imageUrl ? undefined : 'white'">
    <img v-if="imageUrl && !imageUrl.startsWith('data:image')" :src="imageUrl" :alt="name || 'Avatar'" />
    <span v-else>{{ initials }}</span>
  </q-avatar>
</template>

<script setup lang="ts">
import { computed } from "vue";
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

const initials = computed(() => getUserInitials(props.name));
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
