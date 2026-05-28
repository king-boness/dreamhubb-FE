/**
 * Apple IAP adapter – bridge to native StoreKit via @capgo/native-purchases@0.0.72 (Capacitor 5).
 * This file is the only place that calls the native IAP API.
 * Used only on iOS; on web/Android the service layer does not call the adapter for Apple IAP.
 */
import { Capacitor } from "@capacitor/core";
import type { AppleIapProduct, AppleIapPurchaseResult } from "src/types/appleIap";

export interface AppleIapAdapter {
  loadProducts(productIds: string[]): Promise<AppleIapProduct[]>;
  purchase(productId: string): Promise<AppleIapPurchaseResult>;
  isNativePluginAvailable(): Promise<boolean>;
}

function isIos(): boolean {
  if (typeof window === "undefined") return false;
  return Capacitor.getPlatform() === "ios";
}

/** Transaction from plugin may include receipt/jwsRepresentation for backend validation (not in v6 typings). */
interface TransactionWithReceipt {
  transactionId: string;
  receipt?: string;
  jwsRepresentation?: string;
  productIdentifier?: string;
}

function isNativePurchasesUnimplementedError(error: unknown): boolean {
  const msg = error instanceof Error ? error.message : String(error);
  const lower = msg.toLowerCase();
  return lower.includes("nativepurchases") && lower.includes("not implemented");
}

async function loadProductsReal(productIds: string[]): Promise<AppleIapProduct[]> {
  if (productIds.length === 0) return [];
  const { NativePurchases, PURCHASE_TYPE } = await import("@capgo/native-purchases");
  const { isBillingSupported } = await NativePurchases.isBillingSupported();
  if (!isBillingSupported) {
    if (import.meta.env.DEV) console.debug("[AppleIap] Billing not supported on this device");
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

async function purchaseReal(productId: string): Promise<AppleIapPurchaseResult> {
  const { NativePurchases, PURCHASE_TYPE } = await import("@capgo/native-purchases");
  const transaction = (await NativePurchases.purchaseProduct({
    productIdentifier: productId,
    productType: PURCHASE_TYPE.INAPP,
    quantity: 1
  })) as TransactionWithReceipt;
  const transactionId = transaction.transactionId ?? "";
  const transactionPayload =
    transaction.jwsRepresentation ?? transaction.receipt ?? "";
  return {
    status: "success",
    transactionId,
    transactionPayload: transactionPayload || undefined,
    productId: transaction.productIdentifier ?? productId
  };
}

async function isNativePluginAvailable(): Promise<boolean> {
  if (!isIos()) return false;
  try {
    const { NativePurchases } = await import("@capgo/native-purchases");
    await NativePurchases.isBillingSupported();
    return true;
  } catch (e) {
    if (import.meta.env.DEV) {
      console.debug("[AppleIap] NativePurchases plugin unavailable", e);
    }
    return false;
  }
}

async function loadProducts(productIds: string[]): Promise<AppleIapProduct[]> {
  if (!isIos()) {
    if (import.meta.env.DEV) {
      console.debug("[AppleIap] loadProducts: not iOS, skipping native plugin");
    }
    return [];
  }
  try {
    const products = await loadProductsReal(productIds);
    if (import.meta.env.DEV) {
      console.debug("[AppleIap] loadProducts loaded", products.length, productIds);
    }
    return products;
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (import.meta.env.DEV) {
      console.debug("[AppleIap] loadProducts failed", msg, e);
    }
    if (isNativePurchasesUnimplementedError(e)) {
      if (import.meta.env.DEV) {
        console.debug("[AppleIap] NativePurchases plugin not implemented in current iOS build");
      }
    }
    return [];
  }
}

async function purchase(productId: string): Promise<AppleIapPurchaseResult> {
  if (!isIos()) {
    return {
      status: "unavailable",
      errorMessage: "Apple IAP is only available on iOS."
    };
  }
  try {
    return await purchaseReal(productId);
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    if (isNativePurchasesUnimplementedError(e)) {
      return {
        status: "unavailable",
        errorMessage: "NativePurchases plugin is not linked in this iOS build. Run cap sync/pod install and rebuild."
      };
    }
    const lower = msg.toLowerCase();
    if (
      lower.includes("cancel") ||
      lower.includes("cancelled") ||
      lower.includes("user denied")
    ) {
      if (import.meta.env.DEV) console.debug("[AppleIap] purchase cancelled");
      return { status: "cancelled" };
    }
    if (import.meta.env.DEV) {
      console.debug("[AppleIap] purchase failed", msg, e);
    }
    return {
      status: "failed",
      errorMessage: msg || "Purchase failed",
      productId
    };
  }
}

export const appleIapAdapter: AppleIapAdapter = {
  loadProducts,
  purchase,
  isNativePluginAvailable
};
