"use client";

import Link from "next/link";
import { BrandLogo } from "@/components/brand-logo";
import { SiteNavDesktop, SiteNavMobile } from "@/components/site-nav";
import { ThemeToggle } from "@/components/theme-toggle";
import { UserMenu } from "@/components/user-menu";
import { Button } from "@/components/ui/button";
import type { AuthUser } from "@/lib/session";

type SiteHeaderClientProps = {
  user: AuthUser | null;
  showAuthActions?: boolean;
  showNavLinks?: boolean;
  logoHref?: string;
};

export function SiteHeaderClient({
  user,
  showAuthActions = true,
  showNavLinks = true,
  logoHref = "/",
}: SiteHeaderClientProps) {
  return (
    <div className="site-header-bar">
      <BrandLogo href={logoHref} />

      {showNavLinks ? (
        <SiteNavDesktop className="justify-self-center" />
      ) : null}

      <div
        className={
          showNavLinks
            ? "flex items-center justify-end gap-1.5"
            : "col-start-3 flex items-center justify-end"
        }
      >
        {showNavLinks ? <SiteNavMobile showAuthLinks={!user} /> : null}
        <div className="site-header-actions">
          <ThemeToggle className="rounded-full" />
          {showAuthActions ? (
            user ? (
              <UserMenu
                name={user.name}
                email={user.email}
                image={user.image}
              />
            ) : (
              <div className="flex items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  className="hidden rounded-full sm:inline-flex"
                  asChild
                >
                  <Link href="/login">Sign in</Link>
                </Button>
                <Button size="sm" className="rounded-full px-4" asChild>
                  <Link href="/signup">
                    <span className="sm:hidden">Start</span>
                    <span className="hidden sm:inline">Get started</span>
                  </Link>
                </Button>
              </div>
            )
          ) : null}
        </div>
      </div>
    </div>
  );
}
