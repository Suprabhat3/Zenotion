import type { ComponentType } from "react";
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
import {
  Code,
  Heading1,
  Heading2,
  Heading3,
  Image as ImageIcon,
  List,
  ListOrdered,
  ListTodo,
  Minus,
  Quote,
  Sparkles,
  Table as TableIcon,
  Type,
} from "lucide-react";
import { openAiPalette } from "@/components/ai-command-palette";
import {
  imageAltText,
  pickImageFile,
  uploadNoteImageWithToast,
} from "@/lib/upload-image";
import {
  SlashCommandMenu,
  type SlashCommandMenuHandle,
  type SlashCommandMenuProps,
} from "@/components/tiptap/slash-command-menu";

export type SlashCommandItem = {
  title: string;
  description: string;
  icon: ComponentType<{ className?: string }>;
  group: string;
  /** Extra search aliases, e.g. "h1" or "todo". */
  keywords: string[];
  command: (props: { editor: Editor; range: Range }) => void;
};

export const SLASH_COMMAND_ITEMS: SlashCommandItem[] = [
  {
    title: "Ask AI",
    description: "Summarize, rewrite, translate…",
    icon: Sparkles,
    group: "AI",
    keywords: ["ai", "ask", "assistant", "ideas", "magic"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      openAiPalette();
    },
  },
  {
    title: "Text",
    description: "Plain paragraph text",
    icon: Type,
    group: "Basic blocks",
    keywords: ["text", "paragraph", "plain", "p"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setParagraph().run();
    },
  },
  {
    title: "Heading 1",
    description: "Large section heading",
    icon: Heading1,
    group: "Basic blocks",
    keywords: ["h1", "heading", "title", "large"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 1 }).run();
    },
  },
  {
    title: "Heading 2",
    description: "Medium section heading",
    icon: Heading2,
    group: "Basic blocks",
    keywords: ["h2", "heading", "subtitle", "medium"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 2 }).run();
    },
  },
  {
    title: "Heading 3",
    description: "Small section heading",
    icon: Heading3,
    group: "Basic blocks",
    keywords: ["h3", "heading", "small"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHeading({ level: 3 }).run();
    },
  },
  {
    title: "Bullet list",
    description: "Simple unordered list",
    icon: List,
    group: "Lists",
    keywords: ["ul", "unordered", "bullet", "list", "-"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBulletList().run();
    },
  },
  {
    title: "Numbered list",
    description: "Ordered list with numbers",
    icon: ListOrdered,
    group: "Lists",
    keywords: ["ol", "ordered", "numbered", "list", "1."],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleOrderedList().run();
    },
  },
  {
    title: "Task list",
    description: "Checklist with checkboxes",
    icon: ListTodo,
    group: "Lists",
    keywords: ["todo", "task", "checkbox", "checklist", "check"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleTaskList().run();
    },
  },
  {
    title: "Quote",
    description: "Capture a quote or callout",
    icon: Quote,
    group: "Blocks",
    keywords: ["quote", "blockquote", "citation", ">"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleBlockquote().run();
    },
  },
  {
    title: "Code block",
    description: "Snippet with syntax highlighting",
    icon: Code,
    group: "Blocks",
    keywords: ["code", "codeblock", "snippet", "pre", "```"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).toggleCodeBlock().run();
    },
  },
  {
    title: "Image",
    description: "Upload an image (max 5 MB)",
    icon: ImageIcon,
    group: "Blocks",
    keywords: ["image", "img", "picture", "photo", "upload", "screenshot"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).run();
      void pickImageFile().then(async (file) => {
        if (!file) return;
        const uploaded = await uploadNoteImageWithToast(file);
        if (!uploaded || editor.isDestroyed) return;
        editor
          .chain()
          .focus()
          .setImage({
            src: uploaded.url,
            alt: imageAltText(uploaded.fileName),
          })
          .run();
      });
    },
  },
  {
    title: "Table",
    description: "Insert a table with rows and columns",
    icon: TableIcon,
    group: "Blocks",
    keywords: ["table", "grid", "rows", "columns"],
    command: ({ editor, range }) => {
      editor
        .chain()
        .focus()
        .deleteRange(range)
        .insertTable({ rows: 3, cols: 3, withHeaderRow: true })
        .run();
    },
  },
  {
    title: "Divider",
    description: "Horizontal rule to separate sections",
    icon: Minus,
    group: "Blocks",
    keywords: ["hr", "divider", "rule", "line", "separator", "---"],
    command: ({ editor, range }) => {
      editor.chain().focus().deleteRange(range).setHorizontalRule().run();
    },
  },
];

export function filterSlashCommandItems(query: string): SlashCommandItem[] {
  const normalized = query.toLowerCase().trim();
  if (!normalized) return SLASH_COMMAND_ITEMS;
  return SLASH_COMMAND_ITEMS.filter(
    (item) =>
      item.title.toLowerCase().includes(normalized) ||
      item.keywords.some((keyword) => keyword.startsWith(normalized)),
  );
}

const slashCommandPluginKey = new PluginKey("slashCommand");

/**
 * Notion-style slash commands: typing "/" opens a floating menu of block
 * types, filtered as the user keeps typing (e.g. "/h1", "/todo").
 */
export const SlashCommand = Extension.create({
  name: "slashCommand",

  addProseMirrorPlugins() {
    return [
      Suggestion<SlashCommandItem, SlashCommandItem>({
        pluginKey: slashCommandPluginKey,
        editor: this.editor,
        char: "/",
        items: ({ query }) => filterSlashCommandItems(query),
        command: ({ editor, range, props }) => {
          props.command({ editor, range });
        },
        allow: ({ state, range }) => {
          // No slash menu inside code blocks or inline code.
          const $from = state.doc.resolve(range.from);
          if ($from.parent.type.spec.code) return false;
          return !$from.marks().some((mark) => mark.type.name === "code");
        },
        render: () => {
          let menu: ReactRenderer<
            SlashCommandMenuHandle,
            SlashCommandMenuProps
          > | null = null;

          const menuProps = (
            props: SuggestionProps<SlashCommandItem, SlashCommandItem>,
          ): SlashCommandMenuProps => ({
            items: props.items,
            command: props.command,
            clientRect: props.clientRect,
          });

          return {
            onStart: (props) => {
              menu = new ReactRenderer(SlashCommandMenu, {
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
                // Close the menu but keep the typed "/" text, like Notion.
                exitSuggestion(view, slashCommandPluginKey);
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
