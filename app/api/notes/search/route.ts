import type { NextRequest } from "next/server";
import { ok, handleApiError } from "@/lib/api";
import { searchUserNotes } from "@/lib/notes";
import { requireUser } from "@/lib/session";
import { parseOrThrow, searchNotesSchema } from "@/lib/validators";
import type { NoteSearchResult } from "@/lib/types";

/** Strip markdown syntax so result excerpts read as plain text. */
function stripMarkdown(content: string): string {
  return content
    .replace(/```[\s\S]*?```/g, " ") // fenced code blocks
    .replace(/^#{1,6}\s+/gm, "") // heading markers
    .replace(/^[\s]*[-*+]\s+(\[[ xX]\]\s*)?/gm, "") // list/task markers
    .replace(/^>\s+/gm, "") // blockquote markers
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, "$1") // links and images → label
    .replace(/[*_~`]+/g, ""); // emphasis and inline-code marks
}

function buildExcerpt(content: string, query: string, max = 90): string {
  const flat = stripMarkdown(content).replace(/\s+/g, " ").trim();
  if (!flat) return "";

  const trimmedQuery = query.trim();
  if (trimmedQuery) {
    const index = flat.toLowerCase().indexOf(trimmedQuery.toLowerCase());
    if (index > 20) {
      const slice = flat.slice(index - 20, index - 20 + max);
      return `…${slice}${index - 20 + max < flat.length ? "…" : ""}`;
    }
  }

  return flat.length > max ? `${flat.slice(0, max)}…` : flat;
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireUser();
    const { q } = parseOrThrow(searchNotesSchema, {
      q: request.nextUrl.searchParams.get("q") ?? "",
    });

    const notes = await searchUserNotes(user.id, q);

    const results: NoteSearchResult[] = notes.map((note) => ({
      id: note.id,
      title: note.title,
      // A secret note's content is ciphertext — never surface it as an excerpt.
      excerpt: note.isSecret ? "🔒 Encrypted note" : buildExcerpt(note.content, q),
      isFavorite: note.isFavorite,
      isSecret: note.isSecret,
      folderName: note.folder?.name ?? null,
      updatedAt: note.updatedAt.toISOString(),
    }));

    return ok(results);
  } catch (error) {
    return handleApiError(error);
  }
}
