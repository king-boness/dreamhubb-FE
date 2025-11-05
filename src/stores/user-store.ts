import { defineStore } from "pinia";
import { useJwt } from "@vueuse/integrations/useJwt";
import { api } from "src/boot/axios";

export const useUserStore = defineStore("user", {
  state: () => ({
    name: useJwt(localStorage.getItem("jwtToken") || "").payload.value?.sub,
    token: localStorage.getItem("jwtToken") || ""
    // role: "donor"
  }),
  actions: {
    async logout() {
      try {
        // Volať BE /api/logout endpoint
        await api.post("/logout");
      } catch (error: any) {
        // Ignorovať chyby - aj tak vymazeme token
        if (process.env.NODE_ENV === "development") {
          console.warn("Logout API call failed:", error.message);
        }
      } finally {
        // Vždy vymazať token a resetovať store
        localStorage.removeItem("jwtToken");
        this.token = "";
        this.name = "";
      }
    }
  }
});
