import type { RouteLocationNormalized } from "vue-router";
import { recordShareVisit } from "src/services/shareTrackingService";

const VISIT_SESSION_PREFIX = "dh_share_visit_";

export function shareVisitStorageKey(token: string): string {
  return `${VISIT_SESSION_PREFIX}${token}`;
}

export function isOpenShareRoute(to: RouteLocationNormalized): boolean {
  return to.path === "/open" || to.name === "open-share";
}

export function isShareVisitRecorded(token: string): boolean {
  if (typeof sessionStorage === "undefined") {
    return false;
  }

  return sessionStorage.getItem(shareVisitStorageKey(token)) === "1";
}

export function markShareVisitRecorded(token: string): void {
  if (typeof sessionStorage === "undefined") {
    return;
  }

  sessionStorage.setItem(shareVisitStorageKey(token), "1");
}

/**
 * Records share visit for ?s= on non-/open routes. /open is handled by OpenSharePage.
 */
export function captureShareVisitFromRoute(to: RouteLocationNormalized): void {
  if (isOpenShareRoute(to)) {
    return;
  }

  const raw = to.query.s;
  if (typeof raw !== "string") {
    return;
  }

  const token = raw.trim();
  if (!token) {
    return;
  }

  if (isShareVisitRecorded(token)) {
    return;
  }

  void recordShareVisit(token)
    .then(() => {
      markShareVisitRecorded(token);
      if (import.meta.env?.DEV) {
        console.debug("[share-visit-capture] recorded", { path: to.path });
      }
    })
    .catch((err) => {
      if (import.meta.env?.DEV) {
        console.debug("[share-visit-capture] failed", { path: to.path, err });
      }
    });
}
