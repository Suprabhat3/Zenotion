"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createFolder } from "@/app/(app)/notes/actions";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

type CreateFolderDialogProps = {
  trigger?: "icon" | "empty";
  className?: string;
};

export function CreateFolderDialog({
  trigger = "icon",
  className,
}: CreateFolderDialogProps) {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    try {
      await createFolder(formData);
      setOpen(false);
      toast.success("Folder created.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create folder.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger === "icon" ? (
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 shrink-0", className)}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="sr-only">New folder</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className={cn("h-8 gap-1.5 text-xs clay-surface", className)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add folder
          </Button>
        )}
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New folder</DialogTitle>
          <DialogDescription>Organize your notes into folders.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="folder-name">Name</Label>
            <Input id="folder-name" name="name" placeholder="Work" required />
          </div>
          <DialogFooter>
            <Button type="submit">Create folder</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
