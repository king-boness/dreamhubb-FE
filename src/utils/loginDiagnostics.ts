/**
 * iOS / Capacitor login troubleshooting — logs are prefixed [DH-LOGIN-DIAG].
 * Safe to keep: no passwords; email is redacted.
 */

const PREFIX = "[DH-LOGIN-DIAG]";

export function redactEmail(email: string): string {
  const t = email.trim();
  const at = t.indexOf("@");
  if (at <= 0) return "(invalid)";
  const local = t.slice(0, at);
  const domain = t.slice(at + 1);
  const head = local.slice(0, 2);
  return `${head}***@${domain}`;
}

export function logLoginDiag(phase: string, data: Record<string, unknown>): void {
  try {
    console.info(PREFIX, phase, data);
  } catch {
    console.info(PREFIX, phase, String(data));
  }
}

export function summarizeAxiosError(err: unknown): Record<string, unknown> {
  if (!err || typeof err !== "object") {
    return { rawType: typeof err };
  }
  const e = err as {
    message?: string;
    code?: string;
    name?: string;
    isAxiosError?: boolean;
    response?: { status?: number; data?: unknown; headers?: unknown };
    request?: unknown;
    config?: { url?: string; baseURL?: string; method?: string };
  };
  const data = e.response?.data;
  let dataSummary: string | undefined;
  if (data == null) dataSummary = undefined;
  else if (typeof data === "string") dataSummary = data.slice(0, 200);
  else if (typeof data === "object") {
    try {
      dataSummary = JSON.stringify(data).slice(0, 400);
    } catch {
      dataSummary = "(unserializable)";
    }
  } else dataSummary = String(data);

  return {
    name: e.name,
    message: e.message,
    code: e.code,
    isAxiosError: !!e.isAxiosError,
    responseStatus: e.response?.status,
    responseDataPreview: dataSummary,
    hasRequest: !!e.request,
    configMethod: e.config?.method,
    configUrl: e.config?.url,
    configBaseURL: e.config?.baseURL
  };
}
