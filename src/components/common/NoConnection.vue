<template>
  <div class="no-connection">
    <div class="no-connection__card">
      <q-icon name="signal_wifi_off" size="48px" class="no-connection__icon" />
      <h1 class="no-connection__title">No internet connection</h1>
      <p class="no-connection__subtitle">
        Please check your Wi‑Fi or mobile data and try again.
      </p>
      <div class="no-connection__buttons">
        <q-btn
          color="primary"
          label="Reload"
          class="no-connection__button"
          unelevated
          @click="reloadApp"
        />
        <q-btn
          flat
          color="white"
          label="Network settings"
          class="no-connection__button no-connection__button--secondary"
          @click="openNetworkSettings"
        />
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";

const $q = useQuasar();

const reloadApp = () => {
  window.location.reload();
};

const openNetworkSettings = () => {
  $q.notify({
    type: "info",
    message: "Open Wi‑Fi or mobile data settings on your device, then tap Reload.",
    position: "top",
    timeout: 4000
  });
};
</script>

<style scoped lang="scss">
.no-connection {
  position: fixed;
  inset: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  background: radial-gradient(circle at top, #0b001c 0%, #05000e 40%, #010006 100%);
  z-index: 9999;
}

.no-connection__card {
  max-width: 320px;
  padding: 2rem 1.75rem;
  border-radius: 16px;
  background: rgba(6, 0, 18, 0.9);
  box-shadow: 0 18px 45px rgba(0, 0, 0, 0.6);
  text-align: center;
}

.no-connection__icon {
  color: #ff4081;
  margin-bottom: 1rem;
}

.no-connection__title {
  font-size: 1.2rem;
  color: #ffffff;
  margin-bottom: 0.5rem;
}

.no-connection__subtitle {
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.7);
  margin-bottom: 1.5rem;
}

.no-connection__buttons {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.no-connection__button {
  width: 100%;
}

.no-connection__button--secondary {
  border: 1px solid rgba(255, 255, 255, 0.4);
}
</style>
