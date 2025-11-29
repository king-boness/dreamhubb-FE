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
    icon: "/icons/Flags/albania.svg",
    title: "Albanian"
  },
  {
    icon: "/icons/Flags/arab league.svg",
    title: "Arabic"
  },
  {
    icon: "/icons/Flags/armenia.svg",
    title: "Armenian"
  },
  {
    icon: "/icons/Flags/azerbaijan.svg",
    title: "Azerbaijani"
  },
  {
    icon: "/icons/Flags/bangladesh.svg",
    title: "Bengali"
  },
  {
    icon: "/icons/Flags/bulgaria.svg",
    title: "Bulgarian"
  },
  {
    icon: "/icons/Flags/china.svg",
    title: "Chinese"
  },
  {
    icon: "/icons/Flags/croatia.svg",
    title: "Croatian"
  },
  {
    icon: "/icons/Flags/czech republic.svg",
    title: "Czech"
  },
  {
    icon: "/icons/Flags/denmark.svg",
    title: "Danish"
  },
  {
    icon: "/icons/Flags/netherlands.svg",
    title: "Dutch"
  },
  {
    icon: "/icons/Flags/estonia.svg",
    title: "Estonian"
  },
  {
    icon: "/icons/Flags/united kingdom.svg",
    title: "English (UK)"
  },
  {
    icon: "/icons/Flags/united states.svg",
    title: "English (US)"
  },
  {
    icon: "/icons/Flags/finland.svg",
    title: "Finnish"
  },
  {
    icon: "/icons/Flags/france.svg",
    title: "French"
  },
  {
    icon: "/icons/Flags/georgia.svg",
    title: "Georgian"
  },
  {
    icon: "/icons/Flags/germany.svg",
    title: "German"
  },
  {
    icon: "/icons/Flags/greece.svg",
    title: "Greek"
  },
  {
    icon: "/icons/Flags/israel.svg",
    title: "Hebrew"
  },
  {
    icon: "/icons/Flags/hungary.svg",
    title: "Hungarian"
  },
  {
    icon: "/icons/Flags/india.svg",
    title: "Hindi"
  },
  {
    icon: "/icons/Flags/indonesia.svg",
    title: "Indonesian"
  },
  {
    icon: "/icons/Flags/italy.svg",
    title: "Italian"
  },
  {
    icon: "/icons/Flags/japan.svg",
    title: "Japanese"
  },
  {
    icon: "/icons/Flags/kazakhstan.svg",
    title: "Kazakh"
  },
  {
    icon: "/icons/Flags/south korea.svg",
    title: "Korean"
  },
  {
    icon: "/icons/Flags/laos.svg",
    title: "Lao"
  },
  {
    icon: "/icons/Flags/latvia.svg",
    title: "Latvian"
  },
  {
    icon: "/icons/Flags/lithuania.svg",
    title: "Lithuanian"
  },
  {
    icon: "/icons/Flags/republic of macedonia.svg",
    title: "Macedonian"
  },
  {
    icon: "/icons/Flags/nepal.svg",
    title: "Nepali"
  },
  {
    icon: "/icons/Flags/norway.svg",
    title: "Norwegian"
  },
  {
    icon: "/icons/Flags/iran.svg",
    title: "Persian"
  },
  {
    icon: "/icons/Flags/poland.svg",
    title: "Polish"
  },
  {
    icon: "/icons/Flags/portugal.svg",
    title: "Portuguese"
  },
  {
    icon: "/icons/Flags/romania.svg",
    title: "Romanian"
  },
  {
    icon: "/icons/Flags/russia.svg",
    title: "Russian"
  },
  {
    icon: "/icons/Flags/serbia.svg",
    title: "Serbian"
  },
  {
    icon: "/icons/Flags/slovakia.svg",
    title: "Slovak"
  },
  {
    icon: "/icons/Flags/spain.svg",
    title: "Spanish"
  },
  {
    icon: "/icons/Flags/sweden.svg",
    title: "Swedish"
  },
  {
    icon: "/icons/Flags/thailand.svg",
    title: "Thai"
  },
  {
    icon: "/icons/Flags/turkey.svg",
    title: "Turkish"
  },
  {
    icon: "/icons/Flags/ukraine.svg",
    title: "Ukrainian"
  },
  {
    icon: "/icons/Flags/pakistan.svg",
    title: "Urdu"
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
