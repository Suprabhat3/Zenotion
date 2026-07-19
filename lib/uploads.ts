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

function bytesMatch(header: Uint8Array, signature: number[]): boolean {
  if (header.length < signature.length) return false;
  return signature.every((byte, index) => header[index] === byte);
}

/**
 * Detect image type from magic bytes. Returns null when the payload is not
 * a supported raster image (including SVG).
 */
export function sniffImageMimeType(
  data: ArrayBuffer,
): AllowedImageMimeType | null {
  const header = new Uint8Array(data.slice(0, 16));

  if (bytesMatch(header, [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])) {
    return "image/png";
  }
  if (bytesMatch(header, [0xff, 0xd8, 0xff])) {
    return "image/jpeg";
  }
  if (
    bytesMatch(header, [0x47, 0x49, 0x46, 0x38, 0x37, 0x61]) ||
    bytesMatch(header, [0x47, 0x49, 0x46, 0x38, 0x39, 0x61])
  ) {
    return "image/gif";
  }
  // RIFF....WEBP
  if (
    bytesMatch(header, [0x52, 0x49, 0x46, 0x46]) &&
    header[8] === 0x57 &&
    header[9] === 0x45 &&
    header[10] === 0x42 &&
    header[11] === 0x50
  ) {
    return "image/webp";
  }
  // ISO BMFF ftyp....avif / avis
  if (
    header[4] === 0x66 &&
    header[5] === 0x74 &&
    header[6] === 0x79 &&
    header[7] === 0x70
  ) {
    const brand = String.fromCharCode(
      header[8] ?? 0,
      header[9] ?? 0,
      header[10] ?? 0,
      header[11] ?? 0,
    );
    if (brand === "avif" || brand === "avis") {
      return "image/avif";
    }
  }

  return null;
}
