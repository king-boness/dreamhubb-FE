/**
 * Apple In-App Purchase – types and backend validation payload.
 * Used by the iOS purchase service layer and for Laravel backend validation.
 */

/** Status of the purchase flow (for UI and service layer). */
export type AppleIapPurchaseStatus =
  | "idle"
  | "loading"
  | "success"
  | "cancelled"
  | "failed"
  | "unavailable";

/** Product info returned from StoreKit (or adapter). */
export interface AppleIapProduct {
  productId: string;
  price: string;
  priceLocale?: string;
  title?: string;
  description?: string;
}

/** Result of a purchase attempt. */
export interface AppleIapPurchaseResult {
  status: AppleIapPurchaseStatus;
  /** Set when status === 'success' */
  transactionId?: string;
  /** Set when status === 'success' – for backend verification (StoreKit 2: transaction payload / receipt). */
  transactionPayload?: string;
  /** Set when status === 'failed' or 'unavailable' */
  errorMessage?: string;
  /** Product id that was purchased (when success). */
  productId?: string;
}

/**
 * Payload sent to Laravel backend after a successful Apple IAP.
 * Backend will validate transactionId/transactionPayload with Apple and grant tokens.
 */
export interface AppleIapBackendPayload {
  packageId: string;
  provider: "apple_iap";
  platform: "ios";
  providerProductId: string;
  tokenAmount: number;
  price: number;
  currency: string;
  /** Apple transaction identifier – backend uses this to verify with Apple. */
  transactionId: string;
  /** Receipt or transaction payload for server-side validation (StoreKit 2: transaction info). */
  transactionPayload: string;
}
