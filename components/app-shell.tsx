"use client";

import { Suspense, useCallback, useSyncExternalStore, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import type { SidebarData } from "@/lib/types";
import { AppSidebar } from "@/components/app-sidebar";
import { AiSettingsHost } from "@/components/ai-settings-host";
import { QuickSwitcher } from "@/components/quick-switcher";

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
      className={cn("animate-pulse p-4", collapsed ? "w-14" : "w-60")}
      aria-hidden
    />
  );
}

export function AppShell({ sidebar, children }: AppShellProps) {
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

  const isCollapsed = hydrated && collapsed;

  return (
    <div className="flex min-h-0 flex-1">
      <div
        className={cn(
          "clay-sidebar-shell",
          isCollapsed && "clay-sidebar-shell-collapsed",
        )}
      >
        <Suspense fallback={<SidebarFallback collapsed={isCollapsed} />}>
          <AppSidebar
            sidebar={sidebar}
            collapsed={isCollapsed}
            onToggleCollapsed={toggleCollapsed}
          />
        </Suspense>
      </div>
      <main className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        {children}
      </main>
      <AiSettingsHost />
      <QuickSwitcher />
    </div>
  );
}
