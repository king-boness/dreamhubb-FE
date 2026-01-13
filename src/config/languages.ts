// Language configuration - single source of truth
export type AppLanguage = {
  code: string; // i18n locale, e.g. 'en-US', 'en-GB', 'sk', 'es', 'ru', ...
  isTop?: boolean; // whether it belongs to top languages (for display at top)
};

export const APP_LANGUAGES: AppLanguage[] = [
  { code: "en-US", isTop: true },
  { code: "en-GB", isTop: true }, // English (UK) - must be among TOP
  { code: "zh", isTop: true }, // Chinese
  { code: "es", isTop: true }, // Spanish
  { code: "hi", isTop: true }, // Hindi
  { code: "ar", isTop: true }, // Arabic
  // Other languages - without isTop, sorted alphabetically
  { code: "sk" },
  { code: "ru" },
  { code: "ro" },
  { code: "uk" },
  { code: "cs" },
  { code: "de" },
  { code: "fr" },
  { code: "it" },
  { code: "pl" },
  { code: "hu" },
  { code: "ja" },
  { code: "ko" },
  { code: "sq" },
  { code: "hy" },
  { code: "az" },
  { code: "bn" },
  { code: "bg" },
  { code: "hr" },
  { code: "da" },
  { code: "et" },
  { code: "fi" },
  { code: "ka" },
  { code: "el" },
  { code: "he" },
  { code: "id" },
  { code: "kk" },
  { code: "lo" },
  { code: "lv" },
  { code: "lt" },
  { code: "mk" },
  { code: "ne" },
  { code: "no" },
  { code: "fa" },
  { code: "pt" },
  { code: "sr" },
  { code: "sv" },
  { code: "th" },
  { code: "tr" },
  { code: "ur" },
  { code: "nl" },
  // New languages
  { code: "pa-PK" }, // Punjabi (Western Punjabi)
  { code: "mr-IN" }, // Marathi
  { code: "te-IN" }, // Telugu
  { code: "ta-IN" }, // Tamil
  { code: "vi-VN" }, // Vietnamese
  { code: "fil-PH" }, // Filipino (Tagalog)
  { code: "sw-TZ" }, // Swahili
  { code: "ha-NE" }, // Hausa
  { code: "yue-HK" }, // Chinese (Cantonese / Yue)
  { code: "wuu-CN" }, // Chinese (Wu / Shanghainese)
  { code: "jv-ID" }, // Javanese
  { code: "gu-IN" }, // Gujarati
  { code: "kn-IN" } // Kannada
];
