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
  isFavorite: boolean;
  shareSlug: string | null;
  folderId: string | null;
  updatedAt: Date;
  tags: NoteTagRelation[];
};

export type NoteDetail = NoteSummary & {
  createdAt: Date;
};

export type SidebarNoteSummary = {
  id: string;
  title: string;
  isFavorite: boolean;
};

export type SidebarData = {
  notes: SidebarNoteSummary[];
  folders: FolderSummary[];
  tags: TagSummary[];
};

/** Lightweight shape returned by `GET /api/notes/search` for the quick switcher. */
export type NoteSearchResult = {
  id: string;
  title: string;
  excerpt: string;
  isFavorite: boolean;
  folderName: string | null;
  updatedAt: string;
};

export type NoteVersionSummary = {
  id: string;
  title: string;
  content: string;
  createdAt: string;
};

export type EditorSelection = {
  from: number;
  to: number;
  text: string;
};
