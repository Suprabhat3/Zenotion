import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { SiteHeader } from "@/components/site-header";
import { getPublicNoteBySlug } from "@/lib/notes";
import { getCurrentUser } from "@/lib/session";
import { MarkdownPreview } from "@/components/markdown-preview";
import { ShareNoteActions } from "@/components/share-note-actions";
import { CopySharedNoteButton } from "@/components/copy-shared-note-button";

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
  const [note, currentUser] = await Promise.all([
    getPublicNoteBySlug(slug),
    getCurrentUser(),
  ]);

  if (!note) notFound();

  const formattedDate = new Intl.DateTimeFormat("en", {
    month: "long",
    day: "numeric",
    year: "numeric",
  }).format(note.updatedAt);

  return (
    <div className="min-h-svh clay-page-bg">
      <SiteHeader showNavLinks={false} logoHref="/" />
      <article className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 sm:py-10">
        <p className="public-fade-up mb-4 text-xs font-medium text-muted-foreground">
          Shared note
        </p>
        {note.coverImage && (
          <div className="public-fade-up mb-6 overflow-hidden rounded-xl clay-surface">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={note.coverImage}
              alt=""
              className="h-44 w-full object-cover sm:h-56 lg:h-64"
            />
          </div>
        )}
        <div className="public-fade-up mb-6 flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <h1 className="mb-2 text-3xl font-bold tracking-tight sm:text-4xl">
              {note.icon && (
                <span className="mr-2" aria-hidden>
                  {note.icon}
                </span>
              )}
              {note.title}
            </h1>
            <p className="text-sm text-muted-foreground">
              By {note.user.name} · Updated {formattedDate}
            </p>
          </div>
          <div className="flex shrink-0 items-center gap-1.5">
            <CopySharedNoteButton
              shareSlug={slug}
              isLoggedIn={currentUser !== null}
            />
            <ShareNoteActions
              slug={slug}
              title={note.title}
              content={note.content}
            />
          </div>
        </div>
        <div className="public-fade-up public-fade-up-delay-1 overflow-hidden rounded-xl p-4 clay-surface clay-lift-subtle clay-lift sm:p-6 lg:p-8">
          <MarkdownPreview content={note.content} showCopyAll />
        </div>
      </article>
    </div>
  );
}
