"use client";

import { Type } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  NOTE_FONT_OPTIONS,
  setNoteFont,
  useNoteFont,
} from "@/lib/note-font";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuCheckboxItem,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

export function NoteFontPicker() {
  const noteFont = useNoteFont();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          title="Note font"
          aria-label="Note font"
        >
          <Type className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-52">
        <DropdownMenuLabel>Note font</DropdownMenuLabel>
        {NOTE_FONT_OPTIONS.map((option) => (
          <DropdownMenuCheckboxItem
            key={option.id}
            checked={noteFont === option.id}
            onCheckedChange={() => setNoteFont(option.id)}
            className={option.className}
          >
            <span className={cn("note-font-swatch text-base leading-none")}>
              {option.label}
            </span>
          </DropdownMenuCheckboxItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
