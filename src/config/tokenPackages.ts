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
    id: "tokens_10",
    displayName: "Fist full of",
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
    displayName: "Hands full of",
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
    displayName: "Wallet full of",
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
    displayName: "Bag full of",
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
    displayName: "Chest full of",
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
    displayName: "Truck full of",
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

/** Format token amount for display (e.g. 1000 → "1.000") */
export function formatTokenAmount(amount: number): string {
  return amount.toLocaleString("de-DE", { useGrouping: true });
}
