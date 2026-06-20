import { LoadingScreen } from "@/components/loading-screen";

export default function NoteLoading() {
  return (
    <LoadingScreen
      message="Opening your note"
      hint="Fetching the latest content and edits."
    />
  );
}
