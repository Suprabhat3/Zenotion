import { SiteHeaderClient } from "@/components/site-header-client";
import { getCurrentUser } from "@/lib/session";

type SiteHeaderProps = {
  showAuthActions?: boolean;
  showNavLinks?: boolean;
  logoHref?: string;
};

export async function SiteHeader({
  showAuthActions = true,
  showNavLinks = true,
  logoHref = "/",
}: SiteHeaderProps) {
  const user =
    showAuthActions || showNavLinks ? await getCurrentUser() : null;

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
