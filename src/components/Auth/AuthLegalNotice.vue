<template>
  <p class="authLegalNotice">
    <i18n-t keypath="legalNotice" scope="global" tag="span">
      <template #terms>
        <router-link class="authLegalNotice-link" :to="{ name: 'terms-of-use' }">{{ t("termsOfUseLink") }}</router-link>
      </template>
      <template #privacy>
        <router-link class="authLegalNotice-link" :to="{ name: 'privacy-policy' }">{{ t("privacyPolicyLink") }}</router-link>
      </template>
      <template #zeroTolerance>
        <strong>{{ t("zeroTolerance") }}</strong>
      </template>
    </i18n-t>
  </p>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";

const { t } = useI18n();
</script>

<style scoped lang="scss">
.authLegalNotice {
  margin: 1rem 0 0;
  font-size: 0.8rem;
  line-height: 1.45;
  color: rgba(255, 255, 255, 0.72);
  text-align: center;
  max-width: 22rem;
}

.authLegalNotice-link {
  color: #ff4db8;
  text-decoration: underline;
}
</style>
