import {
  computed,
  onActivated,
  onBeforeUnmount,
  onDeactivated,
  onMounted,
  ref,
  watch,
  type ComputedRef,
  type MaybeRefOrGetter,
  toValue
} from "vue";
import { useRoute } from "vue-router";
import { usePreferencesStore, type Side } from "src/stores/preferences";

export type UseDeferredOverlayOptions = {
  /** Only show when route.name matches (prevents stale bubble on other screens). */
  routeName?: string;
  /** Only show when preferences currentSide matches (instant hide on role switch). */
  requiredSide?: Side;
  /** Minimum delay after mount/activate before bubble can appear. */
  minDelayMs?: number;
};

/** True while role switch splash or route settle window is active. */
export function isGlobalOverlaySuppressed(): boolean {
  if (typeof document === "undefined") return false;
  return (
    document.body.classList.contains("dh-role-switching") ||
    document.body.classList.contains("dh-route-settling") ||
    document.body.classList.contains("splash-active") ||
    document.querySelector(".splash-overlay") !== null
  );
}

/**
 * Delays overlay UI (hint bubbles) until the host screen has painted and global
 * chrome transitions (role switch / tab change) have finished.
 */
export function useDeferredOverlay(
  shouldShow: MaybeRefOrGetter<boolean>,
  options: UseDeferredOverlayOptions = {}
): { visible: ComputedRef<boolean>; reset: () => void } {
  const route = useRoute();
  const preferencesStore = usePreferencesStore();
  const isReady = ref(false);
  let delayTimer: ReturnType<typeof setTimeout> | null = null;
  let rafId = 0;

  const clearTimers = () => {
    if (delayTimer) {
      clearTimeout(delayTimer);
      delayTimer = null;
    }
    if (rafId) {
      cancelAnimationFrame(rafId);
      rafId = 0;
    }
  };

  const reset = () => {
    isReady.value = false;
    clearTimers();
  };

  const scheduleReady = () => {
    reset();
    const minDelay = options.minDelayMs ?? 320;

    delayTimer = setTimeout(() => {
      delayTimer = null;
      if (options.routeName && route.name !== options.routeName) return;
      if (isGlobalOverlaySuppressed()) return;

      rafId = requestAnimationFrame(() => {
        rafId = requestAnimationFrame(() => {
          rafId = 0;
          if (options.routeName && route.name !== options.routeName) return;
          if (isGlobalOverlaySuppressed()) return;
          isReady.value = true;
        });
      });
    }, minDelay);
  };

  const visible = computed(() => {
    if (!isReady.value) return false;
    if (options.requiredSide && preferencesStore.currentSide !== options.requiredSide) {
      return false;
    }
    if (options.routeName && route.name !== options.routeName) return false;
    if (isGlobalOverlaySuppressed()) return false;
    return toValue(shouldShow);
  });

  watch(() => preferencesStore.currentSide, reset);

  watch(() => route.name, () => {
    reset();
    if (options.routeName && route.name === options.routeName) {
      scheduleReady();
    }
  });
  watch(() => route.fullPath, reset);

  watch(
    () => toValue(shouldShow),
    (show) => {
      if (!show) return;
      if (options.routeName && route.name !== options.routeName) return;
      if (!isReady.value && !delayTimer) scheduleReady();
    }
  );
  onMounted(scheduleReady);
  onActivated(scheduleReady);
  onDeactivated(reset);
  onBeforeUnmount(reset);

  return { visible, reset };
}
