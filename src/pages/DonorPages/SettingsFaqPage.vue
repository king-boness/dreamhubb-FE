<template>
  <div class="settingsFaq-page">
    <div class="settingsFaq-header">
      <span class="settingsFaq-title">FAQ</span>
      <span class="settingsFaq-description">
        Common questions about dreamhubb, Tokens, and your account.
      </span>
    </div>
    <div class="settingsFaq-accordion">
      <q-list dark class="rounded-borders">
        <template v-for="(card, index) in cardList" :key="index">
          <q-expansion-item
            class="settingsFaq-card"
            :label="card.title"
            switch-toggle-side
            group="question"
            expand-icon="img:/icons/redPlus-icon.svg"
          >
            <q-card class="settings-cardDiv">
              <q-card-section class="settingsFaq-cardBody">
                <span class="settingsFaq-cardText">{{ card.text }}</span>
              </q-card-section>
            </q-card>
          </q-expansion-item>
        </template>
      </q-list>
    </div>
  </div>
</template>

<script setup lang="ts">
const cardList = [
  {
    title: "What is dreamhubb?",
    text: "dreamhubb is a social help platform where people can share dreams, problems, and ideas, and receive support from others."
  },
  {
    title: "What are Tokens?",
    text: "Tokens are an in-app virtual currency used to support posts inside dreamhubb. Tokens are not cash and cannot be withdrawn."
  },
  {
    title: "Can I withdraw Tokens?",
    text: "No. Tokens are only used inside dreamhubb and cannot be exchanged for money."
  },
  {
    title: "How can I report content?",
    text: 'Open a post detail and tap "Report a post". You can also contact support from Settings.'
  },
  {
    title: "How can I delete my account?",
    text: 'Go to Settings and tap "Delete account". You will be asked to confirm before deletion.'
  },
  {
    title: "How can I contact support?",
    text: "Go to Settings → Help & Support or email matej.kostun@gmail.com."
  },
  {
    title: "Are token purchases available on iOS?",
    text: "Token purchases on iOS are temporarily unavailable while Apple In-App Purchase validation is finalized."
  }
];
</script>

<style scoped lang="scss">
.settingsFaq-page {
  display: flex;
  justify-content: center;
  flex-direction: column;
  padding: 0 1.2rem;
  padding-bottom: calc(2rem + env(safe-area-inset-bottom, 0px));
  .settingsFaq-header {
    display: flex;
    flex-direction: column;
    padding: 0.5rem 0rem;
    margin-top: 1rem;

    .settingsFaq-title {
      color: white;
      margin-bottom: 0.5rem;
      font-family: poppinsSemiBold;
      font-size: 1.4rem;
    }

    .settingsFaq-description {
      color: rgba(255, 255, 255, 0.534);
      font-size: 1rem;
    }
  }

  .settingsFaq-accordion {
    .settingsFaq-card {
      border: 0.1rem solid rgba(255, 255, 255, 0.155);
      border-radius: 1rem;
      margin: 1rem 0;
      font-family: poppins;
      font-size: 1rem;

      .settings-cardDiv {
        background-color: transparent;
        padding: 0.5rem;
        font-size: 0.9rem;
        display: flex;
        .settingsFaq-cardBody {
          display: flex;
          justify-content: center;
          align-items: center;
        }
      }
    }
  }
}
</style>
