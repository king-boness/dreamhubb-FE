import { defineStore } from "pinia";
import { useJwt } from "@vueuse/integrations/useJwt";
import { api } from "src/boot/axios";

export const useUserStore = defineStore("user", {
  state: () => ({
    name: useJwt(localStorage.getItem("jwtToken") || "").payload.value?.sub,
    token: localStorage.getItem("jwtToken") || "",
    isAuthenticated: !!localStorage.getItem("jwtToken")
    // role: "donor"
  }),
  actions: {
    async logout() {
      try {
        // Volať BE /api/logout endpoint
        await api.post("/logout");
      } catch (error: unknown) {
        // Ignorovať chyby - aj tak vymazeme token
        // Dôležité je vyčistiť FE stav, aj keď BE vracia 500
        if (process.env.NODE_ENV === "development") {
          const errorMessage = error instanceof Error ? error.message : String(error);
          console.warn("Logout API call failed:", errorMessage);
        }
      } finally {
        // Vždy vymazať token a resetovať store
        localStorage.removeItem("jwtToken");
        this.token = "";
        this.name = "";
        this.isAuthenticated = false;

        // Redirect to auth welcome page using window.location
        // Používame window.location namiesto router, aby sme sa vyhli problémom s Pinia plugin
        window.location.href = "/auth";
      }
    }
  }
});
