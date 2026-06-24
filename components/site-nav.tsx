"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV_ITEMS = [
  { href: "/templates", label: "Templates" },
  { href: "/about", label: "About" },
] as const;

type NavLinkProps = {
  href: string;
  label: string;
  pathname: string;
  onNavigate?: () => void;
  className?: string;
};

function NavLink({
  href,
  label,
  pathname,
  onNavigate,
  className,
}: NavLinkProps) {
  const isActive =
    pathname === href || (href !== "/" && pathname.startsWith(`${href}/`));

  return (
    <Link
      href={href}
      onClick={onNavigate}
      className={cn("site-nav-link", isActive && "site-nav-link-active", className)}
    >
      {label}
    </Link>
  );
}

type SiteNavDesktopProps = {
  className?: string;
};

export function SiteNavDesktop({ className }: SiteNavDesktopProps) {
  const pathname = usePathname();

  return (
    <nav
      className={cn("hidden items-center gap-1 md:flex", className)}
      aria-label="Main navigation"
    >
      {NAV_ITEMS.map(({ href, label }) => (
        <NavLink key={href} href={href} label={label} pathname={pathname} />
      ))}
    </nav>
  );
}

type SiteNavMobileProps = {
  showAuthLinks?: boolean;
};

export function SiteNavMobile({ showAuthLinks = false }: SiteNavMobileProps) {
  const pathname = usePathname();

  return (
    <SiteNavMobileMenu
      key={pathname}
      pathname={pathname}
      showAuthLinks={showAuthLinks}
    />
  );
}

function SiteNavMobileMenu({
  pathname,
  showAuthLinks,
}: {
  pathname: string;
  showAuthLinks: boolean;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (!mobileOpen) return;

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") setMobileOpen(false);
    };

    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKeyDown);

    return () => {
      document.body.style.overflow = "";
      window.removeEventListener("keydown", onKeyDown);
    };
  }, [mobileOpen]);

  return (
    <div className="relative md:hidden">
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="site-nav-menu-trigger"
        aria-expanded={mobileOpen}
        aria-controls="site-mobile-nav"
        aria-label={mobileOpen ? "Close menu" : "Open menu"}
        onClick={() => setMobileOpen((open) => !open)}
      >
        {mobileOpen ? (
          <X className="h-4 w-4" />
        ) : (
          <Menu className="h-4 w-4" />
        )}
      </Button>

      {mobileOpen ? (
        <>
          <button
            type="button"
            className="site-mobile-nav-backdrop"
            aria-label="Close menu"
            onClick={() => setMobileOpen(false)}
          />
          <nav
            id="site-mobile-nav"
            className="site-mobile-nav"
            aria-label="Mobile navigation"
          >
            {NAV_ITEMS.map(({ href, label }) => (
              <NavLink
                key={href}
                href={href}
                label={label}
                pathname={pathname}
                onNavigate={() => setMobileOpen(false)}
              />
            ))}
            {showAuthLinks ? (
              <>
                <div className="my-1 h-px bg-border/60" aria-hidden />
                <NavLink
                  href="/login"
                  label="Sign in"
                  pathname={pathname}
                  onNavigate={() => setMobileOpen(false)}
                />
                <Link
                  href="/signup"
                  onClick={() => setMobileOpen(false)}
                  className="site-nav-link site-nav-link-cta"
                >
                  Get started
                </Link>
              </>
            ) : null}
          </nav>
        </>
      ) : null}
    </div>
  );
}
