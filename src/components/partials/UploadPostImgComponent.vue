<template>
  <div
    class="container uploadImgConponent"
    @dragover.prevent="dragOver"
    @drop.prevent="drop($event)"
  >
    <div class="drop" v-show="dropped == 2"></div>

    <div v-show="uploadedImages.length == 0 && !isUploading" class="beforeUpload">
      <div
        v-if="useNativePicker"
        class="native-picker-overlay"
        @click="triggerImagePick"
      />
      <input
        v-show="!useNativePicker"
        type="file"
        style="z-index: 1"
        accept="image/*"
        ref="uploadInput"
        @change="previewImgs"
        multiple
      />
      <img src="/icons/uploadImg-icon.svg" alt="" class="uploadImg-icon" />
      <p class="mainMessage">
        {{ uploadMsg ? uploadMsg : "Add image" }}
      </p>
    </div>
    <div class="imgsPreview" v-show="uploadedImages.length > 0">
      <div class="imageHolder" v-for="(img, i) in uploadedImages" :key="i">
        <div class="uploadedImgDiv">
          <img :src="img.secure_url" class="uploadedImg" />
          <span class="delete" @click="handleDelete(i)">
            <img src="/icons/deleteImg-icon.svg" alt="" class="deleteImgIcon" />
          </span>
          <q-spinner v-if="uploadingStates[i]" color="primary" size="20px" class="spinner-overlay" />
        </div>
        <div
          class="plus uploadImgIcon-Div"
          @click="triggerImagePick"
          v-if="i === uploadedImages.length - 1 && !isUploading"
        >
          <img src="/icons/uploadImg-icon.svg" alt="" class="uploadImg-icon" />
        </div>
      </div>
    </div>
    <q-linear-progress v-if="isUploading" :indeterminate="true" color="primary" class="q-mt-md" />
  </div>
</template>

<style scoped lang="scss">
.container {
  margin: 0rem auto;
  width: 100%;
  height: 40rem;
  background: #161616;
  overflow: hidden;
  position: relative;

  display: flex;
  justify-content: center;
  align-items: center;

  .drop {
    width: 100%;
    height: 100%;
    top: 0;
    position: absolute;
    left: 0;
  }
  .beforeUpload {
    position: relative;
    text-align: center;
    padding-bottom: 30%;
    .uploadImg-icon {
      margin: 0;
      height: 2.3rem;
    }
    .mainMessage {
      color: white;
      font-family: poppinsSemiBold;
      font-size: 1.2rem;
    }
  }
  .native-picker-overlay {
    position: absolute;
    inset: 0;
    z-index: 1;
    cursor: pointer;
  }
  .beforeUpload input {
    width: 100%;
    margin: auto;
    height: 100%;
    opacity: 0;
    position: absolute;
    background: red;
    display: block;
  }
  .beforeUpload input:hover {
    cursor: pointer;
  }
  .beforeUpload .icon {
    width: 150px;
    margin: auto;
    display: block;
  }
  .imgsPreview {
    height: 100%;
    width: 100%;

    .imageHolder {
      display: flex;
      justify-content: center;
      align-items: center;

      .uploadedImgDiv {
        width: 100%;
        position: relative;
        .uploadedImg {
          width: 100%;
          height: 40rem;
          object-fit: cover;
        }
        .delete {
          position: absolute;
          top: 10px;
          right: 10px;
          cursor: pointer;
          z-index: 5;
          .deleteImgIcon {
            background-color: rgba(155, 43, 82, 0.726);
            padding: 0.5rem;
            height: 3rem;
            border-radius: 100%;
          }
        }
        .spinner-overlay {
          position: absolute;
          top: 50%;
          left: 50%;
          transform: translate(-50%, -50%);
          z-index: 10;
        }
      }
      .uploadImgIcon-Div {
        background: rgb(44, 44, 44);
        height: 6rem;
        width: 6rem;
        display: flex;
        justify-content: center;
        align-items: center;
        border-radius: 1.5rem;
        margin: 0 0.5rem;
        margin-left: 1rem;
      }
    }
  }
}
</style>
<style lang="scss" scoped></style>
<script setup lang="ts">
import { ref, computed } from "vue";
import { Capacitor } from "@capacitor/core";
import { Camera } from "@capacitor/camera";
import { useUpload, type UploadedImage } from "src/composables/useUpload";

const useNativePicker = computed(() => Capacitor?.isNativePlatform?.() === true);

const props = defineProps<{
  max?: number;
  uploadMsg?: string;
  maxError?: string;
  fileError?: string;
  clearAll?: string;
  folder?: string;
}>();

const emit = defineEmits<{
  changed: [files: File[]];
  imagesUpdated: [images: UploadedImage[]];
}>();

const { deleteImage, uploadMultipleImages } = useUpload();

const uploadInput = ref<HTMLInputElement | null>(null);
const dropped = ref(0);
const error = ref("");
const uploadedImages = ref<UploadedImage[]>([]);
const isUploading = ref(false);
const uploadingStates = ref<boolean[]>([]);

const dragOver = () => {
  dropped.value = 2;
};

const drop = async (e: DragEvent) => {
  let status = true;
  const files = Array.from(e.dataTransfer?.files || []);
  if (e && files) {
    files.forEach((file) => {
      if (file.type.startsWith("image") === false) status = false;
    });
    if (status === true) {
      if (props.max && files.length + uploadedImages.value.length > props.max) {
        error.value = props.maxError || `Maximum files is ${props.max}`;
      } else {
        await handleUpload(files);
      }
    } else {
      error.value = props.fileError || "Unsupported file type";
    }
  }
  dropped.value = 0;
};

const triggerImagePick = async () => {
  if (useNativePicker.value) {
    try {
      const photo = await Camera.getPhoto({
        source: "PHOTOLIBRARY",
        resultType: "Uri",
        quality: 90
      });
      const file = await cameraResultToFile(photo);
      if (file) await handleUpload([file]);
    } catch (e) {
      if (import.meta.env.DEV) console.debug("[UploadPostImg] Camera.getPhoto cancelled or failed:", e);
    }
  } else {
    uploadInput.value?.click();
  }
};

async function cameraResultToFile(photo: { webPath?: string; path?: string; dataUrl?: string }): Promise<File | null> {
  let previewSrc: string | null = null;
  const isPhOrFile = (s: string) => s.startsWith("ph://") || s.startsWith("file://");
  if (photo.webPath && !isPhOrFile(photo.webPath)) previewSrc = photo.webPath;
  else if (photo.path || photo.webPath) {
    const raw = (photo.webPath || photo.path)!;
    previewSrc = isPhOrFile(raw) && Capacitor?.convertFileSrc
      ? Capacitor.convertFileSrc(raw)
      : raw;
  } else if (photo.dataUrl) {
    previewSrc = photo.dataUrl.startsWith("data:") ? photo.dataUrl : `data:image/jpeg;base64,${photo.dataUrl}`;
  }
  if (!previewSrc) return null;
  if (import.meta.env.DEV) {
    console.debug("[UploadPostImg] Image source (dev):", { webPath: photo.webPath?.slice(0, 50), path: photo.path?.slice(0, 50) });
  }
  const res = await fetch(previewSrc);
  const blob = await res.blob();
  return new File([blob], `photo_${Date.now()}.jpg`, { type: blob.type || "image/jpeg" });
}

const handleUpload = async (files: File[]) => {
  if (props.max && uploadedImages.value.length + files.length > props.max) {
    error.value = props.maxError || `Maximum files is ${props.max}`;
    return;
  }

  isUploading.value = true;
  error.value = "";

  try {
    const folder = props.folder || "uploads";
    const uploaded = await uploadMultipleImages(files, folder);

    // Pridaj nové obrázky do zoznamu
    uploadedImages.value.push(...uploaded);

    // Emit zmeny
    const allFiles = uploaded.map((img) => img.file).filter((f): f is File => f !== undefined);
    emit("changed", allFiles);
    emit("imagesUpdated", uploadedImages.value);
  } catch (err) {
    if (import.meta.env.DEV) {
      console.debug("[UploadPostImg] Upload failed:", err);
    }
  } finally {
    isUploading.value = false;
    if (uploadInput.value) {
      uploadInput.value.value = "";
    }
  }
};

const previewImgs = async (event: Event) => {
  const target = event.target as HTMLInputElement;
  const files = Array.from(target.files || []);

  if (props.max && files.length + uploadedImages.value.length > props.max) {
    error.value = props.maxError || `Maximum files is ${props.max}`;
    return;
  }

  await handleUpload(files);
};

const handleDelete = async (index: number) => {
  const image = uploadedImages.value[index];
  if (!image) return;

  // Ak má public_id, vymaž z Cloudinary
  if (image.public_id) {
    uploadingStates.value[index] = true;
    const success = await deleteImage(image.public_id);
    uploadingStates.value[index] = false;

    if (success) {
      uploadedImages.value.splice(index, 1);
      uploadingStates.value.splice(index, 1);

      // Emit zmeny
      const allFiles = uploadedImages.value
        .map((img) => img.file)
        .filter((f): f is File => f !== undefined);
      emit("changed", allFiles);
      emit("imagesUpdated", uploadedImages.value);
    }
  } else {
    // Len lokálny preview - odstráň
    uploadedImages.value.splice(index, 1);
    uploadingStates.value.splice(index, 1);

    const allFiles = uploadedImages.value
      .map((img) => img.file)
      .filter((f): f is File => f !== undefined);
    emit("changed", allFiles);
    emit("imagesUpdated", uploadedImages.value);
  }

  if (uploadInput.value) {
    uploadInput.value.value = "";
  }
};

const reset = () => {
  if (uploadInput.value) {
    uploadInput.value.value = "";
  }
  uploadedImages.value = [];
  uploadingStates.value = [];
  error.value = "";
  emit("changed", []);
  emit("imagesUpdated", []);
};

// Expose methods for parent component
defineExpose({
  reset
});
</script>
