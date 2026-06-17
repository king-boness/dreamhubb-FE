<template>
  <div class="stats-Page" :class="{ 'stats-Page--iosPurchaseBlocked': iosPurchaseBlocked }">
    <div class="stats-main" :class="{ 'stats-main--iosPurchaseBlocked': iosPurchaseBlocked }">
      <div class="karmaAvailable-stats">
        <div class="karmaDisplay">
          <img src="/icons/KarmaIcon.png" alt="" />
          <span>{{ formatNumber(tokenBalance) }}</span>
        </div>
        <span>Available Tokens</span>
      </div>

      <template v-if="iosPurchaseBlocked">
        <div class="tokenShop-header tokenShop-header--blocked">
          <h2>More Tokens</h2>
        </div>
        <div class="tokenShop-unavailable" role="status" aria-live="polite">
          <p class="tokenShop-unavailableText">{{ IOS_TOKEN_PURCHASE_UNAVAILABLE_MESSAGE }}</p>
        </div>
      </template>

      <template v-else>
        <div v-if="loadError" class="tokenShop-error">
          <div class="tokenShop-errorText">{{ loadError }}</div>
          <q-btn
            class="tokenShop-retryBtn"
            unelevated
            no-caps
            color="primary"
            :disable="authStore.loading"
            @click="handleRetry"
          >
            {{ retryLabel }}
          </q-btn>
        </div>
        <div class="tokenShop-header">
          <h2>More Tokens</h2>
        </div>

        <div class="shopTable-stats">
          <button
            v-for="pkg in tokenPackages"
            :key="pkg.id"
            type="button"
            class="tokenShop-card"
            @click="openPurchaseSheet(pkg)"
          >
            <div class="cardImg">
              <img :src="pkg.img" alt="" />
            </div>
            <div class="cardDescription">
              <span
                >{{ pkg.displayName }} Tokens
                <span class="descriptionBolder"
                  >({{ formatTokenAmount(pkg.tokenAmount) }})</span
                >
              </span>
            </div>
            <div class="cardPrice">
              <span>{{ pkg.priceDisplay }}</span>
            </div>
          </button>
        </div>
      </template>
    </div>

    <!-- Web: payment method selection sheet -->
    <PaymentMethodSheet
      v-if="purchaseProvider === 'web'"
      :model-value="showPurchaseSheet"
      :selected-package="selectedPackage"
      @update:model-value="showPurchaseSheet = $event"
      @continue="onWebContinue"
    />

    <!-- iOS / Android: store purchase sheet (Apple IAP / Google Billing) -->
    <StorePurchaseSheet
      v-else-if="!iosPurchaseBlocked"
      :model-value="showPurchaseSheet"
      :selected-package="selectedPackage"
      :purchase-in-progress="isStorePurchaseInProgress"
      @update:model-value="showPurchaseSheet = $event"
      @purchase="onStorePurchase"
    />
  </div>
</template>
<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";
import { useRoute, useRouter } from "vue-router";
import { useI18n } from "vue-i18n";
import { formatNumber } from "src/components/partials/FunctionsComponent.vue";
import { useAuthStore } from "src/stores/auth";
import { mapAxiosErrorToDhError } from "src/utils/httpError";
import { tGlobal } from "src/utils/i18nGlobal";
import { usePurchasePlatform } from "src/composables/usePurchasePlatform";
import type { TokenPackage, WebPaymentMethodId } from "src/types/purchase";
import { TOKEN_PACKAGES, formatTokenAmount } from "src/config/tokenPackages";
import { notifySuccess, notifyNegative, notifyInfo } from "src/utils/notify";
import {
  isAppleIapReady,
  isIosTokenPurchaseBlocked,
  IOS_TOKEN_PURCHASE_UNAVAILABLE_MESSAGE
} from "src/services/appleIapService";
import PaymentMethodSheet from "src/components/purchase/PaymentMethodSheet.vue";
import StorePurchaseSheet from "src/components/purchase/StorePurchaseSheet.vue";

const authStore = useAuthStore();
const route = useRoute();
const router = useRouter();
const { t } = useI18n();
const {
  purchaseProvider,
  startAppleIapPurchase,
  startGoogleBillingPurchase,
  startWebCheckout
} = usePurchasePlatform();

const loadError = ref<string | null>(null);
const showPurchaseSheet = ref(false);
const selectedPackage = ref<TokenPackage | null>(null);
const isStorePurchaseInProgress = ref(false);

const tokenPackages = TOKEN_PACKAGES;
const applePluginUnavailable = ref(false);
const iosPurchaseBlocked = computed(
  () => purchaseProvider.value === "apple_iap" && isIosTokenPurchaseBlocked()
);

watch(showPurchaseSheet, (open) => {
  if (!open) {
    selectedPackage.value = null;
    nextTick(() => {
      const a = document.activeElement;
      if (a instanceof HTMLElement && a.classList.contains("tokenShop-card")) {
        a.blur();
      }
    });
  }
});

function openPurchaseSheet(pkg: TokenPackage) {
  if (iosPurchaseBlocked.value) return;
  if (applePluginUnavailable.value) {
    notifyNegative(
      "iOS payments are not available in this build yet. Rebuild iOS after cap sync/pod install.",
      { timeout: 5000 }
    );
    return;
  }
  selectedPackage.value = pkg;
  showPurchaseSheet.value = true;
}

async function onWebContinue(pkg: TokenPackage, method: WebPaymentMethodId) {
  if (import.meta.env.DEV) {
    console.debug("[token-shop] onWebContinue: start", {
      packageId: pkg.id,
      webSku: pkg.webSku,
      method
    });
  }

  const result = await startWebCheckout(pkg, method);
  if (import.meta.env.DEV) {
    console.debug("[token-shop] onWebContinue: result", result);
  }
  if (result.status === "coming_soon") {
    notifyNegative("This payment method is not available yet.", { timeout: 4000 });
  } else if (result.status === "stripe_ready" || result.status === "paypal_ready") {
    showPurchaseSheet.value = false;
    if (result.checkoutUrl) {
      if (import.meta.env.DEV) {
        console.debug("[token-shop] Redirecting to Stripe checkout", {
          checkoutUrl: result.checkoutUrl
        });
      }
      window.location.href = result.checkoutUrl;
    } else {
      notifySuccess("common.success.checkoutPrepared", "Checkout prepared. Payment will open shortly.", { timeout: 3000 });
    }
  } else if (result.status === "failed") {
    notifyNegative(result.errorMessage ?? "Something went wrong. Please try again.", { timeout: 4000 });
  }
}

async function onStorePurchase(pkg: TokenPackage) {
  if (purchaseProvider.value === "apple_iap") {
    if (iosPurchaseBlocked.value) return;
    if (applePluginUnavailable.value) {
      notifyNegative(
        "iOS payments are not available in this build yet. Rebuild iOS after cap sync/pod install.",
        { timeout: 5000 }
      );
      return;
    }
    isStorePurchaseInProgress.value = true;
    try {
      const result = await startAppleIapPurchase(pkg);
      if (result.status === "success") {
        showPurchaseSheet.value = false;
        notifySuccess("common.success.purchaseComplete", "Purchase complete. Your tokens have been added.", {});
      } else if (result.status === "cancelled") {
        showPurchaseSheet.value = false;
      } else if (result.status === "failed" || result.status === "unavailable") {
        notifyNegative(result.errorMessage ?? "Purchase failed. Please try again.", { timeout: 4000 });
      }
    } finally {
      isStorePurchaseInProgress.value = false;
    }
  } else if (purchaseProvider.value === "google_billing") {
    isStorePurchaseInProgress.value = true;
    try {
      const result = await startGoogleBillingPurchase(pkg);
      if (result.status === "success") {
        showPurchaseSheet.value = false;
        notifySuccess("common.success.purchaseComplete", "Purchase complete. Your tokens have been added.", {});
      } else if (result.status === "cancelled") {
        showPurchaseSheet.value = false;
      } else if (result.status === "failed" || result.status === "unavailable") {
        notifyNegative(result.errorMessage ?? "Purchase failed. Please try again.", { timeout: 4000 });
      }
    } finally {
      isStorePurchaseInProgress.value = false;
    }
  }
}
const retryLabel = computed(() => {
  const label = t("common.actions.retry");
  return label === "common.actions.retry" ? "Retry" : label;
});

// Use auth store tokens - must match tokenBalance in DonorMainLayout
const tokenBalance = computed(() => authStore.user?.tokens ?? 30);

// Handle return from Stripe Checkout (success/cancel) and clean URL
function handleStripeReturn() {
  const checkout = route.query.checkout as string | undefined;
  if (import.meta.env.DEV) {
    console.debug("[token-shop] handleStripeReturn", {
      checkout,
      query: route.query
    });
  }
  if (checkout === "success") {
    notifySuccess("common.success.purchaseComplete", "Purchase complete. Your tokens have been added.", { timeout: 4000 });
    if (authStore.isAuthenticated) {
      authStore
        .fetchUser()
        .then(() => {
          if (import.meta.env.DEV) {
            console.debug("[token-shop] User refreshed after Stripe success");
          }
        })
        .catch(() => {
          if (import.meta.env.DEV) {
            console.debug("[token-shop] Failed to refresh user after Stripe success");
          }
        });
    }
  } else if (checkout === "cancelled") {
    notifyInfo("common.info.paymentCancelled", "Payment was cancelled. Your tokens were not charged.", { timeout: 4000 });
  }
  if (checkout === "success" || checkout === "cancelled") {
    if (import.meta.env.DEV) {
      console.debug("[token-shop] Cleaning checkout query params from URL");
    }
    router.replace({ path: route.path, query: {} });
  }
}

// Fetch user data on mount if not loaded
onMounted(async () => {
  handleStripeReturn();
  if (purchaseProvider.value === "apple_iap" && !iosPurchaseBlocked.value) {
    applePluginUnavailable.value = !(await isAppleIapReady());
    if (applePluginUnavailable.value) {
      loadError.value = "iOS purchases are unavailable in this build (NativePurchases plugin not linked).";
    }
  }
  if (authStore.isAuthenticated && !authStore.user && !iosPurchaseBlocked.value) {
    try {
      loadError.value = null;
      await authStore.fetchUser();
    } catch (error) {
      if (import.meta.env.DEV) {
        console.debug("Failed to fetch user data:", error);
      }
      const mapped = mapAxiosErrorToDhError(error);
      loadError.value = tGlobal(mapped.messageKey, mapped.fallbackMessage);
    }
  }
});

const handleRetry = async () => {
  if (iosPurchaseBlocked.value) return;
  if (purchaseProvider.value === "apple_iap") {
    applePluginUnavailable.value = !(await isAppleIapReady());
    if (applePluginUnavailable.value) {
      loadError.value = "iOS purchases are unavailable in this build (NativePurchases plugin not linked).";
      return;
    }
  }
  if (!authStore.isAuthenticated) return;
  loadError.value = null;
  try {
    await authStore.fetchUser();
  } catch (error) {
    const mapped = mapAxiosErrorToDhError(error);
    loadError.value = tGlobal(mapped.messageKey, mapped.fallbackMessage);
  }
};
</script>

<style scoped lang="scss">
.stats-Page {
  overflow-anchor: none !important;
  scroll-snap-type: none !important;
}

.stats-Page--iosPurchaseBlocked .stats-main--iosPurchaseBlocked {
  min-height: min(72vh, 640px);
  display: flex;
  flex-direction: column;
  padding-bottom: 2rem;
}

.tokenShop-unavailable {
  width: 90%;
  max-width: 22rem;
  margin: 0.75rem auto 0;
  padding: 1.25rem 1.35rem;
  border-radius: 0.85rem;
  border: 1px solid rgba(255, 255, 255, 0.12);
  background: linear-gradient(
    180deg,
    rgba(255, 255, 255, 0.07) 0%,
    rgba(255, 255, 255, 0.04) 100%
  );
  text-align: center;
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
}

.tokenShop-unavailableText {
  margin: 0;
  font-family: poppins;
  font-size: 1rem;
  line-height: 1.55;
  color: rgba(255, 255, 255, 0.88);
}

.tokenShop-header--blocked {
  margin-top: 0.25rem;
  margin-bottom: 0.5rem;
}

.tokenShop-error {
  width: 90%;
  margin: 1rem auto 0.25rem;
  padding: 0.85rem 0.9rem;
  border-radius: 0.75rem;
  border: 1px solid rgba(255, 255, 255, 0.08);
  background: rgba(255, 255, 255, 0.04);
  color: rgba(255, 255, 255, 0.9);
  text-align: center;
}

.tokenShop-errorText {
  font-family: poppins;
  font-size: 0.9rem;
  color: rgba(255, 255, 255, 0.75);
}

.tokenShop-retryBtn {
  margin-top: 0.6rem;
}

.stats-main:not(.stats-main--iosPurchaseBlocked) {
  min-height: 740px;
}

.karmaAvailable-stats {
  background: rgba(47, 42, 42, 0.499);
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 90%;
  height: 3rem;
  border: 0.01rem solid rgb(90, 14, 41);
  border-radius: 0.7rem;
  padding: 0 1rem;
  margin: 2rem auto;

  .karmaDisplay {
    display: flex;
    align-items: center;
    width: 5rem;
    justify-content: space-around;

    img {
      height: 1.2rem;
      margin-right: 0.4rem;
    }

    span {
      font-family: poppinsBold;
      color: #f3f3f3aa;
      font-size: 1.1rem;
    }
  }

  span {
    color: white;
    font-family: poppinsSemiBold;
    font-size: 1rem;
  }
}

.tokenShop-header {
  display: flex;
  justify-content: center;

  h2 {
    margin: 0 auto;
    color: white;
    font-size: 2rem;
    font-family: poppinsSemiBold;
  }

  margin-bottom: 1rem;
}

.shopTable-stats {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 16px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;
  padding: 0 1rem;
  margin: 0 auto 3.5rem;
  align-items: stretch;
}

.shopTable-stats .tokenShop-card {
  box-sizing: border-box;
  min-width: 0;
  width: 100%;
  margin: 0;
  background: linear-gradient(
    268.92deg,
    rgba(73, 54, 97, 0.338) 2.69%,
    rgba(36, 27, 36, 0.544) 100%
  );
  backdrop-filter: blur(10px);
  display: flex;
  min-height: 11rem;
  height: auto;
  border-radius: 1rem;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  border: none;
  cursor: pointer;
  padding: 0.6rem 0.35rem;
  text-align: center;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
  -webkit-tap-highlight-color: transparent;

  &:focus {
    outline: none;
  }

  &:focus-visible {
    outline: 2px solid $primary;
    outline-offset: 2px;
  }

  &:active {
    transform: translateY(0);
    box-shadow: none;
  }

  .cardImg {
    img {
      height: 2.5rem;
    }
  }

  .cardDescription {
    color: $primary;
    font-size: 1.1rem;
    text-align: center;
    padding: 0 0.5rem;
    text-transform: none;

    .descriptionBolder {
      font-family: poppinsBold !important;
    }
  }

  .cardPrice {
    color: white;
    font-family: poppinsSemiBold;
    font-size: 1.2rem;
    margin-top: 0.2rem;
  }
}

@media (hover: hover) and (pointer: fine) {
  .shopTable-stats .tokenShop-card:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
  }
}
</style>

<style lang="scss">
/* Scoped `.tokenShop-header h2` beats global `.body--light h2` */
.body--light .stats-Page .tokenShop-header h2 {
  color: #1a1a1a !important;
}

.body--light .stats-Page .shopTable-stats .tokenShop-card .cardPrice {
  color: #1a1a1a !important;
}

.body--light .stats-Page .karmaAvailable-stats .karmaDisplay span,
.body--light .stats-Page .karmaAvailable-stats > span {
  color: #1a1a1a !important;
}

.body--light .stats-Page .tokenShop-unavailableText {
  color: #333333 !important;
}

.body--light .stats-Page--iosPurchaseBlocked .tokenShop-unavailable {
  border-color: rgba(0, 0, 0, 0.08);
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.04) 0%,
    rgba(0, 0, 0, 0.02) 100%
  );
}
</style>
