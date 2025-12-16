<template>
  <q-page class="q-pa-md">
    <h2>dreamhubb – API Test</h2>
    <p v-if="apiResponse">✅ API odpoveď: {{ apiResponse }}</p>
    <p v-else>🔄 Čakám na odpoveď z API...</p>
  </q-page>
</template>

<script setup lang="ts">
import { ref, onMounted } from "vue";
import { api } from "boot/axios";

const apiResponse = ref("");

onMounted(async () => {
  try {
    const res = await api.get("/health");
    apiResponse.value = res.data.status + " (" + res.data.environment + ")";
    if (process.env.NODE_ENV === "development") {
      console.log("✅ API dostupné:", res.data);
    }
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("❌ Chyba pri pripájaní k API:", err);
    }
  }
});
</script>
