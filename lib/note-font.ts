"use client";

import { useSyncExternalStore } from "react";

/**
 * Per-browser note font preference. Mirrors the localStorage +
 * useSyncExternalStore pattern used by lib/ai-storage.ts.
 *
 * The chosen option's `className` is applied to the note editor container;
 * app/globals.css maps each class to a `--note-body-font` / `--note-body-size`
 * pair consumed by `.prose-note` and `.rich-editor-content`.
 */

const NOTE_FONT_KEY = "zenotion-note-font";
const NOTE_FONT_CHANGE_EVENT = "zenotion-note-font-change";

export type NoteFontId =
  | "default"
  | "caveat"
  | "kalam"
  | "patrick-hand"
  | "shadows-into-light";

export type NoteFontOption = {
  id: NoteFontId;
  label: string;
  /** Container class defined in app/globals.css. Empty for the default font. */
  className: string;
};

export const NOTE_FONT_OPTIONS: readonly NoteFontOption[] = [
  { id: "default", label: "Default", className: "" },
  { id: "caveat", label: "Caveat", className: "note-font-caveat" },
  { id: "kalam", label: "Kalam", className: "note-font-kalam" },
  { id: "patrick-hand", label: "Patrick Hand", className: "note-font-patrick-hand" },
  {
    id: "shadows-into-light",
    label: "Shadows Into Light",
    className: "note-font-shadows-into-light",
  },
] as const;

function isNoteFontId(value: string | null): value is NoteFontId {
  return NOTE_FONT_OPTIONS.some((option) => option.id === value);
}

export function readNoteFont(): NoteFontId {
  if (typeof window === "undefined") return "default";
  const stored = localStorage.getItem(NOTE_FONT_KEY);
  return isNoteFontId(stored) ? stored : "default";
}

export function setNoteFont(id: NoteFontId): void {
  localStorage.setItem(NOTE_FONT_KEY, id);
  window.dispatchEvent(new Event(NOTE_FONT_CHANGE_EVENT));
}

export function getNoteFontOption(id: NoteFontId): NoteFontOption {
  return (
    NOTE_FONT_OPTIONS.find((option) => option.id === id) ?? NOTE_FONT_OPTIONS[0]
  );
}

function subscribe(callback: () => void): () => void {
  window.addEventListener(NOTE_FONT_CHANGE_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(NOTE_FONT_CHANGE_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

function getServerSnapshot(): NoteFontId {
  return "default";
}

export function useNoteFont(): NoteFontId {
  return useSyncExternalStore(subscribe, readNoteFont, getServerSnapshot);
}
