import { boot } from "quasar/wrappers";

/**
 * Production launch guard: log and swallow unhandled rejections during cold start
 * so a failed optional init (network, storage) does not take down WKWebView.
 */
export default boot(() => {
  if (import.meta.env.DEV) return;

  const logStartupFailure = (label: string, reason: unknown) => {
    const message = reason instanceof Error ? reason.message : String(reason);
    console.error(`[launch-safe] ${label}:`, message);
  };

  window.addEventListener("unhandledrejection", (event: PromiseRejectionEvent) => {
    logStartupFailure("unhandledrejection", event.reason);
    event.preventDefault();
  });

  window.addEventListener("error", (event: ErrorEvent) => {
    logStartupFailure("error", event.error ?? event.message);
  });
});
