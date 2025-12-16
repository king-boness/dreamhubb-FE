// src/stores/network.ts
import { defineStore } from "pinia";

export const useNetworkStore = defineStore("network", {
  state: () => ({
    // Track global online/offline status
    isOnline: typeof navigator !== "undefined" ? navigator.onLine : true
  }),
  actions: {
    setOnline(value: boolean) {
      this.isOnline = value;
    }
  }
});
