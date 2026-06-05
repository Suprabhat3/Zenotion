"use client";

import { useCallback, useEffect, useState } from "react";
import { Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { AI_ACTIONS, type AiAction } from "@/lib/validators";
import type { ApiResponse } from "@/lib/api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

const ACTION_LABELS: Record<AiAction, string> = {
  summarize: "Summarize",
  rewrite: "Rewrite",
  continue: "Continue writing",
  "fix-grammar": "Fix grammar",
  "change-tone": "Change tone",
  "extract-tasks": "Extract tasks",
  "generate-title": "Generate title",
  "create-outline": "Create outline",
  simplify: "Simplify",
  translate: "Translate",
  flashcards: "Generate flashcards",
  "clean-markdown": "Clean to markdown",
};

const NEEDS_INSTRUCTION: AiAction[] = ["change-tone", "translate"];

type AiResult = { result: string; action: AiAction };

type AiCommandPaletteProps = {
  content: string;
  onApply: (result: string, action: AiAction) => void;
};

export function AiCommandPalette({ content, onApply }: AiCommandPaletteProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [instruction, setInstruction] = useState("");
  const [pendingAction, setPendingAction] = useState<AiAction | null>(null);

  const runAction = useCallback(
    async (action: AiAction, extraInstruction?: string) => {
      if (!content.trim()) {
        toast.error("Add some content before using AI.");
        return;
      }

      setLoading(true);
      try {
        const res = await fetch("/api/ai", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            action,
            content,
            instruction: extraInstruction,
          }),
        });

        const json = (await res.json()) as ApiResponse<AiResult>;

        if (!json.success) {
          toast.error(json.error.message);
          return;
        }

        onApply(json.data.result, action);
        setOpen(false);
        setQuery("");
        setInstruction("");
        setPendingAction(null);
        toast.success("AI suggestion applied.");
      } catch {
        toast.error("AI request failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [content, onApply],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
    }
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  const filtered = AI_ACTIONS.filter((action) =>
    ACTION_LABELS[action].toLowerCase().includes(query.toLowerCase()),
  );

  function handleSelect(action: AiAction) {
    if (NEEDS_INSTRUCTION.includes(action)) {
      setPendingAction(action);
      return;
    }
    void runAction(action);
  }

  function handleInstructionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingAction) return;
    void runAction(pendingAction, instruction || undefined);
  }

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => setOpen(true)}
      >
        <Sparkles className="h-4 w-4" />
        AI
        <kbd className="hidden rounded border bg-muted px-1.5 text-[10px] sm:inline">
          ⌘K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>AI commands</DialogTitle>
            <DialogDescription>
              Choose an action to run on your note content.
            </DialogDescription>
          </DialogHeader>

          {pendingAction ? (
            <form onSubmit={handleInstructionSubmit} className="space-y-3">
              <p className="text-sm font-medium">{ACTION_LABELS[pendingAction]}</p>
              <Input
                value={instruction}
                onChange={(e) => setInstruction(e.target.value)}
                placeholder={
                  pendingAction === "translate"
                    ? "Target language (e.g. Spanish)"
                    : "Target tone (e.g. friendly)"
                }
                autoFocus
              />
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Run
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setPendingAction(null)}
                >
                  Back
                </Button>
              </div>
            </form>
          ) : (
            <div className="space-y-3">
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search commands…"
                autoFocus
              />
              <ul className="max-h-64 space-y-0.5 overflow-y-auto">
                {filtered.map((action) => (
                  <li key={action}>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleSelect(action)}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent disabled:opacity-50"
                    >
                      <Sparkles className="h-4 w-4 text-muted-foreground" />
                      {ACTION_LABELS[action]}
                    </button>
                  </li>
                ))}
              </ul>
              {loading && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Working…
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
