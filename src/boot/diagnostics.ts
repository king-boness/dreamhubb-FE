import { boot } from "quasar/wrappers";
import { getLastRequest, pushRequest } from "src/utils/diagnostics-buffer";

const SPAM_WINDOW_MS = 10_000;
const SPAM_THRESHOLD = 5;

function normalizeMessage(text: string): string {
  return text.replace(/\s+/g, " ").trim().slice(0, 120);
}

function matchesDownloadFailed(text: string): boolean {
  const lower = text.toLowerCase();
  return (
    lower.includes("downloadfailed") || lower.includes("updated list with error")
  );
}

export default boot(() => {
  if (!import.meta.env.DEV) return;

  const spamCounts: { key: string; count: number; firstAt: number }[] = [];

  function pruneSpam() {
    const now = Date.now();
    for (let i = spamCounts.length - 1; i >= 0; i--) {
      if (now - spamCounts[i].firstAt > SPAM_WINDOW_MS) spamCounts.splice(i, 1);
    }
  }

  function recordSpam(key: string): boolean {
    pruneSpam();
    const now = Date.now();
    let entry = spamCounts.find((e) => e.key === key);
    if (!entry) {
      entry = { key, count: 0, firstAt: now };
      spamCounts.push(entry);
    }
    entry.count++;
    return entry.count > SPAM_THRESHOLD;
  }

  // ---- Global error hooks ----
  window.addEventListener("error", (event: ErrorEvent) => {
    const message = event.message ?? String(event.error);
    const stack = event.error?.stack ?? new Error().stack;
    const sourceHint = event.filename
      ? `${event.filename}:${event.lineno ?? "?"}:${event.colno ?? "?"}`
      : undefined;
    console.error("[diagnostics] window.error", {
      message,
      stack,
      sourceHint
    });
  });

  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    const reason = event.reason;
    const message = reason?.message ?? String(reason);
    const stack = reason?.stack ?? new Error().stack;
    const sourceHint = reason?.fileName
      ? `${reason.fileName}:${reason.lineNumber ?? "?"}`
      : undefined;
    console.error("[diagnostics] unhandledrejection", {
      reason: message,
      stack,
      sourceHint
    });
  });

  // ---- Console wrap ----
  const origLog = console.log;
  const origWarn = console.warn;
  const origError = console.error;

  function wrap(orig: typeof console.log): typeof console.log {
    return function (...args: unknown[]) {
      const text = args
        .map((a) =>
          a != null && typeof a === "object" && "message" in a
            ? String((a as { message?: unknown }).message)
            : String(a)
        )
        .join(" ");

      if (matchesDownloadFailed(text)) {
        const key = normalizeMessage(text);
        if (recordSpam(key)) {
          orig.call(
            console,
            "[diagnostics] MATCH DownloadFailed — suppressed (rate limit)."
          );
          return;
        }
        const stack = new Error("[diagnostics] call stack").stack;
        const lastNetwork = getLastRequest();
        orig.apply(console, args);
        orig.call(console, "[diagnostics] MATCH DownloadFailed");
        orig.call(console, "stack:", stack);
        orig.call(
          console,
          "lastNetwork:",
          lastNetwork
            ? {
                url: lastNetwork.url,
                method: lastNetwork.method,
                status: lastNetwork.status,
                durationMs: lastNetwork.durationMs,
                kind: lastNetwork.kind,
                errorMessage: lastNetwork.errorMessage
              }
            : "(none)"
        );
        return;
      }
      return orig.apply(console, args);
    };
  }

  console.log = wrap(origLog);
  console.warn = wrap(origWarn);
  console.error = wrap(origError);

  // ---- Fetch wrapper (DEV) ----
  const origFetch = window.fetch;
  window.fetch = async (input: any, init?: any): Promise<Response> => {
    const url = typeof input === "string" ? input : input instanceof URL ? input.href : input.url;
    const method = init?.method ?? "GET";
    const start = Date.now();
    let status: number | undefined;
    let ok: boolean | undefined;
    let errorMessage: string | undefined;

    try {
      const res = await origFetch.call(window, input, init);
      status = res.status;
      ok = res.ok;
      pushRequest({
        ts: start,
        kind: "fetch",
        method,
        url: String(url),
        status,
        ok,
        durationMs: Date.now() - start
      });
      return res;
    } catch (err) {
      errorMessage = err instanceof Error ? err.message : String(err);
      pushRequest({
        ts: start,
        kind: "fetch",
        method,
        url: String(url),
        durationMs: Date.now() - start,
        errorMessage
      });
      throw err;
    }
  };
});
