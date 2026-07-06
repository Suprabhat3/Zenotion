"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import type { ViewUpdate } from "@codemirror/view";
import { EditorView } from "@codemirror/view";
import type { EditorSelection } from "@/lib/types";
import { getCodeMirrorTheme } from "@/lib/codemirror-theme";
import {
  getImageFiles,
  markdownImage,
  uploadNoteImageWithToast,
} from "@/lib/upload-image";
import { cn } from "@/lib/utils";

type MarkdownCodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
  onSelectionChange?: (
    selection: EditorSelection | null,
    rect: DOMRect | null,
  ) => void;
  replaceSelectionRef?: React.RefObject<((text: string) => void) | null>;
};

function subscribeToDarkMode(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["class"],
  });
  return () => observer.disconnect();
}

function getDarkModeSnapshot() {
  return document.documentElement.classList.contains("dark");
}

function getDarkModeServerSnapshot() {
  return false;
}

/**
 * Upload pasted/dropped images to ImageKit and insert `![alt](url)` markdown
 * at the paste cursor (or drop position) once each upload finishes.
 */
function insertMarkdownImages(view: EditorView, files: File[], dropPos?: number) {
  for (const file of files) {
    void uploadNoteImageWithToast(file).then((uploaded) => {
      if (!uploaded) return;
      const snippet = markdownImage(uploaded);
      try {
        const at = Math.min(
          dropPos ?? view.state.selection.main.head,
          view.state.doc.length,
        );
        view.dispatch({
          changes: { from: at, insert: snippet },
          selection: { anchor: at + snippet.length },
        });
      } catch {
        // The editor was unmounted while the upload was in flight.
      }
    });
  }
}

const imagePasteDropHandlers = EditorView.domEventHandlers({
  paste(event, view) {
    const files = getImageFiles(event.clipboardData);
    if (files.length === 0) return false;
    event.preventDefault();
    insertMarkdownImages(view, files);
    return true;
  },
  drop(event, view) {
    const files = getImageFiles(event.dataTransfer);
    if (files.length === 0) return false;
    event.preventDefault();
    const pos = view.posAtCoords({ x: event.clientX, y: event.clientY });
    insertMarkdownImages(view, files, pos ?? undefined);
    return true;
  },
});

function reportSelection(
  view: EditorView,
  onSelectionChange?: (
    selection: EditorSelection | null,
    rect: DOMRect | null,
  ) => void,
) {
  if (!onSelectionChange) return;

  const { from, to } = view.state.selection.main;
  if (from === to || !view.hasFocus) {
    onSelectionChange(null, null);
    return;
  }

  const text = view.state.sliceDoc(from, to);
  if (!text.trim()) {
    onSelectionChange(null, null);
    return;
  }

  const start = view.coordsAtPos(from);
  const end = view.coordsAtPos(to);
  if (!start || !end) {
    onSelectionChange({ from, to, text }, null);
    return;
  }

  const rect = new DOMRect(
    Math.min(start.left, end.left),
    Math.min(start.top, end.top),
    Math.abs(end.right - start.left),
    Math.max(end.bottom - start.top, 20),
  );
  onSelectionChange({ from, to, text }, rect);
}

export function MarkdownCodeEditor({
  value,
  onChange,
  className,
  placeholder = "Write markdown here…",
  onSelectionChange,
  replaceSelectionRef,
}: MarkdownCodeEditorProps) {
  const isDark = useSyncExternalStore(
    subscribeToDarkMode,
    getDarkModeSnapshot,
    getDarkModeServerSnapshot,
  );

  const handleCreateEditor = useCallback(
    (view: EditorView) => {
      if (!replaceSelectionRef) return;

      replaceSelectionRef.current = (text: string) => {
        const { from, to } = view.state.selection.main;
        if (from === to) return;
        view.dispatch({
          changes: { from, to, insert: text },
          selection: { anchor: from + text.length },
        });
        onChange(view.state.doc.toString());
      };
    },
    [onChange, replaceSelectionRef],
  );

  const handleUpdate = useCallback(
    (update: ViewUpdate) => {
      if (!onSelectionChange) return;
      if (update.selectionSet || update.focusChanged) {
        reportSelection(update.view, onSelectionChange);
      }
    },
    [onSelectionChange],
  );

  const extensions = useMemo(
    () => [
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      EditorView.lineWrapping,
      imagePasteDropHandlers,
      ...getCodeMirrorTheme(isDark),
    ],
    [isDark],
  );

  return (
    <div className={cn("markdown-cm-editor h-full min-h-0", className)}>
      <CodeMirror
        value={value}
        onChange={onChange}
        extensions={extensions}
        onCreateEditor={handleCreateEditor}
        onUpdate={handleUpdate}
        placeholder={placeholder}
        basicSetup={{
          lineNumbers: true,
          foldGutter: true,
          highlightActiveLine: true,
          bracketMatching: true,
          closeBrackets: true,
          autocompletion: false,
        }}
        className="h-full [&_.cm-editor]:h-full [&_.cm-editor]:bg-background [&_.cm-editor]:outline-none [&_.cm-scroller]:min-h-full"
      />
    </div>
  );
}
