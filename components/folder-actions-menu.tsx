"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteFolder, renameFolder } from "@/app/(app)/notes/actions";
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
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type FolderActionsMenuProps = {
  folderId: string;
  folderName: string;
  noteCount: number;
};

export function FolderActionsMenu({
  folderId,
  folderName,
  noteCount,
}: FolderActionsMenuProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [name, setName] = useState(folderName);

  function handleRenameOpen(next: boolean) {
    setRenameOpen(next);
    if (next) setName(folderName);
  }

  async function handleRenameSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("folderId", folderId);
    formData.set("name", name);
    try {
      await renameFolder(formData);
      setRenameOpen(false);
      toast.success("Folder renamed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not rename folder.");
    }
  }

  async function handleDelete() {
    const message =
      noteCount > 0
        ? `Delete "${folderName}"? ${noteCount} note${noteCount === 1 ? "" : "s"} will move to All notes.`
        : `Delete "${folderName}"?`;
    if (!confirm(message)) return;

    const formData = new FormData();
    formData.set("folderId", folderId);
    try {
      await deleteFolder(formData);
      toast.success("Folder deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete folder.");
    }
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            type="button"
            variant="ghost"
            size="icon"
            className="h-7 w-7 shrink-0 opacity-0 transition-opacity group-hover:opacity-100 data-[state=open]:opacity-100"
            onClick={(e) => e.preventDefault()}
            aria-label={`Folder actions for ${folderName}`}
          >
            <MoreHorizontal className="h-4 w-4" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-40">
          <DropdownMenuItem
            onSelect={(e) => {
              e.preventDefault();
              handleRenameOpen(true);
            }}
          >
            <Pencil className="h-4 w-4" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem
            className="text-destructive focus:text-destructive"
            onSelect={() => void handleDelete()}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <Dialog open={renameOpen} onOpenChange={handleRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename folder</DialogTitle>
            <DialogDescription>Update the folder name.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRenameSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor={`rename-folder-${folderId}`}>Name</Label>
              <Input
                id={`rename-folder-${folderId}`}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                autoFocus
              />
            </div>
            <DialogFooter>
              <Button type="submit">Save</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </>
  );
}
