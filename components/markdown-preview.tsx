"use client";

import { isValidElement, useMemo, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import { CopyButton } from "@/components/copy-button";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import { markdownSanitizeSchema } from "@/lib/markdown-sanitize";
import { cn } from "@/lib/utils";

type MarkdownPreviewProps = {
  content: string;
  className?: string;
  showCopyAll?: boolean;
  /** Light, copy-free rendering for browser print / Save as PDF. */
  forPrint?: boolean;
};

function extractText(children: ReactNode): string {
  if (typeof children === "string") return children;
  if (Array.isArray(children)) return children.map(extractText).join("");
  if (isValidElement<{ children?: ReactNode }>(children)) {
    return extractText(children.props.children);
  }
  return "";
}

function CodeBlock({
  className,
  children,
  forPrint = false,
}: {
  className?: string;
  children?: ReactNode;
  forPrint?: boolean;
}) {
  const langMatch = /language-([\w-]+)/.exec(className ?? "");
  const language = langMatch?.[1] ?? "text";
  const code = extractText(children).replace(/\n$/, "");

  if (language === "mermaid") {
    return <MermaidDiagram chart={code} forceLightTheme={forPrint} />;
  }

  if (forPrint) {
    return (
      <div className="print-code-block not-prose my-4 overflow-hidden rounded-md border border-[#d0d7de] bg-[#f6f8fa]">
        <div className="flex items-center border-b border-[#d0d7de] bg-[#eef1f4] px-3 py-1.5">
          <span className="font-mono text-[11px] font-medium uppercase tracking-wide text-[#57606a]">
            {language}
          </span>
        </div>
        <pre className="m-0! rounded-none! border-0! bg-transparent! p-0!">
          <code
            className={cn(
              "hljs block overflow-x-auto px-4 py-3 text-[13px] leading-relaxed",
              className,
            )}
          >
            {children}
          </code>
        </pre>
      </div>
    );
  }

  return (
    <div className="code-block-group group relative not-prose my-4 overflow-hidden rounded-lg border border-border bg-[#0d1117]">
      <div className="flex items-center border-b border-white/10 px-3 py-1.5">
        <span className="font-mono text-xs text-white/50">{language}</span>
      </div>
      <div className="absolute right-2 top-2 z-10 opacity-0 transition-opacity duration-150 group-hover:opacity-100">
        <CopyButton
          text={code}
          label="Copy code"
          size="icon"
          className="h-7 w-7 bg-white/10 text-white/80 hover:bg-white/20 hover:text-white"
        />
      </div>
      <pre className="m-0! rounded-none! border-0! bg-transparent! p-0!">
        <code className={cn("hljs block overflow-x-auto p-4 text-sm", className)}>
          {children}
        </code>
      </pre>
    </div>
  );
}

function createMarkdownComponents(forPrint: boolean): Components {
  return {
  table({ children }) {
    return (
      <div className="markdown-table-wrap">
        <table className="markdown-table">{children}</table>
      </div>
    );
  },
  thead({ children }) {
    return <thead className="markdown-table-head">{children}</thead>;
  },
  tbody({ children }) {
    return <tbody className="markdown-table-body">{children}</tbody>;
  },
  tr({ children }) {
    return <tr className="markdown-table-row">{children}</tr>;
  },
  th({ children, style, align }) {
    const textAlign = align as React.CSSProperties["textAlign"] | undefined;
    return (
      <th
        className="markdown-table-th"
        style={{ ...style, ...(textAlign ? { textAlign } : {}) }}
      >
        {children}
      </th>
    );
  },
  td({ children, style, align }) {
    const textAlign = align as React.CSSProperties["textAlign"] | undefined;
    return (
      <td
        className="markdown-table-td"
        style={{ ...style, ...(textAlign ? { textAlign } : {}) }}
      >
        {children}
      </td>
    );
  },
  code({ className, children, ...props }) {
    const text = extractText(children);
    const isBlock =
      Boolean(className?.includes("language-")) || text.includes("\n");

    if (!isBlock) {
      return (
        <code className={cn("markdown-inline-code", className)} {...props}>
          {children}
        </code>
      );
    }

    return (
      <CodeBlock className={className} forPrint={forPrint}>
        {children}
      </CodeBlock>
    );
  },
  pre({ children }) {
    return <>{children}</>;
  },
  a({ href, children }) {
    return (
      <a
        href={href}
        target="_blank"
        rel="noopener noreferrer"
        className="markdown-link"
      >
        {children}
        {forPrint && href ? (
          <span className="print-link-url"> ({href})</span>
        ) : null}
      </a>
    );
  },
  img({ src, alt }) {
    return (
      // eslint-disable-next-line @next/next/no-img-element -- user-authored markdown images
      <img src={src} alt={alt ?? ""} className="markdown-image" loading="lazy" />
    );
  },
};
}

export function MarkdownPreview({
  content,
  className,
  showCopyAll = false,
  forPrint = false,
}: MarkdownPreviewProps) {
  const markdownComponents = useMemo(
    () => createMarkdownComponents(forPrint),
    [forPrint],
  );

  return (
    <div className={cn("prose-note", forPrint && "prose-note-print", className)}>
      {showCopyAll && content.trim() ? (
        <div className="mb-5 flex justify-end">
          <CopyButton text={content} label="Copy all" />
        </div>
      ) : null}
      {content.trim() ? (
        <ReactMarkdown
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[
            rehypeHighlight,
            [rehypeSanitize, markdownSanitizeSchema],
          ]}
          components={markdownComponents}
        >
          {content}
        </ReactMarkdown>
      ) : (
        <p className={forPrint ? "text-[#737373]" : "text-muted-foreground italic"}>
          Nothing to preview yet.
        </p>
      )}
    </div>
  );
}
