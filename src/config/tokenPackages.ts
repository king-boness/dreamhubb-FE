/**
 * Central catalog of token packages – single source for UI and purchase orchestration.
 * Product ids must match App Store Connect (Apple) and Play Console (Google); web SKUs match Stripe/backend.
 */
import type { TokenPackage } from "src/types/purchase";

const CURRENCY = "EUR";

function formatPrice(price: number): string {
  return `${price.toFixed(2)}€`;
}

/**
 * All token packages available for purchase. Order = display order in shop.
 * `displayName` is EN fallback only — UI must prefer i18n key `tokenPackages.{id}`.
 */
export const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: "tokens_10",
    displayName: "Fistful of Tokens",
    tokenAmount: 10,
    price: 1.99,
    priceDisplay: formatPrice(1.99),
    img: "/icons/KarmaIcon.png",
    appleProductId: "com.dreamhubb.ap.tokens_10",
    googleProductId: "tokens_10",
    webSku: "tokens_10"
  },
  {
    id: "tokens_25",
    displayName: "Handful of Tokens",
    tokenAmount: 25,
    price: 4.49,
    priceDisplay: formatPrice(4.49),
    img: "/icons/karmaIcon-500.svg",
    appleProductId: "com.dreamhubb.ap.tokens_25",
    googleProductId: "tokens_25",
    webSku: "tokens_25"
  },
  {
    id: "tokens_50",
    displayName: "Wallet Full of Tokens",
    tokenAmount: 50,
    price: 7.99,
    priceDisplay: formatPrice(7.99),
    img: "/icons/karmaIcon-1000.svg",
    appleProductId: "com.dreamhubb.ap.tokens_50",
    googleProductId: "tokens_50",
    webSku: "tokens_50"
  },
  {
    id: "tokens_100",
    displayName: "Bag Full of Tokens",
    tokenAmount: 100,
    price: 13.99,
    priceDisplay: formatPrice(13.99),
    img: "/icons/karmaIcon-2000.svg",
    appleProductId: "com.dreamhubb.ap.tokens_100",
    googleProductId: "tokens_100",
    webSku: "tokens_100"
  },
  {
    id: "tokens_200",
    displayName: "Chest Full of Tokens",
    tokenAmount: 200,
    price: 24.99,
    priceDisplay: formatPrice(24.99),
    img: "/icons/karmaIcon-5000.svg",
    appleProductId: "com.dreamhubb.ap.tokens_200",
    googleProductId: "tokens_200",
    webSku: "tokens_200"
  },
  {
    id: "tokens_300",
    displayName: "Truckload of Tokens",
    tokenAmount: 300,
    price: 34.99,
    priceDisplay: formatPrice(34.99),
    img: "/icons/karmaIcon-10000.svg",
    appleProductId: "com.dreamhubb.ap.tokens_300",
    googleProductId: "tokens_300",
    webSku: "tokens_300"
  }
];

export const PURCHASE_CURRENCY = CURRENCY;

/** i18n key for a package display label (full name; do not append "Tokens"). */
export function tokenPackageDisplayNameKey(packageId: string): string {
  return `tokenPackages.${packageId}`;
}

/** Format token amount for display (e.g. 1000 → "1.000") */
export function formatTokenAmount(amount: number): string {
  return amount.toLocaleString("de-DE", { useGrouping: true });
}
