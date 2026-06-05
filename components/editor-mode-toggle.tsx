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
    <div className="inline-flex rounded-lg border bg-muted/50 p-0.5">
      <button
        type="button"
        onClick={() => onChange("rich")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          mode === "rich"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <PenLine className="h-3.5 w-3.5" />
        Document
      </button>
      <button
        type="button"
        onClick={() => onChange("markdown")}
        className={cn(
          "flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
          mode === "markdown"
            ? "bg-background text-foreground shadow-sm"
            : "text-muted-foreground hover:text-foreground",
        )}
      >
        <FileText className="h-3.5 w-3.5" />
        Markdown
      </button>
    </div>
  );
}
