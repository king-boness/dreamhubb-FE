// src/router/index.ts
import { route } from "quasar/wrappers";
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from "vue-router";

import routes from "./routes";
import { useAuthStore } from "src/stores/auth";
import { usePreferencesStore } from "src/stores/preferences";
import { captureShareVisitFromRoute } from "src/utils/shareVisitCapture";
import { readStoredSidePreferences, resolvePostAuthRedirect } from "src/utils/postAuthRedirect";
import {
  waitForAuthSessionSettled,
  waitForAuthUserId
} from "src/utils/authSessionReady";

async function resolveAuthenticatedHome(piniaStore: unknown) {
  try {
    let userId: number | null = null;
    if (piniaStore) {
      const authStore = useAuthStore(piniaStore as never);
      const hasToken = !!(authStore.token || localStorage.getItem("token"));
      if (hasToken && authStore.user?.id == null) {
        await waitForAuthSessionSettled(8000);
        userId = await waitForAuthUserId(
          () => authStore.user?.id ?? null,
          () => authStore.token || localStorage.getItem("token"),
          5000
        );
      } else {
        userId = authStore.user?.id ?? null;
      }
      const preferencesStore = usePreferencesStore(piniaStore as never);
      preferencesStore.hydrateFromStorage();
    }
    const storedSides = readStoredSidePreferences(userId);
    return resolvePostAuthRedirect({
      currentSide: storedSides.currentSide,
      onboardingInitialSide: storedSides.onboardingInitialSide
    });
  } catch {
    return resolvePostAuthRedirect();
  }
}

export default route(function ({ store }) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === "history"
        ? createWebHistory
        : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,
    history: createHistory(process.env.VUE_ROUTER_BASE)
  });

  // Debug: Check if postCreation picker routes exist
  if (typeof import.meta !== "undefined" && import.meta.env?.DEV === true) {
    const hasPickerRoute = Router.getRoutes().some(
      (r) => r.path === "/donee/postCreation/category" || r.name === "donee-postCreation-category"
    );
    console.debug("[router] has postCreation category route:", hasPickerRoute);
  }

  if (typeof import.meta !== "undefined" && import.meta.env?.DEV === true) {
    let firstNavLogged = false;
    Router.beforeEach((to, from, next) => {
      if (!firstNavLogged) {
        firstNavLogged = true;
        console.info("[router-bootstrap] first navigation", {
          toName: String(to.name || ""),
          toPath: to.path,
          fromName: String(from.name || ""),
          fromPath: from.path
        });
      }
      next();
    });

    Router.onError((error, to, from) => {
      console.error("[router-bootstrap] router.onError", {
        toName: String(to?.name || ""),
        toPath: to?.path || "",
        fromName: String(from?.name || ""),
        fromPath: from?.path || "",
        errorMessage: error instanceof Error ? error.message : String(error),
        errorStack: error instanceof Error ? error.stack : undefined,
        rawError: error
      });
    });
  }

  Router.beforeEach((to, from, next) => {
    captureShareVisitFromRoute(to);

    try {
      // Použiť authStore.isAuthenticated
      let isAuthenticated = false;
      const hasToken = !!localStorage.getItem("token");

      try {
        if (store) {
          const authStore = useAuthStore(store);
          isAuthenticated = authStore.isAuthenticated || hasToken;
        } else {
          isAuthenticated = hasToken;
        }
      } catch (storeError) {
        // Ak store nie je pripravený, použij len localStorage
        isAuthenticated = hasToken;
      }

      // 🌀 Splash screen – vždy povolený
      if (to.name === "splash") {
        next();
        return;
      }

      // Public share opener – visit + redirect handled in OpenSharePage (not auth-gated)
      if (to.name === "open-share") {
        next();
        return;
      }

      if (to.name === "support" || to.name === "privacy-policy" || to.name === "terms-of-use") {
        next();
        return;
      }

      // 🚪 guestOnly routes - len pre neprihlásených
      if (to.meta.guestOnly && isAuthenticated) {
        void resolveAuthenticatedHome(store).then((loc) => next(loc));
        return;
      }

      // 🔐 requiresAuth routes - len pre prihlásených
      if (to.meta.requiresAuth && !isAuthenticated) {
        next({ name: "auth-welcome-page" });
        return;
      }

      // 🏠 Root path redirect
      if (to.path === "/" && to.name !== "splash") {
        if (isAuthenticated) {
          void resolveAuthenticatedHome(store).then((loc) => next(loc));
        } else {
          next({ name: "auth-welcome-page" });
        }
        return;
      }

      // Ak navigujeme na auth-welcome parent route, presmerovať na child route
      if (to.name === "auth-welcome" && to.path === "/auth" && !to.matched.some(record => record.name === "auth-welcome-page")) {
        // Presmerovať na child route, aby sa komponent načítal
        next({ name: "auth-welcome-page" });
        return;
      }

      // 🔁 Legacy: Prihlásený používateľ na login / landing → rovno na feed podľa strany
      if (
        isAuthenticated &&
        (to.name === "login" ||
          to.name === "landing" ||
          to.name === "registration" ||
          to.name === "explainers")
      ) {
        void resolveAuthenticatedHome(store).then((loc) => next(loc));
        return;
      }

      // Vždy zavolaj next() - aj keď nie je žiadna špeciálna logika
      next();
    } catch (error) {
      // Fallback: ak je problém s store, použij len localStorage
      const hasToken = !!localStorage.getItem("token");
      if (to.meta.requiresAuth && !hasToken) {
        next({ name: "auth-welcome-page" });
      } else if (to.meta.guestOnly && hasToken) {
        void resolveAuthenticatedHome(store).then((loc) => next(loc));
      } else {
        // Vždy zavolaj next() aj v catch bloku
        next();
      }
    }
  });

  return Router;
});
