import { computed, type Ref } from "vue";

/**
 * Composable for calculating remaining tokens after spending
 *
 * @param balanceTokens - User's total token balance (ref or computed)
 * @param spentTokens - Tokens being spent (ref or computed)
 * @returns Computed remaining tokens (clamped to >= 0)
 */
export function useRemainingFunds(
  balanceTokens: Ref<number> | (() => number),
  spentTokens: Ref<number> | (() => number)
) {
  const remainingTokens = computed(() => {
    const balance = typeof balanceTokens === "function" ? balanceTokens() : balanceTokens.value ?? 0;
    const spent = typeof spentTokens === "function" ? spentTokens() : spentTokens.value ?? 0;
    return Math.max(balance - spent, 0);
  });

  return {
    remainingTokens
  };
}
