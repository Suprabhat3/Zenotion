import { ApiError } from "@/lib/api";

/**
 * CSRF-ish guard for cookie-authenticated JSON / multipart API mutations.
 * Requires Origin or Referer to match BETTER_AUTH_URL, or a trusted
 * X-Requested-With header from our own client.
 */
export function assertSameOriginMutation(request: Request): void {
  const requestedWith = request.headers.get("x-requested-with");
  if (requestedWith === "Zenotion") {
    return;
  }

  const baseUrl = process.env.BETTER_AUTH_URL;
  if (!baseUrl) {
    throw new ApiError(
      "INTERNAL_ERROR",
      "Server origin is not configured.",
    );
  }

  let allowedOrigin: string;
  try {
    allowedOrigin = new URL(baseUrl).origin;
  } catch {
    throw new ApiError(
      "INTERNAL_ERROR",
      "Server origin is not configured.",
    );
  }

  const origin = request.headers.get("origin");
  if (origin) {
    if (origin !== allowedOrigin) {
      throw new ApiError("FORBIDDEN", "Invalid request origin.");
    }
    return;
  }

  const referer = request.headers.get("referer");
  if (referer) {
    try {
      if (new URL(referer).origin === allowedOrigin) {
        return;
      }
    } catch {
      // fall through
    }
    throw new ApiError("FORBIDDEN", "Invalid request origin.");
  }

  throw new ApiError("FORBIDDEN", "Missing request origin.");
}
