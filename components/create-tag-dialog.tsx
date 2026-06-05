"use client";

import { useState } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import { createTag } from "@/app/(app)/notes/actions";
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

export function CreateTagDialog() {
  const [open, setOpen] = useState(false);

  async function handleSubmit(formData: FormData) {
    try {
      await createTag(formData);
      setOpen(false);
      toast.success("Tag created.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create tag.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="icon" className="h-6 w-6">
          <Plus className="h-3.5 w-3.5" />
          <span className="sr-only">New tag</span>
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>New tag</DialogTitle>
          <DialogDescription>Label notes for quick filtering.</DialogDescription>
        </DialogHeader>
        <form action={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <Label htmlFor="tag-name">Name</Label>
            <Input id="tag-name" name="name" placeholder="ideas" required />
          </div>
          <div className="space-y-1.5">
            <Label htmlFor="tag-color">Color (optional)</Label>
            <Input
              id="tag-color"
              name="color"
              type="text"
              placeholder="#6366f1"
              pattern="^#[0-9a-fA-F]{6}$"
            />
          </div>
          <DialogFooter>
            <Button type="submit">Create tag</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
