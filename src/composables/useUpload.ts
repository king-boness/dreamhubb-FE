import { api } from "src/boot/axios";
import { Notify } from "quasar";

export interface UploadResponse {
  status: string;
  secure_url: string;
  public_id: string;
  url?: string;
  format?: string;
  bytes?: number;
  width?: number;
  height?: number;
}

export interface UploadedImage {
  secure_url: string;
  public_id: string;
  file?: File;
}

/**
 * Composable pre upload obrázkov do Cloudinary
 */
export function useUpload() {
  /**
   * Upload obrázka na server
   * @param file File object
   * @param folder Cloudinary folder (optional, default: 'uploads')
   * @returns Promise<UploadResponse>
   */
  const uploadImage = async (
    file: File,
    folder = "uploads"
  ): Promise<UploadResponse | null> => {
    try {
      // Validácia typu súboru
      if (!file.type.startsWith("image/")) {
        Notify.create({
          type: "negative",
          message: "❌ Unsupported file type. Please upload an image.",
          position: "top"
        });
        return null;
      }

      // Validácia veľkosti (5 MB)
      const maxSize = 5 * 1024 * 1024; // 5 MB v bytoch
      if (file.size > maxSize) {
        Notify.create({
          type: "negative",
          message: "❌ File too large. Maximum size is 5 MB.",
          position: "top"
        });
        return null;
      }

      // Vytvorenie FormData
      const formData = new FormData();
      formData.append("file", file);
      formData.append("folder", folder);

      // Upload request
      const response = await api.post<UploadResponse>("/upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data"
        }
      });

      if (response.data.status === "success") {
        // Don't show notification here - let the caller handle it
        // This allows for better error handling (e.g., don't show "Upload successful" if profile update fails)
        return response.data;
      }

      return null;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Upload error:", error);
      }

      let errorMessage = "❌ Upload failed. Please try again.";
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } };

      if (axiosError.response?.status === 422) {
        errorMessage = "❌ Invalid file. Please check file type and size.";
      } else if (axiosError.response?.status === 401) {
        errorMessage = "❌ Unauthorized. Please log in.";
      } else if (axiosError.response?.data?.message) {
        errorMessage = `❌ ${axiosError.response.data.message}`;
      }

      Notify.create({
        type: "negative",
        message: errorMessage,
        position: "top"
      });

      return null;
    }
  };

  /**
   * Vymazať obrázok z Cloudinary
   * @param publicId Cloudinary public_id
   * @returns Promise<boolean>
   */
  const deleteImage = async (publicId: string): Promise<boolean> => {
    try {
      const response = await api.delete(`/upload/${publicId}`);

      if (response.data.status === "success") {
        Notify.create({
          type: "positive",
          message: "✅ Image deleted successfully",
          position: "top"
        });
        return true;
      }

      return false;
    } catch (error) {
      if (process.env.NODE_ENV === "development") {
        console.error("Delete error:", error);
      }

      let errorMessage = "❌ Failed to delete image.";
      const axiosError = error as { response?: { status?: number; data?: { message?: string } } };

      if (axiosError.response?.status === 404) {
        errorMessage = "❌ Image not found.";
      } else if (axiosError.response?.data?.message) {
        errorMessage = `❌ ${axiosError.response.data.message}`;
      }

      Notify.create({
        type: "negative",
        message: errorMessage,
        position: "top"
      });

      return false;
    }
  };

  /**
   * Upload viacerých obrázkov
   * @param files Array of File objects
   * @param folder Cloudinary folder (optional)
   * @returns Promise<UploadedImage[]>
   */
  const uploadMultipleImages = async (
    files: File[],
    folder = "uploads"
  ): Promise<UploadedImage[]> => {
    const uploadedImages: UploadedImage[] = [];

    for (const file of files) {
      const result = await uploadImage(file, folder);
      if (result) {
        uploadedImages.push({
          secure_url: result.secure_url || result.url || "",
          public_id: result.public_id,
          file
        });
      }
    }

    return uploadedImages;
  };

  return {
    uploadImage,
    deleteImage,
    uploadMultipleImages
  };
}
