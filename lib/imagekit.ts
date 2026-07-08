import "server-only";
import { ApiError } from "@/lib/api";

/**
 * Minimal ImageKit upload client. Uses the REST upload API directly with the
 * server-only private key so we don't need the full SDK.
 * Docs: https://imagekit.io/docs/api-reference/upload-file/upload-file
 */

const IMAGEKIT_UPLOAD_URL = "https://upload.imagekit.io/api/v1/files/upload";

type ImageKitUploadResponse = {
  url: string;
  name: string;
  fileId: string;
};

export function isImageKitConfigured(): boolean {
  return Boolean(process.env.IMAGEKIT_PRIVATE_KEY);
}

type UploadImageInput = {
  /** Raw file bytes. */
  data: ArrayBuffer;
  fileName: string;
  /** ImageKit folder, e.g. `/zenotion/<userId>`. */
  folder: string;
};

export async function uploadImageToImageKit({
  data,
  fileName,
  folder,
}: UploadImageInput): Promise<ImageKitUploadResponse> {
  const privateKey = process.env.IMAGEKIT_PRIVATE_KEY;
  if (!privateKey) {
    throw new ApiError(
      "SERVICE_UNAVAILABLE",
      "Image uploads are not configured. Add the ImageKit keys to the server environment.",
    );
  }

  const body = new FormData();
  body.set("file", Buffer.from(data).toString("base64"));
  body.set("fileName", fileName);
  body.set("folder", folder);
  body.set("useUniqueFileName", "true");

  const response = await fetch(IMAGEKIT_UPLOAD_URL, {
    method: "POST",
    headers: {
      Authorization: `Basic ${Buffer.from(`${privateKey}:`).toString("base64")}`,
    },
    body,
  });

  if (!response.ok) {
    const detail = await response.text().catch(() => "");
    console.error("[imagekit] upload failed:", response.status, detail);
    throw new ApiError(
      "INTERNAL_ERROR",
      "The image could not be uploaded. Please try again.",
    );
  }

  const json = (await response.json()) as ImageKitUploadResponse;
  if (!json.url) {
    console.error("[imagekit] unexpected upload response:", json);
    throw new ApiError(
      "INTERNAL_ERROR",
      "The image could not be uploaded. Please try again.",
    );
  }

  return json;
}
