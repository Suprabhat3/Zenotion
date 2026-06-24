import Link from "next/link";
import type { LucideIcon } from "lucide-react";
import { ArrowRight, LayoutTemplate } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  TEMPLATE_CATEGORIES,
  getTemplatesByCategory,
  type TemplateCategoryId,
} from "@/lib/templates";
import { cn } from "@/lib/utils";

type CategoryVisual = {
  icon: LucideIcon;
  accentClassName: string;
  hoverClassName: string;
};

type TemplatesPageHeroProps = {
  isLoggedIn: boolean;
  categoryVisuals: Record<TemplateCategoryId, CategoryVisual>;
};

export function TemplatesPageHero({
  isLoggedIn,
  categoryVisuals,
}: TemplatesPageHeroProps) {
  return (
    <section className="public-hero-glow px-6 pb-8 pt-12 sm:pb-10 sm:pt-14">
      <div className="public-fade-up mx-auto max-w-4xl rounded-2xl p-6 sm:p-8 clay-surface clay-lift">
        <div className="mb-8 text-center">
          <span className="landing-badge mb-4 inline-flex">
            <LayoutTemplate className="h-3.5 w-3.5" aria-hidden />
            Starter structures
          </span>
          <h1 className="mb-3 text-3xl font-bold tracking-tight sm:text-4xl">
            Note <span className="landing-highlight">templates</span>
          </h1>
          <p className="mx-auto max-w-xl text-sm leading-relaxed text-muted-foreground sm:text-base">
            Ready-made markdown structures for meetings, code docs, product
            planning, and personal notes — pick one and start writing.
          </p>
        </div>

        <nav
          aria-label="Browse template categories"
          className="mb-8 grid grid-cols-2 gap-3 lg:grid-cols-4"
        >
          {TEMPLATE_CATEGORIES.map((category) => {
            const visual = categoryVisuals[category.id];
            const count = getTemplatesByCategory(category.id).length;
            const Icon = visual.icon;

            return (
              <a
                key={category.id}
                href={`#${category.id}`}
                className={cn(
                  "group flex flex-col gap-3 rounded-xl border border-border/50 p-4 text-left transition-all clay-lift-subtle",
                  "hover:border-border hover:shadow-sm",
                  visual.hoverClassName,
                )}
              >
                <div className="flex items-center justify-between gap-2">
                  <div
                    className={cn(
                      "flex h-9 w-9 items-center justify-center rounded-lg",
                      visual.accentClassName,
                    )}
                  >
                    <Icon className="h-4 w-4" aria-hidden />
                  </div>
                  <span className="rounded-full px-2 py-0.5 text-[10px] font-semibold tabular-nums text-muted-foreground clay-inset">
                    {count}
                  </span>
                </div>
                <div>
                  <p className="text-sm font-semibold leading-snug group-hover:text-foreground">
                    {category.label}
                  </p>
                  <p className="mt-1 line-clamp-2 text-xs leading-relaxed text-muted-foreground">
                    {category.headline}
                  </p>
                </div>
              </a>
            );
          })}
        </nav>

        <div className="flex flex-col items-center gap-3 border-t border-border/60 pt-6 sm:flex-row sm:justify-center">
          {isLoggedIn ? (
            <p className="text-center text-sm text-muted-foreground">
              Select a category above, then use any template to create a note
              instantly.
            </p>
          ) : (
            <>
              <Button size="lg" asChild>
                <Link href="/signup">
                  Sign up free to use templates
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
              <Button size="lg" variant="outline" asChild>
                <Link href="/login">Log in</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </section>
  );
}
