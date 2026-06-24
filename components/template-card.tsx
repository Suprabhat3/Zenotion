import type { LucideIcon } from "lucide-react";
import { TemplateUseButton } from "@/components/template-use-button";
import type { NoteTemplate } from "@/lib/templates";
import { cn } from "@/lib/utils";

type TemplateCardProps = {
  template: NoteTemplate;
  categoryLabel: string;
  icon: LucideIcon;
  accentClassName: string;
  isLoggedIn: boolean;
  className?: string;
};

function formatPreviewLine(line: string): string {
  return line.length > 52 ? `${line.slice(0, 52)}…` : line;
}

function TemplatePreviewWindow({
  filename,
  preview,
}: {
  filename: string;
  preview: string;
}) {
  const lines = preview
    .trim()
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .slice(0, 6);

  return (
    <div className="template-preview-window overflow-hidden rounded-lg border border-border/50 bg-muted/20">
      <div className="flex items-center gap-2 border-b border-border/50 bg-muted/40 px-3 py-2">
        <span className="h-2 w-2 rounded-full bg-red-400/70" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-amber-400/70" aria-hidden />
        <span className="h-2 w-2 rounded-full bg-emerald-400/70" aria-hidden />
        <span className="ml-1 truncate font-mono text-[10px] text-muted-foreground">
          {filename}
        </span>
      </div>
      <pre className="max-h-32 overflow-hidden p-3 font-mono text-[11px] leading-relaxed">
        <code className="block whitespace-pre-wrap">
          {lines.map((line, index) => {
            const trimmed = line.trim();

            if (trimmed.startsWith("# ")) {
              return (
                <span key={index} className="block text-foreground">
                  {formatPreviewLine(trimmed)}
                  {"\n"}
                </span>
              );
            }

            if (trimmed.startsWith("## ")) {
              return (
                <span
                  key={index}
                  className="block text-muted-foreground/90"
                >
                  {formatPreviewLine(trimmed)}
                  {"\n"}
                </span>
              );
            }

            if (trimmed.startsWith("- [ ]") || trimmed.startsWith("- [x]")) {
              return (
                <span key={index} className="block text-emerald-700/80 dark:text-emerald-400/80">
                  {formatPreviewLine(trimmed)}
                  {"\n"}
                </span>
              );
            }

            if (trimmed.startsWith("- ") || trimmed.startsWith("* ")) {
              return (
                <span key={index} className="block text-muted-foreground">
                  {formatPreviewLine(trimmed)}
                  {"\n"}
                </span>
              );
            }

            if (trimmed.startsWith("**") && trimmed.endsWith("**")) {
              return (
                <span key={index} className="block text-muted-foreground/80">
                  {formatPreviewLine(trimmed)}
                  {"\n"}
                </span>
              );
            }

            return (
              <span key={index} className="block text-muted-foreground/70">
                {formatPreviewLine(trimmed)}
                {"\n"}
              </span>
            );
          })}
        </code>
      </pre>
    </div>
  );
}

export function TemplateCard({
  template,
  categoryLabel,
  icon: Icon,
  accentClassName,
  isLoggedIn,
  className,
}: TemplateCardProps) {
  return (
    <article
      className={cn(
        "group flex h-full flex-col rounded-xl p-5 clay-surface clay-lift",
        className,
      )}
    >
      <div className="mb-4 flex items-start justify-between gap-3">
        <div
          className={cn(
            "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
            accentClassName,
          )}
        >
          <Icon className="h-5 w-5" aria-hidden />
        </div>
        <span className="rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground clay-inset">
          {categoryLabel}
        </span>
      </div>

      <TemplatePreviewWindow
        filename={template.previewFilename}
        preview={template.preview}
      />

      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="mb-1.5 text-base font-semibold leading-snug">
          {template.title}
        </h3>
        <p className="mb-3 flex-1 text-sm leading-relaxed text-muted-foreground">
          {template.description}
        </p>

        {template.tags.length > 0 ? (
          <div className="mb-4 flex flex-wrap gap-1.5">
            {template.tags.map((tag) => (
              <span
                key={tag}
                className="rounded-md px-2 py-0.5 text-[11px] font-medium text-muted-foreground clay-inset"
              >
                {tag}
              </span>
            ))}
          </div>
        ) : null}

        <TemplateUseButton
          templateTitle={template.title}
          templateContent={template.preview}
          isLoggedIn={isLoggedIn}
          className="mt-auto w-full gap-1.5"
        />
      </div>
    </article>
  );
}

export function TemplateCategoryIcon({
  icon: Icon,
  accentClassName,
}: {
  icon: LucideIcon;
  accentClassName: string;
}) {
  return (
    <div
      className={cn(
        "flex h-11 w-11 items-center justify-center rounded-xl",
        accentClassName,
      )}
    >
      <Icon className="h-5 w-5" aria-hidden />
    </div>
  );
}
