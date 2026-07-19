"use client";

import { useState } from "react";
import { MoreHorizontal, Pencil, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { deleteTag, renameTag } from "@/app/(app)/notes/actions";
import { ConfirmDialog } from "@/components/confirm-dialog";
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

type TagActionsMenuProps = {
  tagId: string;
  tagName: string;
};

export function TagActionsMenu({ tagId, tagName }: TagActionsMenuProps) {
  const [renameOpen, setRenameOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [name, setName] = useState(tagName);

  function handleRenameOpen(next: boolean) {
    setRenameOpen(next);
    if (next) setName(tagName);
  }

  async function handleRenameSubmit(e: React.FormEvent) {
    e.preventDefault();
    const formData = new FormData();
    formData.set("tagId", tagId);
    formData.set("name", name);
    try {
      await renameTag(formData);
      setRenameOpen(false);
      toast.success("Tag renamed.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not rename tag.");
    }
  }

  async function handleDelete() {
    const formData = new FormData();
    formData.set("tagId", tagId);
    try {
      await deleteTag(formData);
      setDeleteOpen(false);
      toast.success("Tag deleted.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not delete tag.");
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
            aria-label={`Tag actions for ${tagName}`}
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
            onSelect={(e) => {
              e.preventDefault();
              setDeleteOpen(true);
            }}
          >
            <Trash2 className="h-4 w-4" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>

      <ConfirmDialog
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        title="Delete tag"
        description={`Delete tag "${tagName}"? It will be removed from all notes.`}
        confirmLabel="Delete tag"
        destructive
        onConfirm={handleDelete}
      />

      <Dialog open={renameOpen} onOpenChange={handleRenameOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Rename tag</DialogTitle>
            <DialogDescription>Update the tag name.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleRenameSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor={`rename-tag-${tagId}`}>Name</Label>
              <Input
                id={`rename-tag-${tagId}`}
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
