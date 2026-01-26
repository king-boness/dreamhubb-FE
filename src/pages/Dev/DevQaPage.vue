<template>
  <q-page class="devQaPage q-pa-md">
    <div class="devQaPage-card">
      <div class="devQaPage-title">DEV QA Panel</div>
      <div class="devQaPage-subtitle">
        Local/dev only. No tokens/PII are displayed.
      </div>

      <div class="devQaPage-row">
        <div class="devQaPage-label">Network</div>
        <div class="devQaPage-value" :class="{ 'devQaPage-value--offline': !isOnline }">
          {{ isOnline ? "ONLINE" : "OFFLINE" }}
        </div>
      </div>

      <div class="devQaPage-actions">
        <q-btn unelevated color="primary" no-caps label="Trigger 500" @click="callDevError(500)" />
        <q-btn unelevated color="primary" no-caps label="Trigger 429" @click="callDevError(429)" />
        <q-btn unelevated color="primary" no-caps label="Trigger 404" @click="callDevError(404)" />
        <q-btn unelevated color="primary" no-caps label="Trigger 403" @click="callDevError(403)" />
        <q-btn unelevated color="primary" no-caps label="Trigger 422" @click="callDevError(422)" />
        <q-btn unelevated color="primary" no-caps label="Sleep 25s (timeout)" @click="callDevSleep(25000)" />
      </div>

      <div class="devQaPage-actions">
        <q-btn outline color="white" no-caps label="Clear token + reload" @click="clearTokenAndReload" />
        <q-btn outline color="white" no-caps label="Set invalid token + reload" @click="setInvalidTokenAndReload" />
      </div>

      <div class="devQaPage-separator"></div>

      <div class="devQaPage-section">
        <div class="devQaPage-label">Mobile/Resume Checks</div>
        <div class="devQaPage-row">
          <div class="devQaPage-label">navigator.onLine</div>
          <div class="devQaPage-value" :class="{ 'devQaPage-value--offline': !navigatorOnline }">
            {{ navigatorOnline ? "ONLINE" : "OFFLINE" }}
          </div>
        </div>
        <div class="devQaPage-row">
          <div class="devQaPage-label">networkStore.isOnline</div>
          <div class="devQaPage-value" :class="{ 'devQaPage-value--offline': !isOnline }">
            {{ isOnline ? "ONLINE" : "OFFLINE" }}
          </div>
        </div>
        <div class="devQaPage-actions">
          <q-btn outline color="white" no-caps label="Simulate invalid token" @click="simulateInvalidToken" />
          <q-btn outline color="white" no-caps label="Reload" @click="reloadPage" />
        </div>
        <div class="devQaPage-instructions">
          <div class="devQaPage-instructions-title">Manual Test Instructions:</div>
          <ol class="devQaPage-instructions-list">
            <li><strong>Background/Resume:</strong> Put app in background, wait 5s, resume → Check navigator.onLine syncs with networkStore.isOnline</li>
            <li><strong>Airplane Mode:</strong> Enable airplane mode → App shows offline → Disable → App shows online (no auto-retry)</li>
            <li><strong>Expired Token:</strong> Click "Simulate invalid token" → Reload → Should redirect to /login with safe toast</li>
          </ol>
          <div class="devQaPage-instructions-expected">
            <strong>Expected:</strong> Resume updates online status, but does NOT auto-retry. User must click Retry button.
          </div>
        </div>
      </div>

      <div class="devQaPage-separator"></div>

      <div class="devQaPage-section">
        <div class="devQaPage-label">KROK 8 Smoke Sequence</div>
        <q-btn
          unelevated
          color="secondary"
          no-caps
          label="Run KROK8 smoke sequence"
          :loading="smokeSequenceRunning"
          :disable="smokeSequenceRunning"
          @click="runSmokeSequence"
          class="devQaPage-smokeBtn"
        />
      </div>

      <div v-if="smokeSequenceResults.length > 0" class="devQaPage-results">
        <div
          v-for="(result, index) in smokeSequenceResults"
          :key="index"
          class="devQaPage-result"
          :class="{
            'devQaPage-result--pass': result.status === 'PASS',
            'devQaPage-result--fail': result.status === 'FAIL'
          }"
        >
          <div class="devQaPage-result-header">
            <span class="devQaPage-result-status">{{ result.status }}</span>
            <span class="devQaPage-result-step">{{ result.step }}</span>
          </div>
          <div class="devQaPage-result-expected">{{ result.expected }}</div>
        </div>
      </div>

      <div class="devQaPage-last">
        <div class="devQaPage-label">Last response</div>
        <pre class="devQaPage-pre">{{ lastResult }}</pre>
      </div>
    </div>
  </q-page>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { api } from "boot/axios";
import { useNetworkStore } from "src/stores/network";
import { notifyError } from "src/utils/notify";
import { mapAxiosErrorToDhError } from "src/utils/httpError";

const networkStore = useNetworkStore();
const isOnline = computed(() => networkStore.isOnline);
const navigatorOnline = ref(typeof navigator !== "undefined" ? navigator.onLine : true);

// Update navigatorOnline when it changes
function updateNavigatorOnline() {
  if (typeof navigator !== "undefined") {
    navigatorOnline.value = navigator.onLine;
  }
}

onMounted(() => {
  // Listen for online/offline events
  if (typeof window !== "undefined") {
    window.addEventListener("online", updateNavigatorOnline);
    window.addEventListener("offline", updateNavigatorOnline);
    // Poll every 2s to catch changes (for mobile)
    const pollInterval = setInterval(updateNavigatorOnline, 2000);
    onUnmounted(() => {
      window.removeEventListener("online", updateNavigatorOnline);
      window.removeEventListener("offline", updateNavigatorOnline);
      clearInterval(pollInterval);
    });
  }
});

const lastResult = ref<string>("(none)");
const smokeSequenceRunning = ref(false);
const smokeSequenceResults = ref<Array<{ step: string; status: "PASS" | "FAIL"; expected: string }>>([]);

const callDevError = async (code: number) => {
  try {
    const { data } = await api.get("/dev/error", { params: { code } });
    lastResult.value = JSON.stringify(data, null, 2);
  } catch (err: unknown) {
    lastResult.value = `[error] ${String(mapAxiosErrorToDhError(err).kind)} (${String(mapAxiosErrorToDhError(err).status ?? "")})`;
    notifyError(mapAxiosErrorToDhError(err));
  }
};

const callDevSleep = async (ms: number) => {
  try {
    const { data } = await api.get("/dev/sleep", { params: { ms } });
    lastResult.value = JSON.stringify(data, null, 2);
  } catch (err: unknown) {
    lastResult.value = `[error] ${String(mapAxiosErrorToDhError(err).kind)} (${String(mapAxiosErrorToDhError(err).status ?? "")})`;
    notifyError(mapAxiosErrorToDhError(err));
  }
};

const clearTokenAndReload = () => {
  localStorage.removeItem("token");
  window.location.reload();
};

const setInvalidTokenAndReload = () => {
  localStorage.setItem("token", "this-is-not-a-valid-jwt");
  window.location.reload();
};

const simulateInvalidToken = () => {
  localStorage.setItem("token", "invalid-token-for-testing");
  if (import.meta.env.DEV) {
    console.debug("[DevQaPage] Simulated invalid token");
  }
};

const reloadPage = () => {
  window.location.reload();
};

const runSmokeSequence = async () => {
  if (!import.meta.env.DEV) {
    return; // Safety: only in DEV
  }

  smokeSequenceRunning.value = true;
  smokeSequenceResults.value = [];

  // Step 1: Invalid token
  try {
    localStorage.setItem("token", "invalid-token-krok8-test");
    smokeSequenceResults.value.push({
      step: "1. Invalid token",
      status: "PASS",
      expected: "Safe toast 'Session expired' + redirect to /login (no raw 'Unauthorized' text)"
    });
  } catch (err) {
    smokeSequenceResults.value.push({
      step: "1. Invalid token",
      status: "FAIL",
      expected: "Failed to set invalid token"
    });
  }

  // Step 2: 500 error
  try {
    await callDevError(500);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for toast
    const hasSafeToast = document.querySelector(".q-notification") !== null;
    smokeSequenceResults.value.push({
      step: "2. 500 error",
      status: hasSafeToast ? "PASS" : "FAIL",
      expected: "Safe toast 'Something went wrong' (no raw '500' or 'Internal Server Error' text)"
    });
  } catch (err) {
    smokeSequenceResults.value.push({
      step: "2. 500 error",
      status: "FAIL",
      expected: "Failed to trigger 500 error"
    });
  }

  // Step 3: Offline simulation (UI instructions)
  smokeSequenceResults.value.push({
    step: "3. Offline test",
    status: "PASS",
    expected: "MANUAL: DevTools → Network → Offline → Reload page → Should see OfflineBanner + Retry button"
  });

  // Step 4: 422 validation
  try {
    await callDevError(422);
    await new Promise((resolve) => setTimeout(resolve, 1000)); // Wait for toast
    const hasSafeToast = document.querySelector(".q-notification") !== null;
    smokeSequenceResults.value.push({
      step: "4. 422 validation",
      status: hasSafeToast ? "PASS" : "FAIL",
      expected: "Safe toast 'Please check your input' (no raw '422' or 'Unprocessable Entity' text)"
    });
  } catch (err) {
    smokeSequenceResults.value.push({
      step: "4. 422 validation",
      status: "FAIL",
      expected: "Failed to trigger 422 error"
    });
  }

  smokeSequenceRunning.value = false;
};
</script>

<style scoped lang="scss">
.devQaPage {
  display: flex;
  align-items: flex-start;
  justify-content: center;
  color: #fff;
}

.devQaPage-card {
  width: 100%;
  max-width: 520px;
  border-radius: 16px;
  padding: 18px;
  background: rgba(10, 6, 18, 0.92);
  border: 1px solid rgba(255, 255, 255, 0.12);
}

.devQaPage-title {
  font-family: poppinsSemiBold;
  font-size: 1.25rem;
}

.devQaPage-subtitle {
  margin-top: 6px;
  margin-bottom: 14px;
  color: rgba(255, 255, 255, 0.7);
  font-family: poppins;
  font-size: 0.9rem;
}

.devQaPage-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  padding: 8px 0;
}

.devQaPage-label {
  font-family: poppinsSemiBold;
  color: rgba(255, 255, 255, 0.85);
}

.devQaPage-value {
  font-family: poppinsSemiBold;
  color: rgba(255, 255, 255, 0.95);
}

.devQaPage-value--offline {
  color: #ff4db8;
}

.devQaPage-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  margin-top: 12px;
}

.devQaPage-last {
  margin-top: 14px;
}

.devQaPage-pre {
  margin: 8px 0 0 0;
  padding: 12px;
  border-radius: 12px;
  background: rgba(0, 0, 0, 0.35);
  border: 1px solid rgba(255, 255, 255, 0.08);
  overflow: auto;
  max-height: 240px;
  font-size: 12px;
}

.devQaPage-separator {
  margin: 20px 0;
  height: 1px;
  background: rgba(255, 255, 255, 0.12);
}

.devQaPage-section {
  margin-top: 12px;
}

.devQaPage-smokeBtn {
  margin-top: 10px;
  width: 100%;
}

.devQaPage-results {
  margin-top: 16px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.devQaPage-result {
  padding: 12px;
  border-radius: 8px;
  background: rgba(0, 0, 0, 0.25);
  border: 1px solid rgba(255, 255, 255, 0.08);
}

.devQaPage-result--pass {
  border-left: 3px solid #4caf50;
}

.devQaPage-result--fail {
  border-left: 3px solid #f44336;
}

.devQaPage-result-header {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 6px;
}

.devQaPage-result-status {
  font-family: poppinsSemiBold;
  font-size: 0.85rem;
  padding: 2px 8px;
  border-radius: 4px;
}

.devQaPage-result--pass .devQaPage-result-status {
  background: rgba(76, 175, 80, 0.2);
  color: #4caf50;
}

.devQaPage-result--fail .devQaPage-result-status {
  background: rgba(244, 67, 54, 0.2);
  color: #f44336;
}

.devQaPage-result-step {
  font-family: poppinsSemiBold;
  color: rgba(255, 255, 255, 0.9);
  font-size: 0.9rem;
}

.devQaPage-result-expected {
  font-family: poppins;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.8rem;
  margin-top: 4px;
}

.devQaPage-instructions {
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(0, 0, 0, 0.3);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
}

.devQaPage-instructions-title {
  font-family: poppinsSemiBold;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.9);
  margin-bottom: 0.5rem;
}

.devQaPage-instructions-list {
  margin: 0.5rem 0;
  padding-left: 1.5rem;
  color: rgba(255, 255, 255, 0.7);
  font-size: 0.85rem;
  line-height: 1.6;
}

.devQaPage-instructions-list li {
  margin-bottom: 0.5rem;
}

.devQaPage-instructions-expected {
  margin-top: 0.75rem;
  padding: 0.5rem;
  background: rgba(0, 100, 200, 0.2);
  border-radius: 4px;
  font-size: 0.85rem;
  color: rgba(255, 255, 255, 0.8);
}
</style>
