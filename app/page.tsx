import type { Metadata } from "next";
import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import {
  ArrowRight,
  BookOpen,
  Code2,
  FolderTree,
  Globe,
  Keyboard,
  Save,
  Sparkles,
  Tags,
  Terminal,
  Zap,
} from "lucide-react";
import { LandingEditorMock } from "@/components/landing-editor-mock";
import { LandingFreePromise } from "@/components/landing-free-promise";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "Zenotion — Notes for developers",
  description:
    "Markdown-first note management with folders, tags, autosave, and AI — built to make organizing specs, RFCs, and daily notes effortless.",
};

function GithubIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M12 .5C5.37.5 0 5.87 0 12.5c0 5.3 3.44 9.8 8.21 11.39.6.11.82-.26.82-.58 0-.29-.01-1.04-.02-2.05-3.34.72-4.04-1.61-4.04-1.61-.55-1.39-1.33-1.76-1.33-1.76-1.09-.74.08-.73.08-.73 1.2.09 1.84 1.24 1.84 1.24 1.07 1.83 2.81 1.3 3.49.99.11-.78.42-1.3.76-1.6-2.66-.3-5.47-1.33-5.47-5.93 0-1.31.47-2.38 1.24-3.22-.13-.3-.54-1.52.12-3.18 0 0 1.01-.32 3.3 1.23a11.5 11.5 0 0 1 6.01 0c2.29-1.55 3.3-1.23 3.3-1.23.66 1.66.25 2.88.12 3.18.77.84 1.24 1.91 1.24 3.22 0 4.61-2.81 5.62-5.49 5.92.43.37.81 1.1.81 2.22 0 1.6-.01 2.89-.01 3.29 0 .32.21.7.82.58A12.01 12.01 0 0 0 24 12.5C24 5.87 18.63.5 12 .5z" />
    </svg>
  );
}

function LinkedinIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M20.45 20.45h-3.56v-5.57c0-1.33-.02-3.04-1.85-3.04-1.85 0-2.14 1.45-2.14 2.94v5.67H9.34V9h3.42v1.56h.05c.48-.9 1.64-1.85 3.37-1.85 3.6 0 4.27 2.37 4.27 5.46v6.28zM5.34 7.43a2.06 2.06 0 1 1 0-4.13 2.06 2.06 0 0 1 0 4.13zM7.12 20.45H3.55V9h3.57v11.45zM22.22 0H1.77C.79 0 0 .77 0 1.73v20.54C0 23.23.79 24 1.77 24h20.45c.98 0 1.78-.77 1.78-1.73V1.73C24 .77 23.2 0 22.22 0z" />
    </svg>
  );
}

function TwitterIcon(props: SVGProps<SVGSVGElement>) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
      {...props}
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.66l-5.214-6.817-5.967 6.817H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231 5.45-6.231zm-1.161 17.52h1.833L7.084 4.126H5.117l11.966 15.644z" />
    </svg>
  );
}

const HERO_BADGES = [
  { icon: Code2, label: "Markdown-first" },
  { icon: Save, label: "Autosave" },
  { icon: FolderTree, label: "Folders & tags" },
  { icon: Sparkles, label: "AI palette" },
] as const;

const VALUE_STRIP = [
  "Write in markdown",
  "Organize by project",
  "Share with a link",
  "AI on demand",
] as const;

const FEATURES = [
  {
    icon: BookOpen,
    title: "Markdown + live preview",
    desc: "Split-pane editor with sanitized GFM preview. Document the way you write READMEs.",
  },
  {
    icon: FolderTree,
    title: "Folders & tags",
    desc: "Mirror how you think about repos — group specs, sprints, and snippets without friction.",
  },
  {
    icon: Zap,
    title: "Autosave always on",
    desc: "Every edit persists in the background. Stop worrying about losing a draft mid-thought.",
  },
  {
    icon: Keyboard,
    title: "AI command palette",
    desc: "Summarize, rewrite, outline, extract tasks — one shortcut, bounded to your note.",
  },
  {
    icon: Globe,
    title: "Public share links",
    desc: "Publish RFCs, runbooks, or docs with a URL when you're ready to ship.",
  },
  {
    icon: Terminal,
    title: "Calm dev-friendly UI",
    desc: "Dark mode, version history, and a focused interface that stays out of your flow.",
  },
] as const;

const WORKFLOW_STEPS = [
  {
    step: "01",
    title: "Capture",
    desc: "Drop meeting notes, API specs, or ideas in markdown — no block editor learning curve.",
  },
  {
    step: "02",
    title: "Organize",
    desc: "Sort into folders and tag by team, sprint, or topic. Find anything in seconds.",
  },
  {
    step: "03",
    title: "Ship",
    desc: "Keep notes private or share publicly. Your workflow, your rules.",
  },
] as const;

const FADE_DELAYS = [
  "public-fade-up-delay-1",
  "public-fade-up-delay-2",
  "public-fade-up-delay-3",
  "public-fade-up-delay-4",
  "public-fade-up-delay-5",
] as const;

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-svh clay-page-bg">
      <SiteHeader />

      <main>
        {/* Hero */}
        <section className="public-hero-glow mx-auto max-w-6xl px-4 pb-12 pt-10 sm:px-6 sm:pb-16 sm:pt-20">
          <div className="relative z-10 flex flex-col items-center text-center">
            <p className="public-fade-up order-1 mb-3 max-w-xs text-[11px] font-medium uppercase leading-snug tracking-[0.14em] text-muted-foreground sm:mb-5 sm:max-w-none sm:text-sm sm:tracking-widest">
              Built for developers by a developer.
            </p>

            <h1 className="public-fade-up public-fade-up-delay-2 order-2 mx-auto mb-4 max-w-4xl text-[1.875rem] font-bold leading-[1.12] tracking-tight text-balance sm:order-3 sm:mb-5 sm:text-5xl lg:text-6xl">
              Note management that{" "}
              <span className="landing-highlight">makes life easy</span>
            </h1>

            <div className="public-fade-up public-fade-up-delay-1 order-6 hidden w-full sm:order-2 sm:block sm:w-auto">
              <div className="mx-auto flex flex-wrap justify-center gap-2">
                {HERO_BADGES.map(({ icon: Icon, label }) => (
                  <span key={label} className="landing-badge shrink-0">
                    <Icon className="h-3.5 w-3.5" aria-hidden />
                    {label}
                  </span>
                ))}
              </div>
            </div>

            <p className="public-fade-up public-fade-up-delay-3 order-3 mx-auto mb-6 max-w-2xl text-base leading-relaxed text-muted-foreground sm:order-4 sm:mb-4 sm:text-lg sm:leading-normal lg:text-xl">
              Your markdown workspace for specs, RFCs, and daily notes —
              organized, autosaved, and always free.
            </p>

            <p className="public-fade-up public-fade-up-delay-3 order-4 mx-auto mb-8 hidden max-w-xl text-sm text-muted-foreground/90 sm:order-5 sm:mb-10 sm:block">
              Less tab-hopping. Less lost context. More clarity across every
              project you touch.
            </p>

            <div className="public-fade-up public-fade-up-delay-4 order-5 flex w-full max-w-sm flex-col gap-2.5 sm:order-6 sm:max-w-none sm:flex-row sm:flex-wrap sm:justify-center sm:gap-3">
              {user ? (
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <Link href="/dashboard">
                    Open dashboard
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              ) : (
                <Button size="lg" className="w-full sm:w-auto" asChild>
                  <Link href="/signup">
                    <span className="sm:hidden">Start free</span>
                    <span className="hidden sm:inline">
                      Start free — no card needed
                    </span>
                    <ArrowRight className="ml-1 h-4 w-4" />
                  </Link>
                </Button>
              )}
              <Button
                size="lg"
                variant="outline"
                className="w-full sm:w-auto"
                asChild
              >
                <Link href="/templates">Browse dev templates</Link>
              </Button>
            </div>
          </div>

          {/* Editor mockup */}
          <div className="public-fade-up public-fade-up-delay-5 relative z-10 mx-auto mt-10 max-w-4xl sm:mt-14">
            <LandingEditorMock />
          </div>
        </section>

        {/* Value strip */}
        <section className="landing-value-strip px-6 py-5">
          <ul className="mx-auto flex max-w-4xl flex-wrap items-center justify-center gap-x-8 gap-y-2 text-sm font-medium text-muted-foreground">
            {VALUE_STRIP.map((item, index) => (
              <li key={item} className="flex items-center gap-2">
                {index > 0 ? (
                  <span className="hidden text-border sm:inline" aria-hidden>
                    ·
                  </span>
                ) : null}
                <Tags className="h-3.5 w-3.5 shrink-0 opacity-60" aria-hidden />
                {item}
              </li>
            ))}
          </ul>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="public-fade-up mb-3 text-2xl font-semibold sm:text-3xl">
              Everything you need to manage notes, not fight them
            </h2>
            <p className="public-fade-up public-fade-up-delay-1 mx-auto max-w-2xl text-muted-foreground">
              From first draft to shared doc — folders, tags, autosave, and AI
              work together so you spend time thinking, not tidying.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }, index) => {
              const delayClass = FADE_DELAYS[index] ?? "public-fade-up-delay-5";

              return (
                <div
                  key={title}
                  className={`group rounded-xl p-5 text-left clay-surface clay-lift public-fade-up ${delayClass}`}
                >
                  <Icon className="icon-bounce-hover mb-3 h-8 w-8 text-muted-foreground" />
                  <h3 className="mb-1.5 font-semibold">{title}</h3>
                  <p className="text-sm leading-relaxed text-muted-foreground">
                    {desc}
                  </p>
                </div>
              );
            })}
          </div>
        </section>

        <LandingFreePromise />

        {/* Workflow */}
        <section className="bg-muted/30 px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-12 text-center">
              <h2 className="public-fade-up mb-3 text-2xl font-semibold sm:text-3xl">
                A workflow that respects your time
              </h2>
              <p className="public-fade-up public-fade-up-delay-1 mx-auto max-w-xl text-muted-foreground">
                Three steps. Zero clutter. Notes that stay useful long after the
                meeting ends.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {WORKFLOW_STEPS.map(({ step, title, desc }, index) => {
                const delayClass = FADE_DELAYS[index] ?? "public-fade-up-delay-5";

                return (
                  <div
                    key={step}
                    className={`rounded-xl p-6 text-center clay-surface clay-lift public-fade-up ${delayClass}`}
                  >
                    <span className="mb-3 inline-block font-mono text-xs font-semibold tracking-widest text-muted-foreground">
                      {step}
                    </span>
                    <h3 className="mb-2 text-lg font-semibold">{title}</h3>
                    <p className="text-sm leading-relaxed text-muted-foreground">
                      {desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Bottom CTA */}
        <section className="border-t border-border/60 px-6 py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
            <Zap className="ambient-float h-10 w-10 text-muted-foreground" />
            <h2 className="public-fade-up text-2xl font-semibold sm:text-3xl">
              Ready to simplify your note stack?
            </h2>
            <p className="public-fade-up public-fade-up-delay-1 max-w-lg text-muted-foreground">
              Join Zenotion and get back to building. Your notes stay organized,
              searchable, and one click away.
            </p>
            <div className="public-fade-up public-fade-up-delay-2 flex flex-wrap justify-center gap-3">
              {user ? (
                <Button size="lg" asChild>
                  <Link href="/dashboard">Go to dashboard</Link>
                </Button>
              ) : (
                <Button size="lg" asChild>
                  <Link href="/signup">Create free account</Link>
                </Button>
              )}
              <Button size="lg" variant="outline" asChild>
                <Link href="/about">See how it works</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <footer className="border-t border-border/60 px-6 py-8 text-center text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-3xl flex-col items-center gap-4">
          <div className="flex items-center gap-3">
            {(
              [
                {
                  icon: GithubIcon,
                  label: "GitHub",
                  href: "https://github.com/suprabhat3",
                },
                {
                  icon: LinkedinIcon,
                  label: "LinkedIn",
                  href: "https://linkedin.com/in/suprabhatt",
                },
                {
                  icon: TwitterIcon,
                  label: "Twitter",
                  href: "https://twitter.com/suprabhat3",
                },
                {
                  icon: Globe,
                  label: "Portfolio",
                  href: "https://new.suprabhat.site",
                },
              ] satisfies {
                icon: ComponentType<SVGProps<SVGSVGElement>>;
                label: string;
                href: string;
              }[]
            ).map(({ icon: Icon, label, href }) => (
              <a
                key={label}
                href={href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={label}
                className="social-icon-hover rounded-full p-2 text-muted-foreground clay-surface"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
          <p>
            Built by{" "}
            <a
              href="https://github.com/suprabhat3"
              target="_blank"
              rel="noopener noreferrer"
              className="link-underline-grow text-primary"
            >
              Suprabhat
            </a>{" "}
            © {new Date().getFullYear()} Zenotion
          </p>
        </div>
      </footer>
    </div>
  );
}
