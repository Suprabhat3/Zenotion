"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Folder, Hash, LayoutDashboard, Plus } from "lucide-react";
import { cn } from "@/lib/utils";
import type { SidebarData } from "@/lib/types";
import { Button } from "@/components/ui/button";
import { createNote } from "@/app/(app)/notes/actions";
import { CreateFolderDialog } from "@/components/create-folder-dialog";
import { CreateTagDialog } from "@/components/create-tag-dialog";

type AppSidebarProps = {
  sidebar: SidebarData;
};

export function AppSidebar({ sidebar }: AppSidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="flex h-full w-60 shrink-0 flex-col border-r bg-muted/40 p-4">
      <form action={createNote}>
        <Button type="submit" className="mb-4 w-full gap-2" size="sm">
          <Plus className="h-4 w-4" />
          New note
        </Button>
      </form>

      <nav className="space-y-1">
        <Link
          href="/dashboard"
          className={cn(
            "flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
            pathname === "/dashboard" && "bg-accent font-medium",
          )}
        >
          <LayoutDashboard className="h-4 w-4" />
          All notes
        </Link>
      </nav>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Folders
          </span>
          <CreateFolderDialog />
        </div>
        <ul className="space-y-0.5">
          {sidebar.folders.length === 0 ? (
            <li className="px-2 text-xs text-muted-foreground">No folders yet</li>
          ) : (
            sidebar.folders.map((folder) => (
              <li key={folder.id}>
                <Link
                  href={`/dashboard?folder=${folder.id}`}
                  className={cn(
                    "flex items-center justify-between gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent",
                  )}
                >
                  <span className="flex items-center gap-2 truncate">
                    <Folder className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    {folder.name}
                  </span>
                  <span className="text-xs text-muted-foreground">{folder.noteCount}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>

      <div className="mt-6">
        <div className="mb-2 flex items-center justify-between px-2">
          <span className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
            Tags
          </span>
          <CreateTagDialog />
        </div>
        <ul className="space-y-0.5">
          {sidebar.tags.length === 0 ? (
            <li className="px-2 text-xs text-muted-foreground">No tags yet</li>
          ) : (
            sidebar.tags.map((tag) => (
              <li key={tag.id}>
                <Link
                  href={`/dashboard?tag=${tag.id}`}
                  className="flex items-center gap-2 rounded-md px-2 py-1.5 text-sm transition-colors hover:bg-accent"
                >
                  <Hash className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                  {tag.color && (
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: tag.color }}
                    />
                  )}
                  <span className="truncate">{tag.name}</span>
                </Link>
              </li>
            ))
          )}
        </ul>
      </div>
    </aside>
  );
}
