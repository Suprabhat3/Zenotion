"use client";

import { toast } from "sonner";
import type { ApiResponse } from "@/lib/api";
import {
  IMAGE_INPUT_ACCEPT,
  IMAGE_TOO_LARGE_MESSAGE,
  IMAGE_TYPE_MESSAGE,
  MAX_IMAGE_SIZE_BYTES,
  isAllowedImageType,
  type UploadedImage,
} from "@/lib/uploads";

/**
 * Client-side image upload helpers shared by the rich editor, the markdown
 * editor, and the cover-image picker. Validation mirrors `/api/uploads` so
 * users get instant feedback before any bytes leave the browser.
 */

export class ImageUploadError extends Error {}

/** Upload one image to `/api/uploads`; throws `ImageUploadError` with a user-friendly message. */
export async function uploadNoteImage(file: File): Promise<UploadedImage> {
  if (!isAllowedImageType(file.type)) {
    throw new ImageUploadError(IMAGE_TYPE_MESSAGE);
  }
  if (file.size > MAX_IMAGE_SIZE_BYTES) {
    throw new ImageUploadError(IMAGE_TOO_LARGE_MESSAGE);
  }

  const body = new FormData();
  body.set("file", file);

  let json: ApiResponse<UploadedImage>;
  try {
    const res = await fetch("/api/uploads", {
      method: "POST",
      headers: { "X-Requested-With": "Zenotion" },
      body,
    });
    json = (await res.json()) as ApiResponse<UploadedImage>;
  } catch {
    throw new ImageUploadError("Upload failed. Check your connection and try again.");
  }

  if (!json.success) {
    throw new ImageUploadError(json.error.message);
  }
  return json.data;
}

/** Upload with a toast for progress/failure. Resolves to `null` on failure. */
export async function uploadNoteImageWithToast(
  file: File,
): Promise<UploadedImage | null> {
  const toastId = toast.loading(`Uploading ${file.name || "image"}…`);
  try {
    const uploaded = await uploadNoteImage(file);
    toast.success("Image uploaded.", { id: toastId });
    return uploaded;
  } catch (error) {
    toast.error(
      error instanceof ImageUploadError
        ? error.message
        : "Upload failed. Please try again.",
      { id: toastId },
    );
    return null;
  }
}

/** Extract image files from a paste/drop `DataTransfer`, if any. */
export function getImageFiles(dataTransfer: DataTransfer | null): File[] {
  if (!dataTransfer) return [];
  return Array.from(dataTransfer.files).filter((file) =>
    file.type.startsWith("image/"),
  );
}

/** Open the OS file picker for images and resolve with the chosen file. */
export function pickImageFile(): Promise<File | null> {
  return new Promise((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = IMAGE_INPUT_ACCEPT;
    input.onchange = () => resolve(input.files?.[0] ?? null);
    // `cancel` fires when the dialog is dismissed without a selection.
    input.oncancel = () => resolve(null);
    input.click();
  });
}

/** Human-friendly alt text derived from an uploaded file name. */
export function imageAltText(fileName: string): string {
  return fileName.replace(/\.[^.]+$/, "").replace(/[[\]]/g, "");
}

/** Markdown image syntax for an uploaded file. */
export function markdownImage(uploaded: UploadedImage): string {
  return `![${imageAltText(uploaded.fileName)}](${uploaded.url})`;
}
