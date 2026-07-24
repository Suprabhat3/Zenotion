"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { FileText, Folder, Lock, RotateCcw, Trash2 } from "lucide-react";
import { toast } from "sonner";
import type { TrashedNote } from "@/lib/notes";
import {
  emptyTrash,
  permanentlyDeleteNote,
  restoreNote,
} from "@/app/(app)/notes/actions";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/confirm-dialog";

type TrashListProps = {
  notes: TrashedNote[];
};

function formatDeletedAt(date: Date | string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(new Date(date));
}

export function TrashList({ notes }: TrashListProps) {
  const router = useRouter();
  const [isPending, startTransition] = useTransition();
  const [deleteTarget, setDeleteTarget] = useState<TrashedNote | null>(null);
  const [emptyOpen, setEmptyOpen] = useState(false);

  function handleRestore(note: TrashedNote) {
    const formData = new FormData();
    formData.set("noteId", note.id);
    startTransition(async () => {
      try {
        await restoreNote(formData);
        toast.success("Note restored.");
        router.refresh();
      } catch {
        toast.error("Could not restore the note.");
      }
    });
  }

  function handlePermanentDelete(note: TrashedNote) {
    const formData = new FormData();
    formData.set("noteId", note.id);
    startTransition(async () => {
      try {
        await permanentlyDeleteNote(formData);
        toast.success("Note permanently deleted.");
        setDeleteTarget(null);
        router.refresh();
      } catch {
        toast.error("Could not delete the note.");
      }
    });
  }

  function handleEmptyTrash() {
    startTransition(async () => {
      try {
        await emptyTrash();
        toast.success("Trash emptied.");
        setEmptyOpen(false);
        router.refresh();
      } catch {
        toast.error("Could not empty the trash.");
      }
    });
  }

  if (notes.length === 0) {
    return (
      <div className="clay-surface rounded-2xl px-6 py-16 text-center">
        <Trash2 className="mx-auto h-8 w-8 text-muted-foreground" />
        <h2 className="mt-4 text-lg font-semibold">Trash is empty</h2>
        <p className="mx-auto mt-1 max-w-sm text-sm text-muted-foreground">
          Deleted notes land here so you can restore them. Emptying the trash
          removes them permanently.
        </p>
      </div>
    );
  }

  return (
    <>
      <div className="mb-4 flex justify-end">
        <Button
          variant="outline"
          size="sm"
          className="gap-1.5 text-destructive hover:text-destructive"
          onClick={() => setEmptyOpen(true)}
          disabled={isPending}
        >
          <Trash2 className="h-4 w-4" />
          Empty trash
        </Button>
      </div>

      <ul className="space-y-2">
        {notes.map((note) => (
          <li
            key={note.id}
            className="clay-surface flex items-center gap-3 rounded-xl px-4 py-3"
          >
            {note.isSecret ? (
              <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
            ) : note.icon ? (
              <span className="w-4 shrink-0 text-center leading-none" aria-hidden>
                {note.icon}
              </span>
            ) : (
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
            )}
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">
                {note.title || "Untitled"}
              </p>
              <p className="mt-0.5 flex items-center gap-2 text-xs text-muted-foreground">
                <span>Deleted {formatDeletedAt(note.deletedAt)}</span>
                {note.folderName && (
                  <span className="flex items-center gap-1">
                    <Folder className="h-3 w-3" />
                    {note.folderName}
                  </span>
                )}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() => handleRestore(note)}
                disabled={isPending}
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Restore</span>
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="text-destructive hover:text-destructive"
                onClick={() => setDeleteTarget(note)}
                disabled={isPending}
                title="Delete permanently"
                aria-label="Delete permanently"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </li>
        ))}
      </ul>

      <ConfirmDialog
        open={deleteTarget !== null}
        onOpenChange={(open) => !open && setDeleteTarget(null)}
        title="Delete permanently"
        description={`Permanently delete "${
          deleteTarget?.title || "Untitled"
        }"? This cannot be undone.`}
        confirmLabel="Delete forever"
        destructive
        onConfirm={() => {
          if (deleteTarget) handlePermanentDelete(deleteTarget);
        }}
      />
      <ConfirmDialog
        open={emptyOpen}
        onOpenChange={setEmptyOpen}
        title="Empty trash"
        description="Permanently delete all notes in the trash? This cannot be undone."
        confirmLabel="Empty trash"
        destructive
        onConfirm={handleEmptyTrash}
      />
    </>
  );
}
