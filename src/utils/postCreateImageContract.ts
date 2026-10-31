/**
 * Canonical post-create image contract helpers.
 * Create payload must be XOR: File[] multipart OR https Cloudinary URLs — never mixed.
 */

export function isRemoteImageUrl(url: string): boolean {
  return /^https?:\/\//i.test(url.trim());
}

export type CreateImagePayload =
  | { mode: "files"; files: File[] }
  | { mode: "urls"; urls: string[] }
  | { mode: "none" };

/**
 * Resolve XOR payload for createPost FormData.
 * Files win when present; otherwise only http(s) URLs are sent.
 */
export function resolveCreateImagePayload(
  imageFiles: File[] | undefined | null,
  storeImages: unknown[] | undefined | null
): CreateImagePayload {
  if (Array.isArray(imageFiles) && imageFiles.length > 0) {
    return { mode: "files", files: imageFiles };
  }

  const urls = (Array.isArray(storeImages) ? storeImages : [])
    .map((img) => {
      if (typeof img === "string") return img.trim();
      if (img && typeof img === "object" && "url" in img && typeof (img as { url: unknown }).url === "string") {
        return ((img as { url: string }).url || "").trim();
      }
      return "";
    })
    .filter((u): u is string => Boolean(u) && isRemoteImageUrl(u));

  if (urls.length > 0) {
    return { mode: "urls", urls };
  }

  return { mode: "none" };
}

/**
 * Keep preview URLs and File[] index-aligned after delete/add.
 */
export function alignImageFilesAndPreviews(
  files: File[],
  previews: string[]
): { files: File[]; previews: string[] } {
  const n = Math.min(files.length, previews.length);
  return {
    files: files.slice(0, n),
    previews: previews.slice(0, n)
  };
}
