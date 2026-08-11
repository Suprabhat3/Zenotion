Zenotion — Architecture Overview

Goal

Evolve Zenotion into a modular, scalable AI Workspace Platform while preserving existing functionality. Enable incremental improvements that are production-ready and maintainable.

High-level architecture

- Frontend: Next.js 16 (App Router), React 19, Tailwind CSS
- Server: Next.js Node server (SSR/Route Handlers/Server Actions)
- DB: PostgreSQL + Prisma
- AI: OpenAI-compatible providers behind an adapter layer
- Cache/Queue: Redis + Job Queue (Phase 2)

Proposed folder map

- app/ (existing) — Next.js route handlers and pages
- components/ (existing) — UI components, to be gradually migrated to primitives
- features/ — domain modules (notes, ai, auth, sharing, templates, tasks)
- services/ — infrastructure services (db, uploads, analytics, job-queue)
- providers/ — external provider adapters (openai, azure, google, imagekit)
- lib/ (existing) — small helpers and utilities; migrate common code to services/
- types/ (or lib/types.ts) — central TypeScript types and response shapes
- constants/ — application constants and tokens
- hooks/ — reusable React hooks
- styles/ — global tokens and Tailwind config extensions
- config/ — runtime config and environment validation

Design principles

- Small, testable modules
- Explicit ownership and permissions checks
- Backwards-compatible API surface during migration
- Fail-fast env validation
- Provider abstraction for AI/storage

Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>