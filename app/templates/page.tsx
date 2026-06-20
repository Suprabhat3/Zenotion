import type { Metadata } from "next";
import { FileText } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { TemplateUseButton } from "@/components/template-use-button";
import { getCurrentUser } from "@/lib/session";

/** ISR — templates gallery revalidates every hour. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Templates",
  description: "Starter templates for your Zenotion notes.",
};

type TemplateCategory = "General" | "Developer";

type Template = {
  id: string;
  title: string;
  description: string;
  category: TemplateCategory;
  preview: string;
};

const TEMPLATES: readonly Template[] = [
  {
    id: "meeting-notes",
    title: "Meeting notes",
    description: "Capture attendees, agenda, decisions, and action items.",
    category: "General",
    preview:
      "# Meeting notes\n\n**Date:**\n**Attendees:**\n\n## Agenda\n- \n\n## Notes\n\n## Action items\n- [ ] ",
  },
  {
    id: "weekly-review",
    title: "Weekly review",
    description: "Reflect on wins, blockers, and priorities for next week.",
    category: "General",
    preview:
      "# Weekly review\n\n## Wins\n- \n\n## Challenges\n- \n\n## Next week\n- [ ] ",
  },
  {
    id: "project-brief",
    title: "Project brief",
    description: "Define goals, scope, stakeholders, and success metrics.",
    category: "General",
    preview:
      "# Project brief\n\n## Goal\n\n## Scope\n\n## Stakeholders\n\n## Success metrics\n",
  },
  {
    id: "reading-list",
    title: "Reading list",
    description: "Track articles and books with key takeaways.",
    category: "General",
    preview:
      "# Reading list\n\n## To read\n- [ ] \n\n## Finished\n- **Title** — takeaway\n",
  },
  {
    id: "daily-journal",
    title: "Daily journal",
    description: "Morning intentions and evening reflections.",
    category: "General",
    preview:
      "# Daily journal\n\n## Morning\nWhat matters today?\n\n## Evening\nWhat went well?\n",
  },
  {
    id: "research",
    title: "Research doc",
    description: "Hypothesis, sources, findings, and open questions.",
    category: "General",
    preview:
      "# Research\n\n## Hypothesis\n\n## Sources\n1. \n\n## Findings\n\n## Open questions\n",
  },
  {
    id: "pull-request",
    title: "Pull request",
    description: "Summary, changes, testing, and a reviewer checklist.",
    category: "Developer",
    preview:
      "# PR: <title>\n\n## Summary\nWhat does this change and why?\n\n## Changes\n- \n\n## Testing\n- [ ] Unit tests\n- [ ] Manual QA\n\n## Checklist\n- [ ] No breaking changes\n- [ ] Docs updated\n\n## Related\nCloses #",
  },
  {
    id: "rfc-design-doc",
    title: "RFC / Design doc",
    description: "Propose a technical design with context and alternatives.",
    category: "Developer",
    preview:
      "# RFC: <title>\n\n**Status:** Draft\n**Author:**\n\n## Context\n\n## Goals\n- \n\n## Non-goals\n- \n\n## Proposed design\n\n```mermaid\nflowchart LR\n  A[Client] --> B[API] --> C[(DB)]\n```\n\n## Alternatives considered\n\n## Open questions\n",
  },
  {
    id: "postmortem",
    title: "Incident postmortem",
    description: "Blameless writeup: impact, timeline, root cause, actions.",
    category: "Developer",
    preview:
      "# Postmortem: <incident>\n\n**Date:**\n**Severity:**\n**Duration:**\n\n## Impact\n\n## Timeline\n- `00:00` — \n\n## Root cause\n\n## Resolution\n\n## Action items\n- [ ] \n\n## Lessons learned\n",
  },
  {
    id: "adr",
    title: "Architecture decision",
    description: "Record one architectural decision and its consequences.",
    category: "Developer",
    preview:
      "# ADR <NNN>: <decision>\n\n**Status:** Proposed\n**Date:**\n\n## Context\n\n## Decision\n\n## Consequences\n\n### Positive\n- \n\n### Negative\n- \n",
  },
  {
    id: "standup",
    title: "Daily standup",
    description: "Yesterday, today, and blockers — fast async updates.",
    category: "Developer",
    preview:
      "# Standup — <date>\n\n## Yesterday\n- \n\n## Today\n- \n\n## Blockers\n- None\n",
  },
  {
    id: "bug-report",
    title: "Bug report",
    description: "Steps to reproduce, expected vs. actual, environment.",
    category: "Developer",
    preview:
      "# Bug: <short title>\n\n## Steps to reproduce\n1. \n2. \n\n## Expected\n\n## Actual\n\n## Environment\n- OS:\n- Browser/Version:\n\n## Notes\n```\n<stack trace or logs>\n```\n",
  },
] as const;

const CATEGORY_ORDER: readonly TemplateCategory[] = ["General", "Developer"];

const DELAY_CLASSES = [
  "public-fade-up-delay-1",
  "public-fade-up-delay-2",
  "public-fade-up-delay-3",
  "public-fade-up-delay-4",
  "public-fade-up-delay-5",
] as const;

export default async function TemplatesPage() {
  const user = await getCurrentUser();
  const isLoggedIn = user !== null;
  const generatedAt = new Intl.DateTimeFormat("en", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date());

  return (
    <div className="min-h-svh clay-page-bg">
      <SiteHeader />

      <main className="mx-auto max-w-5xl px-6 py-12">
        <div className="public-fade-up mb-8">
          <h1 className="mb-2 text-3xl font-bold">Note templates</h1>
          <p className="text-muted-foreground">
            Starter structures you can copy into a new note after signing up.
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            Gallery regenerated at {generatedAt} (revalidates hourly)
          </p>
        </div>

        {CATEGORY_ORDER.map((category) => {
          const items = TEMPLATES.filter((t) => t.category === category);
          if (items.length === 0) return null;

          return (
            <section key={category} className="mb-10 last:mb-0">
              <h2 className="mb-4 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                {category === "Developer" ? "For developers" : "General"}
              </h2>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((template, index) => {
                  const delayClass =
                    DELAY_CLASSES[index] ?? "public-fade-up-delay-5";

                  return (
                    <li
                      key={template.id}
                      className={`group flex flex-col rounded-xl p-5 clay-surface clay-lift public-fade-up ${delayClass}`}
                    >
                      <FileText className="icon-bounce-hover mb-3 h-8 w-8 text-muted-foreground" />
                      <h3 className="mb-1 font-semibold">{template.title}</h3>
                      <p className="mb-4 flex-1 text-sm text-muted-foreground">
                        {template.description}
                      </p>
                      <pre className="mb-4 max-h-24 overflow-hidden rounded-md p-2 text-xs text-muted-foreground clay-inset">
                        {template.preview.slice(0, 120)}…
                      </pre>
                      <TemplateUseButton
                        templateTitle={template.title}
                        templateContent={template.preview}
                        isLoggedIn={isLoggedIn}
                      />
                    </li>
                  );
                })}
              </ul>
            </section>
          );
        })}
      </main>
    </div>
  );
}
