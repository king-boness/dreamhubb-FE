import { defineStore } from "pinia";
import { api } from "boot/axios";

export const useApiCallStore = defineStore("apiCall", {
  state: () => ({}),

  actions: {
    // 🟢 Registrácia používateľa
    register(data: FormData) {
      return api.post("/register", data, {
        headers: { "Content-Type": "multipart/form-data" }
      });
    },

    // 🟢 Prihlásenie používateľa (napojenie na Laravel /api/login)
    login(data: { email: string; password: string }) {
      return api.post("/login", data).then((res) => {
        const token =
          res.data?.authorization?.token ||
          res.data?.access_token ||
          res.data?.token;

        if (token) {
          localStorage.setItem("jwtToken", token);
        }

        return res;
      });
    },

    // 🟢 Získanie postov (autorizovaný request)
    getPosts() {
      return api.get("/posts");
    }
  }
});
