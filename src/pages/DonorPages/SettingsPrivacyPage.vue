<template>
  <div class="settingsPrivacy-page">
    <div class="settingsPrivacy-main">
      <span class="settingsPrivacy-title">Privacy Settings</span>
      <div class="settingsPrivacy-options">
        <div class="settingsPrivacy-marketing settingsPrivacy">
          <span class="marketingTitle Title">Receive Email Marketing</span>
          <q-toggle
            size="lg"
            v-model="value"
            val="x"
            keep-color
            color="primary"
            class="privacy-toggle toggle"
          />
        </div>
        <div class="settingsPrivacy-tracking settingsPrivacy">
          <span class="trackingTitle Title">Receive Email Marketing</span>
          <q-toggle
            size="lg"
            v-model="value2"
            val="xs"
            keep-color
            color="primary"
            class="tracking-toggle toggle"
          />
        </div>
        <div class="settingsPrivacy-tracking settingsPrivacy">
          <span class="trackingTitle Title">Receive Email Marketing</span>
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
        <div class="settingsPrivacy-bottom">
          <div
            class="settingsPrivacy-tracking settingsPrivacy settingsPrivacy-linkRow"
            role="button"
            tabindex="0"
            @click="openTerms"
            @keyup.enter="openTerms"
          >
            <span class="trackingTitle Title">Terms and Conditions</span>
            <q-btn class="arrowBtn" flat tabindex="-1"
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
            class="settingsPrivacy-tracking settingsPrivacy settingsPrivacy-linkRow"
            role="button"
            tabindex="0"
            @click="openPrivacyPolicy"
            @keyup.enter="openPrivacyPolicy"
          >
            <span class="trackingTitle Title">Privacy Policy</span>
            <q-btn class="arrowBtn" flat tabindex="-1"
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
      <div class="pageFooter-div">
        <q-btn class="cancelButton" :loading="saving" :disable="!hasChanges || saving" @click="handleSave">
          Save
        </q-btn>
      </div>
    </div>
  </div>
</template>
<script setup lang="ts">
import { computed, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
import { useAuthStore } from "src/stores/auth";
import { notifySuccess } from "src/utils/notify";

const router = useRouter();

const PRIVACY_STORAGE_KEY = "dh_privacy_settings";

const authStore = useAuthStore();

const value = ref(false);
const value2 = ref(false);
const initialValue = ref(false);
const initialValue2 = ref(false);
const saving = ref(false);

const hasChanges = computed(() => value.value !== initialValue.value || value2.value !== initialValue2.value);

const openTerms = () => {
  void router.push({ name: "terms-of-use" });
};

const openPrivacyPolicy = () => {
  void router.push({ name: "privacy-policy" });
};

onMounted(() => {
  // Prefer explicit local preference if previously saved on device.
  const raw = localStorage.getItem(PRIVACY_STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as Partial<{ receiveEmailMarketing: boolean; receiveEmailMarketingSecondary: boolean }>;
      value.value = !!parsed.receiveEmailMarketing;
      value2.value = !!parsed.receiveEmailMarketingSecondary;
    } catch {
      // ignore invalid local data
    }
  } else {
    // Fallback to user payload if backend already exposes these flags.
    const user = authStore.user as (typeof authStore.user & {
      receive_email_marketing?: boolean;
      receive_email_marketing_secondary?: boolean;
    }) | null;
    value.value = !!user?.receive_email_marketing;
    value2.value = !!user?.receive_email_marketing_secondary;
  }

  initialValue.value = value.value;
  initialValue2.value = value2.value;
});

const handleSave = async () => {
  if (saving.value || !hasChanges.value) return;
  saving.value = true;

  try {
    localStorage.setItem(
      PRIVACY_STORAGE_KEY,
      JSON.stringify({
        receiveEmailMarketing: value.value,
        receiveEmailMarketingSecondary: value2.value
      })
    );

    initialValue.value = value.value;
    initialValue2.value = value2.value;
    notifySuccess("common.success.saved", "Privacy settings saved", { position: "top" });
  } finally {
    saving.value = false;
  }
};
</script>
<style scoped lang="scss">
.settingsPrivacy-page {
  .settingsPrivacy-main {
    display: flex;
    flex-direction: column;
    padding: 0 1rem;
    padding-bottom: 3rem;
    margin: 1.5rem 0;

    .settingsPrivacy-title {
      font-size: 1.4rem;
      font-family: poppinsSemiBold;
      color: white;
      margin-bottom: 1.6rem;
    }

    .settingsPrivacy-options {
      display: flex;
      flex-direction: column;
      font-family: poppins;

      .settingsPrivacy {
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin: 0.3rem 0;

        .Title {
          font-size: 1rem;
          color: white;
        }

        .toggle {
          color: white;
        }

        .arrowBtn {
          width: 2.5rem;
          padding-right: 1.6rem;
          color: none;
          .q-ripple {
            display: none !important;
          }
          img {
            height: 1.5rem;
          }
        }
      }

      .settingsPrivacy-bottom {
        margin-top: 4rem;

        .settingsPrivacy {
          margin: 0.3rem 0;
        }

        .settingsPrivacy-linkRow {
          cursor: pointer;
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
      margin: 0 auto;
    }
  }
}
</style>
<style lang="scss">
.arrowBtn {
  .q-ripple {
    display: none;
  }
}
</style>
