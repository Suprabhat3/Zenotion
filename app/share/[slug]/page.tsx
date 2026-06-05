import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicNoteBySlug } from "@/lib/notes";
import { MarkdownPreview } from "@/components/markdown-preview";
import { ShareNoteActions } from "@/components/share-note-actions";

type PageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  const note = await getPublicNoteBySlug(slug);
  return {
    title: note ? `${note.title} (shared)` : "Shared note",
    description: note
      ? `A shared note by ${note.user.name}`
      : "This shared note is not available.",
  };
}

export default async function SharePage({ params }: PageProps) {
  const { slug } = await params;
  const note = await getPublicNoteBySlug(slug);

  if (!note) notFound();

  const formattedDate = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(note.updatedAt);

  return (
    <div className="min-h-svh bg-background">
      <header className="border-b px-6 py-4">
        <div className="mx-auto flex max-w-3xl items-center justify-between">
          <Link href="/" className="text-sm font-semibold">
            Zenotion
          </Link>
          <span className="text-xs text-muted-foreground">Shared note</span>
        </div>
      </header>
      <article className="mx-auto max-w-3xl px-6 py-10">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <h1 className="mb-2 text-3xl font-bold">{note.title}</h1>
            <p className="text-sm text-muted-foreground">
              By {note.user.name} · Updated {formattedDate}
            </p>
          </div>
          <ShareNoteActions
            slug={slug}
            title={note.title}
            content={note.content}
          />
        </div>
        <div className="clay-surface rounded-lg p-6 sm:p-8">
          <MarkdownPreview content={note.content} showCopyAll />
        </div>
      </article>
    </div>
  );
}
