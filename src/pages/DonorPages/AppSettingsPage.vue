<template>
  <div class="appSettings">
    <div class="acccoutSettings-div accontSettings-container">
      <span class="appSettings-title">Account Settings</span>
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
      <span class="appSettings-name">Name shown</span>
      <div class="btn-container name-ButtonContainer">
        <div
          class="toggle-btn name-button"
          :class="nameShown ? 'active' : ' '"
          @click="nameShown = !nameShown"
        >
          <span class="nickname-option">Nickname</span>
          <span class="realName-option">Real Name</span>
          <div class="inner-circle name-buttonCircle"></div>
        </div>
      </div>
    </div>
    <div class="acccoutSettings-div">
      <span class="appSettings-title">App Settings</span>
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
      <span class="appSettings-title">Language</span>
      <div class="appSettings-languageContainer">
        <q-select
          v-model="selectedLanguage"
          :options="languageOptions"
          option-label="label"
          option-value="value"
          emit-value
          map-options
          class="appSettings-languageSelect"
          :dark="!lightMode"
          @update:model-value="handleLanguageChange"
        />
        <span class="appSettings-languageNote">
          {{ currentLanguageLabel }}
        </span>
      </div>
    </div>

    <!-- Coming Soon Section -->
    <div class="acccoutSettings-div">
      <span class="appSettings-title">Coming Soon</span>
      <div
        class="appSettings-content appSettings-content--disabled"
        v-for="(item, i) in comingSoonItems"
        :key="i"
      >
        <div class="appSetting-description">
          <img :src="item.img" alt="" class="appSettings-img" />
          <span class="appSettings-name">{{ item.title }}</span>
        </div>
        <span class="appSettings-comingSoon">Coming soon</span>
      </div>
    </div>

    <div class="screenMode-container">
      <span class="appSettings-name">Screen Mode</span>
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
      <span class="appSettings-title">Sources</span>
      <div
        class="appSettings-content"
        v-for="(source, i) in sources"
        :key="i"
        @click="routeCheck(source.destination)"
      >
        <div
          v-if="source.title == 'About App'"
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
    </div>
    <!-- <q-btn class="appSettings-deleteButton text-capitalize"
      ><span class="">Delete account</span></q-btn
      > -->
  </div>
  <div class="appSettings-buttonsContainer">
    <q-btn
      class="appSettings-deleteButton appSettings-logOutButton text-capitalize"
      @click="logout"
    >
      <span class="">Log out</span>
    </q-btn>
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, onBeforeUnmount } from "vue";
import { useRouter, useRoute } from "vue-router";
import { useQuasar } from "quasar";
import { useAuthStore } from "src/stores/auth";

const $q = useQuasar();
const router = useRouter();
const auth = useAuthStore();
const lightMode = ref(false);
const nameShown = ref(false);

// Language selection
const selectedLanguage = ref("sk");
const languageOptions = [
  { label: "Slovak (SK)", value: "sk" },
  { label: "English (EN)", value: "en" }
];

// Get current language label
const currentLanguageLabel = computed(() => {
  const option = languageOptions.find(opt => opt.value === selectedLanguage.value);
  return option ? option.label : "Slovak (SK)";
});

// Handle language change
const handleLanguageChange = (value: string) => {
  // TODO: If i18n is implemented, update locale here
  // Example: i18n.locale.value = value;
  if (process.env.NODE_ENV === "development") {
    console.log("Language changed to:", value);
  }
  // For now, just store in localStorage for persistence
  localStorage.setItem("appLanguage", value);
};

// Coming soon items
const comingSoonItems = [
  {
    img: "/icons/privacyIcon.svg",
    title: "Notifications"
  },
  {
    img: "/icons/privacyIcon.svg",
    title: "Appearance"
  },
  {
    img: "/icons/privacyIcon.svg",
    title: "Privacy"
  }
];

// Load saved language on mount
onMounted(() => {
  const savedLanguage = localStorage.getItem("appLanguage");
  if (savedLanguage) {
    selectedLanguage.value = savedLanguage;
  }
});

const checkBodyClass = () => {
  lightMode.value = document.body.classList.contains("body--light");
};
onMounted(() => {
  checkBodyClass();
});
onBeforeUnmount(() => {
  checkBodyClass();
});

const logout = async () => {
  await auth.logout();
  router.push({ name: "login" });
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
const accountSettings = [
  {
    img: "/icons/keyIcon.svg",
    title: "Change Password",
    destination: "settings-password"
  },
  {
    img: "/icons/emailIcon.svg",
    title: "Change E-mail Address",
    destination: "settings-email"
  },
  {
    img: "/icons/bioIcon.svg",
    title: "Change Bio",
    destination: "settings-bio"
  }
];
const appSettings = [
  {
    img: "/icons/privacyIcon.svg",
    title: "Privacy Settings",
    destination: "settings-privacy"
  }
  // Language is now handled directly in the template, not as a separate route
];
const sources = [
  {
    img: "/icons/supportIcon.svg",
    title: "Help and Support",
    destination: "settings-support"
  },
  { img: "/icons/redHelpIcon.svg", title: "FAQ", destination: "settings-faq" },
  {
    imgLight: "/icons/logo-light.svg",
    imgDark: "/icons/logo.svg",
    title: "About App",
    destination: "settings-about"
  },
  {
    img: "/icons/banIcon.svg",
    title: "Ban List",
    destination: "settings-ban"
  }
];

const route = useRoute();
const routesName = route.name?.toString() || "";

const routeCheck = (name: string) => {
  if (process.env.NODE_ENV === "development") {
    console.log(routesName);
  }
  routesName.startsWith("donee")
    ? router.push({ name: `donee-${name}` })
    : router.push({ name: `donor-${name}` });
};
</script>
<style lang="scss">
.body--light {
  .appSettings-content {
    border-bottom: 0.1rem solid rgba(0, 0, 0, 0.348) !important;
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
  .name-ButtonContainer {
    background-color: rgba(246, 246, 246, 0);
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
  .appSettings-logOutButton {
    margin-top: 1rem;
    margin-bottom: 7rem;
  }
}
.appSettings-buttonsContainer {
  padding: 0 0.8rem;
  .appSettings-deleteButton {
    width: 100%;
    background-color: rgba(141, 31, 70, 0.088);
    color: rgba(163, 2, 61, 0.673);
    font-family: montseraatSemiBold;
    font-size: 1.2rem !important;
    border-radius: 0.5rem !important;
    align-items: start;
    margin-top: 1.5rem;
    margin-bottom: 3rem;
  }
}
.screenMode-container {
  margin-top: 1.7rem;
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-direction: row;
  padding-right: 0.6rem;
}
.btn-container {
  width: 5.2rem;
  position: relative;
  border: 0.1rem solid $primary;
  border-radius: 0.3rem;
}

.name-ButtonContainer {
  width: 13rem !important;
  border-radius: 6.25rem;
}
.name-buttonCircle {
  width: 6.5rem !important;
  border-radius: 6.25rem;
}
.name-button {
  background-color: transparent !important;
}
.name-button.active > .name-buttonCircle {
  margin-left: 6.4rem !important;
}
.nickname-option {
  position: absolute;
  z-index: 1;
  color: white;
  font-family: poppins;
  top: 24%;
  left: 8%;
}
.realName-option {
  position: absolute;
  color: white;
  font-family: poppins;
  top: 24%;
  left: 56%;
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
</style>
