import "server-only";

import { siteConfig, absoluteUrl } from "@/lib/site";
import {
  emailTheme,
  escapeHtml,
  renderButton,
  renderEmailShell,
} from "@/lib/email/layout";

type Feature = {
  /** Emoji used as a lightweight icon — renders everywhere, needs no image host. */
  icon: string;
  title: string;
  desc: string;
};

const FEATURES: readonly Feature[] = [
  {
    icon: "✍️",
    title: "Markdown with live preview",
    desc: "A split-pane editor with sanitized GitHub-flavored markdown — tables, task lists, code blocks, even Mermaid diagrams. Write docs the way you write READMEs.",
  },
  {
    icon: "⚡",
    title: "AI command palette",
    desc: "Hit the palette and let AI summarize, rewrite, continue writing, fix grammar, change tone, extract tasks, build an outline, translate, or turn a messy dump into clean markdown.",
  },
  {
    icon: "🗂️",
    title: "Folders, tags & quick switcher",
    desc: "Group specs, sprints, and snippets into folders, tag them by topic, then jump to any note in a couple of keystrokes.",
  },
  {
    icon: "💾",
    title: "Autosave with version history",
    desc: "Every keystroke persists in the background with a visible save status — and you can roll any note back to an earlier version.",
  },
  {
    icon: "🔗",
    title: "Wiki links & backlinks",
    desc: "Type [[note name]] to link notes together, and see every note that points back at the one you're reading.",
  },
  {
    icon: "🌍",
    title: "Public share links",
    desc: "Flip a note public to get a clean, shareable URL for an RFC, runbook, or changelog. Everything else stays private to you.",
  },
  {
    icon: "🔒",
    title: "One encrypted secret note",
    desc: "Every account gets a single zero-knowledge note, encrypted in your browser with your passphrase. Even we can't read it.",
  },
] as const;

type Step = { step: string; title: string; desc: string };

const FIRST_STEPS: readonly Step[] = [
  {
    step: "1",
    title: "Create your first note",
    desc: "Start from a blank page or pick a ready-made template from the gallery.",
  },
  {
    step: "2",
    title: "Try one AI command",
    desc: "Paste in rough meeting notes and run “clean up as markdown” or “extract tasks”.",
  },
  {
    step: "3",
    title: "Organize and share",
    desc: "Drop it in a folder, add a tag, and publish it with a share link when it's ready.",
  },
] as const;

function renderFeature(feature: Feature, isLast: boolean): string {
  return `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 ${isLast ? "0" : "14px"};">
    <tr>
      <td style="background-color:${emailTheme.soft};border:1px solid ${emailTheme.border};border-radius:14px;padding:16px 18px;">
        <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
          <tr>
            <td width="30" valign="top" style="font-size:20px;line-height:24px;padding-right:10px;">${feature.icon}</td>
            <td valign="top">
              <div style="font-size:15px;line-height:22px;font-weight:600;color:${emailTheme.text};">${escapeHtml(feature.title)}</div>
              <div style="margin-top:4px;font-size:14px;line-height:21px;color:${emailTheme.muted};">${escapeHtml(feature.desc)}</div>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>`;
}

function renderStep(step: Step): string {
  return `<tr>
    <td width="28" valign="top" style="padding:0 10px 12px 0;">
      <div style="width:22px;height:22px;border-radius:11px;background-color:${emailTheme.accent};color:${emailTheme.accentText};font-size:12px;line-height:22px;font-weight:700;text-align:center;">${escapeHtml(step.step)}</div>
    </td>
    <td valign="top" style="padding:0 0 12px;">
      <div style="font-size:14px;line-height:22px;font-weight:600;color:${emailTheme.text};">${escapeHtml(step.title)}</div>
      <div style="font-size:13px;line-height:20px;color:${emailTheme.muted};">${escapeHtml(step.desc)}</div>
    </td>
  </tr>`;
}

export type OnboardingEmail = { subject: string; html: string; text: string };

export function renderOnboardingEmail(params: {
  /** User's display name; falls back to a neutral greeting when empty. */
  name?: string | null;
}): OnboardingEmail {
  const firstName = (params.name ?? "").trim().split(/\s+/)[0] ?? "";
  const greeting = firstName ? `Welcome, ${firstName} 👋` : "Welcome to Zenotion 👋";
  const dashboardUrl = absoluteUrl("/dashboard");
  const templatesUrl = absoluteUrl("/templates");

  const body = `
    <h1 style="margin:0 0 10px;font-size:23px;line-height:31px;font-weight:700;color:${emailTheme.text};">${escapeHtml(greeting)}</h1>
    <p style="margin:0 0 20px;font-size:15px;line-height:24px;color:${emailTheme.muted};">
      Your workspace is ready. Zenotion is a markdown-first notes app built for developers — fast to write in, easy to organize, with AI on hand when you want it. Here's what you can do from day one.
    </p>

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:0 0 24px;">
      <tr><td>${renderButton(dashboardUrl, "Open your workspace")}</td></tr>
    </table>

    ${FEATURES.map((feature, index) => renderFeature(feature, index === FEATURES.length - 1)).join("\n")}

    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0" style="margin:26px 0 0;">
      <tr>
        <td style="border-top:1px solid ${emailTheme.border};padding-top:22px;">
          <div style="font-size:16px;line-height:24px;font-weight:700;color:${emailTheme.text};margin-bottom:14px;">Your first five minutes</div>
          <table role="presentation" width="100%" cellpadding="0" cellspacing="0" border="0">
            ${FIRST_STEPS.map(renderStep).join("\n")}
          </table>
        </td>
      </tr>
    </table>

    <p style="margin:18px 0 0;font-size:14px;line-height:22px;color:${emailTheme.muted};">
      In a hurry? Start from a
      <a href="${escapeHtml(templatesUrl)}" style="color:${emailTheme.text};font-weight:600;text-decoration:underline;">ready-made template</a>
      — meeting notes, RFCs, standups, and more. Zenotion is free, and dark mode is one click away.
    </p>
    <p style="margin:14px 0 0;font-size:14px;line-height:22px;color:${emailTheme.muted};">
      Happy writing,<br />${escapeHtml(siteConfig.creator)} &amp; the Zenotion team
    </p>
  `;

  const html = renderEmailShell({
    preheader:
      "Markdown notes, folders and tags, autosave, AI commands, and share links — here's how to get started.",
    body,
    footer: `You're receiving this because you just created a ${escapeHtml(siteConfig.name)} account.<br /><a href="${escapeHtml(absoluteUrl("/privacy"))}" style="color:${emailTheme.muted};">Privacy</a> · <a href="${escapeHtml(absoluteUrl("/terms"))}" style="color:${emailTheme.muted};">Terms</a>`,
  });

  const text = [
    greeting,
    "",
    "Your workspace is ready. Zenotion is a markdown-first notes app built for developers — fast to write in, easy to organize, with AI on hand when you want it.",
    "",
    `Open your workspace: ${dashboardUrl}`,
    "",
    "WHAT YOU CAN DO",
    ...FEATURES.map((feature) => `- ${feature.title}: ${feature.desc}`),
    "",
    "YOUR FIRST FIVE MINUTES",
    ...FIRST_STEPS.map((step) => `${step.step}. ${step.title} — ${step.desc}`),
    "",
    `Browse templates: ${templatesUrl}`,
    "",
    `Happy writing,\n${siteConfig.creator} & the Zenotion team`,
  ].join("\n");

  return {
    subject: "Welcome to Zenotion — here's how to get the most out of it",
    html,
    text,
  };
}
