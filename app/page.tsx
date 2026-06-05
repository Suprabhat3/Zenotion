import Link from "next/link";
import {
  BookOpen,
  FolderTree,
  Globe,
  Sparkles,
  Zap,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export default function HomePage() {
  return (
    <div className="min-h-svh">
      <header className="flex items-center justify-between px-6 py-4">
        <span className="text-lg font-semibold">Zenotion</span>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="ghost" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild>
            <Link href="/signup">Get started</Link>
          </Button>
        </div>
      </header>

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
            <Button size="lg" asChild>
              <Link href="/signup">Start writing free</Link>
            </Button>
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
              className="rounded-lg p-5 text-left clay-surface"
            >
              <Icon className="mb-3 h-8 w-8 text-muted-foreground" />
              <h3 className="mb-1 font-semibold">{title}</h3>
              <p className="text-sm text-muted-foreground">{desc}</p>
            </div>
          ))}
        </section>

        <section className="border-t bg-muted/30 px-6 py-16">
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

      <footer className="border-t px-6 py-8 text-center text-sm text-muted-foreground">
        © {new Date().getFullYear()} Zenotion
      </footer>
    </div>
  );
}
