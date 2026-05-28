/**
 * Stripe web checkout service – builds payload, calls backend to create session, returns redirect URL or result.
 * Used only on web; iOS/Android use store-specific flows.
 */
import { api } from "boot/axios";
import { type TokenPackage, type WebPaymentMethodId, PURCHASE_PAYLOAD_CURRENCY } from "src/types/purchase";
import type { PaymentSessionSuccessResponse } from "src/types/paymentsApi";
import type { StripeWebCheckoutPayload, WebCheckoutResult } from "src/types/stripeCheckout";
import { STRIPE_SUPPORTED_METHODS } from "src/types/stripeCheckout";

/**
 * Build web checkout payload for Stripe / Laravel.
 * Contains packageId, webSku, selectedMethod, tokenAmount, price, currency, provider, platform.
 */
export function buildStripeWebCheckoutPayload(
  pkg: TokenPackage,
  selectedMethod: WebPaymentMethodId
): StripeWebCheckoutPayload {
  return {
    packageId: pkg.id,
    provider: "web",
    platform: "web",
    webSku: pkg.webSku,
    selectedMethod,
    tokenAmount: pkg.tokenAmount,
    price: pkg.price,
    currency: PURCHASE_PAYLOAD_CURRENCY
  };
}

/**
 * Whether the given method is supported by the current Stripe flow.
 */
export function isStripeSupportedMethod(method: WebPaymentMethodId): boolean {
  return STRIPE_SUPPORTED_METHODS.includes(method);
}

/**
 * Start web checkout flow. Calls backend POST /payments/stripe/session; on success returns stripe_ready with checkoutUrl for redirect.
 * For other methods returns coming_soon.
 */
export async function startStripeCheckoutFlow(
  pkg: TokenPackage,
  method: WebPaymentMethodId
): Promise<WebCheckoutResult> {
  if (!isStripeSupportedMethod(method)) {
    return { status: "coming_soon" };
  }
  try {
    const payload = buildStripeWebCheckoutPayload(pkg, method);
    if (import.meta.env.DEV) {
      console.debug("[StripeCheckout] Request payload:", payload);
    }
    const { data } = await api.post<PaymentSessionSuccessResponse>("/payments/stripe/session", payload);
    const checkoutUrl = data?.checkoutUrl && typeof data.checkoutUrl === "string" ? data.checkoutUrl : undefined;
    if (checkoutUrl) {
      if (import.meta.env.DEV) {
        console.debug("[StripeCheckout] Session created, redirect URL received");
      }
      return { status: "stripe_ready", payload, checkoutUrl };
    }
    return { status: "stripe_ready", payload };
  } catch (e: unknown) {
    const err = e as { response?: { data?: { message?: string } }; message?: string };
    const message =
      err?.response?.data?.message && typeof err.response.data.message === "string"
        ? err.response.data.message
        : err?.message && typeof err.message === "string"
          ? err.message
          : String(e);
    if (import.meta.env.DEV) {
      console.debug("[StripeCheckout] Error", e);
    }
    return { status: "failed", errorMessage: message };
  }
}
