"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Placeholder from "@tiptap/extension-placeholder";
import Link from "@tiptap/extension-link";
import Underline from "@tiptap/extension-underline";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { Markdown } from "tiptap-markdown";
import { common, createLowlight } from "lowlight";
import { RichEditorToolbar } from "@/components/rich-editor-toolbar";
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
};

export function RichTextEditor({
  content,
  onChange,
  className,
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
      }),
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
    content,
    editorProps: {
      attributes: {
        class: "rich-editor-content outline-none min-h-[60vh] px-2 py-4",
      },
    },
    onUpdate: ({ editor: ed }) => {
      onChange(getEditorMarkdown(ed));
    },
  });

  if (!editor) return null;

  return (
    <div className={cn("flex h-full flex-col", className)}>
      <RichEditorToolbar editor={editor} />
      <div className="min-h-0 flex-1 overflow-y-auto">
        <EditorContent editor={editor} className="h-full" />
      </div>
    </div>
  );
}
