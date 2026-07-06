/**
 * Shared image-upload rules used by both the client (pre-flight checks with
 * friendly errors) and the `/api/uploads` route handler (authoritative check).
 */

export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_MB * 1024 * 1024;

/** SVG is intentionally excluded — it can carry scripts. */
export const ALLOWED_IMAGE_MIME_TYPES = [
  "image/png",
  "image/jpeg",
  "image/gif",
  "image/webp",
  "image/avif",
] as const;

export type AllowedImageMimeType = (typeof ALLOWED_IMAGE_MIME_TYPES)[number];

/** `accept` attribute value for file inputs. */
export const IMAGE_INPUT_ACCEPT = ALLOWED_IMAGE_MIME_TYPES.join(",");

export function isAllowedImageType(type: string): type is AllowedImageMimeType {
  return (ALLOWED_IMAGE_MIME_TYPES as readonly string[]).includes(type);
}

export const IMAGE_TOO_LARGE_MESSAGE = `Images must be ${MAX_IMAGE_SIZE_MB} MB or smaller.`;
export const IMAGE_TYPE_MESSAGE =
  "Only PNG, JPEG, GIF, WebP, and AVIF images are supported.";

/** Shape returned by `POST /api/uploads` on success. */
export type UploadedImage = {
  url: string;
  fileName: string;
};
