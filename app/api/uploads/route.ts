import { ApiError, ok, handleApiError } from "@/lib/api";
import { requireUser } from "@/lib/session";
import { isImageKitConfigured, uploadImageToImageKit } from "@/lib/imagekit";
import { assertSameOriginMutation } from "@/lib/request-origin";
import {
  IMAGE_TOO_LARGE_MESSAGE,
  IMAGE_TYPE_MESSAGE,
  MAX_IMAGE_SIZE_BYTES,
  isAllowedImageType,
  sniffImageMimeType,
  type UploadedImage,
} from "@/lib/uploads";

/**
 * POST /api/uploads — upload an image (multipart form-data, field `file`)
 * to ImageKit and return its public URL. Used for in-note images pasted,
 * dropped, or picked in the editor, and for note cover images.
 */
export async function POST(request: Request) {
  try {
    assertSameOriginMutation(request);
    const user = await requireUser();

    if (!isImageKitConfigured()) {
      throw new ApiError(
        "SERVICE_UNAVAILABLE",
        "Image uploads are not configured on this server.",
      );
    }

    const formData = await request.formData().catch(() => {
      throw new ApiError(
        "VALIDATION_ERROR",
        "Expected multipart form data with a `file` field.",
      );
    });

    const file = formData.get("file");
    if (!(file instanceof File)) {
      throw new ApiError("VALIDATION_ERROR", "No image file was provided.");
    }
    if (!isAllowedImageType(file.type)) {
      throw new ApiError("VALIDATION_ERROR", IMAGE_TYPE_MESSAGE);
    }
    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      throw new ApiError("VALIDATION_ERROR", IMAGE_TOO_LARGE_MESSAGE);
    }

    const data = await file.arrayBuffer();
    const sniffed = sniffImageMimeType(data);
    if (!sniffed || sniffed !== file.type) {
      throw new ApiError("VALIDATION_ERROR", IMAGE_TYPE_MESSAGE);
    }

    const uploaded = await uploadImageToImageKit({
      data,
      fileName: file.name || "pasted-image",
      // Keep each user's uploads in their own folder.
      folder: `/zenotion/${user.id}`,
    });

    const response: UploadedImage = {
      url: uploaded.url,
      fileName: uploaded.name,
    };
    return ok(response, { status: 201, message: "Image uploaded." });
  } catch (error) {
    return handleApiError(error);
  }
}
