// Extracts a heading outline from raw markdown. Used by the note outline / TOC
// panel. Parsing the raw markdown (rather than the rendered DOM) keeps the
// outline identical across the rich and source editor modes.

export type OutlineHeading = {
  /** Heading level, 1–6. */
  level: number;
  /** Display text with inline markdown formatting stripped. */
  text: string;
  /** Document-order index across all headings (used to target the rendered DOM). */
  index: number;
};

/** Strip common inline markdown so outline entries read as plain text. */
function stripInlineMarkdown(text: string): string {
  return text
    .replace(/`([^`]+)`/g, "$1") // inline code
    .replace(/\*\*([^*]+)\*\*/g, "$1") // bold
    .replace(/\*([^*]+)\*/g, "$1") // italic
    .replace(/__([^_]+)__/g, "$1") // bold
    .replace(/_([^_]+)_/g, "$1") // italic
    .replace(/~~([^~]+)~~/g, "$1") // strikethrough
    .replace(/\[([^\]]+)\]\([^)]*\)/g, "$1") // links → link text
    .replace(/!\[([^\]]*)\]\([^)]*\)/g, "$1") // images → alt text
    .trim();
}

/**
 * Parse ATX headings (`# Heading`) from markdown, skipping fenced code blocks so
 * `#` comments inside code are never mistaken for headings.
 */
export function extractHeadings(markdown: string): OutlineHeading[] {
  const headings: OutlineHeading[] = [];
  const lines = markdown.split("\n");
  let fenceMarker: string | null = null;

  for (const line of lines) {
    const fenceMatch = /^\s*(```+|~~~+)/.exec(line);
    if (fenceMatch) {
      const marker = fenceMatch[1][0].repeat(3);
      if (fenceMarker === null) {
        fenceMarker = marker;
      } else if (marker === fenceMarker) {
        fenceMarker = null;
      }
      continue;
    }
    if (fenceMarker !== null) continue;

    const headingMatch = /^(#{1,6})\s+(.+?)\s*#*\s*$/.exec(line);
    if (!headingMatch) continue;

    const text = stripInlineMarkdown(headingMatch[2]);
    if (!text) continue;

    headings.push({
      level: headingMatch[1].length,
      text,
      index: headings.length,
    });
  }

  return headings;
}
