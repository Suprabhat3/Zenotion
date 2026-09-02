import { betterAuth } from "better-auth";
import { APIError, createAuthMiddleware } from "better-auth/api";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { emailOTP } from "better-auth/plugins";
import { nextCookies } from "better-auth/next-js";
import { prisma } from "@/lib/db";
import {
  OTP_EXPIRES_IN_SECONDS,
  sendOnboardingEmailOnce,
  sendOtpEmail,
} from "@/lib/email/send";

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
    // No session is issued until the email is proven. Sign-up returns without
    // a session and sign-in fails with `EMAIL_NOT_VERIFIED` until the user
    // enters the 6-digit code we email them.
    requireEmailVerification: true,
  },
  emailVerification: {
    sendOnSignUp: true,
    // Re-send a fresh code when an unverified user tries to sign in, so they
    // never get stuck with an expired one.
    sendOnSignIn: true,
    // Deliberately off: verifying an email must not mint a session on its own,
    // otherwise mailbox access alone would bypass the password. The client
    // signs in with the password it already collected once verification lands.
    autoSignInAfterVerification: false,
    async afterEmailVerification(user) {
      await sendOnboardingEmailOnce({
        id: user.id,
        email: user.email,
        name: user.name,
      });
    },
  },
  ...(socialProviders ? { socialProviders } : {}),
  hooks: {
    // The email-otp plugin also ships a passwordless sign-in route and a
    // "sign-in" OTP purpose. We only use OTP to *verify* an address, so both
    // are closed off — otherwise mailbox access alone would replace the
    // password as a credential.
    before: createAuthMiddleware(async (ctx) => {
      if (ctx.path === "/sign-in/email-otp") {
        throw new APIError("NOT_FOUND", {
          code: "OTP_SIGN_IN_DISABLED",
          message: "Sign in with your password or with Google.",
        });
      }
      if (
        ctx.path === "/email-otp/send-verification-otp" &&
        ctx.body?.type !== "email-verification"
      ) {
        throw new APIError("BAD_REQUEST", {
          code: "UNSUPPORTED_OTP_TYPE",
          message: "Only email verification codes can be requested.",
        });
      }
    }),
  },
  databaseHooks: {
    user: {
      create: {
        async after(user) {
          // Only social sign-ups land here already verified; email/password
          // users get the welcome mail from `afterEmailVerification` instead.
          if (!user.emailVerified) return;
          await sendOnboardingEmailOnce({
            id: user.id,
            email: user.email,
            name: user.name,
          });
        },
      },
    },
  },
  plugins: [
    emailOTP({
      otpLength: 6,
      expiresIn: OTP_EXPIRES_IN_SECONDS,
      // Codes are hashed at rest, so a database leak can't be replayed.
      storeOTP: "hashed",
      allowedAttempts: 5,
      // Replaces Better Auth's default verification *link* with our 6-digit
      // code for every verification email it would otherwise send.
      overrideDefaultEmailVerification: true,
      // Email OTP is a verification step, not a sign-in method here: an
      // unregistered email must never be able to create an account this way.
      disableSignUp: true,
      rateLimit: { window: 60, max: 3 },
      async sendVerificationOTP({ email, otp, type }) {
        await sendOtpEmail({ email, code: otp, type });
      },
    }),
    // nextCookies must be the last plugin so it can set cookies after responses.
    nextCookies(),
  ],
});

export type Session = typeof auth.$Infer.Session;
