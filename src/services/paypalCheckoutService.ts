/**
 * PayPal web checkout service – builds payload, calls backend to create order, returns redirect URL or result.
 * Used only on web; iOS/Android use store-specific flows.
 */
import { api } from "boot/axios";
import { type TokenPackage, type WebPaymentMethodId, PURCHASE_PAYLOAD_CURRENCY } from "src/types/purchase";
import type { PayPalWebCheckoutPayload } from "src/types/paypalCheckout";
import type { PaymentSessionSuccessResponse } from "src/types/paymentsApi";
import type { WebCheckoutResult } from "src/types/stripeCheckout";

/**
 * Build web checkout payload for PayPal / Laravel.
 * Contains packageId, webSku, selectedMethod: "paypal", tokenAmount, price, currency, provider, platform.
 */
export function buildPayPalWebCheckoutPayload(pkg: TokenPackage): PayPalWebCheckoutPayload {
  return {
    packageId: pkg.id,
    provider: "web",
    platform: "web",
    webSku: pkg.webSku,
    selectedMethod: "paypal",
    tokenAmount: pkg.tokenAmount,
    price: pkg.price,
    currency: PURCHASE_PAYLOAD_CURRENCY
  };
}

/**
 * Whether the given method is the PayPal payment method.
 */
export function isPayPalSupportedMethod(method: WebPaymentMethodId): boolean {
  return method === "paypal";
}

/**
 * Start PayPal checkout flow. Calls backend POST /payments/paypal/order; on success returns paypal_ready with checkoutUrl for redirect.
 */
export async function startPayPalCheckoutFlow(pkg: TokenPackage): Promise<WebCheckoutResult> {
  try {
    const payload = buildPayPalWebCheckoutPayload(pkg);
    if (import.meta.env.DEV) {
      console.debug("[PayPalCheckout] Request payload:", payload);
    }
    const { data } = await api.post<PaymentSessionSuccessResponse>("/payments/paypal/order", payload);
    const checkoutUrl = data?.checkoutUrl && typeof data.checkoutUrl === "string" ? data.checkoutUrl : undefined;
    if (checkoutUrl) {
      if (import.meta.env.DEV) {
        console.debug("[PayPalCheckout] Order created, redirect URL received");
      }
      return { status: "paypal_ready", payload, checkoutUrl };
    }
    return { status: "paypal_ready", payload };
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } }; message?: string };
    const message =
      err?.response?.data?.message && typeof err.response.data.message === "string"
        ? err.response.data.message
        : err?.message && typeof err.message === "string"
          ? err.message
          : String(e);
    if (import.meta.env.DEV) {
      console.debug("[PayPalCheckout] Error", e);
    }
    return { status: "failed", errorMessage: message };
  }
}
