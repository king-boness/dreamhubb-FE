<template>
  <div class="settingsBan-page">
    <div class="settingsBan-header">
      <span class="settingsBan-heading">Blocked users</span>
    </div>
    <div class="settingsBan-rules">
      <p class="rulesText">
        Blocked users will not be able to interact with your posts or send you messages. This list will show accounts you have blocked.
      </p>
      <p class="rulesText">
        To report harmful content, open a post and use <strong>Report a post</strong>. For urgent issues, contact
        <a class="settingsBan-link" href="mailto:matej.kostun@gmail.com">matej.kostun@gmail.com</a>.
      </p>
      <p class="rulesText rulesText--muted">
        Full block/unblock management is coming in a future update.
      </p>
    </div>
  </div>
</template>
<script setup lang="ts"></script>
<style scoped lang="scss">
.settingsBan-page {
  padding: 0 1.2rem;
  padding-bottom: calc(2rem + env(safe-area-inset-bottom, 0px));

  .settingsBan-header {
    display: flex;
    width: 100%;
    max-width: 36rem;
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
    max-width: 36rem;

    .rulesText {
      font-family: inter;
      color: #d0dcd8;
      line-height: 1.5;
      margin-bottom: 1rem;
    }

    .rulesText--muted {
      opacity: 0.75;
      font-size: 0.95rem;
    }

    .settingsBan-link {
      color: #ff4db8;
      text-decoration: underline;
    }
  }
}
</style>
