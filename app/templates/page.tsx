import type { Metadata } from "next";
import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import {
  ArrowRight,
  BookOpen,
  CalendarDays,
  Code2,
  Target,
} from "lucide-react";
import {
  TemplateCard,
  TemplateCategoryIcon,
} from "@/components/template-card";
import { TemplatesPageHero } from "@/components/templates-page-hero";
import { Button } from "@/components/ui/button";
import { SiteHeader } from "@/components/site-header";
import { getCurrentUser } from "@/lib/session";
import {
  getTemplatesByCategory,
  TEMPLATE_CATEGORIES,
  type TemplateCategoryId,
} from "@/lib/templates";
import { cn } from "@/lib/utils";

/** ISR — templates gallery revalidates every hour. */
export const revalidate = 3600;

export const metadata: Metadata = {
  title: "Templates",
  description:
    "Starter templates for meetings, engineering docs, product planning, and personal notes.",
};

type CategoryVisual = {
  icon: LucideIcon;
  accentClassName: string;
  sectionClassName: string;
  hoverClassName: string;
};

const CATEGORY_VISUALS: Record<TemplateCategoryId, CategoryVisual> = {
  meetings: {
    icon: CalendarDays,
    accentClassName: "bg-sky-500/15 text-sky-700 dark:text-sky-300",
    sectionClassName: "border-sky-500/20",
    hoverClassName: "hover:bg-sky-500/5",
  },
  engineering: {
    icon: Code2,
    accentClassName: "bg-emerald-500/15 text-emerald-700 dark:text-emerald-300",
    sectionClassName: "border-emerald-500/20",
    hoverClassName: "hover:bg-emerald-500/5",
  },
  planning: {
    icon: Target,
    accentClassName: "bg-violet-500/15 text-violet-700 dark:text-violet-300",
    sectionClassName: "border-violet-500/20",
    hoverClassName: "hover:bg-violet-500/5",
  },
  personal: {
    icon: BookOpen,
    accentClassName: "bg-rose-500/15 text-rose-700 dark:text-rose-300",
    sectionClassName: "border-rose-500/20",
    hoverClassName: "hover:bg-rose-500/5",
  },
};

const FADE_DELAYS = [
  "public-fade-up-delay-1",
  "public-fade-up-delay-2",
  "public-fade-up-delay-3",
  "public-fade-up-delay-4",
  "public-fade-up-delay-5",
] as const;

export default async function TemplatesPage() {
  const user = await getCurrentUser();
  const isLoggedIn = user !== null;

  return (
    <div className="min-h-svh clay-page-bg">
      <SiteHeader />

      <main>
        <TemplatesPageHero
          isLoggedIn={isLoggedIn}
          categoryVisuals={CATEGORY_VISUALS}
        />

        {/* Category sections */}
        {TEMPLATE_CATEGORIES.map((category, sectionIndex) => {
          const templates = getTemplatesByCategory(category.id);
          const visual = CATEGORY_VISUALS[category.id];
          const sectionDelay =
            FADE_DELAYS[sectionIndex] ?? "public-fade-up-delay-5";

          return (
            <section
              key={category.id}
              id={category.id}
              className={cn(
                "scroll-mt-24 border-b border-border/60 px-6 py-16 last:border-b-0",
                sectionIndex % 2 === 1 ? "bg-muted/20" : undefined,
              )}
            >
              <div className="mx-auto max-w-6xl">
                <div
                  className={cn(
                    "public-fade-up mb-10 flex flex-col gap-4 rounded-xl border p-6 sm:flex-row sm:items-center sm:gap-6 clay-surface clay-lift-subtle",
                    visual.sectionClassName,
                    sectionDelay,
                  )}
                >
                  <TemplateCategoryIcon
                    icon={visual.icon}
                    accentClassName={visual.accentClassName}
                  />
                  <div className="flex-1 text-center sm:text-left">
                    <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                      {category.label}
                    </p>
                    <h2 className="mb-2 text-2xl font-semibold sm:text-3xl">
                      {category.headline}
                    </h2>
                    <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground sm:text-base">
                      {category.description}
                    </p>
                  </div>
                  <span className="shrink-0 rounded-full px-3 py-1 text-sm font-medium clay-inset text-muted-foreground">
                    {templates.length} templates
                  </span>
                </div>

                <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
                  {templates.map((template, index) => {
                    const delayClass =
                      FADE_DELAYS[index % FADE_DELAYS.length] ??
                      "public-fade-up-delay-5";

                    return (
                      <li
                        key={template.id}
                        className={`public-fade-up ${delayClass}`}
                      >
                        <TemplateCard
                          template={template}
                          categoryLabel={category.label}
                          icon={visual.icon}
                          accentClassName={visual.accentClassName}
                          isLoggedIn={isLoggedIn}
                          className="h-full"
                        />
                      </li>
                    );
                  })}
                </ul>
              </div>
            </section>
          );
        })}

        {/* Bottom CTA */}
        <section className="px-6 py-20">
          <div className="mx-auto flex max-w-3xl flex-col items-center gap-5 rounded-xl p-8 text-center clay-surface clay-lift">
            <h2 className="text-2xl font-semibold sm:text-3xl">
              {isLoggedIn ? "Ready to start writing?" : "Start with a template"}
            </h2>
            <p className="max-w-lg text-muted-foreground">
              {isLoggedIn
                ? "Pick any template above — it opens as a new note in your workspace instantly."
                : "Create a free account, then use any template to spin up a structured note in seconds."}
            </p>
            <div className="flex flex-wrap justify-center gap-3">
              {isLoggedIn ? (
                <Button size="lg" asChild>
                  <Link href="/dashboard">
                    Go to dashboard
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
                <Link href="/about">Learn about Zenotion</Link>
              </Button>
            </div>
          </div>
        </section>
      </main>
    </div>
  );
}
