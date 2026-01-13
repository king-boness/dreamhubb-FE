/**
 * Domain model for Categories and Subcategories
 *
 * This module defines the canonical source of truth for category and subcategory
 * slugs, icons, and related utilities in the frontend.
 */

/**
 * Category slugs (3 categories)
 */
export const CATEGORY_SLUGS = ["dream", "problem", "idea"] as const;

export type CategorySlug = typeof CATEGORY_SLUGS[number];

/**
 * Subcategory slugs (8 subcategories)
 */
export const SUBCATEGORY_SLUGS = [
  "traveling",
  "health",
  "learning",
  "possessions",
  "relationships",
  "profession",
  "events",
  "other"
] as const;

export type SubcategorySlug = typeof SUBCATEGORY_SLUGS[number];

/**
 * Category icon mapping (SVG file paths)
 * These icons are used for category badges (dream/problem/idea)
 */
export const CATEGORY_ICONS: Record<CategorySlug, string> = {
  dream: "/post_icons/dream_mini.svg",
  problem: "/post_icons/problem_mini.svg",
  idea: "/post_icons/idea_mini.svg"
};

/**
 * Subcategory icon mapping (FontAwesome strings)
 * These are fallback icons if API doesn't provide icon in subcategory.icon
 */
export const SUBCATEGORY_ICONS: Record<SubcategorySlug, string> = {
  traveling: "fa-solid fa-plane",
  health: "fa-solid fa-heart",
  learning: "fa-solid fa-book",
  possessions: "fa-solid fa-box",
  relationships: "fa-solid fa-users",
  profession: "fa-solid fa-briefcase",
  events: "fa-solid fa-calendar",
  other: "fa-solid fa-circle"
};

/**
 * Category and Subcategory type definitions
 */
export interface Category {
  id?: number;
  slug: CategorySlug;
}

export interface Subcategory {
  id?: number;
  slug: SubcategorySlug;
  icon?: string; // FontAwesome icon string (e.g., 'fa-solid fa-plane')
}

/**
 * Type guards
 */
export function isCategorySlug(slug: string | null | undefined): slug is CategorySlug {
  return CATEGORY_SLUGS.includes(slug as CategorySlug);
}

export function isSubcategorySlug(slug: string | null | undefined): slug is SubcategorySlug {
  return SUBCATEGORY_SLUGS.includes(slug as SubcategorySlug);
}

/**
 * Get category icon (dream/problem/idea)
 * Used for category badges
 */
export function getCategoryIcon(categorySlug: CategorySlug | string | null | undefined): string {
  if (!categorySlug || !isCategorySlug(categorySlug)) {
    return CATEGORY_ICONS.dream; // Default to dream
  }
  return CATEGORY_ICONS[categorySlug];
}

/**
 * Get subcategory icon
 * Prefers icon from API (subcategory.icon), falls back to SUBCATEGORY_ICONS mapping
 */
export function getSubcategoryIcon(subcategory: Subcategory | null | undefined): string {
  if (!subcategory) {
    return SUBCATEGORY_ICONS.other;
  }

  // Prefer icon from API if available
  if (subcategory.icon) {
    return subcategory.icon;
  }

  // Fallback to mapping
  return SUBCATEGORY_ICONS[subcategory.slug] || SUBCATEGORY_ICONS.other;
}

/**
 * Get subcategory icon by slug (convenience function)
 */
export function getSubcategoryIconBySlug(slug: SubcategorySlug | string | null | undefined): string {
  if (!slug || !isSubcategorySlug(slug)) {
    return SUBCATEGORY_ICONS.other;
  }
  return SUBCATEGORY_ICONS[slug];
}
