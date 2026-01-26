import { boot } from "quasar/wrappers";
import { api } from "./axios";
import { AxiosError } from "axios";
import { useAuthStore } from "src/stores/auth";

export default boot(async ({ router }) => {
  // Guard: if there is no token, do NOT call /user (prevents noisy warnings on auth screens).
  const authStore = useAuthStore();

  const TOKEN_KEY = "token"; // current canonical key used by auth store + axios boot
  const LEGACY_TOKEN_KEY = "jwtToken"; // old key from legacy boot logic

  const token = localStorage.getItem(TOKEN_KEY);
  const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);

  // Clean up legacy key silently (no verify calls when user is logged out)
  if (!token) {
    if (legacyToken) {
      localStorage.removeItem(LEGACY_TOKEN_KEY);
    }
    return;
  }

  try {
    // Silent token validity check (should be fast; /user already exists and is used across the app)
    const response = await api.get("/user");

    if (response.data?.status === "success" && response.data?.user) {
      if (import.meta.env.DEV) {
        console.debug("[boot/auth] Token valid:", response.data.user?.username);
      }
      return;
    }

    // Unexpected shape -> treat as invalid session
    await authStore.logout({ remote: false, silent: true });
    localStorage.removeItem(LEGACY_TOKEN_KEY);
  } catch (error) {
    // Requirement: on verify failure (401/403 OR network/CORS/timeout) -> silent fallback:
    // clear token + user and stay on auth screen (no console.warn/error).
    const axiosError = error as AxiosError;

    if (import.meta.env.DEV) {
      const msg = axiosError?.message || "Unknown error";
      console.debug("[boot/auth] Silent token verify failed; clearing session:", msg);
    }

    await authStore.logout({ remote: false, silent: true });
    localStorage.removeItem(LEGACY_TOKEN_KEY);

    // No redirects here; keep UX stable on auth pages.
    // If app wants routing decisions, it should be handled by route guards / layouts.
    void router;
  }
});
