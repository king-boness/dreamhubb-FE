<template>
  <div class="settingsAbout-page">
    <div class="settingsAbout-header">
      <span class="settingsAbout-heading">{{ t("aboutApp") }}</span>
    </div>
    <div class="settingsAbout-content">
      <p class="aboutAppText">{{ t("aboutAppText") }}</p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>
<style scoped lang="scss">
.settingsAbout-page {
  padding: 0 1.2rem;
  .settingsAbout-header {
    display: flex;
    width: 24rem;
    max-width: 100%;
    justify-content: start;
    align-items: start;
    margin: 1.5rem 0;
    flex-direction: column;

    .settingsAbout-heading {
      font-size: 1.4rem;
      font-family: poppinsSemiBold;

      color: white;
    }
  }

  .settingsAbout-content {
    .aboutAppText {
      font-family: inter;
      color: #d0dcd8;
      white-space: pre-line;
      line-height: 1.6;
      font-size: 0.95rem;
    }
  }
}
</style>
<style lang="scss">
/* `p.aboutAppText` is not covered by global `.body--light span, h1, …` */
.body--light .settingsAbout-page .settingsAbout-heading {
  color: #1a1a1a !important;
}

.body--light .settingsAbout-page .aboutAppText {
  color: rgba(0, 0, 0, 0.78) !important;
}
</style>
