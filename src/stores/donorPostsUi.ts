import { defineStore } from "pinia";

export type DonorPostsActiveTab = "help" | "pay" | "top";

export const useDonorPostsUiStore = defineStore("donorPostsUi", {
  state: () => ({
    activeTab: "help" as DonorPostsActiveTab
  }),
  actions: {
    setActiveTab(tab: DonorPostsActiveTab) {
      this.activeTab = tab;
    }
  }
});
