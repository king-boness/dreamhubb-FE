<template>
  <q-menu
    v-if="menuAnchor"
    v-model="menuOpen"
    :target="menuAnchor"
    anchor="bottom middle"
    self="top middle"
    :offset="[0, 10]"
    transition-show="fade"
    transition-hide="fade"
    no-focus
    no-parent-event
    class="dh-imagePick-menu"
    @hide="onMenuHide"
  >
    <q-list class="dh-imagePick-menuList" dense>
      <q-item v-close-popup clickable @click="onLibrary">
        <q-item-section avatar>
          <q-icon name="photo" />
        </q-item-section>
        <q-item-section>Photo Library</q-item-section>
      </q-item>
      <q-item v-close-popup clickable @click="onCamera">
        <q-item-section avatar>
          <q-icon name="camera_alt" />
        </q-item-section>
        <q-item-section>Take Photo</q-item-section>
      </q-item>
      <q-item v-close-popup clickable @click="onFiles">
        <q-item-section avatar>
          <q-icon name="folder_open" />
        </q-item-section>
        <q-item-section>Choose Files</q-item-section>
      </q-item>
      <q-item v-close-popup clickable @click="closeMenu">
        <q-item-section class="dh-imagePick-menuCancel">Cancel</q-item-section>
      </q-item>
    </q-list>
  </q-menu>
</template>

<script setup lang="ts">
import { CameraSource } from "@capacitor/camera";
import {
  closeIosAnchoredImagePickMenu,
  iosImagePickMenuAnchor,
  iosImagePickMenuOpen,
  iosImagePickMenuOptions
} from "src/composables/imagePickSourceSheet";
import { pickFromCameraSource, positionFileInputAtAnchor } from "src/composables/useImagePickMenu";

const menuOpen = iosImagePickMenuOpen;
const menuAnchor = iosImagePickMenuAnchor;
const menuOptions = iosImagePickMenuOptions;

const closeMenu = () => {
  closeIosAnchoredImagePickMenu();
};

const onMenuHide = () => {
  document.body.classList.remove("bottom-sheet-open");
};

const runAfterMenuClosed = (fn: () => void) => {
  closeMenu();
  window.setTimeout(fn, 380);
};

const onLibrary = () => {
  const opts = menuOptions.value;
  if (!opts) return;
  runAfterMenuClosed(() => {
    void pickFromCameraSource(CameraSource.Photos, opts.onCameraFiles);
  });
};

const onCamera = () => {
  const opts = menuOptions.value;
  if (!opts) return;
  runAfterMenuClosed(() => {
    void pickFromCameraSource(CameraSource.Camera, opts.onCameraFiles);
  });
};

const onFiles = () => {
  const opts = menuOptions.value;
  const anchor = menuAnchor.value;
  if (!opts) return;

  const input = opts.getFileInput();
  if (!input) return;

  closeMenu();
  positionFileInputAtAnchor(input, anchor);
  input.value = "";
  input.click();
};
</script>
