import { describe, it, expect, beforeEach, vi } from "vitest";
import type { AxiosError } from "axios";
import {
  mapAxiosErrorToDhError,
  isAxiosErrorLike,
  isOffline,
  isTimeoutError,
  isNetworkError,
  extractLaravelValidationErrors
} from "./httpError";

describe("mapAxiosErrorToDhError", () => {
  beforeEach(() => {
    // Reset navigator.onLine mock
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
  });

  it("should map offline error correctly", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);

    const result = mapAxiosErrorToDhError({});

    expect(result.kind).toBe("offline");
    expect(result.messageKey).toBe("common.errors.offline");
    expect(result.fallbackMessage).toContain("offline");
    expect(result.retryable).toBe(true);
  });

  it("should map timeout error correctly", () => {
    const axiosError = {
      isAxiosError: true,
      code: "ECONNABORTED",
      message: "timeout"
    } as AxiosError;

    const result = mapAxiosErrorToDhError(axiosError);

    expect(result.kind).toBe("timeout");
    expect(result.messageKey).toBe("common.errors.timeout");
    expect(result.fallbackMessage).toContain("timed out");
    expect(result.retryable).toBe(true);
  });

  it("should map network error (ERR_NETWORK) correctly", () => {
    const axiosError = {
      isAxiosError: true,
      code: "ERR_NETWORK",
      message: "Network Error"
    } as AxiosError;

    const result = mapAxiosErrorToDhError(axiosError);

    expect(result.kind).toBe("network");
    expect(result.messageKey).toBe("common.errors.network");
    expect(result.fallbackMessage).toContain("Network error");
    expect(result.retryable).toBe(true);
  });

  it("should map 401 Unauthorized correctly", () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 401,
        data: { message: "Unauthorized" }
      },
      message: "Unauthorized"
    } as AxiosError;

    const result = mapAxiosErrorToDhError(axiosError);

    expect(result.kind).toBe("unauthorized");
    expect(result.status).toBe(401);
    expect(result.messageKey).toBe("common.errors.sessionExpired");
    expect(result.fallbackMessage).toContain("Session expired");
    expect(result.retryable).toBe(false);
  });

  it("should map 403 Forbidden correctly", () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 403,
        data: { message: "Forbidden" }
      },
      message: "Forbidden"
    } as AxiosError;

    const result = mapAxiosErrorToDhError(axiosError);

    expect(result.kind).toBe("forbidden");
    expect(result.status).toBe(403);
    expect(result.messageKey).toBe("common.errors.forbidden");
    expect(result.fallbackMessage).toContain("permission");
    expect(result.retryable).toBe(false);
  });

  it("should map 404 Not Found correctly", () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 404,
        data: { message: "Not Found" }
      },
      message: "Not Found"
    } as AxiosError;

    const result = mapAxiosErrorToDhError(axiosError);

    expect(result.kind).toBe("not_found");
    expect(result.status).toBe(404);
    expect(result.messageKey).toBe("common.errors.notFound");
    expect(result.fallbackMessage).toContain("not found");
    expect(result.retryable).toBe(false);
  });

  it("should map 422 Validation Error correctly with field errors", () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 422,
        data: {
          message: "Validation failed",
          errors: {
            email: ["The email field is required."],
            password: ["The password must be at least 6 characters."]
          }
        }
      },
      message: "Unprocessable Entity"
    } as AxiosError;

    const result = mapAxiosErrorToDhError(axiosError);

    expect(result.kind).toBe("validation");
    expect(result.status).toBe(422);
    expect(result.messageKey).toBe("common.errors.validation");
    expect(result.fallbackMessage).toContain("email field is required");
    expect(result.fieldErrors).toBeDefined();
    expect(result.fieldErrors?.email).toContain("The email field is required.");
    expect(result.retryable).toBe(false);
  });

  it("should map 422 Validation Error correctly without field errors", () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 422,
        data: { message: "Validation failed" }
      },
      message: "Unprocessable Entity"
    } as AxiosError;

    const result = mapAxiosErrorToDhError(axiosError);

    expect(result.kind).toBe("validation");
    expect(result.status).toBe(422);
    expect(result.messageKey).toBe("common.errors.validation");
    expect(result.fallbackMessage).toContain("check your input");
    expect(result.retryable).toBe(false);
  });

  it("should map 429 Too Many Requests correctly", () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 429,
        data: { message: "Too Many Requests" }
      },
      message: "Too Many Requests"
    } as AxiosError;

    const result = mapAxiosErrorToDhError(axiosError);

    expect(result.kind).toBe("too_many_requests");
    expect(result.status).toBe(429);
    expect(result.messageKey).toBe("common.errors.tooManyRequests");
    expect(result.fallbackMessage).toContain("Too many requests");
    expect(result.retryable).toBe(true);
  });

  it("should map 500 Server Error correctly", () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 500,
        data: { message: "Internal Server Error" }
      },
      message: "Internal Server Error"
    } as AxiosError;

    const result = mapAxiosErrorToDhError(axiosError);

    expect(result.kind).toBe("server");
    expect(result.status).toBe(500);
    expect(result.messageKey).toBe("common.errors.server");
    expect(result.fallbackMessage).toContain("Something went wrong");
    expect(result.retryable).toBe(true);
  });

  it("should map 502 Bad Gateway correctly", () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 502,
        data: { message: "Bad Gateway" }
      },
      message: "Bad Gateway"
    } as AxiosError;

    const result = mapAxiosErrorToDhError(axiosError);

    expect(result.kind).toBe("server");
    expect(result.status).toBe(502);
    expect(result.messageKey).toBe("common.errors.server");
    expect(result.retryable).toBe(true);
  });

  it("should map unknown error correctly", () => {
    const result = mapAxiosErrorToDhError(new Error("Unknown error"));

    expect(result.kind).toBe("unknown");
    expect(result.messageKey).toBe("common.errors.server");
    expect(result.fallbackMessage).toContain("Something went wrong");
    expect(result.retryable).toBe(true);
  });

  it("should always return safe i18n key (never raw error message)", () => {
    const axiosError = {
      isAxiosError: true,
      response: {
        status: 500,
        data: { message: "Raw error: SQLSTATE[HY000]: General error: 1364" }
      },
      message: "Raw error: SQLSTATE[HY000]: General error: 1364"
    } as AxiosError;

    const result = mapAxiosErrorToDhError(axiosError);

    // messageKey should be safe i18n key, not raw message
    expect(result.messageKey).toBe("common.errors.server");
    expect(result.messageKey).not.toContain("SQLSTATE");
    expect(result.messageKey).not.toContain("HY000");
    // fallbackMessage should be safe, not raw
    expect(result.fallbackMessage).not.toContain("SQLSTATE");
    expect(result.fallbackMessage).not.toContain("HY000");
  });
});

describe("isAxiosErrorLike", () => {
  it("should return true for AxiosError-like object", () => {
    const err = { isAxiosError: true };
    expect(isAxiosErrorLike(err)).toBe(true);
  });

  it("should return false for regular Error", () => {
    expect(isAxiosErrorLike(new Error("test"))).toBe(false);
  });

  it("should return false for null/undefined", () => {
    expect(isAxiosErrorLike(null)).toBe(false);
    expect(isAxiosErrorLike(undefined)).toBe(false);
  });
});

describe("isOffline", () => {
  it("should return true when navigator.onLine is false", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(false);
    expect(isOffline()).toBe(true);
  });

  it("should return false when navigator.onLine is true", () => {
    vi.spyOn(navigator, "onLine", "get").mockReturnValue(true);
    expect(isOffline()).toBe(false);
  });
});

describe("isTimeoutError", () => {
  it("should return true for ECONNABORTED code", () => {
    const err = { isAxiosError: true, code: "ECONNABORTED" } as AxiosError;
    expect(isTimeoutError(err)).toBe(true);
  });

  it("should return false for other codes", () => {
    const err = { isAxiosError: true, code: "ERR_NETWORK" } as AxiosError;
    expect(isTimeoutError(err)).toBe(false);
  });
});

describe("isNetworkError", () => {
  it("should return true for ERR_NETWORK code", () => {
    const err = { isAxiosError: true, code: "ERR_NETWORK" } as AxiosError;
    expect(isNetworkError(err)).toBe(true);
  });

  it("should return false for other codes", () => {
    const err = { isAxiosError: true, code: "ECONNABORTED" } as AxiosError;
    expect(isNetworkError(err)).toBe(false);
  });
});

describe("extractLaravelValidationErrors", () => {
  it("should extract Laravel validation errors", () => {
    const err = {
      isAxiosError: true,
      response: {
        data: {
          errors: {
            email: ["The email field is required."],
            password: ["The password must be at least 6 characters."]
          }
        }
      }
    } as AxiosError;

    const result = extractLaravelValidationErrors(err);
    expect(result).toBeDefined();
    expect(result?.email).toContain("The email field is required.");
    expect(result?.password).toContain("The password must be at least 6 characters.");
  });

  it("should return undefined when no errors object", () => {
    const err = {
      isAxiosError: true,
      response: { data: {} }
    } as AxiosError;

    expect(extractLaravelValidationErrors(err)).toBeUndefined();
  });
});
