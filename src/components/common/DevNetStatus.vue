<template>
  <div v-if="enabled" class="devNetStatus">
    <span class="devNetStatus-pill" :class="isOnline ? 'devNetStatus-pill--ok' : 'devNetStatus-pill--bad'">
      {{ isOnline ? "ONLINE" : "OFFLINE" }}
    </span>
    <span class="devNetStatus-meta">{{ base }}</span>
  </div>
</template>

<script setup lang="ts">
import { computed } from "vue";
import { useNetworkStore } from "src/stores/network";

const networkStore = useNetworkStore();

const enabled = computed(() => {
  if (process.env.NODE_ENV !== "development") return false;
  try {
    // optional toggle: localStorage.setItem('dh_dev_net', '1')
    return localStorage.getItem("dh_dev_net") === "1";
  } catch {
    return true;
  }
});

const isOnline = computed(() => networkStore.isOnline);
const base = computed(() => String(import.meta.env.VITE_API_BASE || ""));
</script>

<style scoped lang="scss">
.devNetStatus {
  position: fixed;
  right: 10px;
  bottom: 10px;
  z-index: 99999;
  display: flex;
  align-items: center;
  gap: 8px;
  font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
  font-size: 11px;
  color: rgba(255, 255, 255, 0.75);
}

.devNetStatus-pill {
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.18);
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(10px);
}

.devNetStatus-pill--ok {
  border-color: rgba(0, 255, 170, 0.25);
  color: rgba(0, 255, 170, 0.9);
}

.devNetStatus-pill--bad {
  border-color: rgba(255, 77, 184, 0.28);
  color: rgba(255, 77, 184, 0.95);
}

.devNetStatus-meta {
  max-width: 280px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  padding: 3px 8px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.14);
  background: rgba(0, 0, 0, 0.25);
  backdrop-filter: blur(10px);
}
</style>
