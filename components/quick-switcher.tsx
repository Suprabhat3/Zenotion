"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { FileText, Folder, Loader2, Lock, Search, Star } from "lucide-react";
import type { ApiResponse } from "@/lib/api";
import type { NoteSearchResult } from "@/lib/types";
import { navigateWithNoteGuard } from "@/lib/note-navigation-guard";
import { Input } from "@/components/ui/input";

export const QUICK_SWITCHER_OPEN_EVENT = "zenotion-quick-switcher-open";

/** Opens the global quick switcher from anywhere (sidebar button, shortcuts…). */
export function openQuickSwitcher(): void {
  window.dispatchEvent(new Event(QUICK_SWITCHER_OPEN_EVENT));
}

const SEARCH_DEBOUNCE_MS = 250;

export function QuickSwitcher() {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<NoteSearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [highlightIndex, setHighlightIndex] = useState(0);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const requestSeq = useRef(0);

  const runSearch = useCallback(async (q: string) => {
    const seq = ++requestSeq.current;
    setLoading(true);
    try {
      const res = await fetch(`/api/notes/search?q=${encodeURIComponent(q)}`);
      const json = (await res.json()) as ApiResponse<NoteSearchResult[]>;
      if (seq !== requestSeq.current) return;
      setResults(json.success ? json.data : []);
      setHighlightIndex(0);
    } catch {
      if (seq === requestSeq.current) setResults([]);
    } finally {
      if (seq === requestSeq.current) setLoading(false);
    }
  }, []);

  const handleOpenChange = useCallback(
    (next: boolean) => {
      setOpen(next);
      if (next) {
        setQuery("");
        setResults([]);
        setHighlightIndex(0);
        void runSearch("");
      }
    },
    [runSearch],
  );

  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "p") {
        e.preventDefault();
        handleOpenChange(true);
      }
    }
    function onOpenEvent() {
      handleOpenChange(true);
    }
    window.addEventListener("keydown", onKeyDown);
    window.addEventListener(QUICK_SWITCHER_OPEN_EVENT, onOpenEvent);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      window.removeEventListener(QUICK_SWITCHER_OPEN_EVENT, onOpenEvent);
    };
  }, [handleOpenChange]);

  useEffect(() => {
    if (!open) return;
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => {
      void runSearch(query);
    }, SEARCH_DEBOUNCE_MS);
    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query, open, runSearch]);

  function handleSelect(noteId: string) {
    setOpen(false);
    void navigateWithNoteGuard(`/notes/${noteId}`, router.push);
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (results.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      setHighlightIndex((index) => (index + 1) % results.length);
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setHighlightIndex((index) => (index - 1 + results.length) % results.length);
    } else if (e.key === "Enter") {
      e.preventDefault();
      const selected = results[highlightIndex];
      if (selected) handleSelect(selected.id);
    }
  }

  const showEmptyState = !loading && results.length === 0;

  return (
    <DialogPrimitive.Root open={open} onOpenChange={handleOpenChange}>
      {/* Custom content surface: the shared DialogContent ships p-6/gap-4,
          a clay glow, and a close button that clash with a command palette. */}
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-1/2 top-[18%] z-50 w-full max-w-lg -translate-x-1/2 overflow-hidden rounded-xl border bg-card shadow-2xl duration-200 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0">
          <DialogPrimitive.Title className="sr-only">
            Search notes
          </DialogPrimitive.Title>
          <DialogPrimitive.Description className="sr-only">
            Search your notes by title or content and jump to one.
          </DialogPrimitive.Description>

          <div className="relative border-b">
            <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Search notes…"
              autoFocus
              className="h-12 rounded-none border-0 bg-transparent pl-11 pr-10 text-base shadow-none focus-visible:ring-0"
            />
            {loading && (
              <Loader2 className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-muted-foreground" />
            )}
          </div>

          <div className="max-h-80 overflow-y-auto px-2 py-2">
            {!query.trim() && results.length > 0 && (
              <p className="px-3 pb-1 pt-1.5 text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
                Recent notes
              </p>
            )}
            <ul className="space-y-0.5">
              {results.map((note, index) => (
                <li key={note.id}>
                  <button
                    type="button"
                    onClick={() => handleSelect(note.id)}
                    onMouseEnter={() => setHighlightIndex(index)}
                    className={`flex w-full items-start gap-3 rounded-md px-3 py-2 text-left text-sm transition-colors ${
                      index === highlightIndex ? "bg-accent" : ""
                    }`}
                  >
                    {note.isSecret ? (
                      <Lock className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    ) : (
                      <FileText className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground" />
                    )}
                    <span className="min-w-0 flex-1">
                      <span className="flex items-center gap-1.5">
                        <span className="truncate font-medium">
                          {note.title || "Untitled"}
                        </span>
                        {note.isFavorite && (
                          <Star className="h-3 w-3 shrink-0 fill-amber-400 text-amber-400" />
                        )}
                      </span>
                      {note.excerpt && (
                        <span className="mt-0.5 block truncate text-xs text-muted-foreground">
                          {note.excerpt}
                        </span>
                      )}
                    </span>
                    {note.folderName && (
                      <span className="flex shrink-0 items-center gap-1 pt-0.5 text-xs text-muted-foreground">
                        <Folder className="h-3 w-3" />
                        {note.folderName}
                      </span>
                    )}
                  </button>
                </li>
              ))}
            </ul>
            {showEmptyState && (
              <p className="px-3 py-8 text-center text-sm text-muted-foreground">
                {query.trim()
                  ? `No notes match “${query.trim()}”.`
                  : "No notes yet. Create your first note to get started."}
              </p>
            )}
          </div>

          <div className="flex items-center gap-3 border-t bg-muted/40 px-4 py-2 text-[11px] text-muted-foreground">
            <span>
              <kbd className="rounded border bg-muted px-1">↑↓</kbd> to navigate
            </span>
            <span>
              <kbd className="rounded border bg-muted px-1">↵</kbd> to open
            </span>
            <span>
              <kbd className="rounded border bg-muted px-1">esc</kbd> to close
            </span>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  );
}
