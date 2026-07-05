"use client";

import { useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Markdown } from "tiptap-markdown";
import { common, createLowlight } from "lowlight";
import { PreserveBlankLinesParagraph } from "@/components/tiptap/preserve-blank-lines-paragraph";
import { RichEditorToolbar } from "@/components/rich-editor-toolbar";
import type { EditorSelection } from "@/lib/types";
import { encodeMarkdownBlankLines } from "@/lib/markdown-blank-lines";
import { cn } from "@/lib/utils";

const lowlight = createLowlight(common);

function getEditorMarkdown(editor: ReturnType<typeof useEditor>): string {
  if (!editor) return "";
  const storage = editor.storage as {
    markdown?: { getMarkdown: () => string };
  };
  return storage.markdown?.getMarkdown() ?? "";
}

type RichTextEditorProps = {
  content: string;
  onChange: (markdown: string) => void;
  className?: string;
  /** When true, the parent renders the formatting toolbar (e.g. fixed above the scroll area). */
  hideToolbar?: boolean;
  onEditorReady?: (editor: Editor) => void;
  onSelectionChange?: (
    selection: EditorSelection | null,
    rect: DOMRect | null,
  ) => void;
  replaceSelectionRef?: React.RefObject<((text: string) => void) | null>;
};

export function RichTextEditor({
  content,
  onChange,
  className,
  hideToolbar = false,
  onEditorReady,
  onSelectionChange,
  replaceSelectionRef,
}: RichTextEditorProps) {
  const editor = useEditor({
    immediatelyRender: false,
    // The editor is remounted (new `key`) when AI results or mode switches
    // replace the content — focus the end so the user can keep typing.
    autofocus: "end",
    extensions: [
      StarterKit.configure({
        codeBlock: false,
        heading: { levels: [1, 2, 3] },
        paragraph: false,
      }),
      PreserveBlankLinesParagraph,
      Placeholder.configure({
        placeholder: "Start writing, or press / for ideas…",
      }),
      Link.configure({ openOnClick: false, autolink: true }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlockLowlight.configure({ lowlight }),
      Markdown.configure({
        html: false,
        transformPastedText: true,
        transformCopiedText: true,
      }),
    ],
    content: encodeMarkdownBlankLines(content),
    editorProps: {
      attributes: {
        class: "rich-editor-content outline-none px-2 py-4",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(getEditorMarkdown(ed));
    },
    onSelectionUpdate: ({ editor: ed }) => {
      if (!onSelectionChange) return;

      const { from, to } = ed.state.selection;
      if (from === to || !ed.view.hasFocus()) {
        onSelectionChange(null, null);
        return;
      }

      const text = ed.state.doc.textBetween(from, to, "\n");
      if (!text.trim()) {
        onSelectionChange(null, null);
        return;
      }

      const start = ed.view.coordsAtPos(from);
      const end = ed.view.coordsAtPos(to);
      const rect = new DOMRect(
        Math.min(start.left, end.left),
        Math.min(start.top, end.top),
        Math.abs(end.right - start.left),
        Math.max(end.bottom - start.top, 20),
      );
      onSelectionChange({ from, to, text }, rect);
    },
  });

  useEffect(() => {
    if (!editor || !onEditorReady) return;
    onEditorReady(editor);
  }, [editor, onEditorReady]);

  useEffect(() => {
    if (!replaceSelectionRef) return;

    replaceSelectionRef.current = (text: string) => {
      if (!editor) return;
      const { from, to } = editor.state.selection;
      if (from === to) return;
      editor
        .chain()
        .focus()
        .insertContentAt({ from, to }, text)
        .run();
      onChange(getEditorMarkdown(editor));
    };
  }, [editor, onChange, replaceSelectionRef]);

  if (!editor) return null;

  if (hideToolbar) {
    return (
      <EditorContent
        editor={editor}
        className={cn("rich-editor-document", className)}
      />
    );
  }

  return (
    <div className={cn("flex min-h-0 flex-1 flex-col overflow-hidden", className)}>
      <RichEditorToolbar editor={editor} />
      <div className="note-editor-body min-h-0 flex-1">
        <EditorContent editor={editor} className="rich-editor-document" />
      </div>
    </div>
  );
}
