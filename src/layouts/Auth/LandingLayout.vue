<template>
  <q-layout view="lHh Lpr fff" class="landingLayout">
    <q-page-container>
      <q-page
        class="justify-center items-center login"
        :class="{ iphoneDevice: $q.platform.is.ios }"
      >
        <div class="row col-12">
          <!-- Offline Dialog -->
          <q-dialog
            v-model="showOfflineDialog"
            persistent
            :maximized="false"
            class="offlineDialog"
          >
            <q-card class="offlineDialog-card">
              <q-card-section class="offlineDialog-header">
                <div class="offlineDialog-icon">
                  <q-icon name="wifi_off" size="48px" color="white" />
                </div>
                <div class="offlineDialog-title">{{ t("offlineTitle") }}</div>
                <div class="offlineDialog-message">{{ t("offlineMessage") }}</div>
              </q-card-section>

              <q-card-actions align="right" class="offlineDialog-actions">
                <q-btn
                  flat
                  :label="t('close')"
                  color="white"
                  class="offlineDialog-btn offlineDialog-btn--close"
                  @click="closeOfflineDialog"
                />
                <q-btn
                  :label="t('openSettings')"
                  color="primary"
                  class="offlineDialog-btn offlineDialog-btn--settings"
                  @click="openSettings"
                />
              </q-card-actions>
            </q-card>
          </q-dialog>
          <div v-if="route.name == 'login'" class="buttonDiv">
            <q-btn class="arrowButtonBack" @click="handleBack">
              <img
                class="arrowButtonBack-icon"
                src="/icons/arrowIcon.svg"
                alt=""
              />
            </q-btn>
          </div>
          <div class="landingPage-mapImage">
            <img
              src="/images/Auth/map-image.svg"
              spinner-color="white"
              class="mapImage"
            />
          </div>
        </div>
        <div class="dreamImgs">
          <!-- <q-img src="src/assets/Auth/islandImg.png" class="imgMain1 imgMain" />
          <q-img
            src="src/assets/Auth/surgeryImg.png"
            class="imgMain2 imgMain"
          />
          <q-img src="src/assets/Auth/teslaImg.png" class="imgMain3 imgMain" /> -->
        </div>
        <div class="row col-12 landingPage-contentSection">
          <h1 class="col-12 logo">dreamhubb</h1>
          <router-view />
        </div>
      </q-page>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, watch, onMounted, onBeforeUnmount } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const route = useRoute();
const router = useRouter();

const isInternet = ref(navigator.onLine);
const showOfflineDialog = ref(false);

// Watch for online/offline status changes
const handleOnline = () => {
  isInternet.value = true;
  showOfflineDialog.value = false;
};

const handleOffline = () => {
  isInternet.value = false;
  showOfflineDialog.value = true;
};

const closeOfflineDialog = () => {
  showOfflineDialog.value = false;
};

const openSettings = () => {
  // Try to open device settings
  // For mobile devices, this might work with specific URLs
  if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
    // iOS - try to open Settings app (limited support)
    window.location.href = "App-Prefs:root=WIFI";
  } else if (/Android/i.test(navigator.userAgent)) {
    // Android - try to open WiFi settings
    window.location.href = "android.settings.WIFI_SETTINGS";
  } else {
    // Desktop - show a message or try to open network settings
    alert(t("offlineDesktopMessage"));
  }
  closeOfflineDialog();
};

onMounted(() => {
  // Check initial status
  if (!isInternet.value) {
    showOfflineDialog.value = true;
  }

  // Listen for online/offline events
  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);
});

onBeforeUnmount(() => {
  window.removeEventListener("online", handleOnline);
  window.removeEventListener("offline", handleOffline);
});

const handleBack = () => {
  router.push({ name: "auth-welcome" });
};
</script>
<style lang="scss" scoped>
.landingPage-mapImage {
  padding-top: 5rem;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  width: 100%;
}
.mapImage {
  height: 16rem;
  width: 100%;
  margin-bottom: 2rem;
}
.login {
  background-image: none;
  background-image: url("/images/Auth/bg-explain.png");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: top;
}
.buttonDiv {
  margin-top: 0;
  margin: 1rem;
  margin-bottom: -3.5rem !important;
}
.offlineDialog {
  :deep(.q-dialog__inner) {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 1rem;
  }
}

.offlineDialog-card {
  background: linear-gradient(180deg, #1a1a1a 0%, #0f0f0f 100%);
  border-radius: 24px;
  max-width: 400px;
  width: 100%;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.5);
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.offlineDialog-header {
  text-align: center;
  padding: 2rem 1.5rem 1.5rem;
}

.offlineDialog-icon {
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
}

.offlineDialog-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: white;
  margin-bottom: 0.75rem;
  font-family: poppinsSemiBold;
}

.offlineDialog-message {
  font-size: 0.95rem;
  color: rgba(255, 255, 255, 0.8);
  line-height: 1.5;
  font-family: poppins;
}

.offlineDialog-actions {
  padding: 1rem 1.5rem 1.5rem;
  display: flex;
  gap: 0.75rem;
  justify-content: flex-end;
}

.offlineDialog-btn {
  flex: 1;
  min-width: 0;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  font-family: montseraatSemiBold;

  &--close {
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.2);

    &:hover {
      background: rgba(255, 255, 255, 0.15);
    }
  }

  &--settings {
    background: linear-gradient(95deg, #ff007a, #ff8a00);
    color: white;

    &:hover {
      background: linear-gradient(95deg, #ff007a, #ff8a00);
      opacity: 0.9;
    }
  }
}

.arrowButtonBack {
  background-color: none;
  border: 0.1rem solid white;
  border-radius: 50%;
  height: 2.5rem;
  width: 2.5rem;
  padding-right: 1.11rem;
}
</style>
