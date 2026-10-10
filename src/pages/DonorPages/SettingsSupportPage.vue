<template>
  <div class="settingsSupport-page">
    <div class="settingsSupport-header">
      <span class="settingsSupport-heading">{{ t("helpAndSupport") }}</span>
    </div>
    <div class="settingsSupport-questions">
      <p class="questionsText">
        {{ t("settingsPages.support.intro") }}
      </p>
      <p class="questionsText">
        {{ t("settingsPages.support.emailLabel") }}
        <a class="settingsSupport-link" :href="`mailto:${SUPPORT_EMAIL}`">{{ SUPPORT_EMAIL }}</a>
      </p>
      <p class="questionsText">
        <i18n-t keypath="settingsPages.support.reviewPolicies" scope="global" tag="span">
          <template #privacy>
            <a class="settingsSupport-link" href="#" @click.prevent="openPrivacy">{{ t("settingsPages.support.privacyLink") }}</a>
          </template>
          <template #terms>
            <a class="settingsSupport-link" href="#" @click.prevent="openTerms">{{ t("settingsPages.support.termsLink") }}</a>
          </template>
        </i18n-t>
      </p>
      <p class="questionsText">
        <i18n-t keypath="settingsPages.support.reportHint" scope="global" tag="span">
          <template #report>
            <strong>{{ t("reportPost") }}</strong>
          </template>
        </i18n-t>
      </p>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const router = useRouter();
const { t } = useI18n();
const SUPPORT_EMAIL = "matej.kostun@gmail.com";

const openPrivacy = () => {
  void router.push({ name: "privacy-policy" });
};

const openTerms = () => {
  void router.push({ name: "terms-of-use" });
};
</script>
<style scoped lang="scss">
.settingsSupport-page {
  padding: 0 1.2rem;
  padding-bottom: calc(2rem + env(safe-area-inset-bottom, 0px));

  .settingsSupport-header {
    display: flex;
    width: 100%;
    max-width: 36rem;
    justify-content: start;
    align-items: start;
    margin: 1.5rem 0;
    flex-direction: column;

    .settingsSupport-heading {
      font-size: 1.4rem;
      font-family: poppinsSemiBold;
      color: white;
    }
  }

  .settingsSupport-questions {
    max-width: 36rem;

    .questionsText {
      font-family: inter;
      color: #d0dcd8;
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .settingsSupport-link {
      color: #ff4db8;
      text-decoration: underline;
    }
  }
}
</style>
