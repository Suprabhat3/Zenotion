import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db";

const betterAuthSecret = process.env.BETTER_AUTH_SECRET;
const betterAuthUrl = process.env.BETTER_AUTH_URL;

if (process.env.NODE_ENV === "production") {
  if (!betterAuthSecret || betterAuthSecret.length < 32) {
    throw new Error(
      "BETTER_AUTH_SECRET must be set to a random string of at least 32 characters in production.",
    );
  }
  if (!betterAuthUrl) {
    throw new Error("BETTER_AUTH_URL must be set in production.");
  }
}

const googleClientId = process.env.GOOGLE_CLIENT_ID;
const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

// Only register the Google provider when both credentials are present so the
// app still boots (with email/password only) when OAuth isn't configured.
const socialProviders =
  googleClientId && googleClientSecret
    ? {
        google: {
          clientId: googleClientId,
          clientSecret: googleClientSecret,
        },
      }
    : undefined;

export const auth = betterAuth({
  database: prismaAdapter(prisma, { provider: "postgresql" }),
  secret: betterAuthSecret,
  baseURL: betterAuthUrl,
  emailAndPassword: {
    enabled: true,
  },
  ...(socialProviders ? { socialProviders } : {}),
  // nextCookies must be the last plugin so it can set cookies after responses.
  plugins: [nextCookies()],
});

export type Session = typeof auth.$Infer.Session;
