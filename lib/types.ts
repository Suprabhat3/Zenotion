/** Shared app types used across server components and client components. */

export type TagSummary = {
  id: string;
  name: string;
  color: string | null;
};

export type FolderSummary = {
  id: string;
  name: string;
  noteCount: number;
};

export type NoteTagRelation = {
  tagId: string;
  tag: TagSummary;
};

export type NoteSummary = {
  id: string;
  title: string;
  content: string;
  isPublic: boolean;
  shareSlug: string | null;
  folderId: string | null;
  updatedAt: Date;
  tags: NoteTagRelation[];
};

export type NoteDetail = NoteSummary & {
  createdAt: Date;
};

export type SidebarData = {
  folders: FolderSummary[];
  tags: TagSummary[];
};
