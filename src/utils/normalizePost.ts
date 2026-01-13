/**
 * Normalize post data from API
 *
 * This function ensures that post data always has category and subcategory
 * in the new format (objects with slug), regardless of whether the API
 * returns the old format (type/fe_category/category_name) or new format
 * (category/subcategory objects).
 */

import type { Category, Subcategory } from "src/domain/categories";
import { CATEGORY_SLUGS, SUBCATEGORY_SLUGS, isCategorySlug, isSubcategorySlug } from "src/domain/categories";

/**
 * Raw post data from API (can have old or new format)
 */
export interface RawPostFromAPI {
  post_id?: number;
  id?: number;
  title?: string;
  description?: string;
  date_created?: string;
  date_deadline?: string | null;
  tokens?: number;
  views?: number;
  // Old format (legacy)
  type?: string | null;
  fe_category?: string | null;
  category_name?: string | null;
  category_id?: number | null;
  subcategory_id?: number | null;
  // New format (preferred)
  category?: { id?: number; slug?: string } | null;
  subcategory?: { id?: number; slug?: string; icon?: string } | null;
  // Other fields
  author_name?: string;
  author_picture?: string | null;
  author_bio?: string | null;
  images?: string[] | unknown;
  user_id?: number | null;
  author_id?: number | null;
  user?: { profile_picture?: string | null; [key: string]: unknown } | null;
  author_city?: string | null;
  author_country?: string | null;
  author_continent?: string | null;
  location_city_name?: string | null;
  location_country_name?: string | null;
  [key: string]: unknown;
}

/**
 * Normalized post data (always has category and subcategory in new format)
 */
export interface NormalizedPost {
  post_id: number;
  title: string;
  description: string;
  date_created: string;
  date_deadline: string | null;
  tokens: number;
  views: number;
  category: Category;
  subcategory: Subcategory;
  author_name: string;
  author_picture: string | null;
  author_bio: string | null;
  images: string[];
  user_id: number | null;
  author_id: number | null;
  user: { profile_picture?: string | null; [key: string]: unknown } | null;
  author_city: string | null;
  author_country: string | null;
  author_continent: string | null;
  location_city_name: string | null;
  location_country_name: string | null;
  [key: string]: unknown;
}

/**
 * Normalize post data from API
 *
 * Handles both old format (type/fe_category) and new format (category/subcategory objects)
 * Always returns normalized format with category and subcategory objects
 */
export function normalizePost(raw: RawPostFromAPI): NormalizedPost {
  // Extract category slug (from new format or map from old format)
  let categorySlug = "dream"; // Default

  if (raw.category?.slug && isCategorySlug(raw.category.slug)) {
    // New format: category object with slug
    categorySlug = raw.category.slug;
  } else if (raw.type && isCategorySlug(raw.type)) {
    // Old format: type field maps to category slug
    categorySlug = raw.type;
  } else if (raw.category_id !== undefined && raw.category_id !== null) {
    // Fallback: if only category_id is available, we can't determine slug
    // Use default 'dream'
    categorySlug = "dream";
  }

  // Ensure categorySlug is valid
  if (!isCategorySlug(categorySlug)) {
    categorySlug = "dream";
  }

  // Extract subcategory slug (from new format or map from old format)
  let subcategorySlug = "other"; // Default

  if (raw.subcategory?.slug && isSubcategorySlug(raw.subcategory.slug)) {
    // New format: subcategory object with slug
    subcategorySlug = raw.subcategory.slug;
  } else if (raw.fe_category && isSubcategorySlug(raw.fe_category)) {
    // Old format: fe_category maps to subcategory slug
    subcategorySlug = raw.fe_category;
  } else if (raw.subcategory_id !== undefined && raw.subcategory_id !== null) {
    // Fallback: if only subcategory_id is available, we can't determine slug
    // Use default 'other'
    subcategorySlug = "other";
  }

  // Ensure subcategorySlug is valid
  if (!isSubcategorySlug(subcategorySlug)) {
    subcategorySlug = "other";
  }

  // Build category object
  const category: Category = {
    slug: categorySlug as typeof CATEGORY_SLUGS[number]
  };

  if (raw.category?.id !== undefined) {
    category.id = raw.category.id;
  } else if (raw.category_id !== undefined && raw.category_id !== null) {
    category.id = raw.category_id;
  }

  // Build subcategory object
  const subcategory: Subcategory = {
    slug: subcategorySlug as typeof SUBCATEGORY_SLUGS[number]
  };

  if (raw.subcategory?.id !== undefined) {
    subcategory.id = raw.subcategory.id;
  } else if (raw.subcategory_id !== undefined && raw.subcategory_id !== null) {
    subcategory.id = raw.subcategory_id;
  }

  // Prefer icon from API, otherwise it will be resolved via getSubcategoryIcon()
  if (raw.subcategory?.icon) {
    subcategory.icon = raw.subcategory.icon;
  }

  // Normalize images
  let images: string[] = [];
  if (Array.isArray(raw.images)) {
    images = raw.images.filter((img): img is string =>
      typeof img === "string" && img.trim() !== "" && img !== "NULL" && img !== "{NULL}"
    );
  } else if (typeof raw.images === "string") {
    try {
      const decoded = JSON.parse(raw.images);
      if (Array.isArray(decoded)) {
        images = decoded.filter((img): img is string =>
          typeof img === "string" && img.trim() !== "" && img !== "NULL" && img !== "{NULL}"
        );
      }
    } catch {
      // Invalid JSON, leave images as empty array
    }
  }

  // Build normalized post
  const normalized: NormalizedPost = {
    post_id: raw.post_id || raw.id || 0,
    title: raw.title || "",
    description: raw.description || "",
    date_created: raw.date_created || "",
    date_deadline: raw.date_deadline || null,
    tokens: raw.tokens || 0,
    views: raw.views || 0,
    category,
    subcategory,
    author_name: raw.author_name || "",
    author_picture: raw.author_picture || raw.user?.profile_picture || null,
    author_bio: raw.author_bio || null,
    images,
    user_id: raw.user_id || null,
    author_id: raw.author_id || raw.user_id || raw.user?.id || null,
    user: raw.user || null,
    author_city: raw.author_city || null,
    author_country: raw.author_country || null,
    author_continent: raw.author_continent || null,
    location_city_name: raw.location_city_name || null,
    location_country_name: raw.location_country_name || null
  };

  // Preserve other fields from raw post
  Object.keys(raw).forEach(key => {
    if (!(key in normalized) && key !== "type" && key !== "fe_category" && key !== "category_name") {
      // Don't copy legacy fields, but preserve other fields
      (normalized as Record<string, unknown>)[key] = raw[key];
    }
  });

  return normalized;
}
