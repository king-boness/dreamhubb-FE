<template>
  <div class="appSettings-page">
  <div class="appSettings">
    <div class="acccoutSettings-div accontSettings-container">
      <span class="appSettings-title">{{ t("accountSettings") }}</span>
      <div
        class="appSettings-content"
        v-for="(accountSetting, i) in accountSettings"
        :key="i"
        @click="routeCheck(accountSetting.destination)"
      >
        <div class="appSetting-description">
          <img :src="accountSetting.img" alt="" class="appSettings-img" />
          <span class="appSettings-name">{{ accountSetting.title }}</span>
        </div>
        <q-btn class="arrowBtn"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <g opacity="0.6">
              <path
                d="M8.47503 15.8332C8.59952 15.8337 8.72253 15.8062 8.83501 15.7528C8.9475 15.6995 9.04659 15.6216 9.12503 15.5249L13.15 10.5249C13.2726 10.3758 13.3396 10.1888 13.3396 9.99574C13.3396 9.80272 13.2726 9.61568 13.15 9.46657L8.98336 4.46657C8.84191 4.29639 8.63865 4.18937 8.4183 4.16905C8.19794 4.14874 7.97854 4.21679 7.80836 4.35824C7.63818 4.49969 7.53116 4.70295 7.51084 4.9233C7.49053 5.14366 7.55858 5.36306 7.70003 5.53324L11.425 9.9999L7.82503 14.4666C7.72312 14.5889 7.65839 14.7378 7.63849 14.8958C7.61859 15.0538 7.64436 15.2141 7.71274 15.3579C7.78112 15.5017 7.88925 15.6228 8.02434 15.7071C8.15944 15.7913 8.31583 15.8351 8.47503 15.8332Z"
                fill="#D0DCD8"
              />
            </g></svg
        ></q-btn>
      </div>
    </div>
    <div class="screenMode-container">
      <span class="appSettings-name">{{ t("nameShown") }}</span>
      <div class="name-toggle-container">
        <q-btn-toggle
          v-model="nameShownValue"
          toggle-color="primary"
          :options="nameShownOptions.map(opt => ({ label: t(opt.label), value: opt.value }))"
          class="name-toggle-buttons"
          spread
          no-caps
        />
      </div>
    </div>
    <div class="acccoutSettings-div">
      <span class="appSettings-title">{{ t("appSettings") }}</span>
      <div
        class="appSettings-content"
        v-for="(appSetting, i) in appSettings"
        :key="i"
        @click="routeCheck(appSetting.destination)"
      >
        <div class="appSetting-description">
          <img :src="appSetting.img" alt="" class="appSettings-img" />
          <span class="appSettings-name">{{ appSetting.title }}</span>
        </div>
        <q-btn class="arrowBtn"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <g opacity="0.6">
              <path
                d="M8.47503 15.8332C8.59952 15.8337 8.72253 15.8062 8.83501 15.7528C8.9475 15.6995 9.04659 15.6216 9.12503 15.5249L13.15 10.5249C13.2726 10.3758 13.3396 10.1888 13.3396 9.99574C13.3396 9.80272 13.2726 9.61568 13.15 9.46657L8.98336 4.46657C8.84191 4.29639 8.63865 4.18937 8.4183 4.16905C8.19794 4.14874 7.97854 4.21679 7.80836 4.35824C7.63818 4.49969 7.53116 4.70295 7.51084 4.9233C7.49053 5.14366 7.55858 5.36306 7.70003 5.53324L11.425 9.9999L7.82503 14.4666C7.72312 14.5889 7.65839 14.7378 7.63849 14.8958C7.61859 15.0538 7.64436 15.2141 7.71274 15.3579C7.78112 15.5017 7.88925 15.6228 8.02434 15.7071C8.15944 15.7913 8.31583 15.8351 8.47503 15.8332Z"
                fill="#D0DCD8"
              />
            </g></svg
        ></q-btn>
      </div>
    </div>
    <!-- Language Section -->
    <div class="acccoutSettings-div">
      <span class="appSettings-title">{{ t("language") }}</span>
      <div
        class="appSettings-content"
        @click="routeCheck('settings-language')"
      >
        <div class="appSetting-description">
          <img src="/icons/langIcon.svg" alt="" class="appSettings-img" />
          <span class="appSettings-name">{{ currentLanguageLabel }}</span>
        </div>
        <q-btn class="arrowBtn"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <g opacity="0.6">
              <path
                d="M8.47503 15.8332C8.59952 15.8337 8.72253 15.8062 8.83501 15.7528C8.9475 15.6995 9.04659 15.6216 9.12503 15.5249L13.15 10.5249C13.2726 10.3758 13.3396 10.1888 13.3396 9.99574C13.3396 9.80272 13.2726 9.61568 13.15 9.46657L8.98336 4.46657C8.84191 4.29639 8.63865 4.18937 8.4183 4.16905C8.19794 4.14874 7.97854 4.21679 7.80836 4.35824C7.63818 4.49969 7.53116 4.70295 7.51084 4.9233C7.49053 5.14366 7.55858 5.36306 7.70003 5.53324L11.425 9.9999L7.82503 14.4666C7.72312 14.5889 7.65839 14.7378 7.63849 14.8958C7.61859 15.0538 7.64436 15.2141 7.71274 15.3579C7.78112 15.5017 7.88925 15.6228 8.02434 15.7071C8.15944 15.7913 8.31583 15.8351 8.47503 15.8332Z"
                fill="#D0DCD8"
              />
            </g></svg
        ></q-btn>
      </div>
    </div>

    <!-- Coming Soon Section -->
    <div class="acccoutSettings-div">
      <span class="appSettings-title">{{ t("comingSoon") }}</span>
      <div
        class="appSettings-content"
        :class="{ 'appSettings-content--disabled': item.disabled }"
        v-for="(item, i) in comingSoonItems"
        :key="i"
        @click="!item.disabled && handleComingSoonItemClick(item)"
      >
        <div class="appSetting-description">
          <img :src="item.img" alt="" class="appSettings-img" />
          <span class="appSettings-name">{{ item.title }}</span>
        </div>
        <span v-if="item.disabled" class="appSettings-comingSoon">{{ t("comingSoon") }}</span>
        <q-btn v-else class="arrowBtn"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <g opacity="0.6">
              <path
                d="M8.47503 15.8332C8.59952 15.8337 8.72253 15.8062 8.83501 15.7528C8.9475 15.6995 9.04659 15.6216 9.12503 15.5249L13.15 10.5249C13.2726 10.3758 13.3396 10.1888 13.3396 9.99574C13.3396 9.80272 13.2726 9.61568 13.15 9.46657L8.98336 4.46657C8.84191 4.29639 8.63865 4.18937 8.4183 4.16905C8.19794 4.14874 7.97854 4.21679 7.80836 4.35824C7.63818 4.49969 7.53116 4.70295 7.51084 4.9233C7.49053 5.14366 7.55858 5.36306 7.70003 5.53324L11.425 9.9999L7.82503 14.4666C7.72312 14.5889 7.65839 14.7378 7.63849 14.8958C7.61859 15.0538 7.64436 15.2141 7.71274 15.3579C7.78112 15.5017 7.88925 15.6228 8.02434 15.7071C8.15944 15.7913 8.31583 15.8351 8.47503 15.8332Z"
                fill="#D0DCD8"
              />
            </g></svg
        ></q-btn>
      </div>
    </div>

    <div class="screenMode-container">
      <span class="appSettings-name">{{ t("screenMode") }}</span>
      <div class="btn-container darkMode-toggle">
        <div
          class="toggle-btn"
          :class="lightMode ? 'active' : ' '"
          @click="changeTheme"
        >
          <svg
            width="16"
            height="16"
            viewBox="0 0 16 16"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            class="darkMode-icon"
          >
            <path
              d="M14.7213 9.38808C14.3175 10.7062 13.5083 11.8634 12.4088 12.695C11.4434 13.4215 10.2947 13.8646 9.09155 13.9746C7.88837 14.0845 6.67836 13.8569 5.59733 13.3174C4.51631 12.7779 3.60705 11.9477 2.97162 10.9201C2.33619 9.89251 1.99974 8.70814 2.00003 7.49995C1.99569 6.08974 2.45413 4.71704 3.30503 3.59245C4.13662 2.49295 5.2938 1.68373 6.61191 1.27995C6.69878 1.2532 6.7913 1.25064 6.87952 1.27254C6.96774 1.29445 7.04832 1.33998 7.1126 1.40426C7.17688 1.46853 7.22241 1.54912 7.24432 1.63734C7.26622 1.72556 7.26366 1.81808 7.23691 1.90495C6.94868 2.85835 6.92452 3.87207 7.16698 4.83812C7.40945 5.80416 7.90947 6.68633 8.61375 7.39061C9.31803 8.09489 10.2002 8.59491 11.1662 8.83738C12.1323 9.07984 13.146 9.05568 14.0994 8.76745C14.1863 8.7407 14.2788 8.73814 14.367 8.76004C14.4552 8.78195 14.5358 8.82748 14.6001 8.89176C14.6644 8.95603 14.7099 9.03662 14.7318 9.12484C14.7537 9.21306 14.7512 9.30558 14.7244 9.39245L14.7213 9.38808Z"
              fill="#FCFCFC"
            />
          </svg>

          <img class="lightMode-icon" src="/icons/lightMode-icon.svg" alt="" />
          <div class="inner-circle"></div>
        </div>
      </div>
    </div>
    <div class="acccoutSettings-div">
      <span class="appSettings-title">{{ t("sources") }}</span>
      <div
        class="appSettings-content"
        v-for="(source, i) in sources"
        :key="i"
        @click="routeCheck(source.destination)"
      >
        <div
          v-if="source.destination === 'settings-about'"
          class="appSetting-description aboutAppSection"
        >
          <img
            v-if="!lightMode"
            :src="source.imgDark"
            alt=""
            class="appSettings-img logoImg"
          />
          <img
            v-else
            :src="source.imgLight"
            alt=""
            class="appSettings-img logoImg"
          />
          <span class="appSettings-name">{{ source.title }}</span>
        </div>
        <div class="appSetting-description" v-else>
          <img :src="source.img" alt="" class="appSettings-img" />
          <span class="appSettings-name">{{ source.title }}</span>
        </div>

        <q-btn class="arrowBtn"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <g opacity="0.6">
              <path
                d="M8.47503 15.8332C8.59952 15.8337 8.72253 15.8062 8.83501 15.7528C8.9475 15.6995 9.04659 15.6216 9.12503 15.5249L13.15 10.5249C13.2726 10.3758 13.3396 10.1888 13.3396 9.99574C13.3396 9.80272 13.2726 9.61568 13.15 9.46657L8.98336 4.46657C8.84191 4.29639 8.63865 4.18937 8.4183 4.16905C8.19794 4.14874 7.97854 4.21679 7.80836 4.35824C7.63818 4.49969 7.53116 4.70295 7.51084 4.9233C7.49053 5.14366 7.55858 5.36306 7.70003 5.53324L11.425 9.9999L7.82503 14.4666C7.72312 14.5889 7.65839 14.7378 7.63849 14.8958C7.61859 15.0538 7.64436 15.2141 7.71274 15.3579C7.78112 15.5017 7.88925 15.6228 8.02434 15.7071C8.15944 15.7913 8.31583 15.8351 8.47503 15.8332Z"
                fill="#D0DCD8"
              />
            </g></svg
        ></q-btn>
      </div>
      <div
        class="appSettings-content appSettings-content--destructive"
        @click="confirmDeleteAccount"
      >
        <div class="appSetting-description">
          <img src="/icons/deleteImg-icon.svg" alt="" class="appSettings-img" />
          <span class="appSettings-name">Delete Account</span>
        </div>
        <q-btn class="arrowBtn"
          ><svg
            xmlns="http://www.w3.org/2000/svg"
            width="20"
            height="20"
            viewBox="0 0 20 20"
            fill="none"
          >
            <g opacity="0.6">
              <path
                d="M8.47503 15.8332C8.59952 15.8337 8.72253 15.8062 8.83501 15.7528C8.9475 15.6995 9.04659 15.6216 9.12503 15.5249L13.15 10.5249C13.2726 10.3758 13.3396 10.1888 13.3396 9.99574C13.3396 9.80272 13.2726 9.61568 13.15 9.46657L8.98336 4.46657C8.84191 4.29639 8.63865 4.18937 8.4183 4.16905C8.19794 4.14874 7.97854 4.21679 7.80836 4.35824C7.63818 4.49969 7.53116 4.70295 7.51084 4.9233C7.49053 5.14366 7.55858 5.36306 7.70003 5.53324L11.425 9.9999L7.82503 14.4666C7.72312 14.5889 7.65839 14.7378 7.63849 14.8958C7.61859 15.0538 7.64436 15.2141 7.71274 15.3579C7.78112 15.5017 7.88925 15.6228 8.02434 15.7071C8.15944 15.7913 8.31583 15.8351 8.47503 15.8332Z"
                fill="#D0DCD8"
              />
            </g></svg
        ></q-btn>
      </div>
    </div>
  </div>
  <div class="appSettings-actions">
    <q-btn
      class="appSettings-logOutButton text-capitalize"
      flat
      no-caps
      @click="logout"
    >
      <span>{{ t("logOut") }}</span>
    </q-btn>
  </div>
  </div>

  <q-dialog
    v-model="deleteAccountDialogOpen"
    persistent
    @hide="resetDeleteAccountDialog"
  >
    <q-card class="appSettings-deleteDialog">
      <q-card-section>
        <div class="appSettings-deleteDialog-title">Delete Account</div>
      </q-card-section>
      <q-card-section class="q-pt-none">
        <p class="appSettings-deleteDialog-body">
          This action permanently deletes your account and hides your posts. To
          continue, type:
        </p>
        <p class="appSettings-deleteDialog-phrase">
          &quot;{{ requiredDeletePhrase }}&quot;
        </p>
        <q-input
          v-model="deleteConfirmText"
          class="appSettings-deleteDialog-input"
          type="textarea"
          autogrow
          outlined
          dense
          :dark="!lightMode"
          aria-label="Confirm account deletion"
        />
      </q-card-section>
      <q-card-actions align="right" class="appSettings-deleteDialog-actions">
        <q-btn
          flat
          no-caps
          label="Cancel"
          class="appSettings-deleteDialog-cancel"
          @click="closeDeleteAccountDialog"
        />
        <q-btn
          flat
          no-caps
          label="Delete Account"
          class="appSettings-deleteDialog-confirm"
          :disable="!isDeleteConfirmValid"
          :loading="deleteAccountLoading"
          @click="submitDeleteAccount"
        />
      </q-card-actions>
    </q-card>
  </q-dialog>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount, watch } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useQuasar } from "quasar";
import { useAuthStore } from "src/stores/auth";
import { useI18n } from "vue-i18n";
import messages from "src/i18n";
import { mapAxiosErrorToDhError } from "src/utils/httpError";
import { notifyError, notifySuccess } from "src/utils/notify";

const $q = useQuasar();
const router = useRouter();
const auth = useAuthStore();
const { t, locale } = useI18n();
const lightMode = ref(false);

// Name shown toggle - 'nickname' or 'realName'
const NAME_SHOWN_STORAGE_KEY = "dreamhubb_name_shown";
const nameShownValue = ref<"nickname" | "realName">("nickname");

// Options for q-btn-toggle - use plain array to avoid reactivity issues
const nameShownOptions = [
  { label: "nickname", value: "nickname" },
  { label: "realName", value: "realName" }
];

// Watch for locale changes to trigger reactivity
watch(() => locale.value, () => {
  // Force reactivity update when locale changes
  // no logs
});

// Get current language label - display native name (in the language itself)
// Use the language's own locale to get the native name
const currentLanguageLabel = computed(() => {
  const savedLanguage = localStorage.getItem("dreamhubb_language") || "en-US";

  // Map language code to i18n locale (for getting translations)
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

  const i18nLocale = localeMap[savedLanguage] || savedLanguage;

  // Get native name from the language's own locale file
  try {
    const localeMessages = messages[i18nLocale as keyof typeof messages];
    if (localeMessages && localeMessages.languages && localeMessages.languages[savedLanguage as keyof typeof localeMessages.languages]) {
      const langData = localeMessages.languages[savedLanguage as keyof typeof localeMessages.languages] as { name: string; nativeName?: string };
      // Prefer nativeName if available, otherwise use name
      if (langData && (langData.nativeName || langData.name)) {
        return langData.nativeName || langData.name;
      }
    }
  } catch (e) {
    // Fallback if translation fails
  }

  // Fallback to English name if native name not available
  try {
    const enMessages = messages["en-US"];
    if (enMessages && enMessages.languages && enMessages.languages[savedLanguage as keyof typeof enMessages.languages]) {
      const langData = enMessages.languages[savedLanguage as keyof typeof enMessages.languages] as { name: string; nativeName?: string };
      // Prefer nativeName if available, otherwise use name
      if (langData && (langData.nativeName || langData.name)) {
        return langData.nativeName || langData.name;
      }
    }
  } catch (e) {
    // Final fallback
  }

  return "English (US)";
});

type ComingSoonItem = {
  img: string;
  title: string;
  disabled?: boolean;
  destination?: string;
  routeName?: string;
};

// Coming soon — Privacy opens public /privacy (not Privacy Settings)
const comingSoonItems = computed<ComingSoonItem[]>(() => [
  {
    img: "/icons/privacyIcon.svg",
    title: t("notificationsLabel"),
    disabled: true
  },
  {
    img: "/icons/privacyIcon.svg",
    title: t("appearance"),
    disabled: true
  },
  {
    img: "/icons/privacyIcon.svg",
    title: t("privacy"),
    routeName: "privacy-policy",
    disabled: false
  }
]);

const checkBodyClass = () => {
  lightMode.value = document.body.classList.contains("body--light");
};

// Load saved name shown preference from localStorage
const loadNameShownPreference = () => {
  const saved = localStorage.getItem(NAME_SHOWN_STORAGE_KEY);
  if (saved === "nickname" || saved === "realName") {
    nameShownValue.value = saved;
  }
};

// Watch for changes in nameShownValue and save to localStorage
watch(nameShownValue, (newValue) => {
  localStorage.setItem(NAME_SHOWN_STORAGE_KEY, newValue);
  // TODO: Optionally save to API if needed
}, { immediate: false });

onMounted(() => {
  checkBodyClass();
  loadNameShownPreference();
});
onBeforeUnmount(() => {
  checkBodyClass();
});

const logout = async () => {
  await auth.logout();
  router.push({ name: "login" });
};

const deleteAccountDialogOpen = ref(false);
const deleteConfirmText = ref("");
const deleteAccountLoading = ref(false);

const deleteAccountUsername = computed(
  () => auth.user?.username?.trim() || auth.name?.trim() || ""
);

const requiredDeletePhrase = computed(
  () => `I want to delete my account: ${deleteAccountUsername.value}`
);

const isDeleteConfirmValid = computed(
  () => deleteConfirmText.value.trim() === requiredDeletePhrase.value
);

const resetDeleteAccountDialog = () => {
  deleteConfirmText.value = "";
  deleteAccountLoading.value = false;
};

const closeDeleteAccountDialog = () => {
  deleteAccountDialogOpen.value = false;
  resetDeleteAccountDialog();
};

const confirmDeleteAccount = () => {
  deleteConfirmText.value = "";
  deleteAccountDialogOpen.value = true;
};

const submitDeleteAccount = async () => {
  if (!isDeleteConfirmValid.value) return;

  deleteAccountLoading.value = true;
  try {
    await auth.deleteAccount();
    closeDeleteAccountDialog();
    notifySuccess("common.success.saved", "Your account has been deleted.", {
      position: "top"
    });
    router.push({ name: "auth-welcome-page" });
  } catch (error) {
    notifyError(mapAxiosErrorToDhError(error), { position: "top" });
  } finally {
    deleteAccountLoading.value = false;
  }
};

function changeTheme() {
  $q.dark.toggle();
  lightMode.value = !lightMode.value;
  // Manually add/remove body--light class to ensure it's available for MutationObserver
  if (lightMode.value) {
    document.body.classList.add("body--light");
  } else {
    document.body.classList.remove("body--light");
  }
}
const accountSettings = computed(() => [
  {
    img: "/icons/keyIcon.svg",
    title: t("changePassword"),
    destination: "settings-password"
  },
  {
    img: "/icons/emailIcon.svg",
    title: t("changeEmailAddress"),
    destination: "settings-email"
  },
  {
    img: "/icons/bioIcon.svg",
    title: t("changeBio"),
    destination: "settings-bio"
  },
  {
    img: "/icons/location-icon.svg",
    title: t("changeLocation"),
    destination: "settings-location"
  }
]);
const appSettings = computed(() => [
  {
    img: "/icons/privacyIcon.svg",
    title: t("privacySettings"),
    destination: "settings-privacy"
  }
]);
const sources = computed(() => [
  {
    img: "/icons/supportIcon.svg",
    title: t("helpAndSupport"),
    destination: "settings-support"
  },
  { img: "/icons/redHelpIcon.svg", title: t("faq"), destination: "settings-faq" },
  {
    imgLight: "/icons/logo-light.svg",
    imgDark: "/icons/logo.svg",
    title: t("aboutApp"),
    destination: "settings-about"
  },
  {
    img: "/icons/banIcon.svg",
    title: t("banList"),
    destination: "settings-ban"
  }
]);

const route = useRoute();
const routesName = route.name?.toString() || "";

const routeCheck = (name: string) => {
  routesName.startsWith("donee")
    ? router.push({ name: `donee-${name}` })
    : router.push({ name: `donor-${name}` });
};

const handleComingSoonItemClick = (item: ComingSoonItem) => {
  if (item.routeName) {
    void router.push({ name: item.routeName });
    return;
  }
  if (item.destination) {
    routeCheck(item.destination);
  }
};
</script>
<style lang="scss">
.body--light {
  .appSettings-content {
    border-bottom: 0.1rem solid rgba(0, 0, 0, 0.348) !important;
  }

  .appSettings .appSettings-comingSoon {
    color: rgba(0, 0, 0, 0.58) !important;
  }

  .appSettings .acccoutSettings-div .appSettings-title {
    color: #1a1a1a !important;
  }

  .appSettings .appSettings-content--disabled .appSettings-name {
    color: rgba(0, 0, 0, 0.52) !important;
  }

  /* Menu row labels beat `.appSettings .appSettings-name { color: white }` specificity */
  .appSettings .appSettings-content .appSettings-name,
  .appSettings .screenMode-container > .appSettings-name {
    color: #1a1a1a !important;
  }

  .appSettings .appSettings-title,
  .appSettings .appSettings-name,
  .appSettings .appSettings-comingSoon,
  .appSettings .appSettings-logOutButton,
  .appSettings span {
    text-decoration: none !important;
    -webkit-text-decoration: none !important;
  }

  .appSettings .appSettings-content--destructive {
    span.appSettings-name {
      color: #bd0043 !important;
      font-weight: 600;
    }

    .appSettings-img {
      filter: none !important;
      opacity: 1 !important;
    }
  }

  .appSettings .name-toggle-container :deep(.q-btn:not(.q-btn--active)) {
    color: rgba(0, 0, 0, 0.62) !important;
  }

  .appSettings .name-toggle-container :deep(.q-btn.q-btn--active) {
    color: #ffffff !important;
  }

  .btn-container {
    border: 0.1rem solid rgba(119, 0, 0, 0.412);
    background: linear-gradient(
      108deg,
      rgba(255, 255, 255, 0.7) 0%,
      rgba(200, 200, 200, 0.7) 100%
    );
  }
  .darkMode-toggle {
    border: 0.1rem solid $primary;
    .toggle-btn {
      background-color: white;
    }
    .darkMode-icon {
      * {
        fill: black;
      }
    }
  }
  .name-toggle-container {
    :deep(.name-toggle-buttons) {
      border-color: rgba(119, 0, 0, 0.412);

      .q-btn {
        border-color: rgba(119, 0, 0, 0.412);
      }
    }
  }
}
.aboutAppSection {
  .appSettings-img {
    margin-right: 0.85rem !important;
  }
}
.accontSettings-container {
  margin-top: 0 !important;
}
.q-btn:before {
  box-shadow: none;
}
.appSettings {
  flex: 0 1 auto;
  padding: 0 1rem;
  padding-top: 1.2rem;
  .q-btn-item {
    border-radius: 0.3rem;
    border-top-right-radius: none !important;
    transition: all 0.5s;
  }
  .acccoutSettings-div {
    margin-top: 1.5rem;
    .appSettings-nameTitle {
      color: white;
      font-family: poppins;
      margin-right: 13%;
      font-size: 1rem;
    }
    .dark-mode-toggle {
      width: 8.2rem !important;
      height: 3.2rem !important;
      border-radius: 0.6rem;
      border: 0.2rem solid $primary !important;
      * {
        border-radius: none !important;
      }
      .q-btn-group {
        border-radius: none !important;
        transition: all 0.5s;
      }
    }
    .appSettings-title {
      color: white;
      font-family: poppinsSemiBold;
    }

    .appSettings-content {
      display: flex;
      justify-content: space-between;
      margin-top: 0.9rem;
      border-bottom: 0.1rem solid transparent;

      .appSetting-description {
        display: flex;
        align-items: center;

        .appSettings-img {
          height: 1.6rem;
          margin-right: 0.5rem;
        }
      }

      .arrowBtn {
        width: 2.5rem;
        padding-left: 3rem;
      }

      &--disabled {
        opacity: 0.6;
        cursor: not-allowed;
        pointer-events: none;
      }
    }

    .appSettings-comingSoon {
      color: rgba(255, 255, 255, 0.5);
      font-size: 0.9rem;
      font-family: poppins;
    }

    .appSettings-languageContainer {
      margin-top: 0.9rem;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;

      .appSettings-languageSelect {
        width: 100%;
        max-width: 300px;
      }

      .appSettings-languageNote {
        color: rgba(255, 255, 255, 0.7);
        font-size: 0.9rem;
        font-family: poppins;
      }
    }
  }
  .appSettings-name {
    color: white;
    font-family: poppins;
    font-size: 1rem;
  }
}
.appSettings-page {
  display: flex;
  flex-direction: column;
  flex: 0 0 auto;
  min-height: 0;
  width: 100%;
}

/*
 * Bottom inset like profile/detail CTAs (Report / Settings) — not footer tab height.
 * Beats .dh-settings-scroll-root default (4.75rem) from _roleMainChrome.scss.
 */
.dh-settings-scroll-root:has(.appSettings-page) {
  min-height: auto !important;
  height: auto !important;
}

.dh-settings-scroll-root .appSettings-page {
  padding-bottom: max(1.25rem, env(safe-area-inset-bottom, 0px)) !important;
  min-height: auto !important;
  height: auto !important;
}

.appSettings-content--destructive {
  cursor: pointer;

  .appSettings-name {
    color: rgba(189, 0, 67, 0.92) !important;
  }
}

.appSettings-actions {
  flex: 0 0 auto;
  display: flex;
  flex-direction: column;
  padding: 0 0.8rem;
  margin-top: 1.75rem;
  margin-bottom: 0;
  margin-left: 0;
  margin-right: 0;
  width: 100%;
  box-sizing: border-box;

  .appSettings-logOutButton {
    width: 100%;
    flex: 0 0 auto;
    margin: 0;
    min-height: 48px;
    background-color: rgba(141, 31, 70, 0.088);
    color: rgba(163, 2, 61, 0.673);
    font-family: montseraatSemiBold;
    font-size: 1.2rem !important;
    border-radius: 0.5rem !important;
    align-items: center;
  }
}
.screenMode-container {
  margin-top: 1.7rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  padding-right: 0.6rem;
  width: 100%;
  gap: 1rem;
}
.btn-container {
  width: 5.2rem;
  position: relative;
  border: 0.1rem solid $primary;
  border-radius: 0.3rem;
}

.name-toggle-container {
  width: 100%;
  max-width: 16rem;
  min-width: 14rem;
  flex: 0 0 auto;
  display: flex;
  align-items: center;
  justify-content: flex-end;

  :deep(.name-toggle-buttons) {
    height: 44px;
    min-height: 44px;
    max-height: 44px;
    width: 100%;
    border-radius: 6.25rem;
    overflow: hidden;
    border: 0.1rem solid $primary;
    background-color: transparent;

    .q-btn-group {
      height: 100%;
      width: 100%;
      display: flex;
      border-radius: 6.25rem;
      overflow: hidden;
      gap: 0;
    }

    .q-btn {
      flex: 1;
      height: 100%;
      min-height: 44px;
      max-height: 44px;
      border-radius: 0;
      font-family: poppins;
      font-size: 0.9rem;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      background-color: transparent;
      border: none;
      border-right: 0.1rem solid rgba($primary, 0.3);
      margin: 0;
      padding: 0;

      &:last-child {
        border-right: none;
        border-top-right-radius: 6.25rem;
        border-bottom-right-radius: 6.25rem;
      }

      &:first-child {
        border-top-left-radius: 6.25rem;
        border-bottom-left-radius: 6.25rem;
      }

      &.q-btn--active {
        background-color: $primary;
        color: white;
      }

      &:not(.q-btn--active) {
        background-color: transparent;
        color: rgba(255, 255, 255, 0.7);
      }

      .q-btn__content {
        padding: 0 0.8rem;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
        display: flex;
        align-items: center;
        justify-content: center;
        min-width: 0;
      }
    }
  }
}
.toggle-btn {
  width: 5rem;
  height: 40px;
  background: black;
  border-radius: 5px;

  cursor: pointer;
  -webkit-transition: all 0.3s 0.1s ease-in-out;
  -moz-transition: all 0.3s 0.1s ease-in-out;
  -o-transition: all 0.3s 0.1s ease-in-out;
  transition: all 0.3s 0.1s ease-in-out;
}

.toggle-btn > .inner-circle {
  width: 40px;
  height: 40px;
  background: $primary;
  -webkit-transition: all 0.3s 0.1s ease-in-out;
  -moz-transition: all 0.3s 0.1s ease-in-out;
  -o-transition: all 0.3s 0.1s ease-in-out;
  transition: all 0.3s 0.1s ease-in-out;
}

.toggle-btn.active > .inner-circle {
  margin-left: 2.55rem;
}

.darkMode-icon {
  position: absolute;
  top: 27%;
  left: 11%;
  height: 1.2rem;
  width: 1.2rem;
}
.lightMode-icon {
  position: absolute;
  top: 27%;
  left: 63%;
  height: 1.2rem;
}

.appSettings-deleteDialog {
  width: min(100%, 22.5rem);
  max-width: 92vw;
  border-radius: 24px;
  overflow: hidden;
  background: linear-gradient(
    180deg,
    rgba(28, 24, 36, 0.98) 0%,
    rgba(14, 10, 18, 0.98) 100%
  );
  border: 1px solid rgba(255, 44, 139, 0.22);
  box-shadow:
    0 22px 70px rgba(0, 0, 0, 0.55),
    0 0 38px rgba(255, 44, 139, 0.08);
  color: #ffffff;

  .q-card__section:first-child {
    padding-bottom: 0.35rem;
  }
}

.appSettings-deleteDialog-title {
  font-family: poppinsSemiBold, poppins, sans-serif;
  font-size: 1.28rem;
  font-weight: 600;
  line-height: 1.3;
  color: #ffffff;
  letter-spacing: -0.01em;
}

.appSettings-deleteDialog-body {
  margin: 0 0 0.85rem;
  font-family: poppins, sans-serif;
  font-size: 0.9rem;
  line-height: 1.5;
  color: rgba(255, 255, 255, 0.72);
}

.appSettings-deleteDialog-phrase {
  margin: 0 0 1rem;
  padding: 0.8rem 0.9rem;
  font-family: poppins, sans-serif;
  font-size: 0.86rem;
  font-weight: 600;
  line-height: 1.45;
  word-break: break-word;
  color: #ffffff;
  background: rgba(255, 44, 139, 0.09);
  border: 1px solid rgba(255, 44, 139, 0.24);
  border-radius: 14px;
}

.appSettings-deleteDialog-input {
  :deep(.q-field__control) {
    border-radius: 14px;
    background: rgba(255, 255, 255, 0.04);
    color: #ffffff;

    &::before {
      border: 1px solid rgba(255, 44, 139, 0.28);
    }
  }

  :deep(.q-field__control:hover::before) {
    border-color: rgba(255, 44, 139, 0.42);
  }

  :deep(.q-field--focused .q-field__control::before) {
    border-color: rgba(255, 44, 139, 0.65);
    box-shadow: 0 0 0 1px rgba(255, 44, 139, 0.2);
  }

  :deep(.q-field__native),
  :deep(textarea) {
    color: rgba(255, 255, 255, 0.92);
    font-family: poppins, sans-serif;
    font-size: 0.88rem;
    line-height: 1.45;
  }

  :deep(.q-field__label) {
    color: rgba(255, 255, 255, 0.55);
  }
}

.appSettings-deleteDialog-actions {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-end;
  gap: 0.65rem;
  padding: 0.25rem 1rem 1.1rem;
}

.appSettings-deleteDialog-cancel {
  min-height: 42px;
  padding: 0 1.1rem;
  border-radius: 999px;
  font-family: montseraatSemiBold, poppinsSemiBold, sans-serif;
  font-size: 0.92rem;
  color: rgba(255, 255, 255, 0.82) !important;
  background: rgba(255, 255, 255, 0.06) !important;
  border: 1px solid rgba(255, 255, 255, 0.14);

  &::before {
    box-shadow: none !important;
  }
}

.appSettings-deleteDialog-confirm {
  min-height: 42px;
  padding: 0 1.15rem;
  border-radius: 999px;
  font-family: montseraatSemiBold, poppinsSemiBold, sans-serif;
  font-size: 0.92rem;
  color: #ffffff !important;
  background: linear-gradient(90deg, #bd0043 0%, #ff2c8b 100%) !important;
  border: none;

  &::before {
    box-shadow: none !important;
  }

  &.disabled,
  &[disabled] {
    opacity: 0.45 !important;
    color: #ffffff !important;
    background: linear-gradient(90deg, #bd0043 0%, #ff2c8b 100%) !important;
  }
}

.body--light {
  .appSettings-deleteDialog {
    background: #ffffff;
    border: 1px solid rgba(189, 0, 67, 0.18);
    box-shadow:
      0 18px 48px rgba(0, 0, 0, 0.12),
      0 0 32px rgba(255, 44, 139, 0.1);
    color: #1a1a1a;
  }

  .appSettings-deleteDialog-title {
    color: #1a1a1a;
  }

  .appSettings-deleteDialog-body {
    color: rgba(0, 0, 0, 0.68);
  }

  .appSettings-deleteDialog-phrase {
    color: #1a1a1a;
    background: rgba(189, 0, 67, 0.06);
    border-color: rgba(189, 0, 67, 0.18);
  }

  .appSettings-deleteDialog-input {
    :deep(.q-field__control) {
      background: rgba(0, 0, 0, 0.02);
      color: #1a1a1a;

      &::before {
        border-color: rgba(189, 0, 67, 0.22);
      }
    }

    :deep(.q-field__control:hover::before) {
      border-color: rgba(189, 0, 67, 0.35);
    }

    :deep(.q-field--focused .q-field__control::before) {
      border-color: rgba(255, 44, 139, 0.55);
      box-shadow: 0 0 0 1px rgba(255, 44, 139, 0.12);
    }

    :deep(.q-field__native),
    :deep(textarea) {
      color: #1a1a1a;
    }

    :deep(.q-field__label) {
      color: rgba(0, 0, 0, 0.45);
    }
  }

  .appSettings-deleteDialog-cancel {
    color: rgba(0, 0, 0, 0.72) !important;
    background: rgba(0, 0, 0, 0.04) !important;
    border-color: rgba(0, 0, 0, 0.1);
  }

  .appSettings-deleteDialog-confirm {
    color: #ffffff !important;

    &.disabled,
    &[disabled] {
      color: #ffffff !important;
    }
  }
}
</style>
