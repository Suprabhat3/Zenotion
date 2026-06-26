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
import { cn } from "@/lib/utils";

type CreateTagDialogProps = {
  trigger?: "icon" | "empty";
  className?: string;
};

const TAG_COLORS = [
  { name: "Gray", value: "#9b9a97" },
  { name: "Brown", value: "#64473a" },
  { name: "Orange", value: "#d9730d" },
  { name: "Yellow", value: "#dfab01" },
  { name: "Green", value: "#0f7b6c" },
  { name: "Blue", value: "#0b6e99" },
  { name: "Purple", value: "#6940a5" },
  { name: "Pink", value: "#ad1a72" },
  { name: "Red", value: "#e03e3e" },
] as const;

export function CreateTagDialog({
  trigger = "icon",
  className,
}: CreateTagDialogProps) {
  const [open, setOpen] = useState(false);
  const [color, setColor] = useState<string | null>(null);

  function handleOpenChange(next: boolean) {
    setOpen(next);
    if (next) setColor(null);
  }

  async function handleSubmit(formData: FormData) {
    if (color) formData.set("color", color);
    try {
      await createTag(formData);
      setOpen(false);
      toast.success("Tag created.");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Could not create tag.");
    }
  }

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger === "icon" ? (
          <Button
            variant="ghost"
            size="icon"
            className={cn("h-7 w-7 shrink-0", className)}
          >
            <Plus className="h-3.5 w-3.5" />
            <span className="sr-only">New tag</span>
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className={cn("h-8 gap-1.5 text-xs clay-surface", className)}
          >
            <Plus className="h-3.5 w-3.5" />
            Add tag
          </Button>
        )}
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
            <Label>Color (optional)</Label>
            <div className="flex flex-wrap gap-2">
              {TAG_COLORS.map((option) => {
                const selected = color === option.value;
                return (
                  <button
                    key={option.value}
                    type="button"
                    title={option.name}
                    aria-label={option.name}
                    aria-pressed={selected}
                    onClick={() => setColor(selected ? null : option.value)}
                    className={cn(
                      "h-7 w-7 rounded-full ring-offset-2 ring-offset-background transition-all hover:scale-110",
                      selected && "ring-2 ring-foreground",
                    )}
                    style={{ backgroundColor: option.value }}
                  />
                );
              })}
            </div>
          </div>
          <DialogFooter>
            <Button type="submit">Create tag</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
