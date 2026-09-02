/**
 * Shared email types. Kept free of `server-only` so client components can
 * reference the OTP purpose union when talking to the auth endpoints.
 */

/** Mirrors Better Auth's `emailOTP` plugin `type` union. */
export type OtpEmailType =
  | "sign-in"
  | "email-verification"
  | "forget-password"
  | "change-email";
