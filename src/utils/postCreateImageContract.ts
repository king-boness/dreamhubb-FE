/**
 * Canonical post-create image contract helpers.
 * Create payload must be XOR: File[] multipart OR https Cloudinary URLs — never mixed.
 *
 * Field map for N files:
 *   files[0] → FormData `file`
 *   files[1] → FormData `images[]` → Laravel `images.0`
 *   files[2] → FormData `images[]` → Laravel `images.1`
 *   …
 *
 * End-to-end supported formats (aligned with BE ImageUploadService::ALLOWED_MIMES):
 *   JPEG/JPG, PNG, GIF, WebP
 * Not supported (reject at pick + BE mimes):
 *   AVIF, HEIC, HEIF
 */

/** Max image size (10 MB) — matches BE max:10240 KB. */
export const POST_CREATE_MAX_IMAGE_BYTES = 10 * 1024 * 1024;

/** Max photos per post. */
export const POST_CREATE_MAX_IMAGES = 5;

/** MIME types accepted end-to-end (browser → Laravel mimes → local/Cloudinary store). */
export const POST_CREATE_ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/gif",
  "image/webp"
]);

const ALLOWED_EXTENSIONS = new Set(["jpg", "jpeg", "png", "gif", "webp"]);

/** `<input accept>` value — explicit list (not image/*) so pickers hide HEIC/AVIF when possible. */
export const POST_CREATE_ACCEPT =
  "image/jpeg,image/jpg,image/png,image/gif,image/webp,.jpg,.jpeg,.png,.gif,.webp";

export type ImagePickValidation =
  | { ok: true }
  | { ok: false; messageKey: string; fallbackMessage: string };

function extensionOf(filename: string): string {
  const base = filename.split(/[/\\]/).pop() || "";
  const dot = base.lastIndexOf(".");
  if (dot < 0) return "";
  return base.slice(dot + 1).toLowerCase();
}

export function isAllowedPostCreateImageType(mime: string, filename = ""): boolean {
  const type = (mime || "").toLowerCase().trim();
  if (type && POST_CREATE_ALLOWED_MIME_TYPES.has(type)) return true;
  // Empty MIME (some Android/WebView): allow only by known safe extension.
  if (!type) {
    return ALLOWED_EXTENSIONS.has(extensionOf(filename));
  }
  return false;
}

/**
 * Validate a File at pick-time (MIME + size). Does not trust extension alone when MIME is present.
 */
export function validateSelectedImageFile(file: File): ImagePickValidation {
  if (!file || typeof file !== "object") {
    return {
      ok: false,
      messageKey: "posts.errors.unsupportedImageFormat",
      fallbackMessage: "Unsupported image format. Please use JPG, PNG, GIF or WebP."
    };
  }
  if (!isAllowedPostCreateImageType(file.type || "", file.name || "")) {
    return {
      ok: false,
      messageKey: "posts.errors.unsupportedImageFormat",
      fallbackMessage: "Unsupported image format. Please use JPG, PNG, GIF or WebP."
    };
  }
  if (typeof file.size === "number" && file.size > POST_CREATE_MAX_IMAGE_BYTES) {
    return {
      ok: false,
      messageKey: "posts.errors.imageTooLarge",
      fallbackMessage: "This image is too large. Maximum size is 10 MB."
    };
  }
  return { ok: true };
}

/**
 * Filter a FileList/File[] at pick-time. Invalid files are omitted; first error is returned.
 */
export function filterValidImageFilesAtPick(
  incoming: File[],
  alreadyCount: number,
  maxImages = POST_CREATE_MAX_IMAGES
): { accepted: File[]; rejected: File[]; error: ImagePickValidation & { ok: false } | null } {
  const remaining = Math.max(0, maxImages - alreadyCount);
  if (remaining <= 0) {
    return {
      accepted: [],
      rejected: incoming,
      error: {
        ok: false,
        messageKey: "posts.maxPhotos",
        fallbackMessage: `Maximum ${maxImages} photos.`
      }
    };
  }

  const accepted: File[] = [];
  const rejected: File[] = [];
  let error: (ImagePickValidation & { ok: false }) | null = null;

  for (const file of incoming) {
    if (accepted.length >= remaining) {
      rejected.push(file);
      if (!error) {
        error = {
          ok: false,
          messageKey: "posts.maxPhotos",
          fallbackMessage: `Maximum ${maxImages} photos.`
        };
      }
      continue;
    }
    const v = validateSelectedImageFile(file);
    if (!v.ok) {
      rejected.push(file);
      if (!error) error = v;
      continue;
    }
    accepted.push(file);
  }

  return { accepted, rejected, error };
}

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

/**
 * After removing a preview, sync remote URL store:
 * - File[] mode → always []
 * - URL-only mode → https URLs only (never blob/data)
 */
export function storeImagesAfterLocalDelete(
  remainingFiles: File[],
  remainingPreviews: string[]
): string[] {
  if (remainingFiles.length > 0) return [];
  return remainingPreviews.filter((u) => isRemoteImageUrl(u));
}
