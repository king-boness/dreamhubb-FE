<template>
  <router-view />
</template>

<script setup lang="ts">
import { useQuasar } from "quasar";

const $q = useQuasar();
$q.dark.set(true);

// -------------------------------------------------------
// ❗️ ŽIADNY autoLogin, žiadne logout, žiadny redirect
// -------------------------------------------------------

// 🧩 Test integrácie Pinia (necháme iba debug)
import { useAuthStore } from "src/stores/useAuthStore";
const auth = useAuthStore();

console.log("🧠 Pinia Auth Store loaded:", auth);
</script>
