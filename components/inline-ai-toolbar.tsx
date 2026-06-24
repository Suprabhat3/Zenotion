"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { Loader2, Sparkles, Wand2 } from "lucide-react";
import { toast } from "sonner";
import { requestAiCompletion } from "@/lib/ai-client";
import { isAiConfigured } from "@/lib/ai-providers";
import { openAiSettings, useAiConfig } from "@/lib/ai-storage";
import type { EditorSelection } from "@/lib/types";
import type { InlineAiAction } from "@/lib/validators";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";

const INLINE_ACTIONS: {
  action: InlineAiAction;
  label: string;
  icon: typeof Wand2;
}[] = [
  { action: "rewrite", label: "Improve", icon: Wand2 },
  { action: "simplify", label: "Shorten", icon: Sparkles },
  { action: "fix-grammar", label: "Fix grammar", icon: Sparkles },
];

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

  const [loadingAction, setLoadingAction] = useState<InlineAiAction | null>(null);
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewText, setPreviewText] = useState("");
  const [previewAction, setPreviewAction] = useState<InlineAiAction | null>(null);

  const runAction = useCallback(
    async (action: InlineAiAction) => {
      if (!selection?.text.trim()) return;

      if (!configured) {
        openAiSettings();
        toast.error("Add an API key in AI settings first.");
        return;
      }

      setLoadingAction(action);
      try {
        const result = await requestAiCompletion(aiConfig, {
          action,
          content: selection.text,
        });
        setPreviewText(result.result);
        setPreviewAction(action);
        setPreviewOpen(true);
      } catch (err) {
        toast.error(err instanceof Error ? err.message : "AI request failed.");
      } finally {
        setLoadingAction(null);
      }
    },
    [aiConfig, configured, selection],
  );

  function handleApplyPreview() {
    onReplaceSelection(previewText);
    setPreviewOpen(false);
    onDismiss();
    toast.success("Selection updated.");
  }

  useEffect(() => {
    if (!selection || previewOpen) return;

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
  }, [selection, previewOpen, onDismiss]);

  if (!selection?.text.trim() || !anchorRect) {
    return (
      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>AI preview</DialogTitle>
            <DialogDescription>Review the suggestion before applying.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={previewText}
            readOnly
            className="max-h-64 min-h-32 resize-none font-mono text-sm"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => setPreviewOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleApplyPreview}>
              Replace selection
            </Button>
            {previewAction && (
              <Button
                type="button"
                variant="outline"
                disabled={loadingAction !== null}
                onClick={() => void runAction(previewAction)}
              >
                Try again
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  }

  const top = Math.max(8, anchorRect.top - 48);
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
        <Sparkles className="mx-1 h-3.5 w-3.5 text-muted-foreground" />
        {INLINE_ACTIONS.map(({ action, label, icon: Icon }) => (
          <Button
            key={action}
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 gap-1.5 px-2 text-xs"
            disabled={loadingAction !== null}
            onClick={() => void runAction(action)}
          >
            {loadingAction === action ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <Icon className="h-3.5 w-3.5" />
            )}
            {label}
          </Button>
        ))}
      </div>

      <Dialog open={previewOpen} onOpenChange={setPreviewOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>AI preview</DialogTitle>
            <DialogDescription>Review the suggestion before applying.</DialogDescription>
          </DialogHeader>
          <Textarea
            value={previewText}
            readOnly
            className="max-h-64 min-h-32 resize-none font-mono text-sm"
          />
          <DialogFooter className="gap-2 sm:gap-0">
            <Button type="button" variant="ghost" onClick={() => setPreviewOpen(false)}>
              Cancel
            </Button>
            <Button type="button" onClick={handleApplyPreview}>
              Replace selection
            </Button>
            {previewAction && (
              <Button
                type="button"
                variant="outline"
                disabled={loadingAction !== null}
                onClick={() => void runAction(previewAction)}
              >
                Try again
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
