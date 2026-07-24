"use client";

import { isValidElement, useMemo, type ReactNode } from "react";
import ReactMarkdown, { type Components } from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeHighlight from "rehype-highlight";
import rehypeSanitize from "rehype-sanitize";
import { CopyButton } from "@/components/copy-button";
import { MermaidDiagram } from "@/components/mermaid-diagram";
import { formatLanguageLabel } from "@/lib/code-languages";
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
  const languageLabel = formatLanguageLabel(language);
  const code = extractText(children).replace(/\n$/, "");

  if (language === "mermaid") {
    return <MermaidDiagram chart={code} forceLightTheme={forPrint} />;
  }

  if (forPrint) {
    return (
      <div className="print-code-block print-avoid-break not-prose my-4 overflow-hidden rounded-md border border-[#30363d] bg-[#0d1117]">
        <p className="print-code-block-label">{languageLabel}</p>
        <pre className="print-code-block-pre m-0! overflow-x-auto rounded-none! border-0! bg-transparent!">
          <code
            className={cn(
              "hljs block text-[13px] leading-relaxed",
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
    <div className="code-block-group group relative not-prose my-4 overflow-hidden rounded-md border border-border bg-[#0d1117]">
      <div className="flex items-center justify-between gap-2 px-4 py-2">
        <span className="font-mono text-[11px] font-medium tracking-wide text-white/55">
          {languageLabel}
        </span>
        <CopyButton
          text={code}
          label="Copy code"
          size="icon"
          className="h-7 w-7 border-0 bg-transparent text-white/45 opacity-0 shadow-none transition-opacity duration-150 hover:bg-white/10 hover:text-white group-hover:opacity-100 focus-visible:opacity-100"
        />
      </div>
      <pre className="code-block-pre m-0! overflow-x-auto rounded-none! border-0! bg-transparent! px-4 pb-4 pt-0!">
        <code
          className={cn(
            "hljs block text-[13px] leading-relaxed",
            className,
          )}
        >
          {children}
        </code>
      </pre>
    </div>
  );
}

function createMarkdownComponents(forPrint: boolean): Components {
  const headingClass = forPrint ? "print-heading" : undefined;

  return {
  h1({ children }) {
    return <h1 className={headingClass}>{children}</h1>;
  },
  h2({ children }) {
    return <h2 className={headingClass}>{children}</h2>;
  },
  h3({ children }) {
    return <h3 className={headingClass}>{children}</h3>;
  },
  h4({ children }) {
    return <h4 className={headingClass}>{children}</h4>;
  },
  h5({ children }) {
    return <h5 className={headingClass}>{children}</h5>;
  },
  h6({ children }) {
    return <h6 className={headingClass}>{children}</h6>;
  },
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
    // Internal note (wiki) links stay same-tab so the app's soft-nav guard
    // handles them; external links open in a new tab.
    const isInternal = typeof href === "string" && href.startsWith("/notes/");

    if (isInternal && !forPrint) {
      return (
        <a href={href} className="markdown-link markdown-wiki-link">
          {children}
        </a>
      );
    }

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
      <img
        src={src}
        alt={alt ?? ""}
        className={cn("markdown-image", forPrint && "print-avoid-break")}
        loading="lazy"
      />
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
