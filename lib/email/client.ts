import "server-only";

import { Resend } from "resend";

/**
 * Resend transport. Kept server-only: `RESEND_API_KEY` and `EMAIL_FROM` must
 * never reach the client bundle.
 *
 * When the key is missing the app still boots and every send becomes a no-op
 * that reports a "not configured" failure — the same graceful-degradation shape
 * used for OpenAI/ImageKit elsewhere in the codebase.
 */

const resendApiKey = process.env.RESEND_API_KEY;
const emailFrom = process.env.EMAIL_FROM;

let cachedClient: Resend | null = null;

export function isEmailConfigured(): boolean {
  return Boolean(resendApiKey && emailFrom);
}

function getResend(): Resend | null {
  if (!resendApiKey) return null;
  cachedClient ??= new Resend(resendApiKey);
  return cachedClient;
}

export type SendEmailInput = {
  to: string;
  subject: string;
  html: string;
  text: string;
  /** Marks the message as transactional-but-unimportant for retry logging. */
  tag?: string;
};

export type SendEmailResult =
  | { ok: true; id: string | null }
  | { ok: false; reason: "not_configured" | "provider_error"; message: string };

export async function sendEmail(
  input: SendEmailInput,
): Promise<SendEmailResult> {
  const client = getResend();
  if (!client || !emailFrom) {
    // Surfaced in server logs so a misconfigured deploy is obvious, while the
    // caller decides whether the failure should block the user flow.
    console.error(
      `[email] Skipped "${input.tag ?? input.subject}": RESEND_API_KEY / EMAIL_FROM not configured.`,
    );
    return {
      ok: false,
      reason: "not_configured",
      message: "Email delivery is not configured on the server.",
    };
  }

  try {
    const { data, error } = await client.emails.send({
      from: emailFrom,
      to: input.to,
      subject: input.subject,
      html: input.html,
      text: input.text,
    });

    if (error) {
      console.error(`[email] Resend rejected "${input.tag ?? input.subject}":`, error);
      return {
        ok: false,
        reason: "provider_error",
        message: error.message || "The email provider rejected the request.",
      };
    }

    return { ok: true, id: data?.id ?? null };
  } catch (err) {
    console.error(`[email] Failed to send "${input.tag ?? input.subject}":`, err);
    return {
      ok: false,
      reason: "provider_error",
      message:
        err instanceof Error ? err.message : "Unknown email transport failure.",
    };
  }
}
