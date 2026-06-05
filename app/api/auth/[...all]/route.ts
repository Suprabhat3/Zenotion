import { toNextJsHandler } from "better-auth/next-js";
import { auth } from "@/lib/auth";

// Better Auth mounts all its endpoints (sign-in, sign-up, OAuth callbacks,
// session, sign-out, ...) under this catch-all route handler.
export const { GET, POST } = toNextJsHandler(auth);
