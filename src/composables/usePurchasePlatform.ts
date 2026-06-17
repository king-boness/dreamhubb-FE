/**
 * Platform-aware purchase flow – determines which purchase provider to use
 * (Apple IAP, Google Play Billing, or web checkout) and runs the correct handler with product ids.
 */
import { computed } from "vue";
import { Capacitor } from "@capacitor/core";
import type { TokenPackage, WebPaymentMethodId } from "src/types/purchase";
import {
  isIosTokenPurchaseBlocked,
  IOS_TOKEN_PURCHASE_UNAVAILABLE_MESSAGE,
  purchaseApplePackage
} from "src/services/appleIapService";
import { purchaseGooglePackage } from "src/services/googleBillingService";
import { isPayPalSupportedMethod, startPayPalCheckoutFlow } from "src/services/paypalCheckoutService";
import { startStripeCheckoutFlow } from "src/services/stripeCheckoutService";
import type { AppleIapPurchaseResult } from "src/types/appleIap";
import type { GoogleBillingPurchaseResult } from "src/types/googleBilling";
import type { WebCheckoutResult } from "src/types/stripeCheckout";

export type PurchaseProvider = "apple_iap" | "google_billing" | "web";

function getPlatform(): "ios" | "android" | "web" {
  if (typeof window === "undefined") return "web";
  const cap = Capacitor as unknown as { getPlatform?: () => string; isNativePlatform?: () => boolean };
  if (!cap?.isNativePlatform?.()) return "web";
  const platform = cap.getPlatform?.() ?? "web";
  if (platform === "ios") return "ios";
  if (platform === "android") return "android";
  return "web";
}

/**
 * Returns the purchase provider for the current platform.
 * - iOS native app → apple_iap (Apple In-App Purchase)
 * - Android native app → google_billing (Google Play Billing)
 * - Web (or unknown) → web (Stripe/PayPal/etc.)
 */
export function usePurchasePlatform() {
  const platform = computed<"ios" | "android" | "web">(() => getPlatform());

  const purchaseProvider = computed<PurchaseProvider>(() => {
    const p = platform.value;
    if (p === "ios") return "apple_iap";
    if (p === "android") return "google_billing";
    return "web";
  });

  /**
   * Start Apple IAP flow (iOS only). Calls appleIapService; returns result for UI (close sheet, toast).
   * On success, backend payload is built and logged; Laravel POST is prepared in the service.
   */
  async function startAppleIapPurchase(pkg: TokenPackage): Promise<AppleIapPurchaseResult> {
    if (isIosTokenPurchaseBlocked()) {
      return {
        status: "unavailable",
        errorMessage: IOS_TOKEN_PURCHASE_UNAVAILABLE_MESSAGE
      };
    }
    return purchaseApplePackage(pkg);
  }

  /**
   * Start Google Play Billing flow (Android only). Calls googleBillingService; returns result for UI (close sheet, toast).
   * On success, backend payload is built and logged; Laravel POST is prepared in the service.
   */
  async function startGoogleBillingPurchase(pkg: TokenPackage): Promise<GoogleBillingPurchaseResult> {
    return purchaseGooglePackage(pkg);
  }

  /**
   * Start web checkout with selected payment method.
   * Card / Apple Pay / Google Pay → Stripe-ready flow.
   * PayPal → PayPal-ready flow.
   * Other methods → returns coming_soon for UI to show placeholder message.
   */
  async function startWebCheckout(pkg: TokenPackage, method: WebPaymentMethodId): Promise<WebCheckoutResult> {
    if (isPayPalSupportedMethod(method)) {
      return startPayPalCheckoutFlow(pkg);
    }
    return startStripeCheckoutFlow(pkg, method);
  }

  return {
    platform,
    purchaseProvider,
    startAppleIapPurchase,
    startGoogleBillingPurchase,
    startWebCheckout
  };
}
