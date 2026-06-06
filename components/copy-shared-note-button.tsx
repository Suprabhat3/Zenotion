"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";
import { Copy, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { copySharedNote } from "@/app/(app)/notes/actions";
import { Button } from "@/components/ui/button";

type CopySharedNoteButtonProps = {
  shareSlug: string;
  isLoggedIn: boolean;
};

export function CopySharedNoteButton({
  shareSlug,
  isLoggedIn,
}: CopySharedNoteButtonProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();

  function handleClick() {
    if (!isLoggedIn) {
      router.push(`/signin?redirect=/share/${shareSlug}`);
      return;
    }

    startTransition(async () => {
      try {
        const formData = new FormData();
        formData.set("shareSlug", shareSlug);
        const copy = await copySharedNote(formData);
        toast.success("Note copied to your dashboard!");
        router.push(`/notes/${copy.id}`);
      } catch (err) {
        const message =
          err instanceof Error ? err.message : "Could not copy note.";
        toast.error(message);
      }
    });
  }

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={handleClick}
      disabled={isPending}
      className="gap-1.5"
    >
      {isPending ? (
        <Loader2 className="h-3.5 w-3.5 animate-spin" />
      ) : (
        <Copy className="h-3.5 w-3.5" />
      )}
      {isLoggedIn ? "Make a copy" : "Sign in to copy"}
    </Button>
  );
}
