"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { Loader2, Settings2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import {
  getActiveCredentials,
  getProviderLabel,
  isAiConfigured,
} from "@/lib/ai-providers";
import { openAiSettings, useAiConfig } from "@/lib/ai-storage";
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
import { Textarea } from "@/components/ui/textarea";

export const AI_PALETTE_OPEN_EVENT = "zenotion-ai-palette-open";

/** Opens the AI command palette from anywhere (slash menu, shortcuts…). */
export function openAiPalette(): void {
  window.dispatchEvent(new Event(AI_PALETTE_OPEN_EVENT));
}

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
  custom: "Custom prompt",
};

const ACTION_HINTS: Partial<Record<AiAction, string>> = {
  summarize: "Short summary of your note",
  rewrite: "Clearer wording, same meaning",
  continue: "Pick up where you left off",
  "generate-title": "Updates the note title",
  custom: "Describe exactly what you want",
};

const NEEDS_INSTRUCTION: AiAction[] = ["change-tone", "translate", "custom"];

type AiResult = { result: string; action: AiAction };

type AiCommandPaletteProps = {
  content: string;
  onApply: (result: string, action: AiAction) => void;
};

type PaletteView = "commands" | "instruction" | "preview";

export function AiCommandPalette({ content, onApply }: AiCommandPaletteProps) {
  const aiConfig = useAiConfig();
  const configured = isAiConfigured(aiConfig);
  const activeCredentials = getActiveCredentials(aiConfig);

  const [open, setOpen] = useState(false);
  const [view, setView] = useState<PaletteView>("commands");
  const [loading, setLoading] = useState(false);
  const [query, setQuery] = useState("");
  const [instruction, setInstruction] = useState("");
  const [pendingAction, setPendingAction] = useState<AiAction | null>(null);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const [preview, setPreview] = useState<AiResult | null>(null);

  const filtered = useMemo(
    () =>
      AI_ACTIONS.filter((action) =>
        ACTION_LABELS[action].toLowerCase().includes(query.toLowerCase()),
      ),
    [query],
  );

  const resetPalette = useCallback(() => {
    setView("commands");
    setQuery("");
    setInstruction("");
    setPendingAction(null);
    setHighlightIndex(0);
    setPreview(null);
    setLoading(false);
  }, []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      if (next && !configured) {
        openAiSettings();
        return;
      }

      setOpen(next);
      if (next) {
        resetPalette();
      }
    },
    [configured, resetPalette],
  );

  const runAction = useCallback(
    async (action: AiAction, extraInstruction?: string) => {
      if (!content.trim()) {
        toast.error("Add some content before using AI.");
        return;
      }

      const credentials = getActiveCredentials(aiConfig);
      if (!credentials) {
        openAiSettings();
        toast.error("Add an API key in AI settings first.");
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
            provider: aiConfig.activeProvider,
            model: credentials.model,
            apiKey: credentials.apiKey,
          }),
        });

        const json = (await res.json()) as ApiResponse<AiResult>;

        if (!json.success) {
          toast.error(json.error.message);
          return;
        }

        setPreview(json.data);
        setView("preview");
      } catch {
        toast.error("AI request failed. Please try again.");
      } finally {
        setLoading(false);
      }
    },
    [aiConfig, content],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        handleOpenChange(!open);
      }
    }
    function onOpenEvent() {
      handleOpenChange(true);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(AI_PALETTE_OPEN_EVENT, onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(AI_PALETTE_OPEN_EVENT, onOpenEvent);
    };
  }, [handleOpenChange, open]);

  function handleSelect(action: AiAction) {
    if (NEEDS_INSTRUCTION.includes(action)) {
      setPendingAction(action);
      setView("instruction");
      return;
    }
    void runAction(action);
  }

  function handleInstructionSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!pendingAction) return;
    if (pendingAction === "custom" && !instruction.trim()) {
      toast.error("Describe what you'd like the AI to do.");
      return;
    }
    void runAction(pendingAction, instruction || undefined);
  }

  function handleApplyPreview() {
    if (!preview) return;
    onApply(preview.result, preview.action);
    setOpen(false);
    toast.success("AI suggestion applied.");
  }

  function handleCommandKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (filtered.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((index) => (index + 1) % filtered.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((index) => (index - 1 + filtered.length) % filtered.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      handleSelect(filtered[highlightIndex]);
    }
  }

  const providerLabel = configured
    ? `${getProviderLabel(aiConfig.activeProvider)} · ${activeCredentials?.model}`
    : "No provider configured";

  return (
    <>
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="gap-2"
        onClick={() => handleOpenChange(true)}
      >
        <Sparkles className="h-4 w-4" />
        AI
        <kbd className="hidden rounded border bg-muted px-1.5 text-[10px] sm:inline">
          ⌘K
        </kbd>
      </Button>

      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>AI commands</DialogTitle>
            <DialogDescription className="space-y-1">
              <span className="block">Choose an action to run on your note content.</span>
              <span className="block text-xs">{providerLabel}</span>
            </DialogDescription>
          </DialogHeader>

          {view === "instruction" && pendingAction ? (
            <form onSubmit={handleInstructionSubmit} className="space-y-3">
              <p className="text-sm font-medium">{ACTION_LABELS[pendingAction]}</p>
              {pendingAction === "custom" ? (
                <Textarea
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder="e.g. Turn this into a bullet list grouped by topic"
                  className="min-h-24 resize-none"
                  autoFocus
                />
              ) : (
                <Input
                  value={instruction}
                  onChange={(e) => setInstruction(e.target.value)}
                  placeholder={
                    pendingAction === "translate"
                      ? "Target language (e.g. Spanish)"
                      : "Target tone (e.g. friendly, formal)"
                  }
                  autoFocus
                />
              )}
              <div className="flex gap-2">
                <Button
                  type="submit"
                  disabled={loading || (pendingAction === "custom" && !instruction.trim())}
                >
                  {loading && <Loader2 className="h-4 w-4 animate-spin" />}
                  Run
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => {
                    setPendingAction(null);
                    setView("commands");
                  }}
                >
                  Back
                </Button>
              </div>
            </form>
          ) : view === "preview" && preview ? (
            <div className="space-y-3">
              <p className="text-sm font-medium">
                Preview · {ACTION_LABELS[preview.action]}
              </p>
              <Textarea
                value={preview.result}
                readOnly
                className="max-h-64 min-h-32 resize-none font-mono text-sm"
              />
              <div className="flex flex-wrap gap-2">
                <Button type="button" onClick={handleApplyPreview}>
                  Apply to note
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setPreview(null);
                    setView("commands");
                  }}
                >
                  Discard
                </Button>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => void runAction(preview.action, instruction || undefined)}
                  disabled={loading}
                >
                  {loading ? "Retrying…" : "Try again"}
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-2">
                <Input
                  value={query}
                  onChange={(e) => {
                    setQuery(e.target.value);
                    setHighlightIndex(0);
                  }}
                  onKeyDown={handleCommandKeyDown}
                  placeholder="Search commands…"
                  autoFocus
                  disabled={loading}
                />
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  className="shrink-0"
                  onClick={openAiSettings}
                  title="AI settings"
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </div>

              <ul className="max-h-64 space-y-0.5 overflow-y-auto">
                {filtered.map((action, index) => (
                  <li key={action}>
                    <button
                      type="button"
                      disabled={loading}
                      onClick={() => handleSelect(action)}
                      className={`flex w-full flex-col items-start gap-0.5 rounded-md px-3 py-2 text-left text-sm transition-colors hover:bg-accent disabled:opacity-50 ${
                        index === highlightIndex ? "bg-accent" : ""
                      }`}
                    >
                      <span className="flex items-center gap-2">
                        <Sparkles className="h-4 w-4 text-muted-foreground" />
                        {ACTION_LABELS[action]}
                      </span>
                      {ACTION_HINTS[action] && (
                        <span className="pl-6 text-xs text-muted-foreground">
                          {ACTION_HINTS[action]}
                        </span>
                      )}
                    </button>
                  </li>
                ))}
                {filtered.length === 0 && (
                  <li className="px-3 py-6 text-center text-sm text-muted-foreground">
                    No commands match your search.
                  </li>
                )}
              </ul>

              {loading && (
                <p className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Working with {getProviderLabel(aiConfig.activeProvider)}…
                </p>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
}
