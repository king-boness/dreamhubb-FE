/**
 * Purchase flow types – platform-aware token purchase.
 * Used by Token Shop and future payment integration (Apple IAP, Google Billing, web checkout).
 */

/**
 * Single source-of-truth token package (catalog entry).
 * Used by UI and by purchase handlers; product ids map to store / web backend.
 */
export interface TokenPackage {
  /** Internal id (e.g. tokens_100) – used in backend payload and as stable key */
  id: string;
  /** Display name for UI (e.g. "Fist full of") */
  displayName: string;
  /** Token amount as number (for backend and logic) */
  tokenAmount: number;
  /** Price in main currency (e.g. EUR) */
  price: number;
  /** Formatted price for display (e.g. "1.99€") */
  priceDisplay: string;
  /** Icon path for card UI */
  img: string;
  /** Apple In-App Purchase product id (App Store Connect) */
  appleProductId: string;
  /** Google Play Billing product id (Play Console) */
  googleProductId: string;
  /** Web checkout SKU / id (Stripe product, PayPal plan, etc.) */
  webSku: string;
}

/** Purchase provider by platform – determines which UI and backend flow to use */
export type PurchaseProvider = "apple_iap" | "google_billing" | "web";

/** Web-only: payment method id for external checkout (Stripe, PayPal, etc.) */
export type WebPaymentMethodId =
  | "apple_pay"
  | "google_pay"
  | "card"
  | "paypal"
  | "bank_transfer"
  | "paysafecard"
  | "crypto"
  | "sms";

export interface WebPaymentMethod {
  id: WebPaymentMethodId;
  label: string;
  tier?: "core" | "level2" | "advanced";
}

/** Payment methods shown only on web (not in iOS/Android app store flows) */
export const WEB_PAYMENT_METHODS: WebPaymentMethod[] = [
  { id: "apple_pay", label: "Apple Pay", tier: "core" },
  { id: "google_pay", label: "Google Pay", tier: "core" },
  { id: "card", label: "Card (Visa / Mastercard)", tier: "core" },
  { id: "paypal", label: "PayPal", tier: "core" },
  { id: "bank_transfer", label: "Bank Transfer", tier: "level2" },
  { id: "paysafecard", label: "Paysafecard", tier: "level2" },
  { id: "crypto", label: "Crypto", tier: "advanced" },
  { id: "sms", label: "SMS Payment", tier: "advanced" }
];

/**
 * Backend-ready payload for purchase validation / webhooks.
 * Built before calling provider; sent to backend after successful provider confirmation.
 */
export interface PurchasePayload {
  packageId: string;
  provider: PurchaseProvider;
  platform: "ios" | "android" | "web";
  /** Store / gateway product id (appleProductId, googleProductId, or webSku) */
  providerProductId: string;
  /** Only set for web checkout */
  selectedMethod?: WebPaymentMethodId;
  tokenAmount: number;
  price: number;
  currency: string;
}

/** Default currency for token purchases */
export const PURCHASE_PAYLOAD_CURRENCY = "EUR";

/**
 * Builds the payload that will be sent to backend / webhook validation.
 * Call after user confirms; backend will validate with Apple/Google/web gateway and grant tokens.
 */
export function buildPurchasePayload(
  pkg: TokenPackage,
  provider: PurchaseProvider,
  platform: "ios" | "android" | "web",
  selectedMethod?: WebPaymentMethodId
): PurchasePayload {
  const providerProductId =
    provider === "apple_iap"
      ? pkg.appleProductId
      : provider === "google_billing"
        ? pkg.googleProductId
        : pkg.webSku;
  return {
    packageId: pkg.id,
    provider,
    platform,
    providerProductId,
    ...(selectedMethod != null && { selectedMethod }),
    tokenAmount: pkg.tokenAmount,
    price: pkg.price,
    currency: PURCHASE_PAYLOAD_CURRENCY
  };
}
