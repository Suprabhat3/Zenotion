"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Check, Copy, Globe, Link2, Lock, Share2 } from "lucide-react";
import { toast } from "sonner";
import { toggleNotePublic } from "@/app/(app)/notes/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";

type ShareDialogProps = {
  noteId: string;
  initialIsPublic: boolean;
  initialShareSlug: string | null;
};

export function ShareDialog({
  noteId,
  initialIsPublic,
  initialShareSlug,
}: ShareDialogProps) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [isPublic, setIsPublic] = useState(initialIsPublic);
  const [shareSlug, setShareSlug] = useState(initialShareSlug);
  const [isToggling, setIsToggling] = useState(false);
  const [copied, setCopied] = useState(false);

  const shareUrl =
    shareSlug && typeof window !== "undefined"
      ? `${window.location.origin}/share/${shareSlug}`
      : shareSlug
        ? `/share/${shareSlug}`
        : null;

  async function handleToggle(next: boolean) {
    setIsToggling(true);
    const formData = new FormData();
    formData.set("noteId", noteId);
    formData.set("isPublic", String(next));
    try {
      const updated = await toggleNotePublic(formData);
      setIsPublic(updated.isPublic);
      setShareSlug(updated.shareSlug);
      toast.success(next ? "Note is now public." : "Note is now private.");
      router.refresh();
    } catch {
      toast.error("Could not update sharing.");
    } finally {
      setIsToggling(false);
    }
  }

  async function handleCopyLink() {
    if (!shareSlug) return;
    const url =
      typeof window !== "undefined"
        ? `${window.location.origin}/share/${shareSlug}`
        : `/share/${shareSlug}`;
    await navigator.clipboard.writeText(url);
    setCopied(true);
    toast.success("Share link copied to clipboard.");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant={isPublic ? "default" : "outline"}
          size="sm"
          className="gap-1.5"
        >
          <Share2 className="h-4 w-4" />
          {isPublic ? "Shared" : "Share"}
        </Button>
      </DialogTrigger>

      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Globe className="h-5 w-5" />
            Share this note
          </DialogTitle>
          <DialogDescription>
            Control who can view this note outside your workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          {/* Toggle row */}
          <div className="flex items-start justify-between gap-4 rounded-lg border p-4">
            <div className="flex items-center gap-3">
              {isPublic ? (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-green-500/10">
                  <Globe className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-muted">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div>
                <Label
                  htmlFor="share-toggle"
                  className="cursor-pointer font-semibold"
                >
                  {isPublic ? "Public — anyone with link" : "Private — only you"}
                </Label>
                <p className="mt-0.5 text-xs text-muted-foreground">
                  {isPublic
                    ? "Anyone with the link can view and copy this note."
                    : "Only you can see this note. Enable sharing to generate a link."}
                </p>
              </div>
            </div>
            <Switch
              id="share-toggle"
              checked={isPublic}
              onCheckedChange={handleToggle}
              disabled={isToggling}
              aria-label="Toggle public sharing"
            />
          </div>

          {/* Share link row — only visible when public */}
          {isPublic && shareSlug && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Share link
              </Label>
              <div className="flex items-center gap-2 rounded-lg border bg-muted/40 px-3 py-2.5">
                <Link2 className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                <span className="min-w-0 flex-1 truncate text-sm text-muted-foreground">
                  {shareUrl}
                </span>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7 shrink-0"
                  onClick={handleCopyLink}
                  aria-label="Copy share link"
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                Viewers can read the note and make their own copy — they cannot
                edit the original.
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
