"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import {
  ArrowRightLeft,
  CheckSquare,
  Languages,
  Layers,
  Loader2,
  ListTree,
  MessageSquarePlus,
  PenLine,
  SpellCheck,
  Sparkles,
  SquareStack,
  Wand2,
} from "lucide-react";
import { toast } from "sonner";
import { requestAiCompletion } from "@/lib/ai-client";
import { isAiConfigured } from "@/lib/ai-providers";
import { openAiSettings, useAiConfig } from "@/lib/ai-storage";
import type { EditorSelection } from "@/lib/types";
import {
  INLINE_ACTIONS_NEEDING_INSTRUCTION,
  INLINE_AI_ACTIONS,
  type InlineAiAction,
} from "@/lib/validators";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Textarea } from "@/components/ui/textarea";

const INLINE_ACTION_META: Record<
  InlineAiAction,
  { label: string; hint: string; icon: typeof Wand2 }
> = {
  rewrite: { label: "Improve writing", hint: "Clearer wording, same meaning", icon: Wand2 },
  simplify: { label: "Simplify", hint: "Shorter, easier to read", icon: SquareStack },
  "fix-grammar": { label: "Fix grammar", hint: "Spelling & punctuation", icon: SpellCheck },
  summarize: { label: "Summarize", hint: "Condense to the key points", icon: Layers },
  continue: { label: "Continue writing", hint: "Extend from the selection", icon: PenLine },
  "change-tone": { label: "Change tone…", hint: "Rewrite in a chosen tone", icon: ArrowRightLeft },
  "extract-tasks": { label: "Extract tasks", hint: "Turn into a checklist", icon: CheckSquare },
  "create-outline": { label: "Create outline", hint: "Structured outline", icon: ListTree },
  translate: { label: "Translate…", hint: "Translate to another language", icon: Languages },
  flashcards: { label: "Generate flashcards", hint: "Q/A study pairs", icon: SquareStack },
  "clean-markdown": { label: "Clean to markdown", hint: "Tidy messy text", icon: Sparkles },
  custom: { label: "Custom prompt…", hint: "Tell the AI exactly what to do", icon: MessageSquarePlus },
};

type InlineAiToolbarProps = {
  selection: EditorSelection | null;
  anchorRect: DOMRect | null;
  onReplaceSelection: (text: string) => void;
  onDismiss: () => void;
};

export function InlineAiToolbar({
  selection,
  anchorRect,
  onReplaceSelection,
  onDismiss,
}: InlineAiToolbarProps) {
  const aiConfig = useAiConfig();
  const configured = isAiConfigured(aiConfig);
  const toolbarRef = useRef<HTMLDivElement>(null);

  const [menuOpen, setMenuOpen] = useState(false);
  const [loadingAction, setLoadingAction] = useState<InlineAiAction | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [previewAction, setPreviewAction] = useState<InlineAiAction | null>(null);

  const [instructionOpen, setInstructionOpen] = useState(false);
  const [pendingAction, setPendingAction] = useState<InlineAiAction | null>(null);
  const [instruction, setInstruction] = useState("");

  const runAction = useCallback(
    async (action: InlineAiAction, extraInstruction?: string) => {
      if (!selection?.text.trim()) return;

      if (!configured) {
        openAiSettings();
        toast.error("Add an API key in AI settings first.");
        return;
      }

      setLoadingAction(action);
      setPreviewAction(action);
      setPreviewText("");
      setPreviewOpen(true);
      try {
        const result = await requestAiCompletion(aiConfig, {
          action,
          content: selection.text,
          instruction: extraInstruction,
        });
        setPreviewText(result.result);
      } catch (err) {
        setPreviewOpen(false);
        toast.error(err instanceof Error ? err.message : "AI request failed.");
      } finally {
        setLoadingAction(null);
      }
    },
    [aiConfig, configured, selection],
  );

  function handleSelectAction(action: InlineAiAction) {
    setMenuOpen(false);
    if (INLINE_ACTIONS_NEEDING_INSTRUCTION.includes(action)) {
      setPendingAction(action);
      setInstruction("");
      setInstructionOpen(true);
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
    setInstructionOpen(false);
    void runAction(pendingAction, instruction.trim() || undefined);
  }

  function handleApplyPreview() {
    onReplaceSelection(previewText);
    setPreviewOpen(false);
    onDismiss();
    toast.success("Selection updated.");
  }

  useEffect(() => {
    if (!selection || previewOpen || menuOpen || instructionOpen) return;

    function onPointerDown(e: MouseEvent) {
      const target = e.target as Node;
      if (toolbarRef.current?.contains(target)) return;
      onDismiss();
    }

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") onDismiss();
    }

    document.addEventListener("mousedown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("mousedown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [selection, previewOpen, menuOpen, instructionOpen, onDismiss]);

  const previewDialog = (
    <Dialog
      open={previewOpen}
      onOpenChange={(open) => {
        if (!open && loadingAction !== null) return;
        setPreviewOpen(open);
      }}
    >
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>AI preview</DialogTitle>
          <DialogDescription>
            {loadingAction
              ? "Generating a suggestion for your selection…"
              : "Review the suggestion before applying."}
          </DialogDescription>
        </DialogHeader>
        {loadingAction ? (
          <div
            className="flex min-h-32 flex-col items-center justify-center gap-3 rounded-md border border-dashed bg-muted/30 px-6 py-10"
            aria-live="polite"
            aria-busy="true"
          >
            <Loader2 className="h-7 w-7 animate-spin text-primary" />
            <p className="text-center text-sm text-muted-foreground">
              AI is working on your selection…
            </p>
          </div>
        ) : (
          <Textarea
            value={previewText}
            readOnly
            className="max-h-64 min-h-32 resize-none font-mono text-sm"
          />
        )}
        <DialogFooter className="gap-2 sm:gap-0">
          <Button
            type="button"
            variant="ghost"
            disabled={loadingAction !== null}
            onClick={() => setPreviewOpen(false)}
          >
            Cancel
          </Button>
          <Button type="button" onClick={handleApplyPreview} disabled={loadingAction !== null}>
            Replace selection
          </Button>
          {previewAction && (
            <Button
              type="button"
              variant="outline"
              disabled={loadingAction !== null}
              onClick={() => void runAction(previewAction, instruction.trim() || undefined)}
            >
              {loadingAction === previewAction ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Trying again…
                </>
              ) : (
                "Try again"
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );

  const instructionDialog = (
    <Dialog open={instructionOpen} onOpenChange={setInstructionOpen}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{pendingAction ? INLINE_ACTION_META[pendingAction].label : "AI"}</DialogTitle>
          <DialogDescription>
            {pendingAction === "custom"
              ? "Describe how you want this text reformatted or rewritten."
              : "Add a short instruction for this action."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleInstructionSubmit} className="space-y-3">
          {pendingAction === "custom" ? (
            <Textarea
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder="e.g. Rewrite as a numbered step-by-step guide"
              className="min-h-24 resize-none"
              autoFocus
            />
          ) : (
            <input
              value={instruction}
              onChange={(e) => setInstruction(e.target.value)}
              placeholder={
                pendingAction === "translate"
                  ? "Target language (e.g. Spanish)"
                  : "Target tone (e.g. friendly, formal)"
              }
              autoFocus
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm outline-none focus-visible:ring-1 focus-visible:ring-ring"
            />
          )}
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => setInstructionOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={
                loadingAction !== null ||
                (pendingAction === "custom" && !instruction.trim())
              }
            >
              {loadingAction !== null ? (
                <>
                  <Loader2 className="h-3.5 w-3.5 animate-spin" />
                  Running…
                </>
              ) : (
                "Run"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );

  if (!selection?.text.trim() || !anchorRect) {
    return (
      <>
        {previewDialog}
        {instructionDialog}
      </>
    );
  }

  const top = Math.max(8, anchorRect.top - 44);
  const left = Math.max(8, anchorRect.left + anchorRect.width / 2);

  return (
    <>
      <div
        ref={toolbarRef}
        className="fixed z-50 flex -translate-x-1/2 items-center gap-0.5 rounded-lg border bg-background/95 p-1 shadow-lg backdrop-blur"
        style={{ top, left }}
        role="toolbar"
        aria-label="AI actions for selected text"
      >
        <Sparkles className="mx-1 h-3.5 w-3.5 shrink-0 text-muted-foreground" />

        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs"
          disabled={loadingAction !== null}
          onClick={() => handleSelectAction("rewrite")}
        >
          {loadingAction === "rewrite" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <Wand2 className="h-3.5 w-3.5" />
          )}
          Improve
        </Button>

        <Button
          type="button"
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 px-2 text-xs"
          disabled={loadingAction !== null}
          onClick={() => handleSelectAction("custom")}
        >
          {loadingAction === "custom" ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <MessageSquarePlus className="h-3.5 w-3.5" />
          )}
          Custom prompt
        </Button>

        <DropdownMenu open={menuOpen} onOpenChange={setMenuOpen}>
          <DropdownMenuTrigger asChild>
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-8 px-2 text-xs"
              disabled={loadingAction !== null}
            >
              {loadingAction && loadingAction !== "rewrite" && loadingAction !== "custom" ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                "More"
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-64">
            {INLINE_AI_ACTIONS.filter((a) => a !== "rewrite" && a !== "custom").map(
              (action, index) => {
                const meta = INLINE_ACTION_META[action];
                const Icon = meta.icon;
                return (
                  <div key={action}>
                    {index === 2 && <DropdownMenuSeparator />}
                    <DropdownMenuItem onSelect={() => handleSelectAction(action)}>
                      <Icon className="h-4 w-4 text-muted-foreground" />
                      <div className="flex flex-col">
                        <span>{meta.label}</span>
                        <span className="text-xs text-muted-foreground">{meta.hint}</span>
                      </div>
                    </DropdownMenuItem>
                  </div>
                );
              },
            )}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {previewDialog}
      {instructionDialog}
    </>
  );
}
