"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useRef,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from "react";
import { PanelLeft } from "lucide-react";
import { cn } from "@/lib/utils";
import { MOBILE_SIDEBAR_QUERY, useMediaQuery } from "@/lib/use-media-query";
import type { SidebarData } from "@/lib/types";
import { AppSidebar } from "@/components/app-sidebar";
import { AiSettingsHost } from "@/components/ai-settings-host";
import { QuickSwitcher } from "@/components/quick-switcher";
import { ShortcutsDialog } from "@/components/shortcuts-dialog";
import { Button } from "@/components/ui/button";

const SIDEBAR_COLLAPSED_KEY = "zenotion-sidebar-collapsed";
const SIDEBAR_CHANGE_EVENT = "zenotion-sidebar-change";

type AppShellProps = {
  sidebar: SidebarData;
  children: ReactNode;
};

function subscribeToSidebarStorage(onStoreChange: () => void): () => void {
  const handler = () => onStoreChange();

  window.addEventListener("storage", handler);
  window.addEventListener(SIDEBAR_CHANGE_EVENT, handler);
  return () => {
    window.removeEventListener("storage", handler);
    window.removeEventListener(SIDEBAR_CHANGE_EVENT, handler);
  };
}

function getSidebarCollapsedSnapshot(): boolean {
  return localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === "true";
}

function getSidebarCollapsedServerSnapshot(): boolean {
  return false;
}

function SidebarFallback({ collapsed }: { collapsed: boolean }) {
  return (
    <aside
      className={cn(
        "flex h-full w-full flex-col gap-3 p-3",
        collapsed ? "items-center" : "",
      )}
      aria-hidden
    >
      <div
        className={cn(
          "h-9 animate-pulse rounded-lg bg-muted",
          collapsed ? "w-9" : "w-full",
        )}
      />
      <div
        className={cn(
          "h-9 animate-pulse rounded-lg bg-muted",
          collapsed ? "w-9" : "w-full",
        )}
      />
      <div className="mt-2 space-y-2">
        {Array.from({ length: 5 }, (_, index) => (
          <div
            key={index}
            className={cn(
              "h-8 animate-pulse rounded-md bg-muted/80",
              collapsed ? "w-9" : "w-full",
            )}
          />
        ))}
      </div>
    </aside>
  );
}

export function AppShell({ sidebar, children }: AppShellProps) {
  const isMobile = useMediaQuery(MOBILE_SIDEBAR_QUERY);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isMobileDrawerOpen = isMobile && mobileOpen;

  const hydrated = useSyncExternalStore(
    subscribeToSidebarStorage,
    () => true,
    () => false,
  );
  const collapsed = useSyncExternalStore(
    subscribeToSidebarStorage,
    getSidebarCollapsedSnapshot,
    getSidebarCollapsedServerSnapshot,
  );

  const toggleCollapsed = useCallback(() => {
    const next = !getSidebarCollapsedSnapshot();
    localStorage.setItem(SIDEBAR_COLLAPSED_KEY, String(next));
    window.dispatchEvent(new Event(SIDEBAR_CHANGE_EVENT));
  }, []);

  const closeMobileSidebar = useCallback(() => {
    setMobileOpen(false);
  }, []);

  const openMobileSidebar = useCallback(() => {
    setMobileOpen(true);
  }, []);

  const mobileMenuTriggerRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!isMobileDrawerOpen) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        closeMobileSidebar();
      }
    }
    window.addEventListener("keydown", onKeyDown);

    const drawer = document.querySelector<HTMLElement>(".clay-sidebar-shell-mobile-open");
    const focusable = drawer?.querySelector<HTMLElement>(
      'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
    );
    focusable?.focus();

    const menuTrigger = mobileMenuTriggerRef.current;

    return () => {
      document.body.style.overflow = previousOverflow;
      window.removeEventListener("keydown", onKeyDown);
      menuTrigger?.focus();
    };
  }, [isMobileDrawerOpen, closeMobileSidebar]);

  const isCollapsed = hydrated && collapsed && !isMobile;

  return (
    <div className="relative flex min-h-0 flex-1 gap-3 p-3 max-lg:gap-0 max-lg:p-2">
      {isMobileDrawerOpen ? (
        <button
          type="button"
          className="app-sidebar-backdrop"
          aria-label="Close sidebar"
          onClick={closeMobileSidebar}
        />
      ) : null}

      <div
        className={cn(
          "clay-sidebar-shell",
          isCollapsed && "clay-sidebar-shell-collapsed",
          isMobile && "clay-sidebar-shell-mobile",
          isMobileDrawerOpen && "clay-sidebar-shell-mobile-open",
        )}
      >
        <Suspense fallback={<SidebarFallback collapsed={isCollapsed} />}>
          <AppSidebar
            sidebar={sidebar}
            collapsed={isCollapsed}
            onToggleCollapsed={toggleCollapsed}
            isMobile={isMobile}
            onMobileClose={closeMobileSidebar}
          />
        </Suspense>
      </div>

      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {isMobile ? (
          <div className="app-mobile-toolbar shrink-0">
            <Button
              ref={mobileMenuTriggerRef}
              type="button"
              variant="ghost"
              size="icon"
              className="h-9 w-9 shrink-0"
              onClick={openMobileSidebar}
              title="Open sidebar"
              aria-label="Open sidebar"
            >
              <PanelLeft className="h-4 w-4" />
            </Button>
          </div>
        ) : null}
        {children}
      </main>
      <AiSettingsHost />
      <QuickSwitcher />
      <ShortcutsDialog />
    </div>
  );
}
