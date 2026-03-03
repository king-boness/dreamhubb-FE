import { boot } from "quasar/wrappers";
import { Capacitor } from "@capacitor/core";

/**
 * Capacitor Status Bar - iOS overlay:false + platform-ios class
 * Prevents webview from starting under status bar; content respects safe area.
 * Adds .platform-ios to body for CSS safe-area targeting.
 * Only runs on native iOS. Android/web unchanged.
 */
export default boot(() => {
  if (!Capacitor?.isNativePlatform?.() || Capacitor?.getPlatform?.() !== "ios") {
    return;
  }
  document.body.classList.add("platform-ios");
  // setOverlaysWebView is UNIMPLEMENTED on iOS (@capacitor/status-bar native plugin);
  // calling it would spam logs with {"code":"UNIMPLEMENTED"}. Skip on iOS.
  // Other StatusBar methods (setStyle, setBackgroundColor) work and can be used elsewhere.
});
