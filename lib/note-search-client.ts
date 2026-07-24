import type { ApiResponse } from "@/lib/api";
import type { NoteSearchResult } from "@/lib/types";

/**
 * Client-side note search for the `[[` wiki-link pickers. Excludes secret notes
 * (their content is ciphertext) and the note currently being edited.
 */
export async function searchNotesForLink(
  query: string,
  currentNoteId: string | null,
  limit = 8,
): Promise<NoteSearchResult[]> {
  try {
    const res = await fetch(`/api/notes/search?q=${encodeURIComponent(query)}`);
    const json = (await res.json()) as ApiResponse<NoteSearchResult[]>;
    if (!json.success) return [];
    return json.data
      .filter((note) => !note.isSecret && note.id !== currentNoteId)
      .slice(0, limit);
  } catch {
    return [];
  }
}
