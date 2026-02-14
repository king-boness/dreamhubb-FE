import { boot } from "quasar/wrappers";
import { Capacitor } from "@capacitor/core";

/**
 * Capacitor Status Bar - iOS overlay:false + platform-ios class
 * Prevents webview from starting under status bar; content respects safe area.
 * Adds .platform-ios to body for CSS safe-area targeting.
 * Only runs on native iOS. Android/web unchanged.
 */
export default boot(async () => {
  if (Capacitor?.getPlatform?.() !== "ios") {
    return;
  }
  document.body.classList.add("platform-ios");
  try {
    const { StatusBar } = await import("@capacitor/status-bar");
    await StatusBar.setOverlaysWebView({ overlay: false });
  } catch (e) {
    if (import.meta.env.DEV) {
      console.debug("[capacitor-status-bar] setOverlaysWebView failed (non-blocking):", e);
    }
  }
});
