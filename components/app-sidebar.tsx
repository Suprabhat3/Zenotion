"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import {
  FileText,
  Folder,
  Hash,
  Lock,
  Loader2,
  PanelLeft,
  PanelLeftClose,
  Plus,
  Search,
  Star,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { modKeyLabel, useIsApplePlatform } from "@/lib/platform";
import type { SidebarData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { createNote } from "@/app/(app)/notes/actions";
import { CreateNoteSubmitButton } from "@/components/create-note-submit-button";
import { CreateFolderDialog } from "@/components/create-folder-dialog";
import { CreateTagDialog } from "@/components/create-tag-dialog";
import { FolderActionsMenu } from "@/components/folder-actions-menu";
import { TagActionsMenu } from "@/components/tag-actions-menu";
import { openQuickSwitcher } from "@/components/quick-switcher";

type AppSidebarProps = {
  sidebar: SidebarData;
  collapsed: boolean;
  onToggleCollapsed: () => void;
  isMobile?: boolean;
  onMobileClose?: () => void;
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
      <div className="flex items-center justify-between gap-2 px-0.5">
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
  onNavigate,
  children,
}: {
  href: string;
  label: string;
  active?: boolean;
  onNavigate?: () => void;
  children: ReactNode;
}) {
  return (
    <Link
      href={href}
      title={label}
      aria-label={label}
      onClick={onNavigate}
      className={cn(
        "clay-nav-item flex h-9 w-9 shrink-0 items-center justify-center",
        active && "clay-nav-item-active",
      )}
    >
      {children}
    </Link>
  );
}

const newNoteButtonClassName =
  "w-full gap-2 clay-surface hover:bg-accent/80 hover:text-accent-foreground";

function SidebarNoteLink({
  noteId,
  title,
  icon,
  isFavorite,
  isSecret,
  active,
  collapsed,
  onNavigate,
}: {
  noteId: string;
  title: string;
  icon: string | null;
  isFavorite: boolean;
  isSecret: boolean;
  active: boolean;
  collapsed?: boolean;
  onNavigate?: () => void;
}) {
  const label = title || "Untitled";

  // The note's emoji icon wins; otherwise fall back to star/file glyphs.
  const glyph = isSecret ? (
    <Lock className="h-4 w-4 shrink-0 text-muted-foreground" />
  ) : icon ? (
    <span className="w-4 shrink-0 text-center text-sm leading-none" aria-hidden>
      {icon}
    </span>
  ) : isFavorite ? (
    <Star className="h-4 w-4 shrink-0 fill-amber-400 text-amber-400" />
  ) : (
    <FileText className="h-4 w-4 shrink-0 text-muted-foreground" />
  );

  if (collapsed) {
    return (
      <SidebarIconButton
        href={`/notes/${noteId}`}
        label={label}
        active={active}
        onNavigate={onNavigate}
      >
        {glyph}
      </SidebarIconButton>
    );
  }

  return (
    <Link
      href={`/notes/${noteId}`}
      onClick={onNavigate}
      className={cn(
        "clay-nav-item flex items-center gap-2.5 px-3 py-2 text-sm",
        active && "clay-nav-item-active",
      )}
    >
      {glyph}
      <span className="truncate">{label}</span>
    </Link>
  );
}

export function AppSidebar({
  sidebar,
  collapsed,
  onToggleCollapsed,
  isMobile = false,
  onMobileClose,
}: AppSidebarProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeFolderId = searchParams.get("folder");
  const activeTagId = searchParams.get("tag");
  const isDashboard = pathname === "/dashboard";
  const isApple = useIsApplePlatform();
  const modShortcut = modKeyLabel(isApple);

  const handleNavigate = isMobile ? onMobileClose : undefined;

  return (
    <aside
      className={cn(
        "clay-sidebar flex h-full min-h-0 w-full flex-col",
        collapsed ? "px-2 py-3" : "px-3 py-4",
      )}
    >
      <div
        className={cn(
          "flex min-h-0 flex-1 flex-col overflow-y-auto overscroll-contain",
          collapsed ? "items-center gap-2" : "gap-6",
        )}
      >
        <form action={createNote} className="w-full">
          {collapsed ? (
            <CreateNoteSubmitButton
              variant="outline"
              size="icon"
              className="mx-auto h-9 w-9 clay-surface"
              title="New note"
              aria-label="New note"
              pendingChildren={
                <>
                  <Loader2 className="animate-spin" aria-hidden="true" />
                  <span className="sr-only">Creating note…</span>
                </>
              }
            >
              <Plus className="h-4 w-4" />
            </CreateNoteSubmitButton>
          ) : (
            <CreateNoteSubmitButton
              variant="outline"
              className={newNoteButtonClassName}
            >
              <Plus className="h-4 w-4" />
              New note
            </CreateNoteSubmitButton>
          )}
        </form>

        <SidebarSection title="Browse" action={null} collapsed={collapsed}>
          {collapsed ? (
            <button
              type="button"
              onClick={() => {
                openQuickSwitcher();
                onMobileClose?.();
              }}
              title="Search notes"
              aria-label="Search notes"
              className="clay-nav-item flex h-9 w-9 shrink-0 items-center justify-center"
            >
              <Search className="h-4 w-4 text-muted-foreground" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                openQuickSwitcher();
                onMobileClose?.();
              }}
              className="clay-nav-item flex w-full items-center justify-between gap-2 px-3 py-2 text-sm"
            >
              <span className="flex items-center gap-2.5">
                <Search className="h-4 w-4 shrink-0 text-muted-foreground" />
                Search
              </span>
              <kbd className="rounded-md px-1.5 py-0.5 text-[10px] text-muted-foreground clay-inset">
                {modShortcut}P
              </kbd>
            </button>
          )}
        </SidebarSection>

        <SidebarSection
          title="Notes"
          action={
            collapsed ? null : (
              <span className="rounded-md px-1.5 py-0.5 text-[10px] tabular-nums text-muted-foreground clay-inset">
                {sidebar.notes.length}
              </span>
            )
          }
          collapsed={collapsed}
        >
          {sidebar.notes.length === 0 ? (
            collapsed ? null : (
              <SidebarEmptyHint
                message="Notes you create will appear here for quick access."
                action={
                  <form action={createNote}>
                    <CreateNoteSubmitButton
                      variant="outline"
                      size="sm"
                      className="h-8 gap-1.5 text-xs clay-surface"
                    >
                      <Plus className="h-3.5 w-3.5" />
                      New note
                    </CreateNoteSubmitButton>
                  </form>
                }
              />
            )
          ) : (
            <ul className={cn("space-y-0.5", !collapsed && "max-h-64 overflow-y-auto pr-0.5")}>
              {(collapsed ? sidebar.notes.slice(0, 6) : sidebar.notes).map((note) => (
                <li key={note.id}>
                  <SidebarNoteLink
                    noteId={note.id}
                    title={note.title}
                    icon={note.icon}
                    isFavorite={note.isFavorite}
                    isSecret={note.isSecret}
                    active={pathname === `/notes/${note.id}`}
                    collapsed={collapsed}
                    onNavigate={handleNavigate}
                  />
                </li>
              ))}
              {collapsed && sidebar.notes.length > 6 ? (
                <li>
                  <SidebarIconButton
                    href="/dashboard"
                    label={`${sidebar.notes.length - 6} more notes`}
                    onNavigate={handleNavigate}
                  >
                    <span className="text-[10px] font-semibold text-muted-foreground">
                      +{sidebar.notes.length - 6}
                    </span>
                  </SidebarIconButton>
                </li>
              ) : null}
            </ul>
          )}
        </SidebarSection>

        <SidebarSection
          title="Folders"
          action={collapsed ? null : <CreateFolderDialog />}
          collapsed={collapsed}
        >
          {collapsed ? (
            <>
              <CreateFolderDialog className="h-9 w-9 clay-surface" />
              {sidebar.folders.slice(0, 4).map((folder) => {
                const isActive = isDashboard && activeFolderId === folder.id;

                return (
                  <SidebarIconButton
                    key={folder.id}
                    href={`/dashboard?folder=${folder.id}`}
                    label={folder.name}
                    active={isActive}
                    onNavigate={handleNavigate}
                  >
                    <Folder className="h-4 w-4 text-muted-foreground" />
                  </SidebarIconButton>
                );
              })}
              {sidebar.folders.length > 4 ? (
                <SidebarIconButton
                  href="/dashboard"
                  label={`${sidebar.folders.length - 4} more folders`}
                  onNavigate={handleNavigate}
                >
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    +{sidebar.folders.length - 4}
                  </span>
                </SidebarIconButton>
              ) : null}
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
                      onClick={handleNavigate}
                      className={cn(
                        "clay-nav-item flex min-w-0 flex-1 items-center justify-between gap-2 px-3 py-2 text-sm",
                        isActive && "clay-nav-item-active",
                      )}
                    >
                      <span className="flex min-w-0 items-center gap-2.5">
                        <Folder className="h-4 w-4 shrink-0 text-muted-foreground" />
                        <span className="truncate">{folder.name}</span>
                      </span>
                      <span className="rounded-md px-1.5 py-0.5 text-xs tabular-nums text-muted-foreground clay-inset">
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
              <CreateTagDialog className="h-9 w-9 clay-surface" />
              {sidebar.tags.slice(0, 4).map((tag) => {
                const isActive = isDashboard && activeTagId === tag.id;

                return (
                  <SidebarIconButton
                    key={tag.id}
                    href={`/dashboard?tag=${tag.id}`}
                    label={tag.name}
                    active={isActive}
                    onNavigate={handleNavigate}
                  >
                    <Hash className="h-4 w-4 text-muted-foreground" />
                  </SidebarIconButton>
                );
              })}
              {sidebar.tags.length > 4 ? (
                <SidebarIconButton
                  href="/dashboard"
                  label={`${sidebar.tags.length - 4} more tags`}
                  onNavigate={handleNavigate}
                >
                  <span className="text-[10px] font-semibold text-muted-foreground">
                    +{sidebar.tags.length - 4}
                  </span>
                </SidebarIconButton>
              ) : null}
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
                      onClick={handleNavigate}
                      className={cn(
                        "clay-nav-item flex min-w-0 flex-1 items-center gap-2.5 px-3 py-2 text-sm",
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
          "mt-4 shrink-0 px-1 pt-1",
          collapsed ? "flex flex-col items-center" : "",
        )}
      >
        <div className="clay-sidebar-separator mb-3" aria-hidden />
        {isMobile ? (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="w-full justify-start gap-2 px-2 text-muted-foreground hover:text-foreground"
            onClick={onMobileClose}
            title="Close sidebar"
            aria-label="Close sidebar"
          >
            <PanelLeftClose className="h-4 w-4" />
            Close sidebar
          </Button>
        ) : (
          <Button
            type="button"
            variant="ghost"
            size={collapsed ? "icon" : "sm"}
            className={cn(
              "text-muted-foreground hover:text-foreground",
              !collapsed && "w-full justify-start gap-2 px-2",
            )}
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
        )}
      </div>
    </aside>
  );
}
