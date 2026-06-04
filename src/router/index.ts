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
import { captureShareVisitFromRoute } from "src/utils/shareVisitCapture";

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

      // 🚪 guestOnly routes - len pre neprihlásených
      if (to.meta.guestOnly && isAuthenticated) {
        next({ name: "donor-posts" });
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
          next({ name: "donor-posts" });
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

      // 🔁 Legacy: Prihlásený používateľ na login / landing → rovno na feed
      if (
        isAuthenticated &&
        (to.name === "login" ||
          to.name === "landing" ||
          to.name === "registration" ||
          to.name === "explainers")
      ) {
        next({ name: "donor-posts" });
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
        next({ name: "donor-posts" });
      } else {
        // Vždy zavolaj next() aj v catch bloku
        next();
      }
    }
  });

  return Router;
});
