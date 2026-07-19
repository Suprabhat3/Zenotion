export default function NoteLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col overflow-hidden" aria-busy="true">
      <div className="flex items-center justify-between gap-3 border-b px-4 py-3 sm:px-6">
        <div className="h-9 w-36 animate-pulse rounded-lg bg-muted" />
        <div className="flex gap-2">
          <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
          <div className="h-8 w-16 animate-pulse rounded-md bg-muted" />
          <div className="h-8 w-8 animate-pulse rounded-md bg-muted" />
        </div>
      </div>
      <div className="mx-auto w-full max-w-6xl flex-1 space-y-4 px-4 py-6 sm:px-6">
        <div className="h-10 w-2/3 max-w-md animate-pulse rounded-lg bg-muted" />
        <div className="space-y-2">
          <div className="h-4 w-full animate-pulse rounded bg-muted/80" />
          <div className="h-4 w-11/12 animate-pulse rounded bg-muted/80" />
          <div className="h-4 w-4/5 animate-pulse rounded bg-muted/80" />
          <div className="h-4 w-full animate-pulse rounded bg-muted/80" />
          <div className="h-4 w-3/5 animate-pulse rounded bg-muted/80" />
        </div>
      </div>
      <span className="sr-only">Opening your note</span>
    </div>
  );
}
