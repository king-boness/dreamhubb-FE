import { boot } from "quasar/wrappers";
import { useAuthStore } from "src/stores/auth";
import { markAuthSessionSettled, runColdStartAuthProbe } from "src/utils/authSessionReady";

export default boot(({ router }) => {
  // Non-blocking: join single-flight cold-start probe (shared with App.initializeApp).
  // Do NOT mark settled here on a private /user race — that prematurely unblocked redirects.
  void (async () => {
    const TOKEN_KEY = "token";
    const LEGACY_TOKEN_KEY = "jwtToken";

    const token = localStorage.getItem(TOKEN_KEY);
    const legacyToken = localStorage.getItem(LEGACY_TOKEN_KEY);

    if (!token) {
      if (legacyToken) {
        localStorage.removeItem(LEGACY_TOKEN_KEY);
      }
      // No session to verify — safe to settle immediately.
      markAuthSessionSettled();
      void router;
      return;
    }

    await runColdStartAuthProbe(async () => {
      const authStore = useAuthStore();
      try {
        await authStore.fetchUser();
        if (import.meta.env.DEV && authStore.user) {
          console.debug("[boot/auth] Token valid:", authStore.user?.username);
        }
      } catch (error) {
        if (import.meta.env.DEV) {
          const msg = error instanceof Error ? error.message : "Unknown error";
          console.debug("[boot/auth] Silent token verify failed; clearing session:", msg);
        }
        try {
          await authStore.logout({ remote: false, silent: true });
        } catch {
          // ignore
        }
        try {
          localStorage.removeItem(LEGACY_TOKEN_KEY);
        } catch {
          // ignore
        }
      }
    });

    void router;
  })();
});
