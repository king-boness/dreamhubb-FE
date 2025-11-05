<template>
  <div class="settingsAbout-page">
    <div class="settingsAbout-header">
      <span class="settingsAbout-heading">Terms and Conditions</span>
    </div>
    <div class="settingsAbout-conditions">
      <span class="conditionsText"
        >Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda nam
        natus id unde vero doloremque officia iure molestiae accusamus
        quibusdam.</span
      >
    </div>
  </div>
</template>
<script setup lang="ts"></script>
<style scoped lang="scss">
.settingsAbout-page {
  padding: 0 1.2rem;
  .settingsAbout-header {
    display: flex;
    width: 24rem;
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

  .settingsAbout-conditions {
    .conditionsText {
      font-family: inter;
      color: #d0dcd8;
    }
  }
}
</style>
