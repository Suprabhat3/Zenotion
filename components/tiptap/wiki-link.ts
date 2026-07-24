import {
  Extension,
  ReactRenderer,
  type Editor,
  type Range,
} from "@tiptap/react";
import Suggestion, {
  exitSuggestion,
  type SuggestionProps,
} from "@tiptap/suggestion";
import { PluginKey } from "@tiptap/pm/state";
import type { NoteSearchResult } from "@/lib/types";
import { searchNotesForLink } from "@/lib/note-search-client";
import {
  WikiLinkMenu,
  type WikiLinkMenuHandle,
  type WikiLinkMenuProps,
} from "@/components/tiptap/wiki-link-menu";

export type WikiLinkOptions = {
  /** The note being edited — excluded from its own link suggestions. */
  currentNoteId: string | null;
};

const wikiLinkPluginKey = new PluginKey("wikiLink");

function insertNoteLink(editor: Editor, range: Range, note: NoteSearchResult) {
  const label = note.title || "Untitled";
  editor
    .chain()
    .focus()
    .deleteRange(range)
    .insertContent([
      {
        type: "text",
        text: label,
        marks: [{ type: "link", attrs: { href: `/notes/${note.id}` } }],
      },
      { type: "text", text: " " },
    ])
    .run();
}

/**
 * Typing `[[` opens a note picker; selecting a note inserts a link to it. The
 * link is a standard markdown link to `/notes/<id>`, so it renders natively and
 * feeds the backlink index on save.
 */
export const WikiLink = Extension.create<WikiLinkOptions>({
  name: "wikiLink",

  addOptions() {
    return { currentNoteId: null };
  },

  addProseMirrorPlugins() {
    const currentNoteId = this.options.currentNoteId;

    return [
      Suggestion<NoteSearchResult, NoteSearchResult>({
        pluginKey: wikiLinkPluginKey,
        editor: this.editor,
        char: "[[",
        startOfLine: false,
        items: ({ query }) => searchNotesForLink(query, currentNoteId),
        command: ({ editor, range, props }) => {
          insertNoteLink(editor, range, props);
        },
        allow: ({ state, range }) => {
          const $from = state.doc.resolve(range.from);
          if ($from.parent.type.spec.code) return false;
          return !$from.marks().some((mark) => mark.type.name === "code");
        },
        render: () => {
          let menu: ReactRenderer<WikiLinkMenuHandle, WikiLinkMenuProps> | null =
            null;

          const menuProps = (
            props: SuggestionProps<NoteSearchResult, NoteSearchResult>,
          ): WikiLinkMenuProps => ({
            items: props.items,
            command: props.command,
            clientRect: props.clientRect,
          });

          return {
            onStart: (props) => {
              menu = new ReactRenderer(WikiLinkMenu, {
                editor: props.editor,
                props: menuProps(props),
              });
              document.body.appendChild(menu.element);
            },
            onUpdate: (props) => {
              menu?.updateProps(menuProps(props));
            },
            onKeyDown: ({ view, event }) => {
              if (event.key === "Escape") {
                exitSuggestion(view, wikiLinkPluginKey);
                return true;
              }
              return menu?.ref?.onKeyDown(event) ?? false;
            },
            onExit: () => {
              menu?.element.remove();
              menu?.destroy();
              menu = null;
            },
          };
        },
      }),
    ];
  },
});
