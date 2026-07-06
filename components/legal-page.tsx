import type { ReactNode } from "react";
import { SiteHeader } from "@/components/site-header";

export interface LegalSection {
  title: string;
  content: ReactNode;
}

interface LegalPageProps {
  title: string;
  intro: string;
  lastUpdated: string;
  sections: LegalSection[];
}

export function LegalPage({ title, intro, lastUpdated, sections }: LegalPageProps) {
  return (
    <div className="min-h-svh clay-page-bg">
      <SiteHeader />

      <main className="mx-auto max-w-3xl px-6 pb-20 pt-14">
        <header className="public-fade-up mb-10 text-center">
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            {title}
          </h1>
          <p className="mx-auto max-w-2xl leading-relaxed text-muted-foreground">
            {intro}
          </p>
          <p className="mt-3 text-sm text-muted-foreground">
            Last updated: {lastUpdated}
          </p>
        </header>

        <div className="space-y-6">
          {sections.map((section, index) => (
            <section
              key={section.title}
              className="public-fade-up rounded-xl p-6 clay-surface"
            >
              <h2 className="mb-3 text-lg font-semibold">
                {index + 1}. {section.title}
              </h2>
              <div className="space-y-3 text-sm leading-relaxed text-muted-foreground [&_ul]:list-disc [&_ul]:space-y-1.5 [&_ul]:pl-5 [&_strong]:text-foreground">
                {section.content}
              </div>
            </section>
          ))}
        </div>
      </main>
    </div>
  );
}
