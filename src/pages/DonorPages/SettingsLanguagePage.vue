<template>
  <div class="settingsLang-page">
    <div class="settingsLang-header">
      <span class="settingsLang-title">{{ t("changeLanguage") }}</span>
    </div>
    <div class="settingsLang-selection">
      <div
        class="lang-englishUK langCategory"
        v-for="(lang, i) in languages"
        :key="i"
        @click="selectLanguage(lang)"
      >
        <div class="lang-preview">
          <img class="langIcon" :src="lang.flagIcon" alt="" />
          <span class="langName">{{ lang.name }}</span>
        </div>
        <q-radio
          v-model="selectedLanguageCode"
          :val="lang.code"
          :dark="!isBodyLight"
          size="lg"
          @update:model-value="onLanguageChange"
        />
      </div>
      <div class="confirmationButton-div">
        <q-btn class="confirmButton" @click="saveLanguage">
          {{ t("saveChanges") }}
        </q-btn>
      </div>
    </div>
    <div class="pageFooter-div">
      <q-btn class="cancelButton" @click="handleBack"> {{ t("cancel") }} </q-btn>
    </div>
  </div>
</template>
<script setup lang="ts">
import { ref, onMounted, onBeforeUnmount } from "vue";
import { useQuasar, Notify } from "quasar";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const $q = useQuasar();
const router = useRouter();
const { locale, t } = useI18n();

const LANGUAGE_STORAGE_KEY = "dreamhubb_language";

interface Language {
  code: string;
  name: string;
  flagIcon: string;
}

const selectedLanguageCode = ref<string>("en-US");

// Check if light mode is enabled
const isBodyLight = ref(false);
const checkBodyClass = () => {
  isBodyLight.value = !$q.dark.isActive || document.body.classList.contains("body--light");
};

let observer: MutationObserver | null = null;

onMounted(() => {
  checkBodyClass();
  // Watch for class changes on body element
  observer = new MutationObserver(() => {
    checkBodyClass();
  });
  observer.observe(document.body, {
    attributes: true,
    attributeFilter: ["class"]
  });

  // Load saved language from localStorage
  const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
  if (savedLanguage) {
    selectedLanguageCode.value = savedLanguage;
  } else {
    // Fallback to current i18n locale
    selectedLanguageCode.value = locale.value || "en-US";
  }
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
  }
});

const selectLanguage = (lang: Language) => {
  selectedLanguageCode.value = lang.code;
  onLanguageChange();
};

const onLanguageChange = () => {
  // Update i18n locale immediately for UI feedback
  if (selectedLanguageCode.value) {
    // Map language codes to i18n locale codes
    const localeMap: Record<string, string> = {
      sk: "sk",
      "en-US": "en-US",
      "en-GB": "en-US" // Use en-US as fallback for en-GB
    };
    const i18nLocale = localeMap[selectedLanguageCode.value] || selectedLanguageCode.value;
    locale.value = i18nLocale;
  }
};

const saveLanguage = () => {
  if (selectedLanguageCode.value) {
    // Map language codes to i18n locale codes
    const localeMap: Record<string, string> = {
      sk: "sk",
      "en-US": "en-US",
      "en-GB": "en-US" // Use en-US as fallback for en-GB
    };

    const i18nLocale = localeMap[selectedLanguageCode.value] || selectedLanguageCode.value;

    // Save to localStorage
    localStorage.setItem(LANGUAGE_STORAGE_KEY, selectedLanguageCode.value);
    // Update i18n locale
    locale.value = i18nLocale;

    Notify.create({
      type: "positive",
      message: t("languageSaved"),
      position: "top",
      timeout: 2000
    });

    // Navigate back after a short delay
    setTimeout(() => {
      handleBack();
    }, 500);
  }
};

const handleBack = () => {
  if (window.history.length > 1) {
    router.back();
  } else {
    // Fallback navigation
    const routeName = router.currentRoute.value.name?.toString() || "";
    if (routeName.startsWith("donee")) {
      router.push({ name: "donee-settings" });
    } else {
      router.push({ name: "donor-settings" });
    }
  }
};

const languages: Language[] = [
  {
    code: "sq",
    name: "Albanian",
    flagIcon: "/icons/Flags/albania.svg"
  },
  {
    code: "ar",
    name: "Arabic",
    flagIcon: "/icons/Flags/arab league.svg"
  },
  {
    code: "hy",
    name: "Armenian",
    flagIcon: "/icons/Flags/armenia.svg"
  },
  {
    code: "az",
    name: "Azerbaijani",
    flagIcon: "/icons/Flags/azerbaijan.svg"
  },
  {
    code: "bn",
    name: "Bengali",
    flagIcon: "/icons/Flags/bangladesh.svg"
  },
  {
    code: "bg",
    name: "Bulgarian",
    flagIcon: "/icons/Flags/bulgaria.svg"
  },
  {
    code: "zh",
    name: "Chinese",
    flagIcon: "/icons/Flags/china.svg"
  },
  {
    code: "hr",
    name: "Croatian",
    flagIcon: "/icons/Flags/croatia.svg"
  },
  {
    code: "cs",
    name: "Czech",
    flagIcon: "/icons/Flags/czech republic.svg"
  },
  {
    code: "da",
    name: "Danish",
    flagIcon: "/icons/Flags/denmark.svg"
  },
  {
    code: "nl",
    name: "Dutch",
    flagIcon: "/icons/Flags/netherlands.svg"
  },
  {
    code: "et",
    name: "Estonian",
    flagIcon: "/icons/Flags/estonia.svg"
  },
  {
    code: "en-GB",
    name: "English (UK)",
    flagIcon: "/icons/Flags/united kingdom.svg"
  },
  {
    code: "en-US",
    name: "English (US)",
    flagIcon: "/icons/Flags/united states.svg"
  },
  {
    code: "fi",
    name: "Finnish",
    flagIcon: "/icons/Flags/finland.svg"
  },
  {
    code: "fr",
    name: "French",
    flagIcon: "/icons/Flags/france.svg"
  },
  {
    code: "ka",
    name: "Georgian",
    flagIcon: "/icons/Flags/georgia.svg"
  },
  {
    code: "de",
    name: "German",
    flagIcon: "/icons/Flags/germany.svg"
  },
  {
    code: "el",
    name: "Greek",
    flagIcon: "/icons/Flags/greece.svg"
  },
  {
    code: "he",
    name: "Hebrew",
    flagIcon: "/icons/Flags/israel.svg"
  },
  {
    code: "hu",
    name: "Hungarian",
    flagIcon: "/icons/Flags/hungary.svg"
  },
  {
    code: "hi",
    name: "Hindi",
    flagIcon: "/icons/Flags/india.svg"
  },
  {
    code: "id",
    name: "Indonesian",
    flagIcon: "/icons/Flags/indonesia.svg"
  },
  {
    code: "it",
    name: "Italian",
    flagIcon: "/icons/Flags/italy.svg"
  },
  {
    code: "ja",
    name: "Japanese",
    flagIcon: "/icons/Flags/japan.svg"
  },
  {
    code: "kk",
    name: "Kazakh",
    flagIcon: "/icons/Flags/kazakhstan.svg"
  },
  {
    code: "ko",
    name: "Korean",
    flagIcon: "/icons/Flags/south korea.svg"
  },
  {
    code: "lo",
    name: "Lao",
    flagIcon: "/icons/Flags/laos.svg"
  },
  {
    code: "lv",
    name: "Latvian",
    flagIcon: "/icons/Flags/latvia.svg"
  },
  {
    code: "lt",
    name: "Lithuanian",
    flagIcon: "/icons/Flags/lithuania.svg"
  },
  {
    code: "mk",
    name: "Macedonian",
    flagIcon: "/icons/Flags/republic of macedonia.svg"
  },
  {
    code: "ne",
    name: "Nepali",
    flagIcon: "/icons/Flags/nepal.svg"
  },
  {
    code: "no",
    name: "Norwegian",
    flagIcon: "/icons/Flags/norway.svg"
  },
  {
    code: "fa",
    name: "Persian",
    flagIcon: "/icons/Flags/iran.svg"
  },
  {
    code: "pl",
    name: "Polish",
    flagIcon: "/icons/Flags/poland.svg"
  },
  {
    code: "pt",
    name: "Portuguese",
    flagIcon: "/icons/Flags/portugal.svg"
  },
  {
    code: "ro",
    name: "Romanian",
    flagIcon: "/icons/Flags/romania.svg"
  },
  {
    code: "ru",
    name: "Russian",
    flagIcon: "/icons/Flags/russia.svg"
  },
  {
    code: "sr",
    name: "Serbian",
    flagIcon: "/icons/Flags/serbia.svg"
  },
  {
    code: "sk",
    name: "Slovak",
    flagIcon: "/icons/Flags/slovakia.svg"
  },
  {
    code: "es",
    name: "Spanish",
    flagIcon: "/icons/Flags/spain.svg"
  },
  {
    code: "sv",
    name: "Swedish",
    flagIcon: "/icons/Flags/sweden.svg"
  },
  {
    code: "th",
    name: "Thai",
    flagIcon: "/icons/Flags/thailand.svg"
  },
  {
    code: "tr",
    name: "Turkish",
    flagIcon: "/icons/Flags/turkey.svg"
  },
  {
    code: "uk",
    name: "Ukrainian",
    flagIcon: "/icons/Flags/ukraine.svg"
  },
  {
    code: "ur",
    name: "Urdu",
    flagIcon: "/icons/Flags/pakistan.svg"
  }
];
</script>
<style scoped lang="scss">
.settingsLang-page {
  padding: 0 1.2rem;

  .settingsLang-header {
    display: flex;
    width: 100%;
    justify-content: flex-start;
    align-items: center;
    margin: 1.5rem 0;
    padding: 0;

    .settingsLang-title {
      font-size: 1.4rem;
      font-family: poppinsSemiBold;
      color: white;
      text-align: left;
      width: 100%;
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
      cursor: pointer;
      transition: background-color 0.2s ease;

      &:hover {
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 0.5rem;
      }

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
