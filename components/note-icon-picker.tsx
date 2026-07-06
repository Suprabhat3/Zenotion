"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

/**
 * Curated emoji palette for note icons, loosely grouped the way Notion's
 * picker is. Kept as a hand-picked list so we don't need an emoji-data
 * dependency for v1.
 */
const EMOJI_GROUPS: { label: string; emojis: string[] }[] = [
  {
    label: "Smileys",
    emojis: [
      "😀", "😄", "😁", "🙂", "😉", "😊", "😍", "🤩",
      "😎", "🤔", "🤨", "😅", "😂", "🥲", "😌", "😴",
      "🤯", "🥳", "😇", "🤓", "🫡", "🙃", "😬", "🥹",
    ],
  },
  {
    label: "Gestures & people",
    emojis: [
      "👍", "👎", "👏", "🙌", "🤝", "💪", "🫶", "🙏",
      "✌️", "🤞", "👀", "🧠", "✍️", "🧑‍💻", "🕵️", "🦸",
    ],
  },
  {
    label: "Work & study",
    emojis: [
      "📚", "📖", "📝", "📓", "📒", "📕", "📗", "📘",
      "📙", "🗂️", "📁", "📌", "📎", "🖊️", "✏️", "📐",
      "🧮", "💼", "🗓️", "⏰", "🔔", "📊", "📈", "📉",
    ],
  },
  {
    label: "Tech",
    emojis: [
      "💻", "🖥️", "⌨️", "🖱️", "📱", "🛠️", "⚙️", "🧪",
      "🤖", "🔌", "🧰", "🐛", "🚀", "🛰️", "💾", "🧑‍🔬",
    ],
  },
  {
    label: "Ideas & goals",
    emojis: [
      "💡", "🎯", "🏆", "🔥", "⭐", "✨", "⚡", "🌱",
      "🧭", "🗺️", "🔑", "🔒", "🔍", "❤️", "🎉", "🎁",
    ],
  },
  {
    label: "Nature & travel",
    emojis: [
      "🌞", "🌙", "🌈", "🌊", "🌲", "🌸", "🍀", "🏔️",
      "🏝️", "✈️", "🚗", "🚲", "🏠", "🌍", "☔", "❄️",
    ],
  },
  {
    label: "Food & drink",
    emojis: [
      "☕", "🍵", "🍕", "🍔", "🌮", "🍜", "🍰", "🍪",
      "🍎", "🥑", "🍩", "🍺", "🧃", "🍿", "🥗", "🍫",
    ],
  },
  {
    label: "Symbols",
    emojis: [
      "✅", "❌", "❓", "❗", "💬", "💭", "🔖", "🏷️",
      "♻️", "🔗", "➡️", "🆕", "🆗", "💯", "🚧", "🧩",
    ],
  },
];

type NoteIconPickerProps = {
  /** Currently selected emoji, if any. */
  icon: string | null;
  /** Called with the chosen emoji, or `null` when the icon is removed. */
  onSelect: (icon: string | null) => void;
  /** Trigger element (rendered via Radix `asChild`). */
  children: ReactNode;
};

export function NoteIconPicker({ icon, onSelect, children }: NoteIconPickerProps) {
  const [open, setOpen] = useState(false);

  function choose(next: string | null) {
    onSelect(next);
    setOpen(false);
  }

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>{children}</DropdownMenuTrigger>
      <DropdownMenuContent align="start" className="w-72 p-0">
        <div className="flex items-center justify-between border-b border-border/60 px-3 py-2">
          <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
            Note icon
          </span>
          {icon && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="h-6 px-2 text-xs text-muted-foreground"
              onClick={() => choose(null)}
            >
              Remove
            </Button>
          )}
        </div>
        <div className="max-h-72 space-y-2 overflow-y-auto p-3">
          {EMOJI_GROUPS.map((group) => (
            <div key={group.label}>
              <p className="mb-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                {group.label}
              </p>
              <div className="grid grid-cols-8 gap-0.5">
                {group.emojis.map((emoji) => (
                  <button
                    key={emoji}
                    type="button"
                    onClick={() => choose(emoji)}
                    title={`Use ${emoji} as the note icon`}
                    className={cn(
                      "flex h-7 w-7 items-center justify-center rounded-md text-base transition-colors hover:bg-accent",
                      icon === emoji && "bg-accent",
                    )}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
