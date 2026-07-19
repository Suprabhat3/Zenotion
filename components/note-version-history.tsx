"use client";

import { useCallback, useState } from "react";
import { History, Loader2, RotateCcw } from "lucide-react";
import { toast } from "sonner";
import type { ApiResponse } from "@/lib/api";
import type { NoteDetail, NoteVersionSummary } from "@/lib/types";
import { ConfirmDialog } from "@/components/confirm-dialog";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

type NoteVersionHistoryProps = {
  noteId: string;
  onRestore: (note: NoteDetail) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Applied to the toolbar trigger button (e.g. hide on small screens). */
  triggerClassName?: string;
};

function formatVersionDate(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
}

function previewText(content: string, max = 120): string {
  const trimmed = content.trim().replace(/\s+/g, " ");
  if (!trimmed) return "Empty note";
  return trimmed.length > max ? `${trimmed.slice(0, max)}…` : trimmed;
}

export function NoteVersionHistory({
  noteId,
  onRestore,
  open: openProp,
  onOpenChange: onOpenChangeProp,
  triggerClassName,
}: NoteVersionHistoryProps) {
  const [openInternal, setOpenInternal] = useState(false);
  const open = openProp ?? openInternal;
  const setOpen = onOpenChangeProp ?? setOpenInternal;
  const [loading, setLoading] = useState(false);
  const [restoringId, setRestoringId] = useState<string | null>(null);
  const [pendingRestoreId, setPendingRestoreId] = useState<string | null>(null);
  const [versions, setVersions] = useState<NoteVersionSummary[]>([]);

  const loadVersions = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/notes/${noteId}/versions`);
      const json = (await res.json()) as ApiResponse<NoteVersionSummary[]>;
      if (!json.success) {
        toast.error(json.error.message);
        return;
      }
      setVersions(json.data);
    } catch {
      toast.error("Could not load version history.");
    } finally {
      setLoading(false);
    }
  }, [noteId]);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) {
      void loadVersions();
    }
  }

  async function handleRestore(versionId: string) {
    setRestoringId(versionId);
    try {
      const res = await fetch(
        `/api/notes/${noteId}/versions/${versionId}/restore`,
        {
          method: "POST",
          headers: { "X-Requested-With": "Zenotion" },
        },
      );
      const json = (await res.json()) as ApiResponse<NoteDetail>;
      if (!json.success) {
        toast.error(json.error.message);
        return;
      }
      onRestore(json.data);
      setOpen(false);
      setPendingRestoreId(null);
      toast.success("Version restored.");
    } catch {
      toast.error("Could not restore version.");
    } finally {
      setRestoringId(null);
    }
  }

  return (
    <>
      <Dialog open={open} onOpenChange={handleOpenChange}>
        <DialogTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className={cn("gap-1.5", triggerClassName)}
          >
            <History className="h-4 w-4" />
            <span className="hidden sm:inline">History</span>
          </Button>
        </DialogTrigger>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Version history</DialogTitle>
            <DialogDescription>
              Snapshots are saved automatically when you edit. Up to 20 versions
              are kept.
            </DialogDescription>
          </DialogHeader>

          {loading ? (
            <div className="flex items-center justify-center py-10 text-sm text-muted-foreground">
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Loading versions…
            </div>
          ) : versions.length === 0 ? (
            <p className="py-8 text-center text-sm text-muted-foreground">
              No saved versions yet. Edit the note to create your first snapshot.
            </p>
          ) : (
            <ul className="max-h-80 space-y-2 overflow-y-auto">
              {versions.map((version, index) => (
                <li
                  key={version.id}
                  className="clay-sidebar-section flex items-start justify-between gap-3 rounded-lg p-3"
                >
                  <div className="min-w-0 flex-1">
                    <p className="text-sm font-medium">
                      {version.title.trim() || "Untitled"}
                      {index === 0 && (
                        <span className="ml-2 text-xs font-normal text-muted-foreground">
                          Previous save
                        </span>
                      )}
                    </p>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {formatVersionDate(version.createdAt)}
                    </p>
                    <p className="mt-1 line-clamp-2 text-xs text-muted-foreground">
                      {previewText(version.content)}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="shrink-0 gap-1.5"
                    disabled={restoringId === version.id}
                    onClick={() => setPendingRestoreId(version.id)}
                  >
                    {restoringId === version.id ? (
                      <Loader2 className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <RotateCcw className="h-3.5 w-3.5" />
                    )}
                    Restore
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={pendingRestoreId !== null}
        onOpenChange={(next) => {
          if (!next) setPendingRestoreId(null);
        }}
        title="Restore version"
        description="Restore this version? Your current note will be saved to history first."
        confirmLabel="Restore"
        onConfirm={() => {
          if (pendingRestoreId) void handleRestore(pendingRestoreId);
        }}
      />
    </>
  );
}
