/**
 * Safe user-facing mapping for post-create 422 field errors.
 * Never surface arbitrary backend exception strings.
 */

export type SafeValidationMessage = {
  messageKey: string;
  fallbackMessage: string;
};

function firstMsg(fieldErrors: Record<string, string[]>, field: string): string {
  const arr = fieldErrors[field];
  if (!Array.isArray(arr)) return "";
  const hit = arr.find((x) => typeof x === "string" && x.trim().length > 0);
  return hit ? hit.toLowerCase() : "";
}

/**
 * Map Laravel field errors / message to a safe i18n key + English fallback.
 * Returns null → caller should use generic common.errors.validation.
 */
export function mapPostCreateValidationToSafeMessage(
  fieldErrors?: Record<string, string[]>,
  rawMessage?: string
): SafeValidationMessage | null {
  const raw = (rawMessage || "").toLowerCase();

  if (/insufficient tokens/i.test(raw)) {
    return {
      messageKey: "posts.errors.insufficientTokens",
      fallbackMessage: "You don't have enough tokens for this reward."
    };
  }

  if (!fieldErrors || typeof fieldErrors !== "object") {
    return null;
  }

  const fields = Object.keys(fieldErrors);

  for (const field of fields) {
    const f = field.toLowerCase();
    const msg = firstMsg(fieldErrors, field);

    if (f === "file" || f === "images" || f.startsWith("images.")) {
      if (
        msg.includes("kilobyte") ||
        msg.includes("may not be greater than") ||
        msg.includes("10 mb") ||
        msg.includes("10240")
      ) {
        return {
          messageKey: "posts.errors.imageTooLarge",
          fallbackMessage: "This image is too large. Maximum size is 10 MB."
        };
      }
      if (
        msg.includes("must be an image") ||
        msg.includes("file of type") ||
        msg.includes("must be a file") ||
        msg.includes("image")
      ) {
        return {
          messageKey: "posts.errors.unsupportedImageFormat",
          fallbackMessage: "Unsupported image format. Please use JPG, PNG, GIF or WebP."
        };
      }
      return {
        messageKey: "posts.errors.imageUploadFailed",
        fallbackMessage: "Image upload failed. Please choose another image."
      };
    }

    if (f === "tokens") {
      return {
        messageKey: "posts.errors.invalidTokens",
        fallbackMessage: "Please choose a valid token amount (minimum 3)."
      };
    }

    if (f === "title") {
      return {
        messageKey: "posts.errors.invalidTitle",
        fallbackMessage: "Please check the title and try again."
      };
    }

    if (f === "description") {
      return {
        messageKey: "posts.errors.invalidDescription",
        fallbackMessage: "Please check the description and try again."
      };
    }

    if (f === "category" || f === "type" || f === "post_type" || f === "category_id") {
      return {
        messageKey: "posts.errors.invalidCategory",
        fallbackMessage: "Please choose a valid category."
      };
    }

    if (f === "subcategory" || f === "subcategory_id" || f === "fe_category") {
      return {
        messageKey: "posts.errors.invalidSubcategory",
        fallbackMessage: "Please choose a valid subcategory."
      };
    }
  }

  return null;
}
