/**
 * Google Play Billing adapter – bridge to native billing via @capgo/native-purchases@0.0.72 (Capacitor 5).
 * This file is the only place that calls the native billing API for Android.
 * Used only on Android; on web/iOS the service layer does not call this adapter for Google Billing.
 */
import { Capacitor } from "@capacitor/core";
import type { GoogleBillingProduct, GoogleBillingPurchaseResult } from "src/types/googleBilling";

export interface GoogleBillingAdapter {
  loadProducts(productIds: string[]): Promise<GoogleBillingProduct[]>;
  purchase(productId: string): Promise<GoogleBillingPurchaseResult>;
}

function isAndroid(): boolean {
  if (typeof window === "undefined") return false;
  return Capacitor.getPlatform() === "android";
}

/** Plugin transaction on Android includes purchaseToken and orderId for backend validation. */
interface TransactionAndroid {
  transactionId: string;
  purchaseToken?: string;
  orderId?: string;
  productIdentifier?: string;
}

async function loadProductsReal(productIds: string[]): Promise<GoogleBillingProduct[]> {
  if (productIds.length === 0) return [];
  const { NativePurchases, PURCHASE_TYPE } = await import("@capgo/native-purchases");
  const { isBillingSupported } = await NativePurchases.isBillingSupported();
  if (!isBillingSupported) {
    if (import.meta.env.DEV) console.debug("[GoogleBilling] Billing not supported on this device");
    return [];
  }
  const { products } = await NativePurchases.getProducts({
    productIdentifiers: productIds,
    productType: PURCHASE_TYPE.INAPP
  });
  return products.map((p) => ({
    productId: p.identifier,
    price: p.priceString,
    priceLocale: p.currencyCode ?? undefined,
    title: p.title ?? undefined,
    description: p.description ?? undefined
  }));
}

async function purchaseReal(productId: string): Promise<GoogleBillingPurchaseResult> {
  const { NativePurchases, PURCHASE_TYPE } = await import("@capgo/native-purchases");
  const transaction = (await NativePurchases.purchaseProduct({
    productIdentifier: productId,
    productType: PURCHASE_TYPE.INAPP,
    quantity: 1
  })) as TransactionAndroid;
  const transactionId = transaction.transactionId ?? "";
  const purchaseToken = transaction.purchaseToken ?? "";
  return {
    status: "success",
    transactionId,
    purchaseToken: purchaseToken || undefined,
    orderId: transaction.orderId,
    productId: transaction.productIdentifier ?? productId
  };
}

async function loadProducts(productIds: string[]): Promise<GoogleBillingProduct[]> {
  if (!isAndroid()) {
    if (import.meta.env.DEV) {
      console.debug("[GoogleBilling] loadProducts: not Android, skipping native plugin");
    }
    return [];
  }
  try {
    const products = await loadProductsReal(productIds);
    if (import.meta.env.DEV) {
      console.debug("[GoogleBilling] loadProducts loaded", products.length, productIds);
    }
    return products;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (import.meta.env.DEV) {
      console.debug("[GoogleBilling] loadProducts failed", msg, e);
    }
    return [];
  }
}

async function purchase(productId: string): Promise<GoogleBillingPurchaseResult> {
  if (!isAndroid()) {
    return {
      status: "unavailable",
      errorMessage: "Google Play Billing is only available on Android."
    };
  }
  try {
    return await purchaseReal(productId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    const lower = msg.toLowerCase();
    if (
      lower.includes("cancel") ||
      lower.includes("cancelled") ||
      lower.includes("user canceled") ||
      lower.includes("user denied")
    ) {
      if (import.meta.env.DEV) console.debug("[GoogleBilling] purchase cancelled");
      return { status: "cancelled" };
    }
    if (import.meta.env.DEV) {
      console.debug("[GoogleBilling] purchase failed", msg, e);
    }
    return {
      status: "failed",
      errorMessage: msg || "Purchase failed",
      productId
    };
  }
}

export const googleBillingAdapter: GoogleBillingAdapter = {
  loadProducts,
  purchase
};
