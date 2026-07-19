"use client";

import { FileText, PenLine } from "lucide-react";
import { cn } from "@/lib/utils";

export type EditorMode = "rich" | "markdown";

type EditorModeToggleProps = {
  mode: EditorMode;
  onChange: (mode: EditorMode) => void;
};

export function EditorModeToggle({ mode, onChange }: EditorModeToggleProps) {
  return (
    <div
      className="inline-flex shrink-0 rounded-lg p-0.5 clay-inset"
      role="group"
      aria-label="Editor mode"
    >
      <button
        type="button"
        onClick={() => onChange("rich")}
        aria-pressed={mode === "rich"}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3",
          mode === "rich"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        title="Document"
        aria-label="Document mode"
      >
        <PenLine className="h-3.5 w-3.5" />
        <span className="max-sm:sr-only">Document</span>
      </button>
      <button
        type="button"
        onClick={() => onChange("markdown")}
        aria-pressed={mode === "markdown"}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-2.5 py-1.5 text-sm font-medium transition-colors sm:px-3",
          mode === "markdown"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
        title="Markdown"
        aria-label="Markdown mode"
      >
        <FileText className="h-3.5 w-3.5" />
        <span className="max-sm:sr-only">Markdown</span>
      </button>
    </div>
  );
}
