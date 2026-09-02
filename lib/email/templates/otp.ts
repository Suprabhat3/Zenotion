import "server-only";

import type { OtpEmailType } from "@/lib/email/types";
import {
  emailTheme,
  escapeHtml,
  renderEmailShell,
} from "@/lib/email/layout";

type OtpCopy = {
  subject: string;
  preheader: string;
  heading: string;
  intro: string;
  hint: string;
};

function copyFor(type: OtpEmailType, code: string): OtpCopy {
  switch (type) {
    case "sign-in":
      return {
        subject: `${code} is your Zenotion sign-in code`,
        preheader: `Your sign-in code is ${code}.`,
        heading: "Your sign-in code",
        intro: "Enter this code to sign in to your Zenotion workspace.",
        hint: "If you didn't try to sign in, you can safely ignore this email.",
      };
    case "forget-password":
      return {
        subject: `${code} is your Zenotion password reset code`,
        preheader: `Your password reset code is ${code}.`,
        heading: "Reset your password",
        intro: "Enter this code to choose a new password for your account.",
        hint: "If you didn't ask to reset your password, ignore this email — your current password still works.",
      };
    case "change-email":
      return {
        subject: `${code} is your Zenotion email change code`,
        preheader: `Your email change code is ${code}.`,
        heading: "Confirm your new email",
        intro: "Enter this code to finish moving your workspace to this email address.",
        hint: "If you didn't request an email change, ignore this email and consider updating your password.",
      };
    case "email-verification":
    default:
      return {
        subject: `${code} is your Zenotion verification code`,
        preheader: `Your verification code is ${code}.`,
        heading: "Verify your email",
        intro:
          "Enter this code to confirm your email address and unlock your Zenotion workspace.",
        hint: "If you didn't create a Zenotion account, you can safely ignore this email.",
      };
  }
}

export type OtpEmail = { subject: string; html: string; text: string };

export function renderOtpEmail(params: {
  type: OtpEmailType;
  code: string;
  expiresInMinutes: number;
}): OtpEmail {
  const { type, code, expiresInMinutes } = params;
  const copy = copyFor(type, code);
  const safeCode = escapeHtml(code);
  const expiry =
    expiresInMinutes === 1 ? "1 minute" : `${expiresInMinutes} minutes`;

  const body = `
    <h1 style="margin:0 0 10px;font-size:22px;line-height:30px;font-weight:700;color:${emailTheme.text};">${escapeHtml(copy.heading)}</h1>
    <p style="margin:0 0 24px;font-size:15px;line-height:24px;color:${emailTheme.muted};">${escapeHtml(copy.intro)}</p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
      <tr>
        <td align="center" style="background-color:${emailTheme.codeBg};border:1px solid ${emailTheme.border};border-radius:16px;padding:22px 16px;">
          <div style="font-family:'SFMono-Regular',Consolas,'Liberation Mono',Menlo,monospace;font-size:34px;line-height:40px;font-weight:700;letter-spacing:10px;color:${emailTheme.text};">${safeCode}</div>
        </td>
      </tr>
    </table>

    <p style="margin:22px 0 0;font-size:14px;line-height:22px;color:${emailTheme.muted};">
      This code expires in <strong style="color:${emailTheme.text};">${escapeHtml(expiry)}</strong> and can be used once.
    </p>
    <p style="margin:14px 0 0;font-size:13px;line-height:21px;color:${emailTheme.muted};">${escapeHtml(copy.hint)}</p>
  `;

  const html = renderEmailShell({
    preheader: copy.preheader,
    body,
    footer:
      "Zenotion · markdown notes for developers<br />Never share this code with anyone.",
  });

  const text = [
    copy.heading,
    "",
    copy.intro,
    "",
    `Code: ${code}`,
    `This code expires in ${expiry} and can be used once.`,
    "",
    copy.hint,
    "",
    "Zenotion — never share this code with anyone.",
  ].join("\n");

  return { subject: copy.subject, html, text };
}
