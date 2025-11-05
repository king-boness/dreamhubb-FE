import { route } from "quasar/wrappers";
import {
  createMemoryHistory,
  createRouter,
  createWebHashHistory,
  createWebHistory
} from "vue-router";
import { useUserStore } from "src/stores/user-store";

import routes from "./routes";

/*
 * If not building with SSR mode, you can
 * directly export the Router instantiation;
 *
 * The function below can be async too; either use
 * async/await or return a Promise which resolves
 * with the Router instance.
 */

export default route(function (/* { store, ssrContext } */) {
  const createHistory = process.env.SERVER
    ? createMemoryHistory
    : (process.env.VUE_ROUTER_MODE === "history" ? createWebHistory : createWebHashHistory);

  const Router = createRouter({
    scrollBehavior: () => ({ left: 0, top: 0 }),
    routes,

    // Leave this as is and make changes in quasar.conf.js instead!
    // quasar.conf.js -> build -> vueRouterMode
    // quasar.conf.js -> build -> publicPath
    history: createHistory(process.env.VUE_ROUTER_BASE)
  });
  Router.beforeEach((to, from, next) => {
    const userStore = useUserStore();
    const token = userStore.token || localStorage.getItem("jwtToken") || "";

    // Splash screen - vždy umožniť, nechá sa na komponente rozhodnúť
    if (to.name === "splash") {
      next();
      return;
    }

    // Pôvodná logika pre requiresAuth
    if (to.meta.requiresAuth && !token) {
      next({ name: "login" });
      return;
    }

    // Ak má token a je na auth stránkach, presmerovať na home
    if (token !== "" && (to.name === "landing" || to.name === "login" || to.name === "registration" || to.name === "explainers")) {
      next({ name: "donor-posts" });
      return;
    }

    // Fallback guard: ak route neexistuje (404) a používateľ nie je prihlásený, redirect na login
    if (!to.matched.length && !token) {
      next({ name: "login" });
      return;
    }

    // Ak route neexistuje, ale má token, možno nechať Vue router riešiť 404
    next();
  });

  return Router;
});
