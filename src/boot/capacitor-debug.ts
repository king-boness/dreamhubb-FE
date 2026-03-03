import { boot } from "quasar/wrappers";

const MAX_OPTIONS_BYTES = 2048;

/** Redact options for logging: no binary/base64/large payloads, cap ~2KB text. */
function optionsRedacted(options: unknown): string {
  if (options == null) return String(options);
  const seen = new WeakSet();
  function replacer(_key: string, value: unknown): unknown {
    if (value == null) return value;
    if (typeof value === "object" && value !== null) {
      if (seen.has(value as object)) return "[Circular]";
      seen.add(value as object);
    }
    if (typeof value === "string") {
      const looksBase64 = /^[A-Za-z0-9+/]+=*$/.test(value) && value.length > 80;
      const looksBinary = [...value].some((_, i) => {
        const c = value.charCodeAt(i);
        return c < 32 && c !== 9 && c !== 10 && c !== 13;
      });
      if (looksBase64 || looksBinary) return `[redacted ${value.length} chars]`;
      if (value.length > 500) return value.slice(0, 500) + "[truncated]";
    }
    return value;
  }
  try {
    const str = JSON.stringify(options, replacer);
    return str.length > MAX_OPTIONS_BYTES ? str.slice(0, MAX_OPTIONS_BYTES) + "[truncated]" : str;
  } catch {
    return "[serialize error]";
  }
}

export default boot(() => {
  if (!import.meta.env.DEV) return;

  const w = window as Window & { Capacitor?: { nativePromise?: (...a: unknown[]) => Promise<unknown>; nativeCallback?: (...a: unknown[]) => void; __nativePromiseWrapped?: boolean; __nativeCallbackWrapped?: boolean } };
  const Cap = w.Capacitor;

  if (!Cap) {
    console.warn("[cap-debug] window.Capacitor not found");
    return;
  }

  // Wrap nativePromise
  if (typeof Cap.nativePromise === "function" && !Cap.__nativePromiseWrapped) {
    const orig = Cap.nativePromise.bind(Cap);
    Cap.nativePromise = (plugin: string, method: string, options: unknown) => {
      console.log("[cap-debug] CALL", { plugin, method, optionsRedacted: optionsRedacted(options) });
      const stack = new Error("[cap-debug] call stack").stack;
      return orig(plugin, method, options).catch((err: unknown) => {
        console.error("[cap-debug] FAILED", {
          plugin,
          method,
          err,
          stack
        });
        throw err;
      });
    };
    Cap.__nativePromiseWrapped = true;
  }

  // Wrap nativeCallback
  if (typeof Cap.nativeCallback === "function" && !Cap.__nativeCallbackWrapped) {
    const origCb = Cap.nativeCallback.bind(Cap);
    Cap.nativeCallback = (plugin: string, method: string, options: unknown, cb: (...args: unknown[]) => void) => {
      console.log("[cap-debug] CALL", { plugin, method, optionsRedacted: optionsRedacted(options) });
      const stack = new Error("[cap-debug] call stack").stack;
      return origCb(plugin, method, options, (...args: unknown[]) => {
        try {
          const maybeErr = args?.[0] as { code?: string } | undefined;
          if (maybeErr && maybeErr.code === "UNIMPLEMENTED") {
            console.error("[cap-debug] FAILED", {
              plugin,
              method,
              err: maybeErr,
              stack
            });
          }
        } catch {
          // ignore
        }
        // eslint-disable-next-line n/no-callback-literal -- forwarding Capacitor callback args
        return cb?.(...args);
      });
    };
    Cap.__nativeCallbackWrapped = true;
  }

  console.log("[cap-debug] enabled");
});
