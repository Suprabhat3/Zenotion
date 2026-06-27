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
          className="h-9 w-9 shrink-0 gap-0 px-0 sm:h-8 sm:w-auto sm:gap-1.5 sm:px-3"
          title={isPublic ? "Shared" : "Share note"}
          aria-label={isPublic ? "Shared" : "Share note"}
        >
          <Share2 className="h-4 w-4" />
          <span className="hidden sm:inline">{isPublic ? "Shared" : "Share"}</span>
        </Button>
      </DialogTrigger>

      <DialogContent className="share-dialog-content inset-x-0 bottom-0 top-auto max-h-[88svh] w-full max-w-none translate-x-0 translate-y-0 gap-3 overflow-y-auto rounded-t-2xl rounded-b-none border-b-0 p-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:inset-auto sm:bottom-auto sm:left-1/2 sm:top-1/2 sm:max-h-[calc(100svh-2rem)] sm:max-w-md sm:-translate-x-1/2 sm:-translate-y-1/2 sm:gap-4 sm:rounded-lg sm:border-b sm:p-6">
        <DialogHeader className="pr-8">
          <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
            <Globe className="h-5 w-5 shrink-0" />
            Share this note
          </DialogTitle>
          <DialogDescription className="text-left text-xs sm:text-sm">
            Control who can view this note outside your workspace.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-3 pt-0 sm:space-y-4 sm:pt-2">
          <div className="share-dialog-toggle rounded-lg border p-3 sm:p-4">
            <div className="flex items-start gap-3">
              {isPublic ? (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-500/10">
                  <Globe className="h-4 w-4 text-green-600 dark:text-green-400" />
                </div>
              ) : (
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-muted">
                  <Lock className="h-4 w-4 text-muted-foreground" />
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-start justify-between gap-3">
                  <Label
                    htmlFor="share-toggle"
                    className="cursor-pointer text-sm font-semibold leading-snug sm:text-base"
                  >
                    {isPublic ? "Public — anyone with link" : "Private — only you"}
                  </Label>
                  <Switch
                    id="share-toggle"
                    checked={isPublic}
                    onCheckedChange={handleToggle}
                    disabled={isToggling}
                    aria-label="Toggle public sharing"
                    className="shrink-0"
                  />
                </div>
                <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">
                  {isPublic
                    ? "Anyone with the link can view and copy this note."
                    : "Only you can see this note. Enable sharing to generate a link."}
                </p>
              </div>
            </div>
          </div>

          {isPublic && shareSlug && (
            <div className="space-y-2">
              <Label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Share link
              </Label>
              <div className="share-dialog-link-row rounded-lg border bg-muted/40 p-3">
                <div className="flex min-w-0 items-start gap-2">
                  <Link2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  <span className="min-w-0 flex-1 break-all text-xs leading-relaxed text-muted-foreground sm:truncate sm:text-sm">
                    {shareUrl}
                  </span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="mt-3 w-full gap-1.5 sm:mt-0 sm:hidden"
                  onClick={handleCopyLink}
                >
                  {copied ? (
                    <Check className="h-3.5 w-3.5 text-green-500" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" />
                  )}
                  {copied ? "Copied" : "Copy link"}
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="hidden h-8 w-8 shrink-0 sm:inline-flex"
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
              <p className="text-xs leading-relaxed text-muted-foreground">
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
