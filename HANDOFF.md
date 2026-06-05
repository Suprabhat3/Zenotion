# Zenotion — Implementation Handoff

Last updated by the previous agent at the end of the **auth slice**. This document is the single source of truth for what exists, what works, and what's next. Read `AGENTS.md` / `CLAUDE.md` first for product scope and rules — this file is the *current state*, not the spec.

> ⚠️ **This is Next.js 16 + React 19 + Prisma 7 + Tailwind 4 + Better Auth 1.6.** These have breaking changes vs. older training data. The non-obvious gotchas are documented under "Critical version notes" below — read them before writing code.

---

## 1. Current status at a glance

| Phase | Status |
|---|---|
| Dependencies installed | ✅ Done |
| Prisma schema + migration (Neon Postgres) | ✅ Done, migrated |
| Foundation helpers (db, api, session, validators, utils) | ✅ Done |
| Better Auth config + route handler + client | ✅ Done |
| Base layout, theme (light/dark), UI primitives | ✅ Done |
| Auth pages (login/signup) + auth layout | ✅ Done |
| **Route protection (proxy.ts)** | ❌ Not started (see §6) |
| Notes CRUD (Server Actions + Route Handlers) | ❌ Not started |
| Dashboard + editor (SSR) | ❌ Not started |
| Folders / tags | ❌ Not started |
| Markdown editor + live preview + autosave | ❌ Not started |
| Public share links | ❌ Not started |
| AI command palette + AI endpoint | ❌ Not started |
| Public marketing pages (SSG) + templates gallery (ISR) | ❌ Not started (default `app/page.tsx` still the CRA boilerplate) |

**`pnpm lint` passes clean. `npx tsc --noEmit` passes clean.** `pnpm build` has NOT been run yet against the full app — run it after the next slice.

---

## 2. What is implemented (files that exist and work)

### Config / env
- `prisma/schema.prisma` — full schema (see §4). Generator outputs to `app/generated/prisma` (gitignored).
- `prisma.config.ts` — Prisma 7 config; reads `DATABASE_URL` from `.env` via `dotenv`.
- `.env` — **contains real Neon `DATABASE_URL`, a generated `BETTER_AUTH_SECRET`, and real Google OAuth credentials** (the user added Google creds, so Google login is LIVE). `OPENAI_API_KEY` is intentionally blank.
- `.env.example` — template, safe to commit.
- `package.json` scripts added via `pnpm pkg set`: `postinstall: prisma generate`, `db:migrate`, `db:studio`. **Do not hand-edit package.json; use `pnpm add` / `pnpm pkg set`.**

### `lib/` (foundation — reuse these everywhere)
- `lib/db.ts` — Prisma client singleton. **Prisma 7 requires a driver adapter**; uses `PrismaPg` from `@prisma/adapter-pg` with `DATABASE_URL`.
- `lib/auth.ts` — Better Auth server instance. Email/password enabled. Google provider registered ONLY when `GOOGLE_CLIENT_ID` + `GOOGLE_CLIENT_SECRET` are set. `nextCookies()` plugin is last. Exports `auth` and `Session` type.
- `lib/auth-client.ts` — `createAuthClient()` (defaults to current origin). Exports `signIn`, `signUp`, `signOut`, `useSession`.
- `lib/session.ts` — `getCurrentUser()` (returns `AuthUser | null`) and `requireUser()` (throws `ApiError("UNAUTHORIZED")`). **Use `requireUser()` in every protected route handler / server action.**
- `lib/api.ts` — `ApiError` class, `ok()`, `fail()`, `handleApiError()`, and the `ApiResponse<T>` types. **This is the structured-response contract from AGENTS.md.** Status codes are mapped by error code.
- `lib/validators.ts` — Zod schemas (`createNoteSchema`, `updateNoteSchema`, `folderSchema`, `tagSchema`, `aiRequestSchema`), the `AI_ACTIONS` const tuple + `AiAction` type, and `parseOrThrow()` (throws 400 `ApiError` with `.flatten()` details).
- `lib/utils.ts` — `cn()` (clsx + tailwind-merge) and `generateShareSlug()`.

### `components/`
- `theme-provider.tsx`, `theme-toggle.tsx` — next-themes wiring (class strategy, system default).
- `auth-form.tsx` — client form handling login + signup + Google; toasts errors via sonner; redirects to `/dashboard` on success.
- `ui/` — hand-written shadcn-style primitives: `button`, `input`, `textarea`, `label`, `card`, `dialog`, `dropdown-menu`, `sonner`. All use the CSS token theme. (shadcn CLI was NOT used — add new primitives by hand in the same style, or run the CLI if you prefer.)

### `app/`
- `layout.tsx` — root layout: fonts, `ThemeProvider`, `<Toaster />`, metadata template.
- `globals.css` — Tailwind 4 `@import`, full light/dark token palette (Notion-ish neutrals), and `.prose-note` markdown preview styles (use this class on rendered markdown).
- `api/auth/[...all]/route.ts` — Better Auth catch-all (`GET`/`POST`).
- `(auth)/layout.tsx` — redirects authed users to `/dashboard`; renders header + theme toggle.
- `(auth)/login/page.tsx`, `(auth)/signup/page.tsx` — thin wrappers around `AuthForm`.
- `page.tsx` — ⚠️ STILL the create-next-app boilerplate. Replace with the marketing landing page (SSG).

---

## 3. Critical version notes (read before coding)

1. **Async request APIs (Next 16).** `params`, `searchParams`, `cookies()`, `headers()`, `draftMode()` are all **Promises** — must `await`. Page signature: `async function Page(props: PageProps<'/notes/[id]'>) { const { id } = await props.params }`. Run `npx next typegen` to get `PageProps`/`LayoutProps` route-typed helpers.
2. **Prisma 7.** Client is imported from `@/app/generated/prisma/client` (NOT `@prisma/client` directly — though that package provides runtime). Client REQUIRES a driver adapter in the constructor (we use `PrismaPg`). After any schema change: `npx prisma migrate dev --name <x>` then `npx prisma generate` (postinstall also runs generate).
3. **`middleware.ts` is now `proxy.ts`** (nodejs runtime only, not configurable). Named export is `proxy`, not `middleware`. See §6.
4. **Tailwind 4** — config is CSS-first in `globals.css` via `@theme inline` and `@custom-variant dark`. There is no `tailwind.config.js`. Dark mode is `.dark` class on `<html>` (next-themes `attribute="class"`).
5. **Better Auth tables** are mapped to lowercase (`user`, `session`, `account`, `verification`) in the schema — keep these field shapes if you regenerate.
6. **Zod 4** — schemas import from `zod`. `parseOrThrow` already wraps validation; prefer it.

---

## 4. Database schema (already migrated to Neon)

Models: `User`, `Session`, `Account`, `Verification` (Better Auth), plus app models:
- `Folder` — `id, name, userId, timestamps`; cascade-deletes with user.
- `Tag` — `id, name, color?, userId`; `@@unique([userId, name])`.
- `Note` — `id, title (default "Untitled"), content (default ""), isPublic (default false), shareSlug? @unique, userId, folderId?`. Indexed on `userId`, `folderId`, `shareSlug`. `folderId` is `SetNull` on folder delete.
- `NoteTag` — explicit join table (`@@id([noteId, tagId])`), cascade on both sides.

**Ownership rule (AGENTS.md):** every protected query MUST filter by `userId`. Public note reads MUST require `isPublic === true` and match `shareSlug`.

---

## 5. Architecture decisions already made

- **Build order:** foundation-first (chosen by user).
- **DB:** Neon Postgres, URL already in `.env`; migrations run live.
- **AI:** scaffold with `OPENAI_API_KEY` env var; UI must degrade gracefully when the key is missing (return a `SERVICE_UNAVAILABLE` `ApiError` from the AI route when `!process.env.OPENAI_API_KEY`).
- **Route Handlers vs Server Actions (AGENTS.md):**
  - Server Actions (`"use server"`) for app-internal mutations tied to forms/UI: create/rename/move/delete note, toggle public, create folder, etc. Revalidate (`revalidatePath`) or redirect after.
  - Route Handlers (`app/api/...`) for reusable HTTP endpoints, client fetches, AI requests. Use the `lib/api.ts` helpers + `try/catch` → `handleApiError`.
- **Response contract:** `{ success: true, data, message? }` / `{ success: false, error: { code, message, details? } }` — already in `lib/api.ts`.

---

## 6. Recommended next steps (in order)

The previous agent stopped after the auth slice. The next dependency-ordered work:

### Step A — Route protection (`proxy.ts`) — small, do first
Create `proxy.ts` at repo root. Use Better Auth's session-cookie check for an optimistic redirect of unauthenticated users away from `/dashboard` and `/notes/*` to `/login`. Note: `proxy` runs on nodejs runtime; export a function named `proxy`. Better Auth ships `getSessionCookie` helper for edge-free cookie checks — verify the exact import in `node_modules/better-auth/dist`. Real authz still happens server-side via `requireUser()`; the proxy is just UX.

### Step B — Notes CRUD + dashboard + editor (the core vertical slice)
1. `app/(app)/layout.tsx` — protected app shell: call `getCurrentUser()`, redirect to `/login` if null. Sidebar (folders/tags nav), header with theme toggle + user menu (sign out via `authClient.signOut`).
2. **Server Actions** in `app/(app)/notes/actions.ts` (`"use server"`): `createNote`, `renameNote`, `updateNoteContent`, `moveNote`, `toggleNotePublic`, `deleteNote`, `createFolder`. Each: `requireUser()` → validate with `parseOrThrow` → ownership-scoped Prisma write → `revalidatePath`.
3. **Route Handlers** for client-fetch CRUD (demonstrates GET/POST/PUT/DELETE per AGENTS.md): `app/api/notes/route.ts` (GET list, POST create), `app/api/notes/[id]/route.ts` (GET/PATCH/DELETE). Wrap in `try/catch` → `handleApiError`. The autosave loop (Step D) should PATCH here.
4. `app/(app)/dashboard/page.tsx` — SSR list of the user's notes.
5. `app/(app)/notes/[id]/page.tsx` — SSR editor route; `await params`, fetch note scoped to user, 404 if not owned.

### Step C — Folders & tags
Server actions + sidebar UI; tag assignment via `NoteTag`. Reuse `folderSchema`/`tagSchema`.

### Step D — Markdown editor + live preview + autosave
- Editor: textarea (left) + live preview (right) using `react-markdown` + `remark-gfm` + `rehype-sanitize` (sanitize is required by AGENTS.md). Render into a `.prose-note` container.
- Autosave: debounced (~800ms–1.5s) PATCH to the notes route handler; show save status ("Saving…/Saved/Save failed"). Handle failure UI.

### Step E — Public share links
`app/share/[slug]/page.tsx` — public **dynamic SSR**; fetch by `shareSlug` AND `isPublic === true`, else `notFound()`. No auth. Sanitized markdown render. Toggle handled by `toggleNotePublic` action (generate `shareSlug` via `generateShareSlug()` when enabling).

### Step F — AI command palette + endpoint
- `app/api/ai/route.ts` — POST, `requireUser()`, `parseOrThrow(aiRequestSchema)`, then OpenAI call. If `!process.env.OPENAI_API_KEY` → `fail("SERVICE_UNAVAILABLE", ...)`. Build prompts per `AI_ACTIONS` (summarize, rewrite, continue, fix-grammar, change-tone, extract-tasks, generate-title, create-outline, simplify, translate, flashcards, clean-markdown). Never call OpenAI from the client.
- Command palette UI (cmdk-style or dropdown) that POSTs and inserts/replaces editor content.

### Step G — Public pages (SSG + ISR)
- `app/page.tsx` (replace boilerplate), `app/about/page.tsx` — **SSG** marketing pages.
- `app/templates/page.tsx` — **ISR** (`export const revalidate = <seconds>`) templates/gallery.

### Final — Verification
`pnpm lint` && `pnpm build`. Then manual checks per AGENTS.md "Testing And Verification" (auth both methods, CRUD, autosave + failure UI, public vs private share access, API success/error shapes, AI graceful degradation with blank key).

---

## 7. Gotchas the next agent should not relearn
- `pnpm approve-builds` is interactive and won't work headless; Prisma engine postinstall may print a download failure — harmless, `prisma generate`/`migrate` still work (proven: migration applied successfully).
- The Prisma-LSP in the IDE flags `@updatedAt` as "reserved character" — **false positive**; `npx prisma validate` is the source of truth and passes.
- `app/generated/prisma` is gitignored and regenerated on install — never edit it.
- Lucide-react is v1.x here — icon imports are the same names but confirm if one is missing.
- `pnpm build` not yet run end-to-end; the first real build may surface server/client boundary issues — `auth-form`, `theme-*`, and all `ui/*` interactive primitives are correctly `"use client"`.
