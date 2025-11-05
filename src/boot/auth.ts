import { boot } from "quasar/wrappers";
import { api } from "./axios";
import { AxiosError } from "axios";

export default boot(async ({ router }) => {
  // Tichý /me check pri štarte aplikácie
  const token = localStorage.getItem("jwtToken");

  if (token) {
    try {
      // Tichý check validnosti tokenu
      const response = await api.get("/user");

      if (response.data.status === "success" && response.data.user) {
        // Token je platný, používateľ je prihlásený
        if (process.env.NODE_ENV === "development") {
          console.log("✅ Token valid - user authenticated:", response.data.user.username);
        }
      } else {
        // Token nie je platný
        if (process.env.NODE_ENV === "development") {
          console.log("❌ Token invalid - clearing storage");
        }
        localStorage.removeItem("jwtToken");
      }
    } catch (error) {
      // Ak 401 alebo iná chyba, vymazať token
      const axiosError = error as AxiosError;
      if (axiosError.response?.status === 401 || axiosError.response?.status === 403) {
        if (process.env.NODE_ENV === "development") {
          console.log("❌ Token expired or invalid - clearing storage");
        }
        localStorage.removeItem("jwtToken");

        // Ak nie sme na login stránke, presmerovať
        if (router && router.currentRoute.value.name !== "login" && router.currentRoute.value.name !== "landing" && router.currentRoute.value.name !== "splash") {
          router.push({ name: "login" }).catch(() => {
            // Ignorovať chyby pri navigácii
          });
        }
      } else {
        // Iná chyba (napr. sieť) - necháme token, ale logneme
        if (process.env.NODE_ENV === "development") {
          const errorMessage = axiosError instanceof Error ? axiosError.message : "Unknown error";
          console.warn("⚠️ Failed to verify token:", errorMessage);
        }
      }
    }
  }
});
