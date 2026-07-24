import { SiteHeaderClient } from "@/components/site-header-client";
import { getCurrentUser } from "@/lib/session";
import type { AuthUser } from "@/lib/session";

type SiteHeaderProps = {
  showAuthActions?: boolean;
  showNavLinks?: boolean;
  logoHref?: string;
  userPromise?: Promise<AuthUser | null>;
};

export async function SiteHeader({
  showAuthActions = true,
  showNavLinks = true,
  logoHref = "/",
  userPromise,
}: SiteHeaderProps) {
  const user =
    showAuthActions || showNavLinks
      ? await (userPromise ?? getCurrentUser())
      : null;

  return (
    <header className="site-header">
      <SiteHeaderClient
        user={user}
        showAuthActions={showAuthActions}
        showNavLinks={showNavLinks}
        logoHref={logoHref}
      />
    </header>
  );
}
