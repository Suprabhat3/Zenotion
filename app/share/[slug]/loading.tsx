import { LoadingScreen } from "@/components/loading-screen";

export default function ShareLoading() {
  return (
    <div className="flex min-h-svh flex-col clay-page-bg">
      <LoadingScreen
        message="Opening shared note"
        hint="Fetching the latest published version."
      />
    </div>
  );
}
