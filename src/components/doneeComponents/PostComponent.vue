<template>
  <q-virtual-scroll
    :items="props.post"
    virtual-scroll-horizontal
    v-slot="{ item }"
    class="scroll"
  >
    <div
      class="post-component"
      :style="{
        backgroundImage: 'url(' + item.image + ')'
      }"
    >
      <div class="postComponent-valueContainer">
        <img class="postComponent-valueImg" src="/icons/KarmaIcon.png" alt="" />
        <span class="postComponent-value">{{ formatNumber(item.karma) }}</span>
      </div>
      <div class="postComponent-categoryContainer">
        <img :src="item.goalImage" alt="" class="postComponent-categoryImg" />
        <span class="postComponent-categoryTitle">{{ item.goalName }}</span>
      </div>
    </div>
  </q-virtual-scroll>
</template>
<style scoped lang="scss">
.scroll::-webkit-scrollbar {
  -ms-overflow-style: none;
  scrollbar-width: none;
  display: none;
}
.scroll {
  width: 100%;
  margin-top: 1rem;
}
.post-component {
  background-repeat: round;
  background-size: cover;
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  width: 18rem;
  height: 13rem;
  margin: 0 1rem;
  border-radius: 1.25rem;
  padding: 0.7rem;
  .postComponent-valueContainer {
    display: flex;
    align-items: center;
    justify-content: center;
    background: linear-gradient(
      108.46deg,
      rgba(0, 0, 0, 0.441) 1%,
      rgba(23, 23, 23, 0.599) 100%
    );
    width: 6.5rem;
    height: 3rem;
    border-radius: 1rem;
    gap: 0.3rem;
    .postComponent-valueImg {
      height: 1.3rem;
    }
    .postComponent-value {
      color: $primary;
      font-family: poppinsBold;
      font-size: 1rem;
    }
  }
  .postComponent-categoryContainer {
    background: linear-gradient(
      108.46deg,
      rgba(0, 0, 0, 0.441) 1%,
      rgba(23, 23, 23, 0.599) 100%
    );
    width: 13.5rem;
    height: 3.3rem;
    display: flex;
    gap: 0.3rem;
    justify-content: center;
    align-items: center;
    border-radius: 1rem;
    .postComponent-categoryImg {
      height: 0.9rem;
    }
    .postComponent-categoryTitle {
      font-family: poppinsSemiBold;
      font-size: 1.1rem;
    }
  }
}
</style>
<script setup lang="ts">
import { defineProps, PropType } from "vue";
import { Post } from "src/components/models";
import { formatNumber } from "src/components/partials/FunctionsComponent.vue";

interface Props {
  post: Post[];
}

const props: Props = defineProps({
  post: {
    type: Array as PropType<Post[]>,
    required: true
  }
});
</script>
