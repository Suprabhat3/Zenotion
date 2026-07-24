// Wiki links are stored as ordinary markdown links to an internal note path:
// `[Title](/notes/<id>)`. This keeps them valid markdown (rendered natively,
// exported cleanly) while remaining machine-extractable for the backlink index.

const NOTE_LINK_PATTERN = /\]\(\/notes\/([A-Za-z0-9_-]+)\)/g;

/** Build the markdown for a wiki link to a note. */
export function noteLinkMarkdown(noteId: string, title: string): string {
  const label = title.trim() || "Untitled";
  return `[${label}](/notes/${noteId})`;
}

/**
 * Extract the unique set of note ids that a piece of markdown links to via the
 * internal `/notes/<id>` path. Order-preserving, de-duplicated.
 */
export function extractNoteLinkTargets(content: string): string[] {
  const targets = new Set<string>();
  for (const match of content.matchAll(NOTE_LINK_PATTERN)) {
    targets.add(match[1]);
  }
  return [...targets];
}
