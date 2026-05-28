import { API_BASE_URL } from "src/config/apiBase";

const getBackendOrigin = (): string => {
  const base = String(API_BASE_URL || "").trim();
  if (!base) return "";
  try {
    return new URL(base).origin;
  } catch {
    return "";
  }
};

interface ResolveProfileImageOptions {
  cacheBuster?: string | number | null;
}

const withCacheBuster = (src: string, cacheBuster?: string | number | null): string => {
  if (cacheBuster === undefined || cacheBuster === null || cacheBuster === "") return src;
  const [base, hash = ""] = src.split("#");
  const sep = base.includes("?") ? "&" : "?";
  return `${base}${sep}v=${encodeURIComponent(String(cacheBuster))}${hash ? `#${hash}` : ""}`;
};

const rewriteLocalhostAbsoluteUrl = (raw: string, backendOrigin: string): string => {
  if (!backendOrigin) return raw;
  try {
    const parsed = new URL(raw);
    if (parsed.hostname === "localhost" || parsed.hostname === "127.0.0.1") {
      const target = new URL(backendOrigin);
      parsed.protocol = target.protocol;
      parsed.host = target.host;
      return parsed.toString();
    }
  } catch {
    // keep original url
  }
  return raw;
};

export const resolveProfileImageSrc = (
  rawValue: unknown,
  options?: ResolveProfileImageOptions
): string | null => {
  const raw = String(rawValue ?? "").trim();
  if (!raw) return null;
  const lowered = raw.toLowerCase();
  if (lowered === "null" || lowered === "undefined") return null;

  // Keep inline data URLs untouched.
  if (raw.startsWith("data:image")) return raw;
  // Absolute URL already usable by the client.
  if (/^https?:\/\//i.test(raw)) {
    return withCacheBuster(
      rewriteLocalhostAbsoluteUrl(raw, getBackendOrigin()),
      options?.cacheBuster
    );
  }

  const backendOrigin = getBackendOrigin();
  if (!backendOrigin) return null;

  // Normalize common backend/public-disk paths.
  if (raw.startsWith("/storage/")) return withCacheBuster(`${backendOrigin}${raw}`, options?.cacheBuster);
  if (raw.startsWith("storage/")) return withCacheBuster(`${backendOrigin}/${raw}`, options?.cacheBuster);
  if (raw.startsWith("/public/")) return withCacheBuster(`${backendOrigin}/storage/${raw.replace(/^\/public\//, "")}`, options?.cacheBuster);
  if (raw.startsWith("public/")) return withCacheBuster(`${backendOrigin}/storage/${raw.replace(/^public\//, "")}`, options?.cacheBuster);
  if (raw.startsWith("/")) return withCacheBuster(`${backendOrigin}${raw}`, options?.cacheBuster);

  // Fallback for plain relative values.
  return withCacheBuster(`${backendOrigin}/${raw}`, options?.cacheBuster);
};

/**
 * Get user avatar URL with fallback to initials/default
 * @param user - User object with profile_picture or similar fields
 * @param authorData - Optional author data from post (author_picture, authorAvatarUrl, etc.)
 * @returns Avatar URL or null if not available
 */
export const getUserAvatarUrl = (
  user?: { profile_picture?: string | null; [key: string]: unknown } | null,
  authorData?: { author_picture?: string | null; authorAvatarUrl?: string | null; user?: { profile_picture?: string | null }; [key: string]: unknown } | null
): string | null => {
  // Priority 1: Direct user profile_picture
  const fromUser = resolveProfileImageSrc(user?.profile_picture ?? null);
  if (fromUser) return fromUser;

  // Priority 2: Author data from post (author_picture)
  const fromAuthorPicture = resolveProfileImageSrc(authorData?.author_picture ?? null);
  if (fromAuthorPicture) return fromAuthorPicture;

  // Priority 3: Author data from post (authorAvatarUrl)
  const fromAuthorAvatar = resolveProfileImageSrc(authorData?.authorAvatarUrl ?? null);
  if (fromAuthorAvatar) return fromAuthorAvatar;

  // Priority 4: Nested user in author data
  const fromNestedUser = resolveProfileImageSrc(authorData?.user?.profile_picture ?? null);
  if (fromNestedUser) return fromNestedUser;

  // No avatar available - return null (component should show initials/default)
  return null;
};

/**
 * Get user initials from name
 * @param name - User's full name
 * @returns Initials string (e.g., "John Doe" -> "JD")
 */
export const getUserInitials = (name: string | null | undefined): string => {
  if (!name || name.trim().length === 0) return "?";
  const parts = name.trim().split(" ");
  if (parts.length >= 2) {
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  }
  return name[0].toUpperCase();
};
