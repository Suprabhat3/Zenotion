import { headers } from "next/headers";
import { auth } from "@/lib/auth";
import { ApiError } from "@/lib/api";

export type AuthUser = {
  id: string;
  email: string;
  name: string;
  image?: string | null;
};

/** Returns the current user, or null when unauthenticated. */
export async function getCurrentUser(): Promise<AuthUser | null> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user) return null;
  return {
    id: session.user.id,
    email: session.user.email,
    name: session.user.name,
    image: session.user.image,
  };
}

/**
 * For route handlers and server actions that require auth. Throws an
 * `ApiError` (mapped to 401 by `handleApiError`) when no session exists.
 */
export async function requireUser(): Promise<AuthUser> {
  const user = await getCurrentUser();
  if (!user) {
    throw new ApiError("UNAUTHORIZED", "You must be signed in to do that.");
  }
  return user;
}
