"use client";

import { LayoutGrid, List } from "lucide-react";
import { cn } from "@/lib/utils";

export type NotesViewMode = "grid" | "list";

type NoteViewToggleProps = {
  view: NotesViewMode;
  onChange: (view: NotesViewMode) => void;
  className?: string;
};

export function NoteViewToggle({ view, onChange, className }: NoteViewToggleProps) {
  return (
    <div
      className={cn(
        "inline-flex shrink-0 rounded-lg p-0.5 clay-inset",
        className,
      )}
      role="group"
      aria-label="Notes view"
    >
      <button
        type="button"
        onClick={() => onChange("grid")}
        aria-pressed={view === "grid"}
        title="Grid view"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
          view === "grid"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <LayoutGrid className="h-4 w-4" />
        <span className="sr-only">Grid view</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("list")}
        aria-pressed={view === "list"}
        title="List view"
        className={cn(
          "flex h-8 w-8 items-center justify-center rounded-md transition-colors",
          view === "list"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <List className="h-4 w-4" />
        <span className="sr-only">List view</span>
      </button>
    </div>
  );
}
