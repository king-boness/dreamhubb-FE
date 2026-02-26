import { Notify } from "quasar";
import type { DhError } from "src/utils/httpError";
import { tGlobal } from "src/utils/i18nGlobal";

type NotifyOpts = {
  timeout?: number;
  position?: "top" | "bottom" | "top-left" | "top-right" | "bottom-left" | "bottom-right";
};

const lastToastAt: Record<string, number> = {};
const TOAST_DEDUP_MS = 1200;

export function notifyError(err: DhError, opts?: NotifyOpts) {
  // Avoid spamming user with raw backend strings and avoid toast floods.
  const key = `${err.kind}:${err.status ?? "na"}:${err.messageKey}`;
  const now = Date.now();
  if (lastToastAt[key] && now - lastToastAt[key] < TOAST_DEDUP_MS) {
    return;
  }
  lastToastAt[key] = now;

  const message = tGlobal(err.messageKey, err.fallbackMessage);
  Notify.create({
    type: "negative",
    message,
    position: opts?.position ?? "top",
    timeout: opts?.timeout ?? 6000
  });
}

export function notifySuccess(messageKey: string, fallback: string, opts?: NotifyOpts) {
  Notify.create({
    type: "positive",
    message: tGlobal(messageKey, fallback),
    position: opts?.position ?? "top",
    timeout: opts?.timeout ?? 4000
  });
}

export function notifyInfo(messageKey: string, fallback: string, opts?: NotifyOpts) {
  Notify.create({
    type: "info",
    message: tGlobal(messageKey, fallback),
    position: opts?.position ?? "top",
    timeout: opts?.timeout ?? 4500
  });
}

/** Show a negative toast with a plain message (no i18n). Use for client-only limits (e.g. max photos). */
export function notifyNegative(message: string, opts?: NotifyOpts) {
  Notify.create({
    type: "negative",
    message,
    position: opts?.position ?? "top",
    timeout: opts?.timeout ?? 2000
  });
}
