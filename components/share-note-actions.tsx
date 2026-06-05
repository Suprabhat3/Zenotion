"use client";

import { CopyButton } from "@/components/copy-button";

type ShareNoteActionsProps = {
  slug: string;
  title: string;
  content: string;
};

export function ShareNoteActions({ slug, title, content }: ShareNoteActionsProps) {
  const plainText = `${title}\n\n${content}`;

  return (
    <div className="flex flex-wrap gap-2">
      <CopyButton
        getText={() => `${window.location.origin}/share/${slug}`}
        label="Copy link"
      />
      <CopyButton text={content} label="Copy markdown" />
      <CopyButton text={plainText} label="Copy as text" />
    </div>
  );
}
