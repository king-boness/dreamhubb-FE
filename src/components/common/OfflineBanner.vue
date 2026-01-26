<template>
  <transition name="offlineBanner-fade">
    <div v-if="!isOnline" class="offlineBanner" role="status" aria-live="polite">
      <div class="offlineBanner-inner">
        <div class="offlineBanner-text">
          {{ message }}
        </div>
        <q-btn
          dense
          flat
          no-caps
          class="offlineBanner-retry"
          :label="retryLabel"
          @click="handleRetry"
        />
      </div>
    </div>
  </transition>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useI18n } from "vue-i18n";
import { useNetworkStore } from "src/stores/network";

const { t } = useI18n();
const networkStore = useNetworkStore();

const isOnline = computed(() => networkStore.isOnline);
const message = computed(() => t("common.errors.offline"));
const retryLabel = computed(() => t("common.actions.retry"));

const handleRetry = () => {
  // Best-effort: re-check connection and refresh if online.
  networkStore.setOnline(typeof navigator !== "undefined" ? navigator.onLine : true);
  if (networkStore.isOnline) {
    window.location.reload();
  }
};
</script>

<style scoped lang="scss">
.offlineBanner {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  z-index: 99999;
  padding: 10px 12px;
  background: rgba(10, 6, 18, 0.92);
  backdrop-filter: blur(12px);
  border-bottom: 1px solid rgba(255, 77, 184, 0.25);
}

.offlineBanner-inner {
  max-width: 520px;
  margin: 0 auto;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.offlineBanner-text {
  font-family: poppins;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
}

.offlineBanner-retry {
  color: #ff4db8;
  font-family: poppinsSemiBold;
}

.offlineBanner-fade-enter-active,
.offlineBanner-fade-leave-active {
  transition: opacity 0.18s ease, transform 0.18s ease;
}
.offlineBanner-fade-enter-from,
.offlineBanner-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
