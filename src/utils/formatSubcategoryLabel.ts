/**
 * Format subcategory label for display in UI (chips/badges)
 *
 * This function ensures that subcategory labels are consistently displayed
 * with a lowercase first letter across the entire application.
 *
 * @param text - The subcategory text to format (can be from i18n translation or slug)
 * @returns Formatted text with lowercase first letter, or empty string if input is invalid
 *
 * @example
 * formatSubcategoryLabel("Possessions") // returns "possessions"
 * formatSubcategoryLabel("Learning") // returns "learning"
 * formatSubcategoryLabel(null) // returns ""
 * formatSubcategoryLabel("") // returns ""
 */
export function formatSubcategoryLabel(text: string | null | undefined): string {
  // Handle null/undefined/empty
  if (!text || text.length === 0) {
    return "";
  }

  // If text is 1 character, return lowercase
  if (text.length === 1) {
    return text.toLowerCase();
  }

  // Lowercase first letter only, keep rest as-is
  return text.charAt(0).toLowerCase() + text.slice(1);
}
