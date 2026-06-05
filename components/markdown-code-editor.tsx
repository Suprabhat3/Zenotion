"use client";

import { useMemo, useSyncExternalStore } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { markdown, markdownLanguage } from "@codemirror/lang-markdown";
import { languages } from "@codemirror/language-data";
import { EditorView } from "@codemirror/view";
import { getCodeMirrorTheme } from "@/lib/codemirror-theme";
import { cn } from "@/lib/utils";

type MarkdownCodeEditorProps = {
  value: string;
  onChange: (value: string) => void;
  className?: string;
  placeholder?: string;
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

export function MarkdownCodeEditor({
  value,
  onChange,
  className,
  placeholder = "Write markdown here…",
}: MarkdownCodeEditorProps) {
  const isDark = useSyncExternalStore(
    subscribeToDarkMode,
    getDarkModeSnapshot,
    getDarkModeServerSnapshot,
  );

  const extensions = useMemo(
    () => [
      markdown({ base: markdownLanguage, codeLanguages: languages }),
      EditorView.lineWrapping,
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
