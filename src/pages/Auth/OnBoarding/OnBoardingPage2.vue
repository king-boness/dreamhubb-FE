<template>
  <div class="onBoarding-page2">
    <div class="onBoarding-body">
      <span class="onBoarding-title">{{ t("onboarding.tokens.page2Title") }}</span>
      <div
        class="onBoarding-textContainer"
        v-for="(option, i) in options"
        :key="i"
      >
        <img class="onBoarding-karmaIcon" :src="option.img" alt="" />
        <span class="onBoarding-description">{{ option.text }}</span>
      </div>
    </div>
  </div>
</template>
<style scoped lang="scss">
.onBoarding-page2 {
  .onBoarding-body {
    display: flex;
    justify-content: center;
    flex-direction: column;
    align-items: center;
    padding: 2rem;
    text-align: center;
    margin-top: 3rem;
    .onBoarding-title {
      color: white;
      font-size: 1.2rem;
      font-family: poppinsSemiBold;
      margin-bottom: 1.5rem;
    }
    .onBoarding-textContainer {
      display: flex;
      justify-content: center;
      align-items: center;
      flex-direction: row;
      gap: 0.6rem;
      margin-bottom: 1.2rem;
      .onBoarding-karmaIcon {
        height: 2.2rem;
      }
      .onBoarding-description {
        color: #d0dcd8ba;
        font-size: 1rem;
        font-family: inter;
      }
    }
  }
}
</style>
<script lang="ts" setup>
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { tokensOption } from "src/components/models";

const { t } = useI18n();

const options = computed(
  () =>
    Array.from({ length: 4 }, () => ({
      img: "/icons/KarmaIcon.png",
      text: t("onboarding.tokens.page2Option")
    })) as tokensOption[]
);
</script>
