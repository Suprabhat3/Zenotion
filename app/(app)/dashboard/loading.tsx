import { LoadingScreen } from "@/components/loading-screen";

export default function DashboardLoading() {
  return (
    <LoadingScreen
      message="Loading your notes"
      hint="Gathering your folders, tags, and recent notes."
    />
  );
}
