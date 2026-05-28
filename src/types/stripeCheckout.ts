/**
 * Stripe web checkout – types and payload for Laravel/Stripe integration.
 * Used by the web purchase flow; backend will create Stripe session and validate payment.
 */
import type { WebPaymentMethodId } from "src/types/purchase";
import type { PayPalWebCheckoutPayload } from "src/types/paypalCheckout";

/** Payment methods supported by Stripe in the first phase (Card, Apple Pay, Google Pay). */
export const STRIPE_SUPPORTED_METHODS: WebPaymentMethodId[] = ["card", "apple_pay", "google_pay"];

/** Web checkout payload sent to backend for Stripe session creation / validation. */
export interface StripeWebCheckoutPayload {
  packageId: string;
  provider: "web";
  platform: "web";
  /** Web SKU (e.g. tokens_100) – maps to Stripe Price/Product. */
  webSku: string;
  /** Selected payment method for Stripe (card, apple_pay, google_pay). */
  selectedMethod: WebPaymentMethodId;
  tokenAmount: number;
  price: number;
  currency: string;
}

/** Result of initiating web checkout – used by UI to show toast / redirect. */
export type WebCheckoutResultStatus = "stripe_ready" | "paypal_ready" | "coming_soon" | "failed";

export interface WebCheckoutResult {
  status: WebCheckoutResultStatus;
  /** Set when status === 'stripe_ready' or 'paypal_ready' – payload for backend. */
  payload?: StripeWebCheckoutPayload | PayPalWebCheckoutPayload;
  /** Set when backend returns a checkout URL – FE should redirect to this URL. */
  checkoutUrl?: string;
  /** Set when status === 'failed'. */
  errorMessage?: string;
}
