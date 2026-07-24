import type {
  Completion,
  CompletionContext,
  CompletionResult,
} from "@codemirror/autocomplete";
import type { EditorView } from "@codemirror/view";
import { searchNotesForLink } from "@/lib/note-search-client";
import { noteLinkMarkdown } from "@/lib/wiki-links";

/**
 * CodeMirror completion source for `[[` wiki links in the markdown source
 * editor. Selecting a note replaces the `[[query` token with a markdown link to
 * `/notes/<id>`, matching the rich editor's behavior.
 */
export function createWikiLinkCompletion(getCurrentNoteId: () => string | null) {
  return async (
    context: CompletionContext,
  ): Promise<CompletionResult | null> => {
    // Match the `[[` trigger plus any typed query up to the cursor.
    const match = context.matchBefore(/\[\[[^\]\n]*/);
    if (!match || match.from === match.to) return null;

    const query = match.text.slice(2);
    const notes = await searchNotesForLink(query, getCurrentNoteId());
    if (notes.length === 0) return null;

    const options: Completion[] = notes.map((note) => {
      const insert = noteLinkMarkdown(note.id, note.title);
      return {
        label: note.title || "Untitled",
        type: "text",
        apply: (view: EditorView, _completion: Completion, from: number, to: number) => {
          view.dispatch({
            changes: { from, to, insert },
            selection: { anchor: from + insert.length },
          });
        },
      };
    });

    return {
      from: match.from,
      // Results are already ranked server-side; don't re-filter by label.
      filter: false,
      options,
    };
  };
}
