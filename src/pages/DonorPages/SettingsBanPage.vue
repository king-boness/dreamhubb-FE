<template>
  <div class="settingsBan-page">
    <div class="settingsBan-header">
      <span class="settingsBan-heading">Ban System</span>
    </div>
    <div class="settingsBan-rules">
      <span class="rulesText"
        >Lorem ipsum dolor sit amet consectetur adipisicing elit. Assumenda nam
        natus id unde vero doloremque officia iure molestiae accusamus
        quibusdam.</span
      >
    </div>
  </div>
</template>
<script setup lang="ts"></script>
<style scoped lang="scss">
.settingsBan-page {
  padding: 0 1.2rem;
  .settingsBan-header {
    display: flex;
    width: 24rem;
    justify-content: start;
    align-items: start;
    margin: 1.5rem 0;
    flex-direction: column;

    .settingsBan-heading {
      font-size: 1.4rem;
      font-family: poppinsSemiBold;
      color: white;
    }
  }

  .settingsBan-rules {
    .rulesText {
      font-family: inter;
      color: #d0dcd8;
    }
  }
}
</style>
