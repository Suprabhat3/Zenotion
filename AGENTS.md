<!-- BEGIN:nextjs-agent-rules -->
# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` before writing any code. Heed deprecation notices.
<!-- END:nextjs-agent-rules -->

# Project Context: Notion-Style AI Notes App

This repo is a hackathon/class project name Zenotion for building a small but complete production-shaped Next.js app. Future agents should prioritize correctness, clear routing, readable code, meaningful error handling, and explicit coverage of the class concepts over building an oversized feature set.

## Chosen Stack

- Next.js 16 with the App Router, React 19, TypeScript, and Tailwind CSS 4.
- Postgres as the database.
- Prisma for schema, migrations, and typed database access.
- Better Auth for authentication, including email/password and Google OAuth.
- OpenAI SDK for AI-powered note assistance.
- Markdown rendering should support GitHub Flavored Markdown with safe/sanitized preview.

## Product Scope

Build an authenticated Notion-style notes app where users can write, edit, organize, and save markdown notes.

Core product expectations:

- Authenticated user workspace.
- Folder and tag organization.
- Markdown editor with live preview.
- Autosave with clear save status.
- Public share links for selected notes.
- AI command palette for note actions such as summarize, rewrite, continue writing, fix grammar, change tone, extract tasks, generate title, create outline, simplify, translate, generate flashcards, and clean messy notes into markdown.
- No realtime collaboration for v1.
- Use a markdown editor rather than a full block editor for hackathon reliability.

## Required Next.js Concepts

The implementation must clearly demonstrate:

- Next.js project setup.
- File-based routing.
- Layouts in Next.js.
- Multiple pages/routes.
- Server Side Rendering where needed.
- Static Site Generation where needed.
- Incremental Static Regeneration where needed.
- Route Handlers as App Router API routes.
- GET, POST, PUT/PATCH, and DELETE operations.
- Database connection.
- Structured API responses.
- Proper error handling.
- Server Actions with the `"use server"` directive.
- A clear, documented difference between Route Handlers and Server Actions.

Recommended rendering examples:

- SSR: protected app dashboard and note editor routes that fetch user-specific database data.
- SSG: public landing/about/blog-style pages.
- ISR: public templates/gallery page with a `revalidate` interval.
- Public dynamic SSR: shared note route that checks `isPublic` and `shareSlug`.

## Route Handlers vs Server Actions

Use Route Handlers under `app/api` for reusable HTTP endpoints, client fetches, external-style CRUD, auth handlers, and AI requests.

Use Server Actions for app-internal mutations tied directly to forms or UI controls, such as creating a note, renaming a note, moving a note, toggling public sharing, deleting a note, or creating a folder. Server Actions should use `"use server"` and revalidate or redirect as appropriate.

Avoid routing simple internal form mutations through API fetches when a Server Action is the clearer demonstration of the class requirement.

## API And Error Handling

Use structured JSON responses for API routes:

```ts
{ success: true, data, message? }
{ success: false, error: { code, message, details? } }
```

Validate request bodies and route params before database writes. Prefer centralized helpers for response formatting, auth/session checks, validators, and database access.

Expected error behavior:

- `400` for validation errors.
- `401` for unauthenticated requests.
- `403` for authenticated users accessing resources they do not own.
- `404` for missing resources.
- `500` for unexpected server errors.

## Security And Data Rules

- Keep `DATABASE_URL`, `BETTER_AUTH_SECRET`, Google OAuth secrets, and `OPENAI_API_KEY` server-only.
- Every protected note, folder, and tag query must enforce authenticated user ownership.
- Public note pages must only return notes where public sharing is enabled.
- Sanitize markdown preview output.
- Do not expose OpenAI requests directly from the client; route AI calls through a server endpoint.
- Keep AI actions bounded to note assistance for v1 rather than building a long-running autonomous agent.

## Testing And Verification

Before handing off implementation work, run the available checks:

- `pnpm lint`
- `pnpm build`

Manual verification should cover:

- Email/password auth and Google login.
- Creating, reading, updating, and deleting notes.
- Creating and managing folders/tags.
- Autosave behavior and failed-save UI.
- Public share links for public notes and blocked access for private notes.
- API route responses for success and error cases.
- Server Actions working through forms/buttons.
- AI command palette returning useful markdown and handling missing API keys or provider failures gracefully.



### some importent role to follow by agents
- don't directly change package.json file, If you want to add some new package, you can install by pnpm add package name.
- If you have any kind of ambiguity or confusion, so please ask the clarification questions before implementation.
- Always write the types for everything. Do not use "any" just for removing the typescript errors. We need to make the things production ready.