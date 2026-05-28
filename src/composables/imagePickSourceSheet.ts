import { ref, shallowRef } from "vue";

/** Shared options for image pick flows (create post, edit post, …). */
export type ImagePickMenuOptions = {
  getFileInput: () => HTMLInputElement | null;
  getAnchorEl?: () => HTMLElement | null;
  onCameraFiles: (files: File[]) => void | Promise<void>;
};

export const iosImagePickMenuOpen = ref(false);
export const iosImagePickMenuAnchor = shallowRef<HTMLElement | null>(null);
export const iosImagePickMenuOptions = shallowRef<ImagePickMenuOptions | null>(null);

export function openIosAnchoredImagePickMenu(
  options: ImagePickMenuOptions,
  anchor: HTMLElement | null
): void {
  iosImagePickMenuOptions.value = options;
  iosImagePickMenuAnchor.value = anchor;
  iosImagePickMenuOpen.value = true;
}

export function closeIosAnchoredImagePickMenu(): void {
  iosImagePickMenuOpen.value = false;
}
