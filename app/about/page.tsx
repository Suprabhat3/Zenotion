import type { Metadata } from "next";
import Link from "next/link";
import { Suspense, type ComponentType, type SVGProps } from "react";
import {
  ArrowRight,
  BookOpen,
  ExternalLink,
  FolderTree,
  Globe,
  Heart,
  Keyboard,
  Save,
  Shield,
  Sparkles,
  User,
  Zap,
} from "lucide-react";
import { LandingFreePromise } from "@/components/landing-free-promise";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/session";
import type { AuthUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "About",
  description:
    "Learn about Zenotion — a free, markdown-first notes app with folders, tags, autosave, public sharing, and bring-your-own-key AI.",
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

const FEATURES = [
  {
    icon: BookOpen,
    title: "Markdown + live preview",
    desc: "Split-pane editor with sanitized GitHub Flavored Markdown preview — write the way you document code.",
  },
  {
    icon: FolderTree,
    title: "Folders & tags",
    desc: "Group specs, sprints, and snippets. Tag by team or topic and find anything in seconds.",
  },
  {
    icon: Save,
    title: "Autosave & version history",
    desc: "Every edit persists in the background. Roll back to earlier versions when you need to.",
  },
  {
    icon: Keyboard,
    title: "AI command palette",
    desc: "Summarize, rewrite, outline, extract tasks, and more — one shortcut, bounded to your note.",
  },
  {
    icon: Globe,
    title: "Public share links",
    desc: "Publish RFCs, runbooks, or docs with a URL when you are ready to ship.",
  },
  {
    icon: Shield,
    title: "Private by default",
    desc: "Your notes are scoped to your account. Public sharing is always an explicit opt-in.",
  },
] as const;

const AI_ACTIONS = [
  { label: "Summarize", desc: "Condense long notes into key points" },
  { label: "Rewrite", desc: "Clearer wording, same meaning" },
  { label: "Continue writing", desc: "Pick up where you left off" },
  { label: "Fix grammar", desc: "Polish spelling and punctuation" },
  { label: "Change tone", desc: "Adjust voice for your audience" },
  { label: "Extract tasks", desc: "Turn prose into actionable checklists" },
  { label: "Generate title", desc: "Name a note from its content" },
  { label: "Create outline", desc: "Structure ideas before you expand" },
  { label: "Simplify", desc: "Make dense text easier to read" },
  { label: "Translate", desc: "Reach readers in another language" },
  { label: "Flashcards", desc: "Study material from your notes" },
  { label: "Clean markdown", desc: "Fix messy pasted text into proper markdown" },
] as const;

const TECH_STACK = [
  "Next.js 16",
  "React 19",
  "TypeScript",
  "Prisma",
  "PostgreSQL",
  "Better Auth",
  "Tailwind CSS",
  "OpenAI SDK",
] as const;

const FOUNDER_SKILLS = [
  "Next.js",
  "React",
  "TypeScript",
  "GenAI",
  "PostgreSQL",
  "Better Auth",
] as const;

const FOUNDER_LINKS = [
  {
    icon: Globe,
    label: "Portfolio",
    href: "https://new.suprabhat.site",
  },
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
] satisfies {
  icon: ComponentType<SVGProps<SVGSVGElement>>;
  label: string;
  href: string;
}[];

const FADE_DELAYS = [
  "public-fade-up-delay-1",
  "public-fade-up-delay-2",
  "public-fade-up-delay-3",
  "public-fade-up-delay-4",
  "public-fade-up-delay-5",
] as const;

function AboutActions({ user }: { user: AuthUser | null }) {
  return (
    <>
      {user ? (
        <Button size="lg" asChild>
          <Link href="/dashboard">
            Open dashboard
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      ) : (
        <Button size="lg" asChild>
          <Link href="/signup">
            Create free account
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      )}
      <Button size="lg" variant="outline" asChild>
        <Link href="/templates">Browse templates</Link>
      </Button>
    </>
  );
}

async function AboutActionsLoader({
  userPromise,
}: {
  userPromise: Promise<AuthUser | null>;
}) {
  return <AboutActions user={await userPromise} />;
}

export default function AboutPage() {
  const userPromise = getCurrentUser();

  return (
    <div className="min-h-svh clay-page-bg">
      <Suspense fallback={null}>
        <SiteHeader userPromise={userPromise} />
      </Suspense>

      <main>
        {/* Hero */}
        <section className="public-hero-glow mx-auto max-w-4xl px-6 pb-12 pt-16 text-center sm:pt-20">
          <span className="public-fade-up landing-badge mb-4 inline-flex">
            <Heart className="h-3.5 w-3.5" aria-hidden />
            Built for developers
          </span>
          <h1 className="public-fade-up public-fade-up-delay-1 mb-4 text-3xl font-bold tracking-tight sm:text-4xl lg:text-5xl">
            About <span className="landing-highlight">Zenotion</span>
          </h1>
          <p className="public-fade-up public-fade-up-delay-2 mx-auto max-w-2xl text-base leading-relaxed text-muted-foreground sm:text-lg">
            A calm, markdown-first workspace for specs, RFCs, and daily notes —
            organized, autosaved, and free. No block editor learning curve, no
            subscription for the essentials.
          </p>
        </section>

        {/* Mission */}
        <section className="border-y border-border/60 bg-muted/20 px-6 py-16">
          <div className="public-fade-up mx-auto max-w-3xl text-center">
            <h2 className="mb-4 text-2xl font-semibold sm:text-3xl">
              Why Zenotion exists
            </h2>
            <p className="mb-4 leading-relaxed text-muted-foreground">
              Developers already think in markdown — READMEs, PR descriptions,
              issue templates, and docs. Zenotion brings that same workflow to
              personal and team notes without forcing you into a heavyweight
              block editor or another monthly subscription.
            </p>
            <p className="leading-relaxed text-muted-foreground">
              The platform is free forever. AI is optional and powered by your
              own API keys, stored locally in your browser — never on our
              servers. You pay only your provider, with no markup from us.
            </p>
          </div>
        </section>

        {/* Features */}
        <section className="mx-auto max-w-6xl px-6 py-20">
          <div className="mb-12 text-center">
            <h2 className="public-fade-up mb-3 text-2xl font-semibold sm:text-3xl">
              What you get
            </h2>
            <p className="public-fade-up public-fade-up-delay-1 mx-auto max-w-2xl text-muted-foreground">
              Everything you need to capture, organize, and share notes — without
              fighting the tool.
            </p>
          </div>

          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map(({ icon: Icon, title, desc }, index) => {
              const delayClass = FADE_DELAYS[index] ?? "public-fade-up-delay-5";

              return (
                <div
                  key={title}
                  className={`rounded-xl p-5 text-left clay-surface clay-lift public-fade-up ${delayClass}`}
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

        {/* AI actions */}
        <section className="bg-muted/30 px-6 py-20">
          <div className="mx-auto max-w-5xl">
            <div className="mb-10 text-center">
              <span className="landing-badge mb-4 inline-flex">
                <Sparkles className="h-3.5 w-3.5" aria-hidden />
                AI assistance
              </span>
              <h2 className="public-fade-up mb-3 text-2xl font-semibold sm:text-3xl">
                Twelve commands, one palette
              </h2>
              <p className="public-fade-up public-fade-up-delay-1 mx-auto max-w-2xl text-muted-foreground">
                Open the AI command palette from any note. Each action stays
                bounded to your content — no autonomous agents, no surprises.
              </p>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {AI_ACTIONS.map(({ label, desc }, index) => {
                const delayClass = FADE_DELAYS[index % 5] ?? "public-fade-up-delay-5";

                return (
                  <div
                    key={label}
                    className={`rounded-lg px-4 py-3 clay-surface clay-lift-subtle public-fade-up ${delayClass}`}
                  >
                    <p className="text-sm font-medium">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                );
              })}
            </div>

            <p className="public-fade-up public-fade-up-delay-3 mt-4 text-center text-sm text-muted-foreground">
              Works with OpenAI, Gemini, Anthropic, Groq, and OpenRouter — bring
              your own key and choose the model that fits.
            </p>
          </div>
        </section>

        <LandingFreePromise />

        {/* Tech stack */}
        <section className="px-6 py-20">
          <div className="mx-auto max-w-3xl text-center">
            <div className="public-fade-up mb-6 flex justify-center">
            </div>
            <h2 className="public-fade-up mb-3 text-2xl font-semibold sm:text-3xl">
              Under the hood
            </h2>
            <p className="public-fade-up public-fade-up-delay-1 mb-8 text-muted-foreground">
              A production-shaped stack with structured API responses, user-scoped
              data access, and multiple Next.js rendering strategies — SSR for
              protected routes, SSG and ISR for public pages.
            </p>
            <div className="public-fade-up public-fade-up-delay-2 flex flex-wrap justify-center gap-2">
              {TECH_STACK.map((item) => (
                <span
                  key={item}
                  className="rounded-full px-3 py-1 text-sm font-medium clay-surface clay-lift-subtle"
                >
                  {item}
                </span>
              ))}
            </div>
          </div>
        </section>

        {/* Founder */}
        <section className="border-y border-border/60 bg-muted/20 px-6 py-20">
          <div className="mx-auto max-w-4xl">
            <div className="mb-10 text-center">
              <span className="landing-badge mb-4 inline-flex">
                <User className="h-3.5 w-3.5" aria-hidden />
                The founder
              </span>
              <h2 className="public-fade-up mb-3 text-2xl font-semibold sm:text-3xl">
                Built by a developer, for developers
              </h2>
            </div>

            <div className="public-fade-up public-fade-up-delay-1 grid gap-8 rounded-xl p-6 sm:p-8 clay-surface clay-lift lg:grid-cols-[auto_1fr] lg:items-start">

              <div className="text-center lg:text-left">
                <h3 className="mb-1 text-xl font-semibold">Suprabhat</h3>
                <p className="mb-4 text-sm font-medium text-primary">
                  Web App Developer &amp; AI Engineer
                </p>
                <p className="mb-4 leading-relaxed text-muted-foreground">
                  Son of proud parents. Building web and GenAI software that
                  (usually) work. Suprabhat specializes in modern web applications
                  and AI-powered solutions — with deep experience in Next.js,
                  React, and cutting-edge AI technologies.
                </p>
                <p className="mb-6 leading-relaxed text-muted-foreground">
                  Zenotion started as a gift to the developer community: a calm
                  place for notes without another subscription eating into
                  side-project budgets. When not coding, you will find him
                  exploring new technologies, contributing to open source, or
                  sharing knowledge through his blog and videos.
                </p>

                <div className="mb-6 flex flex-wrap justify-center gap-2 lg:justify-start">
                  {FOUNDER_SKILLS.map((skill) => (
                    <span
                      key={skill}
                      className="rounded-full px-2.5 py-0.5 text-xs font-medium clay-inset text-muted-foreground"
                    >
                      {skill}
                    </span>
                  ))}
                </div>

                <div className="flex flex-wrap justify-center gap-3 lg:justify-start">
                  {FOUNDER_LINKS.map(({ icon: Icon, label, href }) => (
                    <Button key={label} variant="outline" size="sm" asChild>
                      <a
                        href={href}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <Icon className="mr-1.5 h-4 w-4" aria-hidden />
                        {label}
                        <ExternalLink
                          className="ml-1.5 h-3 w-3 opacity-60"
                          aria-hidden
                        />
                      </a>
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CTA */}
        <section className="px-6 py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 text-center">
            <Zap className="ambient-float h-10 w-10 text-muted-foreground" />
            <h2 className="public-fade-up text-2xl font-semibold sm:text-3xl">
              Ready to try it?
            </h2>
            <p className="public-fade-up public-fade-up-delay-1 max-w-lg text-muted-foreground">
              Create a free account, pick a template, and start writing in
              markdown within minutes.
            </p>
            <div className="public-fade-up public-fade-up-delay-2 flex flex-wrap justify-center gap-3">
              <Suspense fallback={<AboutActions user={null} />}>
                <AboutActionsLoader userPromise={userPromise} />
              </Suspense>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
