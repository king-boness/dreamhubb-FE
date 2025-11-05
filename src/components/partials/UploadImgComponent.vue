<template>
  <div
    class="container uploadImgConponent"
    @dragover.prevent="dragOver"
    @drop.prevent="drop($event)"
  >
    <div class="drop" v-show="dropped == 2"></div>

    <!-- To inform user how to upload image -->
    <div v-show="uploadedImages.length == 0 && !isUploading" class="beforeUpload">
      <input
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
          @click="append"
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
  width: 24rem;
  height: 8rem;
  background: rgb(19, 19, 19);
  border-radius: 1rem;
  position: relative;
  margin-bottom: 1rem;
  display: flex;
  justify-content: center;
  align-items: center;
  .drop {
    width: 100%;
    height: 100%;
    top: 0;
    border-radius: 10px;
    position: absolute;
    left: 0;
  }
  .error {
    text-align: center;
    color: red;
    font-size: 15px;
  }
  .beforeUpload {
    position: relative;
    text-align: center;
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
    display: flex;
    flex-wrap: wrap;
    justify-content: flex-start;
    gap: 10px;
    width: 100%;

    .imageHolder {
      display: flex;
      flex-basis: 1%;
      position: relative;
      height: 6rem;
      .uploadedImgDiv {
        height: 6rem;
        width: 6rem;
        margin: 0 0.5rem;
        position: relative;

        .uploadedImg {
          height: 6rem;
          width: 6rem;
          border-radius: 1.5rem;
          max-width: 100%;
        }
        .delete {
          cursor: pointer;
          .deleteImgIcon {
            position: absolute;
            left: 0;
            right: 0;
            margin: 0 auto;
            top: 20%;
            background-color: rgba(155, 43, 82, 0.726);
            padding: 1rem;
            height: 4rem;
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
<script setup lang="ts">
import { ref } from "vue";
import { useUpload, type UploadedImage } from "src/composables/useUpload";

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

const { uploadImage, deleteImage, uploadMultipleImages } = useUpload();

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

const append = () => {
  uploadInput.value?.click();
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

    // Pridaj nové obrázky do zoznamu
    uploadedImages.value.push(...uploaded);

    // Emit zmeny
    const allFiles = uploaded.map((img) => img.file).filter((f): f is File => f !== undefined);
    emit("changed", allFiles);
    emit("imagesUpdated", uploadedImages.value);
  } catch (err) {
    if (process.env.NODE_ENV === "development") {
      console.error("Upload failed:", err);
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
