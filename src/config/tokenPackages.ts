/**
 * Central catalog of token packages – single source for UI and purchase orchestration.
 * Product ids must match App Store Connect (Apple) and Play Console (Google); web SKUs match Stripe/backend.
 */
import type { TokenPackage } from "src/types/purchase";

const CURRENCY = "EUR";

function formatPrice(price: number): string {
  return `${price.toFixed(2)}€`;
}

/** All token packages available for purchase. Order = display order in shop. */
export const TOKEN_PACKAGES: TokenPackage[] = [
  {
    id: "tokens_100",
    displayName: "Fist full of",
    tokenAmount: 100,
    price: 1.99,
    priceDisplay: formatPrice(1.99),
    img: "/icons/KarmaIcon.png",
    appleProductId: "com.dreamhubb.ap.tokens_100",
    googleProductId: "tokens_100",
    webSku: "tokens_100"
  },
  {
    id: "tokens_500",
    displayName: "Hands full of",
    tokenAmount: 500,
    price: 3.99,
    priceDisplay: formatPrice(3.99),
    img: "/icons/karmaIcon-500.svg",
    appleProductId: "com.dreamhubb.ap.tokens_500",
    googleProductId: "tokens_500",
    webSku: "tokens_500"
  },
  {
    id: "tokens_1000",
    displayName: "Wallet full of",
    tokenAmount: 1000,
    price: 6.99,
    priceDisplay: formatPrice(6.99),
    img: "/icons/karmaIcon-1000.svg",
    appleProductId: "com.dreamhubb.ap.tokens_1000",
    googleProductId: "tokens_1000",
    webSku: "tokens_1000"
  },
  {
    id: "tokens_2500",
    displayName: "Bag full of",
    tokenAmount: 2500,
    price: 12.99,
    priceDisplay: formatPrice(12.99),
    img: "/icons/karmaIcon-2000.svg",
    appleProductId: "com.dreamhubb.ap.tokens_2500",
    googleProductId: "tokens_2500",
    webSku: "tokens_2500"
  },
  {
    id: "tokens_5000",
    displayName: "Chest full of",
    tokenAmount: 5000,
    price: 19.99,
    priceDisplay: formatPrice(19.99),
    img: "/icons/karmaIcon-5000.svg",
    appleProductId: "com.dreamhubb.ap.tokens_5000",
    googleProductId: "tokens_5000",
    webSku: "tokens_5000"
  },
  {
    id: "tokens_10000",
    displayName: "Truck full of",
    tokenAmount: 10000,
    price: 29.99,
    priceDisplay: formatPrice(29.99),
    img: "/icons/karmaIcon-10000.svg",
    appleProductId: "com.dreamhubb.ap.tokens_10000",
    googleProductId: "tokens_10000",
    webSku: "tokens_10000"
  }
];

export const PURCHASE_CURRENCY = CURRENCY;

/** Format token amount for display (e.g. 1000 → "1.000") */
export function formatTokenAmount(amount: number): string {
  return amount.toLocaleString("de-DE", { useGrouping: true });
}
