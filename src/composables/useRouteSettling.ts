import { onBeforeUnmount, watch } from "vue";
import { useRoute } from "vue-router";

const SETTLE_MS = 200;
let settleTimer: ReturnType<typeof setTimeout> | null = null;
let settleCount = 0;

function clearRouteSettling() {
  if (settleTimer) {
    clearTimeout(settleTimer);
    settleTimer = null;
  }
  if (settleCount > 0) {
    settleCount = 0;
    document.body.classList.remove("dh-route-settling");
  }
}

/** Marks body during fast tab/route changes so overlays wait for paint. */
export function useRouteSettlingBodyClass(): void {
  const route = useRoute();

  watch(
    () => route.fullPath,
    () => {
      clearRouteSettling();
      settleCount += 1;
      document.body.classList.add("dh-route-settling");
      settleTimer = setTimeout(() => {
        settleCount = Math.max(0, settleCount - 1);
        if (settleCount === 0) {
          document.body.classList.remove("dh-route-settling");
        }
        settleTimer = null;
      }, SETTLE_MS);
    }
  );

  onBeforeUnmount(clearRouteSettling);
}
