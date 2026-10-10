<template>
  <LegalPageShell>
    <h1>{{ t("legal.support.title") }}</h1>
    <p class="legal-page__updated">{{ t("legal.support.subtitle") }}</p>

    <section>
      <h2>{{ t("legal.support.contactTitle") }}</h2>
      <p>
        {{ t("legal.support.contactIntro") }}
        <a href="mailto:matej.kostun@gmail.com">matej.kostun@gmail.com</a>
      </p>
      <p>{{ t("legal.support.contactSla") }}</p>
    </section>

    <section>
      <h2>{{ t("legal.support.reportTitle") }}</h2>
      <p>{{ t("legal.support.reportBody") }}</p>
    </section>

    <section>
      <h2>{{ t("legal.support.blockTitle") }}</h2>
      <p>{{ t("legal.support.blockBody") }}</p>
      <p>{{ t("legal.support.blockManage") }}</p>
    </section>

    <section>
      <h2>{{ t("legal.support.policiesTitle") }}</h2>
      <p>
        <router-link :to="{ name: 'terms-of-use' }">{{ t("legal.support.termsLink") }}</router-link>
        ·
        <router-link :to="{ name: 'privacy-policy' }">{{ t("legal.support.privacyLink") }}</router-link>
      </p>
    </section>
  </LegalPageShell>
</template>

<script setup lang="ts">
import { useI18n } from "vue-i18n";
import LegalPageShell from "src/components/Public/LegalPageShell.vue";

const { t } = useI18n();
</script>
