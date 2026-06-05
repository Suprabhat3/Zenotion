"use client";

import { createAuthClient } from "better-auth/react";

// No baseURL needed: the client defaults to the current origin, which matches
// the catch-all handler mounted at /api/auth.
export const authClient = createAuthClient();

export const { signIn, signUp, signOut, useSession } = authClient;
