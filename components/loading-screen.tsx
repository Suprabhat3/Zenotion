import Image from "next/image";
import logo from "@/public/android-chrome-512x512.png";
import { cn } from "@/lib/utils";

type LoadingScreenProps = {
  message?: string;
  hint?: string;
  className?: string;
};

export function LoadingScreen({
  message = "Loading your workspace",
  hint = "Just a moment while we get things ready.",
  className,
}: LoadingScreenProps) {
  return (
    <div
      role="status"
      aria-live="polite"
      className={cn(
        "flex min-h-0 flex-1 flex-col items-center justify-center gap-6 px-6 py-16 text-center",
        className,
      )}
    >
      <div className="relative flex items-center justify-center">
        {/* Soft pulsing halo behind the mark */}
        <div
          aria-hidden
          className="ambient-glow absolute h-28 w-28 rounded-full bg-primary/15 blur-2xl"
        />
        <div className="ambient-float relative">
          <Image
            src={logo}
            alt="Zenotion"
            width={56}
            height={56}
            priority
            className="drop-shadow-sm"
          />
        </div>
      </div>

      <div className="space-y-1.5">
        <p className="text-sm font-medium text-foreground">{message}</p>
        <p className="text-xs text-muted-foreground">{hint}</p>
      </div>

      {/* Minimal progress dots */}
      <div aria-hidden className="flex items-center gap-1.5">
        <span className="loading-dot h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
        <span className="loading-dot loading-dot-2 h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
        <span className="loading-dot loading-dot-3 h-1.5 w-1.5 rounded-full bg-muted-foreground/50" />
      </div>

      <span className="sr-only">{message}</span>
    </div>
  );
}
