<template>
  <ExplainerComponent
    :title="$t('onboarding.help.slide3Title')"
    :text="$t('onboarding.help.slide3Text')"
    image="/images/Auth/handsGive-image.svg"
  />
</template>
<script setup>
import ExplainerComponent from "src/components/partials/ExplainerComponent.vue";
</script>
