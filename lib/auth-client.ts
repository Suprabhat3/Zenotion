"use client";

import { createAuthClient } from "better-auth/react";
import { emailOTPClient } from "better-auth/client/plugins";

// No baseURL needed: the client defaults to the current origin, which matches
// the catch-all handler mounted at /api/auth.
export const authClient = createAuthClient({
  // Mirrors the server `emailOTP` plugin: exposes `authClient.emailOtp.*` for
  // requesting and verifying the 6-digit email verification code.
  plugins: [emailOTPClient()],
});

export const { signIn, signUp, signOut, useSession, emailOtp } = authClient;
