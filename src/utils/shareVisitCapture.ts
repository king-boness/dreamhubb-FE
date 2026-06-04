import type { RouteLocationNormalized } from "vue-router";
import { recordShareVisit } from "src/services/shareTrackingService";

const VISIT_SESSION_PREFIX = "dh_share_visit_";

export function captureShareVisitFromRoute(to: RouteLocationNormalized): void {
  const raw = to.query.s;
  if (typeof raw !== "string") {
    return;
  }

  const token = raw.trim();
  if (!token) {
    return;
  }

  const storageKey = `${VISIT_SESSION_PREFIX}${token}`;
  if (typeof sessionStorage !== "undefined" && sessionStorage.getItem(storageKey) === "1") {
    return;
  }

  if (typeof sessionStorage !== "undefined") {
    sessionStorage.setItem(storageKey, "1");
  }

  void recordShareVisit(token).catch(() => {
    /* silent — analytics must not block navigation */
  });
}
