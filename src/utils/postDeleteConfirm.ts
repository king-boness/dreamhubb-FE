/** Canonical English confirmation phrases — exact contract (case-sensitive). */
export const DELETE_CONFIRM_PHRASES = {
  dream: "I want to delete this dream",
  problem: "I want to delete this problem",
  idea: "I want to delete this idea"
} as const;

export type DeleteCategorySlug = keyof typeof DELETE_CONFIRM_PHRASES;

export function normalizeDeleteCategorySlug(
  raw: string | null | undefined
): DeleteCategorySlug {
  const s = String(raw || "dream").toLowerCase();
  if (s === "problem" || s === "idea") return s;
  return "dream";
}

export function getRequiredDeletePhrase(
  categorySlug: string | null | undefined
): string {
  return DELETE_CONFIRM_PHRASES[normalizeDeleteCategorySlug(categorySlug)];
}

/**
 * Exact match after trim only — case and wording must match the contract phrase.
 */
export function isExactDeletePhrase(
  input: string,
  categorySlug: string | null | undefined
): boolean {
  return input.trim() === getRequiredDeletePhrase(categorySlug);
}

export function deleteMyPostI18nKey(
  categorySlug: string | null | undefined
): "posts.edit.deleteMyDream" | "posts.edit.deleteMyProblem" | "posts.edit.deleteMyIdea" {
  const slug = normalizeDeleteCategorySlug(categorySlug);
  if (slug === "problem") return "posts.edit.deleteMyProblem";
  if (slug === "idea") return "posts.edit.deleteMyIdea";
  return "posts.edit.deleteMyDream";
}
