import { NextResponse } from "next/server";

// ---------------------------------------------------------------------------
// Structured API response contract (see AGENTS.md)
//   success: { success: true, data, message? }
//   failure: { success: false, error: { code, message, details? } }
// ---------------------------------------------------------------------------

export type ApiErrorCode =
  | "VALIDATION_ERROR"
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL_ERROR"
  | "SERVICE_UNAVAILABLE";

const STATUS_BY_CODE: Record<ApiErrorCode, number> = {
  VALIDATION_ERROR: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  CONFLICT: 409,
  INTERNAL_ERROR: 500,
  SERVICE_UNAVAILABLE: 503,
};

export type ApiSuccess<T> = {
  success: true;
  data: T;
  message?: string;
};

export type ApiFailure = {
  success: false;
  error: {
    code: ApiErrorCode;
    message: string;
    details?: unknown;
  };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

/** Thrown anywhere inside a route handler and converted by `handleApiError`. */
export class ApiError extends Error {
  readonly code: ApiErrorCode;
  readonly details?: unknown;

  constructor(code: ApiErrorCode, message: string, details?: unknown) {
    super(message);
    this.name = "ApiError";
    this.code = code;
    this.details = details;
  }
}

export function ok<T>(
  data: T,
  init?: { status?: number; message?: string },
): NextResponse<ApiSuccess<T>> {
  return NextResponse.json(
    { success: true, data, ...(init?.message ? { message: init.message } : {}) },
    { status: init?.status ?? 200 },
  );
}

export function fail(
  code: ApiErrorCode,
  message: string,
  details?: unknown,
): NextResponse<ApiFailure> {
  return NextResponse.json(
    { success: false, error: { code, message, ...(details ? { details } : {}) } },
    { status: STATUS_BY_CODE[code] },
  );
}

/**
 * Centralized error -> response mapping. Wrap route handler bodies in
 * `try/catch` and pass the caught error here.
 */
export function handleApiError(error: unknown): NextResponse<ApiFailure> {
  if (error instanceof ApiError) {
    return fail(error.code, error.message, error.details);
  }
  // Don't leak internals to clients; log server-side.
  console.error("[api] unexpected error:", error);
  return fail("INTERNAL_ERROR", "Something went wrong. Please try again.");
}
