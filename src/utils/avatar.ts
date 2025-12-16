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
  if (user?.profile_picture) {
    if (process.env.NODE_ENV === "development") {
      console.log("✅ getUserAvatarUrl: Found in user.profile_picture:", user.profile_picture);
    }
    return user.profile_picture;
  }

  // Priority 2: Author data from post (author_picture)
  if (authorData?.author_picture) {
    if (process.env.NODE_ENV === "development") {
      console.log("✅ getUserAvatarUrl: Found in authorData.author_picture:", authorData.author_picture);
    }
    return authorData.author_picture;
  }

  // Priority 3: Author data from post (authorAvatarUrl)
  if (authorData?.authorAvatarUrl && !authorData.authorAvatarUrl.startsWith("data:image")) {
    if (process.env.NODE_ENV === "development") {
      console.log("✅ getUserAvatarUrl: Found in authorData.authorAvatarUrl:", authorData.authorAvatarUrl);
    }
    return authorData.authorAvatarUrl;
  }

  // Priority 4: Nested user in author data
  if (authorData?.user?.profile_picture) {
    if (process.env.NODE_ENV === "development") {
      console.log("✅ getUserAvatarUrl: Found in authorData.user.profile_picture:", authorData.user.profile_picture);
    }
    return authorData.user.profile_picture;
  }

  // No avatar available - return null (component should show initials/default)
  if (process.env.NODE_ENV === "development") {
    console.log("❌ getUserAvatarUrl: No avatar found", { user, authorData });
  }
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
