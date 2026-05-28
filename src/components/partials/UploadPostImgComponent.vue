<template>
  <div
    class="container uploadImgConponent"
    @dragover.prevent="dragOver"
    @drop.prevent="drop($event)"
  >
    <div class="drop" v-show="dropped == 2"></div>

    <div
      v-show="uploadedImages.length == 0 && !isUploading"
      class="uploadImg-placeholderStage"
    >
      <button
        ref="pickAnchorRef"
        type="button"
        class="beforeUpload"
        @click.stop="onAddImageTap"
      >
        <img src="/icons/uploadImg-icon.svg" alt="" class="uploadImg-icon" />
        <p class="mainMessage">
          {{ uploadMsg ? uploadMsg : "Add image" }}
        </p>
      </button>

      <input
        ref="uploadInput"
        type="file"
        accept="image/*"
        class="uploadImg-hiddenInput"
        aria-hidden="true"
        tabindex="-1"
        multiple
        @change="previewImgs"
      />
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
          @click="onAddImageTap"
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
  margin: 0 auto;
  width: 100%;
  height: 100%;
  min-height: 40rem;
  background: #161616;
  overflow: hidden;
  position: relative;
  box-sizing: border-box;

  .drop {
    width: 100%;
    height: 100%;
    top: 0;
    position: absolute;
    left: 0;
  }
}

/* Center in visible hero area; parent may set --dh-upload-stage-height. */
.uploadImg-placeholderStage {
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: var(--dh-upload-stage-height, 100%);
  z-index: 4;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  pointer-events: auto;
  touch-action: manipulation;
}

.beforeUpload {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 0.75rem;
  width: 100%;
  height: 100%;
  min-height: 8rem;
  padding: 0;
  margin: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  -webkit-tap-highlight-color: transparent;
  text-align: center;
  color: inherit;
  font: inherit;
  touch-action: manipulation;
}

.uploadImg-icon {
  display: block;
  margin: 0;
  height: 2.3rem;
  width: auto;
  pointer-events: none;
}

.mainMessage {
  color: white;
  font-family: poppinsSemiBold;
  font-size: 1.2rem;
  line-height: 1.25;
  margin: 0;
  pointer-events: none;
}

.uploadImg-hiddenInput {
  position: fixed;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  opacity: 0.01;
  overflow: hidden;
  pointer-events: none;
  z-index: -1;
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
</style>

<script setup lang="ts">
import { ref } from "vue";
import { useUpload, type UploadedImage } from "src/composables/useUpload";
import { useImagePickMenu } from "src/composables/useImagePickMenu";

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
const { openImagePickMenu } = useImagePickMenu();

const pickAnchorRef = ref<HTMLElement | null>(null);
const uploadInput = ref<HTMLInputElement | null>(null);
let lastPickTapAt = 0;
const dropped = ref(0);
const error = ref("");
const uploadedImages = ref<UploadedImage[]>([]);
const isUploading = ref(false);
const uploadingStates = ref<boolean[]>([]);

const onAddImageTap = () => {
  const now = Date.now();
  if (now - lastPickTapAt < 400) return;
  lastPickTapAt = now;

  openImagePickMenu({
    getFileInput: () => uploadInput.value,
    getAnchorEl: () => pickAnchorRef.value,
    onCameraFiles: async (files) => {
      await handleUpload(files);
    }
  });
};

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

    uploadedImages.value.push(...uploaded);

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

  if (image.public_id) {
    uploadingStates.value[index] = true;
    const success = await deleteImage(image.public_id);
    uploadingStates.value[index] = false;

    if (success) {
      uploadedImages.value.splice(index, 1);
      uploadingStates.value.splice(index, 1);

      const allFiles = uploadedImages.value
        .map((img) => img.file)
        .filter((f): f is File => f !== undefined);
      emit("changed", allFiles);
      emit("imagesUpdated", uploadedImages.value);
    }
  } else {
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

defineExpose({
  reset
});
</script>
