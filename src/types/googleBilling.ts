/**
 * Google Play Billing – types and backend validation payload.
 * Used by the Android purchase service layer and for Laravel backend validation.
 */

/** Status of the purchase flow (for UI and service layer). */
export type GoogleBillingPurchaseStatus =
  | "idle"
  | "loading"
  | "success"
  | "cancelled"
  | "failed"
  | "unavailable";

/** Product info returned from Play Billing (or adapter). */
export interface GoogleBillingProduct {
  productId: string;
  price: string;
  priceLocale?: string;
  title?: string;
  description?: string;
}

/** Result of a purchase attempt. */
export interface GoogleBillingPurchaseResult {
  status: GoogleBillingPurchaseStatus;
  /** Set when status === 'success' */
  transactionId?: string;
  /** Set when status === 'success' – purchaseToken for backend verification with Google. */
  purchaseToken?: string;
  /** Set when status === 'success' – orderId from Play Billing. */
  orderId?: string;
  /** Set when status === 'failed' or 'unavailable' */
  errorMessage?: string;
  /** Product id that was purchased (when success). */
  productId?: string;
}

/**
 * Payload sent to Laravel backend after a successful Google Play purchase.
 * Backend will validate purchaseToken (and optionally orderId) with Google and grant tokens.
 */
export interface GoogleBillingBackendPayload {
  packageId: string;
  provider: "google_billing";
  platform: "android";
  providerProductId: string;
  tokenAmount: number;
  price: number;
  currency: string;
  /** Transaction / order identifier – backend uses for idempotency and logging. */
  transactionId: string;
  /** Google Play purchase token – required for server-side validation with Google Play Developer API. */
  purchaseToken: string;
  /** Google Play order ID when available. */
  orderId?: string;
}
