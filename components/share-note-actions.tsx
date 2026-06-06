"use client";

import { useState } from "react";
import { Check, Link2, MoreHorizontal, FileText, AlignLeft } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

type ShareNoteActionsProps = {
  slug: string;
  title: string;
  content: string;
};

export function ShareNoteActions({ slug, title, content }: ShareNoteActionsProps) {
  const [copiedItem, setCopiedItem] = useState<string | null>(null);

  async function copyToClipboard(value: string, key: string, label: string) {
    try {
      await navigator.clipboard.writeText(value);
      setCopiedItem(key);
      toast.success(label);
      setTimeout(() => setCopiedItem(null), 2000);
    } catch {
      toast.error("Could not copy to clipboard.");
    }
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="h-8 w-8" aria-label="More options">
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-44">
        <DropdownMenuLabel className="text-xs text-muted-foreground font-normal">
          Copy as…
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          onClick={() =>
            copyToClipboard(
              `${window.location.origin}/share/${slug}`,
              "link",
              "Share link copied.",
            )
          }
        >
          {copiedItem === "link" ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <Link2 className="h-3.5 w-3.5" />
          )}
          Share link
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => copyToClipboard(content, "markdown", "Markdown copied.")}
        >
          {copiedItem === "markdown" ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <FileText className="h-3.5 w-3.5" />
          )}
          Markdown
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() =>
            copyToClipboard(`${title}\n\n${content}`, "text", "Plain text copied.")
          }
        >
          {copiedItem === "text" ? (
            <Check className="h-3.5 w-3.5 text-green-500" />
          ) : (
            <AlignLeft className="h-3.5 w-3.5" />
          )}
          Plain text
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
