import { Suspense } from "react";
import { BrandLogo } from "@/components/brand-logo";
import { ThemeToggle } from "@/components/theme-toggle";
import { HeaderAuthActions } from "@/components/header-auth-actions";

function HeaderAuthFallback() {
  return (
    <div className="flex items-center gap-3" aria-hidden>
      <div className="h-9 w-16 rounded-md bg-muted clay-inset" />
      <div className="h-9 w-24 rounded-md bg-muted clay-inset" />
    </div>
  );
}

type SiteHeaderProps = {
  showAuthActions?: boolean;
};

export function SiteHeader({ showAuthActions = true }: SiteHeaderProps) {
  return (
    <header className="clay-header flex items-center justify-between px-6 py-4">
      <BrandLogo />
      <div className="flex items-center gap-2">
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
