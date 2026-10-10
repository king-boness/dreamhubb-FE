<template>
  <ExplainerComponent
    :title="$t('onboarding.help.slide1Title')"
    :text="$t('onboarding.help.slide1Text')"
    image="/images/Auth/handShow-image.svg"
  />
</template>
<script setup>
import ExplainerComponent from "src/components/partials/ExplainerComponent.vue";
</script>
