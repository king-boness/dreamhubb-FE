import { boot } from "quasar/wrappers";
import { api } from "./axios";
import { AxiosError } from "axios";
import { useAuthStore } from "src/stores/auth";

export default boot(({ router }) => {
  // Non-blocking: do not delay first paint / Capacitor bridge on cold start.
  void (async () => {
    try {
      const authStore = useAuthStore();

      const TOKEN_KEY = "token";
      const LEGACY_TOKEN_KEY = "jwtToken";

      const token = localStorage.getItem(TOKEN_KEY);
      const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);

      if (!token) {
        if (legacyToken) {
          localStorage.removeItem(LEGACY_TOKEN_KEY);
        }
        return;
      }

      const response = await api.get("/user");

      if (response.data?.status === "success" && response.data?.user) {
        if (import.meta.env.DEV) {
          console.debug("[boot/auth] Token valid:", response.data.user?.username);
        }
        return;
      }

      await authStore.logout({ remote: false, silent: true });
      localStorage.removeItem(LEGACY_TOKEN_KEY);
    } catch (error) {
      const axiosError = error as AxiosError;

      if (import.meta.env.DEV) {
        const msg = axiosError?.message || "Unknown error";
        console.debug("[boot/auth] Silent token verify failed; clearing session:", msg);
      }

      try {
        const authStore = useAuthStore();
        await authStore.logout({ remote: false, silent: true });
      } catch {
        // ignore
      }
      try {
        localStorage.removeItem("jwtToken");
      } catch {
        // ignore
      }

      void router;
    }
  })();
});
