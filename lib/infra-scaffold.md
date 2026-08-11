Infrastructure scaffold notes

Purpose

This file briefly documents where infrastructure-related services and provider adapters should live. It is a roadmap for Phase 1 and Phase 2.

services/
- db.ts            -> database connection helpers (Prisma / Kysely wrappers)
- uploads.ts       -> upload helpers and storage abstractions
- analytics.ts     -> usage and telemetry helpers
- queue.ts         -> job-queue client (BullMQ / RSMQ / serverless queue)

providers/
- ai/              -> provider adapter for LLMs (openai, azure, anthropic)
- storage/         -> provider adapter for image/file stores (imagekit, s3)

lib/
- Keep small, generic utilities here. Migrate domain-specific helpers into features/ or services/.

Next steps
- Create services/ and providers/ folders and add lightweight README files.
- Implement a provider adapter interface (types) and a default OpenAI adapter wrapper.

Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>