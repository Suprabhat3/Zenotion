"use client";

import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useLayoutEffect,
  useRef,
  useState,
} from "react";
import { FileText } from "lucide-react";
import type { NoteSearchResult } from "@/lib/types";
import { cn } from "@/lib/utils";

export type WikiLinkMenuHandle = {
  /** Returns true when the menu consumed the key event. */
  onKeyDown: (event: KeyboardEvent) => boolean;
};

export type WikiLinkMenuProps = {
  items: NoteSearchResult[];
  command: (item: NoteSearchResult) => void;
  clientRect?: (() => DOMRect | null) | null;
  ref?: React.Ref<WikiLinkMenuHandle>;
};

const VIEWPORT_GAP = 8;

export function WikiLinkMenu({
  items,
  command,
  clientRect,
  ref,
}: WikiLinkMenuProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [selectedIndex, setSelectedIndex] = useState(0);

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

  useLayoutEffect(() => {
    updatePosition();
  });

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
      ?.querySelector(`[data-wiki-index="${selectedIndex}"]`)
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

  return (
    <div
      ref={containerRef}
      role="listbox"
      aria-label="Link to note"
      className="fixed z-50 w-72 overflow-hidden rounded-lg border bg-popover text-popover-foreground shadow-lg"
      style={{ top: -9999, left: -9999 }}
      onMouseDown={(e) => e.preventDefault()}
    >
      <div className="max-h-72 overflow-y-auto p-1.5">
        <p className="px-2 pb-1 pt-1 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          Link to note
        </p>
        {items.length === 0 ? (
          <p className="px-3 py-6 text-center text-sm text-muted-foreground">
            No matching notes.
          </p>
        ) : (
          items.map((item, index) => (
            <button
              key={item.id}
              type="button"
              role="option"
              aria-selected={index === selectedIndex}
              data-wiki-index={index}
              onClick={() => command(item)}
              onMouseEnter={() => setSelectedIndex(index)}
              className={cn(
                "flex w-full items-center gap-2.5 rounded-md px-2 py-1.5 text-left text-sm transition-colors",
                index === selectedIndex && "bg-accent text-accent-foreground",
              )}
            >
              <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
              <span className="truncate font-medium">
                {item.title || "Untitled"}
              </span>
            </button>
          ))
        )}
      </div>

      <div className="flex items-center gap-3 border-t bg-muted/40 px-3 py-1.5 text-[11px] text-muted-foreground">
        <span>
          <kbd className="rounded border bg-muted px-1">↑↓</kbd> navigate
        </span>
        <span>
          <kbd className="rounded border bg-muted px-1">↵</kbd> link
        </span>
        <span>
          <kbd className="rounded border bg-muted px-1">esc</kbd> dismiss
        </span>
      </div>
    </div>
  );
}
