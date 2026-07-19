export default function DashboardLoading() {
  return (
    <div className="flex min-h-0 flex-1 flex-col gap-4 p-4 sm:p-6" aria-busy="true">
      <div className="flex items-center justify-between gap-3">
        <div className="h-8 w-40 animate-pulse rounded-lg bg-muted" />
        <div className="h-8 w-24 animate-pulse rounded-lg bg-muted" />
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 6 }, (_, index) => (
          <div
            key={index}
            className="h-36 animate-pulse rounded-xl bg-muted/80 clay-surface"
          />
        ))}
      </div>
      <span className="sr-only">Loading your notes</span>
    </div>
  );
}
