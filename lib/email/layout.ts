import "server-only";

/**
 * Shared HTML shell for transactional email.
 *
 * Email clients (Gmail, Outlook, Apple Mail) strip <style> blocks, external
 * CSS, flexbox and grid inconsistently, so every rule here is an inline style
 * on a table-based layout. The palette mirrors the app's light claymorphism
 * theme — soft surfaces, warm neutrals, generous radii — because most clients
 * render on a light canvas regardless of the reader's OS theme.
 */

export const emailTheme = {
  pageBg: "#f4f1ea",
  cardBg: "#fffdf8",
  border: "#e6e0d4",
  text: "#1f1b16",
  muted: "#6f675c",
  accent: "#2f2a24",
  accentText: "#fffdf8",
  soft: "#f7f4ed",
  codeBg: "#efeae0",
} as const;

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

/** Escapes text interpolated into email HTML (names, emails, subjects). */
export function escapeHtml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export type EmailShellOptions = {
  /** Hidden inbox-list snippet shown next to the subject line. */
  preheader: string;
  /** Pre-rendered table rows / blocks for the card body. */
  body: string;
  /** Small print under the card. */
  footer: string;
};

export function renderEmailShell({
  preheader,
  body,
  footer,
}: EmailShellOptions): string {
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <meta name="color-scheme" content="light" />
    <meta name="supported-color-schemes" content="light" />
    <title>Zenotion</title>
  </head>
  <body style="margin:0;padding:0;background-color:${emailTheme.pageBg};color:${emailTheme.text};font-family:${FONT_STACK};-webkit-font-smoothing:antialiased;">
    <div style="display:none;max-height:0;overflow:hidden;opacity:0;">${escapeHtml(preheader)}</div>
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="background-color:${emailTheme.pageBg};">
      <tr>
        <td align="center" style="padding:32px 16px;">
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:560px;width:100%;">
            <tr>
              <td align="center" style="padding-bottom:20px;">
                <span style="display:inline-block;font-size:19px;font-weight:700;letter-spacing:-0.3px;color:${emailTheme.text};">Zenotion</span>
              </td>
            </tr>
            <tr>
              <td style="background-color:${emailTheme.cardBg};border:1px solid ${emailTheme.border};border-radius:20px;padding:32px 28px;box-shadow:0 10px 24px rgba(31,27,22,0.07);">
                ${body}
              </td>
            </tr>
            <tr>
              <td style="padding:22px 8px 0;text-align:center;font-size:12px;line-height:19px;color:${emailTheme.muted};">
                ${footer}
              </td>
            </tr>
          </table>
        </td>
      </tr>
    </table>
  </body>
</html>`;
}

/** Primary call-to-action button, rendered as a padded table cell for Outlook. */
export function renderButton(href: string, label: string): string {
  return `<table role="presentation" cellpadding="0" cellspacing="0" border="0">
    <tr>
      <td align="center" bgcolor="${emailTheme.accent}" style="border-radius:12px;">
        <a href="${escapeHtml(href)}" style="display:inline-block;padding:13px 26px;font-size:15px;font-weight:600;color:${emailTheme.accentText};text-decoration:none;border-radius:12px;">${escapeHtml(label)}</a>
      </td>
    </tr>
  </table>`;
}
