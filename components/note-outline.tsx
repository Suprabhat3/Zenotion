"use client";

import { useMemo } from "react";
import { ListTree } from "lucide-react";
import { cn } from "@/lib/utils";
import type { OutlineHeading } from "@/lib/note-outline";

type NoteOutlineProps = {
  headings: OutlineHeading[];
  className?: string;
};

/**
 * Scroll the rendered note body to the Nth heading. Works in both editor modes
 * because the visible content lives under `.note-editor-body` in each, and the
 * outline is parsed in the same document order the DOM renders.
 */
function scrollToHeading(index: number): void {
  const body = document.querySelector<HTMLElement>(".note-editor-body");
  if (!body) return;
  const nodes = body.querySelectorAll<HTMLElement>("h1, h2, h3, h4, h5, h6");
  const target = nodes[index];
  if (!target) return;
  target.scrollIntoView({ behavior: "smooth", block: "start" });
}

export function NoteOutline({ headings, className }: NoteOutlineProps) {
  // Indent relative to the shallowest heading present so a note that starts at
  // H2 doesn't render with a wasted first indent level.
  const minLevel = useMemo(
    () => headings.reduce((min, h) => Math.min(min, h.level), 6),
    [headings],
  );

  if (headings.length === 0) return null;

  return (
    <nav aria-label="Note outline" className={cn(className)}>
      <div className="flex items-center gap-2 px-4 py-3 pr-10 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
        <ListTree className="h-3.5 w-3.5" />
        Outline
      </div>
      <ul className="px-2 pb-4">
        {headings.map((heading) => (
          <li key={heading.index}>
            <button
              type="button"
              onClick={() => scrollToHeading(heading.index)}
              title={heading.text}
              className="block w-full truncate rounded-md px-2 py-1.5 text-left text-sm text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
              style={{
                paddingLeft: `${(heading.level - minLevel) * 0.75 + 0.5}rem`,
              }}
            >
              {heading.text}
            </button>
          </li>
        ))}
      </ul>
    </nav>
  );
}
