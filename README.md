# Zenotion

Zenotion is a Notion-style AI notes application built for focus on correct Next.js implementation rather than unnecessary feature size.

It demonstrates core App Router concepts: file-based routing, nested layouts, rendering strategies (SSR, ISR, and static-capable routes), route handlers with structured API responses, Prisma + Postgres integration, and Server Actions with `"use server"`.

## Live Demo

- App URL: `ADD_DEPLOYED_URL_HERE`
- Demo account (optional): `ADD_DEMO_ACCOUNT_DETAILS_HERE`

## Class Requirement Coverage

This project is intentionally structured to satisfy the assignment checklist.

### 1) Next.js project setup

- Framework: Next.js 16 (App Router) + React 19 + TypeScript
- Styling: Tailwind CSS 4 + reusable UI components
- Entry scripts: `dev`, `build`, `start`, `lint` in `package.json`

### 2) File-based routing and multiple pages/routes

App routes are implemented under the `app/` directory using App Router conventions.

- Public pages: `/`, `/about`, `/templates`, `/share/[slug]`
- Auth pages: `/login`, `/signup`
- Protected app pages: `/dashboard`, `/notes/[id]`
- API endpoints: `/api/auth/[...all]`, `/api/notes`, `/api/notes/[id]`, `/api/ai`

### 3) Layouts in Next.js

- Root layout: `app/layout.tsx` (theme provider, global metadata, toaster)
- Auth layout: `app/(auth)/layout.tsx` (auth shell + redirect if already signed in)
- App layout: `app/(app)/layout.tsx` (protected shell + sidebar + user menu)

### 4) Rendering strategy

- **SSR where needed**
  - Authenticated dashboard and note editor fetch user-scoped data on server:
    - `app/(app)/dashboard/page.tsx`
    - `app/(app)/notes/[id]/page.tsx`
  - Public shared notes use dynamic server lookup by slug:
    - `app/share/[slug]/page.tsx`
- **ISR where needed**
  - Templates gallery revalidates hourly with:
    - `app/templates/page.tsx` (`export const revalidate = 3600`)
- **Static-capable pages**
  - Marketing/auth pages can be statically rendered when no per-request dynamic data is needed in deployment strategy.

### 5) API Routes (Route Handlers)

Implemented in `app/api/**/route.ts`:

- `app/api/notes/route.ts`
  - `GET` list current user notes
  - `POST` create note
- `app/api/notes/[id]/route.ts`
  - `GET` fetch one owned note
  - `PATCH` update note fields/tags
  - `DELETE` delete note
- `app/api/ai/route.ts`
  - `POST` run AI command action
- `app/api/auth/[...all]/route.ts`
  - Better Auth handler integration (`GET`, `POST`)

### 6) GET, POST, PUT/PATCH, DELETE operations

CRUD operations are explicitly covered:

- `GET`: list/read notes
- `POST`: create notes, AI request
- `PATCH`: update note content/title/folder/tags
- `DELETE`: remove note

### 7) Database connection

- ORM: Prisma
- Database: Postgres
- Connection and Prisma client: `lib/db.ts`
- Schema and models: `prisma/schema.prisma`
  - `User`, `Session`, `Account`, `Verification`
  - `Note`, `Folder`, `Tag`, `NoteTag`

### 8) Structured API responses

Standardized response helpers are in `lib/api.ts`:

- Success shape:
  - `{ success: true, data, message? }`
- Error shape:
  - `{ success: false, error: { code, message, details? } }`

All route handlers use `ok(...)`, `fail(...)`, and `handleApiError(...)` for consistent response format.

### 9) Proper error handling

- Centralized `ApiError` and status mapping in `lib/api.ts`
- Validation and typed parsing via Zod schemas in `lib/validators.ts`
- Ownership and auth checks before mutations (`requireUser`, ownership guards)
- Expected status patterns:
  - `400` validation errors
  - `401` unauthenticated
  - `403` forbidden (when applicable)
  - `404` missing resource
  - `500` unexpected errors
  - `503` AI provider unavailable

### 10) Server Actions and `"use server"` directive

Server Actions are implemented in:

- `app/(app)/notes/actions.ts` (`"use server"` at file top)

Actions include:

- Note actions: create, rename, update content, move, toggle public, delete
- Folder actions: create, rename, delete
- Tag actions: create, delete, assign to note

These actions are used for app-internal mutations tied to UI forms and controls.

### 11) Clear difference between API Routes and Server Actions

- **Route Handlers (`app/api`)** are used for HTTP-style endpoints, external-style CRUD access, auth endpoints, and AI calls.
- **Server Actions (`"use server"`)** are used for direct, internal UI mutations from forms/components without extra client fetch boilerplate.

This separation is intentional to demonstrate both patterns correctly.

## Feature Overview

- Authentication (email/password + optional Google OAuth via Better Auth)
- Markdown note editing with live preview
- Folder and tag organization
- Public note sharing with slug-based route
- AI command palette for note assistance
- Light/dark theming

## Tech Stack

- Next.js 16 (App Router)
- React 19 + TypeScript
- Tailwind CSS 4
- Prisma 7 + Postgres
- Better Auth
- OpenAI SDK (multi-provider support through provider adapters)
- Zod for validation

## Project Structure

```text
app/
  (auth)/
    layout.tsx
    login/page.tsx
    signup/page.tsx
  (app)/
    layout.tsx
    dashboard/page.tsx
    notes/
      [id]/page.tsx
      actions.ts
  about/page.tsx
  templates/page.tsx
  share/[slug]/page.tsx
  api/
    auth/[...all]/route.ts
    notes/route.ts
    notes/[id]/route.ts
    ai/route.ts
lib/
  api.ts
  auth.ts
  db.ts
  notes.ts
  session.ts
  validators.ts
prisma/
  schema.prisma
```

## Local Setup

### 1) Install dependencies

```bash
pnpm install
```

### 2) Configure environment variables

Create `.env` and add the required values:

```bash
DATABASE_URL=
BETTER_AUTH_SECRET=
BETTER_AUTH_URL=http://localhost:3000

# Optional Google OAuth
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
```

Notes:

- Keep all secrets server-only.
- AI provider keys are entered by the user in the app UI and are not stored on the server in this project flow.

### 3) Apply database migration and generate client

```bash
pnpm db:migrate
```

### 4) Run development server

```bash
pnpm dev
```

Open `http://localhost:3000`.

## Verification Checklist

Run before submission:

```bash
pnpm lint
pnpm build
```

Manual checks:

- Sign up and log in (email/password; Google OAuth if configured)
- Create/read/update/delete notes
- Create/manage folders and tags
- Verify note autosave and update behavior
- Toggle public share and open `/share/[slug]`
- Test API endpoints for both success and error responses
- Trigger AI command palette actions and verify failure handling with invalid keys


## Submission Note

This project intentionally prioritizes clean routing, clear rendering choices, robust API/error design, correct database integration, and practical Server Action usage to match the assignment goals for a small but complete Next.js application.
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
