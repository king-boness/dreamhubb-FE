<template>
  <div class="column col-12 explainerComponent">
    <img
      :src="props.image"
      :style="[
        props.image === '/images/Auth/handsExchange-image.svg'
          ? 'height:20rem; margin:2.18rem -2.1rem;margin-bottom:2.4rem'
          : 'height: 20rem;'
      ]"
    />
    <div v-if="props.image.includes('handsGrip')" class="handsGrip">
      <p class="explainDescription">
        {{ props.text }}
      </p>
      <p class="explainLogo">
        {{ props.title }}
      </p>
    </div>
    <div v-else>
      <p class="explainTitle">{{ props.title }}</p>
      <p class="explainText">{{ props.text }}</p>
    </div>
  </div>
</template>
<style scoped lang="scss">
.explainerComponent {
  display: flex;
  justify-content: center;
  align-items: center;
  width: 100%;
}
</style>
<style lang="scss">
.handsGrip {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  flex-direction: column;
}
.explainText {
  font-family: inter;
  font-size: 1rem;
  color: rgba(255, 255, 255, 0.626);
}
.explainDescription {
  color: white;
  font-family: poppins;
  font-size: 1.3rem;
  width: 20rem;
  margin-top: 1rem;
}
.explainLogo {
  font-size: 3.5rem;
  width: 21rem;
  font-family: xillian;
  color: white;
  text-align: center;
}
</style>
<script setup lang="ts">
interface Props {
  title: string;
  text: string;
  image: string;
}
const props: Props = defineProps({
  title: {
    type: String,
    required: true
  },
  text: {
    type: String,
    required: true
  },
  image: {
    type: String,
    required: true
  }
});
</script>
