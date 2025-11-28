// src/stores/index.ts
import { store } from "quasar/wrappers";
import { createPinia } from "pinia";

export default store(() => {
  const pinia = createPinia();

  // Router bude dostupný cez window.location alebo dynamický import v logout metóde

  return pinia;
});
