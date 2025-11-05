<template>
  <div class="settingsSupport-page">
    <div class="settingsSupport-header">
      <span class="settingsSupport-heading">Health & Support</span>
    </div>
    <div class="settingsSupport-questions">
      <span class="questionsText"
        >Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda nam
        natus id unde vero doloremque officia iure molestiae accusamus
        quibusdam.</span
      >
    </div>
  </div>
</template>
<script setup lang="ts"></script>
<style scoped lang="scss">
.settingsSupport-page {
  padding: 0 1.2rem;

  .settingsSupport-header {
    display: flex;
    width: 24rem;
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
    .questionsText {
      font-family: inter;
      color: #d0dcd8;
    }
  }
}
</style>
