import Link from "next/link";
import type { ComponentType, SVGProps } from "react";
import {
  BookOpen,
  FolderTree,
  Globe,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/session";

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

export default async function HomePage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-svh clay-page-bg">
      <SiteHeader />

      <main>
        <section className="mx-auto max-w-4xl px-6 py-20 text-center">
          <h1 className="mb-4 text-4xl font-bold tracking-tight sm:text-5xl">
            Notes that think with you
          </h1>
          <p className="mx-auto mb-8 max-w-2xl text-lg text-muted-foreground">
            Zenotion is a Notion-style workspace for markdown notes — organize
            with folders and tags, preview as you write, share publicly, and
            supercharge drafts with AI.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            {user ? (
              <Button size="lg" asChild>
                <Link href="/dashboard">Go to dashboard</Link>
              </Button>
            ) : (
              <Button size="lg" asChild>
                <Link href="/signup">Start writing free</Link>
              </Button>
            )}
            <Button size="lg" variant="outline" asChild>
              <Link href="/templates">Browse templates</Link>
            </Button>
          </div>
        </section>

        <section className="mx-auto grid max-w-5xl gap-6 px-6 pb-20 sm:grid-cols-2 lg:grid-cols-4">
          {[
            {
              icon: BookOpen,
              title: "Markdown editor",
              desc: "Split-pane editing with live, sanitized preview.",
            },
            {
              icon: FolderTree,
              title: "Folders & tags",
              desc: "Keep research, ideas, and projects organized.",
            },
            {
              icon: Globe,
              title: "Public sharing",
              desc: "Publish notes with a link when you're ready.",
            },
            {
              icon: Sparkles,
              title: "AI palette",
              desc: "Summarize, rewrite, outline, and more — in one keystroke.",
            },
          ].map(({ icon: Icon, title, desc }) => (
            <div
              key={title}
              className="rounded-xl p-5 text-left clay-surface"
            >
              <Icon className="mb-3 h-8 w-8 text-muted-foreground" />
              <h3 className="mb-1 font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </section>

        <section className="border-t border-border/60 bg-muted/40 px-6 py-16">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-4 text-center">
            <Zap className="h-10 w-10 text-muted-foreground" />
            <h2 className="text-2xl font-semibold">Built for clarity</h2>
            <p className="text-muted-foreground">
              Autosave, dark mode, and a calm interface — so you can focus on
              the words, not the tool.
            </p>
            <Button asChild>
              <Link href="/about">Learn more</Link>
            </Button>
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
                className="rounded-full p-2 text-muted-foreground transition-colors hover:text-foreground clay-surface"
              >
                <Icon className="h-5 w-5" />
              </a>
            ))}
          </div>
          <p>Built by <a href="https://github.com/suprabhat3" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">Suprabhat </a> © {new Date().getFullYear()} Zenotion</p>
        </div>
      </footer>
    </div>
  );
}
