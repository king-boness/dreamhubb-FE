<template>
  <div class="settingsLang-page">
    <div class="settingsLang-header">
      <span class="settingsLang-title">Change Language</span>
    </div>
    <div class="settingsLang-selection">
      <div
        class="lang-englishUK langCategory"
        v-for="(lang, i) in languages"
        :key="i"
      >
        <div class="lang-preview">
          <img class="langIcon" :src="lang.icon" alt="" />
          <span class="langName">{{ lang.title }}</span>
        </div>
        <q-radio v-model="shape" :val="lang.title" dark size="lg" />
      </div>
      <div class="confirmationButton-div">
        <q-btn class="confirmButton" @click="$router.go(-1)">
          Save changes
        </q-btn>
      </div>
    </div>
    <div class="pageFooter-div">
      <q-btn class="cancelButton" @click="$router.go(-1)"> Cancel </q-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref } from "vue";
const shape = ref("English (UK)");

const languages = [
  {
    icon: "/icons/languageIconUK.png",
    title: "English (UK)"
  },
  {
    icon: "/icons/languageIconUS.png",
    title: "English (US)"
  },
  {
    icon: "/icons/languageIconSK.png",
    title: "Slovak"
  },
  {
    icon: "/icons/spain.png",
    title: "Spanish"
  },
  {
    icon: "/icons/italy.png",
    title: "Italian"
  },
  {
    icon: "/icons/germany.png",
    title: "German"
  },
  {
    icon: "/icons/russia-2.png",
    title: "Russian"
  },
  {
    icon: "/icons/china.png",
    title: "Chinese"
  },
  {
    icon: "/icons/india.png",
    title: "Hindi"
  },
  {
    icon: "/icons/france.png",
    title: "French"
  },
  {
    icon: "/icons/czech-republic.png",
    title: "Czech"
  },
  {
    icon: "/icons/sweden.png",
    title: "Swedish"
  },
  {
    icon: "/icons/denmark.png",
    title: "Danish"
  },
  {
    icon: "/icons/norway.png",
    title: "Norwegian"
  },
  {
    icon: "/icons/finland.png",
    title: "Finnish"
  },
  {
    icon: "/icons/ukraine.png",
    title: "Ukrainian"
  },
  {
    icon: "/icons/japan-flag.png",
    title: "Japanese"
  }
];
</script>
<style scoped lang="scss">
.settingsLang-page {
  padding: 0 1.2rem;

  .settingsLang-header {
    display: flex;
    width: 24rem;
    justify-content: start;
    align-items: start;
    margin: 1.5rem 0;
    flex-direction: column;

    .settingsLang-title {
      font-size: 1.4rem;
      font-family: poppinsSemiBold;

      color: white;
    }
  }

  .settingsLang-selection {
    display: flex;
    flex-direction: column;

    .langCategory {
      padding: 0.5rem 0;
      display: flex;
      align-items: center;
      justify-content: space-between;

      .lang-preview {
        display: flex;
        align-items: center;

        .langIcon {
          height: 1.7rem;
          margin-right: 1rem;
        }

        .langName {
          color: white;
          font-family: poppins;
          font-size: 1.1rem;
        }
      }
    }

    .confirmationButton-div {
      display: flex;
      align-items: center;
      justify-content: center;
      margin-top: 1.8rem;

      .confirmButton {
        background-color: rgba(182, 0, 67, 1);
        color: white;
        border: none;
        font-size: 1.2rem;
        height: 3.3rem;
        border-radius: 0.5rem;
        width: 100%;

        font-family: montseraatSemiBold;
      }
    }
  }
}

.pageFooter-div {
  display: flex;
  align-items: center;
  justify-content: center;
  margin-top: 2rem;

  .cancelButton {
    background-color: rgba(221, 31, 97, 0.2) !important;
    color: rgb(218, 3, 82) !important;
    font-family: montseraatSemiBold;
    border: none;
    font-size: 1.2rem;
    height: 3.3rem;
    border-radius: 0.5rem;
    width: 100%;
  }
}
</style>
