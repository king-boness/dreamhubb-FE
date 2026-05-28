import { Capacitor } from "@capacitor/core";
import { Camera, CameraResultType, CameraSource } from "@capacitor/camera";
import { BottomSheet, Notify } from "quasar";
import {
  openIosAnchoredImagePickMenu,
  type ImagePickMenuOptions
} from "src/composables/imagePickSourceSheet";

export type { ImagePickMenuOptions };

type CameraPhotoResult = {
  webPath?: string;
  path?: string;
  dataUrl?: string;
  base64String?: string;
  format?: string;
};

function base64ToBlob(base64: string, mime: string): Blob {
  const cleaned = base64.replace(/\s/g, "").replace(/^data:.*;base64,/, "");
  const byteChars = atob(cleaned);
  const byteNumbers = new Array(byteChars.length);
  for (let i = 0; i < byteChars.length; i++) byteNumbers[i] = byteChars.charCodeAt(i);
  return new Blob([new Uint8Array(byteNumbers)], { type: mime });
}

/** Convert Capacitor Camera result to File for upload pipelines. */
export async function cameraPhotoToFile(photo: CameraPhotoResult): Promise<File | null> {
  try {
    const mime = photo.format ? `image/${photo.format}` : "image/jpeg";
    const filename = `photo_${Date.now()}.${photo.format || "jpg"}`;

    if (photo.base64String && photo.base64String.length > 0) {
      return new File([base64ToBlob(photo.base64String, mime)], filename, { type: mime });
    }

    if (photo.dataUrl) {
      const dataUrl = photo.dataUrl.startsWith("data:")
        ? photo.dataUrl
        : `data:${mime};base64,${photo.dataUrl}`;
      const res = await fetch(dataUrl);
      const blob = await res.blob();
      return new File([blob], filename, { type: blob.type || mime });
    }

    if (photo.webPath) {
      const res = await fetch(photo.webPath);
      const blob = await res.blob();
      return new File([blob], filename, { type: blob.type || mime });
    }

    if (photo.path) {
      const src = Capacitor.convertFileSrc ? Capacitor.convertFileSrc(photo.path) : photo.path;
      const res = await fetch(src);
      const blob = await res.blob();
      return new File([blob], filename, { type: blob.type || mime });
    }

    return null;
  } catch (e) {
    if (import.meta.env.DEV) {
      console.debug("[useImagePickMenu] cameraPhotoToFile failed", e);
    }
    return null;
  }
}

function photosPermissionOk(state: string | undefined): boolean {
  return state === "granted" || state === "limited";
}

function isPluginUnimplemented(e: unknown): boolean {
  const err = e as { code?: string; message?: string };
  return err?.code === "UNIMPLEMENTED" || String(err?.message ?? "").includes("UNIMPLEMENTED");
}

/**
 * Pre-flight permissions when the native Camera plugin supports it.
 * If check/request is UNIMPLEMENTED (web stub or missing native pod), skip and let getPhoto prompt.
 */
async function ensureCameraPermissions(source: CameraSource): Promise<boolean> {
  try {
    const current = await Camera.checkPermissions();
    if (source === CameraSource.Camera) {
      if (current.camera === "granted") return true;
      try {
        const next = await Camera.requestPermissions({ permissions: ["camera"] });
        if (next.camera === "granted") return true;
      } catch (reqErr) {
        if (isPluginUnimplemented(reqErr)) return true;
        throw reqErr;
      }
    } else {
      if (photosPermissionOk(current.photos)) return true;
      try {
        const next = await Camera.requestPermissions({ permissions: ["photos"] });
        if (photosPermissionOk(next.photos)) return true;
      } catch (reqErr) {
        if (isPluginUnimplemented(reqErr)) return true;
        throw reqErr;
      }
    }
    Notify.create({
      type: "warning",
      message: "Allow camera or photo access in Settings to add images.",
      position: "top",
      timeout: 3500
    });
    return false;
  } catch (e) {
    if (isPluginUnimplemented(e)) {
      return true;
    }
    if (import.meta.env.DEV) {
      console.debug("[useImagePickMenu] permission request failed", e);
    }
    return false;
  }
}

const NATIVE_PICKER_SETTLE_MS = 420;

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/** Place hidden file input at trigger so iOS native picker anchors near Add image (not top-left). */
/** q-btn / native element → anchor HTMLElement for q-menu. */
export function resolvePickAnchorEl(ref: unknown): HTMLElement | null {
  if (!ref) return null;
  if (ref instanceof HTMLElement) return ref;
  const comp = ref as { $el?: unknown };
  if (comp.$el instanceof HTMLElement) return comp.$el;
  return null;
}

export function positionFileInputAtAnchor(
  input: HTMLInputElement,
  anchor: HTMLElement | null
): void {
  if (!anchor) return;
  const rect = anchor.getBoundingClientRect();
  const top = rect.bottom - 1;
  const left = rect.left + rect.width / 2;
  input.style.position = "fixed";
  input.style.top = `${top}px`;
  input.style.left = `${left}px`;
  input.style.width = "1px";
  input.style.height = "1px";
  input.style.opacity = "0.01";
  input.style.overflow = "hidden";
  input.style.border = "none";
  input.style.padding = "0";
  input.style.margin = "0";
  input.style.pointerEvents = "none";
  input.style.zIndex = "1";
}

function clickFileInput(options: ImagePickMenuOptions): void {
  const input = options.getFileInput();
  if (!input) {
    if (import.meta.env.DEV) {
      console.debug("[useImagePickMenu] file input ref is null");
    }
    return;
  }
  positionFileInputAtAnchor(input, options.getAnchorEl?.() ?? null);
  input.value = "";
  input.click();
}

export async function pickFromCameraSource(
  source: CameraSource,
  onCameraFiles: (files: File[]) => void | Promise<void>
): Promise<void> {
  try {
    const allowed = await ensureCameraPermissions(source);
    if (!allowed) return;

    const useBase64 = Capacitor.getPlatform() === "ios";

    const photo = await Camera.getPhoto({
      quality: 90,
      source,
      resultType: useBase64 ? CameraResultType.Base64 : CameraResultType.Uri,
      allowEditing: false,
      saveToGallery: false,
      correctOrientation: true,
      presentationStyle: "fullscreen"
    });

    const file = await cameraPhotoToFile(photo);
    if (file) {
      await onCameraFiles([file]);
    }
  } catch (e) {
    if (isPluginUnimplemented(e)) {
      Notify.create({
        type: "negative",
        message: "Camera plugin is not linked in the iOS build. Run: cd src-capacitor && npx cap sync ios, then rebuild in Xcode.",
        position: "top",
        timeout: 5000
      });
      return;
    }
    const message = e instanceof Error ? e.message : String(e);
    const cancelled =
      message.includes("cancel") ||
      message.includes("Cancel") ||
      message.includes("User cancelled") ||
      message === "User denied access to photos";

    if (!cancelled && import.meta.env.DEV) {
      console.debug("[useImagePickMenu] pick cancelled or failed", e);
    }
  }
}

/** Android: Quasar bottom sheet (slide-up) + Capacitor Camera. */
function openAndroidImagePickSheet(options: ImagePickMenuOptions): void {
  document.body.classList.add("bottom-sheet-open");

  const sheet = BottomSheet.create({
    class: "dh-imagePick-sheet q-bottom-sheet",
    actions: [
      { label: "Photo Library", icon: "photo", id: "library" },
      { label: "Take Photo", icon: "camera_alt", id: "camera" },
      { label: "Choose Files", icon: "folder_open", id: "files" }
    ]
  });

  sheet.onOk(async (action) => {
    document.body.classList.remove("bottom-sheet-open");
    if (!action?.id) return;

    if (action.id === "files") {
      clickFileInput(options);
      return;
    }

    await delay(NATIVE_PICKER_SETTLE_MS);
    const cameraSource = action.id === "camera" ? CameraSource.Camera : CameraSource.Photos;
    await pickFromCameraSource(cameraSource, options.onCameraFiles);
  });

  sheet.onCancel(() => {
    document.body.classList.remove("bottom-sheet-open");
  });

  sheet.onDismiss(() => {
    document.body.classList.remove("bottom-sheet-open");
  });
}

function openIosImagePickMenu(options: ImagePickMenuOptions): void {
  const anchor = options.getAnchorEl?.() ?? null;
  if (!anchor) {
    clickFileInput(options);
    return;
  }
  document.body.classList.add("bottom-sheet-open");
  openIosAnchoredImagePickMenu(options, anchor);
}

/**
 * Opens image source picker.
 * iOS: anchored q-menu below trigger + Capacitor Camera (library/camera).
 * Android: bottom sheet + Capacitor Camera.
 * Web: file input.
 */
export function useImagePickMenu() {
  const openImagePickMenu = (options: ImagePickMenuOptions) => {
    const platform = Capacitor.getPlatform();

    if (platform === "ios") {
      openIosImagePickMenu(options);
      return;
    }

    if (!Capacitor.isNativePlatform()) {
      clickFileInput(options);
      return;
    }

    openAndroidImagePickSheet(options);
  };

  return {
    openImagePickMenu,
    cameraPhotoToFile,
    pickFromCameraSource,
    positionFileInputAtAnchor
  };
}
