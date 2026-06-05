import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { getPublicNoteBySlug } from "@/lib/notes";
import { MarkdownPreview } from "@/components/markdown-preview";

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
        <h1 className="mb-2 text-3xl font-bold">{note.title}</h1>
        <p className="mb-8 text-sm text-muted-foreground">
          By {note.user.name} · Updated {formattedDate}
        </p>
        <div className="clay-surface rounded-lg p-6">
          <MarkdownPreview content={note.content} />
        </div>
      </article>
    </div>
  );
}
