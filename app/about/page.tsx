import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Zenotion — a Notion-style AI notes app.",
};

export default function AboutPage() {
  return (
    <div className="min-h-svh">
      <header className="flex items-center justify-between px-6 py-4">
        <Link href="/" className="text-lg font-semibold">
          Zenotion
        </Link>
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <Button variant="outline" asChild>
            <Link href="/login">Sign in</Link>
          </Button>
        </div>
      </header>

      <main className="mx-auto max-w-2xl px-6 py-16">
        <h1 className="mb-6 text-3xl font-bold">About Zenotion</h1>
        <div className="space-y-4 text-muted-foreground leading-relaxed">
          <p>
            Zenotion is a class project built to demonstrate a complete,
            production-shaped Next.js application — authentication, database
            access, server actions, API routes, and multiple rendering
            strategies in one cohesive notes app.
          </p>
          <p>
            Write in markdown with a live preview, organize notes into folders
            and tags, autosave as you type, share selected notes publicly, and
            use the AI command palette to summarize, rewrite, outline, and more.
          </p>
          <p>
            Under the hood: Next.js 16 App Router, React 19, Prisma with
            Postgres, Better Auth, and the OpenAI API — all with structured
            error handling and user-scoped data access.
          </p>
        </div>
        <div className="mt-10 flex gap-3">
          <Button asChild>
            <Link href="/signup">Create an account</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/templates">View templates</Link>
          </Button>
        </div>
      </main>
    </div>
  );
}
