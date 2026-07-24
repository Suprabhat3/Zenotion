import type { Metadata } from "next";
import { Trash2 } from "lucide-react";
import { getCurrentUser } from "@/lib/session";
import { getTrashedNotes } from "@/lib/notes";
import { TrashList } from "@/components/trash-list";

export const metadata: Metadata = {
  title: "Trash",
};

export default async function TrashPage() {
  const user = await getCurrentUser();
  if (!user) return null;

  const notes = await getTrashedNotes(user.id);

  return (
    <div className="flex-1 overflow-y-auto">
      <div className="mx-auto w-full max-w-4xl px-3 py-4 sm:px-6 sm:py-6 lg:px-8">
        <header className="mb-6 space-y-1 sm:mb-8">
          <div className="flex items-center gap-2">
            <Trash2 className="h-5 w-5 text-muted-foreground" />
            <h1 className="text-xl font-semibold tracking-tight sm:text-2xl">
              Trash
            </h1>
            <span className="inline-flex items-center rounded-full border border-border/60 bg-muted/40 px-2.5 py-0.5 text-xs font-medium text-muted-foreground">
              {notes.length}
            </span>
          </div>
          <p className="text-sm text-muted-foreground">
            Deleted notes are kept here until you restore or permanently remove
            them.
          </p>
        </header>

        <TrashList notes={notes} />
      </div>
    </div>
  );
}
