"use client";

import { useCallback, useEffect } from "react";
import { useEditor, EditorContent, type Editor } from "@tiptap/react";
import type { EditorView } from "@tiptap/pm/view";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import Image from "@tiptap/extension-image";
import { TableKit } from "@tiptap/extension-table";
import {
  getImageFiles,
  imageAltText,
  uploadNoteImageWithToast,
} from "@/lib/upload-image";
import { Markdown } from "tiptap-markdown";
import { common, createLowlight } from "lowlight";
import { PreserveBlankLinesParagraph } from "@/components/tiptap/preserve-blank-lines-paragraph";
import { SlashCommand } from "@/components/tiptap/slash-command";
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
  // Upload pasted/dropped image files to ImageKit, then insert each image
  // node at the drop position (or the current selection for pastes).
  const insertUploadedImages = useCallback(
    (view: EditorView, files: File[], dropPos?: number) => {
      for (const file of files) {
        void uploadNoteImageWithToast(file).then((uploaded) => {
          if (!uploaded || view.isDestroyed) return;
          const imageType = view.state.schema.nodes.image;
          if (!imageType) return;
          const node = imageType.create({
            src: uploaded.url,
            alt: imageAltText(uploaded.fileName),
          });
          const tr =
            dropPos !== undefined
              ? view.state.tr.insert(
                  Math.min(dropPos, view.state.doc.content.size),
                  node,
                )
              : view.state.tr.replaceSelectionWith(node);
          view.dispatch(tr.scrollIntoView());
        });
      }
    },
    [],
  );

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
      SlashCommand,
      Placeholder.configure({
        placeholder: "Start writing, or press / for commands…",
      }),
      Link.configure({ openOnClick: false, autolink: true }),
      Underline,
      TaskList,
      TaskItem.configure({ nested: true }),
      CodeBlockLowlight.configure({ lowlight }),
      Image.configure({ inline: false, allowBase64: false }),
      TableKit.configure({
        table: { resizable: true },
      }),
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
      // Ctrl/Cmd+V with an image (e.g. a screenshot) uploads it in place.
      handlePaste: (view, event) => {
        const files = getImageFiles(event.clipboardData);
        if (files.length === 0) return false;
        event.preventDefault();
        insertUploadedImages(view, files);
        return true;
      },
      // Drag-and-drop image files from the OS into the note.
      handleDrop: (view, event, _slice, moved) => {
        if (moved) return false;
        const files = getImageFiles(event.dataTransfer);
        if (files.length === 0) return false;
        event.preventDefault();
        const coords = view.posAtCoords({
          left: event.clientX,
          top: event.clientY,
        });
        insertUploadedImages(view, files, coords?.pos);
        return true;
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
