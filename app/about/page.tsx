import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/session";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Zenotion — a Notion-style AI notes app.",
};

export default async function AboutPage() {
  const user = await getCurrentUser();

  return (
    <div className="min-h-svh clay-page-bg">
      <SiteHeader />

      <main className="mx-auto max-w-2xl px-6 py-16">
        <div className="public-fade-up rounded-xl p-8 clay-surface clay-lift-subtle clay-lift">
          <h1 className="mb-6 text-3xl font-bold">About Zenotion</h1>
          <div className="space-y-4 leading-relaxed text-muted-foreground">
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
            Bring your own API keys from OpenAI, Gemini, Anthropic, Groq, or
            OpenRouter — stored locally in your browser, never on our servers.
          </p>
          <p>
            Under the hood: Next.js 16 App Router, React 19, Prisma with
            Postgres, Better Auth, and multi-provider AI — all with structured
            error handling and user-scoped data access.
          </p>
        </div>
        <div className="mt-10 flex flex-wrap gap-3">
          {user ? (
            <Button asChild>
              <Link href="/dashboard">Open dashboard</Link>
            </Button>
          ) : (
            <Button asChild>
              <Link href="/signup">Create an account</Link>
            </Button>
          )}
          <Button variant="outline" asChild>
            <Link href="/templates">View templates</Link>
          </Button>
        </div>
        </div>
      </main>
    </div>
  );
}
