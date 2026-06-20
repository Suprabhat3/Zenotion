import { LoadingScreen } from "@/components/loading-screen";

export default function TemplatesLoading() {
  return (
    <div className="flex min-h-svh flex-col clay-page-bg">
      <LoadingScreen
        message="Loading templates"
        hint="Bringing in starter structures for your notes."
      />
    </div>
  );
}
