/**
 * DEV-only ring buffer for last N network requests.
 * Used by diagnostics boot and axios interceptors to attach "last request" context
 * when logging DownloadFailed etc. No sensitive data (no Authorization, query params redacted).
 */

export interface DiagnosticsRequestEntry {
  ts: number;
  kind: "axios" | "fetch";
  method: string;
  url: string;
  status?: number;
  ok?: boolean;
  durationMs?: number;
  errorMessage?: string;
}

const RING_SIZE = 20;
const entries: DiagnosticsRequestEntry[] = [];
let index = 0;

/** Redact URL: strip query string to avoid logging tokens/sensitive params. */
export function redactUrl(url: string): string {
  if (!url || typeof url !== "string") return "";
  try {
    const u = url.indexOf("?");
    return u === -1 ? url : url.slice(0, u);
  } catch {
    return "";
  }
}

export function pushRequest(entry: DiagnosticsRequestEntry): void {
  const e = { ...entry, url: redactUrl(entry.url) };
  entries[index % RING_SIZE] = e;
  index++;
}

/** Get the most recent request (for attaching to DownloadFailed logs). */
export function getLastRequest(): DiagnosticsRequestEntry | null {
  if (index === 0) return null;
  return entries[(index - 1) % RING_SIZE] ?? null;
}
