<template>
  <ExplainerComponent
    :title="$t('onboarding.help.slide2Title')"
    :text="$t('onboarding.help.slide2Text')"
    image="/images/Auth/handsExchange-image.svg"
  />
</template>
<script setup>
import ExplainerComponent from "src/components/partials/ExplainerComponent.vue";
</script>
