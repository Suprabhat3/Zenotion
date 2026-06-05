import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";

const lightHighlight = HighlightStyle.define([
  { tag: t.heading, fontWeight: "700", color: "#111827" },
  { tag: t.heading1, fontSize: "1.1em", color: "#111827" },
  { tag: t.heading2, fontSize: "1.05em", color: "#1f2937" },
  { tag: t.heading3, color: "#374151" },
  { tag: t.strong, fontWeight: "700", color: "#111827" },
  { tag: t.emphasis, fontStyle: "italic", color: "#4b5563" },
  { tag: t.link, color: "#2563eb", textDecoration: "underline" },
  { tag: t.url, color: "#2563eb" },
  { tag: t.monospace, color: "#9333ea", fontFamily: "var(--font-mono), monospace" },
  { tag: t.quote, color: "#6b7280", fontStyle: "italic" },
  { tag: t.meta, color: "#7c3aed" },
  { tag: t.keyword, color: "#7c3aed" },
  { tag: t.string, color: "#059669" },
  { tag: t.content, color: "#1f1f1f" },
]);

const darkHighlight = HighlightStyle.define([
  { tag: t.heading, fontWeight: "700", color: "#f9fafb" },
  { tag: t.heading1, fontSize: "1.1em", color: "#ffffff" },
  { tag: t.heading2, fontSize: "1.05em", color: "#f3f4f6" },
  { tag: t.heading3, color: "#e5e7eb" },
  { tag: t.strong, fontWeight: "700", color: "#f9fafb" },
  { tag: t.emphasis, fontStyle: "italic", color: "#d1d5db" },
  { tag: t.link, color: "#60a5fa", textDecoration: "underline" },
  { tag: t.url, color: "#60a5fa" },
  { tag: t.monospace, color: "#e879f9", fontFamily: "var(--font-mono), monospace" },
  { tag: t.quote, color: "#9ca3af", fontStyle: "italic" },
  { tag: t.meta, color: "#a78bfa" },
  { tag: t.keyword, color: "#c4b5fd" },
  { tag: t.string, color: "#34d399" },
  { tag: t.content, color: "#ededed" },
]);

/** Uses CSS variables for chrome + explicit syntax colors per theme. */
export function getCodeMirrorTheme(isDark: boolean) {
  const editorTheme = EditorView.theme({
    "&": {
      backgroundColor: "var(--background)",
      color: "var(--foreground)",
      fontSize: "15px",
      height: "100%",
    },
    ".cm-scroller": {
      fontFamily: "var(--font-mono), ui-monospace, monospace",
      lineHeight: "1.75",
      backgroundColor: "var(--background)",
    },
    ".cm-content": {
      caretColor: "var(--foreground)",
      color: "var(--foreground)",
      padding: "1.25rem 0",
    },
    ".cm-line": {
      padding: "0 1rem 0 0.5rem",
    },
    ".cm-gutters": {
      backgroundColor: "var(--muted)",
      color: "var(--muted-foreground)",
      border: "none",
      borderRight: "1px solid var(--border)",
      paddingRight: "6px",
    },
    ".cm-activeLineGutter": {
      backgroundColor: "var(--accent)",
    },
    ".cm-activeLine": {
      backgroundColor: "color-mix(in srgb, var(--accent) 60%, transparent)",
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: "var(--foreground)",
    },
    "&.cm-focused .cm-selectionBackground, .cm-selectionBackground": {
      backgroundColor: "color-mix(in srgb, #3b82f6 28%, transparent) !important",
    },
    ".cm-placeholder": {
      color: "var(--muted-foreground)",
      fontStyle: "italic",
    },
  });

  return [
    editorTheme,
    syntaxHighlighting(isDark ? darkHighlight : lightHighlight),
  ];
}
