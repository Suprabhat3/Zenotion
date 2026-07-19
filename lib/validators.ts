import { z } from "zod";
import { AI_PROVIDERS } from "@/lib/ai-providers";
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
    // Base64 ciphertext of secret notes grows ~4/3 over plaintext, so the
    // limit is higher than the 100k plaintext cap.
    content: z.string().max(140_000).optional(),
    /** Fresh AES-GCM IV accompanying an encrypted secret-note save. */
    secretIv: z.string().trim().min(1).max(64).optional(),
    /** Emoji page icon; send `null` to remove it. */
    icon: z.string().trim().min(1).max(64).nullish(),
    /** Cover image URL (ImageKit); send `null` to remove it. */
    coverImage: z
      .string()
      .trim()
      .max(1000)
      .url("Cover image must be a valid URL.")
      .refine(
        (value) => {
          try {
            const url = new URL(value);
            if (url.protocol !== "https:") return false;
            const host = url.hostname.toLowerCase();
            return host === "ik.imagekit.io" || host.endsWith(".imagekit.io");
          } catch {
            return false;
          }
        },
        { message: "Cover image must be hosted on ImageKit." },
      )
      .nullish(),
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
  "custom",
] as const;

export const aiRequestSchema = z.object({
  action: z.enum(AI_ACTIONS),
  content: z.string().trim().min(1, "There's no text to work with.").max(50_000),
  instruction: z.string().trim().max(2000).optional(),
  provider: z.enum(AI_PROVIDERS),
  model: z.string().trim().min(1, "Model is required.").max(120),
  apiKey: z.string().trim().min(8, "API key is required.").max(500),
}).refine(
  (v) => v.action !== "custom" || Boolean(v.instruction?.trim()),
  { message: "Describe what you'd like the AI to do.", path: ["instruction"] },
);

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

export const toggleNoteFavoriteSchema = z.object({
  noteId: z.string().cuid(),
  isFavorite: z.boolean(),
});

const base64String = z
  .string()
  .trim()
  .min(1)
  .regex(/^[A-Za-z0-9+/]+={0,2}$/, "Must be base64.");

/** Max ciphertext size — aligned with PATCH `content` for secret autosaves. */
const SECRET_CIPHERTEXT_MAX = 140_000;

export const markNoteSecretSchema = z.object({
  noteId: z.string().cuid(),
  ciphertext: base64String.max(SECRET_CIPHERTEXT_MAX),
  iv: base64String.max(64),
  salt: base64String.max(64),
  verifier: base64String.max(128),
});

export const unmarkNoteSecretSchema = z.object({
  noteId: z.string().cuid(),
  verifier: base64String.max(128),
  title: z.string().trim().min(1).max(200),
  content: z.string().max(100_000),
});

export const searchNotesSchema = z.object({
  q: z.string().trim().max(200).optional().default(""),
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

export const renameTagSchema = z.object({
  tagId: z.string().cuid(),
  name: z.string().trim().min(1, "Name is required.").max(50),
});

export const versionIdSchema = z.object({
  versionId: z.string().cuid(),
});

/**
 * Subset of AI actions suited for inline text selection. Excludes
 * `generate-title`, which acts on the whole note rather than a selection.
 */
export const INLINE_AI_ACTIONS = [
  "rewrite",
  "simplify",
  "fix-grammar",
  "summarize",
  "continue",
  "change-tone",
  "extract-tasks",
  "create-outline",
  "translate",
  "flashcards",
  "clean-markdown",
  "custom",
] as const;

export type InlineAiAction = (typeof INLINE_AI_ACTIONS)[number];

/** Inline actions that require a short free-form instruction before running. */
export const INLINE_ACTIONS_NEEDING_INSTRUCTION: InlineAiAction[] = [
  "change-tone",
  "translate",
  "custom",
];

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
