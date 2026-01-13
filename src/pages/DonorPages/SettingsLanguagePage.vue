<template>
  <div class="settingsLang-page">
    <div class="settingsLang-header">
      <span class="settingsLang-title">{{ t("changeLanguage") }}</span>
    </div>
    <div class="settingsLang-selection">
      <template v-for="(lang, i) in languages" :key="i">
        <q-separator
          v-if="lang.isDivider"
          dark
          class="lang-divider"
        />
        <div
          v-else
          class="lang-englishUK langCategory"
          @click="selectLanguage(lang)"
        >
          <div class="lang-preview">
            <img class="langIcon" :src="lang.flagIcon" alt="" />
            <span class="langName">{{ lang.name }}</span>
          </div>
          <q-radio
            v-model="selectedLanguageCode"
            :val="String(lang.code)"
            :dark="!isBodyLight"
            size="lg"
            class="lang-radio"
          />
        </div>
      </template>
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
import { ref, computed, onMounted, onBeforeUnmount, nextTick, watch } from "vue";
import { useQuasar, Notify } from "quasar";
import { useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { APP_LANGUAGES } from "src/config/languages";

const $q = useQuasar();
const router = useRouter();
const { locale, t } = useI18n();

const LANGUAGE_STORAGE_KEY = "dreamhubb_language";

interface Language {
  code: string;
  name: string;
  flagIcon: string;
  isDivider?: boolean;
}

// Pending selection - only applied on Save
const pendingLanguageCode = ref<string>("en-US");
// Display selection for radio button
const selectedLanguageCode = ref<string>("en-US");

// Preview locale for translation of language names
// Always uses current app locale - UI language changes only after Save button is clicked
const previewLocale = computed(() => {
  // Always use current app locale (locale.value), not pending selection
  // This ensures language names are displayed according to current UI language
  // The actual locale.value (and thus UI language) changes only in saveLanguage() after clicking Save button
  return locale.value || "en-US";
});

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
  // Use nextTick to ensure languages computed property is ready
  nextTick(() => {
    const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
    if (savedLanguage) {
      // Ensure values are strings for proper comparison
      const langCode = String(savedLanguage);
      pendingLanguageCode.value = langCode;
      selectedLanguageCode.value = langCode;
    } else {
      // Fallback to current i18n locale
      const currentLang = String(locale.value || "en-US");
      pendingLanguageCode.value = currentLang;
      selectedLanguageCode.value = currentLang;
    }
  });
});

onBeforeUnmount(() => {
  if (observer) {
    observer.disconnect();
  }
});

const selectLanguage = (lang: Language) => {
  // Only update selection, do NOT change locale
  selectedLanguageCode.value = lang.code;
  pendingLanguageCode.value = lang.code;
};

// Removed onLanguageChange - no immediate locale switching

const saveLanguage = () => {
  if (pendingLanguageCode.value) {
    // Map language codes to i18n locale codes
    // If locale exists, use it; otherwise fallback to en-US
    const localeMap: Record<string, string> = {
      sk: "sk",
      "en-US": "en-US",
      "en-GB": "en-US", // Use en-US as fallback for en-GB
      es: "es",
      cs: "cs",
      da: "da",
      zh: "zh",
      ar: "ar",
      hi: "hi",
      ru: "ru",
      ro: "ro",
      uk: "uk",
      de: "de",
      fr: "fr",
      it: "it",
      pl: "pl",
      hu: "hu",
      ja: "ja",
      ko: "ko",
      sq: "sq",
      hy: "hy",
      az: "az",
      bn: "bn",
      bg: "bg",
      hr: "hr",
      et: "et",
      fi: "fi",
      ka: "ka",
      el: "el",
      he: "he",
      id: "id",
      kk: "kk",
      lo: "lo",
      lv: "lv",
      lt: "lt",
      mk: "mk",
      ne: "ne",
      no: "no",
      fa: "fa",
      pt: "pt",
      sr: "sr",
      sv: "sv",
      th: "th",
      tr: "tr",
      ur: "ur",
      nl: "nl",
      // New languages - now using their own i18n files
      "pa-PK": "pa-PK",
      "mr-IN": "mr-IN",
      "te-IN": "te-IN",
      "ta-IN": "ta-IN",
      "vi-VN": "vi-VN",
      "fil-PH": "fil-PH",
      "sw-TZ": "sw-TZ",
      "ha-NE": "ha-NE",
      "yue-HK": "yue-HK",
      "wuu-CN": "wuu-CN",
      "jv-ID": "jv-ID",
      "gu-IN": "gu-IN",
      "kn-IN": "kn-IN"
    };

    const i18nLocale = localeMap[pendingLanguageCode.value] || pendingLanguageCode.value;

    // Save to localStorage
    localStorage.setItem(LANGUAGE_STORAGE_KEY, pendingLanguageCode.value);
    // Update i18n locale - THIS is when the UI actually changes
    locale.value = i18nLocale;

    // Wait for Vue to update the UI (including CTA button text)
    nextTick(() => {
      Notify.create({
        type: "positive",
        message: t("languageSaved"),
        position: "top",
        timeout: 2000
      });

      // Navigate back after a short delay to allow user to see the updated CTA text
      setTimeout(() => {
        handleBack();
      }, 1000);
    });
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

// Helper function to get flag icon for language code
const getFlagIcon = (code: string): string => {
  const flagMap: Record<string, string> = {
    "en-US": "/icons/Flags/united states.svg",
    "en-GB": "/icons/Flags/united kingdom.svg",
    sk: "/icons/Flags/slovakia.svg",
    cs: "/icons/Flags/czech republic.svg",
    de: "/icons/Flags/germany.svg",
    fr: "/icons/Flags/france.svg",
    es: "/icons/Flags/spain.svg",
    it: "/icons/Flags/italy.svg",
    pl: "/icons/Flags/poland.svg",
    hu: "/icons/Flags/hungary.svg",
    ro: "/icons/Flags/romania.svg",
    ru: "/icons/Flags/russia.svg",
    uk: "/icons/Flags/ukraine.svg",
    zh: "/icons/Flags/china.svg",
    hi: "/icons/Flags/india.svg",
    ar: "/icons/Flags/arab league.svg",
    ja: "/icons/Flags/japan.svg",
    ko: "/icons/Flags/south korea.svg",
    sq: "/icons/Flags/albania.svg",
    hy: "/icons/Flags/armenia.svg",
    az: "/icons/Flags/azerbaijan.svg",
    bn: "/icons/Flags/bangladesh.svg",
    bg: "/icons/Flags/bulgaria.svg",
    hr: "/icons/Flags/croatia.svg",
    da: "/icons/Flags/denmark.svg",
    et: "/icons/Flags/estonia.svg",
    fi: "/icons/Flags/finland.svg",
    ka: "/icons/Flags/georgia.svg",
    el: "/icons/Flags/greece.svg",
    he: "/icons/Flags/israel.svg",
    id: "/icons/Flags/indonesia.svg",
    kk: "/icons/Flags/kazakhstan.svg",
    lo: "/icons/Flags/laos.svg",
    lv: "/icons/Flags/latvia.svg",
    lt: "/icons/Flags/lithuania.svg",
    mk: "/icons/Flags/republic of macedonia.svg",
    ne: "/icons/Flags/nepal.svg",
    no: "/icons/Flags/norway.svg",
    fa: "/icons/Flags/iran.svg",
    pt: "/icons/Flags/portugal.svg",
    sr: "/icons/Flags/serbia.svg",
    sv: "/icons/Flags/sweden.svg",
    th: "/icons/Flags/thailand.svg",
    tr: "/icons/Flags/turkey.svg",
    ur: "/icons/Flags/pakistan.svg",
    nl: "/icons/Flags/netherlands.svg",
    // New languages
    "pa-PK": "/icons/Flags/pakistan.svg", // TODO: Consider separate flag if needed
    "mr-IN": "/icons/Flags/india.svg",
    "te-IN": "/icons/Flags/india.svg",
    "ta-IN": "/icons/Flags/india.svg",
    "vi-VN": "/icons/Flags/vietnam.svg",
    "fil-PH": "/icons/Flags/philippines.svg",
    "sw-TZ": "/icons/Flags/tanzania.svg",
    "ha-NE": "/icons/Flags/niger.svg",
    "yue-HK": "/icons/Flags/china.svg", // TODO: Add hongkong.svg when available, fallback to china.svg for now
    "wuu-CN": "/icons/Flags/china.svg",
    "jv-ID": "/icons/Flags/indonesia.svg",
    "gu-IN": "/icons/Flags/india.svg",
    "kn-IN": "/icons/Flags/india.svg"
  };
  return flagMap[code] || "";
};

// Computed property to generate language options from APP_LANGUAGES
// Uses previewLocale to translate language names according to selected language
const languages = computed(() => {
  const currentPreviewLocale = previewLocale.value;

  // Map APP_LANGUAGES to Language objects with localized names
  // Translate using previewLocale (selected language) instead of current app locale
  const allLanguages: Language[] = APP_LANGUAGES.map((lang) => {
    // Try to get translation from previewLocale
    let translatedName = t(`languages.${lang.code}.name`, {}, {
      locale: currentPreviewLocale,
      fallbackWarn: false,
      missingWarn: false
    });

    // If translation not found in previewLocale, fallback to en-US
    if (!translatedName || translatedName === `languages.${lang.code}.name`) {
      translatedName = t(`languages.${lang.code}.name`, {}, {
        locale: "en-US",
        fallbackWarn: false,
        missingWarn: false
      }) || lang.code;
    }

    return {
      code: lang.code,
      name: translatedName,
      flagIcon: getFlagIcon(lang.code)
    };
  });

  // Separate top languages and remaining languages
  const topLanguages: Language[] = [];
  const remainingLanguages: Language[] = [];

  for (const lang of allLanguages) {
    const appLang = APP_LANGUAGES.find((l) => l.code === lang.code);
    if (appLang?.isTop) {
      topLanguages.push(lang);
    } else {
      remainingLanguages.push(lang);
    }
  }

  // Sort top languages by their order in APP_LANGUAGES
  topLanguages.sort((a, b) => {
    const indexA = APP_LANGUAGES.findIndex((l) => l.code === a.code && l.isTop);
    const indexB = APP_LANGUAGES.findIndex((l) => l.code === b.code && l.isTop);
    return indexA - indexB;
  });

  // Sort remaining languages alphabetically by localized name (using previewLocale for sorting)
  remainingLanguages.sort((a, b) => {
    return a.name.localeCompare(b.name, currentPreviewLocale, { sensitivity: "base" });
  });

  // Combine: top languages + divider + remaining languages
  const result: Language[] = [...topLanguages];

  // Add divider only if we have both top and remaining languages
  if (topLanguages.length > 0 && remainingLanguages.length > 0) {
    result.push({
      code: "divider",
      name: "divider",
      flagIcon: "",
      isDivider: true
    });
  }

  result.push(...remainingLanguages);

  return result;
});

// Watch for changes in languages computed property to ensure selectedLanguageCode is valid
// This ensures that when languages are loaded, the selected language is properly set
// Must be defined AFTER languages computed property
watch(
  () => languages.value,
  (newLanguages) => {
    if (newLanguages.length === 0) return;

    // If selectedLanguageCode is not in the list of available languages, reset it
    const currentCode = String(selectedLanguageCode.value);
    const isValid = newLanguages.some((lang) => String(lang.code) === currentCode);

    if (!isValid) {
      // Try to use saved language first
      const savedLanguage = localStorage.getItem(LANGUAGE_STORAGE_KEY);
      if (savedLanguage) {
        const savedCode = String(savedLanguage);
        const savedIsValid = newLanguages.some((lang) => String(lang.code) === savedCode);
        if (savedIsValid) {
          selectedLanguageCode.value = savedCode;
          return;
        }
      }
      // Fallback to first available language
      selectedLanguageCode.value = String(newLanguages[0].code);
    }
  },
  { immediate: false }
);
</script>
<style scoped lang="scss">
.settingsLang-page {
  padding: 0 1.2rem;
  padding-bottom: 3rem;

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
      min-height: 3rem;
      height: 3rem;

      &:hover {
        background-color: rgba(255, 255, 255, 0.05);
        border-radius: 0.5rem;
      }
    }

    .lang-divider {
      margin: 0.5rem 0;
      background-color: rgba(255, 255, 255, 0.2);
    }

    .langCategory {
      .lang-preview {
        display: flex;
        align-items: center;
        flex: 1;
        min-width: 0;
        overflow: hidden;

        .langIcon {
          height: 1.7rem;
          width: 1.7rem;
          margin-right: 1rem;
          flex-shrink: 0;
        }

        .langName {
          color: white;
          font-family: poppins;
          font-size: 1.1rem;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
          flex: 1;
          min-width: 0;
        }
      }

      .lang-radio {
        flex-shrink: 0;
        margin-left: 1rem;
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
  margin-bottom: 2rem;

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
