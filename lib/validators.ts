import { z } from "zod";
import { ApiError } from "@/lib/api";

// ---------------------------------------------------------------------------
// Shared input schemas. Keep all request/action validation here so route
// handlers and server actions validate identically.
// ---------------------------------------------------------------------------

export const createNoteSchema = z.object({
  title: z.string().trim().max(200).optional(),
  content: z.string().max(100_000).optional(),
  folderId: z.string().cuid().nullish(),
});

export const updateNoteSchema = z
  .object({
    title: z.string().trim().max(200).optional(),
    content: z.string().max(100_000).optional(),
    folderId: z.string().cuid().nullish(),
    tagIds: z.array(z.string().cuid()).optional(),
  })
  .refine((v) => Object.keys(v).length > 0, {
    message: "No fields to update.",
  });

export const folderSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(100),
});

export const tagSchema = z.object({
  name: z.string().trim().min(1, "Name is required.").max(50),
  color: z
    .string()
    .regex(/^#[0-9a-fA-F]{6}$/, "Color must be a hex code.")
    .optional(),
});

export const AI_ACTIONS = [
  "summarize",
  "rewrite",
  "continue",
  "fix-grammar",
  "change-tone",
  "extract-tasks",
  "generate-title",
  "create-outline",
  "simplify",
  "translate",
  "flashcards",
  "clean-markdown",
] as const;

export const aiRequestSchema = z.object({
  action: z.enum(AI_ACTIONS),
  content: z.string().trim().min(1, "There's no text to work with.").max(50_000),
  // Optional free-form instruction (e.g. target tone or language).
  instruction: z.string().trim().max(200).optional(),
});

export type AiAction = (typeof AI_ACTIONS)[number];

export const noteIdSchema = z.object({
  noteId: z.string().cuid(),
});

export const renameNoteSchema = z.object({
  noteId: z.string().cuid(),
  title: z.string().trim().min(1, "Title is required.").max(200),
});

export const moveNoteSchema = z.object({
  noteId: z.string().cuid(),
  folderId: z.string().cuid().nullable(),
});

export const toggleNotePublicSchema = z.object({
  noteId: z.string().cuid(),
  isPublic: z.boolean(),
});

export const assignTagsSchema = z.object({
  noteId: z.string().cuid(),
  tagIds: z.array(z.string().cuid()),
});

export const folderIdSchema = z.object({
  folderId: z.string().cuid(),
});

export const tagIdSchema = z.object({
  tagId: z.string().cuid(),
});

export const renameFolderSchema = z.object({
  folderId: z.string().cuid(),
  name: z.string().trim().min(1, "Name is required.").max(100),
});

/**
 * Validate `data` against `schema`, throwing a 400 `ApiError` with field
 * details on failure. Use inside route handlers and server actions.
 */
export function parseOrThrow<T>(schema: z.ZodType<T>, data: unknown): T {
  const result = schema.safeParse(data);
  if (!result.success) {
    throw new ApiError(
      "VALIDATION_ERROR",
      "Please check the submitted values.",
      result.error.flatten(),
    );
  }
  return result.data;
}
