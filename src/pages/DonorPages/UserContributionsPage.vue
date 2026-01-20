<template>
  <q-page class="userPlaceholderPage">
    <div class="userPlaceholderPage-inner">
      <h2 class="userPlaceholderPage-title">{{ t("contributions") }}</h2>
      <p class="userPlaceholderPage-text">{{ t("comingSoon") }}</p>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<style scoped lang="scss">
.userPlaceholderPage {
  min-height: 100vh;
  padding: 24px 16px;
  color: #fff;
}

.userPlaceholderPage-inner {
  max-width: 420px;
  margin: 0 auto;
  text-align: center;
  padding-top: 36px;
}

.userPlaceholderPage-title {
  margin: 0 0 8px 0;
  font-family: poppinsSemiBold;
  font-size: 1.5rem;
}

.userPlaceholderPage-text {
  margin: 0;
  color: rgba(255, 255, 255, 0.75);
  font-family: poppins;
}
</style>
