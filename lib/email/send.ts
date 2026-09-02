import "server-only";

import { prisma } from "@/lib/db";
import { isEmailConfigured, sendEmail } from "@/lib/email/client";
import { renderOtpEmail } from "@/lib/email/templates/otp";
import { renderOnboardingEmail } from "@/lib/email/templates/onboarding";
import type { OtpEmailType } from "@/lib/email/types";

/** How long an OTP stays valid, in seconds. Also drives the email copy. */
export const OTP_EXPIRES_IN_SECONDS = 600;

/**
 * Sends a one-time code. Failures are thrown so Better Auth can surface a real
 * error to the client instead of silently parking the user on a code screen
 * where no code will ever arrive.
 */
export async function sendOtpEmail(params: {
  email: string;
  code: string;
  type: OtpEmailType;
}): Promise<void> {
  const { subject, html, text } = renderOtpEmail({
    type: params.type,
    code: params.code,
    expiresInMinutes: Math.round(OTP_EXPIRES_IN_SECONDS / 60),
  });

  const result = await sendEmail({
    to: params.email,
    subject,
    html,
    text,
    tag: `otp:${params.type}`,
  });

  if (!result.ok) {
    throw new Error(
      result.reason === "not_configured"
        ? "Email delivery isn't configured, so we couldn't send your code."
        : "We couldn't send your verification code. Please try again.",
    );
  }
}

/**
 * Sends the welcome/onboarding email at most once per user.
 *
 * The `onboardingEmailSentAt` column is claimed with a conditional
 * `updateMany` before the send, so two concurrent triggers (e.g. an OTP
 * verification racing a session refresh) can't both win. If the send then
 * fails we release the claim so a later sign-in can retry.
 *
 * Never throws: a welcome email must not be able to break sign-in.
 */
export async function sendOnboardingEmailOnce(user: {
  id: string;
  email: string;
  name?: string | null;
}): Promise<void> {
  if (!isEmailConfigured()) return;

  try {
    const claimed = await prisma.user.updateMany({
      where: { id: user.id, onboardingEmailSentAt: null },
      data: { onboardingEmailSentAt: new Date() },
    });
    if (claimed.count === 0) return;

    const { subject, html, text } = renderOnboardingEmail({ name: user.name });
    const result = await sendEmail({
      to: user.email,
      subject,
      html,
      text,
      tag: "onboarding",
    });

    if (!result.ok) {
      // Release the claim so the next sign-in can try again.
      await prisma.user.updateMany({
        where: { id: user.id },
        data: { onboardingEmailSentAt: null },
      });
    }
  } catch (err) {
    console.error("[email] Onboarding email failed:", err);
  }
}
