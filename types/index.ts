export type ID = string;

export type APIResponse<T = unknown> = {
  success: boolean;
  data?: T;
  error?: { code?: string; message: string; details?: unknown };
};

export type User = {
  id: ID;
  email: string;
  name?: string;
  roles?: string[];
};

export type Note = {
  id: ID;
  userId: ID;
  title: string;
  content: string;
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
  workspaceId?: ID;
};

export type Workspace = {
  id: ID;
  name: string;
  ownerId: ID;
};

Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>