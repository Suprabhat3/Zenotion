import type { Metadata } from "next";
import Link from "next/link";
import { FileText } from "lucide-react";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/session";

/** ISR — templates gallery revalidates every hour. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Templates",
  description: "Starter templates for your Zenotion notes.",
};

const TEMPLATES = [
  {
    id: "meeting-notes",
    title: "Meeting notes",
    description: "Capture attendees, agenda, decisions, and action items.",
    preview: "# Meeting notes\n\n**Date:**\n**Attendees:**\n\n## Agenda\n- \n\n## Notes\n\n## Action items\n- [ ] ",
  },
  {
    id: "weekly-review",
    title: "Weekly review",
    description: "Reflect on wins, blockers, and priorities for next week.",
    preview: "# Weekly review\n\n## Wins\n- \n\n## Challenges\n- \n\n## Next week\n- [ ] ",
  },
  {
    id: "project-brief",
    title: "Project brief",
    description: "Define goals, scope, stakeholders, and success metrics.",
    preview: "# Project brief\n\n## Goal\n\n## Scope\n\n## Stakeholders\n\n## Success metrics\n",
  },
  {
    id: "reading-list",
    title: "Reading list",
    description: "Track articles and books with key takeaways.",
    preview: "# Reading list\n\n## To read\n- [ ] \n\n## Finished\n- **Title** — takeaway\n",
  },
  {
    id: "daily-journal",
    title: "Daily journal",
    description: "Morning intentions and evening reflections.",
    preview: "# Daily journal\n\n## Morning\nWhat matters today?\n\n## Evening\nWhat went well?\n",
  },
  {
    id: "research",
    title: "Research doc",
    description: "Hypothesis, sources, findings, and open questions.",
    preview: "# Research\n\n## Hypothesis\n\n## Sources\n1. \n\n## Findings\n\n## Open questions\n",
  },
] as const;

export default async function TemplatesPage() {
  const user = await getCurrentUser();
  const generatedAt = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  return (
    <div className="min-h-svh">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="mb-8">
          <h1 className="mb-2 text-3xl font-bold">Note templates</h1>
          <p className="text-muted-foreground">
            Starter structures you can copy into a new note after signing up.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Gallery regenerated at {generatedAt} (revalidates hourly)
          </p>
        </div>

        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {TEMPLATES.map((template) => (
            <li
              key={template.id}
              className="flex flex-col rounded-lg p-5 clay-surface"
            >
              <FileText className="mb-3 h-8 w-8 text-muted-foreground" />
              <h2 className="mb-1 font-semibold">{template.title}</h2>
              <p className="mb-4 flex-1 text-sm text-muted-foreground">
                {template.description}
              </p>
              <pre className="mb-4 max-h-24 overflow-hidden rounded bg-muted p-2 text-xs text-muted-foreground">
                {template.preview.slice(0, 120)}…
              </pre>
              <Button variant="outline" size="sm" asChild>
                <Link href={user ? "/dashboard" : "/signup"}>
                  {user ? "Open in dashboard" : "Use after signup"}
                </Link>
              </Button>
            </li>
          ))}
        </ul>
      </main>
    </div>
  );
}
