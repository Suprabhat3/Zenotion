import type { Node as ProseMirrorNode } from "@tiptap/pm/model";

/**
 * Invisible marker written into markdown for empty paragraphs so consecutive
 * blank lines survive tiptap-markdown parse/serialize round-trips.
 */
export const BLANK_LINE_MARKER = "\u200b";

/** True when a paragraph is empty or only holds the blank-line marker. */
export function isBlankLineParagraph(node: ProseMirrorNode): boolean {
  if (node.type.name !== "paragraph") return false;
  if (node.content.size === 0) return true;
  return node.textContent === BLANK_LINE_MARKER;
}

/**
 * Markdown collapses runs of 3+ newlines into a single paragraph break. Expand
 * each extra newline into a marker paragraph before loading into the rich editor.
 */
export function encodeMarkdownBlankLines(markdown: string): string {
  return markdown.replace(/\n\n(\n+)/g, (_match, extra: string) => {
    return `\n\n${BLANK_LINE_MARKER}\n\n`.repeat(extra.length);
  });
}
