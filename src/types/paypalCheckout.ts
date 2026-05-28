/**
 * PayPal web checkout – types and payload for Laravel/PayPal integration.
 * Used by the web purchase flow; backend will create PayPal order and validate payment.
 */

/** Web checkout payload sent to backend for PayPal order creation / validation. */
export interface PayPalWebCheckoutPayload {
  packageId: string;
  provider: "web";
  platform: "web";
  /** Web SKU (e.g. tokens_100) – maps to PayPal product/plan. */
  webSku: string;
  /** Always "paypal" for this flow. */
  selectedMethod: "paypal";
  tokenAmount: number;
  price: number;
  currency: string;
}
