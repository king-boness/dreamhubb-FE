import type { AxiosError } from "axios";

export type DhErrorKind =
  | "offline"
  | "timeout"
  | "network"
  | "unauthorized"
  | "forbidden"
  | "not_found"
  | "validation"
  | "too_many_requests"
  | "server"
  | "unknown";

export interface DhError {
  kind: DhErrorKind;
  status?: number;
  messageKey: string; // i18n key (dot path)
  fallbackMessage: string;
  fieldErrors?: Record<string, string[]>;
  rawMessage?: string;
  retryable: boolean;
}

export function isAxiosErrorLike(err: unknown): err is AxiosError {
  return !!(err && typeof err === "object" && "isAxiosError" in err);
}

export function isOffline(): boolean {
  try {
    return typeof navigator !== "undefined" && navigator.onLine === false;
  } catch {
    return false;
  }
}

export function isTimeoutError(err: unknown): boolean {
  if (!isAxiosErrorLike(err)) return false;
  return err.code === "ECONNABORTED";
}

export function isNetworkError(err: unknown): boolean {
  if (!isAxiosErrorLike(err)) return false;
  // Axios uses ERR_NETWORK for fetch/xhr failures (CORS/offline/DNS)
  return err.code === "ERR_NETWORK";
}

export function extractLaravelValidationErrors(err: unknown): Record<string, string[]> | undefined {
  if (!isAxiosErrorLike(err)) return undefined;
  const data: unknown = err.response?.data;
  if (!data || typeof data !== "object") return undefined;
  const rec = data as Record<string, unknown>;
  const errors = rec.errors;
  if (!errors || typeof errors !== "object") return undefined;
  return errors as Record<string, string[]>;
}

export function firstValidationMessage(fieldErrors?: Record<string, string[]>): string | undefined {
  if (!fieldErrors) return undefined;
  for (const key of Object.keys(fieldErrors)) {
    const arr = fieldErrors[key];
    const msg = Array.isArray(arr) ? arr.find((x) => typeof x === "string" && x.trim().length > 0) : undefined;
    if (msg) return msg;
  }
  return undefined;
}

export function mapAxiosErrorToDhError(err: unknown): DhError {
  // Offline first (most user-friendly)
  if (isOffline()) {
    return {
      kind: "offline",
      messageKey: "common.errors.offline",
      fallbackMessage: "You're offline. Check your connection.",
      retryable: true
    };
  }

  if (isTimeoutError(err)) {
    return {
      kind: "timeout",
      messageKey: "common.errors.timeout",
      fallbackMessage: "Request timed out. Please try again.",
      retryable: true
    };
  }

  if (isNetworkError(err)) {
    return {
      kind: "network",
      messageKey: "common.errors.network",
      fallbackMessage: "Network error. Please try again.",
      retryable: true
    };
  }

  if (!isAxiosErrorLike(err)) {
    return {
      kind: "unknown",
      messageKey: "common.errors.server",
      fallbackMessage: "Something went wrong. Please try again.",
      retryable: true
    };
  }

  const status = err.response?.status;
  const data: unknown = err.response?.data;
  const rawMessage =
    (data && typeof data === "object" && "message" in data ? String((data as Record<string, unknown>).message ?? "") : "") ||
    err.message;

  if (status === 401) {
    return {
      kind: "unauthorized",
      status,
      messageKey: "common.errors.sessionExpired",
      fallbackMessage: "Session expired. Please sign in again.",
      rawMessage,
      retryable: false
    };
  }
  if (status === 403) {
    return {
      kind: "forbidden",
      status,
      messageKey: "common.errors.forbidden",
      fallbackMessage: "You don't have permission to do that.",
      rawMessage,
      retryable: false
    };
  }
  if (status === 404) {
    return {
      kind: "not_found",
      status,
      messageKey: "common.errors.notFound",
      fallbackMessage: "Content not found.",
      rawMessage,
      retryable: false
    };
  }
  if (status === 422) {
    const fieldErrors = extractLaravelValidationErrors(err);
    const firstMsg = firstValidationMessage(fieldErrors);
    return {
      kind: "validation",
      status,
      messageKey: "common.errors.validation",
      fallbackMessage: firstMsg || "Please check your input and try again.",
      fieldErrors,
      rawMessage,
      retryable: false
    };
  }
  if (status === 429) {
    return {
      kind: "too_many_requests",
      status,
      messageKey: "common.errors.tooManyRequests",
      fallbackMessage: "Too many requests. Try again later.",
      rawMessage,
      retryable: true
    };
  }
  if (typeof status === "number" && status >= 500) {
    return {
      kind: "server",
      status,
      messageKey: "common.errors.server",
      fallbackMessage: "Something went wrong. Please try again.",
      rawMessage,
      retryable: true
    };
  }

  return {
    kind: "unknown",
    status,
    messageKey: "common.errors.server",
    fallbackMessage: "Something went wrong. Please try again.",
    rawMessage,
    retryable: true
  };
}
