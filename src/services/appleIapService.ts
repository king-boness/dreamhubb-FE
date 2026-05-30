/**
 * Apple In-App Purchase service layer – iOS only.
 * Loads products, runs purchase flow, and prepares backend payload.
 * Uses appleIapAdapter (stub or real plugin); UI stays unchanged.
 */
import { Capacitor } from "@capacitor/core";
import type { TokenPackage } from "src/types/purchase";
import type { AppleIapPurchaseResult, AppleIapPurchaseStatus, AppleIapBackendPayload, AppleIapProduct } from "src/types/appleIap";
import { buildPurchasePayload } from "src/types/purchase";
import { appleIapAdapter } from "src/services/appleIapAdapter";

/**
 * Flip to true after Laravel validates Apple receipts (POST /api/purchases/validate-apple).
 * While false, iOS token purchases show as unavailable — avoids fake success during App Review.
 */
export const APPLE_IAP_BACKEND_ENABLED = false;

function isIos(): boolean {
  if (typeof window === "undefined") return false;
  const cap = Capacitor as unknown as { getPlatform?: () => string; isNativePlatform?: () => boolean };
  return cap?.isNativePlatform?.() === true && cap?.getPlatform?.() === "ios";
}

/**
 * Load Apple IAP products by product ids (from token package catalog).
 * Returns products when available; on web or when adapter returns empty, consider products unavailable.
 */
export async function loadAppleProducts(productIds: string[]): Promise<{ products: AppleIapProduct[]; status: AppleIapPurchaseStatus }> {
  if (!isIos()) {
    return { products: [], status: "unavailable" };
  }
  try {
    const products = await appleIapAdapter.loadProducts(productIds);
    return {
      products,
      status: products.length > 0 ? "idle" : "unavailable"
    };
  } catch (e) {
    if (import.meta.env.DEV) {
      console.debug("[AppleIap] loadProducts failed", e);
    }
    return { products: [], status: "unavailable" };
  }
}

/**
 * Fast runtime check used by token shop screen so missing native plugin
 * is shown as controlled state instead of hard purchase error later.
 */
export async function isAppleIapReady(): Promise<boolean> {
  if (!isIos()) return false;
  return appleIapAdapter.isNativePluginAvailable();
}

/**
 * Start purchase flow for one token package (iOS only).
 * Uses pkg.appleProductId; returns result with status. On success, backendPayload is buildable from result.
 */
export async function purchaseApplePackage(pkg: TokenPackage): Promise<AppleIapPurchaseResult> {
  if (!isIos()) {
    return {
      status: "unavailable",
      errorMessage: "Apple IAP is only available on iOS."
    };
  }
  const productId = pkg.appleProductId;
  try {
    const result = await appleIapAdapter.purchase(productId);
    if (result.status === "success" && result.transactionId != null) {
      const payload = result.transactionPayload ?? "";
      const backendPayload = buildAppleIapBackendPayload(pkg, result.transactionId, payload);
      if (import.meta.env.DEV) {
        console.debug("[AppleIap] Purchase success – backend payload for Laravel:", backendPayload);
      }
      if (!APPLE_IAP_BACKEND_ENABLED) {
        return {
          status: "unavailable",
          errorMessage:
            "Token purchases are temporarily unavailable. Apple payment was received but server validation is not enabled yet."
        };
      }
      // TODO: POST backendPayload to Laravel (e.g. POST /api/purchases/validate-apple) and refresh user tokens
    }
    return result;
  } catch (e) {
    const message = e instanceof Error ? e.message : String(e);
    if (import.meta.env.DEV) {
      console.debug("[AppleIap] Purchase error", e);
    }
    return {
      status: "failed",
      errorMessage: message
    };
  }
}

/**
 * Build payload for Laravel backend validation after a successful Apple IAP.
 * Backend should verify transactionId/transactionPayload with Apple and then grant tokens.
 */
export function buildAppleIapBackendPayload(
  pkg: TokenPackage,
  transactionId: string,
  transactionPayload: string
): AppleIapBackendPayload {
  const base = buildPurchasePayload(pkg, "apple_iap", "ios");
  return {
    ...base,
    transactionId,
    transactionPayload
  };
}
