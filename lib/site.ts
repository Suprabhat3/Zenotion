const DEFAULT_SITE_URL = "https://zenotion.zenscail.com";

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "");
  if (fromEnv) return fromEnv;

  const productionUrl = process.env.VERCEL_PROJECT_PRODUCTION_URL?.replace(/\/$/, "");
  if (productionUrl) return `https://${productionUrl}`;

  const vercelUrl = process.env.VERCEL_URL?.replace(/\/$/, "");
  if (vercelUrl) return `https://${vercelUrl}`;

  return DEFAULT_SITE_URL;
}

export const siteConfig = {
  name: "Zenotion",
  title: "Zenotion — AI Notes for Developers",
  description:
    "Markdown-first note management for developers. Organize specs, RFCs, and daily notes with folders, tags, autosave, public sharing, and AI assistance — free forever.",
  url: getSiteUrl(),
  ogImage: {
    path: "/og.webp",
    width: 754,
    height: 396,
    alt: "Zenotion — markdown note management for developers with folders, tags, autosave, and AI",
    type: "image/webp" as const,
  },
  twitterHandle: "@suprabhat3",
  creator: "Suprabhat",
  keywords: [
    "markdown notes",
    "developer notes",
    "note taking app",
    "AI notes",
    "notion alternative",
    "markdown editor",
    "note organization",
    "RFC notes",
    "specs workspace",
    "free notes app",
    "autosave notes",
    "public note sharing",
  ],
} as const;

export function absoluteUrl(path: string): string {
  return new URL(path, siteConfig.url).toString();
}
