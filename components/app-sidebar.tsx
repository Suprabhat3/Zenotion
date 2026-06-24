"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  FileText,
  Folder,
  Hash,
  LayoutDashboard,
  PanelLeft,
  PanelLeftClose,
  Plus,
  Search,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import type { SidebarData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { createNote } from "@/app/(app)/notes/actions";
import { CreateFolderDialog } from "@/components/create-folder-dialog";
import { CreateTagDialog } from "@/components/create-tag-dialog";
import { FolderActionsMenu } from "@/components/folder-actions-menu";
import { TagActionsMenu } from "@/components/tag-actions-menu";
import { openQuickSwitcher } from "@/components/quick-switcher";

type AppSidebarProps = {
  sidebar: SidebarData;
  collapsed: boolean;
  onToggleCollapsed: () => void;
};

type SidebarSectionProps = {
  title: string;
  action: ReactNode;
  children: ReactNode;
  collapsed: boolean;
};

function SidebarSection({ title, action, children, collapsed }: SidebarSectionProps) {
  if (collapsed) {
    return <div className="flex flex-col items-center gap-1">{children}</div>;
  }

  return (
    <section className="space-y-2">
      <div className="flex items-center justify-between px-1">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
        </span>
        {action}
      </div>
      <div className="clay-sidebar-section">{children}</div>
    </section>
  );
}

type SidebarEmptyHintProps = {
  message: string;
  action: ReactNode;
};

function SidebarEmptyHint({ message, action }: SidebarEmptyHintProps) {
  return (
    <div className="clay-sidebar-empty">
      <p>{message}</p>
      {action}
    </div>
  );
}

function SidebarIconButton({
  href,
  label,
  active,
  children,
}: {
  href: string;
  label: string;
  active?: boolean;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      className={cn(
        "clay-nav-item flex h-9 w-9 items-center justify-center",
        active && "clay-nav-item-active",
      )}
    >
      {children}
    </Link>
  );
}

export function AppSidebar({
  sidebar,
  collapsed,
  onToggleCollapsed,
}: AppSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeFolderId = searchParams.get("folder");
  const activeTagId = searchParams.get("tag");
  const isDashboard = pathname === "/dashboard";
  const isAllNotesActive = isDashboard && !activeFolderId && !activeTagId;

  return (
    <aside
      className={cn(
        "flex h-full min-h-0 flex-col",
        collapsed ? "w-14 p-2" : "w-60 p-4",
      )}
    >
      <div className={cn("flex min-h-0 flex-1 flex-col gap-5 overflow-y-auto", collapsed && "items-center gap-3")}>
        <form action={createNote} className={cn(collapsed ? "w-full" : "w-full")}>
          {collapsed ? (
            <Button
              type="submit"
              size="icon"
              className="mx-auto h-9 w-9"
              title="New note"
              aria-label="New note"
            >
              <Plus className="h-4 w-4" />
            </Button>
          ) : (
            <Button type="submit" className="w-full gap-2">
              <Plus className="h-4 w-4" />
              New note
            </Button>
          )}
        </form>

        <SidebarSection title="Browse" action={null} collapsed={collapsed}>
          {collapsed ? (
            <>
              <button
                type="button"
                onClick={openQuickSwitcher}
                title="Search notes"
                aria-label="Search notes"
                className="clay-nav-item flex h-9 w-9 items-center justify-center"
              >
                <Search className="h-4 w-4 text-muted-foreground" />
              </button>
              <SidebarIconButton
                href="/dashboard"
                label="All notes"
                active={isAllNotesActive}
              >
                <LayoutDashboard className="h-4 w-4 text-muted-foreground" />
              </SidebarIconButton>
            </>
          ) : (
            <>
              <button
                type="button"
                onClick={openQuickSwitcher}
                className="clay-nav-item flex w-full items-center justify-between gap-2 px-2.5 py-2 text-sm"
              >
                <span className="flex items-center gap-2">
                  <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                  Search
                </span>
                <kbd className="rounded border bg-muted px-1.5 text-[10px] text-muted-foreground">
                  Ctrl P
                </kbd>
              </button>
              <Link
                href="/dashboard"
                className={cn(
                  "clay-nav-item flex items-center justify-between gap-2 px-2.5 py-2 text-sm",
                  isAllNotesActive && "clay-nav-item-active",
                )}
              >
                <span className="flex items-center gap-2">
                  <LayoutDashboard className="h-4 w-4 shrink-0 text-muted-foreground" />
                  All notes
                </span>
                <span className="text-xs tabular-nums text-muted-foreground">
                  {sidebar.totalNotes}
                </span>
              </Link>
            </>
          )}
        </SidebarSection>

        {sidebar.favorites.length > 0 && (
          <SidebarSection title="Favorites" action={null} collapsed={collapsed}>
            {collapsed ? (
              <>
                {sidebar.favorites.slice(0, 4).map((note) => (
                  <SidebarIconButton
                    key={note.id}
                    href={`/notes/${note.id}`}
                    label={note.title || "Untitled"}
                    active={pathname === `/notes/${note.id}`}
                  >
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                  </SidebarIconButton>
                ))}
              </>
            ) : (
              <ul className="space-y-0.5">
                {sidebar.favorites.map((note) => (
                  <li key={note.id}>
                    <Link
                      href={`/notes/${note.id}`}
                      className={cn(
                        "clay-nav-item flex items-center gap-2 px-2.5 py-2 text-sm",
                        pathname === `/notes/${note.id}` && "clay-nav-item-active",
                      )}
                    >
                      <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
                      <span className="truncate">{note.title || "Untitled"}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </SidebarSection>
        )}

        <SidebarSection
          title="Folders"
          action={collapsed ? null : <CreateFolderDialog />}
          collapsed={collapsed}
        >
          {collapsed ? (
            <>
              <CreateFolderDialog className="h-9 w-9" />
              {sidebar.folders.slice(0, 4).map((folder) => {
                const isActive = isDashboard && activeFolderId === folder.id;

                return (
                  <SidebarIconButton
                    key={folder.id}
                    href={`/dashboard?folder=${folder.id}`}
                    label={folder.name}
                    active={isActive}
                  >
                    <Folder className="h-4 w-4 text-muted-foreground" />
                  </SidebarIconButton>
                );
              })}
            </>
          ) : sidebar.folders.length === 0 ? (
            <SidebarEmptyHint
              message="Group notes by project or topic."
              action={<CreateFolderDialog trigger="empty" />}
            />
          ) : (
            <ul className="space-y-0.5">
              {sidebar.folders.map((folder) => {
                const isActive = isDashboard && activeFolderId === folder.id;

                return (
                  <li key={folder.id} className="group flex items-center gap-0.5">
                    <Link
                      href={`/dashboard?folder=${folder.id}`}
                      className={cn(
                        "clay-nav-item flex min-w-0 flex-1 items-center justify-between gap-2 px-2.5 py-2 text-sm",
                        isActive && "clay-nav-item-active",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2">
                        <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{folder.name}</span>
                      </span>
                      <span className="text-xs tabular-nums text-muted-foreground">
                        {folder.noteCount}
                      </span>
                    </Link>
                    <FolderActionsMenu
                      folderId={folder.id}
                      folderName={folder.name}
                      noteCount={folder.noteCount}
                    />
                  </li>
                );
              })}
            </ul>
          )}
        </SidebarSection>

        <SidebarSection
          title="Tags"
          action={collapsed ? null : <CreateTagDialog />}
          collapsed={collapsed}
        >
          {collapsed ? (
            <>
              <CreateTagDialog className="h-9 w-9" />
              {sidebar.tags.slice(0, 4).map((tag) => {
                const isActive = isDashboard && activeTagId === tag.id;

                return (
                  <SidebarIconButton
                    key={tag.id}
                    href={`/dashboard?tag=${tag.id}`}
                    label={tag.name}
                    active={isActive}
                  >
                    <Hash className="h-4 w-4 text-muted-foreground" />
                  </SidebarIconButton>
                );
              })}
            </>
          ) : sidebar.tags.length === 0 ? (
            <SidebarEmptyHint
              message="Label notes for quick filtering."
              action={<CreateTagDialog trigger="empty" />}
            />
          ) : (
            <ul className="space-y-0.5">
              {sidebar.tags.map((tag) => {
                const isActive = isDashboard && activeTagId === tag.id;

                return (
                  <li key={tag.id} className="group flex items-center gap-0.5">
                    <Link
                      href={`/dashboard?tag=${tag.id}`}
                      className={cn(
                        "clay-nav-item flex min-w-0 flex-1 items-center gap-2 px-2.5 py-2 text-sm",
                        isActive && "clay-nav-item-active",
                      )}
                    >
                      <Hash className="h-4 w-4 shrink-0 text-muted-foreground" />
                      {tag.color && (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full ring-1 ring-border/60"
                          style={{ backgroundColor: tag.color }}
                        />
                      )}
                      <span className="truncate">{tag.name}</span>
                    </Link>
                    <TagActionsMenu tagId={tag.id} tagName={tag.name} />
                  </li>
                );
              })}
            </ul>
          )}
        </SidebarSection>
      </div>

      <div
        className={cn(
          "mt-3 shrink-0 border-t border-border/60 pt-3",
          collapsed ? "flex justify-center" : "",
        )}
      >
        <Button
          type="button"
          variant="ghost"
          size={collapsed ? "icon" : "sm"}
          className={cn(!collapsed && "w-full justify-start gap-2 text-muted-foreground")}
          onClick={onToggleCollapsed}
          title={collapsed ? "Expand sidebar" : "Collapse sidebar"}
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? (
            <PanelLeft className="h-4 w-4" />
          ) : (
            <>
              <PanelLeftClose className="h-4 w-4" />
              Collapse sidebar
            </>
          )}
        </Button>
      </div>
    </aside>
  );
}
