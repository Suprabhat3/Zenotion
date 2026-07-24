"use client";

import {
  NodeViewContent,
  NodeViewWrapper,
  type NodeViewProps,
} from "@tiptap/react";
import { Check, ChevronDown } from "lucide-react";
import {
  CODE_LANGUAGE_OPTIONS,
  formatLanguageLabel,
} from "@/lib/code-languages";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";

/**
 * Rich-editor code block with a language picker in its top-right corner. The
 * picker uses the app's themed dropdown (not a native <select>) so it looks
 * consistent in light and dark mode. Choosing a language writes the node's
 * `language` attribute, which drives both lowlight syntax highlighting and the
 * ```lang fence emitted by the markdown serializer.
 */
export function CodeBlockLanguageSelect({
  node,
  updateAttributes,
}: NodeViewProps) {
  const current = (node.attrs.language as string | null) || "text";

  return (
    <NodeViewWrapper className="code-block-nodeview group relative">
      <div
        contentEditable={false}
        className="absolute right-2 top-2 z-10 opacity-0 transition-opacity focus-within:opacity-100 group-hover:opacity-100"
      >
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              type="button"
              className="flex items-center gap-1 rounded-md border border-white/15 bg-black/50 px-2 py-1 font-mono text-[11px] font-medium text-white/80 backdrop-blur-sm transition-colors hover:bg-black/70 hover:text-white"
              aria-label="Code block language"
            >
              {formatLanguageLabel(current)}
              <ChevronDown className="h-3 w-3" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            align="end"
            className="max-h-72 w-44 overflow-y-auto"
          >
            {CODE_LANGUAGE_OPTIONS.map((option) => (
              <DropdownMenuItem
                key={option.value}
                onClick={() => updateAttributes({ language: option.value })}
                className="justify-between"
              >
                {option.label}
                <Check
                  className={cn(
                    "h-3.5 w-3.5",
                    option.value === current ? "opacity-100" : "opacity-0",
                  )}
                />
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <pre>
        <NodeViewContent<"code"> as="code" />
      </pre>
    </NodeViewWrapper>
  );
}
