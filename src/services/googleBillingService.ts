/**
 * Google Play Billing service layer – Android only.
 * Loads products, runs purchase flow, and prepares backend payload.
 * Uses googleBillingAdapter (same @capgo/native-purchases plugin as iOS); UI stays unchanged.
 */
import { Capacitor } from "@capacitor/core";
import type { TokenPackage } from "src/types/purchase";
import type {
  GoogleBillingPurchaseResult,
  GoogleBillingPurchaseStatus,
  GoogleBillingBackendPayload,
  GoogleBillingProduct
} from "src/types/googleBilling";
import { buildPurchasePayload } from "src/types/purchase";
import { googleBillingAdapter } from "src/services/googleBillingAdapter";

/**
 * Flip to true after Laravel validates Google Play purchases (POST /api/purchases/validate-google).
 * While false, Android token purchases show as unavailable — avoids fake success without server credit.
 */
export const GOOGLE_BILLING_BACKEND_ENABLED = false;

export const ANDROID_TOKEN_PURCHASE_UNAVAILABLE_MESSAGE =
  "Token purchases are temporarily unavailable on Android. This feature will be available in a future update.";

function isAndroid(): boolean {
  if (typeof window === "undefined") return false;
  const cap = Capacitor as unknown as { getPlatform?: () => string; isNativePlatform?: () => boolean };
  return cap?.isNativePlatform?.() === true && cap?.getPlatform?.() === "android";
}

/** Native Android app with token purchases blocked until Play Billing backend validation ships. */
export function isAndroidTokenPurchaseBlocked(): boolean {
  return !GOOGLE_BILLING_BACKEND_ENABLED && isAndroid();
}

/**
 * Load Google Play products by product ids (from token package catalog).
 * Returns products when available; on web/iOS or when adapter returns empty, consider products unavailable.
 */
export async function loadGoogleProducts(
  productIds: string[]
): Promise<{ products: GoogleBillingProduct[]; status: GoogleBillingPurchaseStatus }> {
  if (!isAndroid() || isAndroidTokenPurchaseBlocked()) {
    return { products: [], status: "unavailable" };
  }
  try {
    const products = await googleBillingAdapter.loadProducts(productIds);
    return {
      products,
      status: products.length > 0 ? "idle" : "unavailable"
    };
  } catch (e) {
    if (import.meta.env.DEV) {
      console.debug("[GoogleBilling] loadProducts failed", e);
    }
    return { products: [], status: "unavailable" };
  }
}

/**
 * Start purchase flow for one token package (Android only).
 * Uses pkg.googleProductId; returns result with status. On success, backendPayload is buildable from result.
 */
export async function purchaseGooglePackage(pkg: TokenPackage): Promise<GoogleBillingPurchaseResult> {
  if (!isAndroid()) {
    return {
      status: "unavailable",
      errorMessage: "Google Play Billing is only available on Android."
    };
  }
  if (isAndroidTokenPurchaseBlocked()) {
    return {
      status: "unavailable",
      errorMessage: ANDROID_TOKEN_PURCHASE_UNAVAILABLE_MESSAGE
    };
  }
  const productId = pkg.googleProductId;
  try {
    const result = await googleBillingAdapter.purchase(productId);
    if (result.status === "success" && result.transactionId != null && result.purchaseToken != null) {
      const backendPayload = buildGoogleBillingBackendPayload(
        pkg,
        result.transactionId,
        result.purchaseToken,
        result.orderId
      );
      if (import.meta.env.DEV) {
        console.debug("[GoogleBilling] Purchase success – backend payload for Laravel:", backendPayload);
      }
      if (!GOOGLE_BILLING_BACKEND_ENABLED) {
        return {
          status: "unavailable",
          errorMessage: ANDROID_TOKEN_PURCHASE_UNAVAILABLE_MESSAGE,
          productId
        };
      }
      // TODO: POST backendPayload to Laravel (e.g. POST /api/purchases/validate-google) and refresh user tokens
    }
    return result;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (import.meta.env.DEV) {
      console.debug("[GoogleBilling] Purchase error", e);
    }
    return {
      status: "failed",
      errorMessage: message,
      productId
    };
  }
}

/**
 * Build payload for Laravel backend validation after a successful Google Play purchase.
 * Backend should verify purchaseToken with Google Play Developer API and then grant tokens.
 */
export function buildGoogleBillingBackendPayload(
  pkg: TokenPackage,
  transactionId: string,
  purchaseToken: string,
  orderId?: string
): GoogleBillingBackendPayload {
  const base = buildPurchasePayload(pkg, "google_billing", "android");
  return {
    ...base,
    transactionId,
    purchaseToken,
    ...(orderId != null && orderId !== "" && { orderId })
  };
}
