"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import type { SlashCommandItem } from "@/components/tiptap/slash-command";
import { cn } from "@/lib/utils";

export type SlashCommandMenuHandle = {
  /** Returns true when the menu consumed the key event. */
  onKeyDown: (event: KeyboardEvent) => boolean;
};

export type SlashCommandMenuProps = {
  items: SlashCommandItem[];
  command: (item: SlashCommandItem) => void;
  /** Caret rect from the suggestion plugin — anchors the floating menu. */
  clientRect?: (() => DOMRect | null) | null;
  ref?: React.Ref<SlashCommandMenuHandle>;
};

const VIEWPORT_GAP = 8;

type MenuGroup = {
  label: string;
  items: { item: SlashCommandItem; index: number }[];
};

export function SlashCommandMenu({
  items,
  command,
  clientRect,
  ref,
}: SlashCommandMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

  // Reset the highlight whenever the filtered items change
  // (render-time state adjustment, per react.dev/you-might-not-need-an-effect).
  const [prevItems, setPrevItems] = useState(items);
  if (prevItems !== items) {
    setPrevItems(items);
    setSelectedIndex(0);
  }

  const updatePosition = useCallback(() => {
    const element = containerRef.current;
    const rect = clientRect?.();
    if (!element || !rect) return;

    const menuRect = element.getBoundingClientRect();
    // Open below the caret; flip above when there is not enough room.
    let top = rect.bottom + VIEWPORT_GAP;
    if (top + menuRect.height > window.innerHeight - VIEWPORT_GAP) {
      top = Math.max(VIEWPORT_GAP, rect.top - menuRect.height - VIEWPORT_GAP);
    }
    const left = Math.min(
      Math.max(VIEWPORT_GAP, rect.left),
      Math.max(VIEWPORT_GAP, window.innerWidth - menuRect.width - VIEWPORT_GAP),
    );
    element.style.top = `${top}px`;
    element.style.left = `${left}px`;
  }, [clientRect]);

  // Reposition on every render (the caret moves as the user types)…
  useLayoutEffect(() => {
    updatePosition();
  });

  // …and when the page scrolls or resizes while the menu is open.
  useEffect(() => {
    window.addEventListener("resize", updatePosition);
    window.addEventListener("scroll", updatePosition, true);
    return () => {
      window.removeEventListener("resize", updatePosition);
      window.removeEventListener("scroll", updatePosition, true);
    };
  }, [updatePosition]);

  useEffect(() => {
    containerRef.current
      ?.querySelector(`[data-slash-index="${selectedIndex}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [selectedIndex]);

  useImperativeHandle(
    ref,
    () => ({
      onKeyDown: (event) => {
        if (items.length === 0) return false;

        if (event.key === "ArrowDown") {
          setSelectedIndex((index) => (index + 1) % items.length);
          return true;
        }
        if (event.key === "ArrowUp") {
          setSelectedIndex((index) => (index - 1 + items.length) % items.length);
          return true;
        }
        if (event.key === "Enter") {
          const item = items[selectedIndex];
          if (item) command(item);
          return true;
        }
        return false;
      },
    }),
    [items, selectedIndex, command],
  );

  // Items arrive ordered by group, so consecutive grouping keeps headers stable.
  const groups = useMemo<MenuGroup[]>(() => {
    const result: MenuGroup[] = [];
    items.forEach((item, index) => {
      const last = result[result.length - 1];
      if (last && last.label === item.group) {
        last.items.push({ item, index });
      } else {
        result.push({ label: item.group, items: [{ item, index }] });
      }
    });
    return result;
  }, [items]);

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label="Insert block"
      className="fixed z-50 w-72 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg"
      style={{ top: -9999, left: -9999 }}
      // Keep the editor focused so the selection (and suggestion) survives clicks.
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="max-h-80 overflow-y-auto p-1.5">
        {items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            No matching blocks.
          </p>
        ) : (
          groups.map((group) => (
            <div key={group.label} role="presentation">
              <p className="px-2 pb-1 pt-2 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground first:pt-1">
                {group.label}
              </p>
              {group.items.map(({ item, index }) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.title}
                    type="button"
                    role="option"
                    aria-selected={index === selectedIndex}
                    data-slash-index={index}
                    onClick={() => command(item)}
                    onMouseEnter={() => setSelectedIndex(index)}
                    className={cn(
                      "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                      index === selectedIndex && "bg-accent text-accent-foreground",
                    )}
                  >
                    <span className="clay-inset flex h-8 w-8 shrink-0 items-center justify-center rounded-md">
                      <Icon className="h-4 w-4 text-muted-foreground" />
                    </span>
                    <span className="flex min-w-0 flex-col">
                      <span className="truncate font-medium">{item.title}</span>
                      <span className="truncate text-xs text-muted-foreground">
                        {item.description}
                      </span>
                    </span>
                  </button>
                );
              })}
            </div>
          ))
        )}
      </div>

      <div className="flex items-center gap-3 border-t bg-muted/40 px-3 py-1.5 text-[11px] text-muted-foreground">
        <span>
          <kbd className="rounded border bg-muted px-1">↑↓</kbd> navigate
        </span>
        <span>
          <kbd className="rounded border bg-muted px-1">↵</kbd> select
        </span>
        <span>
          <kbd className="rounded border bg-muted px-1">esc</kbd> dismiss
        </span>
      </div>
    </div>
  );
}
