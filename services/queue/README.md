Job queue service (Phase 2)

Purpose

Provide a worker-backed job queue for heavy or long-running tasks (AI generation, exports, analytics).

Implementation notes
- Phase 2: implement with BullMQ (Redis) or a serverless queuing system.
- Provide a light client wrapper here so features/ai can enqueue tasks instead of running them synchronously.

Co-authored-by: Copilot App <223556219+Copilot@users.noreply.github.com>