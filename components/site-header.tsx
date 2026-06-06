import Link from "next/link";
import { Suspense } from "react";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeaderAuthActions } from "@/components/header-auth-actions";
function HeaderAuthFallback() {
  return (
    <div
      className="flex items-center gap-3"
      aria-hidden
    >
      <div className="h-9 w-16 rounded-md bg-muted" />
      <div className="h-9 w-24 rounded-md bg-muted" />
    </div>
  );
}

type SiteHeaderProps = {
  showAuthActions?: boolean;
};

export function SiteHeader({ showAuthActions = true }: SiteHeaderProps) {
  return (
    <header className="flex items-center justify-between px-6 py-4">
      <Link href="/" className="text-lg font-semibold">
        Zenotion
      </Link>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        {showAuthActions ? (
          <Suspense fallback={<HeaderAuthFallback />}>
            <HeaderAuthActions />
          </Suspense>
        ) : null}
      </div>
    </header>
  );
}
