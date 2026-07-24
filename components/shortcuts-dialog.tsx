"use client";

import { useCallback, useEffect, useState } from "react";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Keyboard } from "lucide-react";
import { modKeyLabel, useIsApplePlatform } from "@/lib/platform";

export const SHORTCUTS_OPEN_EVENT = "zenotion-shortcuts-open";

/** Opens the keyboard-shortcuts cheatsheet from anywhere. */
export function openShortcutsDialog(): void {
  window.dispatchEvent(new Event(SHORTCUTS_OPEN_EVENT));
}

type Shortcut = {
  /** Key tokens rendered as individual <kbd> chips. Use "Mod" for ⌘/Ctrl. */
  keys: string[];
  label: string;
};

type ShortcutGroup = {
  title: string;
  shortcuts: Shortcut[];
};

const SHORTCUT_GROUPS: ShortcutGroup[] = [
  {
    title: "Navigation",
    shortcuts: [
      { keys: ["Mod", "P"], label: "Search & switch notes" },
      { keys: ["Mod", "K"], label: "Open AI command palette" },
      { keys: ["?"], label: "Show this shortcuts cheatsheet" },
    ],
  },
  {
    title: "Editing",
    shortcuts: [
      { keys: ["Mod", "S"], label: "Save now" },
      { keys: ["Mod", "F"], label: "Find (Markdown mode)" },
      { keys: ["Mod", "Alt", "F"], label: "Find & replace (Markdown mode)" },
      { keys: ["/"], label: "Insert block (Document mode)" },
    ],
  },
  {
    title: "Formatting",
    shortcuts: [
      { keys: ["Mod", "B"], label: "Bold" },
      { keys: ["Mod", "I"], label: "Italic" },
      { keys: ["Mod", "U"], label: "Underline" },
      { keys: ["Mod", "Shift", "X"], label: "Strikethrough" },
    ],
  },
];

function KbdChip({ token, modLabel }: { token: string; modLabel: string }) {
  const display = token === "Mod" ? modLabel : token;
  return (
    <kbd className="inline-flex min-w-[1.75rem] items-center justify-center rounded-md border bg-muted px-1.5 py-0.5 font-mono text-[11px] font-medium text-foreground shadow-sm">
      {display}
    </kbd>
  );
}

export function ShortcutsDialog() {
  const [open, setOpen] = useState(false);
  const isApple = useIsApplePlatform();
  const modLabel = modKeyLabel(isApple);

  const handleOpenChange = useCallback((next: boolean) => {
    setOpen(next);
  }, []);

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      // "?" is Shift+/ — only trigger when not typing into a field.
      if (e.key !== "?" || e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.isContentEditable ||
          target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.tagName === "SELECT")
      ) {
        return;
      }
      e.preventDefault();
      setOpen((current) => !current);
    }
    function onOpenEvent() {
      setOpen(true);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(SHORTCUTS_OPEN_EVENT, onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(SHORTCUTS_OPEN_EVENT, onOpenEvent);
    };
  }, []);

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-xl border bg-card shadow-2xl duration-200 clay-surface data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          <div className="flex items-center gap-2 border-b px-5 py-4">
            <Keyboard className="h-4 w-4 text-muted-foreground" />
            <DialogPrimitive.Title className="text-base font-semibold">
              Keyboard shortcuts
            </DialogPrimitive.Title>
          </div>
          <DialogPrimitive.Description className="sr-only">
            A reference of the keyboard shortcuts available in Zenotion.
          </DialogPrimitive.Description>

          <div className="max-h-[70vh] space-y-5 overflow-y-auto px-5 py-4">
            {SHORTCUT_GROUPS.map((group) => (
              <div key={group.title}>
                <p className="mb-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                  {group.title}
                </p>
                <ul className="space-y-1.5">
                  {group.shortcuts.map((shortcut) => (
                    <li
                      key={shortcut.label}
                      className="flex items-center justify-between gap-4 text-sm"
                    >
                      <span className="text-foreground/90">{shortcut.label}</span>
                      <span className="flex shrink-0 items-center gap-1">
                        {shortcut.keys.map((token, index) => (
                          <KbdChip
                            key={`${shortcut.label}-${index}`}
                            token={token}
                            modLabel={modLabel}
                          />
                        ))}
                      </span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-3 border-t bg-muted/40 px-5 py-2 text-[11px] text-muted-foreground">
            <span>
              Press <kbd className="rounded border bg-muted px-1">?</kbd> anytime
              to toggle this
            </span>
            <span className="ml-auto">
              <kbd className="rounded border bg-muted px-1">esc</kbd> to close
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
