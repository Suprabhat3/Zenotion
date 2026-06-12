import { HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { EditorView } from "@codemirror/view";
import { tags as t } from "@lezer/highlight";

// Markdown structure + full code-token coverage so fenced code blocks
// (` ```ts `, ` ```py `, …) are highlighted like a real code editor.
// Palettes follow GitHub light/dark so they read well next to the
// highlight.js theme used in the preview pane.

const lightHighlight = HighlightStyle.define([
  // Markdown structure
  { tag: t.heading, fontWeight: "700", color: "#111827" },
  { tag: t.heading1, fontSize: "1.25em", color: "#111827" },
  { tag: t.heading2, fontSize: "1.15em", color: "#1f2937" },
  { tag: t.heading3, fontSize: "1.05em", color: "#374151" },
  { tag: t.strong, fontWeight: "700", color: "#111827" },
  { tag: t.emphasis, fontStyle: "italic", color: "#4b5563" },
  { tag: t.strikethrough, textDecoration: "line-through", color: "#6b7280" },
  { tag: t.link, color: "#2563eb", textDecoration: "underline" },
  { tag: t.url, color: "#2563eb" },
  { tag: t.monospace, color: "#9333ea", fontFamily: "var(--font-mono), monospace" },
  { tag: t.quote, color: "#6b7280", fontStyle: "italic" },
  { tag: t.contentSeparator, color: "#9ca3af" },
  // Markdown syntax marks (#, *, >, ```), kept muted so prose stays readable
  { tag: t.processingInstruction, color: "#9ca3af" },
  { tag: t.meta, color: "#9ca3af" },
  { tag: t.content, color: "#1f1f1f" },
  // Code tokens (GitHub light)
  { tag: t.comment, color: "#6e7781", fontStyle: "italic" },
  { tag: [t.keyword, t.moduleKeyword, t.operatorKeyword], color: "#cf222e" },
  { tag: [t.string, t.special(t.string), t.character], color: "#0a3069" },
  { tag: [t.number, t.integer, t.float], color: "#0550ae" },
  { tag: [t.bool, t.atom, t.null], color: "#0550ae" },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.macroName], color: "#8250df" },
  { tag: [t.typeName, t.className, t.namespace], color: "#953800" },
  { tag: [t.propertyName, t.attributeName], color: "#0550ae" },
  { tag: [t.variableName, t.definition(t.variableName)], color: "#24292f" },
  { tag: [t.operator, t.compareOperator, t.logicOperator, t.arithmeticOperator], color: "#cf222e" },
  { tag: [t.tagName, t.angleBracket], color: "#116329" },
  { tag: [t.regexp, t.escape], color: "#116329" },
  { tag: [t.labelName, t.constant(t.variableName)], color: "#0550ae" },
  { tag: t.deleted, color: "#cf222e", backgroundColor: "#ffebe9" },
  { tag: t.inserted, color: "#116329", backgroundColor: "#dafbe1" },
  { tag: t.invalid, color: "#cf222e" },
]);

const darkHighlight = HighlightStyle.define([
  // Markdown structure
  { tag: t.heading, fontWeight: "700", color: "#f9fafb" },
  { tag: t.heading1, fontSize: "1.25em", color: "#ffffff" },
  { tag: t.heading2, fontSize: "1.15em", color: "#f3f4f6" },
  { tag: t.heading3, fontSize: "1.05em", color: "#e5e7eb" },
  { tag: t.strong, fontWeight: "700", color: "#f9fafb" },
  { tag: t.emphasis, fontStyle: "italic", color: "#d1d5db" },
  { tag: t.strikethrough, textDecoration: "line-through", color: "#9ca3af" },
  { tag: t.link, color: "#60a5fa", textDecoration: "underline" },
  { tag: t.url, color: "#60a5fa" },
  { tag: t.monospace, color: "#e879f9", fontFamily: "var(--font-mono), monospace" },
  { tag: t.quote, color: "#9ca3af", fontStyle: "italic" },
  { tag: t.contentSeparator, color: "#6b7280" },
  { tag: t.processingInstruction, color: "#6b7280" },
  { tag: t.meta, color: "#6b7280" },
  { tag: t.content, color: "#ededed" },
  // Code tokens (GitHub dark)
  { tag: t.comment, color: "#8b949e", fontStyle: "italic" },
  { tag: [t.keyword, t.moduleKeyword, t.operatorKeyword], color: "#ff7b72" },
  { tag: [t.string, t.special(t.string), t.character], color: "#a5d6ff" },
  { tag: [t.number, t.integer, t.float], color: "#79c0ff" },
  { tag: [t.bool, t.atom, t.null], color: "#79c0ff" },
  { tag: [t.function(t.variableName), t.function(t.propertyName), t.macroName], color: "#d2a8ff" },
  { tag: [t.typeName, t.className, t.namespace], color: "#ffa657" },
  { tag: [t.propertyName, t.attributeName], color: "#79c0ff" },
  { tag: [t.variableName, t.definition(t.variableName)], color: "#c9d1d9" },
  { tag: [t.operator, t.compareOperator, t.logicOperator, t.arithmeticOperator], color: "#ff7b72" },
  { tag: [t.tagName, t.angleBracket], color: "#7ee787" },
  { tag: [t.regexp, t.escape], color: "#7ee787" },
  { tag: [t.labelName, t.constant(t.variableName)], color: "#79c0ff" },
  { tag: t.deleted, color: "#ffa198", backgroundColor: "rgba(248, 81, 73, 0.15)" },
  { tag: t.inserted, color: "#7ee787", backgroundColor: "rgba(63, 185, 80, 0.15)" },
  { tag: t.invalid, color: "#ffa198" },
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
